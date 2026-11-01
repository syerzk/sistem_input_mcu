import React, { useState } from 'react';
import { Sparkles, CheckCircle2, AlertCircle, RefreshCw, Check } from 'lucide-react';

export interface ConclusionBadge {
  label: string;
  value: string;
  isNormal?: boolean;
}

interface SectionAutoSummaryBarProps {
  sectionTitle: string;
  sectionSubtitle?: string;
  badges?: ConclusionBadge[];
  onAutoGenerate: () => { summaryMessage: string; findingsCount: number };
  onAutoFillNormal?: () => void;
  disabled?: boolean;
  compact?: boolean;
}

export const SectionAutoSummaryBar: React.FC<SectionAutoSummaryBarProps> = ({
  sectionTitle,
  sectionSubtitle,
  badges = [],
  onAutoGenerate,
  onAutoFillNormal,
  disabled = false,
  compact = false
}) => {
  const [lastMessage, setLastMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [animating, setAnimating] = useState<boolean>(false);

  const handleGenerate = () => {
    if (disabled) return;
    setAnimating(true);
    const res = onAutoGenerate();
    setLastMessage(res.summaryMessage);
    setIsSuccess(true);
    setTimeout(() => setAnimating(false), 300);

    // Hilangkan pesan notifikasi setelah 6 detik
    setTimeout(() => {
      setLastMessage(null);
    }, 6000);
  };

  const handleFillNormal = () => {
    if (disabled || !onAutoFillNormal) return;
    setAnimating(true);
    onAutoFillNormal();
    setLastMessage('Seluruh parameter bagian ini telah diisi dengan nilai standar normal (DBN).');
    setIsSuccess(true);
    setTimeout(() => setAnimating(false), 300);
    setTimeout(() => {
      setLastMessage(null);
    }, 6000);
  };

  return (
    <div
      id={`auto-summary-bar-${sectionTitle.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
      className="bg-gradient-to-r from-blue-50/90 via-indigo-50/70 to-slate-50 border border-blue-200/90 rounded-xl p-3 shadow-2xs transition-all mb-3"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        
        {/* Sisi Kiri: Judul Bagian & Status Kesimpulan Terkini */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-2xs shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                <span>Auto-Generate Kesimpulan: {sectionTitle}</span>
              </h4>
              {sectionSubtitle && (
                <p className="text-[11px] text-slate-500 leading-tight line-clamp-1">
                  {sectionSubtitle}
                </p>
              )}
            </div>
          </div>

          {/* Badges Status Kesimpulan */}
          {badges.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status:</span>
              {badges.map((b, idx) => {
                const isNormal = b.isNormal ?? (
                  b.value === 'DBN' ||
                  b.value === 'Normal' ||
                  b.value === 'Negatif' ||
                  b.value === 'Non-Reaktif' ||
                  b.value === 'Fit'
                );
                return (
                  <span
                    key={idx}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold border transition-colors ${
                      isNormal
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300/80'
                        : 'bg-amber-50 text-amber-900 border-amber-300/90'
                    }`}
                  >
                    {isNormal ? (
                      <Check className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-3 h-3 text-amber-600" />
                    )}
                    <span>{b.label}:</span>
                    <span className="font-extrabold">{b.value || '-'}</span>
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* Sisi Kanan: Tombol Tindakan */}
        <div className="flex items-center gap-2 shrink-0">
          {onAutoFillNormal && (
            <button
              id={`btn-autofill-normal-${sectionTitle.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
              type="button"
              disabled={disabled || animating}
              onClick={handleFillNormal}
              className="px-2.5 py-1.5 bg-white hover:bg-slate-100 active:scale-[0.98] border border-slate-300 text-slate-700 rounded-lg text-xs font-bold shadow-2xs transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
              title="Isi seluruh data bagian ini dengan nilai normal (DBN)"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${animating ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Isi Normal (DBN)</span>
              <span className="sm:hidden">DBN</span>
            </button>
          )}

          <button
            id={`btn-autogenerate-section-${sectionTitle.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
            type="button"
            disabled={disabled || animating}
            onClick={handleGenerate}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white rounded-lg text-xs font-black shadow-xs shadow-blue-500/25 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Analisis keadaan yang telah diperiksa pada bagian ini dan simpulkan otomatis"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Simpulkan Bagian Ini</span>
          </button>
        </div>
      </div>

      {/* Banner Pesan Hasil Analisis */}
      {lastMessage && (
        <div className="mt-2.5 pt-2 border-t border-blue-200/60 flex items-start gap-1.5 text-xs text-blue-900 bg-blue-100/50 px-2.5 py-1.5 rounded-lg animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{lastMessage}</div>
          <button
            type="button"
            onClick={() => setLastMessage(null)}
            className="text-blue-500 hover:text-blue-800 text-[11px] font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};
