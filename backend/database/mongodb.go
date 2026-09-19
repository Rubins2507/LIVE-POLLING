package database

import (
	"context"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type MongoDB struct {
	Client   *mongo.Client
	Database *mongo.Database
	Users    *mongo.Collection
	Polls    *mongo.Collection
	Votes    *mongo.Collection
}

func ConnectMongoDB(uri string) (*MongoDB, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	clientOptions := options.Client().ApplyURI(uri)
	client, err := mongo.Connect(ctx, clientOptions)
	if err != nil {
		return nil, err
	}

	if err := client.Ping(ctx, nil); err != nil {
		return nil, err
	}

	log.Println("Successfully connected to MongoDB")

	db := client.Database("livepoll")
	usersColl := db.Collection("users")
	pollsColl := db.Collection("polls")
	votesColl := db.Collection("votes")

	// Ensure Indexes
	initIndexes(ctx, usersColl, pollsColl, votesColl)

	return &MongoDB{
		Client:   client,
		Database: db,
		Users:    usersColl,
		Polls:    pollsColl,
		Votes:    votesColl,
	}, nil
}

func initIndexes(ctx context.Context, users, polls, votes *mongo.Collection) {
	// Unique index on email
	_, err := users.Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys:    bson.D{{Key: "email", Value: 1}},
		Options: options.Index().SetUnique(true),
	})
	if err != nil {
		log.Printf("Warning creating user index: %v", err)
	}

	// Unique index on shareId
	_, err = polls.Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys:    bson.D{{Key: "shareId", Value: 1}},
		Options: options.Index().SetUnique(true),
	})
	if err != nil {
		log.Printf("Warning creating poll shareId index: %v", err)
	}

	// Index on ownerId
	_, err = polls.Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys: bson.D{{Key: "ownerId", Value: 1}},
	})
	if err != nil {
		log.Printf("Warning creating poll ownerId index: %v", err)
	}

	// Index on pollId for votes
	_, err = votes.Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys: bson.D{
			{Key: "pollId", Value: 1},
			{Key: "voterIdentifier", Value: 1},
		},
	})
	if err != nil {
		log.Printf("Warning creating votes compound index: %v", err)
	}
}

func (m *MongoDB) Close(ctx context.Context) error {
	return m.Client.Disconnect(ctx)
}
