package handler

import (
	"backend_mcu/dto"
	"net/http"
	"os"
	"strings"
)

func SetupRouter(h *MCUHandler) http.Handler {
	mux := http.NewServeMux()

	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/" {
			http.NotFound(w, r)
			return
		}
		SendJSON(w, http.StatusOK, dto.JSONResponse{
			Success: true,
			Message: "Backend API MCU RS PT Pusri Palembang Aktif",
		})
	})

	mux.HandleFunc("/api/records/badge/", func(w http.ResponseWriter, r *http.Request) {
		rawPath := strings.TrimPrefix(r.URL.Path, "/api/records/badge/")
		badge := strings.TrimSuffix(rawPath, "/")

		if r.Method == http.MethodGet {
			h.HandleGetRecordByBadge(w, r, badge)
		} else {
			SendJSON(w, http.StatusMethodNotAllowed, dto.JSONResponse{Success: false, Error: "Method tidak didukung"})
		}
	})

	mux.HandleFunc("/api/health", h.HandleHealth)
	mux.HandleFunc("/api/db/status", h.HandleHealth)
	mux.HandleFunc("/api/mysql/sync-badges", h.HandleBulkImport)
	mux.HandleFunc("/api/auth/verify-pin", h.HandleVerifyPin)
	mux.HandleFunc("/api/auth/change-pin", h.HandleChangePin)
	mux.HandleFunc("/api/records", h.HandleRecordsDispatcher)
	mux.HandleFunc("/api/records/", h.HandleRecordByIDDispatcher)
	mux.HandleFunc("/api/records/bulk-import", h.HandleBulkImport)
	mux.HandleFunc("/api/doctors", h.HandleGetDoctors)

	return corsMiddleware(mux)
}

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		allowedOrigins := os.Getenv("ALLOWED_ORIGINS")
		if allowedOrigins == "" {
			allowedOrigins = "http://localhost:3000"
		}

		w.Header().Set("Access-Control-Allow-Origin", allowedOrigins)
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}
