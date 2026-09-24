package repository

import (
	"context"
	"time"

	"github.com/livepoll/backend/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type PollRepository struct {
	coll *mongo.Collection
}

func NewPollRepository(coll *mongo.Collection) *PollRepository {
	return &PollRepository{coll: coll}
}

func (r *PollRepository) Create(ctx context.Context, poll *models.Poll) error {
	poll.ID = primitive.NewObjectID()
	poll.CreatedAt = time.Now()
	poll.UpdatedAt = time.Now()
	poll.Status = "active"

	_, err := r.coll.InsertOne(ctx, poll)
	return err
}

func (r *PollRepository) FindByID(ctx context.Context, id primitive.ObjectID) (*models.Poll, error) {
	var poll models.Poll
	err := r.coll.FindOne(ctx, bson.M{"_id": id}).Decode(&poll)
	if err != nil {
		return nil, err
	}
	return &poll, nil
}

func (r *PollRepository) FindByShareID(ctx context.Context, shareID string) (*models.Poll, error) {
	var poll models.Poll
	err := r.coll.FindOne(ctx, bson.M{"shareId": shareID}).Decode(&poll)
	if err != nil {
		return nil, err
	}
	return &poll, nil
}

func (r *PollRepository) FindByOwnerID(ctx context.Context, ownerID primitive.ObjectID) ([]models.Poll, error) {
	opts := options.Find().SetSort(bson.D{{Key: "createdAt", Value: -1}})
	cursor, err := r.coll.Find(ctx, bson.M{"ownerId": ownerID}, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var polls []models.Poll
	if err := cursor.All(ctx, &polls); err != nil {
		return nil, err
	}
	return polls, nil
}

func (r *PollRepository) UpdateStatus(ctx context.Context, id primitive.ObjectID, status string) error {
	_, err := r.coll.UpdateOne(ctx, bson.M{"_id": id}, bson.M{
		"$set": bson.M{
			"status":    status,
			"updatedAt": time.Now(),
		},
	})
	return err
}

func (r *PollRepository) UpdateQuestion(ctx context.Context, id primitive.ObjectID, question string) error {
	_, err := r.coll.UpdateOne(ctx, bson.M{"_id": id}, bson.M{
		"$set": bson.M{
			"question":  question,
			"updatedAt": time.Now(),
		},
	})
	return err
}

func (r *PollRepository) Delete(ctx context.Context, id primitive.ObjectID) error {
	_, err := r.coll.DeleteOne(ctx, bson.M{"_id": id})
	return err
}

func (r *PollRepository) IncrementOptionVote(ctx context.Context, pollID primitive.ObjectID, optionID string) error {
	_, err := r.coll.UpdateOne(
		ctx,
		bson.M{"_id": pollID, "options.id": optionID},
		bson.M{
			"$inc": bson.M{"options.$.voteCount": 1},
			"$set": bson.M{"updatedAt": time.Now()},
		},
	)
	return err
}
