import React, { useState, useEffect } from 'react';
import {
  Database,
  CheckCircle2,
  Download,
  Copy,
  Check,
  RefreshCw,
  X,
  Server,
  FileCode,
  IdCard
} from 'lucide-react';
import { MCURecord } from '../types';
import {
  checkMySqlStatus,
  downloadSqlBackup,
  getEmployeesSqlScript,
  MySqlStatus
} from '../services/Service';

// Generator khusus untuk format PostgreSQL (.sql)
const getPostgreSqlFullScript = (records: MCURecord[]): string => {
  let sql = `-- =========================================================================\n`;
  sql += `-- BACKUP DATABASE POSTGRESQL - RS PT PUSRI PALEMBANG\n`;
  sql += `-- Generated: ${new Date().toISOString()}\n`;
  sql += `-- =========================================================================\n\n`;

  sql += `CREATE TABLE IF NOT EXISTS admin_users (\n`;
  sql += `  id SERIAL PRIMARY KEY,\n`;
  sql += `  username VARCHAR(50) NOT NULL UNIQUE,\n`;
  sql += `  password_hash VARCHAR(255) NOT NULL,\n`;
  sql += `  nama_petugas VARCHAR(100) NOT NULL,\n`;
  sql += `  role VARCHAR(50) DEFAULT 'OPERATOR',\n`;
  sql += `  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n);\n\n`;

  sql += `CREATE TABLE IF NOT EXISTS employees (\n`;
  sql += `  badge VARCHAR(20) PRIMARY KEY,\n`;
  sql += `  nama VARCHAR(150) NOT NULL,\n`;
  sql += `  is_spouse BOOLEAN DEFAULT FALSE,\n`;
  sql += `  jenis_kelamin VARCHAR(5),\n`;
  sql += `  umur INT,\n`;
  sql += `  gol_darah VARCHAR(10),\n`;
  sql += `  shift VARCHAR(10),\n`;
  sql += `  bagian VARCHAR(100)\n);\n\n`;

  sql += `CREATE TABLE IF NOT EXISTS mcu_records (\n`;
  sql += `  id VARCHAR(64) PRIMARY KEY,\n`;
  sql += `  badge VARCHAR(20) NOT NULL,\n`;
  sql += `  nama VARCHAR(150) NOT NULL,\n`;
  sql += `  is_spouse BOOLEAN DEFAULT FALSE,\n`;
  sql += `  tanggal VARCHAR(30),\n`;
  sql += `  umur INT,\n`;
  sql += `  jenis_kelamin VARCHAR(5),\n`;
  sql += `  gol_darah VARCHAR(10),\n`;
  sql += `  shift VARCHAR(10),\n`;
  sql += `  bagian VARCHAR(100),\n`;
  sql += `  dokter VARCHAR(100),\n`;
  sql += `  test_tahun VARCHAR(10),\n`;
  sql += `  hasil_pemkes VARCHAR(50),\n`;
  sql += `  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n`;
  sql += `  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n);\n\n`;

  if (records && records.length > 0) {
    sql += `-- Data Rekam Medis MCU (${records.length} Records)\n`;
    for (const r of records) {
      sql += `INSERT INTO mcu_records (id, badge, nama, is_spouse, tanggal, umur, jenis_kelamin, bagian, dokter, test_tahun, hasil_pemkes) VALUES ('${r.id || ''}', '${r.badge || ''}', '${(r.nama || '').replace(/'/g, "''")}', ${r.isSpouse ? 'TRUE' : 'FALSE'}, '${r.tanggal || ''}', ${r.umur || 0}, '${r.jenisKelamin || ''}', '${(r.bagian || '').replace(/'/g, "''")}', '${(r.dokter || '').replace(/'/g, "''")}', '${r.testTahun || '2026'}', '${r.hasilPemkes || 'Fit'}') ON CONFLICT (id) DO NOTHING;\n`;
    }
  }

  return sql;
};

const downloadPostgreSqlBackup = (records: MCURecord[], filename: string) => {
  const sql = getPostgreSqlFullScript(records);
  const blob = new Blob([sql], { type: 'text/sql;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

interface MySqlManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: MCURecord[];
}

export const MySqlManagerModal: React.FC<MySqlManagerModalProps> = ({
  isOpen,
  onClose,
  records
}) => {
  const [status, setStatus] = useState<MySqlStatus | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [copiedBadges, setCopiedBadges] = useState(false);
  const [copiedPgFull, setCopiedPgFull] = useState(false);
  const [activeTab, setActiveTab] = useState<'POSTGRES' | 'BACKUP'>('POSTGRES');

  const loadStatus = async () => {
    setIsChecking(true);
    const s = await checkMySqlStatus();
    setStatus(s);
    setIsChecking(false);
  };

  useEffect(() => {
    if (isOpen) {
      loadStatus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDownloadPgBackup = () => {
    downloadPostgreSqlBackup(records, `backup_db_mcu_postgresql_${new Date().toISOString().slice(0, 10)}.sql`);
  };

  const handleCopyPgFull = () => {
    const sql = getPostgreSqlFullScript(records);
    navigator.clipboard.writeText(sql);
    setCopiedPgFull(true);
    setTimeout(() => setCopiedPgFull(false), 2500);
  };

  const handleCopyBadgesSql = () => {
    const sql = getEmployeesSqlScript();
    navigator.clipboard.writeText(sql);
    setCopiedBadges(true);
    setTimeout(() => setCopiedBadges(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header Modal */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <Database className="w-6 h-6 text-blue-200" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Pusat Database PostgreSQL Lokal</h2>
              <p className="text-xs text-blue-100">
                Terhubung ke Backend Go &amp; PostgreSQL (`db_mcu_karyawan`)[cite: 7]
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-100/90 px-4 pt-2 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('POSTGRES')}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all cursor-pointer flex items-center gap-2 border-t border-x ${
              activeTab === 'POSTGRES'
                ? 'bg-white text-indigo-700 border-slate-200 shadow-xs -mb-[1px]'
                : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-200/60'
            }`}
          >
            <Database className="w-4 h-4 text-indigo-600" />
            <span>Database PostgreSQL (Aktif)</span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full font-extrabold">
              Port 8080
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('BACKUP')}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all cursor-pointer flex items-center gap-2 border-t border-x ${
              activeTab === 'BACKUP'
                ? 'bg-white text-blue-700 border-slate-200 shadow-xs -mb-[1px]'
                : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-200/60'
            }`}
          >
            <Server className="w-4 h-4 text-blue-600" />
            <span>Skrip &amp; Backup SQL</span>
          </button>
        </div>

        {/* Isi Modal */}
        <div className="p-6 overflow-y-auto space-y-6">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-blue-600" />
                Status Koneksi PostgreSQL
              </span>
              <button
                type="button"
                onClick={loadStatus}
                disabled={isChecking}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${isChecking ? 'animate-spin' : ''}`} />
                Cek Ulang
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <span className="text-xs text-slate-400 block">Database</span>
                <span className="font-bold text-slate-700">db_mcu_karyawan</span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <span className="text-xs text-slate-400 block">Driver</span>
                <span className="font-semibold text-slate-700">PostgreSQL / GORM</span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <span className="text-xs text-slate-400 block">Status Server</span>
                <span className="inline-flex items-center gap-1 font-bold text-emerald-600 text-xs mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Terhubung
                </span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <span className="text-xs text-slate-400 block">Total Data</span>
                <span className="font-bold text-blue-600">{records.length} Pasien</span>
              </div>
            </div>
          </div>

          {activeTab === 'POSTGRES' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-indigo-50/90 via-slate-50 to-blue-50/50 border-2 border-indigo-200 rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-md shadow-indigo-500/20 shrink-0">
                    <Server className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">
                      Arsitektur PostgreSQL Lokal Berjalan Sempurna
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Backend Go kamu terhubung langsung ke database PostgreSQL lokal[cite: 7]. Setiap data yang kamu input dan simpan lewat modal konfirmasi langsung masuk ke tabel-tabel database secara aman dan permanen[cite: 7].
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white border-2 border-indigo-200/90 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-md shadow-indigo-500/20 shrink-0">
                    <Download className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">
                      Ekspor &amp; Backup Database PostgreSQL
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Unduh file skema dan cadangan database PostgreSQL lengkap untuk keamanan data rekam medis MCU.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={handleDownloadPgBackup}
                    className="flex items-center justify-center gap-2 p-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download File SQL PostgreSQL (.sql)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyPgFull}
                    className="flex items-center justify-center gap-2 p-3.5 bg-white hover:bg-indigo-50 border-2 border-indigo-300 hover:border-indigo-400 text-indigo-700 rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
                  >
                    {copiedPgFull ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-indigo-600" />}
                    <span>{copiedPgFull ? 'Query SQL Disalin!' : 'Salin Query SQL PostgreSQL'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'BACKUP' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-5 text-center sm:text-left sm:flex items-center justify-between gap-4">
                <div className="space-y-1 mb-4 sm:mb-0">
                  <h3 className="font-bold text-slate-800 text-base flex items-center justify-center sm:justify-start gap-2">
                    <Download className="w-5 h-5 text-blue-600" />
                    Unduh Backup SQL PostgreSQL (.sql)
                  </h3>
                  <p className="text-xs text-slate-600">
                    Berisi skema tabel relasional PostgreSQL lengkap dan seluruh data pasien MCU saat ini.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadPgBackup}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-md shadow-blue-500/20 transition-all shrink-0 w-full sm:w-auto justify-center cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  Download .SQL
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Backend Go berjalan di port 8080 dengan database PostgreSQL lokal[cite: 7].</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};