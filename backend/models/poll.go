package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type PollOption struct {
	ID        string `bson:"id" json:"id"`
	Text      string `bson:"text" json:"text"`
	VoteCount int64  `bson:"voteCount" json:"voteCount"`
}

type PollSettings struct {
	AllowMultipleVotes bool       `bson:"allowMultipleVotes" json:"allowMultipleVotes"`
	EndDate            *time.Time `bson:"endDate,omitempty" json:"endDate,omitempty"`
}

type Poll struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	OwnerID   primitive.ObjectID `bson:"ownerId" json:"ownerId"`
	Question  string             `bson:"question" json:"question"`
	Options   []PollOption       `bson:"options" json:"options"`
	Settings  PollSettings       `bson:"settings" json:"settings"`
	Status    string             `bson:"status" json:"status"` // "active" or "closed"
	ShareID   string             `bson:"shareId" json:"shareId"`
	CreatedAt time.Time          `bson:"createdAt" json:"createdAt"`
	UpdatedAt time.Time          `bson:"updatedAt" json:"updatedAt"`
	ExpiresAt *time.Time         `bson:"expiresAt,omitempty" json:"expiresAt,omitempty"`
}

type CreatePollRequest struct {
	Question           string   `json:"question" binding:"required,min=5,max=300"`
	Options            []string `json:"options" binding:"required,min=2,max=6"`
	AllowMultipleVotes bool     `json:"allowMultipleVotes"`
	EndDate            string   `json:"endDate,omitempty"`
}

type UpdatePollRequest struct {
	Question string `json:"question" binding:"required,min=5,max=300"`
}

type OptionResult struct {
	OptionID   string  `json:"optionId"`
	Text       string  `json:"text"`
	Votes      int64   `json:"votes"`
	Percentage float64 `json:"percentage"`
}

type PollResultsResponse struct {
	PollID     string         `json:"pollId"`
	Question   string         `json:"question"`
	Status     string         `json:"status"`
	TotalVotes int64          `json:"totalVotes"`
	Results    []OptionResult `json:"results"`
	UpdatedAt  time.Time      `json:"updatedAt"`
}
