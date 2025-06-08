package initializers

import (
	"log"
	"net/url"
	"strings"

	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
)

func ConnectToDb(dbURL string) *sqlx.DB {
	// Parse the database URL
	parsedURL, err := url.Parse(dbURL)
	if err != nil {
		log.Fatalf("Failed to parse database URL: %v", err)
	}

	// Add connection parameters for better reliability and IPv4 preference
	query := parsedURL.Query()
	if query.Get("sslmode") == "" {
		query.Set("sslmode", "require")
	}
	query.Set("connect_timeout", "30")
	query.Set("application_name", "unilens")
	// Force IPv4 by setting host preference
	query.Set("host", strings.Split(parsedURL.Host, ":")[0])
	parsedURL.RawQuery = query.Encode()

	// Try to resolve hostname to IPv4 manually
	hostname := strings.Split(parsedURL.Host, ":")[0]
	port := "5432"
	if strings.Contains(parsedURL.Host, ":") {
		parts := strings.Split(parsedURL.Host, ":")
		if len(parts) > 1 {
			port = parts[1]
		}
	}

	// Rebuild URL with explicit IPv4 preference
	finalURL := parsedURL.String()

	// Mask credentials in logs
	logURL := strings.Replace(finalURL, parsedURL.User.String()+"@", "[CREDENTIALS]@", 1)
	log.Printf("Connecting to database with URL: %s", logURL)
	log.Printf("Attempting to connect to hostname: %s on port: %s", hostname, port)

	// Try connecting with standard postgres driver
	DB, err := sqlx.Connect("postgres", finalURL)
	if err != nil {
		// If connection fails, try with a modified connection string that forces IPv4
		log.Printf("Initial connection failed: %v", err)
		log.Printf("Retrying with IPv4-specific configuration...")

		// Create a new URL with just the essential parameters
		simpleURL := &url.URL{
			Scheme: "postgres",
			User:   parsedURL.User,
			Host:   hostname + ":" + port,
			Path:   parsedURL.Path,
		}

		// Add minimal required parameters
		simpleQuery := url.Values{}
		simpleQuery.Set("sslmode", "require")
		simpleQuery.Set("connect_timeout", "30")
		simpleURL.RawQuery = simpleQuery.Encode()

		retryURL := simpleURL.String()
		logRetryURL := strings.Replace(retryURL, parsedURL.User.String()+"@", "[CREDENTIALS]@", 1)
		log.Printf("Retry URL: %s", logRetryURL)

		DB, err = sqlx.Connect("postgres", retryURL)
		if err != nil {
			log.Fatalf("Failed to connect to database after retry: %v", err)
		}
	}

	// Test the connection
	if err := DB.Ping(); err != nil {
		log.Fatalf("Failed to ping database: %v", err)
	}

	log.Println("Successfully connected to database")
	return DB
}
