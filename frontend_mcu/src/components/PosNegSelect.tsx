import React from 'react';

interface PosNegSelectProps {
  id?: string;
  value: string | undefined;
  onChange: (value: string) => void;
  disabled?: boolean;
  options?: string[];
  className?: string;
  placeholder?: string;
  allowCustom?: boolean;
}

export const DEFAULT_POS_NEG_OPTIONS = ['Negatif', 'Positif'];

export const URINE_TEST_OPTIONS = [
  'Negatif',
  'Positif (+1)',
  'Positif (+2)',
  'Positif (+3)',
  'Positif (+4)',
  'Trace (+/-)',
  'Positif',
  '-'
];

export const SEROLOGY_OPTIONS = [
  'Negatif',
  'Positif',
  'Non-Reaktif',
  'Reaktif',
  '-'
];

export const KRISTAL_OPTIONS = [
  'Negatif',
  'Positif (+)',
  'Positif (++)',
  'Positif (+++)',
  'Positif Sedikit',
  'Positif Banyak',
  'Positif',
  '-'
];

export const SILINDER_OPTIONS = [
  'Negatif',
  'Positif',
  '0-1 /Lpk',
  '1-2 /Lpk',
  '2-5 /Lpk',
  '-'
];

export const PosNegSelect: React.FC<PosNegSelectProps> = ({
  id,
  value = 'Negatif',
  onChange,
  disabled = false,
  options = DEFAULT_POS_NEG_OPTIONS,
  className = 'w-24',
  placeholder = 'Pilih...'
}) => {
  const currentValue = value !== undefined && value !== null ? String(value) : 'Negatif';

  const allOptions = [...options];
  if (currentValue && !allOptions.includes(currentValue)) {
    allOptions.push(currentValue);
  }

  const isPositif =
    currentValue.toLowerCase().includes('positif') ||
    currentValue.toLowerCase().includes('reaktif') ||
    currentValue.includes('+');

  const isNegatif =
    currentValue.toLowerCase().includes('negatif') ||
    currentValue.toLowerCase().includes('non-reaktif') ||
    currentValue === 'DBN' ||
    currentValue === 'Normal';

  const badgeColorStyle = isPositif
    ? 'text-amber-700 bg-amber-50/70 border-amber-300 font-bold'
    : isNegatif
    ? 'text-slate-800 bg-white border-slate-300 font-semibold'
    : 'text-slate-700 bg-white border-slate-300';

  return (
    <select
      id={id}
      disabled={disabled}
      value={currentValue}
      onChange={(e) => onChange(e.target.value)}
      className={`px-2 py-0.5 text-xs rounded border transition-colors cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-blue-500 font-sans min-w-0 max-w-full truncate ${badgeColorStyle} ${
        disabled ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-slate-200' : 'hover:border-slate-400'
      } ${className}`}
    >
      {!allOptions.includes(currentValue) && currentValue === '' && (
        <option value="">{placeholder}</option>
      )}
      {allOptions.map((opt) => (
        <option key={opt} value={opt} className="text-slate-900 bg-white font-medium">
          {opt}
        </option>
      ))}
    </select>
  );
};
