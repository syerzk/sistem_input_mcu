package handler

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/smtp"
	"os"
	"strings"
	"time"

	"backend_mcu/dto"
	"backend_mcu/model"
	"backend_mcu/utils"

	"github.com/pquerna/otp/totp"
	"golang.org/x/crypto/bcrypt"
)

type ssoLoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type otpVerifyRequest struct {
	Username string `json:"username"`
	OtpCode  string `json:"otpCode"`
}

type forgotPasswordRequest struct {
	Email string `json:"email"`
}

// EnsureDefaultUsers memastikan 3 akun simulasi SSO (admin, dokter, pegawai) tersedia di database
func (h *MCUHandler) EnsureDefaultUsers() {
	defaultAccounts := []struct {
		Username string
		Password string
		Nama     string
		Role     string
	}{
		{"admin", "admin123", "Administrator Unit K3LH", "admin"},
		{"dokter", "dokter123", "dr. Pemeriksa MCU", "dokter"},
		{"pegawai", "pegawai123", "Petugas Rekam Medis MCU", "pegawai"},
	}

	for _, acc := range defaultAccounts {
		var existing model.AdminUser
		err := h.db.Where("LOWER(username) = ?", acc.Username).First(&existing).Error
		if err != nil {
			hashed, errHash := bcrypt.GenerateFromPassword([]byte(acc.Password), bcrypt.DefaultCost)
			if errHash != nil {
				continue
			}
			newUser := model.AdminUser{
				Username:     acc.Username,
				PasswordHash: string(hashed),
				NamaPetugas:  acc.Nama,
				Role:         acc.Role,
				IsActive:     true,
			}
			_ = h.db.Create(&newUser).Error
		} else if existing.Role == "" {
			existing.Role = acc.Role
			if existing.NamaPetugas == "" {
				existing.NamaPetugas = acc.Nama
			}
			_ = h.db.Save(&existing).Error
		}
	}
}

// HandleSSOLogin memvalidasi username & password simulasi SSO tahap 1
func (h *MCUHandler) HandleSSOLogin(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		SendJSON(w, http.StatusMethodNotAllowed, dto.JSONResponse{Success: false, Error: "Method tidak didukung"})
		return
	}

	h.EnsureDefaultUsers()

	r.Body = http.MaxBytesReader(w, r.Body, 1<<20)
	var req ssoLoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		SendJSON(w, http.StatusBadRequest, dto.JSONResponse{Success: false, Error: "Format JSON tidak valid"})
		return
	}

	cleanUser := strings.ToLower(strings.TrimSpace(req.Username))
	if cleanUser == "" || req.Password == "" {
		SendJSON(w, http.StatusBadRequest, dto.JSONResponse{Success: false, Error: "Username/Badge dan Password wajib diisi"})
		return
	}

	var user model.AdminUser
	if err := h.db.Where("LOWER(username) = ?", cleanUser).First(&user).Error; err != nil {
		SendJSON(w, http.StatusUnauthorized, dto.JSONResponse{Success: false, Error: "Akun SSO tidak terdaftar"})
		return
	}

	if !user.IsActive {
		SendJSON(w, http.StatusForbidden, dto.JSONResponse{Success: false, Error: "Akun dinonaktifkan oleh Administrator"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		SendJSON(w, http.StatusUnauthorized, dto.JSONResponse{Success: false, Error: "Username atau Password SSO salah"})
		return
	}

	role := user.Role
	if role == "" {
		role = "pegawai"
	}

	// 1. JIKA ROLE ADMIN: Lanjutkan ke proses verifikasi OTP / 2FA seperti semula
	if role == "admin" {
		needsSetup := false
		otpAuthURL := ""
		otpSecret := user.OtpSecret

		if strings.TrimSpace(otpSecret) == "" {
			key, err := totp.Generate(totp.GenerateOpts{
				Issuer:      "MCU-RS-Pusri",
				AccountName: user.Username,
			})
			if err != nil {
				SendJSON(w, http.StatusInternalServerError, dto.JSONResponse{Success: false, Error: "Gagal membuat kunci Google Authenticator"})
				return
			}
			otpSecret = key.Secret()
			otpAuthURL = key.URL()
			needsSetup = true

			user.OtpSecret = otpSecret
			_ = h.db.Save(&user).Error
		} else {
			otpAuthURL = fmt.Sprintf("otpauth://totp/MCU-RS-Pusri:%s?secret=%s&issuer=MCU-RS-Pusri", user.Username, otpSecret)
		}

		SendJSON(w, http.StatusOK, dto.JSONResponse{
			Success: true,
			Message: "Kredensial SSO valid, lanjutkan verifikasi Google Authenticator",
			Data: map[string]any{
				"username":   user.Username,
				"nama":       user.NamaPetugas,
				"role":       role,
				"needsSetup": needsSetup,
				"otpSecret":  otpSecret,
				"otpAuthUrl": otpAuthURL,
			},
		})
		return
	}

	// 2. JIKA ROLE SELAIN ADMIN (Dokter / Pegawai): Langsung terbitkan token JWT di sini!
	token, err := utils.GenerateToken(user.Username, user.NamaPetugas, role)
	if err != nil {
		SendJSON(w, http.StatusInternalServerError, dto.JSONResponse{Success: false, Error: "Gagal membuat token sesi"})
		return
	}

	h.RecordAudit(r, "LOGIN_SSO", "-", user.Username, fmt.Sprintf("Login berhasil (%s - Role: %s)", user.NamaPetugas, role))

	SendJSON(w, http.StatusOK, dto.JSONResponse{
		Success: true,
		Message: "Login SSO berhasil",
		Data: map[string]any{
			"token":    token, //  Token JWT dikirim ke frontend agar lolos middleware
			"username": user.Username,
			"nama":     user.NamaPetugas,
			"role":     role,
		},
	})
}

// HandleVerifyOTP memvalidasi kode 6 digit Google Authenticator tahap 2 dan menerbitkan JWT
func (h *MCUHandler) HandleVerifyOTP(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		SendJSON(w, http.StatusMethodNotAllowed, dto.JSONResponse{Success: false, Error: "Method tidak didukung"})
		return
	}

	r.Body = http.MaxBytesReader(w, r.Body, 1<<20)
	var req otpVerifyRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		SendJSON(w, http.StatusBadRequest, dto.JSONResponse{Success: false, Error: "Format JSON tidak valid"})
		return
	}

	cleanUser := strings.ToLower(strings.TrimSpace(req.Username))
	cleanCode := strings.TrimSpace(req.OtpCode)

	if cleanUser == "" || len(cleanCode) != 6 {
		SendJSON(w, http.StatusBadRequest, dto.JSONResponse{Success: false, Error: "Masukkan 6 digit kode Google Authenticator"})
		return
	}

	var user model.AdminUser
	if err := h.db.Where("LOWER(username) = ?", cleanUser).First(&user).Error; err != nil {
		SendJSON(w, http.StatusUnauthorized, dto.JSONResponse{Success: false, Error: "Akun tidak ditemukan"})
		return
	}

	if strings.TrimSpace(user.OtpSecret) == "" {
		SendJSON(w, http.StatusBadRequest, dto.JSONResponse{Success: false, Error: "Google Authenticator belum dikonfigurasi untuk akun ini"})
		return
	}

	valid := totp.Validate(cleanCode, user.OtpSecret)
	if !valid {
		SendJSON(w, http.StatusUnauthorized, dto.JSONResponse{Success: false, Error: "Kode 6 digit salah atau sudah kedaluwarsa"})
		return
	}

	role := user.Role
	if role == "" {
		role = "pegawai"
	}

	token, err := utils.GenerateToken(user.Username, user.NamaPetugas, role)
	if err != nil {
		SendJSON(w, http.StatusInternalServerError, dto.JSONResponse{Success: false, Error: "Gagal membuat token sesi"})
		return
	}

	h.RecordAudit(r, "LOGIN_2FA", "-", user.Username, fmt.Sprintf("Login berhasil (%s - Role: %s)", user.NamaPetugas, role))

	SendJSON(w, http.StatusOK, dto.JSONResponse{
		Success: true,
		Message: "Autentikasi 2FA berhasil",
		Data: map[string]any{
			"token":    token,
			"username": user.Username,
			"nama":     user.NamaPetugas,
			"role":     role,
		},
	})
}

type resetPasswordRequest struct {
	Token       string `json:"token"`
	NewPassword string `json:"newPassword"`
}

func generateResetTokenPair() (rawToken string, tokenHash string, err error) {
	b := make([]byte, 32)
	if _, err = rand.Read(b); err != nil {
		return "", "", err
	}
	rawToken = hex.EncodeToString(b)
	sum := sha256.Sum256([]byte(rawToken))
	tokenHash = hex.EncodeToString(sum[:])
	return rawToken, tokenHash, nil
}

func sendResetPasswordEmail(toEmail, namaPetugas, username, resetLink string) error {
	smtpHost := strings.TrimSpace(os.Getenv("SMTP_HOST"))
	if smtpHost == "" {
		smtpHost = "smtp.gmail.com"
	}
	smtpPort := strings.TrimSpace(os.Getenv("SMTP_PORT"))
	if smtpPort == "" {
		smtpPort = "587"
	}
	smtpUser := strings.TrimSpace(os.Getenv("SMTP_USER"))
	smtpPass := strings.TrimSpace(os.Getenv("SMTP_PASS"))
	smtpFrom := strings.TrimSpace(os.Getenv("SMTP_FROM"))
	if smtpFrom == "" {
		smtpFrom = smtpUser
	}

	if smtpUser == "" || smtpPass == "" {
		return fmt.Errorf("konfigurasi SMTP_USER atau SMTP_PASS belum diisi di environment")
	}

	displayName := strings.TrimSpace(namaPetugas)
	if displayName == "" {
		displayName = username
	}

	subject := "Pengaturan Ulang Kata Sandi - SIM MCU PT Pusri Palembang"
	body := fmt.Sprintf(
		"Halo %s (%s),\r\n\r\n"+
			"Kami menerima permintaan untuk mengatur ulang kata sandi akun Sistem Informasi Medical Check Up (MCU) PT Pusri Palembang Anda.\r\n\r\n"+
			"Silakan buka tautan berikut untuk membuat kata sandi baru (berlaku selama 15 menit):\r\n"+
			"%s\r\n\r\n"+
			"Jika Anda tidak merasa meminta pengaturan ulang kata sandi ini, silakan abaikan email ini.\r\n\r\n"+
			"Hormat kami,\r\n"+
			displayName, username, resetLink,
	)

	msg := []byte(fmt.Sprintf(
		"From: %s\r\nTo: %s\r\nSubject: %s\r\nMIME-Version: 1.0\r\nContent-Type: text/plain; charset=\"UTF-8\"\r\n\r\n%s",
		smtpFrom, toEmail, subject, body,
	))

	auth := smtp.PlainAuth("", smtpUser, smtpPass, smtpHost)
	return smtp.SendMail(smtpHost+":"+smtpPort, auth, smtpUser, []string{toEmail}, msg)
}

func (h *MCUHandler) HandleForgotPassword(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		SendJSON(w, http.StatusMethodNotAllowed, dto.JSONResponse{Success: false, Error: "Method tidak didukung"})
		return
	}

	r.Body = http.MaxBytesReader(w, r.Body, 1<<20)
	var req forgotPasswordRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		SendJSON(w, http.StatusBadRequest, dto.JSONResponse{Success: false, Error: "Format JSON tidak valid"})
		return
	}

	cleanEmail := strings.TrimSpace(req.Email)
	if cleanEmail == "" || !strings.Contains(cleanEmail, "@") || !strings.Contains(cleanEmail, ".") {
		SendJSON(w, http.StatusBadRequest, dto.JSONResponse{Success: false, Error: "Masukkan alamat email yang valid"})
		return
	}

	user, err := h.adminRepo.FindUserByEmailForReset(cleanEmail)
	if err == nil && user.ID > 0 {
		rawToken, tokenHash, errToken := generateResetTokenPair()
		if errToken != nil {
			log.Printf("[AUTH][FORGOT_PASSWORD] Gagal generate token untuk %s: %v\n", cleanEmail, errToken)
		} else {
			prt := &model.PasswordResetToken{
				UserID:    user.ID,
				TokenHash: tokenHash,
				ExpiresAt: time.Now().Add(15 * time.Minute),
			}
			if errSave := h.adminRepo.CreatePasswordResetToken(prt); errSave != nil {
				log.Printf("[AUTH][FORGOT_PASSWORD] Gagal simpan token ke DB: %v\n", errSave)
			} else {
				baseResetURL := strings.TrimSpace(os.Getenv("FRONTEND_RESET_URL"))
				if baseResetURL == "" {
					baseResetURL = "http://localhost:3000/login"
				}
				resetLink := fmt.Sprintf("%s?reset_token=%s", baseResetURL, rawToken)

				go func(targetEmail, nama, uname, link string) {
					if errMail := sendResetPasswordEmail(targetEmail, nama, uname, link); errMail != nil {
						log.Printf("[AUTH][SMTP_ERROR] Gagal kirim email reset ke %s: %v\n", targetEmail, errMail)
					} else {
						log.Printf("[AUTH][SMTP_SENT] Email reset password berhasil dikirim ke %s (user: %s)\n", targetEmail, uname)
					}
				}(cleanEmail, user.NamaPetugas, user.Username, resetLink)
			}
		}
	} else {
		log.Printf("[AUTH][FORGOT_PASSWORD] Permintaan reset untuk email '%s' (tidak terdaftar pada akun dokter/pegawai aktif).\n",
			cleanEmail)
	}

	SendJSON(w, http.StatusOK, dto.JSONResponse{
		Success: true,
		Message: "Jika email terdaftar pada sistem, pemberitahuan dan instruksi pemulihan kata sandi telah dikirimkan.",
	})
}

func (h *MCUHandler) HandleResetPassword(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		SendJSON(w, http.StatusMethodNotAllowed, dto.JSONResponse{Success: false, Error: "Method tidak didukung"})
		return
	}

	r.Body = http.MaxBytesReader(w, r.Body, 1<<20)
	var req resetPasswordRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		SendJSON(w, http.StatusBadRequest, dto.JSONResponse{Success: false, Error: "Format JSON tidak valid"})
		return
	}

	rawToken := strings.TrimSpace(req.Token)
	if rawToken == "" {
		SendJSON(w, http.StatusBadRequest, dto.JSONResponse{Success: false, Error: "Token pengaturan ulang tidak ditemukan"})
		return
	}

	if len(req.NewPassword) < 8 {
		SendJSON(w, http.StatusBadRequest, dto.JSONResponse{Success: false, Error: "Kata sandi baru minimal 8 karakter"})
		return
	}

	sum := sha256.Sum256([]byte(rawToken))
	tokenHash := hex.EncodeToString(sum[:])

	prt, err := h.adminRepo.FindValidPasswordResetToken(tokenHash)
	if err != nil {
		SendJSON(w, http.StatusBadRequest, dto.JSONResponse{Success: false, Error: "Tautan pengaturan ulang tidak valid atau sudah kedaluwarsa"})
		return
	}

	hashedPw, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		SendJSON(w, http.StatusInternalServerError, dto.JSONResponse{Success: false, Error: "Gagal memproses kata sandi baru"})
		return
	}

	if err := h.adminRepo.CompletePasswordReset(prt.UserID, prt.ID, string(hashedPw)); err != nil {
		SendJSON(w, http.StatusInternalServerError, dto.JSONResponse{Success: false, Error: "Gagal memperbarui kata sandi"})
		return
	}

	h.RecordAudit(r, "RESET_PASSWORD", "-", fmt.Sprintf("%d", prt.UserID), "Berhasil mengatur ulang kata sandi melalui tautan email")

	SendJSON(w, http.StatusOK, dto.JSONResponse{
		Success: true,
		Message: "Kata sandi berhasil diperbarui. Silakan masuk menggunakan kata sandi baru Anda.",
	})
}
