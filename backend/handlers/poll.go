package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/livepoll/backend/models"
	"github.com/livepoll/backend/services"
	"github.com/livepoll/backend/utils"
)

type PollHandler struct {
	pollService *services.PollService
}

func NewPollHandler(pollService *services.PollService) *PollHandler {
	return &PollHandler{pollService: pollService}
}

func (h *PollHandler) CreatePoll(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		utils.ErrorResponse(c, http.StatusUnauthorized, "Unauthorized")
		return
	}

	var req models.CreatePollRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	poll, err := h.pollService.CreatePoll(c.Request.Context(), userID.(string), req)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusCreated, "Poll created successfully", poll)
}

func (h *PollHandler) GetUserPolls(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		utils.ErrorResponse(c, http.StatusUnauthorized, "Unauthorized")
		return
	}

	polls, err := h.pollService.GetUserPolls(c.Request.Context(), userID.(string))
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "User polls retrieved", polls)
}

func (h *PollHandler) GetPollByID(c *gin.Context) {
	pollID := c.Param("id")
	poll, err := h.pollService.GetPollByID(c.Request.Context(), pollID)
	if err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "Poll not found")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Poll retrieved", poll)
}

func (h *PollHandler) UpdatePoll(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		utils.ErrorResponse(c, http.StatusUnauthorized, "Unauthorized")
		return
	}

	var req models.UpdatePollRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	poll, err := h.pollService.UpdatePoll(c.Request.Context(), c.Param("id"), userID.(string), req)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Poll updated successfully", poll)
}

func (h *PollHandler) GetPublicPoll(c *gin.Context) {
	shareID := c.Param("shareId")
	poll, err := h.pollService.GetPollByShareID(c.Request.Context(), shareID)
	if err != nil || poll == nil {
		utils.ErrorResponse(c, http.StatusNotFound, "Public poll not found")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Public poll retrieved", poll)
}

func (h *PollHandler) ClosePoll(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		utils.ErrorResponse(c, http.StatusUnauthorized, "Unauthorized")
		return
	}

	pollID := c.Param("id")
	if err := h.pollService.ClosePoll(c.Request.Context(), pollID, userID.(string)); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Poll closed successfully", nil)
}

func (h *PollHandler) ReopenPoll(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		utils.ErrorResponse(c, http.StatusUnauthorized, "Unauthorized")
		return
	}

	pollID := c.Param("id")
	if err := h.pollService.ReopenPoll(c.Request.Context(), pollID, userID.(string)); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Poll reopened successfully", nil)
}

func (h *PollHandler) DeletePoll(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		utils.ErrorResponse(c, http.StatusUnauthorized, "Unauthorized")
		return
	}

	pollID := c.Param("id")
	if err := h.pollService.DeletePoll(c.Request.Context(), pollID, userID.(string)); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Poll deleted successfully", nil)
}

func (h *PollHandler) GetPollResults(c *gin.Context) {
	pollID := c.Param("id")
	results, err := h.pollService.GetPollResults(c.Request.Context(), pollID)
	if err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "Poll results not found")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Poll results retrieved", results)
}
