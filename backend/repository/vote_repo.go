package repository

import (
	"context"
	"time"

	"github.com/livepoll/backend/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type VoteRepository struct {
	coll *mongo.Collection
}

func NewVoteRepository(coll *mongo.Collection) *VoteRepository {
	return &VoteRepository{coll: coll}
}

func (r *VoteRepository) Create(ctx context.Context, vote *models.Vote) error {
	vote.ID = primitive.NewObjectID()
	vote.CreatedAt = time.Now()
	_, err := r.coll.InsertOne(ctx, vote)
	return err
}

func (r *VoteRepository) HasVoted(ctx context.Context, pollID primitive.ObjectID, voterIdentifier string) (bool, error) {
	count, err := r.coll.CountDocuments(ctx, bson.M{
		"pollId":          pollID,
		"voterIdentifier": voterIdentifier,
	})
	if err != nil {
		return false, err
	}
	return count > 0, nil
}

func (r *VoteRepository) CountByPollID(ctx context.Context, pollID primitive.ObjectID) (int64, error) {
	return r.coll.CountDocuments(ctx, bson.M{"pollId": pollID})
}

func (r *VoteRepository) DeleteByPollID(ctx context.Context, pollID primitive.ObjectID) error {
	_, err := r.coll.DeleteMany(ctx, bson.M{"pollId": pollID})
	return err
}
