package services

import (
	"context"
	"errors"
	"time"

	"github.com/livepoll/backend/models"
	"github.com/livepoll/backend/redis"
	"github.com/livepoll/backend/repository"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type VoteService struct {
	pollRepo *repository.PollRepository
	voteRepo *repository.VoteRepository
	redis    *redis.RedisClient
}

func NewVoteService(pollRepo *repository.PollRepository, voteRepo *repository.VoteRepository, redisClient *redis.RedisClient) *VoteService {
	return &VoteService{
		pollRepo: pollRepo,
		voteRepo: voteRepo,
		redis:    redisClient,
	}
}

func (s *VoteService) CastVote(ctx context.Context, pollIDStr string, req models.VoteRequest) (*models.PollResultsResponse, error) {
	pollObjID, err := primitive.ObjectIDFromHex(pollIDStr)
	if err != nil {
		return nil, errors.New("invalid poll ID")
	}

	poll, err := s.pollRepo.FindByID(ctx, pollObjID)
	if err != nil || poll == nil {
		return nil, errors.New("poll not found")
	}

	if poll.Status == "closed" {
		return nil, errors.New("voting is closed for this poll")
	}

	if poll.ExpiresAt != nil && time.Now().After(*poll.ExpiresAt) {
		return nil, errors.New("this poll has expired")
	}

	// Validate option exists
	var chosenOptionText string
	found := false
	for _, opt := range poll.Options {
		if opt.ID == req.OptionID {
			found = true
			chosenOptionText = opt.Text
			break
		}
	}
	if !found {
		return nil, errors.New("invalid option selected")
	}

	// Duplicate vote protection if not allowMultipleVotes
	claimedVoter := false
	if !poll.Settings.AllowMultipleVotes {
		if s.redis != nil {
			claimedVoter, err = s.redis.ClaimVoter(ctx, pollIDStr, req.VoterIdentifier)
			if err != nil {
				return nil, err
			}
			if !claimedVoter {
				return nil, errors.New("you have already voted on this poll")
			}
		}
		hasVoted, err := s.voteRepo.HasVoted(ctx, poll.ID, req.VoterIdentifier)
		if err != nil {
			if claimedVoter {
				_ = s.redis.ReleaseVoter(ctx, pollIDStr, req.VoterIdentifier)
			}
			return nil, err
		}
		if hasVoted {
			return nil, errors.New("you have already voted on this poll")
		}
	}

	// 1. Persist vote to MongoDB
	vote := &models.Vote{
		PollID:          poll.ID,
		OptionID:        req.OptionID,
		VoterIdentifier: req.VoterIdentifier,
	}
	if err := s.voteRepo.Create(ctx, vote); err != nil {
		if claimedVoter {
			_ = s.redis.ReleaseVoter(ctx, pollIDStr, req.VoterIdentifier)
		}
		return nil, err
	}

	// 2. Increment MongoDB count
	if err := s.pollRepo.IncrementOptionVote(ctx, poll.ID, req.OptionID); err != nil {
		return nil, err
	}

	// 3. Fast Redis HINCRBY
	var liveCounts map[string]int64
	if s.redis != nil {
		if _, err := s.redis.IncrementVote(ctx, pollIDStr, req.OptionID); err != nil {
			return nil, err
		}
		liveCounts, err = s.redis.GetVoteCounts(ctx, pollIDStr)
		if err != nil {
			return nil, err
		}
	}

	// 4. Calculate updated results
	var totalVotes int64 = 0
	for _, opt := range poll.Options {
		count := opt.VoteCount
		if opt.ID == req.OptionID {
			count++
		}
		if liveCounts != nil {
			if rc, exists := liveCounts[opt.ID]; exists && rc > count {
				count = rc
			}
		}
		totalVotes += count
	}

	var results []models.OptionResult
	for _, opt := range poll.Options {
		count := opt.VoteCount
		if opt.ID == req.OptionID {
			count++
		}
		if liveCounts != nil {
			if rc, exists := liveCounts[opt.ID]; exists && rc > count {
				count = rc
			}
		}
		var pct float64 = 0
		if totalVotes > 0 {
			pct = (float64(count) / float64(totalVotes)) * 100
		}
		results = append(results, models.OptionResult{
			OptionID:   opt.ID,
			Text:       opt.Text,
			Votes:      count,
			Percentage: pct,
		})
	}

	res := &models.PollResultsResponse{
		PollID:     poll.ID.Hex(),
		Question:   poll.Question,
		Status:     poll.Status,
		TotalVotes: totalVotes,
		Results:    results,
		UpdatedAt:  time.Now(),
	}

	// 5. Redis Pub/Sub Broadcast
	if s.redis != nil {
		updatePayload := map[string]interface{}{
			"type":       "POLL_UPDATE",
			"pollId":     res.PollID,
			"results":    res.Results,
			"totalVotes": res.TotalVotes,
			"lastVote": map[string]interface{}{
				"optionId":   req.OptionID,
				"optionText": chosenOptionText,
				"timestamp":  time.Now().UnixMilli(),
			},
		}
		_ = s.redis.PublishPollUpdate(ctx, pollIDStr, updatePayload)
	}

	return res, nil
}
