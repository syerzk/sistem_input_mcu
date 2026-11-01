package model

import "time"

type Spouse struct {
	ID           uint      `gorm:"primaryKey;autoIncrement;column:id" json:"id"`
	EmployeeID   uint      `gorm:"not null;column:employee_id" json:"employeeId"`
	Nama         string    `gorm:"type:varchar(150);not null;column:nama" json:"nama"`
	JenisKelamin string    `gorm:"type:varchar(5);column:jenis_kelamin" json:"jenisKelamin"`
	Umur         int       `gorm:"column:umur" json:"umur"`
	GolDarah     string    `gorm:"type:varchar(10);column:gol_darah" json:"golDarah"`
	IsActive     bool      `gorm:"default:true;column:is_active" json:"isActive"`
	CreatedAt    time.Time `gorm:"autoCreateTime;column:created_at" json:"createdAt"`
	UpdatedAt    time.Time `gorm:"autoUpdateTime;column:updated_at" json:"updatedAt"`
}

func (Spouse) TableName() string { return "spouses" }
