package initializers

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

func GetDbUrl() string {
	// Only try to load .env file in development (when file exists)
	// In production (Render), environment variables are set directly
	if _, err := os.Stat(".env"); err == nil {
		if err := godotenv.Load(); err != nil {
			log.Printf("Warning: .env file found but could not be loaded: %v", err)
		}
	}

	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		log.Fatal("DATABASE_URL environment variable is not set")
	}
	return dbURL
}

// GetPort returns the port from environment variables or defaults to 8080
func GetPort() string {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	return port
}
