import React, { useState } from 'react';
import { MCURecord, Gender } from '../types';
import { calculateNextMCUDueDate } from '../utils/mcuHelpers';
import { UploadCloud, FileSpreadsheet, Download, X, CheckCircle, AlertTriangle, ShieldCheck, Lock } from 'lucide-react';
import * as XLSX from 'xlsx';

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportRecords: (newRecords: MCURecord[]) => void;
  isAdmin?: boolean;
  onRequestAdminLogin?: () => void;
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
  isOpen,
  onClose,
  onImportRecords,
  isAdmin = false,
  onRequestAdminLogin
}) => {
  const [parsedRows, setParsedRows] = useState<Partial<MCURecord>[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg('');
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsName = wb.SheetNames[0];
        const ws = wb.Sheets[wsName];
        const rawJson: any[] = XLSX.utils.sheet_to_json(ws, { defval: '' });

        if (rawJson.length === 0) {
          setErrorMsg('File excel kosong atau format kolom tidak sesuai.');
          return;
        }

        const formattedRecords: Partial<MCURecord>[] = rawJson.map((row, idx) => {
          const badge = String(row.BADGE || row.badge || row.Badge || `EMP-${idx + 100}`);
          const nama = String(row.NAMA || row.nama || row.Nama || 'Karyawan Baru');
          const genderRaw = String(row.GENDER || row.gender || row.JENIS_KELAMIN || row['L/P'] || 'L').toUpperCase();
          const jenisKelamin: Gender = genderRaw.startsWith('P') || genderRaw.startsWith('W') ? 'P' : 'L';
          const tanggal = String(row.TANGGAL || row.tanggal || new Date().toISOString().split('T')[0]);
          const testTahun = String(row.TAHUN || row.testTahun || tanggal.split('-')[0] || '2026');
          const { nextDate } = calculateNextMCUDueDate(tanggal, jenisKelamin);

          const isSpouse = Boolean(row.ISTRI_SUAMI || false);
          // Buat ID yang konsisten dan akurat berdasarkan badge dan tahun
          const correctId = isSpouse 
            ? `MCU-${testTahun}-${badge}-spouse` 
            : `MCU-${testTahun}-${badge}`;

          return {
            id: correctId,
            badge,
            nama,
            isSpouse,
            jenisKelamin,
            umur: Number(row.UMUR || row.umur || 35),
            golDarah: String(row.GOL_DARAH || row.golDarah || 'O'),
            shift: (String(row.SHIFT || 'S').toUpperCase().startsWith('N') ? 'NS' : 'S') as any,
            bagian: String(row.BAGIAN || row.bagian || 'Kompartemen Operasi (Pusri-IB / II / III / IV)'),
            dokter: String(row.DOKTER || 'DR. NURSYIRWAN, Sp.Ok'),
            tanggal,
            testTahun,
            periodeMCU: jenisKelamin === 'L' ? '1 Tahun' : '2 Tahun',
            tanggalMCUBerikutnya: nextDate,
            keluhanSekarang: String(row.KELUHAN || 'Tidak ada keluhan'),
            riwayatPenyakit: String(row.RIWAYAT_PENYAKIT || '-'),
            riwayatKehamilan: jenisKelamin === 'P' ? String(row.RIWAYAT_KEHAMILAN || '-') : '-',
            hasilPemkes: (row.HASIL_PEMKES || 'Fit') as any,
            kesimpulan: String(row.KESIMPULAN || 'Secara umum kondisi kesehatan baik.'),
            saran: String(row.SARAN || `Pertahankan pola hidup sehat. Jadwal MCU berikutnya: ${nextDate}`)
          };
        });

        setParsedRows(formattedRecords);
      } catch (err: any) {
        setErrorMsg('Gagal membaca file Excel: ' + (err?.message || 'Format tidak valid'));
      }
    };

    reader.readAsBinaryString(file);
  };

  const handleDownloadTemplate = () => {
    const templateData = [
      {
        BADGE: '10482',
        NAMA: 'AHMAD BUDIMAN, ST',
        GENDER: 'L',
        UMUR: 38,
        GOL_DARAH: 'O',
        SHIFT: 'S',
        BAGIAN: 'Kompartemen Operasi (Pusri-IB / II / III / IV)',
        TANGGAL: '2026-08-11',
        TAHUN: '2026',
        DOKTER: 'DR. NURSYIRWAN, Sp.Ok',
        KELUHAN: 'Tidak ada keluhan',
        RIWAYAT_PENYAKIT: '-',
        HASIL_PEMKES: 'Fit',
        KESIMPULAN: 'Kondisi kesehatan baik',
        SARAN: 'MCU Rutin 1 Thn sekali'
      },
      {
        BADGE: '20814',
        NAMA: 'NURUL HIDAYATI, S.Si',
        GENDER: 'P',
        UMUR: 32,
        GOL_DARAH: 'A',
        SHIFT: 'NS',
        BAGIAN: 'Departemen K3LH',
        TANGGAL: '2026-08-12',
        TAHUN: '2026',
        DOKTER: 'DR. RATNA DEWI, Sp.Ok',
        KELUHAN: 'Tidak ada keluhan',
        RIWAYAT_PENYAKIT: '-',
        HASIL_PEMKES: 'Fit',
        KESIMPULAN: 'Kondisi kesehatan baik',
        SARAN: 'MCU Rutin 2 Thn sekali'
      }
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(templateData);
    XLSX.utils.book_append_sheet(wb, ws, 'Template MCU Pusri');
    XLSX.writeFile(wb, 'Template_Import_MCU_RS_Pusri.xlsx');
  };

  const handleApplyImport = () => {
    if (parsedRows.length === 0) return;
    
    const fullRecords: MCURecord[] = parsedRows.map((p) => {
      const isLaki = p.jenisKelamin === 'L';
      return {
        id: p.id || `MCU-IMP-${Date.now()}`,
        badge: p.badge || '',
        nama: p.nama || '',
        isSpouse: p.isSpouse || false,
        tanggal: p.tanggal || new Date().toISOString().split('T')[0],
        umur: p.umur || 30,
        golDarah: p.golDarah || 'O',
        shift: p.shift || 'S',
        bagian: p.bagian || 'Kompartemen Operasi (Pusri-IB / II / III / IV)',
        dokter: p.dokter || 'DR. NURSYIRWAN, Sp.Ok',
        testTahun: p.testTahun || '2026',
        jenisKelamin: p.jenisKelamin || 'L',
        periodeMCU: isLaki ? '1 Tahun' : '2 Tahun',
        tanggalMCUBerikutnya: p.tanggalMCUBerikutnya || '',
        keluhanSekarang: p.keluhanSekarang || '',
        riwayatPenyakit: p.riwayatPenyakit || '',
        riwayatKehamilan: isLaki ? '-' : (p.riwayatKehamilan || ''),
        olahraga: false,
        alergiObat: false,
        kebiasaan: {
          merokok: false,
          minumAlkohol: false,
          lainLain: false
        },
        riwayatPenyakitKeluarga: {
          darahTinggi: false,
          kencingManis: false,
          gangguanPendengaran: false,
          stroke: false,
          sesakNafas: false,
          jantung: false,
          alergi: false,
          lainLain: false
        },
        tandaVital: {
          tekananDarahSistolik: '',
          tekananDarahDiastolik: '',
          nadi: '',
          pernafasan: '',
          suhu: '',
          beratBadan: '',
          tinggiBadan: '',
          bmi: '',
          bmiKategori: '',
          lingkarPerut: '',
        },
        mata: {
          visusOD: '',
          visusOS: '',
          kacamata: false,
          butaWarna: 'Normal',
          lapangPandang: 'Normal',
          konjungtiva: 'Normal',
          sklera: 'Normal'
        },
        tht: {
          telingaKanan: 'Normal',
          telingaKiri: 'Normal',
          hidung: 'Normal',
          tenggorokan: 'Normal',
          tonsil: 'T1-T1'
        },
        gigiMulut: {
          karies: 'Tidak ada',
          tambalan: 'Tidak ada',
          gigiHilang: '',
          kebersihan: 'Baik',
          catatanGigi: 'Baik'
        },
        pemeriksaanFisikLanjutan: {
          leher: 'Normal',
          kelenjarGetahBening: 'Normal',
          tiroid: 'Normal',
          jvp: 'Normal',
          dadaThorax: 'Normal',
          paru: 'Vesikuler normal',
          jantung: 'BJ I/II normal',
          abdomen: 'Normal',
          heparLien: 'Normal',
          ekstremitas: 'Normal',
          refleks: 'Normal',
          kulit: 'Normal'
        },
        penunjangFisik: {
          rontgenThorax: 'Cor & Pulmo normal',
          rontgenKesimpulan: 'Normal',
          ekg: 'Normal Sinus',
          ekgKesimpulan: 'Normal',
          audiometri: 'Normal',
          audiometriKesimpulan: 'Normal',
          spirometri: 'Normal',
          spirometriKesimpulan: 'Normal'
        },
        hematologi: {
          hemoglobin: '',
          hematokrit: '',
          leukosit: '',
          trombosit: '',
          led: '',
          eritrosit: '',
          hitungJenis: { basofil: '', eosinofil: '', batang: '', segmen: '', limfosit: '', monosit: '' }
        },
        urinLengkap: {
          warna: 'Kuning Jernih',
          kejernihan: 'Jernih',
          ph: '',
          beratJenis: '',
          proteinAlbumin: 'Negatif',
          glukosa: 'Negatif',
          bilirubin: 'Negatif',
          urobilinogen: 'Normal',
          sedimen: { leukosit: '0-1', eritrosit: '0', epitel: '+', kristal: '-', silinder: '-', bakteri: '-' }
        },
        kimiaKlinik: {
          fungsiHati: { sgot: '', sgpt: '', gammaGT: '', alkaliFosfatase: '', bilirubinTotal: '', bilirubinDirek: '' },
          fungsiGinjal: { ureum: '', kreatinin: '', asamUrat: '', egfr: '' },
          profilLipid: { kolesterolTotal: '', hdl: '', ldl: '', trigliserida: '' },
          glukosa: { gdp: '', gd2pp: '', hba1c: '' },
          serologiNarkoba: { hbsAg: 'Non-Reaktif', antiHCV: 'Non-Reaktif', amp: 'Negatif', thc: 'Negatif', mop: 'Negatif', bzo: 'Negatif' }
        },
        hasilPemkes: p.hasilPemkes || 'Fit',
        kesimpulan: p.kesimpulan || '',
        saran: p.saran || ''
      };
    });

    onImportRecords(fullRecords);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-300 overflow-hidden flex flex-col">
        
        <div className="flex items-center justify-between px-5 py-3.5 bg-emerald-800 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/15 p-0.5 flex items-center justify-center shrink-0 border border-white/20 overflow-hidden">
              <img
                src="/logo_sm.png"
                alt="Logo PT Pusri"
                className="h-full w-auto object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h2 className="font-bold text-sm leading-tight">IMPORT DATA MEDICAL CHECK UP (EXCEL)</h2>
              <p className="text-[11px] text-emerald-200">
                Impor Data Massal MCU Karyawan PT Pusri
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin ? (
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] bg-emerald-950/60 text-emerald-200 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">
                <ShieldCheck className="w-3 h-3 text-emerald-300" />
                <span>Mode Admin Aktif</span>
              </span>
            ) : (
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] bg-amber-950/60 text-amber-200 border border-amber-500/40 px-2 py-0.5 rounded-full font-bold">
                <Lock className="w-3 h-3 text-amber-300" />
                <span>Mode Terkunci</span>
              </span>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1 hover:bg-emerald-700 text-emerald-200 hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {!isAdmin ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200 shadow-xs">
              <Lock className="w-7 h-7" />
            </div>
            <div className="max-w-md mx-auto space-y-1.5">
              <h3 className="text-sm font-bold text-slate-900">
                Mode Administrator Diperlukan
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                 pengunggahan dan pengimporan data file Excel hanya dapat dilakukan dalam <strong>Mode Admin</strong>.
              </p>
            </div>
            <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 max-w-md mx-auto text-left flex items-start gap-2.5 text-[11px] text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                Silakan verifikasi PIN Admin Anda terlebih dahulu untuk membuka kunci fitur pengunggahan file Excel.
              </span>
            </div>
            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onRequestAdminLogin?.();
                }}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-700/20 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Masuk Mode Admin</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="p-5 space-y-4 text-xs">
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-emerald-900 flex items-start justify-between gap-3">
                <div>
                  <div className="font-bold">Format File Excel:</div>
                  <p className="text-[11px] text-emerald-800 mt-0.5">
                    Pastikan kolom berisi: BADGE, NAMA, GENDER (L/P), UMUR, GOL_DARAH, SHIFT, BAGIAN, TANGGAL, TAHUN, DOKTER, HASIL_PEMKES.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white border border-emerald-300 text-emerald-800 rounded font-semibold text-[11px] shadow-2xs hover:bg-emerald-100 transition-colors shrink-0 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Template</span>
                </button>
              </div>

              <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl p-6 text-center bg-slate-50 transition-all">
                <input
                  id="file-upload-excel"
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label htmlFor="file-upload-excel" className="cursor-pointer block space-y-2">
                  <UploadCloud className="w-10 h-10 text-emerald-600 mx-auto" />
                  <div className="font-bold text-slate-800">
                    {fileName ? fileName : 'Klik di sini atau seret file Excel (.xlsx / .csv)'}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Mendukung impor data massal MCU Karyawan PT Pusri
                  </div>
                </label>
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-50 text-red-800 border border-red-200 rounded-lg flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {parsedRows.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between font-bold text-slate-800">
                    <span className="flex items-center gap-1.5 text-emerald-700">
                      <CheckCircle className="w-4 h-4" />
                      <span>Berhasil membaca {parsedRows.length} baris data:</span>
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">Preview data</span>
                  </div>

                  <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg">
                    <table className="w-full text-[11px] text-left">
                      <thead className="bg-slate-100 text-slate-700 sticky top-0">
                        <tr>
                          <th className="p-2">Badge</th>
                          <th className="p-2">Nama</th>
                          <th className="p-2">Gender</th>
                          <th className="p-2">Siklus MCU</th>
                          <th className="p-2">Bagian</th>
                          <th className="p-2">Hasil</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {parsedRows.map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="p-2 font-mono font-bold">{row.badge}</td>
                            <td className="p-2 font-semibold">{row.nama}</td>
                            <td className="p-2">
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${row.jenisKelamin === 'L' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'}`}>
                                {row.jenisKelamin === 'L' ? 'L (Pria)' : 'P (Wanita)'}
                              </span>
                            </td>
                            <td className="p-2 font-mono">{row.periodeMCU}</td>
                            <td className="p-2 text-slate-600 truncate max-w-37.5">{row.bagian}</td>
                            <td className="p-2 font-semibold text-emerald-700">{row.hasilPemkes}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 px-5 py-3.5 bg-slate-100 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={parsedRows.length === 0}
                onClick={handleApplyImport}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                Impor {parsedRows.length} Data MCU ke Sistem
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
