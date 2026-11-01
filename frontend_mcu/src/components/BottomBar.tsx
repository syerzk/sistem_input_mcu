import React from 'react';
import { MCURecord, FitnessStatus } from '../types';
import { Trash2, Database, FileCheck, Sparkles } from 'lucide-react';

interface BottomBarProps {
  data: MCURecord;
  onChange: (updates: Partial<MCURecord>) => void;
  onSaveData: () => void;
  onClearForm: () => void;
  onOpenReport: () => void;
  onAutoGenerate?: () => void;
  isSubmitting?: boolean;
  activeTab?: string;
}

export const BottomBar: React.FC<BottomBarProps> = ({
  data,
  onChange,
  onSaveData,
  onClearForm,
  onOpenReport,
  onAutoGenerate,
  isSubmitting,
  activeTab = 'UMUM'
}) => {
  // Tentukan label dan key kesimpulan/saran sesuai tab yang sedang aktif
  const tabConfig = React.useMemo(() => {
    switch (activeTab) {
      case 'UMUM':
        return {
          title: 'UMUM & ANAMNESIS',
          kesKey: 'kesimpulanUmum' as const,
          saranKey: 'saranUmum' as const,
          kesPlaceholder: 'Kesimpulan anamnesis & keluhan umum...',
          saranPlaceholder: 'Saran pola hidup, APD, & kesehatan umum...'
        };
      case 'FISIK':
        return {
          title: 'FISIK (1)',
          kesKey: 'kesimpulanFisik' as const,
          saranKey: 'saranFisik' as const,
          kesPlaceholder: 'Kesimpulan tanda vital, visus mata, & THT...',
          saranPlaceholder: 'Saran olahraga, kacamata, & perawatan fisik...'
        };
      case 'FISIK (2)':
        return {
          title: 'FISIK (2) & PENUNJANG',
          kesKey: 'kesimpulanFisik2' as const,
          saranKey: 'saranFisik2' as const,
          kesPlaceholder: 'Kesimpulan gigi, mulut, EKG, rontgen, spirometri, audiometri...',
          saranPlaceholder: 'Saran kesehatan gigi, pelindung telinga/respirator, rujukan...'
        };
      case 'LABORATORIUM':
        return {
          title: 'LABORATORIUM',
          kesKey: 'kesimpulanLab' as const,
          saranKey: 'saranLab' as const,
          kesPlaceholder: 'Kesimpulan hematologi rutin & urinalisis...',
          saranPlaceholder: 'Saran hidrasi air putih, konsumsi zat besi, kontrol lab...'
        };
      case 'KIMIA KLINIK':
        return {
          title: 'KIMIA KLINIK',
          kesKey: 'kesimpulanKimia' as const,
          saranKey: 'saranKimia' as const,
          kesPlaceholder: 'Kesimpulan fungsi hati, ginjal, profil lipid, glukosa, & HBsAg...',
          saranPlaceholder: 'Saran diet rendah lemak/purin/gula, evaluasi faal organ...'
        };
      case 'SARAN DR':
      default:
        return {
          title: 'SARAN DOKTER (AKUMULATIF)',
          kesKey: 'kesimpulan' as const,
          saranKey: 'saran' as const,
          kesPlaceholder: 'Kesimpulan akumulatif seluruh pemeriksaan medis...',
          saranPlaceholder: 'Saran menyeluruh, kelaikan kerja, dan jadwal MCU berkala...'
        };
    }
  }, [activeTab]);

  const currentKesimpulan = (data[tabConfig.kesKey] as string) ?? '';
  const currentSaran = (data[tabConfig.saranKey] as string) ?? '';

  const handleKesimpulanChange = (val: string) => {
    onChange({ [tabConfig.kesKey]: val });
  };

  const handleSaranChange = (val: string) => {
    onChange({ [tabConfig.saranKey]: val });
  };

  return (
    <div
      id="mcu-bottom-action-panel"
      className="bg-white border border-slate-200 rounded-xl shadow-md p-3.5 mt-4"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
        
        <div className="lg:col-span-9 space-y-2 text-xs">
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="sm:w-36 flex items-center justify-between">
              <label className="font-bold text-slate-700 uppercase tracking-wide">
                HASIL PEMKES
              </label>
            </div>
            <div className="flex-1 flex flex-wrap items-center gap-2">
              <select
                id="bottom-select-hasil-pemkes"
                value={data.hasilPemkes}
                onChange={(e) => onChange({ hasilPemkes: e.target.value as FitnessStatus })}
                className={`px-3 py-1.5 rounded-lg border font-bold text-xs shadow-2xs ${
                  data.hasilPemkes === 'Fit'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : data.hasilPemkes === 'Fit with Note'
                    ? 'bg-amber-50 text-amber-800 border-amber-300'
                    : data.hasilPemkes === 'Temporary Unfit'
                    ? 'bg-orange-50 text-orange-800 border-orange-300'
                    : 'bg-red-50 text-red-800 border-red-300'
                }`}
              >
                <option value="Fit">Fit to Work (Sehat / Memenuhi Syarat)</option>
                <option value="Fit with Note">Fit with Note / Restriction (Dengan Catatan)</option>
                <option value="Temporary Unfit">Temporary Unfit (Tidak Sehat Sementara)</option>
                <option value="Unfit">Unfit for Work (Tidak Memenuhi Syarat)</option>
              </select>

              {data.totalKardiovaskular && (
                <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
                  Risiko Kardiovaskular: <strong className="text-slate-800">{data.totalKardiovaskular}</strong>
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <label className="sm:w-36 font-bold text-slate-700 uppercase tracking-wide flex items-center justify-between">
              <span>KESIMPULAN</span>
            </label>
            <input
              id="bottom-input-kesimpulan"
              type="text"
              value={currentKesimpulan}
              onChange={(e) => handleKesimpulanChange(e.target.value)}
              placeholder={tabConfig.kesPlaceholder}
              className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-mono focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <label className="sm:w-36 font-bold text-slate-700 uppercase tracking-wide flex items-center justify-between">
              <span>SARAN</span>
            </label>
            <input
              id="bottom-input-saran"
              type="text"
              value={currentSaran}
              onChange={(e) => handleSaranChange(e.target.value)}
              placeholder={tabConfig.saranPlaceholder}
              className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-mono focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs"
            />
          </div>
        </div>

        <div className="lg:col-span-3 flex flex-col gap-2 pt-2 lg:pt-0 lg:pl-3 border-t lg:border-t-0 lg:border-l border-slate-100">
          <div className="flex gap-2">
            
            <button
              id="btn-bottom-save-report"
              type="button"
              onClick={onOpenReport}
              className="flex-1 py-2 px-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
            >
              <FileCheck className="w-3.5 h-3.5 text-slate-600" />
              <span>Save Report</span>
            </button>

            <button
              id="btn-bottom-clear"
              type="button"
              onClick={onClearForm}
              className="py-2 px-2.5 bg-slate-100 hover:bg-red-50 hover:text-red-700 hover:border-red-300 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
              title="Kosongkan / Reset Form Input"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>CLEAR</span>
            </button>
          </div>

          <button
            id="btn-bottom-insert-data"
            type="button"
            disabled={isSubmitting}
            onClick={onSaveData}
            className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white rounded-lg font-black text-xs tracking-wider uppercase shadow-md shadow-blue-600/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            title={activeTab !== 'SARAN DR' ? 'Simpan data dan otomatis lanjut ke tab berikutnya' : 'Simpan lengkap data MCU'}
          >
            <Database className="w-4 h-4" />
            <span>
              {activeTab === 'SARAN DR' ? 'INSERT DATA (SELESAI)' : 'INSERT DATA & LANJUT'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
