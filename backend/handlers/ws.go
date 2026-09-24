package handlers

import (
	"github.com/gin-gonic/gin"
	"github.com/livepoll/backend/websocket"
)

type WSHandler struct {
	hub *websocket.Hub
}

func NewWSHandler(hub *websocket.Hub) *WSHandler {
	return &WSHandler{hub: hub}
}

func (h *WSHandler) HandleWS(c *gin.Context) {
	pollID := c.Param("pollId")
	websocket.ServeWs(h.hub, c.Writer, c.Request, pollID)
}
