package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/livepoll/backend/handlers"
	"github.com/livepoll/backend/middleware"
)

func SetupRoutes(
	r *gin.Engine,
	jwtSecret string,
	healthHandler *handlers.HealthHandler,
	authHandler *handlers.AuthHandler,
	pollHandler *handlers.PollHandler,
	voteHandler *handlers.VoteHandler,
	wsHandler *handlers.WSHandler,
) {
	api := r.Group("/api")
	{
		api.GET("/health", healthHandler.Health)

		// Public Auth
		auth := api.Group("/auth")
		{
			auth.POST("/signup", authHandler.Signup)
			auth.POST("/login", authHandler.Login)
			auth.GET("/me", middleware.AuthMiddleware(jwtSecret), authHandler.GetMe)
			auth.PUT("/profile", middleware.AuthMiddleware(jwtSecret), authHandler.UpdateProfile)
		}

		// Public Poll routes
		public := api.Group("/public")
		{
			public.GET("/polls/:shareId", pollHandler.GetPublicPoll)
		}

		// Polls routes
		polls := api.Group("/polls")
		{
			// Protected poll management
			polls.POST("", middleware.AuthMiddleware(jwtSecret), pollHandler.CreatePoll)
			polls.GET("", middleware.AuthMiddleware(jwtSecret), pollHandler.GetUserPolls)
			polls.GET("/:id", pollHandler.GetPollByID)
			polls.PUT("/:id", middleware.AuthMiddleware(jwtSecret), pollHandler.UpdatePoll)
			polls.DELETE("/:id", middleware.AuthMiddleware(jwtSecret), pollHandler.DeletePoll)
			polls.POST("/:id/close", middleware.AuthMiddleware(jwtSecret), pollHandler.ClosePoll)
			polls.POST("/:id/reopen", middleware.AuthMiddleware(jwtSecret), pollHandler.ReopenPoll)

			// Voting and Results (Public)
			polls.POST("/:id/vote", voteHandler.Vote)
			polls.GET("/:id/results", pollHandler.GetPollResults)
		}
	}

	// WebSocket route for real-time live poll updates
	r.GET("/ws/polls/:pollId", wsHandler.HandleWS)
}
