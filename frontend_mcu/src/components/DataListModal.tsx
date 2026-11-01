import React, { useState } from 'react';
import { MCURecord } from '../types';
import { formatIndonesianDate } from '../utils/mcuHelpers';
import { Database, Search, Trash2, Download, X, Edit, ShieldCheck, Lock, KeyRound, Cloud } from 'lucide-react';
import * as XLSX from 'xlsx';
import { fetchMySqlRecords } from '../services/Service';
import { API_BASE_URL } from '../config/api';

interface DataListModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: MCURecord[];
  onSelectRecord: (record: MCURecord) => void;
  onDeleteRecord: (id: string) => void;

  onLockAdmin?: () => void;
  onChangeAdminPin?: () => void;
}

export const DataListModal: React.FC<DataListModalProps> = ({
  isOpen,
  onClose,
  records,
  onSelectRecord,
  onDeleteRecord,
  onLockAdmin,
  onChangeAdminPin
}) => {
  const [search, setSearch] = useState('');
  const [fitnessFilter, setFitnessFilter] = useState<string>('ALL');

  // DEKLARASI STATE isExporting AGAR TIDAK ERROR
  const [isExporting, setIsExporting] = useState<boolean>(false);

  if (!isOpen) return null;

  const filtered = records.filter((r) => {
    const matchesSearch =
      r.nama.toLowerCase().includes(search.toLowerCase()) ||
      r.badge.toLowerCase().includes(search.toLowerCase()) ||
      r.bagian.toLowerCase().includes(search.toLowerCase()) ||
      r.dokter.toLowerCase().includes(search.toLowerCase());

    const matchesFit = fitnessFilter === 'ALL' || r.hasilPemkes === fitnessFilter;

    return matchesSearch && matchesFit;
  });

const handleExportAllToExcel = async () => {
    try {
      setIsExporting(true);
      
      // Ambil data lengkap, pastikan melakuan fetch detail per badge jika data detailnya kosong
      const detailedRecords = await Promise.all(
        records.map(async (rec: any) => {
          // Jika data lab/sgot sudah ada di state, gunakan langsung
          if (rec.sgot !== undefined || rec.hb !== undefined || rec.tandaVital) {
            return rec;
          }
          // Jika kosong, coba ambil data lengkap secara live dari endpoint backend Go
          try {
            if (rec.badge) {
              const res = await fetch(`${API_BASE_URL}/api/records/badge/${rec.badge.trim()}`);
              const json = await res.json();
              if (json.success && json.data) {
                return { ...rec, ...(json.data.mcuRecord || json.data) };
              }
            }
          } catch (e) {
            // fallback ke data lokal jika offline
          }
          return rec;
        })
      );

      const dataToExport = detailedRecords.filter((r: any) => {
        const matchesSearch =
          (r.nama || '').toLowerCase().includes(search.toLowerCase()) ||
          (r.badge || '').toLowerCase().includes(search.toLowerCase()) ||
          (r.bagian || '').toLowerCase().includes(search.toLowerCase()) ||
          (r.dokter || '').toLowerCase().includes(search.toLowerCase());

        const fitness = r.hasilPemkes || 'Fit';
        const matchesFit = fitnessFilter === 'ALL' || fitness === fitnessFilter;
        return matchesSearch && matchesFit;
      });

      if (!dataToExport || dataToExport.length === 0) {
        alert('Tidak ada data pasien yang tersedia untuk diexport.');
        setIsExporting(false);
        return;
      }

      const rows = dataToExport.map((r: any, index) => {
        const tv = r.tandaVital || r;
        const hem = r.hematologi || r;
        const kimHati = r.kimiaKlinik?.fungsiHati || r.fungsiHati || r;
        const kimLipid = r.kimiaKlinik?.profilLipid || r.profilLipid || r;
        const kimGlukosa = r.kimiaKlinik?.glukosa || r.glukosa || r;

        return {
          'No': index + 1,
          'ID Dokumen': r.id || r.ID_DOKUMEN || '',
          'Badge': r.badge || r.BADGE || '',
          'Nama Karyawan': r.nama || r.NAMA || '',
          'Gender': (r.jenisKelamin === 'L' || r.GENDER === 'L') ? 'Laki-laki' : 'Perempuan',
          'Siklus MCU': r.periodeMCU || r.SIKLUS_MCU || '',
          'Umur': r.umur || r.UMUR || '',
          'Gol Darah': r.golDarah || r.GOL_DARAH || '',
          'Shift': r.shift || r.SHIFT || '',
          'Bagian': r.bagian || r.BAGIAN || '',
          'Tanggal MCU': r.tanggal || r.TANGGAL_MCU || '',
          'Tahun': r.testTahun || r.TAHUN || '',
          'Dokter Pemeriksa': r.dokter || r.DOKTER || 'DR. NURSYIRWAN, Sp.Ok',
          
          // Tanda Vital & Antropometri
          'TD Sistolik': tv.tekananDarahSistolik || r.tekananDarahSys || '',
          'TD Diastolik': tv.tekananDarahDiastolik || r.tekananDarahDia || '',
          'BMI': tv.bmi || r.bmi || '',
          'Kategori BMI': tv.bmiKategori || r.bmiKategori || '',
          
          // Laboratorium
          'Hemoglobin (Hb)': hem.hemoglobin || r.hb || '',
          'Leukosit': hem.leukosit || r.leukosit || '',
          
          // Kimia Klinik
          'SGOT': kimHati.sgot || r.sgot || '',
          'SGPT': kimHati.sgpt || r.sgpt || '',
          'Kolesterol Total': kimLipid.kolesterolTotal || r.kolesterolTotal || '',
          'Glukosa Puasa': kimGlukosa.gdp || r.gulaDarahPuasa || '',
          
          'Hasil Pemkes': r.hasilPemkes || r.HASIL_PEMKES || 'Fit',
          'Kesimpulan': r.kesimpulan || r.KESIMPULAN || r.kesimpulanUmum || '',
          'Saran': r.saran || r.SARAN || r.saranUmum || '',
          'Jadwal MCU Berikutnya': r.tanggalMCUBerikutnya || r.JADWAL_MCU_BERIKUTNYA || ''
        };
      });

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(rows);
      XLSX.utils.book_append_sheet(wb, ws, 'Database MCU Pusri');
      
      const fileName = `Database_MCU_RS_Pusri_${Date.now()}.xlsx`;
      XLSX.writeFile(wb, fileName);
    } catch (err) {
      console.error("Gagal export excel:", err);
      alert('Terjadi kesalahan saat mengexport file Excel.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-300 overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="flex flex-wrap items-center justify-between px-5 py-3.5 bg-slate-900 text-white gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 p-0.5 flex items-center justify-center shrink-0 border border-white/20 overflow-hidden">
              <img
                src="/logo_sm.png"
                alt="Logo PT Pusri"
                className="h-full w-auto object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-sm">DATABASE REKAM MEDIS MCU RS PT PUSRI</h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Admin Mode</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Total Pasien Terdaftar: <strong className="text-white font-mono">{records.length} Data</strong>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
    
            <button
              type="button"
              onClick={handleExportAllToExcel}
              className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Excel</span>
            </button>
            {onChangeAdminPin && (
              <button
                type="button"
                onClick={onChangeAdminPin}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                title="Ubah PIN / Password Otorisasi Admin"
              >
                <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Ubah PIN</span>
              </button>
            )}
            {onLockAdmin && (
              <button
                type="button"
                onClick={() => {
                  onLockAdmin();
                  onClose();
                }}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                title="Kunci Kembali Akses Admin"
              >
                <Lock className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Kunci Admin</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-3.5 bg-slate-50 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
          <div className="sm:col-span-8 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari badge, nama karyawan, dokter, atau bagian..."
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded text-xs"
            />
          </div>

          <div className="sm:col-span-4">
            <select
              value={fitnessFilter}
              onChange={(e) => setFitnessFilter(e.target.value)}
              className="w-full py-1.5 px-2 bg-white border border-slate-300 rounded text-xs font-medium text-slate-700"
            >
              <option value="ALL">Semua Hasil Pemkes</option>
              <option value="Fit">Fit to Work Saja</option>
              <option value="Fit with Note">Fit with Note Saja</option>
              <option value="Temporary Unfit">Temporary Unfit Saja</option>
              <option value="Unfit">Unfit Saja</option>
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 text-xs">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0 border-b border-slate-200">
              <tr>
                <th className="p-2">Badge &amp; Nama</th>
                <th className="p-2">Tanggal / Thn</th>
                <th className="p-2">Gender &amp; Siklus</th>
                <th className="p-2">Bagian</th>
                <th className="p-2">Dokter</th>
                <th className="p-2">Hasil Pemkes</th>
                <th className="p-2 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length > 0 ? (
                filtered.map((rec) => {
                  return (
                    <tr key={rec.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-2">
                        <div className="font-bold text-slate-900 uppercase">{rec.nama}</div>
                        <div className="font-mono text-[11px] text-slate-500">Badge: {rec.badge}</div>
                      </td>
                      <td className="p-2 font-mono">
                        <div>{rec.tanggal}</div>
                        <div className="text-[10px] text-slate-400">Tahun {rec.testTahun}</div>
                      </td>
                      <td className="p-2">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${rec.jenisKelamin === 'L' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'}`}>
                          {rec.jenisKelamin === 'L' ? 'L' : 'P'}
                        </span>
                      </td>
                      <td className="p-2 text-slate-600 truncate max-w-40" title={rec.bagian}>{rec.bagian}</td>
                      <td className="p-2 text-slate-700">{rec.dokter}</td>
                      <td className="p-2">
                        <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                          rec.hasilPemkes === 'Fit'
                            ? 'bg-emerald-100 text-emerald-800'
                            : rec.hasilPemkes === 'Fit with Note'
                            ? 'bg-amber-100 text-amber-800'
                            : rec.hasilPemkes === 'Temporary Unfit'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {rec.hasilPemkes}
                        </span>
                      </td>
                      <td className="p-2 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              onSelectRecord(rec);
                              onClose();
                            }}
                            className="p-1 text-slate-600 hover:text-emerald-700 hover:bg-slate-100 rounded cursor-pointer"
                            title="Buka / Edit di Form"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteRecord(rec.id)}
                            className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded cursor-pointer"
                            title="Hapus Data Ini"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    Tidak ada data rekam medis yang cocok.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <div>Ditemukan {filtered.length} rekam medis</div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 text-white rounded font-medium hover:bg-slate-900 cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
