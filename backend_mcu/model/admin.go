package model

import "time"

type AdminUser struct {
	ID           uint   `gorm:"primaryKey;column:id"`
	Username     string `gorm:"column:username"`
	PasswordHash string `gorm:"column:password_hash"`
	NamaPetugas  string `gorm:"column:nama_petugas"`
	Role         string `json:"role"`
}

func (AdminUser) TableName() string { return "admin_users" }

type AuditLog struct {
	ID              uint      `gorm:"primaryKey;column:id;autoIncrement"`
	AdminUsername   string    `gorm:"type:varchar(50);not null;column:admin_username" json:"adminUsername"`
	Aksi            string    `gorm:"type:varchar(20);not null;column:aksi" json:"aksi"`
	BadgeTerkait    string    `gorm:"type:varchar(20);column:badge_terkait" json:"badgeTerkait"`
	RecordID        string    `gorm:"type:varchar(64);column:record_id" json:"recordId"`
	DetailPerubahan string    `gorm:"type:text;column:detail_perubahan" json:"detailPerubahan"`
	IpAddress       string    `gorm:"type:varchar(45);column:ip_address" json:"ipAddress"`
	Waktu           time.Time `gorm:"autoCreateTime;column:waktu" json:"waktu"`
}

func (AuditLog) TableName() string { return "audit_logs" }
