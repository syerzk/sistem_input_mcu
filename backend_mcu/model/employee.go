package model

import "time"

type Employee struct {
	ID           uint      `gorm:"primaryKey;autoIncrement;column:id" json:"id"`
	Badge        string    `gorm:"type:varchar(20);not null;uniqueIndex;column:badge" json:"badge"`
	Nama         string    `gorm:"type:varchar(150);not null;column:nama" json:"nama"`
	JenisKelamin string    `gorm:"type:varchar(5);column:jenis_kelamin" json:"jenisKelamin"`
	Umur         int       `gorm:"column:umur" json:"umur"`
	GolDarah     string    `gorm:"type:varchar(10);column:gol_darah" json:"golDarah"`
	Shift        string    `gorm:"type:varchar(10);column:shift" json:"shift"`
	Bagian       string    `gorm:"type:varchar(100);column:bagian" json:"bagian"`
	CreatedAt    time.Time `gorm:"autoCreateTime;column:created_at" json:"createdAt"`
	UpdatedAt    time.Time `gorm:"autoUpdateTime;column:updated_at" json:"updatedAt"`
}

func (Employee) TableName() string { return "employees" }
