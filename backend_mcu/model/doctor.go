package model

import "time"

type Doctor struct {
	ID        uint      `gorm:"primaryKey;autoIncrement;column:id" json:"id"`
	Nama      string    `gorm:"type:varchar(150);not null;column:nama" json:"nama"`
	Spesialis string    `gorm:"type:varchar(100);column:spesialis" json:"spesialis"`
	IsActive  bool      `gorm:"default:true;column:is_active" json:"isActive"`
	CreateAt  time.Time `gorm:"autoCreateTime;column:created_at" json:"createdAt"`
	UpdateAt  time.Time `gorm:"autoUpdateTime;column:updated_at" json:"updatedAt"`
}

func (Doctor) TabelName() string { return "doctors" }
