package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/livepoll/backend/utils"
)

type HealthHandler struct{}

func NewHealthHandler() *HealthHandler {
	return &HealthHandler{}
}

func (h *HealthHandler) Health(c *gin.Context) {
	utils.SuccessResponse(c, http.StatusOK, "LivePoll API is healthy", gin.H{
		"status":    "ok",
		"timestamp": time.Now(),
		"service":   "livepoll-go-backend",
	})
}
