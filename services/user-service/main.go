package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
)

type User struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
}

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8081"
	}

	// Liveness and readiness probe endpoint
	http.HandleFunc("/healthz", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"healthy","service":"user-service"}`))
	})

	http.HandleFunc("/api/v1/users", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		users := []User{
			{ID: "1", Name: "John Doe", Email: "john.doe@example.com"},
			{ID: "2", Name: "Jane Smith", Email: "jane.smith@example.com"},
		}
		json.NewEncoder(w).Encode(users)
		log.Println("Served request for users list")
	})

	log.Printf("User Service starting on port %s...", port)
	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
