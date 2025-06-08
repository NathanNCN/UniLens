package main

import (
	"bytes"
	"context"
	"crypto/rand"
	"encoding/base64"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"regexp"
	"strings"
	"time"

	"unilens/backend/initializers"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/jmoiron/sqlx"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
	"golang.org/x/time/rate"
	oauth2v2 "google.golang.org/api/oauth2/v2"
	"google.golang.org/api/option"
)

type App struct {
	ID       int16   `json:"id" db:"id"`
	UserID   string  `json:"user_id" db:"UserID"`
	Uni      string  `json:"uni" db:"Uni"`
	Program  string  `json:"program" db:"Program"`
	GPA      float32 `json:"gpa" db:"GPA"`
	Extra    string  `json:"extra" db:"Extra"`
	Awards   string  `json:"awards" db:"Awards"`
	Location string  `json:"location" db:"Location"`
	Tips     string  `json:"tips" db:"Tips"`
	Other    string  `json:"other" db:"Other"`
	Year     int     `json:"year" db:"Year"`
}

// User struct matching your Supabase schema
type User struct {
	UUID  string `json:"uuid" db:"UUID"`
	Name  string `json:"name" db:"Name"`
	Email string `json:"email" db:"Email"`
}

type Claims struct {
	UserID string `json:"user_id"`
	Email  string `json:"email"`
	Name   string `json:"name"`
	jwt.RegisteredClaims
}

var uni = []string{"@uwaterloo.ca",
	"@mail.utoronto.ca",
	"@mcmaster.ca",
	"@uwo.ca",
	"@queensu.ca",
	"@my.yorku.ca",
	"@cmail.carleton.ca",
	"@uottawa.ca",
	"@torontomu.ca",
	"@student.ubc.ca",
	"@ualbert.ca",
	"@uoguelph.ca",
	"mylaurier.ca",
	"@sfu.ca",
	"@usask.ca",
	"@uwindsor.ca",
	"@brocku.ca",
	"@ontariotechu.net",
}

var DB *sqlx.DB

// OAuth2 configuration
var (
	googleOAuthConfig *oauth2.Config
	jwtSecret         []byte
)

// Input validation patterns
var (
	emailRegex   = regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)
	uniRegex     = regexp.MustCompile(`^[a-zA-Z0-9\s\-&.,()]+$`)
	programRegex = regexp.MustCompile(`^[a-zA-Z0-9\s\-&.,()]+$`)
)

// Rate limiter
var limiter = rate.NewLimiter(rate.Every(time.Second), 10) // 10 requests per second

// Initialize OAuth configuration
func initOAuth() {
	// Load environment variables first
	if _, err := os.Stat(".env"); err == nil {
		if err := godotenv.Load(); err != nil {
			log.Printf("Warning: .env file found but could not be loaded: %v", err)
		}
	}

	googleOAuthConfig = &oauth2.Config{
		ClientID:     os.Getenv("GOOGLE_CLIENT_ID"),
		ClientSecret: os.Getenv("GOOGLE_CLIENT_SECRET"),
		RedirectURL:  os.Getenv("GOOGLE_REDIRECT_URL"), // e.g., "http://localhost:3000/auth/callback"
		Scopes: []string{
			"https://www.googleapis.com/auth/userinfo.email",
			"https://www.googleapis.com/auth/userinfo.profile",
		},
		Endpoint: google.Endpoint,
	}

	// Initialize JWT secret
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		log.Fatal("JWT_SECRET environment variable is required")
	}
	jwtSecret = []byte(secret)
}

// Generate state parameter for OAuth
func generateStateOauthCookie() string {
	b := make([]byte, 16)
	rand.Read(b)
	return base64.URLEncoding.EncodeToString(b)
}

// Create JWT token
func createJWTToken(user *User) (string, error) {
	claims := &Claims{
		UserID: user.UUID,
		Email:  user.Email,
		Name:   user.Name,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtSecret)
}

// Validate JWT token
func validateJWTToken(tokenString string) (*Claims, error) {
	claims := &Claims{}
	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		return jwtSecret, nil
	})

	if err != nil {
		return nil, err
	}

	if !token.Valid {
		return nil, fmt.Errorf("invalid token")
	}

	return claims, nil
}

// Middleware to check authentication
func authMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get token from cookie or Authorization header
		var tokenString string

		// Try cookie first
		if cookie, err := c.Cookie("auth_token"); err == nil {
			tokenString = cookie
		} else {
			// Try Authorization header
			authHeader := c.GetHeader("Authorization")
			if authHeader != "" && strings.HasPrefix(authHeader, "Bearer ") {
				tokenString = strings.TrimPrefix(authHeader, "Bearer ")
			}
		}

		if tokenString == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
			c.Abort()
			return
		}

		claims, err := validateJWTToken(tokenString)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			c.Abort()
			return
		}

		// Set user info in context
		c.Set("user_id", claims.UserID)
		c.Set("email", claims.Email)
		c.Set("name", claims.Name)
		c.Next()
	}
}

// OAuth handlers
func googleLogin(c *gin.Context) {
	state := generateStateOauthCookie()

	// Store state in cookie for validation - updated for production
	// Use secure cookies in production, allow cross-site for OAuth flow
	isProduction := os.Getenv("GIN_MODE") == "release" || os.Getenv("ENVIRONMENT") == "production"

	c.SetCookie(
		"oauth_state",
		state,
		600, // 10 minutes
		"/",
		"",           // domain - empty allows subdomain sharing
		isProduction, // secure - only true in production
		true,         // httpOnly
	)

	// Also set SameSite=None for cross-site cookies in production
	if isProduction {
		c.Header("Set-Cookie", fmt.Sprintf("oauth_state=%s; Path=/; Max-Age=600; HttpOnly; Secure; SameSite=None", state))
	}

	url := googleOAuthConfig.AuthCodeURL(state, oauth2.AccessTypeOffline)
	c.JSON(200, gin.H{"auth_url": url})
}

func googleCallback(c *gin.Context) {
	log.Printf("OAuth callback received - State: %s, Code present: %t", c.Query("state"), c.Query("code") != "")

	// Validate state parameter
	state := c.Query("state")
	storedState, err := c.Cookie("oauth_state")
	if err != nil {
		log.Printf("Error getting oauth_state cookie: %v", err)
		c.JSON(400, gin.H{"error": "Invalid state parameter - no cookie found"})
		return
	}
	if state != storedState {
		log.Printf("State mismatch - received: %s, stored: %s", state, storedState)
		c.JSON(400, gin.H{"error": "Invalid state parameter - mismatch"})
		return
	}

	log.Printf("State validation successful")

	// Clear the state cookie
	c.SetCookie("oauth_state", "", -1, "/", "", false, true)

	// Exchange code for token
	code := c.Query("code")
	if code == "" {
		c.JSON(400, gin.H{"error": "Authorization code not provided"})
		return
	}

	token, err := googleOAuthConfig.Exchange(context.Background(), code)
	if err != nil {
		log.Printf("OAuth token exchange error: %v", err)
		c.JSON(400, gin.H{"error": "Failed to exchange token"})
		return
	}

	// Get user info from Google
	oauth2Service, err := oauth2v2.NewService(context.Background(), option.WithTokenSource(googleOAuthConfig.TokenSource(context.Background(), token)))
	if err != nil {
		log.Printf("Failed to create OAuth2 service: %v", err)
		c.JSON(500, gin.H{"error": "Failed to get user info"})
		return
	}

	userInfo, err := oauth2Service.Userinfo.Get().Do()
	if err != nil {
		log.Printf("Failed to get user info: %v", err)
		c.JSON(500, gin.H{"error": "Failed to get user info"})
		return
	}

	// Check if user exists, if not create them
	var user User
	err = DB.Get(&user, `SELECT * FROM Users WHERE "Email" = $1`, userInfo.Email)
	if err != nil {
		// User doesn't exist, create them
		query := `
			INSERT INTO Users ("UUID", "Name", "Email")
			VALUES (gen_random_uuid(), $1, $2)
			RETURNING "UUID", "Name", "Email"
		`
		err = DB.QueryRowx(query, userInfo.Name, userInfo.Email).StructScan(&user)
		if err != nil {
			log.Printf("Failed to create user: %v", err)
			c.JSON(500, gin.H{"error": "Failed to create user"})
			return
		}
	} else {
		// User exists, update their name if it changed
		query := `
			UPDATE Users 
			SET "Name" = $2
			WHERE "Email" = $1
			RETURNING "UUID", "Name", "Email"`

		err = DB.QueryRowx(query, userInfo.Email, userInfo.Name).StructScan(&user)
		if err != nil {
			log.Printf("Failed to update user: %v", err)
			c.JSON(500, gin.H{"error": "Failed to update user"})
			return
		}
	}

	// Create JWT token
	jwtToken, err := createJWTToken(&user)
	if err != nil {
		log.Printf("Failed to create JWT token: %v", err)
		c.JSON(500, gin.H{"error": "Failed to create session"})
		return
	}

	// Set HTTP-only cookie
	isProduction := os.Getenv("GIN_MODE") == "release" || os.Getenv("ENVIRONMENT") == "production"

	c.SetCookie(
		"auth_token",
		jwtToken,
		24*60*60, // 24 hours
		"/",
		"",           // domain
		isProduction, // secure - only true in production
		true,         // httpOnly
	)

	// Also set SameSite=None for cross-site cookies in production
	if isProduction {
		c.Header("Set-Cookie", fmt.Sprintf("auth_token=%s; Path=/; Max-Age=%d; HttpOnly; Secure; SameSite=None", jwtToken, 24*60*60))
	}

	// Redirect back to frontend instead of returning JSON
	frontendURL := os.Getenv("FRONTEND_URL")
	if frontendURL == "" {
		frontendURL = "https://uni-lens.vercel.app" // fallback
	}

	// Add success parameter to indicate successful login
	redirectURL := frontendURL + "?auth=success"

	log.Printf("Redirecting to: %s", redirectURL)
	c.Redirect(302, redirectURL)
}

func logout(c *gin.Context) {
	// Clear the auth cookie
	isProduction := os.Getenv("GIN_MODE") == "release" || os.Getenv("ENVIRONMENT") == "production"

	c.SetCookie("auth_token", "", -1, "/", "", isProduction, true)

	// Also clear with SameSite=None for production
	if isProduction {
		c.Header("Set-Cookie", "auth_token=; Path=/; Max-Age=-1; HttpOnly; Secure; SameSite=None")
	}

	c.JSON(200, gin.H{"message": "Logged out successfully"})
}

func getCurrentUser(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(401, gin.H{"error": "User not authenticated"})
		return
	}

	var user User
	err := DB.Get(&user, `SELECT * FROM Users WHERE "UUID" = $1`, userID)
	if err != nil {
		c.JSON(404, gin.H{"error": "User not found"})
		return
	}

	c.JSON(200, user)
}

// Sanitize input string
func sanitizeInput(input string) string {
	// Remove any SQL injection attempts
	input = strings.ReplaceAll(input, ";", "")
	input = strings.ReplaceAll(input, "--", "")
	input = strings.ReplaceAll(input, "/*", "")
	input = strings.ReplaceAll(input, "*/", "")
	input = strings.ReplaceAll(input, "xp_", "")
	input = strings.ReplaceAll(input, "sp_", "")
	input = strings.ReplaceAll(input, "exec", "")
	input = strings.ReplaceAll(input, "execute", "")
	input = strings.ReplaceAll(input, "select", "")
	input = strings.ReplaceAll(input, "insert", "")
	input = strings.ReplaceAll(input, "update", "")
	input = strings.ReplaceAll(input, "delete", "")
	input = strings.ReplaceAll(input, "drop", "")
	input = strings.ReplaceAll(input, "alter", "")
	input = strings.ReplaceAll(input, "truncate", "")
	return input
}

// Validate application input
func validateApplication(app *App) error {
	if app.Uni == "" || !uniRegex.MatchString(app.Uni) {
		return fmt.Errorf("invalid university name")
	}
	if app.Program == "" || !programRegex.MatchString(app.Program) {
		return fmt.Errorf("invalid program name")
	}
	if app.GPA < 0 || app.GPA > 100 {
		return fmt.Errorf("invalid GPA")
	}
	if app.Year < 2000 || app.Year > time.Now().Year()+1 {
		return fmt.Errorf("invalid year")
	}
	return nil
}

func main() {
	// Initialize OAuth
	initOAuth()

	// Initialize database connection
	dbURL := initializers.GetDbUrl()
	DB = initializers.ConnectToDb(dbURL)

	// Initialize Gin router
	r := gin.Default()

	// Custom CORS middleware to handle Vercel's dynamic URLs
	r.Use(func(c *gin.Context) {
		origin := c.Request.Header.Get("Origin")

		// Allow specific origins and Vercel preview URLs
		allowedOrigins := []string{
			"https://unilens.onrender.com",
			"https://uni-lens.vercel.app",
			"http://localhost:3000",
			"https://localhost:3000",
		}

		// Check if origin is allowed or is a Vercel preview URL
		allowed := false
		for _, allowedOrigin := range allowedOrigins {
			if origin == allowedOrigin {
				allowed = true
				break
			}
		}

		// Also allow Vercel preview URLs
		if !allowed && strings.Contains(origin, "vercel.app") {
			allowed = true
		}

		if allowed {
			c.Header("Access-Control-Allow-Origin", origin)
			c.Header("Access-Control-Allow-Credentials", "true")
			c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization, Cookie, Accept, Origin, X-Requested-With")
			c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
			c.Header("Access-Control-Expose-Headers", "Set-Cookie")
			c.Header("Access-Control-Max-Age", "300")
		}

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	// Public endpoints
	r.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "UniLens API is running",
			"status":  "healthy",
			"version": "1.0.0",
		})
	})
	r.GET("/applications", getAllApplications)

	// Auth endpoints
	r.GET("/auth/google/login", googleLogin)
	r.GET("/auth/google/callback", googleCallback)
	r.POST("/auth/logout", logout)

	// Protected endpoints
	protected := r.Group("/")
	protected.Use(authMiddleware())
	{
		protected.GET("/auth/me", getCurrentUser)
		protected.POST("/applications", createApplication)
	}

	// Use port from environment variables (Render sets PORT automatically)
	port := initializers.GetPort()
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
	defer DB.Close()
}

func getAllApplications(c *gin.Context) {
	var applications []App
	query := `SELECT * FROM applications ORDER BY "id" DESC`

	err := DB.Select(&applications, query)
	if err != nil {
		log.Printf("Database error: %v", err)
		c.JSON(500, gin.H{"error": "Internal server error"})
		return
	}

	c.JSON(200, applications)
}

func createApplication(c *gin.Context) {
	// Rate limiting
	if !limiter.Allow() {
		c.JSON(http.StatusTooManyRequests, gin.H{"error": "Too many requests"})
		return
	}

	// Get user ID from auth middleware
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(401, gin.H{"error": "User not authenticated"})
		return
	}

	// Check if user already has an application
	var existingAppCount int
	err := DB.QueryRow(`SELECT COUNT(*) FROM applications WHERE "UserID" = $1`, userID).Scan(&existingAppCount)
	if err != nil {
		log.Printf("Database error checking existing applications: %v", err)
		c.JSON(500, gin.H{"error": "Internal server error"})
		return
	}

	if existingAppCount > 0 {
		c.JSON(409, gin.H{"error": "You have already submitted an application. Only one application per user is allowed."})
		return
	}

	// Read and bind request body
	body, err := ioutil.ReadAll(c.Request.Body)
	if err != nil {
		c.JSON(400, gin.H{"error": "Error reading request body"})
		return
	}
	c.Request.Body = ioutil.NopCloser(bytes.NewBuffer(body))

	var app App
	if err := c.ShouldBindJSON(&app); err != nil {
		c.JSON(400, gin.H{"error": "Invalid request body"})
		return
	}

	// Set the user ID from the authenticated user
	app.UserID = userID.(string)

	// Sanitize inputs
	app.Uni = sanitizeInput(app.Uni)
	app.Program = sanitizeInput(app.Program)
	app.Extra = sanitizeInput(app.Extra)
	app.Awards = sanitizeInput(app.Awards)
	app.Location = sanitizeInput(app.Location)
	app.Tips = sanitizeInput(app.Tips)
	app.Other = sanitizeInput(app.Other)

	// Get next ID
	var nextID int16
	err = DB.QueryRow("SELECT COALESCE(MAX(\"id\"), 0) + 1 FROM applications").Scan(&nextID)
	if err != nil {
		log.Printf("Database error: %v", err)
		c.JSON(500, gin.H{"error": "Internal server error"})
		return
	}

	// Insert the application
	query := `
		INSERT INTO applications ("id", "UserID", "Uni", "Program", "GPA", "Extra", "Awards", "Location", "Tips", "Other", "Year")
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`

	_, err = DB.Exec(
		query,
		nextID,
		app.UserID,
		app.Uni,
		app.Program,
		app.GPA,
		app.Extra,
		app.Awards,
		app.Location,
		app.Tips,
		app.Other,
		app.Year,
	)

	if err != nil {
		log.Printf("Database error: %v", err)
		c.JSON(500, gin.H{"error": "Internal server error"})
		return
	}

	app.ID = nextID
	c.JSON(201, app)
}
