package repository

import (
	"backend_mcu/model"

	"gorm.io/gorm"
)

type DoctorRepository struct {
	db *gorm.DB
}

func NewDoctorRepository(db *gorm.DB) *DoctorRepository {
	return &DoctorRepository{db: db}
}

func (r *DoctorRepository) FindAllActiveDoctors() ([]model.Doctor, error) {
	var doctors []model.Doctor
	err := r.db.Where("is_active = ?", true).Order("nama ASC").Find(&doctors).Error
	return doctors, err
}
