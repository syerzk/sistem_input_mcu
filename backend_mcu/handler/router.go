package handler

import (
	"backend_mcu/dto"
	"backend_mcu/middleware"
	"fmt"
	"net/http"
	"os"
)

func SetupRouter(h *MCUHandler) http.Handler {
	mux := http.NewServeMux()

	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/" {
			SendJSON(w, http.StatusNotFound, dto.JSONResponse{
				Success: false,
				Error:   fmt.Sprintf("Endpoint API tidak ditemukan: %s", r.URL.Path),
			})
			return
		}
		SendJSON(w, http.StatusOK, dto.JSONResponse{
			Success: true,
			Message: "Backend API MCU RS PT Pusri Palembang Aktif",
		})
	})

	mux.HandleFunc("/api/health", h.HandleHealth)
	mux.HandleFunc("/api/db/status", h.HandleHealth)
	//endpoint publik
	mux.HandleFunc("/api/auth/login", h.HandleSSOLogin)
	mux.HandleFunc("/api/auth/verify-otp", h.HandleVerifyOTP)
	mux.HandleFunc("/api/auth/forgot-password", h.HandleForgotPassword)
	mux.HandleFunc("/api/auth/reset-password", h.HandleResetPassword)

	// 2. ENDPOINT SEMUA ROLE LOGIN (admin, dokter, pegawai)
	mux.HandleFunc("/api/records/badge", middleware.AuthMiddleware(h.HandleBadgeDispatcher))
	mux.HandleFunc("/api/records/badge/", middleware.AuthMiddleware(h.HandleBadgeDispatcher))

	mux.HandleFunc("/api/records", middleware.AuthMiddleware(h.HandleRecordsDispatcher))
	mux.HandleFunc("/api/records/", middleware.AuthMiddleware(h.HandleRecordByIDDispatcher))

	mux.HandleFunc("/api/doctors", middleware.AuthMiddleware(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodGet {
			h.HandleGetDoctors(w, r)
		} else if r.Method == http.MethodPost {
			middleware.RequireRole("admin")(h.HandleCreateDoctor)(w, r)
		} else {
			SendJSON(w, http.StatusMethodNotAllowed, dto.JSONResponse{Success: false, Error: "Method tidak didukung"})
		}
	}))

	// 3. ENDPOINT KHUSUS ADMIN (Diblokir jika role bukan "admin")
	// Endpoint CRUD spesifik ID Dokter (PUT & DELETE) wajib ROLE ADMIN
	adminOnly := middleware.RequireRole("admin")
	mux.HandleFunc("/api/doctors/", adminOnly(h.HandleDoctorByIDDispatcher))

	mux.HandleFunc("/api/mysql/sync-badges", adminOnly(h.HandleBulkImport))
	mux.HandleFunc("/api/records/bulk-import", adminOnly(h.HandleBulkImport))
	mux.HandleFunc("/api/auth/verify-pin", adminOnly(h.HandleVerifyPin))
	mux.HandleFunc("/api/auth/change-pin", adminOnly(h.HandleChangePin))

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
