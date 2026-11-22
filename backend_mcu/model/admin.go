package model

import "time"

type AdminUser struct {
	ID           uint   `gorm:"primaryKey;column:id"`
	Username     string `gorm:"column:username"`
	Email        string `gorm:"type:varchar(150);column:email" json:"email"`
	PasswordHash string `gorm:"column:password_hash"`
	NamaPetugas  string `gorm:"column:nama_petugas"`
	Role         string `json:"role"`
	OtpSecret    string `gorm:"type:varchar(100);column:otp_secret" json:"-"`
	IsActive     bool   `gorm:"default:true;column:is_active" json:"isActive"`
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

type PasswordResetToken struct {
	ID        uint       `gorm:"primaryKey;autoIncrement;column:id"`
	UserID    uint       `gorm:"not null;index;column:user_id"`
	TokenHash string     `gorm:"type:varchar(128);not null;uniqueIndex;column:token_hash"`
	ExpiresAt time.Time  `gorm:"not null;column:expires_at"`
	UsedAt    *time.Time `gorm:"column:used_at"`
	CreatedAt time.Time  `gorm:"autoCreateTime;column:created_at"`
}

func (PasswordResetToken) TableName() string { return "password_reset_tokens" }