package middleware

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"

	"backend_mcu/dto"
	"backend_mcu/utils"
)

type contextKey string

const (
	ContextRoleKey contextKey = "role"
)

func writeUnauthorized(w http.ResponseWriter, status int, msg string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(dto.JSONResponse{
		Success: false,
		Error:   msg,
	})
}

// AuthMiddleware memastikan user sudah login dan menyisipkan username + role ke Context
func AuthMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
			writeUnauthorized(w, http.StatusUnauthorized, "Akses ditolak: Silakan login terlebih dahulu")
			return
		}

		tokenStr := strings.TrimPrefix(authHeader, "Bearer ")
		claims, err := utils.ValidateToken(tokenStr)
		if err != nil {
			writeUnauthorized(w, http.StatusUnauthorized, "Sesi tidak valid: "+err.Error())
			return
		}

		// Key "username" menggunakan string agar kompatibel dengan RecordAudit di mcu_handler.go
		ctx := context.WithValue(r.Context(), "username", claims.Username)
		ctx = context.WithValue(ctx, ContextRoleKey, claims.Role)

		next.ServeHTTP(w, r.WithContext(ctx))
	}
}

// RequireRole membatasi endpoint hanya untuk role tertentu (misal: "admin")
func RequireRole(allowedRoles ...string) func(http.HandlerFunc) http.HandlerFunc {
	return func(next http.HandlerFunc) http.HandlerFunc {
		return AuthMiddleware(func(w http.ResponseWriter, r *http.Request) {
			userRole, _ := r.Context().Value(ContextRoleKey).(string)

			for _, allowed := range allowedRoles {
				if strings.EqualFold(userRole, allowed) {
					next.ServeHTTP(w, r)
					return
				}
			}

			writeUnauthorized(w, http.StatusForbidden, "Akses ditolak: Anda tidak memiliki hak akses untuk fitur ini")
		})
	}
}
