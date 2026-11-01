import React from 'react';
import { MCURecord } from '../../types';
import { FileText, Lightbulb } from 'lucide-react';

interface TabKesimpulanSaranBoxProps {
  title: string;
  badgeText: string;
  kesKey: keyof MCURecord;
  saranKey: keyof MCURecord;
  kesPlaceholder?: string;
  saranPlaceholder?: string;
  data: MCURecord;
  onChange: (updates: Partial<MCURecord>) => void;
  disabled?: boolean;
}

export const TabKesimpulanSaranBox: React.FC<TabKesimpulanSaranBoxProps> = ({
  title,
  badgeText,
  kesKey,
  saranKey,
  kesPlaceholder = 'Tuliskan kesimpulan khusus pemeriksaan ini...',
  saranPlaceholder = 'Tuliskan saran medis dan rekomendasi khusus pemeriksaan ini...',
  data,
  onChange,
  disabled
}) => {
  const kesVal = (data[kesKey] as string) || '';
  const saranVal = (data[saranKey] as string) || '';

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-4 space-y-3 mt-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-50 text-blue-700 rounded-lg">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-tight">
              Kesimpulan &amp; Saran Pemeriksaan: {title}
            </h3>
            <p className="text-[11px] text-slate-500">
              Evaluasi diagnosis dan rekomendasi medis khusus untuk bagian {title.toLowerCase()}
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
          {badgeText}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Kesimpulan */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-800 uppercase tracking-tight">
              <span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span>
              Kesimpulan {badgeText}
            </span>
          </label>
          <textarea
            rows={3}
            disabled={disabled}
            value={kesVal}
            onChange={(e) => onChange({ [kesKey]: e.target.value })}
            placeholder={kesPlaceholder}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-sans focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:bg-slate-100 disabled:text-slate-500 shadow-2xs leading-relaxed"
          />
        </div>

        {/* Saran */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-emerald-800 uppercase tracking-tight">
              <Lightbulb className="w-3.5 h-3.5 text-emerald-600 inline-block" />
              Saran &amp; Rekomendasi {badgeText}
            </span>
          </label>
          <textarea
            rows={3}
            disabled={disabled}
            value={saranVal}
            onChange={(e) => onChange({ [saranKey]: e.target.value })}
            placeholder={saranPlaceholder}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-sans focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:bg-slate-100 disabled:text-slate-500 shadow-2xs leading-relaxed"
          />
        </div>
      </div>
    </div>
  );
};
