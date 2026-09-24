package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/livepoll/backend/config"
	"github.com/livepoll/backend/database"
	"github.com/livepoll/backend/handlers"
	"github.com/livepoll/backend/middleware"
	"github.com/livepoll/backend/redis"
	"github.com/livepoll/backend/repository"
	"github.com/livepoll/backend/routes"
	"github.com/livepoll/backend/services"
	"github.com/livepoll/backend/websocket"
)

func main() {
	cfg := config.LoadConfig()

	if cfg.Environment == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	// 1. Connect MongoDB
	mongoDB, err := database.ConnectMongoDB(cfg.MongoDBURI)
	if err != nil {
		log.Fatalf("MongoDB connection failed: %v", err)
	}
	defer func() {
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		_ = mongoDB.Close(ctx)
	}()

	// 2. Connect Redis
	redisClient, err := redis.ConnectRedis(cfg.RedisURL)
	if err != nil {
		log.Fatalf("Redis connection failed: %v", err)
	}
	defer redisClient.Close()

	// 3. Initialize WebSocket Hub
	hub := websocket.NewHub(redisClient)
	go hub.Run()

	// 4. Initialize Repositories
	userRepo := repository.NewUserRepository(mongoDB.Users)
	pollRepo := repository.NewPollRepository(mongoDB.Polls)
	voteRepo := repository.NewVoteRepository(mongoDB.Votes)

	// 5. Initialize Services
	authService := services.NewAuthService(userRepo, cfg.JWTSecret)
	pollService := services.NewPollService(pollRepo, voteRepo, redisClient)
	voteService := services.NewVoteService(pollRepo, voteRepo, redisClient)

	// 6. Initialize Handlers
	healthHandler := handlers.NewHealthHandler()
	authHandler := handlers.NewAuthHandler(authService)
	pollHandler := handlers.NewPollHandler(pollService)
	voteHandler := handlers.NewVoteHandler(voteService)
	wsHandler := handlers.NewWSHandler(hub)

	// 7. Gin Engine & Middlewares
	r := gin.New()
	r.Use(gin.Logger())
	r.Use(gin.Recovery())
	r.Use(middleware.SetupCORS(cfg.CORSOrigin))

	// 8. Setup Routes
	routes.SetupRoutes(
		r,
		cfg.JWTSecret,
		healthHandler,
		authHandler,
		pollHandler,
		voteHandler,
		wsHandler,
	)

	// 9. HTTP Server with Graceful Shutdown
	srv := &http.Server{
		Addr:    ":" + cfg.Port,
		Handler: r,
	}

	go func() {
		log.Printf("LivePoll Go Backend running on port %s (%s)", cfg.Port, cfg.Environment)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Server failed to listen: %v", err)
		}
	}()

	// Graceful shutdown handling
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("Shutting down LivePoll server...")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := srv.Shutdown(ctx); err != nil {
		log.Fatalf("Server forced to shutdown: %v", err)
	}

	log.Println("LivePoll server gracefully stopped")
}
