import React, { useMemo } from 'react';
import { MCURecord, FitnessStatus } from '../../types';
import { detectAbnormalities, calculateCardiovascularRisk } from '../../utils/mcuHelpers';
import { CheckCircle2, AlertTriangle, HeartPulse, ArrowLeft, Database } from 'lucide-react';

interface TabSaranDrProps {
  data: MCURecord;
  onChange: (updates: Partial<MCURecord>) => void;
  disabled?: boolean;
  onPrevTab?: () => void;
  onSaveData?: () => void;
}

export const TabSaranDr: React.FC<TabSaranDrProps> = ({ data, onChange, disabled, onPrevTab, onSaveData }) => {
  const detectedIssues = useMemo(() => detectAbnormalities(data), [data]);
  const cvdRisk = useMemo(() => calculateCardiovascularRisk(data), [data]);

  return (
    <div id="tab-saran-dr-container" className="space-y-4">
      {detectedIssues.length > 0 ? (
        <div className="p-3 bg-amber-50 border border-amber-200/90 rounded-lg space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-bold text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Ditemukan {detectedIssues.length} Temuan / Catatan Medis dari Seluruh Tab:</span>
            </div>
            <span className="text-[11px] text-amber-800 font-medium">
              (Terdeteksi dari Fisik, Penunjang, Lab, atau Kimia Klinik)
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {detectedIssues.map((issue, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 bg-white text-amber-900 font-medium rounded border border-amber-300 shadow-2xs text-[11px]"
              >
                &bull; {issue}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-xs text-emerald-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Seluruh parameter tanda vital, fisik, penunjang, laboratorium, dan kimia klinik dalam batas normal (DBN).</span>
        </div>
      )}

      <div className="bg-white border border-slate-300 rounded-md p-4 space-y-4 shadow-2xs">
        
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <label
            htmlFor="tab-saran-kesimpulan"
            className="w-44 pt-1 font-bold text-slate-800 text-xs tracking-wider uppercase shrink-0"
          >
            KESIMPULAN
          </label>
          <div className="flex-1 w-full space-y-1">
            <textarea
              id="tab-saran-kesimpulan"
              rows={6}
              disabled={disabled}
              value={data.kesimpulan || ''}
              onChange={(e) => onChange({ kesimpulan: e.target.value })}
              placeholder="Masukkan kesimpulan medis akhir hasil pemeriksaan..."
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-400/80 rounded focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-sans text-slate-900 leading-relaxed resize-y"
            />
            <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
              <span>Diagnosis klinis, status gizi, hasil penunjang, dan rangkuman laboratorium.</span>
              <button
                type="button"
                onClick={() => {
                  if (detectedIssues.length === 0) {
                    onChange({ kesimpulan: 'Dalam Batas Normal (DBN). Kondisi kesehatan secara menyeluruh baik dan memenuhi kualifikasi Fit to Work.' });
                  } else {
                    onChange({ kesimpulan: `Catatan klinis: ${detectedIssues.join(', ')}.` });
                  }
                }}
                className="text-blue-600 hover:underline cursor-pointer"
              >
                Ganti teks ringkas
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start gap-4 pt-2 border-t border-slate-100">
          <label
            htmlFor="tab-saran-rekomendasi"
            className="w-44 pt-1 font-bold text-slate-800 text-xs tracking-wider uppercase shrink-0"
          >
            SARAN
          </label>
          <div className="flex-1 w-full space-y-1">
            <textarea
              id="tab-saran-rekomendasi"
              rows={7}
              disabled={disabled}
              value={data.saran || ''}
              onChange={(e) => onChange({ saran: e.target.value })}
              placeholder="Masukkan anjuran dokter, rekomendasi gizi/olahraga, edukasi K3, rujukan spesialis, dan jadwal kontrol..."
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-400/80 rounded focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-sans text-slate-900 leading-relaxed resize-y"
            />
            <div className="text-[11px] text-slate-500 px-1">
              Rekomendasi pencegahan, program K3, edukasi pola hidup sehat, serta jadwal MCU berkala berikutnya.
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-2 border-t border-slate-100">
          <label
            htmlFor="input-total-kardiovaskular"
            className="w-44 font-bold text-slate-800 text-xs tracking-wide shrink-0"
          >
            Total Kardiovaskular
          </label>
          <div className="flex-1 flex flex-wrap items-center gap-2">
            <input
              id="input-total-kardiovaskular"
              type="text"
              disabled={disabled}
              value={data.totalKardiovaskular || 'Rendah (<10%)'}
              onChange={(e) => onChange({ totalKardiovaskular: e.target.value })}
              placeholder="Contoh: Rendah (<10%), Sedang (10-20%), Tinggi (>20%)"
              className="w-56 px-2.5 py-1 text-xs bg-slate-50 border border-slate-400/80 rounded font-semibold text-slate-800 focus:bg-white focus:border-blue-500"
            />
            <div className="flex flex-wrap items-center gap-1 text-xs">
              {(['Rendah (<10%)', 'Sedang (10 - 20%)', 'Tinggi (20 - 30%)', 'Sangat Tinggi (>30%)'] as string[]).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  disabled={disabled}
                  onClick={() => onChange({ totalKardiovaskular: lvl })}
                  className={`px-2 py-0.5 text-[11px] rounded border transition-colors cursor-pointer ${
                    (data.totalKardiovaskular || 'Rendah (<10%)') === lvl
                      ? 'bg-blue-600 text-white border-blue-700 font-bold shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {lvl}
                </button>
              ))}
              <button
                type="button"
                disabled={disabled}
                onClick={() => onChange({ totalKardiovaskular: cvdRisk.level })}
                className="px-2 py-0.5 text-[11px] bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 rounded font-medium transition-colors flex items-center gap-1 cursor-pointer"
                title={`Kalkulasi otomatis berdasarkan Usia, Tensi (${data.tandaVital?.tekananDarahSistolik || 120} mmHg), Kolesterol Total (${data.kimiaKlinik?.profilLipid?.kolesterolTotal || 180} mg/dL), dan Status Rokok: ${cvdRisk.level}`}
              >
                <HeartPulse className="w-3 h-3 text-indigo-600" />
                <span>Hitung Otomatis: {cvdRisk.level}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-slate-200">
          <label className="w-44 font-bold text-slate-800 text-xs tracking-wide uppercase shrink-0">
            HASIL PEMKES (Kelaikan)
          </label>
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-2">
            {([
              { id: 'Fit', label: 'FIT TO WORK' },
              { id: 'Fit with Note', label: 'FIT WITH NOTE' },
              { id: 'Temporary Unfit', label: 'TEMPORARY UNFIT' },
              { id: 'Unfit', label: 'UNFIT' }
            ] as { id: FitnessStatus; label: string }[]).map(({ id, label }) => {
              const isSelected = data.hasilPemkes === id;
              return (
                <button
                  key={id}
                  type="button"
                  disabled={disabled}
                  onClick={() => onChange({ hasilPemkes: id })}
                  className={`py-2 px-3 text-xs font-bold rounded-lg border text-center transition-all cursor-pointer tracking-wide ${
                    isSelected
                      ? id === 'Fit'
                        ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                        : id === 'Fit with Note'
                        ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                        : id === 'Temporary Unfit'
                        ? 'bg-orange-600 text-white border-orange-700 shadow-sm'
                        : 'bg-red-600 text-white border-red-700 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:border-slate-400'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {(onPrevTab || onSaveData) && (
        <div className="flex flex-wrap items-center justify-between pt-3 border-t border-slate-200 gap-2">
          <div>
            {onPrevTab && (
              <button
                id="btn-prev-to-kimia"
                type="button"
                onClick={onPrevTab}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Kembali ke KIMIA KLINIK</span>
              </button>
            )}
          </div>
          <div className="text-xs text-slate-500 font-medium hidden sm:block">
            Tahap 6 dari 6: <span className="font-bold text-slate-700">Diagnosis &amp; Saran Dokter</span>
          </div>
          <div className="flex items-center gap-2">
            {onSaveData && (
              <button
                id="btn-save-mcu-final"
                type="button"
                onClick={onSaveData}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm shadow-emerald-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Database className="w-4 h-4" />
                <span>Simpan Rekam Medis (INSERT DATA)</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
