import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Check, Sparkles, X, Clock } from 'lucide-react';

interface ModernDatePickerProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  align?: 'left' | 'right';
}

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const MONTH_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'
];

const DAY_NAMES = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const DAY_FULL_NAMES = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export const ModernDatePicker: React.FC<ModernDatePickerProps> = ({
  id,
  value,
  onChange,
  disabled = false,
  className = '',
  placeholder = 'Pilih Tanggal',
  align = 'left'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedDate = value ? new Date(value + 'T00:00:00') : null;
  const initialDate = selectedDate && !isNaN(selectedDate.getTime()) ? selectedDate : new Date();

  const [viewYear, setViewYear] = useState<number>(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(initialDate.getMonth());
  const [viewMode, setViewMode] = useState<'days' | 'months' | 'years'>('days');

  useEffect(() => {
    if (value) {
      const parsed = new Date(value + 'T00:00:00');
      if (!isNaN(parsed.getTime())) {
        setViewYear(parsed.getFullYear());
        setViewMonth(parsed.getMonth());
      }
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setViewMode('days');
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  const handleSelectDay = (day: number) => {
    const mm = String(viewMonth + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    const newDateStr = `${viewYear}-${mm}-${dd}`;
    onChange(newDateStr);
    setIsOpen(false);
    setViewMode('days');
  };

  const formatDisplay = (val: string) => {
    if (!val) return placeholder;
    const d = new Date(val + 'T00:00:00');
    if (isNaN(d.getTime())) return val;
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  const getFullFormattedIndonesian = (val: string) => {
    if (!val) return '';
    const d = new Date(val + 'T00:00:00');
    if (isNaN(d.getTime())) return '';
    const dayName = DAY_FULL_NAMES[d.getDay()];
    const dateNum = d.getDate();
    const monthName = MONTH_NAMES[d.getMonth()];
    const year = d.getFullYear();
    return `${dayName}, ${dateNum} ${monthName} ${year}`;
  };

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
  const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();

  const today = new Date();
  const isCurrentMonthToday = today.getFullYear() === viewYear && today.getMonth() === viewMonth;
  const todayDate = today.getDate();

  const isSelectedDate = (day: number) => {
    if (!selectedDate) return false;
    return (
      selectedDate.getFullYear() === viewYear &&
      selectedDate.getMonth() === viewMonth &&
      selectedDate.getDate() === day
    );
  };

  const currentYearNow = new Date().getFullYear();
  const years = Array.from({ length: 40 }, (_, i) => currentYearNow - 25 + i);

  return (
    <div ref={containerRef} className={`relative inline-block w-full ${className}`}>
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 text-xs font-semibold flex items-center justify-between gap-1.5 shadow-2xs hover:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all ${
          disabled
            ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-slate-200 shadow-none'
            : 'cursor-pointer hover:bg-slate-50/90'
        } ${isOpen ? 'ring-2 ring-blue-500/20 border-blue-600 shadow-sm' : ''}`}
      >
        <div className="flex items-center gap-1.5 truncate">
          <CalendarIcon className={`w-3.5 h-3.5 shrink-0 transition-colors ${isOpen ? 'text-blue-600' : 'text-slate-500'}`} />
          <span className="font-mono tracking-wide text-slate-800">{formatDisplay(value)}</span>
        </div>
        <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-1.5 py-0.5 rounded shrink-0 hidden sm:inline-block">
          {value ? `${value.split('-')[0]}` : 'Pilih'}
        </span>
      </button>

      {isOpen && !disabled && (
        <div
          className={`absolute ${
            align === 'right' ? 'right-0' : 'left-0'
          } mt-2 z-50 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 animate-in fade-in-0 zoom-in-95 duration-150`}
        >
          <div className="bg-linear-to-r from-blue-600 to-indigo-600 rounded-xl p-3 text-white mb-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-blue-100 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-yellow-300" />
                Kalender MCU Pusri
              </span>
              {value && (
                <span className="text-[10px] font-mono bg-white/20 px-2 py-0.5 rounded-full font-bold">
                  {formatDisplay(value)}
                </span>
              )}
            </div>
            <div className="text-sm font-bold mt-1 tracking-tight truncate">
              {value ? getFullFormattedIndonesian(value) : 'Pilih tanggal pemeriksaan'}
            </div>
          </div>

          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 hover:bg-slate-100 active:bg-slate-200 rounded-lg text-slate-600 transition-colors cursor-pointer"
              title="Bulan Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1.5">
              <select
                value={viewMonth}
                onChange={(e) => setViewMonth(Number(e.target.value))}
                className="text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg px-2.5 py-1 cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                {MONTH_NAMES.map((name, idx) => (
                  <option key={name} value={idx}>
                    {name}
                  </option>
                ))}
              </select>

              <select
                value={viewYear}
                onChange={(e) => setViewYear(Number(e.target.value))}
                className="text-xs font-bold font-mono text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg px-2 py-1 cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 hover:bg-slate-100 active:bg-slate-200 rounded-lg text-slate-600 transition-colors cursor-pointer"
              title="Bulan Berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {DAY_NAMES.map((day, idx) => (
              <div
                key={day}
                className={`text-[10px] font-black tracking-wider uppercase py-0.5 ${
                  idx === 0 ? 'text-rose-500' : 'text-slate-400'
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {Array.from({ length: firstDayIndex }).map((_, idx) => {
              const prevDay = prevMonthDays - firstDayIndex + idx + 1;
              return (
                <div
                  key={`prev-${idx}`}
                  className="h-8 flex items-center justify-center text-xs text-slate-300 select-none font-mono"
                >
                  {prevDay}
                </div>
              );
            })}

            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const day = idx + 1;
              const isSelected = isSelectedDate(day);
              const isToday = isCurrentMonthToday && todayDate === day;

              return (
                <button
                  key={`curr-${day}`}
                  type="button"
                  onClick={() => handleSelectDay(day)}
                  className={`h-8 rounded-lg text-xs font-semibold font-mono flex items-center justify-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30 scale-105'
                      : isToday
                      ? 'bg-blue-50 text-blue-700 font-bold border border-blue-300 hover:bg-blue-100'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-end">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 px-3 py-1 rounded-md bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
