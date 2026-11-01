import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Check, Sparkles, Plus, Minus } from 'lucide-react';

interface ModernYearPickerProps {
  id?: string;
  value: string;
  onChange: (year: string) => void;
  disabled?: boolean;
  className?: string;
  align?: 'left' | 'right' | 'center';
}

export const ModernYearPicker: React.FC<ModernYearPickerProps> = ({
  id,
  value,
  onChange,
  disabled = false,
  className = '',
  align = 'center'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const realCurrentYear = new Date().getFullYear();
  const selectedYear = parseInt(value, 10) || realCurrentYear;

  const [windowStartYear, setWindowStartYear] = useState<number>(() => {
    return Math.floor(selectedYear / 12) * 12;
  });

  useEffect(() => {
    const parsed = parseInt(value, 10);
    if (!isNaN(parsed) && (parsed < windowStartYear || parsed >= windowStartYear + 12)) {
      setWindowStartYear(Math.floor(parsed / 12) * 12);
    }
  }, [value, windowStartYear]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const yearsInWindow = Array.from({ length: 12 }, (_, i) => windowStartYear + i);
  const windowEndYear = windowStartYear + 11;

  const handleSelectYear = (year: number) => {
    onChange(String(year));
    setIsOpen(false);
  };

  const handleQuickStep = (step: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const nextY = selectedYear + step;
    onChange(String(nextY));
  };

  return (
    <div ref={containerRef} className={`relative inline-block w-full ${className}`}>
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full py-1.5 px-2 bg-white border border-slate-300 rounded-xl text-center font-mono font-bold text-xs sm:text-sm text-slate-900 shadow-2xs hover:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all flex items-center justify-center gap-1.5 ${
          disabled
            ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-slate-200'
            : 'cursor-pointer hover:bg-slate-50'
        } ${isOpen ? 'ring-2 ring-blue-500/20 border-blue-600 bg-blue-50/40 text-blue-700' : ''}`}
      >
        <span className="tracking-wider">{value || realCurrentYear}</span>
      </button>

      {isOpen && !disabled && (
        <div
          className={`absolute ${
            align === 'right' ? 'right-0' : align === 'center' ? 'left-1/2 -translate-x-1/2' : 'left-0'
          } mt-2 z-50 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3.5`}
        >
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-3 text-white mb-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-blue-100 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-yellow-300" />
                Pilih Tahun MCU
              </span>
              <span className="text-[10px] font-mono bg-white/20 px-2 py-0.5 rounded-full font-bold">
                Tahun {value || realCurrentYear}
              </span>
            </div>
            <div className="text-base font-extrabold mt-1 flex items-center justify-between">
              <span>{value ? `Periode ${value}` : 'Pilih Periode'}</span>
              <div className="flex items-center gap-1">
                <button type="button" onClick={(e) => handleQuickStep(-1, e)} className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer">
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <button type="button" onClick={(e) => handleQuickStep(1, e)} className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer">
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 pl-1 shrink-0">Ketik Tahun:</span>
            <input
              type="number"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="YYYY"
              className="w-full bg-white px-2 py-1 text-center font-mono font-bold text-xs text-slate-800 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
            <button type="button" onClick={() => setWindowStartYear((prev) => prev - 12)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 cursor-pointer">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold font-mono text-slate-800">
              {windowStartYear} &ndash; {windowEndYear}
            </span>
            <button type="button" onClick={() => setWindowStartYear((prev) => prev + 12)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 cursor-pointer">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-3">
            {yearsInWindow.map((year) => {
              const isSelected = String(year) === String(value);
              return (
                <button
                  key={year}
                  type="button"
                  onClick={() => handleSelectYear(year)}
                  className={`py-2 px-1 text-center font-mono text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 ${
                    isSelected ? 'bg-blue-600 text-white font-extrabold shadow-md' : 'text-slate-800 hover:bg-blue-50 font-semibold'
                  }`}
                >
                  {year}
                  {isSelected && <Check className="w-3 h-3 text-white" />}
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-100 grid grid-cols-3 gap-1.5">
            <button type="button" onClick={() => handleSelectYear(realCurrentYear)} className="text-[10px] py-1 bg-slate-50 hover:bg-slate-100 rounded-lg border text-slate-600 font-semibold cursor-pointer">
              Tahun Ini
            </button>
            <button type="button" onClick={() => handleSelectYear(realCurrentYear + 1)} className="text-[10px] py-1 bg-slate-50 hover:bg-slate-100 rounded-lg border text-slate-600 font-semibold cursor-pointer">
              +1 Thn
            </button>
            <button type="button" onClick={() => handleSelectYear(realCurrentYear + 2)} className="text-[10px] py-1 bg-slate-50 hover:bg-slate-100 rounded-lg border text-slate-600 font-semibold cursor-pointer">
              +2 Thn
            </button>
          </div>
        </div>
      )}
    </div>
  );
};