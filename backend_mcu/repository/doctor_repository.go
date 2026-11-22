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

func (r *DoctorRepository) FindAllDoctors() ([]model.Doctor, error) {
	var doctors []model.Doctor
	err := r.db.Order("is_active DESC, nama ASC").Find(&doctors).Error
	return doctors, err
}

func (r *DoctorRepository) FindDoctorByID(id uint) (model.Doctor, error) {
	var doctor model.Doctor
	err := r.db.Where("id = ?", id).First(&doctor).Error
	return doctor, err
}

func (r *DoctorRepository) CreateDoctor(doctor *model.Doctor) error {
	return r.db.Create(doctor).Error
}
func (r *DoctorRepository) UpdateDoctor(doctor *model.Doctor) error {
	return r.db.Save(doctor).Error
}

func (r *DoctorRepository) DeleteDoctor(id uint) error {
	return r.db.Where("id = ?", id).Delete(&model.Doctor{}).Error
}
