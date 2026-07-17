package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
)

type TokenResponse struct {
	Token string `json:"token"`
	Type  string `json:"type"`
}

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8082"
	}

	http.HandleFunc("/healthz", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"healthy","service":"auth-service"}`))
	})

	http.HandleFunc("/api/v1/auth/login", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		if r.Method != http.MethodPost {
			w.WriteHeader(http.StatusMethodNotAllowed)
			w.Write([]byte(`{"error":"Method not allowed"}`))
			return
		}
		
		response := TokenResponse{
			Token: "mock-jwt-token-xyz-123456",
			Type:  "Bearer",
		}
		json.NewEncoder(w).Encode(response)
		log.Println("Authenticated user and generated mock JWT token")
	})

	log.Printf("Auth Service starting on port %s...", port)
	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
