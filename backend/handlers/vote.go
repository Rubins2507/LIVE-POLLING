package handlers

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/livepoll/backend/models"
	"github.com/livepoll/backend/services"
	"github.com/livepoll/backend/utils"
)

type VoteHandler struct {
	voteService *services.VoteService
}

func NewVoteHandler(voteService *services.VoteService) *VoteHandler {
	return &VoteHandler{voteService: voteService}
}

func (h *VoteHandler) Vote(c *gin.Context) {
	pollID := c.Param("id")

	var req models.VoteRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	// Also fallback to X-Voter-ID header or client IP if not in body
	if req.VoterIdentifier == "" {
		voterHeader := c.GetHeader("X-Voter-ID")
		if voterHeader != "" {
			req.VoterIdentifier = voterHeader
		} else {
			req.VoterIdentifier = c.ClientIP()
		}
	}
	req.VoterIdentifier = strings.TrimSpace(req.VoterIdentifier)
	if req.VoterIdentifier == "" || len(req.VoterIdentifier) > 200 {
		utils.ErrorResponse(c, http.StatusBadRequest, "a valid voter identifier is required")
		return
	}

	results, err := h.voteService.CastVote(c.Request.Context(), pollID, req)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Vote recorded successfully", results)
}
