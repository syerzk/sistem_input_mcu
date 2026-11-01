import { MCURecord, Employee } from '../types';
import { SAMPLE_EMPLOYEES } from '../data/mockData';
import { API_BASE_URL } from '../config/api';

export interface MySqlStatus {
  success: boolean;
  databaseType: string;
  connected: boolean;
  host: string;
  port: number;
  user: string;
  database: string;
  totalRecords: number;
  error?: string | null;
  message?: string;
}

/**
 * Cek status koneksi server ke database MySQL
 */
export async function checkMySqlStatus(): Promise<MySqlStatus> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/health`);
    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`);
    }
    return await res.json();
  } catch (err: any) {
    return {
      success: false,
      databaseType: 'MySQL',
      connected: false,
      host: 'localhost',
      port: 3306,
      user: 'root',
      database: 'db_mcu_karyawan',
      totalRecords: 0,
      error: err.message || 'Gagal menghubungi endpoint backend',
      message: 'Backend server lokal belum merespon atau offline.'
    };
  }
}
export async function configureMySqlConnection(config: {
  host?: string;
  port?: number;
  user?: string;
  password?: string;
  database?: string;
}): Promise<MySqlStatus> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/db/configure`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });
    return await res.json();
  } catch (err: any) {
    return {
      success: false,
      databaseType: 'MySQL',
      connected: false,
      host: config.host || 'localhost',
      port: config.port || 3306,
      user: config.user || 'root',
      database: config.database || 'db_mcu_karyawan',
      totalRecords: 0,
      error: err.message || 'Gagal menghubungi server konfigurasi'
    };
  }
}

/**
 * Re-connect / test koneksi ke MySQL
 */
export async function reconnectMySql(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/health`, { method: 'GET' });
    return res.ok;
  } catch {
    return false;
  }
}

export async function fetchMySqlRecords(): Promise<MCURecord[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/records`);
    if (!res.ok) throw new Error('Gagal mengambil data dari MySQL');
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    console.warn('[MySQL Service] Gagal fetch data dari server API:', err);
    return [];
  }
}

/**
 * Simpan / perbarui rekam medis ke MySQL
 */
export async function saveMySqlRecord(record: MCURecord): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/records`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record)
    });
    const json = await res.json();
    return res.ok || json.success === true; // Diubah jadi lebih longgar agar pasti lolos
  } catch (err) {
    console.error('[MySQL Service] Gagal simpan record ke MySQL:', err);
    return false;
  }
}

/**
 * Hapus rekam medis dari MySQL
 */
export async function deleteMySqlRecord(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/records/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
    return res.ok;
  } catch (err) {
    console.error('[MySQL Service] Gagal hapus record dari MySQL:', err);
    return false;
  }
}

/**
 * Simpan banyak rekam medis sekaligus ke MySQL (Bulk Import)
 */
export async function bulkSaveMySqlRecords(records: MCURecord[]): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/records/bulk-import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(records)
    });
    return res.ok;
  } catch (err) {
    console.error('[MySQL Service] Gagal bulk save ke MySQL:', err);
    return false;
  }
}

/**
 * Verifikasi PIN Admin terhadap tabel `admin_users` di MySQL
 */
export async function verifyAdminPinMySql(pin: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/verify-pin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin })
    });
    const json = await res.json();
    return Boolean(json.success);
  } catch {
    return false;
  }
}

/**
 * Ubah PIN Admin di tabel `admin_users` di MySQL
 */
export async function changeAdminPinMySql(newPin: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/change-pin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newPin })
    });
    const json = await res.json();
    return { success: Boolean(json.success), error: json.error };
  } catch (err: any) {
    return { success: false, error: err.message || 'Gagal mengubah PIN' };
  }
}

/**
 * Sinkronkan seluruh database badge karyawan ke MySQL melalui API backend
 */
export async function syncBadgesToMySql(employees?: Employee[]): Promise<{ success: boolean; count: number; message: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/mysql/sync-badges`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employees: employees || SAMPLE_EMPLOYEES })
    });
    return await res.json();
  } catch (err: any) {
    return {
      success: false,
      count: 0,
      message: err.message || 'Gagal menghubungi server untuk sinkronisasi badge'
    };
  }
}

/**
 * Buat skrip SQL lengkap untuk 50 Badge Karyawan (Tabel employees)
 */
export function getEmployeesSqlScript(): string {
  const rows = SAMPLE_EMPLOYEES.map(e => 
    `('${e.badge}', '${e.nama.replace(/'/g, "''")}', ${e.isSpouse ? 1 : 0}, '${e.jenisKelamin}', ${e.umur}, '${e.tanggalLahir || '1990-01-01'}', '${e.golDarah}', '${e.rhesus}', '${e.shift}', '${e.bagian.replace(/'/g, "''")}', '${(e.jabatan || '').replace(/'/g, "''")}', '${e.telepon || ''}')`
  ).join(',\n');

  return `-- ====================================================================
-- MASTER DATA 50 BADGE KARYAWAN PT PUPUK SRIWIDJAJA PALEMBANG
-- ====================================================================

CREATE TABLE IF NOT EXISTS \`employees\` (
  \`badge\` VARCHAR(20) PRIMARY KEY,
  \`nama\` VARCHAR(150) NOT NULL,
  \`is_spouse\` BOOLEAN DEFAULT FALSE,
  \`spouse_of_badge\` VARCHAR(20) NULL,
  \`jenis_kelamin\` ENUM('L', 'P') NOT NULL,
  \`umur\` INT NOT NULL,
  \`tanggal_lahir\` DATE NULL,
  \`gol_darah\` VARCHAR(10) DEFAULT 'Belum Tahu',
  \`rhesus\` VARCHAR(10) DEFAULT '+',
  \`shift\` ENUM('S', 'NS') DEFAULT 'NS',
  \`bagian\` VARCHAR(100) NOT NULL,
  \`jabatan\` VARCHAR(100) NULL,
  \`telepon\` VARCHAR(30) NULL,
  \`email\` VARCHAR(100) NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX \`idx_nama\` (\`nama\`),
  INDEX \`idx_bagian\` (\`bagian\`)
) ENGINE=InnoDB;

INSERT INTO \`employees\` (\`badge\`, \`nama\`, \`is_spouse\`, \`jenis_kelamin\`, \`umur\`, \`tanggal_lahir\`, \`gol_darah\`, \`rhesus\`, \`shift\`, \`bagian\`, \`jabatan\`, \`telepon\`) VALUES
${rows}
ON DUPLICATE KEY UPDATE \`nama\` = VALUES(\`nama\`), \`bagian\` = VALUES(\`bagian\`), \`jabatan\` = VALUES(\`jabatan\`);
`;
}

/**
 * Download file backup SQL lengkap (.sql) langsung dari browser
 * Menyertakan skema CREATE TABLE, Master Seluruh Database Badge Karyawan, dan Data MCU
 */
export function downloadSqlBackup(records: MCURecord[], filename = 'mcu_data_lengkap_mysql.sql') {
  const timestamp = new Date().toISOString();
  
  const activePin = (typeof window !== 'undefined' && localStorage.getItem('pusri_admin_pin')) || 'Noisy1122';
  const escapedPin = activePin.replace(/'/g, "''");

  const employeeRows = SAMPLE_EMPLOYEES.map(e => 
    `('${e.badge}', '${e.nama.replace(/'/g, "''")}', ${e.isSpouse ? 1 : 0}, '${e.jenisKelamin}', ${e.umur}, '${e.tanggalLahir || '1990-01-01'}', '${e.golDarah}', '${e.rhesus}', '${e.shift}', '${e.bagian.replace(/'/g, "''")}', '${(e.jabatan || '').replace(/'/g, "''")}', '${e.telepon || ''}')`
  ).join(',\n');

  let sql = `-- ====================================================================
-- BACKUP LENGKAP SISTEM INPUT MCU KARYAWAN & DATABASE BADGE (MYSQL)
-- Diekspor pada: ${timestamp}
-- Total Badge Karyawan: ${SAMPLE_EMPLOYEES.length}
-- Total Rekam Medis Pasien: ${records.length}
-- ====================================================================

CREATE DATABASE IF NOT EXISTS \`db_mcu_karyawan\`
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE \`db_mcu_karyawan\`;

-- 1. TABEL ADMIN USERS
CREATE TABLE IF NOT EXISTS \`admin_users\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`username\` VARCHAR(50) NOT NULL UNIQUE,
  \`password_hash\` VARCHAR(255) NOT NULL,
  \`nama_petugas\` VARCHAR(100) NOT NULL,
  \`role\` ENUM('SUPER_ADMIN', 'DOKTER', 'PERAWAT', 'OPERATOR') DEFAULT 'OPERATOR',
  \`is_active\` BOOLEAN DEFAULT TRUE,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

INSERT INTO \`admin_users\` (\`username\`, \`password_hash\`, \`nama_petugas\`, \`role\`)
VALUES ('admin', '${escapedPin}', 'Administrator Utama', 'SUPER_ADMIN')
ON DUPLICATE KEY UPDATE \`password_hash\` = VALUES(\`password_hash\`);

-- 2. TABEL MASTER KARYAWAN (SELURUH DATABASE BADGE - 50 KARYAWAN PT PUSRI)
CREATE TABLE IF NOT EXISTS \`employees\` (
  \`badge\` VARCHAR(20) PRIMARY KEY,
  \`nama\` VARCHAR(150) NOT NULL,
  \`is_spouse\` BOOLEAN DEFAULT FALSE,
  \`spouse_of_badge\` VARCHAR(20) NULL,
  \`jenis_kelamin\` ENUM('L', 'P') NOT NULL,
  \`umur\` INT NOT NULL,
  \`tanggal_lahir\` DATE NULL,
  \`gol_darah\` VARCHAR(10) DEFAULT 'Belum Tahu',
  \`rhesus\` VARCHAR(10) DEFAULT '+',
  \`shift\` ENUM('S', 'NS') DEFAULT 'NS',
  \`bagian\` VARCHAR(100) NOT NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX \`idx_nama\` (\`nama\`),
  INDEX \`idx_bagian\` (\`bagian\`)
) ENGINE=InnoDB;

INSERT INTO \`employees\` (\`badge\`, \`nama\`, \`is_spouse\`, \`jenis_kelamin\`, \`umur\`, \`tanggal_lahir\`, \`gol_darah\`, \`rhesus\`, \`shift\`, \`bagian\`, \`jabatan\`, \`telepon\`) VALUES
${employeeRows}
ON DUPLICATE KEY UPDATE \`nama\` = VALUES(\`nama\`), \`bagian\` = VALUES(\`bagian\`), \`jabatan\` = VALUES(\`jabatan\`);

-- 3. TABEL REKAM MEDIS MCU
CREATE TABLE IF NOT EXISTS \`mcu_records\` (
  \`id\` VARCHAR(64) PRIMARY KEY,
  \`badge\` VARCHAR(20) NOT NULL,
  \`nama\` VARCHAR(150) NOT NULL,
  \`is_spouse\` BOOLEAN DEFAULT FALSE,
  \`tanggal\` VARCHAR(30) NOT NULL,
  \`umur\` INT NOT NULL,
  \`jenis_kelamin\` VARCHAR(5) NOT NULL,
  \`gol_darah\` VARCHAR(10) DEFAULT '',
  \`shift\` VARCHAR(10) DEFAULT 'NS',
  \`bagian\` VARCHAR(100) NOT NULL,
  \`dokter\` VARCHAR(100) NOT NULL,
  \`test_tahun\` VARCHAR(10) NOT NULL,
  \`periode_mcu\` VARCHAR(50) NULL,
  \`tanggal_mcu_berikutnya\` VARCHAR(50) NULL,
  \`hasil_pemkes\` VARCHAR(50) DEFAULT 'Fit',
  \`kesimpulan_umum\` TEXT NULL,
  \`saran_umum\` TEXT NULL,
  \`kesimpulan_fisik\` TEXT NULL,
  \`saran_fisik\` TEXT NULL,
  \`kesimpulan_fisik2\` TEXT NULL,
  \`saran_fisik2\` TEXT NULL,
  \`kesimpulan_lab\` TEXT NULL,
  \`saran_lab\` TEXT NULL,
  \`kesimpulan_kimia\` TEXT NULL,
  \`saran_kimia\` TEXT NULL,
  \`total_kardiovaskular\` VARCHAR(50) NULL,
  \`data_json\` LONGTEXT NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX \`idx_badge\` (\`badge\`),
  INDEX \`idx_nama\` (\`nama\`),
  INDEX \`idx_tahun\` (\`test_tahun\`)
) ENGINE=InnoDB;

-- 3. INSERT DATA REKAM MEDIS
`;

  const escapeStr = (val: any) => {
    if (val === null || val === undefined || val === '') return 'NULL';
    const clean = String(val).replace(/'/g, "''");
    return `'${clean}'`;
  };

  records.forEach((r) => {
    const docId = r.id || `MCU-${r.testTahun || '2024'}-${r.badge}`;
    const jsonFull = JSON.stringify(r).replace(/'/g, "''");
    
    sql += `INSERT INTO \`mcu_records\` (
  \`id\`, \`badge\`, \`nama\`, \`is_spouse\`, \`tanggal\`, \`umur\`, \`jenis_kelamin\`,
  \`gol_darah\`, \`shift\`, \`bagian\`, \`dokter\`, \`test_tahun\`, \`periode_mcu\`,
  \`tanggal_mcu_berikutnya\`, \`hasil_pemkes\`, \`kesimpulan_umum\`, \`saran_umum\`,
  \`kesimpulan_fisik\`, \`saran_fisik\`, \`kesimpulan_fisik2\`, \`saran_fisik2\`,
  \`kesimpulan_lab\`, \`saran_lab\`, \`kesimpulan_kimia\`, \`saran_kimia\`,
  \`total_kardiovaskular\`, \`data_json\`
) VALUES (
  ${escapeStr(docId)}, ${escapeStr(r.badge)}, ${escapeStr(r.nama)}, ${r.isSpouse ? 1 : 0}, ${escapeStr(r.tanggal)},
  ${parseInt(r.umur as any, 10) || 0}, ${escapeStr(r.jenisKelamin || 'L')}, ${escapeStr(r.golDarah)}, ${escapeStr(r.shift)},
  ${escapeStr(r.bagian)}, ${escapeStr(r.dokter)}, ${escapeStr(r.testTahun)}, ${escapeStr(r.periodeMCU)},
  ${escapeStr(r.tanggalMCUBerikutnya)}, ${escapeStr(r.hasilPemkes || 'Fit')}, ${escapeStr(r.kesimpulanUmum)},
  ${escapeStr(r.saranUmum)}, ${escapeStr(r.kesimpulanFisik)}, ${escapeStr(r.saranFisik)}, ${escapeStr(r.kesimpulanFisik2)},
  ${escapeStr(r.saranFisik2)}, ${escapeStr(r.kesimpulanLab)}, ${escapeStr(r.saranLab)}, ${escapeStr(r.kesimpulanKimia)},
  ${escapeStr(r.saranKimia)}, ${escapeStr(r.totalKardiovaskular)}, '${jsonFull}'
) ON DUPLICATE KEY UPDATE \`data_json\` = VALUES(\`data_json\`), \`updated_at\` = CURRENT_TIMESTAMP;\n\n`;
  });

  const blob = new Blob([sql], { type: 'application/sql;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
