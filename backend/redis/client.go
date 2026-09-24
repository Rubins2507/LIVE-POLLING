package redis

import (
	"context"
	"log"
	"strings"
	"time"

	"github.com/redis/go-redis/v9"
)

type RedisClient struct {
	Client *redis.Client
}

func ConnectRedis(address string) (*RedisClient, error) {
	var options *redis.Options
	var err error
	if strings.Contains(address, "://") {
		options, err = redis.ParseURL(address)
		if err != nil {
			return nil, err
		}
	} else {
		options = &redis.Options{Addr: address}
	}

	rdb := redis.NewClient(options)

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := rdb.Ping(ctx).Err(); err != nil {
		_ = rdb.Close()
		return nil, err
	}

	log.Println("Successfully connected to Redis")
	return &RedisClient{Client: rdb}, nil
}

func (r *RedisClient) Close() error {
	return r.Client.Close()
}
