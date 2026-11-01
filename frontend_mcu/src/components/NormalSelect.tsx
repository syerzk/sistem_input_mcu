import React from 'react';

interface NormalSelectProps {
  id?: string;
  value: string | undefined;
  onChange: (value: string) => void;
  disabled?: boolean;
  options?: string[];
  className?: string;
  placeholder?: string;
}

export const DEFAULT_NORMAL_OPTIONS = ['normal', 'abnormal', 'tidak ada', '-'];

export const DBN_OPTIONS = ['DBN', 'TIDAK DBN', 'ABNORMAL', '-'];

export const MATA_VISUS_OPTIONS = [
  'OD : E OS : E',
  '6/6',
  '6/9',
  '6/12',
  'OD: 6/6 OS: 6/6',
  'OD: 6/9 OS: 6/9',
  'normal'
];

export const MATA_CONJUNGTIVA_OPTIONS = [
  'normal',
  'anemis (-/-)',
  'anemis (+/+)',
  'hiperemis (-/-)',
  'hiperemis (+/+)',
  'pucat'
];

export const MATA_SCLERA_OPTIONS = [
  'normal',
  'ikterik (-/-)',
  'ikterik (+/+)',
  'subikterik'
];

export const THT_OPTIONS = [
  'normal',
  'tidak ada',
  'intak (+/+)',
  'serumen (+/+)',
  'serumen (-/-)',
  'hiperemis (-)',
  'abnormal',
  '-'
];

export const TONSIL_OPTIONS = [
  'normal',
  'T1-T1 tenang',
  'T2-T2',
  'T3-T3',
  'hiperemis (-)',
  'abnormal'
];

export const THORAX_JANTUNG_OPTIONS = [
  'normal',
  'reguler',
  'BJ I/II murni, murmur (-)',
  'sinus rhythm',
  'kardiomegali (-)',
  'abnormal'
];

export const THORAX_PARU_OPTIONS = [
  'normal',
  'sonor bilateral',
  'vesikuler normal bilateral',
  'ronkhi (-/-), wheezing (-/-)',
  'cor & pulmo dbn',
  'abnormal'
];

export const SPIROMETRI_OPTIONS = [
  'Komb(%FVC*27 %,FEV1.0% 27%)',
  'normal',
  'Faal paru normal',
  'Restriksi ringan',
  'Obstruksi ringan',
  'DBN'
];

export const ABDOMEN_OPTIONS = [
  'normal',
  'supel',
  'tidak teraba pembesaran',
  'hepatomegali (-), splenomegali (-)',
  'nyeri tekan (-)',
  'bising usus normal',
  'abnormal'
];

export const REFLEK_OPTIONS = [
  'normal',
  'positif (+/+)',
  'isokor 3mm/3mm',
  'fisiologis (+/+)',
  'menurun',
  'abnormal'
];

export const GIGI_OPTIONS = [
  'normal',
  'Baik',
  'bersih',
  'karies (-)',
  'karies 1 molar',
  'tambalan komposit',
  'karang gigi (-)',
  'abnormal',
  '-'
];

export const GERAK_OPTIONS = [
  'normal',
  'bebas (+/+)',
  'kekuatan 5/5',
  'edema (-/-)',
  'tremor (-/-)',
  'terbatas',
  'abnormal',
  '-'
];

export const TULANG_BELAKANG_OPTIONS = [
  'normal',
  'deformitas (-)',
  'skoliosis (-)',
  'lordosis (-)',
  'kifosis (-)',
  'nyeri ketok (-)',
  'abnormal',
  '-'
];

export const GIGI_MULUT_OPTIONS = [
  'normal',
  'Baik',
  'bersih',
  'karies (-)',
  'stomatitis (-)',
  'gingivitis (-)',
  'abnormal',
  '-'
];

export const NormalSelect: React.FC<NormalSelectProps> = ({
  id,
  value = 'normal',
  onChange,
  disabled = false,
  options = DEFAULT_NORMAL_OPTIONS,
  className = 'flex-1',
  placeholder = 'Pilih...'
}) => {
  const currentValue = value !== undefined && value !== null ? String(value) : 'normal';

  const allOptions = [...options];
  if (currentValue && !allOptions.includes(currentValue)) {
    allOptions.push(currentValue);
  }

  const isAbnormal =
    currentValue.toLowerCase().includes('abnormal') ||
    currentValue.toLowerCase().includes('tidak dbn') ||
    currentValue.toLowerCase().includes('hipertrofi') ||
    currentValue.toLowerCase().includes('karies (+)');

  const isNormal =
    currentValue.toLowerCase() === 'normal' ||
    currentValue.toLowerCase() === 'dbn' ||
    currentValue.toLowerCase() === 'tidak ada' ||
    currentValue.toLowerCase() === 'baik';

  const badgeColorStyle = isAbnormal
    ? 'text-amber-800 bg-amber-50 border-amber-300 font-bold'
    : isNormal
    ? 'text-slate-800 bg-white border-slate-300 font-medium'
    : 'text-slate-800 bg-white border-slate-300';

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
