# Sistem Informasi Medical Check Up (MCU) 

Aplikasi input dan manajemen rekam medis Medical Check Up (MCU) karyawan dan pasangan berbasis web yang terintegrasi dengan backend Golang dan database PostgreSQL.

## Tech Stack
- Frontend: React, TypeScript, Vite, Tailwind CSS
- Backend: Golang, GORM
- Database: PostgreSQL
- Containerization: Docker & Docker Compose
- Web Server: Nginx

## Prasyarat
- Docker Desktop terinstall dan berjalan

## Cara Menjalankan Aplikasi
1. Clone repository:
   git clone <https://github.com/syerzk/sistem_input_mcu.git>
   cd mcu_karyawan_pusri

2. Jalankan container dengan Docker Compose:
   docker compose up -d --build

3. Akses aplikasi:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080/api
   - PostgreSQL DB: localhost:5432

## Environment Variables
Buat file .env di dalam folder backend_mcu/ berdasarkan file .env.example:
- PORT
- PG_HOST
- PG_PORT
- PG_USER
- PG_PASSWORD
- PG_NAME

## Daftar Endpoint API Utama
- GET /api/health - Cek status koneksi database
- POST /api/auth/verify-pin - Verifikasi PIN Admin (Body: pin)
- POST /api/auth/change-pin - Ubah PIN Admin (Body: oldPin, newPin)
- GET /api/records - Ambil seluruh data rekam medis (Query: ?tahun=2026&is_spouse=false)
- GET /api/records/badge/:badge - Ambil data rekam medis per Badge (Query: ?tahun=2026)
- POST /api/records - Simpan atau perbarui data rekam medis
- DELETE /api/records/:id - Hapus data rekam medis berdasarkan ID
- GET /api/doctors - Ambil daftar dokter pemeriksa
- POST /api/mysql/sync-badges - Sinkronisasi master data badge karyawan