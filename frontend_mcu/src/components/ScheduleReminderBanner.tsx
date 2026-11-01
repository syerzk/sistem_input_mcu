import React from 'react';
import { MCURecord } from '../types';
import { formatIndonesianDate } from '../utils/mcuHelpers';
import { Calendar, Clock, AlertCircle, Sparkles } from 'lucide-react';

interface ScheduleReminderBannerProps {
  record: MCURecord;
}

export const ScheduleReminderBanner: React.FC<ScheduleReminderBannerProps> = ({ record }) => {
  const isLaki = record.jenisKelamin === 'L';
  const cycleYears = isLaki ? 1 : 2;

  return (
    <div
      id="mcu-schedule-policy-banner"
      className="mb-4 bg-linear-to-r from-slate-900 via-slate-850 to-blue-950 text-white rounded-xl p-3.5 shadow-sm border border-slate-800"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-start sm:items-center gap-2.5">
          <div className="p-2 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/30">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-blue-400">
                ATURAN SIKLUS MCU RUTIN RS PT PUSRI
              </span>
              <span className="text-[10px] bg-slate-800 text-slate-200 px-1.5 py-0.5 rounded font-mono border border-slate-700">
                {isLaki ? 'Karyawan Laki-laki: 1 Thn Sekali' : 'Karyawati Perempuan: 2 Thn Sekali'}
              </span>
            </div>
            <div className="text-xs text-slate-300 mt-0.5">
              MCU Saat Ini: <strong className="text-white font-mono">{formatIndonesianDate(record.tanggal)}</strong> &bull; Jadwal MCU Berkala Berikutnya:{' '}
              <strong className="text-blue-300 font-mono font-bold">{formatIndonesianDate(record.tanggalMCUBerikutnya)}</strong>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <div className="text-right">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Status Periode</div>
            <div className="text-xs font-bold text-blue-300 font-mono">
              Periode {record.testTahun} &rarr; {Number(record.testTahun || 2026) + cycleYears}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
