package initializers

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

func LoadEnv() string {
	if err := godotenv.Load(); err != nil {
		log.Printf("Warning: .env file not found")
	}

	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		log.Fatal("DATABASE_URL environment variable is not set")
	}
	return dbURL
}
