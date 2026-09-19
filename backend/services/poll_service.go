package services

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/livepoll/backend/models"
	"github.com/livepoll/backend/redis"
	"github.com/livepoll/backend/repository"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type PollService struct {
	pollRepo *repository.PollRepository
	voteRepo *repository.VoteRepository
	redis    *redis.RedisClient
}

func NewPollService(pollRepo *repository.PollRepository, voteRepo *repository.VoteRepository, redisClient *redis.RedisClient) *PollService {
	return &PollService{
		pollRepo: pollRepo,
		voteRepo: voteRepo,
		redis:    redisClient,
	}
}

func generateShareID() string {
	b := make([]byte, 4)
	_, _ = rand.Read(b)
	return hex.EncodeToString(b)
}

func (s *PollService) CreatePoll(ctx context.Context, ownerIDStr string, req models.CreatePollRequest) (*models.Poll, error) {
	ownerObjID, err := primitive.ObjectIDFromHex(ownerIDStr)
	if err != nil {
		return nil, errors.New("invalid owner ID")
	}

	trimmedQuestion := strings.TrimSpace(req.Question)
	if len(trimmedQuestion) < 5 {
		return nil, errors.New("poll question must be at least 5 characters")
	}

	if len(req.Options) < 2 || len(req.Options) > 6 {
		return nil, errors.New("polls must have between 2 and 6 options")
	}

	seen := make(map[string]bool)
	var pollOptions []models.PollOption
	for i, opt := range req.Options {
		trimmedOpt := strings.TrimSpace(opt)
		if trimmedOpt == "" {
			return nil, fmt.Errorf("option %d cannot be empty", i+1)
		}
		if seen[strings.ToLower(trimmedOpt)] {
			return nil, fmt.Errorf("duplicate option: '%s'", trimmedOpt)
		}
		seen[strings.ToLower(trimmedOpt)] = true

		pollOptions = append(pollOptions, models.PollOption{
			ID:        fmt.Sprintf("opt_%s", uuid.New().String()[:8]),
			Text:      trimmedOpt,
			VoteCount: 0,
		})
	}

	var endDate *time.Time
	if req.EndDate != "" {
		t, err := time.Parse(time.RFC3339, req.EndDate)
		if err == nil {
			endDate = &t
		}
	}

	poll := &models.Poll{
		OwnerID:  ownerObjID,
		Question: trimmedQuestion,
		Options:  pollOptions,
		Settings: models.PollSettings{
			AllowMultipleVotes: req.AllowMultipleVotes,
			EndDate:            endDate,
		},
		Status:    "active",
		ShareID:   generateShareID(),
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
		ExpiresAt: endDate,
	}

	if err := s.pollRepo.Create(ctx, poll); err != nil {
		return nil, err
	}

	// Initialize Redis Hash for this poll's live counters
	if s.redis != nil {
		initCounts := make(map[string]interface{})
		for _, opt := range poll.Options {
			initCounts[opt.ID] = 0
		}
		_ = s.redis.SetVoteCounts(ctx, poll.ID.Hex(), initCounts)
	}

	return poll, nil
}

func (s *PollService) GetUserPolls(ctx context.Context, ownerIDStr string) ([]models.Poll, error) {
	ownerObjID, err := primitive.ObjectIDFromHex(ownerIDStr)
	if err != nil {
		return nil, errors.New("invalid owner ID")
	}
	return s.pollRepo.FindByOwnerID(ctx, ownerObjID)
}

func (s *PollService) GetPollByID(ctx context.Context, pollIDStr string) (*models.Poll, error) {
	pollObjID, err := primitive.ObjectIDFromHex(pollIDStr)
	if err != nil {
		return nil, errors.New("invalid poll ID")
	}
	return s.pollRepo.FindByID(ctx, pollObjID)
}

func (s *PollService) GetPollByShareID(ctx context.Context, shareID string) (*models.Poll, error) {
	return s.pollRepo.FindByShareID(ctx, shareID)
}

func (s *PollService) ClosePoll(ctx context.Context, pollIDStr, ownerIDStr string) error {
	poll, err := s.GetPollByID(ctx, pollIDStr)
	if err != nil {
		return err
	}
	if poll.OwnerID.Hex() != ownerIDStr {
		return errors.New("unauthorized: you do not own this poll")
	}

	return s.pollRepo.UpdateStatus(ctx, poll.ID, "closed")
}

func (s *PollService) ReopenPoll(ctx context.Context, pollIDStr, ownerIDStr string) error {
	poll, err := s.GetPollByID(ctx, pollIDStr)
	if err != nil {
		return err
	}
	if poll.OwnerID.Hex() != ownerIDStr {
		return errors.New("unauthorized: you do not own this poll")
	}

	return s.pollRepo.UpdateStatus(ctx, poll.ID, "active")
}

func (s *PollService) DeletePoll(ctx context.Context, pollIDStr, ownerIDStr string) error {
	poll, err := s.GetPollByID(ctx, pollIDStr)
	if err != nil {
		return err
	}
	if poll.OwnerID.Hex() != ownerIDStr {
		return errors.New("unauthorized: you do not own this poll")
	}

	_ = s.voteRepo.DeleteByPollID(ctx, poll.ID)
	return s.pollRepo.Delete(ctx, poll.ID)
}

func (s *PollService) GetPollResults(ctx context.Context, pollIDStr string) (*models.PollResultsResponse, error) {
	poll, err := s.GetPollByID(ctx, pollIDStr)
	if err != nil {
		return nil, err
	}

	// Attempt fast live counts from Redis Hash first
	var liveCounts map[string]int64
	if s.redis != nil {
		liveCounts, _ = s.redis.GetVoteCounts(ctx, pollIDStr)
	}

	var totalVotes int64 = 0
	for _, opt := range poll.Options {
		count := opt.VoteCount
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
		if liveCounts != nil {
			if rc, exists := liveCounts[opt.ID]; exists && rc > count {
				count = rc
			}
		}
		var percentage float64 = 0
		if totalVotes > 0 {
			percentage = (float64(count) / float64(totalVotes)) * 100
		}
		results = append(results, models.OptionResult{
			OptionID:   opt.ID,
			Text:       opt.Text,
			Votes:      count,
			Percentage: percentage,
		})
	}

	return &models.PollResultsResponse{
		PollID:     poll.ID.Hex(),
		Question:   poll.Question,
		Status:     poll.Status,
		TotalVotes: totalVotes,
		Results:    results,
		UpdatedAt:  poll.UpdatedAt,
	}, nil
}
