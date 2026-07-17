package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
)

type NotificationRequest struct {
	Recipient string `json:"recipient"`
	Message   string `json:"message"`
	Type      string `json:"type"` // "email", "sms", etc.
}

type NotificationResponse struct {
	MessageID string `json:"message_id"`
	Status    string `json:"status"`
}

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8084"
	}

	http.HandleFunc("/healthz", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"healthy","service":"notification-service"}`))
	})

	http.HandleFunc("/api/v1/notifications/send", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		if r.Method != http.MethodPost {
			w.WriteHeader(http.StatusMethodNotAllowed)
			w.Write([]byte(`{"error":"Method not allowed"}`))
			return
		}

		var req NotificationRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			w.WriteHeader(http.StatusBadRequest)
			w.Write([]byte(`{"error":"Invalid request body"}`))
			return
		}
		
		response := NotificationResponse{
			MessageID: "msg_mock_555888222",
			Status:    "sent",
		}
		json.NewEncoder(w).Encode(response)
		log.Printf("Sent mock notification of type %s to %s: %s", req.Type, req.Recipient, req.Message)
	})

	log.Printf("Notification Service starting on port %s...", port)
	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
