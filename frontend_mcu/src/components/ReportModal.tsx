import React, { useRef } from 'react';
import { MCURecord } from '../types';
import { formatIndonesianDate, detectAbnormalities } from '../utils/mcuHelpers';
import { Printer, X, Download, FileText } from 'lucide-react';
import * as XLSX from 'xlsx';
import { RsPusriLogo } from './RsPusriLogo';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: MCURecord;
}

export const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, record }) => {
  const printableRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !record) return null;

  const detectedIssues = detectAbnormalities(record);
  const isLaki = record?.jenisKelamin === 'L';
  const statusPemkes = (record?.hasilPemkes || 'Fit').toUpperCase();

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();

    const dataRows = [
      ['RUMAH SAKIT PT PUSRI PALEMBANG'],
      ['HASIL PEMERIKSAAN KESEHATAN BERKALA (MEDICAL CHECK UP)'],
      [''],
      ['No. Badge', record.badge || '-'],
      ['Nama Lengkap', record.nama || '-'],
      ['Jenis Kelamin', isLaki ? 'Laki-laki (Rutin 1 Tahun)' : 'Perempuan (Rutin 2 Tahun)'],
      ['Umur', `${record.umur || 0} Tahun`],
      ['Golongan Darah', record.golDarah || '-'],
      ['Shift / Non-Shift', record.shift || '-'],
      ['Departemen / Bagian', record.bagian || '-'],
      ['Tanggal Pemeriksaan', record.tanggal || '-'],
      ['Dokter Pemeriksa', record.dokter || '-'],
      ['Jadwal MCU Rutin Berikutnya', record.tanggalMCUBerikutnya || '-'],
      [''],
      ['=== TANDA VITAL & FISIK ===', ''],
      ['Tekanan Darah', `${record.tandaVital?.tekananDarahSistolik || '-'}/${record.tandaVital?.tekananDarahDiastolik || '-'} mmHg`],
      ['Nadi', `${record.tandaVital?.nadi || '-'} x/menit`],
      ['Pernafasan', `${record.tandaVital?.pernafasan || '-'} x/menit`],
      ['Suhu', `${record.tandaVital?.suhu || '-'} °C`],
      ['Berat / Tinggi Badan', `${record.tandaVital?.beratBadan || '-'} kg / ${record.tandaVital?.tinggiBadan || '-'} cm`],
      ['Kulit dan Rambut', record.tandaVital?.kulitDanRambut || 'normal'],
      ['KES. FISIK', record.tandaVital?.kesFisik || 'DBN'],
      ['O Lengan / % Lemak', `${record.tandaVital?.oLengan || '-'} cm / ${record.tandaVital?.persenLemak || '-'} %`],
      ['O Perut', `${record.tandaVital?.oPerut || record.tandaVital?.lingkarPerut || '-'} cm`],
      ['Visus Tanpa KM', record.mata?.visusTanpaKM || 'OD : E OS : E'],
      ['Penyakit Mata / Refraksi', `${record.mata?.penyakitMata || 'normal'} / ${record.mata?.refraksiMataRL || '-'}`],
      ['Conjungtiva / Sclera', `${record.mata?.conjungtiva || 'normal'} / ${record.mata?.sclera || 'normal'}`],
      ['KES. MATA', record.mata?.kesMata || 'DBN'],
      ['THT (Telinga / Hidung / Tenggorokan)', `${record.tht?.telinga || 'normal'} / ${record.tht?.hidung || 'normal'} / ${record.tht?.kerongkongan || 'normal'}`],
      ['KES. THT', record.tht?.kesTHT || 'DBN'],
      ['Genetalia & Anorectal (Hernia / Haemorroid)', `${record.genetaliaAnorectal?.hernia || 'normal'} / ${record.genetaliaAnorectal?.haemorroid || 'normal'}`],
      ['Leher / JVP / Struma', `${record.genetaliaAnorectal?.leher || 'normal'} / ${record.genetaliaAnorectal?.jvp || 'normal'} / ${record.genetaliaAnorectal?.struma || 'normal'}`],
      ['Rontgen Thorax', `${record.penunjangFisik?.rontgenKesimpulan || '-'} - ${record.penunjangFisik?.rontgenThorax || '-'}`],
      ['EKG', `${record.penunjangFisik?.ekgKesimpulan || '-'} - ${record.penunjangFisik?.ekg || '-'}`],
      ['Audiometri', `${record.penunjangFisik?.audiometriKesimpulan || '-'} - ${record.penunjangFisik?.audiometri || '-'}`],
      ['Spirometri', `${record.penunjangFisik?.spirometriKesimpulan || '-'} - ${record.penunjangFisik?.spirometri || '-'}`],
      [''],
      ['=== LABORATORIUM & KIMIA KLINIK ===', ''],
      ['Hemoglobin (Hb)', `${record.hematologi?.hemoglobin || '-'} g/dL`],
      ['Leukosit', `${record.hematologi?.leukosit || '-'} /µL`],
      ['Trombosit', `${record.hematologi?.trombosit || '-'} /µL`],
      ['LED (BBS)', `${record.hematologi?.led || '-'} mm/jam`],
      ['SGOT / AST', `${record.kimiaKlinik?.fungsiHati?.sgot || '-'} U/L`],
      ['SGPT / ALT', `${record.kimiaKlinik?.fungsiHati?.sgpt || '-'} U/L`],
      ['Ureum', `${record.kimiaKlinik?.fungsiGinjal?.ureum || '-'} mg/dL`],
      ['Kreatinin', `${record.kimiaKlinik?.fungsiGinjal?.kreatinin || '-'} mg/dL`],
      ['Asam Urat', `${record.kimiaKlinik?.fungsiGinjal?.asamUrat || '-'} mg/dL`],
      ['Kolesterol Total', `${record.kimiaKlinik?.profilLipid?.kolesterolTotal || '-'} mg/dL`],
      ['HDL / LDL', `${record.kimiaKlinik?.profilLipid?.hdl || '-'} / ${record.kimiaKlinik?.profilLipid?.ldl || '-'} mg/dL`],
      ['Trigliserida', `${record.kimiaKlinik?.profilLipid?.trigliserida || '-'} mg/dL`],
      ['Glukosa Puasa (GDP)', `${record.kimiaKlinik?.glukosa?.gulaDarahPuasa || '-'} mg/dL`],
      ['HbA1c', `${record.kimiaKlinik?.glukosa?.hba1c || '-'} %`],
      ['HBsAg', record.kimiaKlinik?.serologiNarkoba?.hbsAg || 'Negatif'],
      ['Skrining Narkoba', `AMP:${record.kimiaKlinik?.serologiNarkoba?.amp || 'Negatif'}, THC:${record.kimiaKlinik?.serologiNarkoba?.thc || 'Negatif'}`],
      [''],
      ['=== KESIMPULAN & SARAN ===', ''],
      ['Hasil Pemkes (Status Kebugaran)', record.hasilPemkes || 'Fit'],
      ['Kesimpulan Umum', record.kesimpulanUmum || '-'],
      ['Saran Umum', record.saranUmum || '-'],
      ['Kesimpulan Fisik (1)', record.kesimpulanFisik || '-'],
      ['Saran Fisik (1)', record.saranFisik || '-'],
      ['Kesimpulan Fisik (2)', record.kesimpulanFisik2 || '-'],
      ['Saran Fisik (2)', record.saranFisik2 || '-'],
      ['Kesimpulan Laboratorium', record.kesimpulanLab || '-'],
      ['Saran Laboratorium', record.saranLab || '-'],
      ['Kesimpulan Kimia Klinik', record.kesimpulanKimia || '-'],
      ['Saran Kimia Klinik', record.saranKimia || '-'],
      ['Kesimpulan Medis Resume', record.kesimpulan || '-'],
      ['Saran & Rekomendasi Akhir', record.saran || '-']
    ];

    const ws = XLSX.utils.aoa_to_sheet(dataRows);
    XLSX.utils.book_append_sheet(wb, ws, 'MCU Report');
    XLSX.writeFile(wb, `MCU_Report_${record.badge || 'unknown'}_${record.testTahun || '2026'}.xlsx`);
  };

  // Helper Pengecekan Hasil Normal Pemeriksaan Fisik
  const checkNormalText = (val?: string) => {
    if (!val || val === '-') return true;
    const lower = val.toLowerCase();
    return lower.includes('normal') || lower.includes('dbn');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 print:p-0 print:bg-white print:block">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-300 overflow-hidden flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:border-none print:w-full print:max-w-none print:block">
        
        {/* Header Navigation */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-800 text-white print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            <h2 className="font-bold text-sm tracking-wide">LEMBAR LAPORAN MEDICAL CHECK UP (MCU) RS PT PUSRI</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportExcel}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Excel</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div ref={printableRef} className="p-6 sm:p-8 print:p-0 overflow-y-auto print:overflow-visible print:h-auto space-y-4 print:space-y-2.5 text-slate-800 text-xs print:block">
          
          {/* Kop Surat */}
          <div className="border-b-2 border-slate-900 pb-2.5 flex items-center justify-between break-inside-avoid">
            <div className="flex items-center gap-3">
              <div className="w-12 h-14 flex items-center justify-center shrink-0">
                <img
                  src="/logo.png"
                  alt="Logo Resmi PT Pusri Palembang"
                  className="max-h-14 w-auto object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 uppercase leading-snug">
                  RUMAH SAKIT PT PUSRI PALEMBANG
                </h1>
                <p className="text-[10px] text-slate-600">
                   Komp. PT PUSRI, Jl. May Zen, Sei Selayur, Kec. Kalidoni, Kota Palembang, Sumatera Selatan 30118
                </p>
                <p className="text-[9px] text-slate-500 font-mono">
                  Unit Pelayanan Kesehatan Kerja &amp; Medical Check Up (MCU) &bull; Telp: (0711) 712222 &bull; PT Pupuk Indonesia Group
                </p>
              </div>
            </div>
            <div className="text-right flex flex-col items-end gap-0.5 shrink-0">
              <RsPusriLogo size="sm" variant="color" />
              <div className="text-[9px] uppercase font-bold text-slate-400">
                No. Dokumen: <span className="font-mono text-slate-800 font-bold">{record.id || '-'}</span>
              </div>
              <div className="text-[9px] text-emerald-700 font-semibold">Tahun MCU: {record.testTahun || '2026'}</div>
            </div>
          </div>

          <div className="text-center py-0.5 break-inside-avoid">
            <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 underline decoration-slate-400">
              HASIL PEMERIKSAAN KESEHATAN BERKALA (MCU RUTIN)
            </h2>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Kebijakan Rutin: Laki-laki 1 Tahun Sekali | Perempuan 2 Tahun Sekali
            </p>
          </div>

          {/* Biodata Karyawan */}
          <div className="bg-slate-50 border border-slate-300 rounded-lg p-2.5 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs break-inside-avoid">
            <div>
              <span className="text-[9px] text-slate-500 block">No. Badge:</span>
              <strong className="font-mono text-slate-900">{record.badge || '-'}</strong>
            </div>
            <div>
              <span className="text-[9px] text-slate-500 block">Nama Karyawan:</span>
              <strong className="text-slate-900 uppercase">{record.nama || '-'}</strong>
            </div>
            <div>
              <span className="text-[9px] text-slate-500 block">Jenis Kelamin / Umur:</span>
              <strong>{isLaki ? 'Laki-laki' : 'Perempuan'} / {record.umur || '-'} Thn</strong>
            </div>
            <div>
              <span className="text-[9px] text-slate-500 block">Gol. Darah &amp; Shift:</span>
              <strong>Gol: {record.golDarah || '-'} &bull; {record.shift === 'S' ? 'Shift' : 'Non-Shift'}</strong>
            </div>
            <div className="col-span-2">
              <span className="text-[9px] text-slate-500 block">Unit Kerja / Bagian:</span>
              <strong className="text-slate-800">{record.bagian || '-'}</strong>
            </div>
            <div>
              <span className="text-[9px] text-slate-500 block">Tanggal MCU:</span>
              <strong>{formatIndonesianDate(record.tanggal || '')}</strong>
            </div>
            <div>
              <span className="text-[9px] text-slate-500 block">Dokter Pemeriksa:</span>
              <strong className="text-slate-800">{record.dokter || '-'}</strong>
            </div>
          </div>

          {/* Anamnesis */}
          <div className="border border-slate-300 rounded-lg p-2.5 bg-slate-50/50 space-y-1.5 break-inside-avoid">
            <h3 className="font-bold text-xs uppercase text-slate-800 pb-0.5 border-b border-slate-200 flex items-center justify-between">
              <span>ANAMNESIS, KELUHAN &amp; RIWAYAT KESEHATAN KERJA</span>
              <span className="text-[9px] text-slate-500 font-normal">Data Medis Subyektif</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              <div className="space-y-1.5">
                <div className="bg-white p-2 rounded border border-slate-200 space-y-0.5">
                  <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider leading-none">
                    KELUHAN SEKARANG:
                  </span>
                  <p className="text-slate-900 font-medium text-xs leading-tight">
                    {record.keluhanSekarang || 'Tidak ada keluhan klinis (Sehat)'}
                  </p>
                </div>

                <div className="bg-white p-1.5 rounded border border-slate-200 space-y-0.5">
                  <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider">
                    RIWAYAT PENYAKIT DAHULU (RPD):
                  </span>
                  <p className="text-slate-800 text-xs leading-tight">
                    {record.riwayatPenyakit || 'Tidak ada riwayat penyakit kronis atau operasi'}
                    {record.riwayatPenyakitDahulu?.riwayatOperasi && ` (Operasi: ${record.riwayatPenyakitDahulu.riwayatOperasi})`}
                  </p>
                </div>

                <div className={`p-1.5 rounded border space-y-0.5 ${
                  record.alergiObat && String(record.alergiObat) !== 'Tidak Ada' && String(record.alergiObat) !== 'false' && String(record.alergiObat) !== '0'
                    ? 'bg-rose-50 border-rose-300 text-rose-900 font-bold'
                    : 'bg-white border-slate-200 text-slate-800'
                }`}>
                  <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider">
                    ALERGI OBAT &amp; MAKANAN:
                  </span>
                  <p className="text-xs leading-tight font-medium">
                    {record.alergiObatKeterangan || (String(record.alergiObat) !== 'false' && String(record.alergiObat) !== 'Tidak Ada' && String(record.alergiObat) !== '0' ? String(record.alergiObat) : null)
                      ? `Alergi Obat: ${record.alergiObatKeterangan || record.alergiObat}`
                      : 'Tidak ada alergi obat'}
                    {record.alergiMakanan && record.alergiMakanan !== 'Tidak ada' && record.alergiMakanan !== 'Tidak Ada' && ` • Alergi Makanan: ${record.alergiMakanan}`}
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="bg-white p-1.5 rounded border border-slate-200 space-y-0.5">
                  <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider">
                    KEBIASAAN &amp; GAYA HIDUP:
                  </span>
                  <div className="text-slate-800 space-y-0.5 text-xs">
                    <div>
                      • Merokok: <strong>{record.kebiasaan?.merokok ? `Ya (${record.kebiasaan.merokokBatangPerHari || '10'}, ${record.kebiasaan.jenisRokok || 'Kretek'})` : 'Tidak Merokok'}</strong>
                    </div>
                    <div>
                      • Alkohol: {record.kebiasaan?.minumAlkohol ? (record.kebiasaan.minumAlkoholKeterangan || 'Ya') : 'Tidak'} • Olahraga: {record.olahraga ? (record.olahragaKeterangan || 'Rutin') : 'Jarang'}
                    </div>
                    <div>
                      • Jam Tidur: {record.kebiasaan?.polaTidurJamPerHari || '7-8 jam/hari'} • APD: {record.kebiasaan?.penggunaanApd || 'Sesuai Matriks'}
                    </div>
                  </div>
                </div>

                <div className="bg-white p-1.5 rounded border border-slate-200 space-y-0.5">
                  <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider">
                    RIWAYAT PENYAKIT KELUARGA:
                  </span>
                  <p className="text-slate-800 text-xs leading-tight">
                    {[
                      record.riwayatPenyakitKeluarga?.darahTinggi ? 'Hipertensi' : null,
                      record.riwayatPenyakitKeluarga?.kencingManis ? 'Diabetes' : null,
                      record.riwayatPenyakitKeluarga?.jantung ? 'Penyakit Jantung' : null,
                      record.riwayatPenyakitKeluarga?.stroke ? 'Stroke' : null,
                      record.riwayatPenyakitKeluarga?.sesakNafas ? 'Asma/Paru' : null,
                      record.riwayatPenyakitKeluarga?.alergi ? 'Alergi' : null,
                      record.riwayatPenyakitKeluarga?.kanker ? 'Kanker' : null,
                      record.riwayatPenyakitKeluarga?.ginjal ? 'Ginjal' : null,
                      record.riwayatPenyakitKeluarga?.lainLain ? record.riwayatPenyakitKeluarga.lainLainKeterangan : null
                    ].filter(Boolean).join(', ') || 'Tidak ada riwayat penyakit herediter/keluarga'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabel Hasil Penunjang */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {/* SECTION 1: TANDA VITAL & FISIK PENUNJANG */}
            <div className="border border-slate-300 rounded-lg p-2 bg-white break-inside-avoid">
              <h3 className="font-bold text-xs uppercase text-slate-800 pb-0.5 mb-1 border-b border-slate-200">
                1. Tanda Vital &amp; Fisik Penunjang
              </h3>
              <table className="w-full text-xs">
                <tbody>
                  {/* Tekanan Darah */}
                  {(() => {
                    const sis = parseFloat(String(record.tandaVital?.tekananDarahSistolik || '0'));
                    const dia = parseFloat(String(record.tandaVital?.tekananDarahDiastolik || '0'));
                    const isHyper = sis >= 140 || dia >= 90;
                    const isPreHyper = (sis >= 120 && sis < 140) || (dia >= 80 && dia < 90);

                    return (
                      <tr className="border-b border-slate-100">
                        <td className="py-0.5 text-slate-600">Tekanan Darah:</td>
                        <td className="py-0.5 font-mono">
                          <span className={isHyper ? 'text-red-600 font-black' : isPreHyper ? 'text-amber-700 font-bold' : 'text-slate-900 font-bold'}>
                            {record.tandaVital?.tekananDarahSistolik || '-'}/{record.tandaVital?.tekananDarahDiastolik || '-'} mmHg
                          </span>
                          {isHyper && (
                            <span className="ml-1 text-[9px] bg-red-100 border border-red-300 text-red-700 px-1 py-0.2 rounded font-bold uppercase">
                              *Hipertensi
                            </span>
                          )}
                          {isPreHyper && (
                            <span className="ml-1 text-[9px] bg-amber-100 border border-amber-300 text-amber-800 px-1 py-0.2 rounded font-bold uppercase">
                              *Prehipertensi
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })()}

                  <tr className="border-b border-slate-100">
                    <td className="py-0.5 text-slate-600">Nadi / Pernafasan:</td>
                    <td className="py-0.5 font-mono">
                      {record.tandaVital?.nadi || '-'} x/m &bull; {record.tandaVital?.pernafasan || '-'} x/m
                    </td>
                  </tr>

                  {/* BB / TB / BMI */}
                  {(() => {
                    const bb = parseFloat(String(record.tandaVital?.beratBadan || '0'));
                    const tb = parseFloat(String(record.tandaVital?.tinggiBadan || '0'));
                    
                    let bmi = parseFloat(String(record.tandaVital?.bmi || '0'));
                    if ((!bmi || isNaN(bmi)) && bb > 0 && tb > 0) {
                      const tbMeter = tb / 100;
                      bmi = parseFloat((bb / (tbMeter * tbMeter)).toFixed(1));
                    }

                    const isObese = bmi >= 27.0;
                    const isOverweight = bmi >= 25.0 && bmi < 27.0;
                    const isUnderweight = bmi > 0 && bmi < 18.5;

                    return (
                      <tr className="border-b border-slate-100">
                        <td className="py-0.5 text-slate-600">BB / TB / BMI:</td>
                        <td className="py-0.5 font-mono">
                          <span className={isObese ? 'text-red-600 font-black' : isOverweight || isUnderweight ? 'text-amber-700 font-bold' : 'text-slate-900'}>
                            {record.tandaVital?.beratBadan || '-'} kg
                          </span>
                          {' / '}
                          <span>{record.tandaVital?.tinggiBadan || '-'} cm</span>
                          {' • '}
                          <strong className={isObese ? 'text-red-600 font-black' : isOverweight || isUnderweight ? 'text-amber-700 font-bold' : 'text-slate-900'}>
                            BMI {bmi > 0 ? bmi : record.tandaVital?.bmi || '-'}
                          </strong>
                          {isObese && (
                            <span className="ml-1 text-[9px] bg-red-100 border border-red-300 text-red-700 px-1 py-0.2 rounded font-bold uppercase">
                              *Obesitas
                            </span>
                          )}
                          {isOverweight && (
                            <span className="ml-1 text-[9px] bg-amber-100 border border-amber-300 text-amber-800 px-1 py-0.2 rounded font-bold uppercase">
                              *Kelebihan BB
                            </span>
                          )}
                          {isUnderweight && (
                            <span className="ml-1 text-[9px] bg-amber-100 border border-amber-300 text-amber-800 px-1 py-0.2 rounded font-bold uppercase">
                              *Gizi Kurang
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })()}

                  <tr className="border-b border-slate-100">
                    <td className="py-0.5 text-slate-600">Visus Mata / Buta Warna:</td>
                    <td className="py-0.5">
                      OD {record.mata?.visusOD || '-'}, OS {record.mata?.visusOS || '-'} &bull; {record.mata?.butaWarna || '-'}
                    </td>
                  </tr>

                  {/* Rontgen Thorax */}
                  {(() => {
                    const rontgenVal = record.penunjangFisik?.rontgenKesimpulan || '-';
                    const isNormal = checkNormalText(rontgenVal);
                    return (
                      <tr className="border-b border-slate-100">
                        <td className="py-0.5 text-slate-600">Rontgen Thorax:</td>
                        <td className="py-0.5 font-semibold">
                          <span className={!isNormal ? 'text-red-600 font-bold' : ''}>{rontgenVal}</span>
                          {!isNormal && (
                            <span className="ml-1 text-[9px] bg-red-100 text-red-700 px-1 py-0.2 rounded uppercase font-bold">*Perlu Evaluasi</span>
                          )}
                        </td>
                      </tr>
                    );
                  })()}

                  {/* EKG */}
                  {(() => {
                    const ekgVal = record.penunjangFisik?.ekgKesimpulan || '-';
                    const isNormal = checkNormalText(ekgVal);
                    return (
                      <tr className="border-b border-slate-100">
                        <td className="py-0.5 text-slate-600">Elektrokardiogram (EKG):</td>
                        <td className="py-0.5 font-semibold">
                          <span className={!isNormal ? 'text-red-600 font-bold' : ''}>{ekgVal}</span>
                          {!isNormal && (
                            <span className="ml-1 text-[9px] bg-red-100 text-red-700 px-1 py-0.2 rounded uppercase font-bold">*Perlu Evaluasi</span>
                          )}
                        </td>
                      </tr>
                    );
                  })()}

                  {/* Audiometri & Spirometri */}
                  {(() => {
                    const audioVal = record.penunjangFisik?.audiometriKesimpulan || '-';
                    const spiroVal = record.penunjangFisik?.spirometriKesimpulan || '-';
                    const audioNormal = checkNormalText(audioVal);
                    const spiroNormal = checkNormalText(spiroVal);

                    return (
                      <tr className="border-b border-slate-100">
                        <td className="py-0.5 text-slate-600">Audiometri &amp; Spirometri:</td>
                        <td className="py-0.5">
                          Audio: <span className={!audioNormal ? 'text-red-600 font-bold' : ''}>{audioVal}</span>
                          {!audioNormal && <span className="ml-0.5 text-[9px] bg-red-100 text-red-700 px-1 py-0.2 rounded font-bold uppercase">*Abnormal</span>}
                          {' • '}
                          Spiro: <span className={!spiroNormal ? 'text-red-600 font-bold' : ''}>{spiroVal}</span>
                          {!spiroNormal && <span className="ml-0.5 text-[9px] bg-red-100 text-red-700 px-1 py-0.2 rounded font-bold uppercase">*Abnormal</span>}
                        </td>
                      </tr>
                    );
                  })()}
                </tbody>
              </table>
            </div>

            {/* SECTION 2: LABORATORIUM & KIMIA KLINIK */}
            <div className="border border-slate-300 rounded-lg p-2 bg-white break-inside-avoid">
              <h3 className="font-bold text-xs uppercase text-slate-800 pb-0.5 mb-1 border-b border-slate-200">
                2. Hasil Laboratorium &amp; Kimia Darah
              </h3>
              <table className="w-full text-xs">
                <tbody>
                  {/* Hemoglobin */}
                  {(() => {
                    const maxHb = isLaki ? 17.5 : 15.5;
                    const minHb = isLaki ? 13.0 : 12.0;
                    const hbVal = parseFloat(String(record.hematologi?.hemoglobin || '0'));
                    const isHigh = hbVal > maxHb;
                    const isLow = hbVal > 0 && hbVal < minHb;

                    return (
                      <tr className="border-b border-slate-100">
                        <td className="py-0.5 text-slate-600">Hemoglobin (Hb):</td>
                        <td className={`py-0.5 font-mono font-bold ${isHigh ? 'text-red-600 font-black' : isLow ? 'text-amber-700 font-bold' : 'text-slate-900'}`}>
                          {record.hematologi?.hemoglobin || '-'} g/dL
                          {isHigh && <span className="ml-1 text-[9px] bg-red-100 border border-red-300 text-red-700 px-1 py-0.2 rounded uppercase font-bold">*Tinggi</span>}
                          {isLow && <span className="ml-1 text-[9px] bg-amber-100 border border-amber-300 text-amber-800 px-1 py-0.2 rounded uppercase font-bold">*Rendah (Anemia)</span>}
                        </td>
                      </tr>
                    );
                  })()}

                  {/* Leukosit & Trombosit */}
                  {(() => {
                    const leuko = parseFloat(String(record.hematologi?.leukosit || '0'));
                    const trombo = parseFloat(String(record.hematologi?.trombosit || '0'));
                    const leukoHigh = leuko > 10000;
                    const leukoLow = leuko > 0 && leuko < 4000;
                    const tromboHigh = trombo > 450000;
                    const tromboLow = trombo > 0 && trombo < 150000;

                    return (
                      <tr className="border-b border-slate-100">
                        <td className="py-0.5 text-slate-600">Leukosit / Trombosit:</td>
                        <td className="py-0.5 font-mono">
                          <span className={leukoHigh ? 'text-red-600 font-bold' : leukoLow ? 'text-amber-700 font-bold' : ''}>
                            {record.hematologi?.leukosit || '-'}
                          </span>
                          {' / '}
                          <span className={tromboHigh ? 'text-red-600 font-bold' : tromboLow ? 'text-amber-700 font-bold' : ''}>
                            {record.hematologi?.trombosit || '-'}
                          </span>
                          {(leukoHigh || tromboHigh) && (
                            <span className="ml-1 text-[9px] bg-red-100 border border-red-300 text-red-700 px-1 py-0.2 rounded font-bold uppercase">*Tinggi</span>
                          )}
                          {(leukoLow || tromboLow) && !(leukoHigh || tromboHigh) && (
                            <span className="ml-1 text-[9px] bg-amber-100 border border-amber-300 text-amber-800 px-1 py-0.2 rounded font-bold uppercase">*Rendah</span>
                          )}
                        </td>
                      </tr>
                    );
                  })()}

                  {/* SGOT / SGPT */}
                  {(() => {
                    const sgot = parseFloat(String(record.kimiaKlinik?.fungsiHati?.sgot || '0'));
                    const sgpt = parseFloat(String(record.kimiaKlinik?.fungsiHati?.sgpt || '0'));
                    const sgotHigh = sgot > 35;
                    const sgptHigh = sgpt > 45;
                    return (
                      <tr className="border-b border-slate-100">
                        <td className="py-0.5 text-slate-600">SGOT / SGPT (Fungsi Hati):</td>
                        <td className="py-0.5 font-mono">
                          <span className={sgotHigh ? 'text-red-600 font-bold' : ''}>{record.kimiaKlinik?.fungsiHati?.sgot || '-'}</span>
                          {' / '}
                          <span className={sgptHigh ? 'text-red-600 font-bold' : ''}>{record.kimiaKlinik?.fungsiHati?.sgpt || '-'}</span>
                          {' U/L'}
                          {(sgotHigh || sgptHigh) && (
                            <span className="ml-1 text-[9px] bg-red-100 border border-red-300 text-red-700 px-1 py-0.2 rounded uppercase font-bold">*Meningkat</span>
                          )}
                        </td>
                      </tr>
                    );
                  })()}

                  {/* Ureum / Kreatinin */}
                  {(() => {
                    const ureum = parseFloat(String(record.kimiaKlinik?.fungsiGinjal?.ureum || '0'));
                    const kreat = parseFloat(String(record.kimiaKlinik?.fungsiGinjal?.kreatinin || '0'));
                    const ureumHigh = ureum > 50;
                    const kreatHigh = kreat > 1.2;

                    return (
                      <tr className="border-b border-slate-100">
                        <td className="py-0.5 text-slate-600">Ureum / Kreatinin:</td>
                        <td className="py-0.5 font-mono">
                          <span className={ureumHigh ? 'text-red-600 font-bold' : ''}>{record.kimiaKlinik?.fungsiGinjal?.ureum || '-'}</span>
                          {' / '}
                          <span className={kreatHigh ? 'text-red-600 font-bold' : ''}>{record.kimiaKlinik?.fungsiGinjal?.kreatinin || '-'}</span>
                          {' mg/dL'}
                          {(ureumHigh || kreatHigh) && (
                            <span className="ml-1 text-[9px] bg-red-100 border border-red-300 text-red-700 px-1 py-0.2 rounded uppercase font-bold">*Meningkat</span>
                          )}
                        </td>
                      </tr>
                    );
                  })()}

                  {/* Asam Urat */}
                  {(() => {
                    const maxAU = isLaki ? 7.0 : 6.0;
                    const auVal = parseFloat(String(record.kimiaKlinik?.fungsiGinjal?.asamUrat || '0'));
                    const isHigh = auVal > maxAU;
                    return (
                      <tr className="border-b border-slate-100">
                        <td className="py-0.5 text-slate-600">Asam Urat:</td>
                        <td className={`py-0.5 font-mono font-bold ${isHigh ? 'text-red-600 font-black' : 'text-slate-900'}`}>
                          {record.kimiaKlinik?.fungsiGinjal?.asamUrat || '-'} mg/dL
                          {isHigh && <span className="ml-1 text-[9px] bg-red-100 border border-red-300 text-red-700 px-1 py-0.2 rounded uppercase font-bold">*Tinggi</span>}
                        </td>
                      </tr>
                    );
                  })()}

                  {/* Kolesterol Total / Trigliserida */}
                  {(() => {
                    const koles = parseFloat(String(record.kimiaKlinik?.profilLipid?.kolesterolTotal || '0'));
                    const trigli = parseFloat(String(record.kimiaKlinik?.profilLipid?.trigliserida || '0'));
                    const kolesHigh = koles >= 200;
                    const trigliHigh = trigli >= 150;

                    return (
                      <tr className="border-b border-slate-100">
                        <td className="py-0.5 text-slate-600">Kolesterol Total / Trigliserida:</td>
                        <td className="py-0.5 font-mono font-bold">
                          <span className={kolesHigh ? 'text-red-600 font-black' : 'text-slate-900'}>
                            {record.kimiaKlinik?.profilLipid?.kolesterolTotal || '-'}
                          </span>
                          {' / '}
                          <span className={trigliHigh ? 'text-red-600 font-black' : 'text-slate-900'}>
                            {record.kimiaKlinik?.profilLipid?.trigliserida || '-'}
                          </span>
                          {' mg/dL'}
                          {(kolesHigh || trigliHigh) && (
                            <span className="ml-1.5 text-[9px] bg-red-100 border border-red-300 text-red-700 px-1 py-0.5 rounded font-bold uppercase">
                              *Tinggi
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })()}

                  {/* Glukosa Darah Puasa (GDP) & HbA1c */}
                  {(() => {
                    const gdp = parseFloat(String(record.kimiaKlinik?.glukosa?.gulaDarahPuasa || '0'));
                    const hba1c = parseFloat(String(record.kimiaKlinik?.glukosa?.hba1c || '0'));
                    const isHighDiabetes = gdp >= 126 || hba1c >= 6.5;
                    const isBorderline = (gdp >= 100 && gdp < 126) || (hba1c >= 5.7 && hba1c < 6.5);

                    return (
                      <tr className="border-b border-slate-100">
                        <td className="py-0.5 text-slate-600">Glukosa Darah Puasa (GDP):</td>
                        <td className="py-0.5 font-mono font-bold">
                          <span className={isHighDiabetes ? 'text-red-600 font-black' : isBorderline ? 'text-amber-700 font-black' : 'text-slate-900'}>
                            {record.kimiaKlinik?.glukosa?.gulaDarahPuasa || '-'} mg/dL
                          </span>
                          {' ('}
                          <span>HbA1c: </span>
                          <span className={isHighDiabetes ? 'text-red-600 font-black' : isBorderline ? 'text-amber-700 font-black' : 'text-slate-900'}>
                            {record.kimiaKlinik?.glukosa?.hba1c || '-'}%
                          </span>
                          {')'}
                          {isHighDiabetes && (
                            <span className="ml-1.5 text-[9px] bg-red-100 border border-red-300 text-red-700 px-1 py-0.5 rounded font-bold uppercase">
                              *Tinggi
                            </span>
                          )}
                          {isBorderline && (
                            <span className="ml-1.5 text-[9px] bg-amber-100 border border-amber-300 text-amber-800 px-1 py-0.5 rounded font-bold uppercase">
                              *Borderline
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })()}

                  <tr className="border-b border-slate-100">
                    <td className="py-0.5 text-slate-600">HBsAg &amp; Immunologi:</td>
                    <td className="py-0.5">
                      {record.kimiaKlinik?.immunologi?.hbsAg || record.kimiaKlinik?.serologiNarkoba?.hbsAg || 'Negatif'} &bull; KES. LAB: {record.kimiaKlinik?.kesimpulanKimia?.kesLab || 'DBN'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Banner Status Pemkes - Rapi & Presisi */}
          <div className={`p-3 rounded-xl border-2 text-center relative flex flex-col items-center justify-center break-inside-avoid ${
            statusPemkes === 'FIT'
              ? 'bg-emerald-50 border-emerald-500 text-emerald-900'
              : statusPemkes === 'FIT WITH NOTE'
              ? 'bg-amber-50 border-amber-500 text-amber-900'
              : statusPemkes === 'TEMPORARY UNFIT'
              ? 'bg-orange-50 border-orange-500 text-orange-900'
              : 'bg-red-50 border-red-500 text-red-900'
          }`}>
            <div className="text-[10px] font-bold uppercase tracking-wider">Kategori Kelaikan Kesehatan Kerja</div>
            <div className="text-lg font-black tracking-wide my-0.5">
              HASIL PEMKES: {statusPemkes}
            </div>
            <div className="text-[11px] font-medium max-w-2xl">
              {statusPemkes === 'FIT' && 'Karyawan dinyatakan SEHAT & MEMENUHI SYARAT untuk bekerja pada posisi dan tugas yang bersangkutan.'}
              {statusPemkes === 'FIT WITH NOTE' && 'Karyawan dinyatakan MEMENUHI SYARAT BEKERJA DENGAN CATATAN / PEMBATASAN tertentu.'}
              {statusPemkes === 'TEMPORARY UNFIT' && 'Karyawan TIDAK MEMENUHI SYARAT SEMENTARA dan memerlukan evaluasi/pengobatan lanjutan.'}
              {statusPemkes === 'UNFIT' && 'Karyawan TIDAK MEMENUHI SYARAT KESEHATAN KERJA.'}
            </div>
          </div>

          {/* Kesimpulan & Saran Medis */}
          <div className="space-y-2.5">
            <div className="border border-slate-300 rounded-lg p-2.5 bg-white break-inside-avoid">
              <div className="flex items-center justify-between mb-1">
                <div className="font-bold text-slate-800 text-xs uppercase">Kesimpulan Pemeriksaan Medis:</div>
                {record.totalKardiovaskular && (
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-800 border border-blue-200 rounded">
                    Total Kardiovaskular: {record.totalKardiovaskular}
                  </span>
                )}
              </div>
              <p className="text-slate-700 whitespace-pre-line leading-relaxed">{record.kesimpulan || 'Tidak ada kesimpulan khusus.'}</p>
            </div>

            <div className="border border-slate-300 rounded-lg p-2.5 bg-white break-inside-avoid">
              <div className="font-bold text-slate-800 text-xs mb-1 uppercase">Saran Dokter &amp; Rekomendasi Tindak Lanjut:</div>
              <p className="text-slate-700 whitespace-pre-line leading-relaxed">{record.saran || 'Pertahankan pola hidup sehat.'}</p>
            </div>
          </div>

          {/* Next Schedule */}
          <div className="bg-slate-100 border border-slate-300 rounded-lg p-2.5 flex items-center justify-between break-inside-avoid">
            <div>
              <div className="font-bold text-slate-800">
                Jadwal Medical Check Up (MCU) Rutin Berkala Berikutnya:
              </div>
              <div className="text-[10px] text-slate-600">
                Sesuai regulasi RS PT Pusri ({isLaki ? 'Laki-laki 1 Tahun Sekali' : 'Perempuan 2 Tahun Sekali'})
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-black text-emerald-800 font-mono">
                {formatIndonesianDate(record.tanggalMCUBerikutnya || '')}
              </span>
            </div>
          </div>

          {/* Tanda Tangan */}
          <div className="pt-4 grid grid-cols-2 gap-8 text-center text-xs break-inside-avoid">
            <div>
              <p className="text-slate-500 mb-12">Karyawan / Pasien yang diperiksa,</p>
              <p className="font-bold text-slate-900 underline uppercase">{record.nama || '..............................'}</p>
              <p className="text-[10px] text-slate-500">Badge: {record.badge || '........'}</p>
            </div>

            <div>
              <p className="text-slate-500 mb-12">
                Palembang, {formatIndonesianDate(record.tanggal || '')}<br />
                Dokter Pemeriksa Kesehatan Kerja RS Pusri,
              </p>
              <p className="font-bold text-slate-900 underline uppercase">{record.dokter || 'DR. NURSYIRWAN, Sp.Ok'}</p>
              <p className="text-[10px] text-slate-500">SIP Dokter Penanggung Jawab MCU</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};