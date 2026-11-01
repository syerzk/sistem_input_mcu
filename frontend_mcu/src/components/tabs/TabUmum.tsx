import React, { useState } from 'react';
import { MCURecord } from '../../types';
import {
  ArrowRight,
  Stethoscope,
  Activity,
  HeartPulse,
  Cigarette,
  Users,
  AlertTriangle,
  ShieldCheck,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Briefcase,
  Pill,
  Clock,
  CheckCircle2,
  Syringe
} from 'lucide-react';

interface TabUmumProps {
  data: MCURecord;
  onChange: (updates: Partial<MCURecord>) => void;
  disabled?: boolean;
  onNextTab?: () => void;
}

export const TabUmum: React.FC<TabUmumProps> = ({ data, onChange, disabled, onNextTab }) => {
  const [showAdvancedHistory, setShowAdvancedHistory] = useState<boolean>(true);
  const [showOccupationalSection, setShowOccupationalSection] = useState<boolean>(true);

  const handleHabitChange = (field: keyof MCURecord['kebiasaan'], value: any) => {
    onChange({
      kebiasaan: {
        ...data.kebiasaan,
        [field]: value
      }
    });
  };

  const handleFamilyHistoryChange = (field: keyof MCURecord['riwayatPenyakitKeluarga'], value: any) => {
    onChange({
      riwayatPenyakitKeluarga: {
        ...data.riwayatPenyakitKeluarga,
        [field]: value
      }
    });
  };

  const handleOrganSymptomChange = (field: keyof NonNullable<MCURecord['keluhanSistemOrgan']>, value: any) => {
    const prev = data.keluhanSistemOrgan || {};
    const updated = { ...prev, [field]: value };
    onChange({ keluhanSistemOrgan: updated });
  };

  const handlePastDiseaseChange = (field: keyof NonNullable<MCURecord['riwayatPenyakitDahulu']>, value: any) => {
    const prev = data.riwayatPenyakitDahulu || {};
    const updated = { ...prev, [field]: value };
    onChange({ riwayatPenyakitDahulu: updated });
  };

  const handleAutoFillNormal = () => {
    onChange({
      keluhanSekarang: 'Tidak ada keluhan saat ini (Kondisi sehat & fit)',
      keluhanSistemOrgan: {
        kepalaPusing: false,
        mataKabur: false,
        telingaBerdenging: false,
        batukPilek: false,
        sesakNafas: false,
        nyeriDada: false,
        gangguanPencernaan: false,
        nyeriUluHati: false,
        pegalOtotSendi: false,
        kesemutan: false,
        lainLain: ''
      },
      riwayatPenyakit: 'Tidak ada riwayat penyakit kronis atau operasi',
      riwayatPenyakitDahulu: {
        hipertensi: false,
        diabetesMelitus: false,
        penyakitJantung: false,
        asmaParu: false,
        hepatitis: false,
        penyakitGinjal: false,
        alergi: false,
        stroke: false,
        kankerTumor: false,
        riwayatOperasi: 'Tidak ada',
        riwayatRawatInap: 'Tidak ada'
      },
      riwayatPenyakitAkibatKerja: 'Tidak ada (Nihil)',
      riwayatKecelakaanKerja: 'Tidak pernah (Nihil)',
      riwayatPengobatanRutin: 'Tidak ada',
      riwayatVaksinasi: 'Lengkap (Hepatitis B & Tetanus/COVID-19)',
      riwayatKehamilan: data.jenisKelamin === 'L' ? '-' : 'G..P..A.., Tidak sedang hamil/menyusui, siklus menstruasi teratur',
      olahraga: true,
      olahragaKeterangan: 'Olahraga aerobik / jogging 2-3x seminggu @ 30 menit',
      olahragaFrekuensi: '2-3x per minggu',
      alergiObat: false,
      alergiObatKeterangan: 'Tidak ada riwayat alergi obat',
      alergiMakanan: 'Tidak ada',
      kebiasaan: {
        merokok: false,
        merokokBatangPerHari: '',
        merokokLamaTahun: '',
        jenisRokok: 'Filter',
        minumAlkohol: false,
        minumAlkoholKeterangan: '',
        minumKopi: false,
        minumKopiCangkirPerHari: '',
        polaTidurJamPerHari: '7-8 jam per hari',
        penggunaanApd: 'Lengkap Sesuai Matriks',
        lainLain: false,
        lainLainKeterangan: ''
      },
      riwayatPenyakitKeluarga: {
        darahTinggi: false,
        kencingManis: false,
        gangguanPendengaran: false,
        stroke: false,
        sesakNafas: false,
        jantung: false,
        alergi: false,
        kanker: false,
        ginjal: false,
        lainLain: false,
        lainLainKeterangan: ''
      }
    });
  };

  const badges = [
    {
      label: 'Keluhan',
      value: !data.keluhanSekarang || data.keluhanSekarang.toLowerCase().includes('tidak') ? 'Tidak Ada' : 'Ada Keluhan',
      isNormal: !data.keluhanSekarang || data.keluhanSekarang.toLowerCase().includes('tidak')
    },
    {
      label: 'Riwayat Sakit',
      value: !data.riwayatPenyakit || data.riwayatPenyakit.toLowerCase().includes('tidak') ? 'Tidak Ada' : 'Ada Riwayat',
      isNormal: !data.riwayatPenyakit || data.riwayatPenyakit.toLowerCase().includes('tidak')
    },
    {
      label: 'Merokok',
      value: data.kebiasaan?.merokok ? 'Ya' : 'Tidak',
      isNormal: !data.kebiasaan?.merokok
    },
    {
      label: 'Alergi Obat',
      value: data.alergiObat ? 'Ada Alergi' : 'Tidak Ada',
      isNormal: !data.alergiObat
    }
  ];

  return (
    <div id="tab-umum-container" className="space-y-4">
      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* LEFT COLUMN: Keluhan, Tinjauan Sistem, & Riwayat Dahulu */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* PANEL 1: KELUHAN SEKARANG (ANAMNESIS UTAMA) */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-50 text-blue-700 rounded-lg">
                  <Stethoscope className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-tight">
                    1. Keluhan Utama &amp; Sekarang
                  </h3>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 tracking-tight block">
                Deskripsi Keluhan Pasien:
              </label>

              <textarea
                id="input-keluhan-sekarang"
                rows={2}
                disabled={disabled}
                value={data.keluhanSekarang || ''}
                onChange={(e) => onChange({ keluhanSekarang: e.target.value })}
                placeholder="Tuliskan keluhan yang dirasakan (cth: tidak ada keluhan / pusing ringan sejak 2 hari yang lalu...)"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:bg-slate-100 disabled:text-slate-500 font-mono shadow-2xs leading-relaxed"
              />
            </div>

            {/* Checklist Tinjauan Sistem Organ (Review of Systems) */}
            <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black text-slate-700 uppercase tracking-tight flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-blue-600" />
                  <span>Tinjauan Keluhan Sistem Organ</span>
                </span>
                <span className="text-[10px] text-slate-400">Centang jika ada keluhan</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-xs">
                <label className="flex items-center gap-2 p-1.5 bg-white border border-slate-200 rounded hover:border-blue-300 cursor-pointer select-none">
                  <input
                    id="checkbox-organ-pusing"
                    type="checkbox"
                    disabled={disabled}
                    checked={data.keluhanSistemOrgan?.kepalaPusing || false}
                    onChange={(e) => handleOrganSymptomChange('kepalaPusing', e.target.checked)}
                    className="w-3.5 h-3.5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="text-[11px] font-medium text-slate-700">Pusing / Vertigo</span>
                </label>

                <label className="flex items-center gap-2 p-1.5 bg-white border border-slate-200 rounded hover:border-blue-300 cursor-pointer select-none">
                  <input
                    id="checkbox-organ-mata"
                    type="checkbox"
                    disabled={disabled}
                    checked={data.keluhanSistemOrgan?.mataKabur || false}
                    onChange={(e) => handleOrganSymptomChange('mataKabur', e.target.checked)}
                    className="w-3.5 h-3.5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="text-[11px] font-medium text-slate-700">Mata Kabur / Lelah</span>
                </label>

                <label className="flex items-center gap-2 p-1.5 bg-white border border-slate-200 rounded hover:border-blue-300 cursor-pointer select-none">
                  <input
                    id="checkbox-organ-telinga"
                    type="checkbox"
                    disabled={disabled}
                    checked={data.keluhanSistemOrgan?.telingaBerdenging || false}
                    onChange={(e) => handleOrganSymptomChange('telingaBerdenging', e.target.checked)}
                    className="w-3.5 h-3.5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="text-[11px] font-medium text-slate-700">Telinga Berdenging</span>
                </label>

                <label className="flex items-center gap-2 p-1.5 bg-white border border-slate-200 rounded hover:border-blue-300 cursor-pointer select-none">
                  <input
                    id="checkbox-organ-batuk"
                    type="checkbox"
                    disabled={disabled}
                    checked={data.keluhanSistemOrgan?.batukPilek || false}
                    onChange={(e) => handleOrganSymptomChange('batukPilek', e.target.checked)}
                    className="w-3.5 h-3.5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="text-[11px] font-medium text-slate-700">Batuk / Pilek</span>
                </label>

                <label className="flex items-center gap-2 p-1.5 bg-white border border-slate-200 rounded hover:border-blue-300 cursor-pointer select-none">
                  <input
                    id="checkbox-organ-sesak"
                    type="checkbox"
                    disabled={disabled}
                    checked={data.keluhanSistemOrgan?.sesakNafas || false}
                    onChange={(e) => handleOrganSymptomChange('sesakNafas', e.target.checked)}
                    className="w-3.5 h-3.5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="text-[11px] font-medium text-slate-700">Sesak Napas</span>
                </label>

                <label className="flex items-center gap-2 p-1.5 bg-white border border-slate-200 rounded hover:border-blue-300 cursor-pointer select-none">
                  <input
                    id="checkbox-organ-nyeri-dada"
                    type="checkbox"
                    disabled={disabled}
                    checked={data.keluhanSistemOrgan?.nyeriDada || false}
                    onChange={(e) => handleOrganSymptomChange('nyeriDada', e.target.checked)}
                    className="w-3.5 h-3.5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="text-[11px] font-medium text-slate-700">Nyeri Dada / Berdebar</span>
                </label>

                <label className="flex items-center gap-2 p-1.5 bg-white border border-slate-200 rounded hover:border-blue-300 cursor-pointer select-none">
                  <input
                    id="checkbox-organ-uluhati"
                    type="checkbox"
                    disabled={disabled}
                    checked={data.keluhanSistemOrgan?.nyeriUluHati || false}
                    onChange={(e) => handleOrganSymptomChange('nyeriUluHati', e.target.checked)}
                    className="w-3.5 h-3.5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="text-[11px] font-medium text-slate-700">Nyeri Ulu Hati / Maag</span>
                </label>

                <label className="flex items-center gap-2 p-1.5 bg-white border border-slate-200 rounded hover:border-blue-300 cursor-pointer select-none">
                  <input
                    id="checkbox-organ-pegal"
                    type="checkbox"
                    disabled={disabled}
                    checked={data.keluhanSistemOrgan?.pegalOtotSendi || false}
                    onChange={(e) => handleOrganSymptomChange('pegalOtotSendi', e.target.checked)}
                    className="w-3.5 h-3.5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="text-[11px] font-medium text-slate-700">Pegal Otot / Sendi</span>
                </label>

                <label className="flex items-center gap-2 p-1.5 bg-white border border-slate-200 rounded hover:border-blue-300 cursor-pointer select-none">
                  <input
                    id="checkbox-organ-kesemutan"
                    type="checkbox"
                    disabled={disabled}
                    checked={data.keluhanSistemOrgan?.kesemutan || false}
                    onChange={(e) => handleOrganSymptomChange('kesemutan', e.target.checked)}
                    className="w-3.5 h-3.5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="text-[11px] font-medium text-slate-700">Kesemutan / Baal</span>
                </label>
              </div>

              <div className="pt-1">
                <input
                  id="input-organ-lain-lain"
                  type="text"
                  disabled={disabled}
                  value={data.keluhanSistemOrgan?.lainLain || ''}
                  onChange={(e) => handleOrganSymptomChange('lainLain', e.target.value)}
                  placeholder="Keluhan organ lainnya (cth: insomnia, gangguan kencing, dsb)..."
                  className="w-full px-2.5 py-1 text-[11px] bg-white border border-slate-300 rounded font-mono placeholder:text-slate-400 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* PANEL 2: RIWAYAT PENYAKIT DAHULU & OPERASI */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-amber-50 text-amber-700 rounded-lg">
                  <HeartPulse className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-tight">
                    2. Riwayat Penyakit Dahulu
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAdvancedHistory(!showAdvancedHistory)}
                className="text-[11px] text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>{showAdvancedHistory ? 'Sembunyikan Opsi' : 'Buka Opsi Lengkap'}</span>
                {showAdvancedHistory ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 tracking-tight block">
                Ringkasan Riwayat Penyakit Dahulu:
              </label>
              <input
                id="input-riwayat-penyakit"
                type="text"
                disabled={disabled}
                value={data.riwayatPenyakit || ''}
                onChange={(e) => onChange({ riwayatPenyakit: e.target.value })}
                placeholder="Riwayat penyakit dahulu / operasi (cth: Tidak ada riwayat penyakit kronis atau operasi)"
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:bg-slate-100 disabled:text-slate-500 font-mono shadow-2xs"
              />
            </div>

            {showAdvancedHistory && (
              <div className="p-3 bg-slate-50/70 border border-slate-200 rounded-lg space-y-3">
                <div className="text-[11px] font-black text-slate-700 uppercase tracking-tight">
                  Checklist Riwayat Penyakit Dahulu Tertentu:
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  <label className="flex items-center gap-2 p-1.5 bg-white border border-slate-200 rounded hover:border-amber-300 cursor-pointer select-none">
                    <input
                      id="checkbox-rpd-hipertensi"
                      type="checkbox"
                      disabled={disabled}
                      checked={data.riwayatPenyakitDahulu?.hipertensi || false}
                      onChange={(e) => handlePastDiseaseChange('hipertensi', e.target.checked)}
                      className="w-3.5 h-3.5 text-amber-600 rounded border-slate-300 focus:ring-amber-500"
                    />
                    <span className="text-[11px] font-medium text-slate-800">Hipertensi</span>
                  </label>

                  <label className="flex items-center gap-2 p-1.5 bg-white border border-slate-200 rounded hover:border-amber-300 cursor-pointer select-none">
                    <input
                      id="checkbox-rpd-dm"
                      type="checkbox"
                      disabled={disabled}
                      checked={data.riwayatPenyakitDahulu?.diabetesMelitus || false}
                      onChange={(e) => handlePastDiseaseChange('diabetesMelitus', e.target.checked)}
                      className="w-3.5 h-3.5 text-amber-600 rounded border-slate-300 focus:ring-amber-500"
                    />
                    <span className="text-[11px] font-medium text-slate-800">Diabetes Melitus (DM)</span>
                  </label>

                  <label className="flex items-center gap-2 p-1.5 bg-white border border-slate-200 rounded hover:border-amber-300 cursor-pointer select-none">
                    <input
                      id="checkbox-rpd-jantung"
                      type="checkbox"
                      disabled={disabled}
                      checked={data.riwayatPenyakitDahulu?.penyakitJantung || false}
                      onChange={(e) => handlePastDiseaseChange('penyakitJantung', e.target.checked)}
                      className="w-3.5 h-3.5 text-amber-600 rounded border-slate-300 focus:ring-amber-500"
                    />
                    <span className="text-[11px] font-medium text-slate-800">Penyakit Jantung</span>
                  </label>

                  <label className="flex items-center gap-2 p-1.5 bg-white border border-slate-200 rounded hover:border-amber-300 cursor-pointer select-none">
                    <input
                      id="checkbox-rpd-asma"
                      type="checkbox"
                      disabled={disabled}
                      checked={data.riwayatPenyakitDahulu?.asmaParu || false}
                      onChange={(e) => handlePastDiseaseChange('asmaParu', e.target.checked)}
                      className="w-3.5 h-3.5 text-amber-600 rounded border-slate-300 focus:ring-amber-500"
                    />
                    <span className="text-[11px] font-medium text-slate-800">Asma / TBC / Paru</span>
                  </label>

                  <label className="flex items-center gap-2 p-1.5 bg-white border border-slate-200 rounded hover:border-amber-300 cursor-pointer select-none">
                    <input
                      id="checkbox-rpd-hepatitis"
                      type="checkbox"
                      disabled={disabled}
                      checked={data.riwayatPenyakitDahulu?.hepatitis || false}
                      onChange={(e) => handlePastDiseaseChange('hepatitis', e.target.checked)}
                      className="w-3.5 h-3.5 text-amber-600 rounded border-slate-300 focus:ring-amber-500"
                    />
                    <span className="text-[11px] font-medium text-slate-800">Hepatitis / Hati</span>
                  </label>

                  <label className="flex items-center gap-2 p-1.5 bg-white border border-slate-200 rounded hover:border-amber-300 cursor-pointer select-none">
                    <input
                      id="checkbox-rpd-ginjal"
                      type="checkbox"
                      disabled={disabled}
                      checked={data.riwayatPenyakitDahulu?.penyakitGinjal || false}
                      onChange={(e) => handlePastDiseaseChange('penyakitGinjal', e.target.checked)}
                      className="w-3.5 h-3.5 text-amber-600 rounded border-slate-300 focus:ring-amber-500"
                    />
                    <span className="text-[11px] font-medium text-slate-800">Batu / Gagal Ginjal</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-0.5">
                      Riwayat Operasi / Pembedahan:
                    </label>
                    <input
                      id="input-rpd-operasi"
                      type="text"
                      disabled={disabled}
                      value={data.riwayatPenyakitDahulu?.riwayatOperasi || ''}
                      onChange={(e) => handlePastDiseaseChange('riwayatOperasi', e.target.value)}
                      placeholder="Operasi usus buntu, hernia, fraktur tulang..."
                      className="w-full px-2.5 py-1 text-xs bg-white border border-slate-300 rounded font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-0.5">
                      Riwayat Rawat Inap (Hospitalisasi):
                    </label>
                    <input
                      id="input-rpd-mondok"
                      type="text"
                      disabled={disabled}
                      value={data.riwayatPenyakitDahulu?.riwayatRawatInap || ''}
                      onChange={(e) => handlePastDiseaseChange('riwayatRawatInap', e.target.value)}
                      placeholder="Demam berdarah thn 2022 di RS Pusri..."
                      className="w-full px-2.5 py-1 text-xs bg-white border border-slate-300 rounded font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Riwayat Kehamilan & Obstetri (Khusus Karyawati/Pasien Wanita) */}
            <div className="p-3 bg-pink-50/50 border border-pink-200/80 rounded-lg">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-1.5">
                <label className="text-xs font-black text-pink-900 tracking-tight uppercase flex items-center gap-1.5">
                  <span>RIWAYAT OBSTETRI &amp; KEHAMILAN</span>
                  {data.jenisKelamin === 'P' ? (
                    <span className="text-[10px] bg-pink-600 text-white px-1.5 py-0.2 rounded font-semibold">Perempuan</span>
                  ) : (
                    <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.2 rounded font-semibold">Laki-Laki(-)</span>
                  )}
                </label>
                <span className="text-[10px] text-pink-700">Status Gravida, Partus, Abortus &amp; Kontrasepsi</span>
              </div>
              <input
                id="input-riwayat-kehamilan"
                type="text"
                disabled={disabled || data.jenisKelamin === 'L'}
                value={data.jenisKelamin === 'L' ? '-' : (data.riwayatKehamilan || '')}
                onChange={(e) => onChange({ riwayatKehamilan: e.target.value })}
                placeholder={data.jenisKelamin === 'L' ? 'Tidak berlaku untuk pasien laki-laki' : 'G2P1A0, siklus teratur, KB IUD, tidak sedang hamil'}
                className="w-full px-3 py-1.5 text-xs bg-white border border-pink-300 rounded text-slate-900 font-mono disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200"
              />
            </div>
          </div>

          {/* PANEL 3: RIWAYAT KESEHATAN KERJA & PENGOBATAN */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-tight">
                    3. Kesehatan Kerja, Obat Rutin, &amp; Alergi
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowOccupationalSection(!showOccupationalSection)}
                className="text-[11px] text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>{showOccupationalSection ? 'Ringkas' : 'Detail'}</span>
                {showOccupationalSection ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Alergi Obat & Makanan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5 p-2.5 bg-rose-50/50 border border-rose-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <label className="inline-flex items-center gap-1.5 text-xs font-black text-rose-900 cursor-pointer select-none">
                    <input
                      id="checkbox-alergi-obat"
                      type="checkbox"
                      disabled={disabled}
                      checked={
                        Boolean(data.alergiObat) &&
                        String(data.alergiObat) !== 'false' &&
                        String(data.alergiObat) !== 'Tidak Ada' &&
                        String(data.alergiObat) !== '0'
                      }
                      onChange={(e) => {
                        const isChecked = e.target.checked;
                        if (!isChecked) {
                          onChange({
                            alergiObat: 'Tidak Ada' as any,
                            alergiObatKeterangan: ''
                          });
                        } else {
                          const currentText = data.alergiObatKeterangan || '';
                          onChange({
                            alergiObat: (currentText || 'Ada Alergi') as any,
                            alergiObatKeterangan: currentText
                          });
                        }
                      }}
                      className="w-4 h-4 text-rose-600 rounded border-rose-300 focus:ring-rose-500 cursor-pointer"
                    />
                    <span>ALERGI OBAT</span>
                  </label>
                </div>
                <input
                 id="input-alergi-obat-keterangan"
                  type="text"
                  disabled={
                    disabled ||
                    !data.alergiObat ||
                    String(data.alergiObat) === 'false' ||
                    String(data.alergiObat) === 'Tidak Ada' ||
                    String(data.alergiObat) === '0'
                  }
                  value={
                    data.alergiObatKeterangan ||
                    (typeof data.alergiObat === 'string' &&
                    data.alergiObat !== 'Ada Alergi' &&
                    data.alergiObat !== 'Tidak Ada'
                      ? data.alergiObat
                      : '')
                  }
                  onChange={(e) => {
                    const text = e.target.value;
                    onChange({
                      alergiObat: (text ? text : 'Ada Alergi') as any,
                      alergiObatKeterangan: text
                    });
                  }}
                  placeholder={
                    data.alergiObat &&
                    String(data.alergiObat) !== 'false' &&
                    String(data.alergiObat) !== 'Tidak Ada'
                      ? 'Contoh: Amoxicillin, Paracetamol, Gol. NSAID...'
                      : 'Tidak ada riwayat alergi obat'
                  }
                  className={`w-full px-2.5 py-1 text-xs border rounded font-mono ${
                    data.alergiObat &&
                    String(data.alergiObat) !== 'false' &&
                    String(data.alergiObat) !== 'Tidak Ada'
                      ? 'bg-white border-rose-300 text-rose-900 font-bold focus:ring-1 focus:ring-rose-500'
                      : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                />
              </div>

              <div className="space-y-1.5 p-2.5 bg-amber-50/50 border border-amber-200 rounded-lg">
                <label className="text-xs font-black text-amber-900 block">
                  ALERGI MAKANAN / LAINNYA:
                </label>
                <input
                  id="input-alergi-makanan"
                  type="text"
                  disabled={disabled}
                  value={data.alergiMakanan || ''}
                  onChange={(e) => onChange({ alergiMakanan: e.target.value })}
                  placeholder="Seafood, udang, debu tungau, cuaca dingin (cth: Tidak ada)"
                  className="w-full px-2.5 py-1 text-xs bg-white border border-amber-300 rounded text-slate-900 font-mono focus:border-amber-500"
                />
              </div>
            </div>

            {showOccupationalSection && (
              <div className="space-y-2.5 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-0.5">
                      Riwayat Penyakit Akibat Kerja :
                    </label>
                    <input
                      id="input-pak"
                      type="text"
                      disabled={disabled}
                      value={data.riwayatPenyakitAkibatKerja || ''}
                      onChange={(e) => onChange({ riwayatPenyakitAkibatKerja: e.target.value })}
                      placeholder="Dermatitis kontak amonia, NIHL, suspek pneumokoniosis..."
                      className="w-full px-2.5 py-1 text-xs bg-white border border-slate-300 rounded font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-0.5">
                      Riwayat Kecelakaan Kerja :
                    </label>
                    <input
                      id="input-kak"
                      type="text"
                      disabled={disabled}
                      value={data.riwayatKecelakaanKerja || ''}
                      onChange={(e) => onChange({ riwayatKecelakaanKerja: e.target.value })}
                      placeholder="Terkena percikan kimia thn 2021 (sembuh sempurna)..."
                      className="w-full px-2.5 py-1 text-xs bg-white border border-slate-300 rounded font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-0.5">
                      Riwayat Pengobatan Rutin:
                    </label>
                    <input
                      id="input-pengobatan-rutin"
                      type="text"
                      disabled={disabled}
                      value={data.riwayatPengobatanRutin || ''}
                      onChange={(e) => onChange({ riwayatPengobatanRutin: e.target.value })}
                      placeholder="Amlodipine 5mg 1x1, Metformin 500mg, Simvastatin..."
                      className="w-full px-2.5 py-1 text-xs bg-white border border-slate-300 rounded font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-0.5">
                      Riwayat Vaksinasi / Imunisasi:
                    </label>
                    <input
                      id="input-vaksinasi"
                      type="text"
                      disabled={disabled}
                      value={data.riwayatVaksinasi || ''}
                      onChange={(e) => onChange({ riwayatVaksinasi: e.target.value })}
                      placeholder="Hepatitis B 3 dosis, Booster COVID-19, Tetanus..."
                      className="w-full px-2.5 py-1 text-xs bg-white border border-slate-300 rounded font-mono"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Gaya Hidup, Kebiasaan, & Riwayat Keluarga */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* PANEL 4: POLA HIDUP & KEBIASAAN SEHARI-HARI */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-50 text-indigo-700 rounded-lg">
                  <Cigarette className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-tight">
                    4. Kebiasaan &amp; Pola Hidup
                  </h3>
                </div>
              </div>
            </div>

            {/* Subsection Merokok Detail */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs font-black text-slate-800 cursor-pointer select-none">
                  <input
                    id="checkbox-merokok"
                    type="checkbox"
                    disabled={disabled}
                    checked={data.kebiasaan?.merokok || false}
                    onChange={(e) => handleHabitChange('merokok', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                  />
                  <span>KEBIASAAN MEROKOK</span>
                </label>
                {data.kebiasaan?.merokok && (
                  <span className="text-[10px] font-mono text-rose-600 font-bold">Perokok Aktif</span>
                )}
              </div>

              {data.kebiasaan?.merokok && (
                <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-200/80">
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Batang/Hari:</label>
                    <input
                      id="input-merokok-batang"
                      type="text"
                      disabled={disabled}
                      value={data.kebiasaan?.merokokBatangPerHari || ''}
                      onChange={(e) => handleHabitChange('merokokBatangPerHari', e.target.value)}
                      placeholder="12 btg"
                      className="w-full px-2 py-1 text-xs bg-white border border-slate-300 rounded font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Lama (Tahun):</label>
                    <input
                      id="input-merokok-tahun"
                      type="text"
                      disabled={disabled}
                      value={data.kebiasaan?.merokokLamaTahun || ''}
                      onChange={(e) => handleHabitChange('merokokLamaTahun', e.target.value)}
                      placeholder="8 thn"
                      className="w-full px-2 py-1 text-xs bg-white border border-slate-300 rounded font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Jenis:</label>
                    <select
                      disabled={disabled}
                      value={data.kebiasaan?.jenisRokok || 'Kretek'}
                      onChange={(e) => handleHabitChange('jenisRokok', e.target.value)}
                      className="w-full px-1.5 py-1 text-xs bg-white border border-slate-300 rounded"
                    >
                      <option value="Kretek">Kretek</option>
                      <option value="Filter">Filter</option>
                      <option value="Vape / Elektrik">Vape / Elektrik</option>
                      <option value="Cerutu">Cerutu</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Subsection Alkohol & Kopi */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer select-none">
                  <input
                    id="checkbox-minum-alkohol"
                    type="checkbox"
                    disabled={disabled}
                    checked={data.kebiasaan?.minumAlkohol || false}
                    onChange={(e) => handleHabitChange('minumAlkohol', e.target.checked)}
                    className="w-3.5 h-3.5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                  />
                  <span>MINUM ALKOHOL</span>
                </label>
                <input
                  id="input-minum-alkohol-ket"
                  type="text"
                  disabled={disabled || !data.kebiasaan?.minumAlkohol}
                  value={data.kebiasaan?.minumAlkohol ? (data.kebiasaan?.minumAlkoholKeterangan || '') : ''}
                  onChange={(e) => handleHabitChange('minumAlkoholKeterangan', e.target.value)}
                  placeholder={data.kebiasaan?.minumAlkohol ? 'Jenis / frekuensi...' : 'Tidak mengonsumsi'}
                  className="w-full px-2 py-1 text-[11px] bg-white border border-slate-300 rounded font-mono disabled:bg-slate-100 disabled:text-slate-400"
                />
              </div>

              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer select-none">
                  <input
                    id="checkbox-minum-kopi"
                    type="checkbox"
                    disabled={disabled}
                    checked={data.kebiasaan?.minumKopi || false}
                    onChange={(e) => handleHabitChange('minumKopi', e.target.checked)}
                    className="w-3.5 h-3.5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                  />
                  <span>KONSUMSI KOPI</span>
                </label>
                <input
                  id="input-minum-kopi-cangkir"
                  type="text"
                  disabled={disabled || !data.kebiasaan?.minumKopi}
                  value={data.kebiasaan?.minumKopi ? (data.kebiasaan?.minumKopiCangkirPerHari || '') : ''}
                  onChange={(e) => handleHabitChange('minumKopiCangkirPerHari', e.target.value)}
                  placeholder={data.kebiasaan?.minumKopi ? 'Cth: 1-2 cangkir/hari' : 'Tidak rutin ngopi'}
                  className="w-full px-2 py-1 text-[11px] bg-white border border-slate-300 rounded font-mono disabled:bg-slate-100 disabled:text-slate-400"
                />
              </div>
            </div>

            {/* Subsection Olahraga & Tidur */}
            <div className="p-3 bg-blue-50/40 border border-blue-200/80 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs font-black text-blue-900 cursor-pointer select-none">
                  <input
                    id="checkbox-olahraga"
                    type="checkbox"
                    disabled={disabled}
                    checked={data.olahraga || false}
                    onChange={(e) => onChange({ olahraga: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                  />
                  <span>AKTIVITAS FISIK / OLAHRAGA RUTIN</span>
                </label>
                <span className="text-[10px] text-blue-700 font-semibold">Min. 150 menit/mgg</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  id="input-olahraga-ket"
                  type="text"
                  disabled={disabled || !data.olahraga}
                  value={data.olahraga ? (data.olahragaKeterangan || '') : ''}
                  onChange={(e) => onChange({ olahragaKeterangan: e.target.value })}
                  placeholder={data.olahraga ? 'Jenis: Jogging, futsal, renang, gowes...' : 'Jarang / tidak olahraga'}
                  className="w-full px-2.5 py-1 text-xs bg-white border border-blue-200 rounded font-mono disabled:bg-slate-100 disabled:text-slate-400"
                />
                <input
                  id="input-olahraga-frekuensi"
                  type="text"
                  disabled={disabled || !data.olahraga}
                  value={data.olahraga ? (data.olahragaFrekuensi || '') : ''}
                  onChange={(e) => onChange({ olahragaFrekuensi: e.target.value })}
                  placeholder="Frekuensi: 2-3x per minggu @ 30 menit"
                  className="w-full px-2.5 py-1 text-xs bg-white border border-blue-200 rounded font-mono disabled:bg-slate-100 disabled:text-slate-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-blue-200/60 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-700 block mb-0.5">Durasi Istirahat / Tidur:</span>
                  <input
                    id="input-pola-tidur"
                    type="text"
                    disabled={disabled}
                    value={data.kebiasaan?.polaTidurJamPerHari || ''}
                    onChange={(e) => handleHabitChange('polaTidurJamPerHari', e.target.value)}
                    placeholder="7-8 jam per hari"
                    className="w-full px-2 py-1 text-[11px] bg-white border border-slate-300 rounded font-mono"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-700 block mb-0.5">Kepatuhan APD di Pabrik:</span>
                  <select
                    disabled={disabled}
                    value={data.kebiasaan?.penggunaanApd || 'Lengkap Sesuai Matriks'}
                    onChange={(e) => handleHabitChange('penggunaanApd', e.target.value)}
                    className="w-full px-2 py-1 text-[11px] bg-white border border-slate-300 rounded font-semibold text-slate-800"
                  >
                    <option value="Lengkap Sesuai Matriks">Lengkap Sesuai Matriks</option>
                    <option value="Kadang-kadang">Kadang-kadang</option>
                    <option value="Jarang / Tidak Pakai">Jarang / Tidak Pakai</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Kebiasaan Lain-lain */}
            <div className="space-y-1.5 pt-1">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer select-none">
                <input
                  id="checkbox-kebiasaan-lain"
                  type="checkbox"
                  disabled={disabled}
                  checked={data.kebiasaan?.lainLain || false}
                  onChange={(e) => handleHabitChange('lainLain', e.target.checked)}
                  className="w-3.5 h-3.5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                />
                <span>KEBIASAAN LAINNYA</span>
              </label>
              <input
                id="input-kebiasaan-lain-ket"
                type="text"
                disabled={disabled || !data.kebiasaan?.lainLain}
                value={data.kebiasaan?.lainLain ? (data.kebiasaan?.lainLainKeterangan || '') : ''}
                onChange={(e) => handleHabitChange('lainLainKeterangan', e.target.value)}
                placeholder={data.kebiasaan?.lainLain ? 'Keterangan kebiasaan spesifik lainnya...' : ''}
                className="w-full px-2.5 py-1 text-xs border rounded font-mono disabled:bg-slate-100 disabled:text-slate-400"
              />
            </div>
          </div>

          {/* PANEL 5: RIWAYAT PENYAKIT KELUARGA (RPK) */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-purple-50 text-purple-700 rounded-lg">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-tight">
                    5. Riwayat Penyakit Keluarga
                  </h3>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <label className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded hover:border-purple-300 cursor-pointer select-none">
                <input
                  id="checkbox-keluarga-darah-tinggi"
                  type="checkbox"
                  disabled={disabled}
                  checked={data.riwayatPenyakitKeluarga?.darahTinggi || false}
                  onChange={(e) => handleFamilyHistoryChange('darahTinggi', e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500 cursor-pointer"
                />
                <span className="font-semibold text-slate-800">Darah Tinggi (Hipertensi)</span>
              </label>

              <label className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded hover:border-purple-300 cursor-pointer select-none">
                <input
                  id="checkbox-keluarga-kencing-manis"
                  type="checkbox"
                  disabled={disabled}
                  checked={data.riwayatPenyakitKeluarga?.kencingManis || false}
                  onChange={(e) => handleFamilyHistoryChange('kencingManis', e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500 cursor-pointer"
                />
                <span className="font-semibold text-slate-800">Kencing Manis (Diabetes)</span>
              </label>

              <label className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded hover:border-purple-300 cursor-pointer select-none">
                <input
                  id="checkbox-keluarga-jantung"
                  type="checkbox"
                  disabled={disabled}
                  checked={data.riwayatPenyakitKeluarga?.jantung || false}
                  onChange={(e) => handleFamilyHistoryChange('jantung', e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500 cursor-pointer"
                />
                <span className="font-semibold text-slate-800">Penyakit Jantung</span>
              </label>

              <label className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded hover:border-purple-300 cursor-pointer select-none">
                <input
                  id="checkbox-keluarga-stroke"
                  type="checkbox"
                  disabled={disabled}
                  checked={data.riwayatPenyakitKeluarga?.stroke || false}
                  onChange={(e) => handleFamilyHistoryChange('stroke', e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500 cursor-pointer"
                />
                <span className="font-semibold text-slate-800">Stroke</span>
              </label>

              <label className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded hover:border-purple-300 cursor-pointer select-none">
                <input
                  id="checkbox-keluarga-sesak-nafas"
                  type="checkbox"
                  disabled={disabled}
                  checked={data.riwayatPenyakitKeluarga?.sesakNafas || false}
                  onChange={(e) => handleFamilyHistoryChange('sesakNafas', e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500 cursor-pointer"
                />
                <span className="font-semibold text-slate-800">Asma / Sesak Napas</span>
              </label>

              <label className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded hover:border-purple-300 cursor-pointer select-none">
                <input
                  id="checkbox-keluarga-alergi"
                  type="checkbox"
                  disabled={disabled}
                  checked={data.riwayatPenyakitKeluarga?.alergi || false}
                  onChange={(e) => handleFamilyHistoryChange('alergi', e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500 cursor-pointer"
                />
                <span className="font-semibold text-slate-800">Alergi Berat</span>
              </label>

              <label className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded hover:border-purple-300 cursor-pointer select-none">
                <input
                  id="checkbox-keluarga-kanker"
                  type="checkbox"
                  disabled={disabled}
                  checked={data.riwayatPenyakitKeluarga?.kanker || false}
                  onChange={(e) => handleFamilyHistoryChange('kanker', e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500 cursor-pointer"
                />
                <span className="font-semibold text-slate-800">Kanker / Tumor</span>
              </label>

              <label className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded hover:border-purple-300 cursor-pointer select-none">
                <input
                  id="checkbox-keluarga-ginjal"
                  type="checkbox"
                  disabled={disabled}
                  checked={data.riwayatPenyakitKeluarga?.ginjal || false}
                  onChange={(e) => handleFamilyHistoryChange('ginjal', e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500 cursor-pointer"
                />
                <span className="font-semibold text-slate-800">Penyakit Ginjal</span>
              </label>
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-1.5">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer select-none">
                <input
                  id="checkbox-keluarga-lain-lain"
                  type="checkbox"
                  disabled={disabled}
                  checked={data.riwayatPenyakitKeluarga?.lainLain || false}
                  onChange={(e) => handleFamilyHistoryChange('lainLain', e.target.checked)}
                  className="w-3.5 h-3.5 text-purple-600 rounded border-slate-300 focus:ring-purple-500 cursor-pointer"
                />
                <span>PENYAKIT KELUARGA LAINNYA</span>
              </label>
              <input
                id="input-keluarga-lain-ket"
                type="text"
                disabled={disabled || !data.riwayatPenyakitKeluarga?.lainLain}
                value={data.riwayatPenyakitKeluarga?.lainLain ? (data.riwayatPenyakitKeluarga?.lainLainKeterangan || '') : ''}
                onChange={(e) => handleFamilyHistoryChange('lainLainKeterangan', e.target.value)}
                placeholder={data.riwayatPenyakitKeluarga?.lainLain ? 'Keterangan penyakit keluarga lain...' : ''}
                className="w-full px-2.5 py-1 text-xs border rounded font-mono disabled:bg-slate-100 disabled:text-slate-400"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      {onNextTab && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
            <span>Tahap 1 dari 6: <strong className="text-slate-800">Pemeriksaan Umum / Anamnesis Klinis</strong></span>
          </div>
          <button
            id="btn-next-to-fisik"
            type="button"
            onClick={onNextTab}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm shadow-blue-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>Lanjut ke FISIK</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
