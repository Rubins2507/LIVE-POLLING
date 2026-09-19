package services

import (
	"context"
	"errors"
	"strings"

	"github.com/livepoll/backend/models"
	"github.com/livepoll/backend/repository"
	"github.com/livepoll/backend/utils"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type AuthService struct {
	userRepo  *repository.UserRepository
	jwtSecret string
}

func NewAuthService(userRepo *repository.UserRepository, jwtSecret string) *AuthService {
	return &AuthService{
		userRepo:  userRepo,
		jwtSecret: jwtSecret,
	}
}

func (s *AuthService) Signup(ctx context.Context, req models.UserSignupRequest) (*models.UserResponse, string, error) {
	if req.Password != req.ConfirmPassword {
		return nil, "", errors.New("passwords do not match")
	}

	email := strings.ToLower(strings.TrimSpace(req.Email))
	existing, _ := s.userRepo.FindByEmail(ctx, email)
	if existing != nil {
		return nil, "", errors.New("an account with this email already exists")
	}

	hash, err := utils.HashPassword(req.Password)
	if err != nil {
		return nil, "", errors.New("failed to hash password")
	}

	user := &models.User{
		Name:         strings.TrimSpace(req.Name),
		Email:        email,
		PasswordHash: hash,
	}

	if err := s.userRepo.Create(ctx, user); err != nil {
		return nil, "", err
	}

	token, err := utils.GenerateToken(user.ID.Hex(), user.Email, user.Name, s.jwtSecret)
	if err != nil {
		return nil, "", err
	}

	res := &models.UserResponse{
		ID:        user.ID.Hex(),
		Name:      user.Name,
		Email:     user.Email,
		CreatedAt: user.CreatedAt,
	}

	return res, token, nil
}

func (s *AuthService) Login(ctx context.Context, req models.UserLoginRequest) (*models.UserResponse, string, error) {
	email := strings.ToLower(strings.TrimSpace(req.Email))
	user, err := s.userRepo.FindByEmail(ctx, email)
	if err != nil || user == nil {
		return nil, "", errors.New("invalid email or password")
	}

	if !utils.CheckPasswordHash(req.Password, user.PasswordHash) {
		return nil, "", errors.New("invalid email or password")
	}

	token, err := utils.GenerateToken(user.ID.Hex(), user.Email, user.Name, s.jwtSecret)
	if err != nil {
		return nil, "", err
	}

	res := &models.UserResponse{
		ID:        user.ID.Hex(),
		Name:      user.Name,
		Email:     user.Email,
		CreatedAt: user.CreatedAt,
	}

	return res, token, nil
}

func (s *AuthService) GetProfile(ctx context.Context, userIDStr string) (*models.UserResponse, error) {
	objID, err := primitive.ObjectIDFromHex(userIDStr)
	if err != nil {
		return nil, errors.New("invalid user ID")
	}

	user, err := s.userRepo.FindByID(ctx, objID)
	if err != nil || user == nil {
		return nil, errors.New("user not found")
	}

	return &models.UserResponse{
		ID:        user.ID.Hex(),
		Name:      user.Name,
		Email:     user.Email,
		CreatedAt: user.CreatedAt,
	}, nil
}

func (s *AuthService) UpdateProfile(ctx context.Context, userIDStr string, req models.UpdateProfileRequest) (*models.UserResponse, error) {
	objID, err := primitive.ObjectIDFromHex(userIDStr)
	if err != nil {
		return nil, errors.New("invalid user ID")
	}

	name := strings.TrimSpace(req.Name)
	if name == "" {
		return nil, errors.New("name cannot be empty")
	}

	if err := s.userRepo.UpdateName(ctx, objID, name); err != nil {
		return nil, err
	}

	return s.GetProfile(ctx, userIDStr)
}
