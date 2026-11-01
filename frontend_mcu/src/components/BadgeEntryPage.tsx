import React, { useState, useMemo } from 'react';
import { MCURecord } from '../types';
import { SAMPLE_EMPLOYEES } from '../data/mockData';
import { getInitialMCURecord, calculateNextMCUDueDate, formatIndonesianDate } from '../utils/mcuHelpers';
import { RsPusriLogo } from './RsPusriLogo';
import { API_BASE_URL } from '../config/api';
import {
  Search,
  ArrowRight,
  User,
  Building2,
  Calendar,
  Briefcase,
  Activity,
  CalendarClock,
  Database,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Clock,
  HeartPulse,
  UserCheck,
  Stethoscope,
  X
} from 'lucide-react';

interface BadgeEntryPageProps {
  records: MCURecord[];
  currentBadge?: string;
  onProceedToDetail: (record: MCURecord) => void;
  onReturnToPortal: () => void;
  onOpenDatabase: () => void;
  onOpenScheduleTracker: () => void;
  isAdmin: boolean;
  isCloudConnected?: boolean;
}

export const BadgeEntryPage: React.FC<BadgeEntryPageProps> = ({
  records,
  currentBadge = '',
  onProceedToDetail,
  onReturnToPortal,
  onOpenDatabase,
  onOpenScheduleTracker,
  isAdmin,
  isCloudConnected = true
}) => {
  const [badgeInput, setBadgeInput] = useState<string>(currentBadge || '');
const [searchTerm, setSearchTerm] = useState<string>('');
const [selectedGenderFilter, setSelectedGenderFilter] = useState<'ALL' | 'L' | 'P'>('ALL');

// 1. TAMBAHKAN STATE PEMICU (TRIGGER)
const [searchedBadge, setSearchedBadge] = useState<string>(currentBadge || '');
const [hasSearched, setHasSearched] = useState<boolean>(Boolean(currentBadge));

const handleTriggerSearch = () => {
  const trimmed = badgeInput.trim();
  setSearchedBadge(trimmed);
  setHasSearched(Boolean(trimmed));
};

  // Cari apakah ada rekam medis tersimpan yang cocok dengan badgeInput
  const matchedSavedRecord = useMemo(() => {
  const trimmed = searchedBadge.trim().toLowerCase();
  if (!trimmed) return null;
  return records.find(r => r.badge.toLowerCase() === trimmed) || null;
}, [searchedBadge, records]);

  // Cari apakah ada data karyawan sample yang cocok
 const matchedSampleEmployee = useMemo(() => {
  const trimmed = searchedBadge.trim().toLowerCase();
  if (!trimmed) return null;
  return SAMPLE_EMPLOYEES.find(e => e.badge.toLowerCase() === trimmed) || null;
}, [searchedBadge]);

  // Fungsi membuat atau mengambil rekam medis untuk badge yang diketik
// 1. Perbarui fungsi handleProceed di BadgeEntryPage_2.tsx
const handleProceed = async () => {
    const trimmedBadge = badgeInput.trim();
    if (!trimmedBadge) return;

    // ------------------------------------------------------------------
    // PENAMBAHAN 1: Memastikan trigger search berjalan jika user langsung klik 'Lanjut'
    // ------------------------------------------------------------------
    const effectiveSearchedBadge = searchedBadge || trimmedBadge;
    if (!hasSearched) {
      handleTriggerSearch();
    }

    // Jika dari daftar cepat user memilih item spesifik yang sudah punya matchedSavedRecord:
    if (matchedSavedRecord) {
      try {
        const isSpouse = matchedSavedRecord.isSpouse || false;
        const testYear = matchedSavedRecord.testTahun || String(new Date().getFullYear());

        // Gunakan effectiveSearchedBadge untuk memanggil API Go Backend kamu
        const res = await fetch(`${API_BASE_URL}/api/records/badge/${effectiveSearchedBadge}?is_spouse=${isSpouse}&test_tahun=${testYear}`);
        const json = await res.json();
        if (json.success && json.data) {
          const recordData = json.data.mcuRecord || json.data;
          if (recordData) {
            onProceedToDetail(recordData);
            return;
          }
        }
      } catch (e) {
        console.error(e);
      }
      onProceedToDetail(matchedSavedRecord);
      return;
    }

    try {
      // Ambil dari Backend berdasarkan badge untuk tahun berjalan
      const currentYear = new Date().getFullYear();
      // Gunakan effectiveSearchedBadge
      const res = await fetch(`${API_BASE_URL}/api/records/badge/${effectiveSearchedBadge}?is_spouse=false&test_tahun=${currentYear}`);
      const json = await res.json();

      if (json.success && json.data) {
        const recordData = json.data.mcuRecord || json.data;
        if (recordData) {
          onProceedToDetail(recordData);
          return; 
        }
      }
    } catch (error) {
      console.log("Belum ada data riwayat di database.");
    }
    
    if (matchedSampleEmployee) {
      const todayStr = new Date().toISOString().split('T')[0];
      const currentYear = new Date().getFullYear();
      const nextDue = calculateNextMCUDueDate(todayStr, matchedSampleEmployee.jenisKelamin);
      const isSpouse = false;

      const newId = `MCU-${currentYear}-${matchedSampleEmployee.badge}`;

      const newRec: MCURecord = {
        ...getInitialMCURecord(),
        id: newId,
        badge: matchedSampleEmployee.badge,
        nama: matchedSampleEmployee.nama,
        jenisKelamin: matchedSampleEmployee.jenisKelamin,
        umur: matchedSampleEmployee.umur,
        golDarah: matchedSampleEmployee.golDarah,
        shift: matchedSampleEmployee.shift,
        bagian: matchedSampleEmployee.bagian,
        tanggal: todayStr,
        testTahun: String(currentYear),
        periodeMCU: matchedSampleEmployee.jenisKelamin === 'L' ? '1 Tahun' : '2 Tahun',
        tanggalMCUBerikutnya: nextDue.nextDate,
        isSpouse: isSpouse
      };

      onProceedToDetail(newRec);
      return;
    }

    // Jika badge baru kustom
    const todayStr = new Date().toISOString().split('T')[0];
    const currentYear = new Date().getFullYear();
    const newRec: MCURecord = {
      ...getInitialMCURecord(),
      id: `MCU-${currentYear}-${trimmedBadge}`,
      badge: trimmedBadge,
      nama: '',
      tanggal: todayStr,
      testTahun: String(currentYear)
    };
    onProceedToDetail(newRec);
  };

  // Filtered employees list for quick browsing
  const filteredEmployees = useMemo(() => {
    return records.filter(rec => {
      const matchSearch =
        rec.badge.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rec.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rec.bagian.toLowerCase().includes(searchTerm.toLowerCase());
      const matchGender =
        selectedGenderFilter === 'ALL' || rec.jenisKelamin === selectedGenderFilter;
      return matchSearch && matchGender;
    });
  }, [records, searchTerm, selectedGenderFilter]);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans flex flex-col">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          
          {/* Brand & Logos */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onReturnToPortal}
              className="p-1.5 -ml-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Kembali ke Halaman Pembuka (Portal)"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="Logo PT Pusri Palembang"
                className="h-9 w-auto object-contain select-none"
                referrerPolicy="no-referrer"
              />
              <div className="h-6 w-px bg-slate-200"></div>
              <RsPusriLogo size="sm" variant="color" />
            </div>
          </div>

          {/* Header right area with Database shortcut */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenDatabase}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-blue-700 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-lg transition-all shadow-2xs cursor-pointer"
            >
              <Database className="w-3.5 h-3.5 text-blue-600" />
              <span>Database Pasien</span>
              <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.2 rounded font-mono font-bold">
                {records.length}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* Page Title & Breadcrumb */}
        <div className="text-center space-y-1 pt-2">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            MASUKKAN NOMOR BADGE KARYAWAN
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl mx-auto">
            Ketik nomor badge karyawan PT Pupuk Sriwidjaja Palembang untuk memuat profil dan melanjutkan ke formulir Input MCU Detail.
          </p>
        </div>

        {/* Card Utama: Input Badge */}
<div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 sm:p-8 space-y-6">
  
  <div className="max-w-2xl mx-auto space-y-4">
    <label htmlFor="badge-number-input" className="block text-xs font-black tracking-wider uppercase text-slate-700 text-center">
      NOMOR BADGE KARYAWAN
    </label>

    {/* Input Box dengan Tombol Trigger Cari Badge */}
    <div className="flex flex-col sm:flex-row gap-2">
      <div className="relative flex-1">
        <input
          id="badge-number-input"
          type="text"
          autoFocus
          value={badgeInput}
          onChange={(e) => {
            setBadgeInput(e.target.value);
            // Reset status pencarian jika user mengetik ulang nomor lain
            if (hasSearched && e.target.value.trim() !== searchedBadge) {
              setHasSearched(false);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleTriggerSearch(); // Trigger pencarian saat tekan Enter
            }
          }}
          placeholder="Ketik Nomor Badge (misal: 1110, 1131)..."
          className="w-full pl-12 pr-10 py-3.5 bg-slate-50 hover:bg-slate-50/80 focus:bg-white border-2 border-slate-300 focus:border-blue-600 rounded-2xl text-lg sm:text-xl font-mono font-bold text-slate-900 placeholder:text-slate-400 placeholder:text-sm placeholder:font-sans focus:ring-4 focus:ring-blue-500/15 transition-all tracking-wider shadow-inner"
        />
        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
          <Search className="w-5 h-5" />
        </div>
        {badgeInput && (
          <button
            type="button"
            onClick={() => {
              setBadgeInput('');
              setSearchedBadge('');
              setHasSearched(false);
            }}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200 transition-colors cursor-pointer"
            title="Hapus input"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <button
        id="btn-trigger-search-badge"
        type="button"
        onClick={handleTriggerSearch} // Trigger pencarian saat tombol diklik
        disabled={!badgeInput.trim()}
        className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer whitespace-nowrap"
        title="Klik untuk mencari data badge ini"
      >
        <Search className="w-4 h-4" />
        <span>Cari Badge</span>
      </button>
    </div>
  </div>

          {/* Live Preview Card: Menampilkan Data Karyawan yang Ditemukan */}
          <div className="max-w-2xl mx-auto pt-2">
  {!hasSearched || searchedBadge === '' ? (
    // State 1: Belum Melakukan Pencarian (Pesan Awal)
    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-2">
      <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 font-medium">
        <UserCheck className="w-4 h-4 text-slate-400" />
        <span>Sistem otomatis mendeteksi status MCU dan data riwayat karyawan</span>
      </div>
      <div className="flex items-center justify-center gap-4 text-[11px] text-slate-500 pt-1 border-t border-slate-200/80">
        <span>SOP K3LH Laki-laki: <strong>1 Tahun Sekali</strong></span>
        <span>&bull;</span>
        <span>Perempuan: <strong>2 Tahun Sekali</strong></span>
      </div>
    </div>
  ) : matchedSavedRecord ? (
              // State 2: Ditemukan di Rekam Medis MCU Tersimpan
              <div className="p-4 sm:p-5 rounded-xl bg-blue-50/70 border border-blue-200 space-y-3 shadow-xs">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                      {matchedSavedRecord.jenisKelamin === 'L' ? 'L' : 'P'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-black text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-200">
                          BADGE: {matchedSavedRecord.badge}
                        </span>
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          matchedSavedRecord.hasilPemkes === 'Fit'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          Status: {matchedSavedRecord.hasilPemkes}
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-black text-slate-900 pt-0.5">
                        {matchedSavedRecord.nama}
                      </h3>
                      <p className="text-xs text-slate-600 flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>{matchedSavedRecord.bagian}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right hidden sm:block">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block">MCU Terakhir</span>
                    <span className="text-xs font-bold text-slate-800 font-mono">
                      {formatIndonesianDate(matchedSavedRecord.tanggal)}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-blue-200/60 flex items-center justify-between text-xs text-blue-900">
                  <div className="flex items-center gap-1 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Rekam medis MCU lengkap ditemukan di database.</span>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500">
                    Umur: {matchedSavedRecord.umur} thn &bull; Gol. Darah: {matchedSavedRecord.golDarah}
                  </span>
                </div>
              </div>
            ) : matchedSampleEmployee ? (
              // State 3: Ditemukan di Master Data Karyawan Pusri (Belum Ada MCU Tahun Ini)
              <div className="p-4 sm:p-5 rounded-xl bg-amber-50/70 border border-amber-200 space-y-3 shadow-xs">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                      {matchedSampleEmployee.jenisKelamin === 'L' ? 'L' : 'P'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-black text-amber-800 bg-white px-2 py-0.5 rounded border border-amber-300">
                          BADGE: {matchedSampleEmployee.badge}
                        </span>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                          Master Karyawan Pusri
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-black text-slate-900 pt-0.5">
                        {matchedSampleEmployee.nama}
                      </h3>
                      <p className="text-xs text-slate-600 flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>{matchedSampleEmployee.bagian}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right hidden sm:block">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Siklus Rutin</span>
                    <span className="text-xs font-bold text-slate-800">
                      {matchedSampleEmployee.jenisKelamin === 'L' ? '1 Thn Sekali' : '2 Thn Sekali'}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-amber-200/60 flex items-center gap-1 text-xs text-amber-900 font-medium">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Karyawan terdaftar di Pusri. Data diri akan otomatis diisikan ke formulir MCU baru.</span>
                </div>
              </div>
            ) : (
              // State 4: Badge Baru
              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-black text-emerald-800 bg-white px-2 py-0.5 rounded border border-emerald-300">
                    BADGE BARU: {badgeInput.trim()}
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-700">
                    Formulir MCU Kosong
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  Nomor badge ini belum ada di sistem. Anda dapat langsung mengisikan seluruh data pemeriksaan pasien secara manual.
                </p>
              </div>
            )}
          </div>

          {/* Tombol Aksi Utama: Lanjut ke Input MCU Detail */}
          <div className="max-w-2xl mx-auto pt-2">
            <button
              id="btn-proceed-to-mcu-detail"
              type="button"
              onClick={handleProceed}
              disabled={!badgeInput.trim()}
              className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-black text-base sm:text-lg tracking-wide shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
            >
              <Stethoscope className="w-5 h-5 text-blue-100" />
              <span>LANJUT KE INPUT MCU DETAIL</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <p className="text-center text-[11px] text-slate-500 pt-2 font-medium">
              Tekan tombol <kbd className="px-1.5 py-0.5 bg-slate-200 border border-slate-300 rounded font-mono text-[10px]">Enter ↵</kbd> untuk langsung lanjut ke formulir 6 tab MCU
            </p>
          </div>

        </div>

        {/* Bagian Bawah: Direktori Cepat Karyawan & Rekam Medis */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-200">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Database className="w-4 h-4 text-blue-600" />
                <span>Pilih Cepat dari Daftar Karyawan</span>
              </h2>
              <p className="text-xs text-slate-500">
                Klik tombol "Pilih &amp; Input MCU" pada karyawan yang ingin diperiksa
              </p>
            </div>

            {/* Filter Gender */}
            <div className="flex items-center gap-1.5 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setSelectedGenderFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  selectedGenderFilter === 'ALL'
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                Semua
              </button>
              <button
                type="button"
                onClick={() => setSelectedGenderFilter('L')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  selectedGenderFilter === 'L'
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-50 hover:bg-blue-100 text-blue-700'
                }`}
              >
                Laki-Laki
              </button>
              <button
                type="button"
                onClick={() => setSelectedGenderFilter('P')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  selectedGenderFilter === 'P'
                    ? 'bg-pink-600 text-white'
                    : 'bg-pink-50 hover:bg-pink-100 text-pink-700'
                }`}
              >
                Perempuan
              </button>
            </div>
          </div>

          {/* Search Box untuk Direktori */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari berdasarkan nama karyawan, badge, atau departemen..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>

          {/* Tabel / List Karyawan */}
          <div className="max-h-72 overflow-y-auto rounded-xl border border-slate-200 divide-y divide-slate-100">
            {filteredEmployees.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                Tidak ada data karyawan yang cocok dengan pencarian "{searchTerm}".
              </div>
            ) : (
              filteredEmployees.slice(0, 15).map((emp) => (
                <div
                  key={emp.id}
                  className="p-3 hover:bg-blue-50/50 transition-colors flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded border border-slate-200 shrink-0">
                      {emp.badge}
                    </span>
                    <div className="min-w-0 truncate">
                      <div className="font-bold text-slate-900 truncate">
                        {emp.nama}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {emp.bagian}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                      emp.hasilPemkes === 'Fit'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {emp.hasilPemkes}
                    </span>
                <button
  type="button"
  onClick={async () => {
    setBadgeInput(emp.badge);

    if (emp.id) {
      onProceedToDetail(emp);
      return;
    }
    const trimmedBadge = emp.badge.trim();
    try {
      const res = await fetch(`${API_BASE_URL}/api/records/badge/${trimmedBadge}`);
      const json = await res.json();

      if (json.success && json.data) {
        const recordData = json.data.mcuRecord || json.data;
        if (recordData && recordData.id) {
          onProceedToDetail(recordData);
          return;
        }
      }
    } catch (error) {
      console.log("Belum ada data riwayat, gunakan data master karyawan.");
    }
    onProceedToDetail(emp);
  }}
  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
>
  <span>Pilih &amp; Input MCU</span>
  <ArrowRight className="w-3.5 h-3.5" />
</button>
                  </div>
                </div>
              ))
            )}
          </div>

          {filteredEmployees.length > 15 && (
            <div className="text-center pt-1 text-xs text-slate-500">
              Menampilkan 15 dari {filteredEmployees.length} karyawan. Gunakan kolom pencarian untuk mempersempit hasil.
            </div>
          )}

        </div>

      </main>

      {/* Institutional Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-4 text-center text-xs text-slate-500 mt-auto">
        <p className="font-medium">
          PT Graha Pusri Medika &bull; Rumah Sakit Pusri &bull; PT Pupuk Sriwidjaja Palembang
        </p>
        <p className="text-[11px] text-slate-400 pt-0.5">
          Sistem Informasi Medical Check Up Berbasis SOP Akreditasi K3LH &amp; Kedokteran Okupasi
        </p>
      </footer>
    </div>
  );
};
