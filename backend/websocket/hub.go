package websocket

import (
	"context"
	"encoding/json"
	"sync"

	"github.com/livepoll/backend/redis"
)

type Hub struct {
	// Registered clients mapped by PollID -> set of Clients
	rooms      map[string]map[*Client]bool
	Register   chan *Client
	Unregister chan *Client
	Broadcast  chan BroadcastMessage
	redis      *redis.RedisClient
	subs       map[string]chan struct{}
	mu         sync.RWMutex
}

type BroadcastMessage struct {
	PollID  string
	Message []byte
}

func NewHub(redisClient *redis.RedisClient) *Hub {
	return &Hub{
		rooms:      make(map[string]map[*Client]bool),
		Register:   make(chan *Client),
		Unregister: make(chan *Client),
		Broadcast:  make(chan BroadcastMessage),
		redis:      redisClient,
		subs:       make(map[string]chan struct{}),
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.Register:
			h.mu.Lock()
			if h.rooms[client.PollID] == nil {
				h.rooms[client.PollID] = make(map[*Client]bool)
				// Start Redis subscriber for this poll if not already active
				h.startRedisSubscriber(client.PollID)
			}
			h.rooms[client.PollID][client] = true
			roomSize := len(h.rooms[client.PollID])
			h.mu.Unlock()

			// Broadcast viewer count
			h.broadcastViewerCount(client.PollID, roomSize)

		case client := <-h.Unregister:
			h.mu.Lock()
			if clients, ok := h.rooms[client.PollID]; ok {
				if _, exists := clients[client]; exists {
					delete(clients, client)
					close(client.Send)
					roomSize := len(clients)
					if roomSize == 0 {
						delete(h.rooms, client.PollID)
						h.stopRedisSubscriber(client.PollID)
					}
					h.mu.Unlock()
					h.broadcastViewerCount(client.PollID, roomSize)
					continue
				}
			}
			h.mu.Unlock()

		case bMsg := <-h.Broadcast:
			h.mu.RLock()
			clients := h.rooms[bMsg.PollID]
			for client := range clients {
				select {
				case client.Send <- bMsg.Message:
				default:
					close(client.Send)
					delete(clients, client)
				}
			}
			h.mu.RUnlock()
		}
	}
}

func (h *Hub) broadcastViewerCount(pollID string, count int) {
	msg, _ := json.Marshal(map[string]interface{}{
		"type":    "VIEWER_COUNT",
		"pollId":  pollID,
		"viewers": count,
	})
	h.BroadcastToRoom(pollID, msg)
}

func (h *Hub) BroadcastToRoom(pollID string, message []byte) {
	h.Broadcast <- BroadcastMessage{
		PollID:  pollID,
		Message: message,
	}
}

func (h *Hub) startRedisSubscriber(pollID string) {
	if h.redis == nil {
		return
	}
	if _, exists := h.subs[pollID]; exists {
		return
	}

	stopChan := make(chan struct{})
	h.subs[pollID] = stopChan

	go func() {
		ctx, cancel := context.WithCancel(context.Background())
		defer cancel()

		pubsub := h.redis.SubscribePollUpdates(ctx, pollID)
		defer pubsub.Close()

		ch := pubsub.Channel()
		for {
			select {
			case <-stopChan:
				return
			case msg, ok := <-ch:
				if !ok {
					return
				}
				h.BroadcastToRoom(pollID, []byte(msg.Payload))
			}
		}
	}()
}

func (h *Hub) stopRedisSubscriber(pollID string) {
	if stopChan, exists := h.subs[pollID]; exists {
		close(stopChan)
		delete(h.subs, pollID)
	}
}
