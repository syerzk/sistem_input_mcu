import React, { useState, useEffect } from 'react';
import { MCURecord, Gender, ShiftType } from '../types';
import { PUSRI_DEPARTMENTS, DOCTORS_LIST, SAMPLE_EMPLOYEES } from '../data/mockData';
import { calculateNextMCUDueDate } from '../utils/mcuHelpers';
import { Search } from 'lucide-react';
import { ModernDatePicker } from './ModernDatePicker';
import { ModernYearPicker } from './ModernYearPicker';
import { API_BASE_URL } from '../config/api';

interface HeaderNavbarProps {
  currentRecord: MCURecord;
  onChange: (updates: Partial<MCURecord>) => void;
  enableEdit: boolean;
  onToggleEdit: (enable: boolean) => void;
  onOpenReport?: () => void;
  onOpenExcelModal?: () => void;
  onOpenDataList: () => void;
  onOpenScheduleTracker: () => void;
  savedRecords: MCURecord[];
  onSelectRecord: (id: string) => void;
  onLoadPatientByBadge?: (badgeInput: string) => void;
  onOpenBadgePage?: () => void;
  isAdmin?: boolean;
  isCloudConnected?: boolean;
}

export const HeaderNavbar: React.FC<HeaderNavbarProps> = ({
  currentRecord,
  onChange,
  enableEdit,
  onToggleEdit,
  onOpenReport,
  onOpenExcelModal,
  onOpenDataList,
  onOpenScheduleTracker,
  savedRecords,
  onSelectRecord,
  onLoadPatientByBadge,
  onOpenBadgePage,
  isAdmin = false,
  isCloudConnected = true
}) => {
  const [badgeSearchFeedback, setBadgeSearchFeedback] = useState<string | null>(null);
  
  // 1. STATE LOKAL UNTUK MENAMPUNG KETIKAN BADGE SEBELUM DI-TRIGGER
  const [badgeInput, setBadgeInput] = useState<string>(currentRecord.badge || '');

  // Sinkronkan state lokal jika currentRecord.badge berubah dari luar (misal saat pilih dari modal database)
  useEffect(() => {
    setBadgeInput(currentRecord.badge || '');
  }, [currentRecord.badge]);

  // Logika Asli Versi Lama
  const handleBadgeChange = (targetBadge: string) => {
    const trimmed = targetBadge.trim();
    const foundEmployee = SAMPLE_EMPLOYEES.find((emp) => emp.badge.toLowerCase() === trimmed.toLowerCase());
    
    if (foundEmployee) {
      const { nextDate } = calculateNextMCUDueDate(currentRecord.tanggal, foundEmployee.jenisKelamin);
      onChange({
        badge: foundEmployee.badge,
        nama: foundEmployee.nama,
        jenisKelamin: foundEmployee.jenisKelamin,
        umur: foundEmployee.umur,
        golDarah: foundEmployee.golDarah,
        shift: foundEmployee.shift,
        bagian: foundEmployee.bagian,
        periodeMCU: foundEmployee.jenisKelamin === 'L' ? '1 Tahun' : '2 Tahun',
        tanggalMCUBerikutnya: nextDate
      });
    } else {
      onChange({ badge: targetBadge });
    }
  };

  // 2. FUNGSI PEMICU (TRIGGER) SAAT TOMBOL ENTER ATAU SELESAI DIKETIK
  const handleTriggerLoadData = () => {
    const inputVal = badgeInput.trim();

    if (onLoadPatientByBadge && inputVal) {
      onLoadPatientByBadge(inputVal);
      return;
    }

    if (!inputVal) {
      // Jika nomor badge kosong, langsung buka modal database
      onOpenDataList();
      return;
    }

    // Cari rekam medis di database tersimpan yang cocok dengan nomor badge
    const matchedRecord = savedRecords.find(
      (r) => r.badge.toLowerCase() === inputVal.toLowerCase() ||
             r.nama.toLowerCase().includes(inputVal.toLowerCase())
    );

    if (matchedRecord) {
      onSelectRecord(matchedRecord.id);
      setBadgeSearchFeedback(`Memuat: ${matchedRecord.nama}`);
      setTimeout(() => setBadgeSearchFeedback(null), 3000);
    } else {
      // Jika tidak ditemukan di database tersimpan, cek di database karyawan sample
      const matchedSample = SAMPLE_EMPLOYEES.find(
        (emp) => emp.badge.toLowerCase() === inputVal.toLowerCase()
      );
      if (matchedSample) {
        handleBadgeChange(matchedSample.badge);
        setBadgeSearchFeedback(`Data Karyawan: ${matchedSample.nama}`);
        setTimeout(() => setBadgeSearchFeedback(null), 3000);
      } else {
        // Jika belum ada, perbarui badge dan buka modal/notifikasi
        onChange({ badge: inputVal });
        onOpenDataList();
      }
    }
  };
  
  const [doctorsList, setDoctorsList] = useState<string[]>(DOCTORS_LIST);
  const [isCustomDoctor, setIsCustomDoctor] = useState<boolean>(false);
  const [customDoctorInput, setCustomDoctorInput] = useState<string>('');

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/doctors`);
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          const dbDoctorNames = json.data.map((d: { nama: string }) => d.nama);
          const merged = Array.from(new Set([...dbDoctorNames, ...DOCTORS_LIST]));
          setDoctorsList(merged);
        } else {
          setDoctorsList(DOCTORS_LIST);
        }
      } catch (err) {
        setDoctorsList(DOCTORS_LIST);
      }
    };
    fetchDoctors();
  }, []);
  

  const handleGenderChange = (newGender: Gender) => {
    const { nextDate } = calculateNextMCUDueDate(currentRecord.tanggal, newGender);
    onChange({
      jenisKelamin: newGender,
      periodeMCU: newGender === 'L' ? '1 Tahun' : '2 Tahun',
      tanggalMCUBerikutnya: nextDate,
      riwayatKehamilan: newGender === 'L' ? '-' : currentRecord.riwayatKehamilan === '-' ? '' : currentRecord.riwayatKehamilan
    });
  };

  const handleDateChange = (newDate: string) => {
    const { nextDate } = calculateNextMCUDueDate(newDate, currentRecord.jenisKelamin);
    const testYear = newDate ? newDate.split('-')[0] : currentRecord.testTahun;
    onChange({
      tanggal: newDate,
      testTahun: testYear,
      tanggalMCUBerikutnya: nextDate
    });
  };

  const handleYearChange = (newYear: string) => {
    let updatedTanggal = currentRecord.tanggal;
    if (updatedTanggal && updatedTanggal.includes('-')) {
      const parts = updatedTanggal.split('-');
      if (parts.length === 3) {
        updatedTanggal = `${newYear}-${parts[1]}-${parts[2]}`;
      }
    }
    const { nextDate } = calculateNextMCUDueDate(updatedTanggal || `${newYear}-01-01`, currentRecord.jenisKelamin);
    onChange({
      testTahun: newYear,
      ...(updatedTanggal ? { tanggal: updatedTanggal, tanggalMCUBerikutnya: nextDate } : {})
    });
  };

  return (
    <div id="mcu-header-card" className="bg-white border border-slate-300 rounded-xl shadow-xs p-4 mb-4 space-y-3.5">
      
      <div className="flex flex-col xl:flex-row xl:items-center justify-between pb-3 border-b border-slate-200 gap-3">
        <div className="flex items-center gap-3.5">
          <div className="h-12 w-12 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-center p-1 shrink-0 overflow-hidden hover:scale-105 transition-transform" title="PT Pupuk Sriwidjaja Palembang">
            <img
              src="/logo_sm.png"
              alt="Logo PT Pusri Palembang"
              className="h-full w-auto object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 uppercase">
                INPUT MEDICAL CHECK UP DETAIL
              </h1>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Sistem Input MCU Rutin Karyawan &bull; Laki-laki: <span className="font-bold text-blue-700">1 Tahun Sekali</span> &bull; Perempuan: <span className="font-bold text-indigo-700">2 Tahun Sekali</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 cursor-pointer select-none hover:bg-slate-200 transition-colors">
            <input
              id="checkbox-enable-edit"
              type="checkbox"
              checked={enableEdit}
              onChange={(e) => onToggleEdit(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded border-slate-400 cursor-pointer focus:ring-blue-500"
            />
            <span>Enable Edit</span>
          </label>
        </div>
      </div>

      <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-3.5 sm:p-4 space-y-3.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-3 items-end">
          
          <div className="md:col-span-3 lg:col-span-3">
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="input-badge" className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                BADGE
              </label>
              {badgeSearchFeedback && (
                <span className="text-[10px] text-emerald-600 font-semibold truncate max-w-[120px]">
                  {badgeSearchFeedback}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              {/* INPUT TEKS DENGAN ENTER TRIGGER */}
              <input
                id="input-badge"
                type="text"
                disabled={!enableEdit}
                value={badgeInput}
                onChange={(e) => setBadgeInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleTriggerLoadData(); // Jalankan pencarian saat tombol Enter ditekan
                  }
                }}
                placeholder="No. Badge"
                className="flex-1 min-w-0 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-mono font-bold text-slate-900 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 disabled:bg-slate-100 transition-all"
              />
              <button
                id="btn-load-data-badge"
                type="button"
                onClick={handleTriggerLoadData} // Jalankan pencarian saat tombol diklik
                className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
                title="Load Data Pasien berdasarkan No. Badge atau buka daftar database"
              >
                <Search className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Load Data</span>
                <span className="sm:hidden">Load</span>
              </button>
              {onOpenBadgePage && (
                <button
                  id="btn-open-badge-entry-page"
                  type="button"
                  onClick={onOpenBadgePage}
                  className="shrink-0 px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-blue-700 rounded-lg text-xs font-semibold transition-colors border border-slate-300 cursor-pointer"
                  title="Buka Halaman Masukkan Nomor Badge"
                >
                  Ganti
                </button>
              )}
            </div>
          </div>

          <div className="md:col-span-4 lg:col-span-4">
            <label htmlFor="input-nama" className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              NAMA KARYAWAN / PASIEN
            </label>
            <input
              id="input-nama"
              type="text"
              disabled={!enableEdit}
              value={currentRecord.nama}
              onChange={(e) => onChange({ nama: e.target.value })}
              placeholder="Nama Lengkap Karyawan"
              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-bold text-slate-900 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 disabled:bg-slate-100 uppercase transition-all"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              STATUS PASIEN
            </label>
            <label className="flex items-center gap-2 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg cursor-pointer select-none hover:bg-slate-50 transition-colors h-8.5">
              <input
                id="checkbox-istri-suami"
                type="checkbox"
                disabled={!enableEdit}
                checked={currentRecord.isSpouse}
                onChange={(e) => {
                  const isChecked = e.target.checked; 
                  onChange({ isSpouse: isChecked });
                }}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 cursor-pointer focus:ring-blue-500"
              />
              <span className="text-xs font-semibold text-slate-700">Istri/Suami</span>
            </label>
          </div>

          <div className="md:col-span-2 lg:col-span-2">
            <label htmlFor="input-tanggal" className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              TANGGAL MCU
            </label>
            <ModernDatePicker
              id="input-tanggal"
              disabled={!enableEdit}
              value={currentRecord.tanggal}
              onChange={(val) => handleDateChange(val)}
            />
          </div>

          <div className="md:col-span-1 lg:col-span-1">
            <label htmlFor="input-test-tahun" className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1 text-center">
              TAHUN
            </label>
            <ModernYearPicker
              id="input-test-tahun"
              disabled={!enableEdit}
              value={currentRecord.testTahun}
              onChange={handleYearChange}
              align="center"
            />
          </div>

        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-3 items-end pt-2 border-t border-slate-200/80">
          
          <div className="md:col-span-2">
            <label htmlFor="input-umur" className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              UMUR
            </label>
            <div className="flex items-center gap-1.5">
              <input
                id="input-umur"
                type="number"
                disabled={!enableEdit}
                value={currentRecord.umur}
                onChange={(e) => onChange({ umur: Number(e.target.value) })}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-mono font-bold text-center text-xs text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 disabled:bg-slate-100"
              />
              <span className="text-slate-500 font-semibold text-xs shrink-0">Tahun</span>
            </div>
          </div>

          <div className="md:col-span-2">
            <label htmlFor="select-gol-darah" className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              GOL. DARAH
            </label>
            <select
              id="select-gol-darah"
              disabled={!enableEdit}
              value={currentRecord.golDarah}
              onChange={(e) => onChange({ golDarah: e.target.value })}
              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-bold text-xs text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 disabled:bg-slate-100 cursor-pointer"
            >
              <option value="A">Golongan A</option>
              <option value="B">Golongan B</option>
              <option value="AB">Golongan AB</option>
              <option value="O">Golongan O</option>
              <option value="Belum Tahu">Belum Tahu</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label htmlFor="select-shift" className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              POLA KERJA (S/NS)
            </label>
            <select
              id="select-shift"
              disabled={!enableEdit}
              value={currentRecord.shift}
              onChange={(e) => onChange({ shift: e.target.value as ShiftType })}
              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-semibold text-slate-900 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 disabled:bg-slate-100 cursor-pointer"
            >
              <option value="S">Shift (S)</option>
              <option value="NS">Non-Shift (NS)</option>
            </select>
          </div>

          <div className="md:col-span-3">
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              JENIS KELAMIN
            </label>
            <div className="grid grid-cols-2 rounded-lg border border-slate-300 overflow-hidden bg-slate-200/70 p-0.5 gap-0.5 h-8.5">
              <button
                id="btn-gender-laki"
                type="button"
                disabled={!enableEdit}
                onClick={() => handleGenderChange('L')}
                className={`py-1 px-1 rounded-md text-[11px] font-bold transition-all cursor-pointer text-center flex items-center justify-center ${
                  currentRecord.jenisKelamin === 'L'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                }`}
                title="Laki-laki (L)"
              >
                L
              </button>
              <button
                id="btn-gender-perempuan"
                type="button"
                disabled={!enableEdit}
                onClick={() => handleGenderChange('P')}
                className={`py-1 px-1 rounded-md text-[11px] font-bold transition-all cursor-pointer text-center flex items-center justify-center ${
                  currentRecord.jenisKelamin === 'P'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                }`}
                title="Perempuan (P)"
              >
                P
              </button>
            </div>
          </div>

          <div className="md:col-span-3">
            <label htmlFor="select-dokter" className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              DOKTER PEMERIKSA
            </label>
            
            {!isCustomDoctor ? (
            <select
                id="select-dokter"
                disabled={!enableEdit}
                value={currentRecord.dokter || ''}
                onChange={(e) => {
                  if (e.target.value === '__CUSTOM__') {
                    setIsCustomDoctor(true);
                    setCustomDoctorInput('');
                  } else {
                    onChange({ dokter: e.target.value });
                  }
                }}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-semibold text-slate-900 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 disabled:bg-slate-100 cursor-pointer truncate"
              >
                <option value="">-- Pilih Dokter --</option>
                {doctorsList.map((doc) => (
                  <option key={doc} value={doc}>
                    {doc}
                  </option>
                ))}
                <option value="__CUSTOM__" className="font-bold text-blue-600">
                  + Input Dokter Manual...
                </option>
              </select>
            ) : (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  disabled={!enableEdit}
                  value={customDoctorInput}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCustomDoctorInput(val);
                    onChange({ dokter: val });
                  }}
                  placeholder="Ketik Nama Dokter..."
                  className="w-full px-2.5 py-1.5 bg-white border border-blue-400 rounded-lg font-bold text-slate-900 text-xs focus:ring-2 focus:ring-blue-500/20"
                />
                <button
                  type="button"
                  onClick={() => {
                    setIsCustomDoctor(false);
                  }}
                  className="px-2 py-1.5 bg-slate-200 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-300 cursor-pointer shrink-0"
                  title="Kembali ke List Pilihan"
                >
                  List
                </button>
              </div>
            )}
          </div>

        </div>

        <div className="pt-2 border-t border-slate-200/80">
          <label htmlFor="select-bagian" className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
            BAGIAN / KOMPARTEMEN / UNIT KERJA
          </label>
          <select
            id="select-bagian"
            disabled={!enableEdit}
            value={currentRecord.bagian}
            onChange={(e) => onChange({ bagian: e.target.value })}
            className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-medium text-slate-900 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 disabled:bg-slate-100 cursor-pointer"
          >
            {!PUSRI_DEPARTMENTS.includes(currentRecord.bagian) && currentRecord.bagian && (
              <option value={currentRecord.bagian}>{currentRecord.bagian}</option>
            )}
            {PUSRI_DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

      </div>
    </div>
  );
};