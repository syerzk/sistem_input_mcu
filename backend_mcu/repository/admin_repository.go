package repository

import (
	"backend_mcu/model"

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
