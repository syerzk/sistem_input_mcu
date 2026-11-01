package repository

import (
	"backend_mcu/model"

	"gorm.io/gorm"
)

type MCURepository struct {
	db *gorm.DB
}

func NewMCURepository(db *gorm.DB) *MCURepository {
	return &MCURepository{db: db}
}

func (r *MCURepository) FindMainRecordByID(id uint) (model.MCURecord, error) {
	var record model.MCURecord
	err := r.db.Where("id = ?", id).First(&record).Error
	return record, err
}

func (r *MCURepository) FindMainRecordByBadgeAndYear(badge string, testTahun int, isSpouse bool) (model.MCURecord, error) {
	var record model.MCURecord

	// Cari dulu employee berdasarkan badge
	var emp model.Employee
	if err := r.db.Where("badge = ?", badge).First(&emp).Error; err != nil {
		return record, err
	}

	patientType := "EMPLOYEE"
	if isSpouse {
		patientType = "SPOUSE"
	}

	// Cari mcu_record yang terikat ke employee_id dan tahun tersebut
	err := r.db.Where("employee_id = ? AND test_tahun = ? AND patient_type = ?", emp.ID, testTahun, patientType).First(&record).Error
	return record, err
}

func (r *MCURepository) FindAllRecords() ([]model.MCURecord, error) {
	var records []model.MCURecord
	err := r.db.Preload("Employee").Order("test_tahun DESC, created_at DESC").Limit(100).Find(&records).Error
	return records, err
}

func (r *MCURepository) GetMCUDetails(mcuRecordID uint) (model.MCUUmum, model.MCUFisik, model.MCUFisik2, model.MCULab, model.MCUKimia, model.MCUSaranDokter) {
	var umum model.MCUUmum
	var fisik model.MCUFisik
	var fisik2 model.MCUFisik2
	var lab model.MCULab
	var kimia model.MCUKimia
	var saran model.MCUSaranDokter

	r.db.Where("mcu_record_id = ?", mcuRecordID).First(&umum)
	r.db.Where("mcu_record_id = ?", mcuRecordID).First(&fisik)
	r.db.Where("mcu_record_id = ?", mcuRecordID).First(&fisik2)
	r.db.Where("mcu_record_id = ?", mcuRecordID).First(&lab)
	r.db.Where("mcu_record_id = ?", mcuRecordID).First(&kimia)
	r.db.Where("mcu_record_id = ?", mcuRecordID).First(&saran)

	return umum, fisik, fisik2, lab, kimia, saran
}

func (r *MCURepository) DeleteMCUData(id string) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		_ = tx.Where("mcu_record_id = ?", id).Delete(&model.MCUUmum{}).Error
		_ = tx.Where("mcu_record_id = ?", id).Delete(&model.MCUFisik{}).Error
		_ = tx.Where("mcu_record_id = ?", id).Delete(&model.MCUFisik2{}).Error
		_ = tx.Where("mcu_record_id = ?", id).Delete(&model.MCULab{}).Error
		_ = tx.Where("mcu_record_id = ?", id).Delete(&model.MCUKimia{}).Error
		_ = tx.Where("mcu_record_id = ?", id).Delete(&model.MCUSaranDokter{}).Error
		_ = tx.Where("id = ?", id).Delete(&model.MCURecord{}).Error
		return nil
	})
}
