package model

import "time"

type MCURecord struct {
	ID          uint   `gorm:"primaryKey;autoIncrement;column:id" json:"id"`
	TestTahun   int    `gorm:"not null;column:test_tahun" json:"testTahun"`
	PatientType string `gorm:"type:varchar(10);column:patient_type" json:"patientType"`
	EmployeeID  uint   `gorm:"not null;column:employee_id" json:"employeeId"`
	Employee    Employee `gorm:"foreignKey:EmployeeID;references:ID" json:"-"`
	SpouseID    *uint  `gorm:"column:spouse_id" json:"spouseId,omitempty"`

	Tanggal              string     `gorm:"type:varchar(30);column:tanggal" json:"tanggal"`
	Umur                 int        `gorm:"column:umur" json:"umur"`
	GolDarah             string     `gorm:"type:varchar(10);column:gol_darah" json:"golDarah"`
	Shift                string     `gorm:"type:varchar(10);column:shift" json:"shift"`
	Bagian               string     `gorm:"type:varchar(100);column:bagian" json:"bagian"`
	Dokter               string     `gorm:"type:varchar(100);column:dokter" json:"dokter"`
	JenisKelamin         string     `gorm:"type:varchar(5);column:jenis_kelamin" json:"jenisKelamin"`
	PeriodeMCU           string     `gorm:"type:varchar(50);column:periode_mcu" json:"periodeMCU"`
	TanggalMCUBerikutnya string     `gorm:"type:varchar(50);column:tanggal_mcu_berikutnya" json:"tanggalMCUBerikutnya"`
	HasilPemkes          string     `gorm:"type:varchar(50);column:hasil_pemkes" json:"hasilPemkes"`
	CreatedAt            *time.Time `gorm:"autoCreateTime;column:created_at" json:"createdAt,omitempty"`
	UpdatedAt            *time.Time `gorm:"autoUpdateTime;column:updated_at" json:"updatedAt,omitempty"`
}

func (MCURecord) TableName() string { return "mcu_records" }
