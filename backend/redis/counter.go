package redis

import (
	"context"
	"fmt"
	"strconv"
)

func (r *RedisClient) IncrementVote(ctx context.Context, pollID string, optionID string) (int64, error) {
	key := fmt.Sprintf("poll:%s:votes", pollID)
	return r.Client.HIncrBy(ctx, key, optionID, 1).Result()
}

func (r *RedisClient) GetVoteCounts(ctx context.Context, pollID string) (map[string]int64, error) {
	key := fmt.Sprintf("poll:%s:votes", pollID)
	vals, err := r.Client.HGetAll(ctx, key).Result()
	if err != nil {
		return nil, err
	}

	counts := make(map[string]int64)
	for optID, valStr := range vals {
		cnt, _ := strconv.ParseInt(valStr, 10, 64)
		counts[optID] = cnt
	}

	return counts, nil
}

func (r *RedisClient) SetVoteCounts(ctx context.Context, pollID string, counts map[string]interface{}) error {
	key := fmt.Sprintf("poll:%s:votes", pollID)
	if len(counts) == 0 {
		return nil
	}
	return r.Client.HSet(ctx, key, counts).Err()
}
