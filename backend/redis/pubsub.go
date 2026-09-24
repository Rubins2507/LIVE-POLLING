package redis

import (
	"context"
	"encoding/json"
	"fmt"

	goredis "github.com/redis/go-redis/v9"
)

type PollUpdateMessage struct {
	PollID     string      `json:"pollId"`
	Results    interface{} `json:"results"`
	TotalVotes int64       `json:"totalVotes"`
	Timestamp  int64       `json:"timestamp,omitempty"`
}

func (r *RedisClient) PublishPollUpdate(ctx context.Context, pollID string, payload interface{}) error {
	channel := fmt.Sprintf("poll:%s:updates", pollID)
	data, err := json.Marshal(payload)
	if err != nil {
		return err
	}
	return r.Client.Publish(ctx, channel, data).Err()
}

func (r *RedisClient) SubscribePollUpdates(ctx context.Context, pollID string) *goredis.PubSub {
	channel := fmt.Sprintf("poll:%s:updates", pollID)
	return r.Client.Subscribe(ctx, channel)
}
