package repository

import (
	"backend_mcu/model"
	"time"

	"gorm.io/gorm"
)

type AdminRepository struct {
	db *gorm.DB
}

func NewAdminRepository(db *gorm.DB) *AdminRepository {
	return &AdminRepository{db: db}
}

func (r *AdminRepository) GetAdminByUsername(username string) (model.AdminUser, error) {
	var admin model.AdminUser
	err := r.db.Where("username = ?", username).First(&admin).Error
	return admin, err
}

func (r *AdminRepository) UpdateAdminPassword(username, newPin string) error {
	return r.db.Model(&model.AdminUser{}).Where("username = ?", username).Update("password_hash", newPin).Error
}

func (r *AdminRepository) CreateAuditLog(logEntry model.AuditLog) error {
	return r.db.Create(&logEntry).Error
}

func (r *AdminRepository) FindUserByEmailForReset(email string) (model.AdminUser, error) {
	var user model.AdminUser
	err := r.db.
		Where("LOWER(TRIM(email)) = LOWER(TRIM(?)) AND role IN ('dokter', 'pegawai') AND is_active = ?", email, true).
		First(&user).Error
	return user, err
}

func (r *AdminRepository) CreatePasswordResetToken(token *model.PasswordResetToken) error {
	// Nonaktifkan token lama milik user ini yang belum terpakai agar hanya token terbaru yang berlaku
	now := time.Now()
	_ = r.db.Model(&model.PasswordResetToken{}).
		Where("user_id = ? AND used_at IS NULL", token.UserID).
		Update("used_at", now).Error

	return r.db.Create(token).Error
}

func (r *AdminRepository) FindValidPasswordResetToken(tokenHash string) (model.PasswordResetToken, error) {
	var prt model.PasswordResetToken
	err := r.db.
		Where("token_hash = ? AND used_at IS NULL AND expires_at > ?", tokenHash, time.Now()).
		First(&prt).Error
	return prt, err
}

func (r *AdminRepository) CompletePasswordReset(userID uint, tokenID uint, newPasswordHash string) error {
	now := time.Now()
	tx := r.db.Begin()

	if err := tx.Model(&model.AdminUser{}).
		Where("id = ? AND role IN ('dokter', 'pegawai') AND is_active = ?", userID, true).
		Update("password_hash", newPasswordHash).Error; err != nil {
		tx.Rollback()
		return err
	}

	if err := tx.Model(&model.PasswordResetToken{}).
		Where("id = ?", tokenID).
		Update("used_at", now).Error; err != nil {
		tx.Rollback()
		return err
	}

	return tx.Commit().Error
}
