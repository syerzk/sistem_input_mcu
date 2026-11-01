import React from 'react';
import { MCURecord } from '../../types';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { calculateBMI } from '../../utils/mcuHelpers';
import { synthesizeConclusionAndAdvice } from '../../utils/autoSummaryGenerators';
import {
  NormalSelect,
  DEFAULT_NORMAL_OPTIONS,
  DBN_OPTIONS,
  MATA_VISUS_OPTIONS,
  MATA_CONJUNGTIVA_OPTIONS,
  MATA_SCLERA_OPTIONS,
  THT_OPTIONS,
  TONSIL_OPTIONS
} from '../NormalSelect';

interface TabFisikProps {
  data: MCURecord;
  onChange: (updates: Partial<MCURecord>) => void;
  disabled?: boolean;
  onNextTab?: () => void;
  onPrevTab?: () => void;
}

export const TabFisik: React.FC<TabFisikProps> = ({ data, onChange, disabled, onNextTab, onPrevTab }) => {
  
  const vitals = data.tandaVital || {
    tekananDarahSistolik: '',
    tekananDarahDiastolik: '',
    nadi: '',
    pernafasan: '',
    suhu: '',
    beratBadan: '',
    tinggiBadan: '',
    kulitDanRambut: 'normal',
    kesFisik: 'DBN',
    oLengan: '',
    persenLemak: '',
    oPerut: '',
    bmi: '',
    bmiKategori: '',
    lingkarPerut: ''
  };

  const mata = data.mata || {
    refraksiMataRL: '',
    visusTanpaKM: 'OD : E OS : E',
    penyakitMata: 'normal',
    conjungtiva: 'normal',
    sclera: 'normal',
    kelainanLain: '',
    kesMata: 'DBN'
  };

  const tht = data.tht || {
    telinga: 'normal',
    membranTympaniRL: 'normal',
    reflekCahaya: 'normal',
    serumenPlug: 'normal',
    hidung: 'normal',
    septumDeviasi: 'normal',
    concha: 'normal',
    polyp: 'normal',
    kerongkongan: 'normal',
    tonsilRL: 'normal',
    faring: 'normal',
    audiogram: 'normal',
    kesTHT: 'DBN'
  };

  const genetalia = data.genetaliaAnorectal || {
    hernia: 'normal',
    haemorroid: 'normal',
    spincerAni: 'normal',
    epididymisTestisProstat: 'normal',
    varicoceleHydrocele: 'normal',
    flourAlbus: 'normal',
    papsSmear: 'normal',
    leher: 'normal',
    jvp: 'normal',
    struma: 'normal'
  };

  const handleVitalChange = (field: keyof MCURecord['tandaVital'], value: any) => {
    const updatedVitals = {
      ...vitals,
      [field]: value
    };

    if (field === 'beratBadan' || field === 'tinggiBadan') {
      const weight = field === 'beratBadan' ? Number(value) : Number(vitals.beratBadan);
      const height = field === 'tinggiBadan' ? Number(value) : Number(vitals.tinggiBadan);
      const { bmi, category } = calculateBMI(weight, height);
      updatedVitals.bmi = bmi;
      updatedVitals.bmiKategori = category;
    }

    onChange({ tandaVital: updatedVitals });
  };

  const handleEyeChange = (field: keyof MCURecord['mata'], value: any) => {
    onChange({
      mata: {
        ...mata,
        [field]: value
      }
    });
  };

  const handleThtChange = (field: keyof MCURecord['tht'], value: any) => {
    onChange({
      tht: {
        ...tht,
        [field]: value
      }
    });
  };

  const handleGenetaliaChange = (field: keyof NonNullable<MCURecord['genetaliaAnorectal']>, value: any) => {
    onChange({
      genetaliaAnorectal: {
        ...genetalia,
        [field]: value
      }
    });
  };

  const handleAutoFillNormal = () => {
    const normalUpdates = {
      tandaVital: {
        ...vitals,
        tekananDarahSistolik: 120,
        tekananDarahDiastolik: 80,
        nadi: 76,
        pernafasan: 18,
        suhu: 36.5,
        beratBadan: vitals.beratBadan || 65,
        tinggiBadan: vitals.tinggiBadan || 170,
        kulitDanRambut: 'normal',
        kesFisik: 'DBN',
        bmi: 22.5,
        bmiKategori: 'Normal / Ideal'
      },
      mata: {
        ...mata,
        visusTanpaKM: 'OD : E OS : E',
        butaWarna: 'Normal',
        conjungtiva: 'normal',
        sclera: 'normal',
        penyakitMata: 'normal',
        kesMata: 'DBN'
      },
      tht: {
        ...tht,
        telinga: 'normal',
        membranTympaniRL: 'intak',
        reflekCahaya: 'positif (+)',
        serumenPlug: 'tidak ada',
        hidung: 'normal',
        septumDeviasi: 'tidak ada',
        tonsilRL: 'T1-T1',
        faring: 'normal',
        kesTHT: 'DBN'
      },
      genetaliaAnorectal: {
        ...genetalia,
        hernia: 'normal',
        haemorroid: 'normal',
        leher: 'normal',
        jvp: 'normal',
        struma: 'normal'
      }
    };

    const syn = synthesizeConclusionAndAdvice({ ...data, ...normalUpdates });
    onChange({
      ...normalUpdates,
      kesimpulan: syn.kesimpulan,
      saran: syn.saran,
      hasilPemkes: syn.hasilPemkes,
      totalKardiovaskular: syn.totalKardiovaskular
    });
  };

  const badges = [
    {
      label: 'KES. FISIK',
      value: vitals.kesFisik || 'DBN',
      isNormal: vitals.kesFisik === 'DBN'
    },
    {
      label: 'KES. MATA',
      value: mata.kesMata || 'DBN',
      isNormal: mata.kesMata === 'DBN'
    },
    {
      label: 'KES. THT',
      value: tht.kesTHT || 'DBN',
      isNormal: tht.kesTHT === 'DBN'
    }
  ];

  return (
    <div id="tab-fisik-container" className="space-y-3">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 items-start">
        
        {/* Kolom 1: Keadaan Umum & Mata */}
        <div className="space-y-3.5 min-w-0">
          
          <div className="border border-slate-400/80 rounded-md p-3 bg-white shadow-2xs space-y-2 min-w-0">
            <div className="text-xs font-black tracking-tight text-slate-800 uppercase pb-1 border-b border-slate-100">
              KEADAAN UMUM
            </div>

            <div className="flex items-center justify-between gap-1 text-xs">
              <label className="w-24 sm:w-28 font-bold text-slate-800 shrink-0">Tinggi / Berat</label>
              <div className="flex items-center gap-1 flex-1 justify-end min-w-0">
                <input
                  id="input-tinggi-badan"
                  type="text"
                  disabled={disabled}
                  value={vitals.tinggiBadan || ''}
                  onChange={(e) => handleVitalChange('tinggiBadan', e.target.value)}
                  placeholder="170"
                  className="w-12 px-1 py-0.5 text-xs bg-white border border-slate-300 rounded text-center font-mono font-semibold"
                />
                <span className="text-[10px] text-slate-600 shrink-0">Cm /</span>
                <input
                  id="input-berat-badan"
                  type="text"
                  disabled={disabled}
                  value={vitals.beratBadan || ''}
                  onChange={(e) => handleVitalChange('beratBadan', e.target.value)}
                  placeholder="65"
                  className="w-12 px-1 py-0.5 text-xs bg-white border border-slate-300 rounded text-center font-mono font-semibold"
                />
                <span className="text-[10px] text-slate-600 shrink-0">Kg</span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-1 text-xs">
              <label className="w-24 sm:w-28 font-bold text-slate-800 shrink-0">Tensi / Nadi</label>
              <div className="flex items-center gap-0.5 flex-1 justify-end min-w-0">
                <input
                  id="input-td-sistolik"
                  type="text"
                  disabled={disabled}
                  value={vitals.tekananDarahSistolik || ''}
                  onChange={(e) => handleVitalChange('tekananDarahSistolik', e.target.value)}
                  placeholder="120"
                  className="w-10 px-0.5 py-0.5 text-xs bg-white border border-slate-300 rounded text-center font-mono font-semibold"
                />
                <span className="text-slate-400 font-bold text-[10px]">/</span>
                <input
                  id="input-td-diastolik"
                  type="text"
                  disabled={disabled}
                  value={vitals.tekananDarahDiastolik || ''}
                  onChange={(e) => handleVitalChange('tekananDarahDiastolik', e.target.value)}
                  placeholder="80"
                  className="w-10 px-0.5 py-0.5 text-xs bg-white border border-slate-300 rounded text-center font-mono font-semibold"
                />
                <span className="text-[9px] text-slate-600 shrink-0">mmHg /</span>
                <input
                  id="input-nadi"
                  type="text"
                  disabled={disabled}
                  value={vitals.nadi || ''}
                  onChange={(e) => handleVitalChange('nadi', e.target.value)}
                  placeholder="76"
                  className="w-10 px-0.5 py-0.5 text-xs bg-white border border-slate-300 rounded text-center font-mono font-semibold"
                />
                <span className="text-[9px] text-slate-600 shrink-0">x/m</span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-1 text-xs">
              <label className="w-24 sm:w-28 font-bold text-slate-800 shrink-0">Napas / Suhu</label>
              <div className="flex items-center gap-1 flex-1 justify-end min-w-0">
                <input
                  id="input-pernafasan"
                  type="text"
                  disabled={disabled}
                  value={vitals.pernafasan || ''}
                  onChange={(e) => handleVitalChange('pernafasan', e.target.value)}
                  placeholder="18"
                  className="w-10 px-0.5 py-0.5 text-xs bg-white border border-slate-300 rounded text-center font-mono font-semibold"
                />
                <span className="text-[9px] text-slate-600 shrink-0">x/m /</span>
                <input
                  id="input-suhu"
                  type="text"
                  disabled={disabled}
                  value={vitals.suhu || ''}
                  onChange={(e) => handleVitalChange('suhu', e.target.value)}
                  placeholder="36.5"
                  className="w-11 px-0.5 py-0.5 text-xs bg-white border border-slate-300 rounded text-center font-mono font-semibold"
                />
                <span className="text-[9px] text-slate-600 shrink-0">°C</span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-1 text-xs">
              <label className="w-24 sm:w-28 font-bold text-slate-800 shrink-0">Kulit dan Rambut</label>
              <div className="flex-1 min-w-0">
                <NormalSelect
                  id="input-kulit-rambut"
                  disabled={disabled}
                  value={vitals.kulitDanRambut !== undefined ? vitals.kulitDanRambut : 'normal'}
                  onChange={(val) => handleVitalChange('kulitDanRambut', val)}
                  options={DEFAULT_NORMAL_OPTIONS}
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-1 text-xs">
              <label className="w-24 sm:w-28 font-bold text-slate-800 shrink-0">KES. FISIK</label>
              <div className="flex-1 min-w-0">
                <NormalSelect
                  id="input-kes-fisik"
                  disabled={disabled}
                  value={vitals.kesFisik !== undefined ? vitals.kesFisik : 'DBN'}
                  onChange={(val) => handleVitalChange('kesFisik', val)}
                  options={DBN_OPTIONS}
                  className="w-full font-bold"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-1 text-xs">
              <label className="w-24 sm:w-28 font-bold text-slate-800 shrink-0">O Lengan</label>
              <div className="flex items-center gap-1 flex-1 justify-end min-w-0">
                <input
                  id="input-o-lengan"
                  type="text"
                  disabled={disabled}
                  value={vitals.oLengan || ''}
                  onChange={(e) => handleVitalChange('oLengan', e.target.value)}
                  placeholder="28"
                  className="w-10 px-0.5 py-0.5 text-xs bg-white border border-slate-300 rounded text-center font-mono"
                />
                <span className="text-[10px] text-slate-600 shrink-0">Cm</span>
                <span className="text-[10px] font-bold text-slate-800 ml-1 shrink-0">% Lmk</span>
                <input
                  id="input-persen-lemak"
                  type="text"
                  disabled={disabled}
                  value={vitals.persenLemak || ''}
                  onChange={(e) => handleVitalChange('persenLemak', e.target.value)}
                  placeholder="18"
                  className="w-10 px-0.5 py-0.5 text-xs bg-white border border-slate-300 rounded text-center font-mono"
                />
                <span className="text-[10px] text-slate-600 shrink-0">%</span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-1 text-xs">
              <label className="w-24 sm:w-28 font-bold text-slate-800 shrink-0">O Perut</label>
              <div className="flex items-center gap-1 flex-1 justify-end min-w-0">
                <input
                  id="input-o-perut"
                  type="text"
                  disabled={disabled}
                  value={vitals.oPerut !== undefined ? vitals.oPerut : vitals.lingkarPerut || ''}
                  onChange={(e) => {
                    handleVitalChange('oPerut', e.target.value);
                  }}
                  placeholder="80"
                  className="w-12 px-1 py-0.5 text-xs bg-white border border-slate-300 rounded text-center font-mono font-semibold"
                />
                <span className="text-[10px] text-slate-600 shrink-0">Cm</span>
              </div>
            </div>
          </div>

          <div className="border border-slate-400/80 rounded-md p-3 bg-white shadow-2xs space-y-2 min-w-0">
            <div className="text-xs font-black tracking-tight text-slate-800 uppercase pb-1 border-b border-slate-100">
              PEMERIKSAAN MATA
            </div>

            <div className="flex items-center justify-between gap-1.5 text-xs">
              <label className="w-28 sm:w-32 font-bold text-slate-800 shrink-0">Refraksi R / L</label>
              <div className="flex-1 min-w-0">
                <NormalSelect
                  id="input-refraksi-mata"
                  disabled={disabled}
                  value={mata.refraksiMataRL || 'normal'}
                  onChange={(val) => handleEyeChange('refraksiMataRL', val)}
                  options={['normal', 'OD: -0.5 OS: -0.5', 'OD: -1.0 OS: -1.0', 'OD: +1.0 OS: +1.0', '-']}
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-1.5 text-xs">
              <label className="w-28 sm:w-32 font-bold text-slate-800 shrink-0">Visus Tanpa KM</label>
              <div className="flex-1 min-w-0">
                <NormalSelect
                  id="input-visus-tanpa-km"
                  disabled={disabled}
                  value={mata.visusTanpaKM !== undefined ? mata.visusTanpaKM : 'OD : E OS : E'}
                  onChange={(val) => handleEyeChange('visusTanpaKM', val)}
                  options={MATA_VISUS_OPTIONS}
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-1.5 text-xs">
              <label className="w-28 sm:w-32 font-bold text-slate-800 shrink-0">Penyakit Mata</label>
              <div className="flex-1 min-w-0">
                <NormalSelect
                  id="input-penyakit-mata"
                  disabled={disabled}
                  value={mata.penyakitMata !== undefined ? mata.penyakitMata : 'normal'}
                  onChange={(val) => handleEyeChange('penyakitMata', val)}
                  options={DEFAULT_NORMAL_OPTIONS}
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-1.5 text-xs">
              <label className="w-28 sm:w-32 font-bold text-slate-800 shrink-0">Conjungtiva</label>
              <div className="flex-1 min-w-0">
                <NormalSelect
                  id="input-conjungtiva"
                  disabled={disabled}
                  value={mata.conjungtiva !== undefined ? mata.conjungtiva : 'normal'}
                  onChange={(val) => handleEyeChange('conjungtiva', val)}
                  options={MATA_CONJUNGTIVA_OPTIONS}
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-1.5 text-xs">
              <label className="w-28 sm:w-32 font-bold text-slate-800 shrink-0">Sclera</label>
              <div className="flex-1 min-w-0">
                <NormalSelect
                  id="input-sclera"
                  disabled={disabled}
                  value={mata.sclera !== undefined ? mata.sclera : 'normal'}
                  onChange={(val) => handleEyeChange('sclera', val)}
                  options={MATA_SCLERA_OPTIONS}
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-1.5 text-xs">
              <label className="w-28 sm:w-32 font-bold text-slate-800 shrink-0">Kelainan Lain</label>
              <div className="flex-1 min-w-0">
                <NormalSelect
                  id="input-kelainan-lain-mata"
                  disabled={disabled}
                  value={mata.kelainanLain || '-'}
                  onChange={(val) => handleEyeChange('kelainanLain', val)}
                  options={['-', 'normal', 'strabismus (-)', 'abnormal']}
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-1.5 text-xs">
              <label className="w-28 sm:w-32 font-bold text-slate-800 shrink-0">KES. MATA</label>
              <div className="flex-1 min-w-0">
                <NormalSelect
                  id="input-kes-mata"
                  disabled={disabled}
                  value={mata.kesMata !== undefined ? mata.kesMata : 'DBN'}
                  onChange={(val) => handleEyeChange('kesMata', val)}
                  options={DBN_OPTIONS}
                  className="w-full font-bold"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Kolom 2: THT */}
        <div className="min-w-0">
          <div className="border border-slate-400/80 rounded-md p-3 bg-white shadow-2xs space-y-2 min-w-0">
            <div className="text-xs font-black tracking-tight text-slate-800 uppercase pb-1 border-b border-slate-100">
              PEMERIKSAAN THT
            </div>

            <div className="flex items-center justify-between gap-1.5 text-xs">
              <label className="w-32 sm:w-36 font-bold text-slate-800 shrink-0">Telinga</label>
              <div className="flex-1 min-w-0">
                <NormalSelect
                  id="input-tht-telinga"
                  disabled={disabled}
                  value={tht.telinga !== undefined ? tht.telinga : 'normal'}
                  onChange={(val) => handleThtChange('telinga', val)}
                  options={THT_OPTIONS}
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-1.5 text-xs">
              <label className="w-32 sm:w-36 font-bold text-slate-800 shrink-0">Membran Tympani</label>
              <div className="flex-1 min-w-0">
                <NormalSelect
                  id="input-tht-membran-tympani"
                  disabled={disabled}
                  value={tht.membranTympaniRL !== undefined ? tht.membranTympaniRL : 'normal'}
                  onChange={(val) => handleThtChange('membranTympaniRL', val)}
                  options={['normal', 'intak (+/+)', 'perforasi (-/-)', 'retraksi', 'abnormal', '-']}
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-1.5 text-xs">
              <label className="w-32 sm:w-36 font-bold text-slate-800 shrink-0">Reflek Cahaya</label>
              <div className="flex-1 min-w-0">
                <NormalSelect
                  id="input-tht-reflek-cahaya"
                  disabled={disabled}
                  value={tht.reflekCahaya !== undefined ? tht.reflekCahaya : 'normal'}
                  onChange={(val) => handleThtChange('reflekCahaya', val)}
                  options={['normal', 'positif (+/+)', 'menurun', 'abnormal', '-']}
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-1.5 text-xs">
              <label className="w-32 sm:w-36 font-bold text-slate-800 shrink-0">Serumen Plug</label>
              <div className="flex-1 min-w-0">
                <NormalSelect
                  id="input-tht-serumen-plug"
                  disabled={disabled}
                  value={tht.serumenPlug !== undefined ? tht.serumenPlug : 'normal'}
                  onChange={(val) => handleThtChange('serumenPlug', val)}
                  options={['normal', 'tidak ada', 'ada (minimal)', 'positif (+/+)', 'abnormal', '-']}
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-1.5 text-xs">
              <label className="w-32 sm:w-36 font-bold text-slate-800 shrink-0">Hidung</label>
              <div className="flex-1 min-w-0">
                <NormalSelect
                  id="input-tht-hidung"
                  disabled={disabled}
                  value={tht.hidung !== undefined ? tht.hidung : 'normal'}
                  onChange={(val) => handleThtChange('hidung', val)}
                  options={['normal', 'deviasi septum (-)', 'sekret (-)', 'polip (-)', 'abnormal', '-']}
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-1.5 text-xs">
              <label className="w-32 sm:w-36 font-bold text-slate-800 shrink-0">Septum Deviasi</label>
              <div className="flex-1 min-w-0">
                <NormalSelect
                  id="input-tht-septum-deviasi"
                  disabled={disabled}
                  value={tht.septumDeviasi !== undefined ? tht.septumDeviasi : 'normal'}
                  onChange={(val) => handleThtChange('septumDeviasi', val)}
                  options={['normal', 'tidak ada', 'deviasi ringan', 'deviasi ke kanan', 'deviasi ke kiri', 'abnormal']}
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-1.5 text-xs">
              <label className="w-32 sm:w-36 font-bold text-slate-800 shrink-0">Concha</label>
              <div className="flex-1 min-w-0">
                <NormalSelect
                  id="input-tht-concha"
                  disabled={disabled}
                  value={tht.concha !== undefined ? tht.concha : 'normal'}
                  onChange={(val) => handleThtChange('concha', val)}
                  options={['normal', 'eutrofi', 'hipertrofi (-/-)', 'hipertrofi (+/+)', 'abnormal']}
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-1.5 text-xs">
              <label className="w-32 sm:w-36 font-bold text-slate-800 shrink-0">Polyp</label>
              <div className="flex-1 min-w-0">
                <NormalSelect
                  id="input-tht-polyp"
                  disabled={disabled}
                  value={tht.polyp !== undefined ? tht.polyp : 'normal'}
                  onChange={(val) => handleThtChange('polyp', val)}
                  options={['normal', 'tidak ada', 'polip (-/-)', 'positif', 'abnormal']}
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-1.5 text-xs">
              <label className="w-32 sm:w-36 font-bold text-slate-800 shrink-0">Kerongkongan</label>
              <div className="flex-1 min-w-0">
                <NormalSelect
                  id="input-tht-kerongkongan"
                  disabled={disabled}
                  value={tht.kerongkongan !== undefined ? tht.kerongkongan : 'normal'}
                  onChange={(val) => handleThtChange('kerongkongan', val)}
                  options={['normal', 'hiperemis (-)', 'faring normal', 'radang (-)', 'abnormal']}
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-1.5 text-xs">
              <label className="w-32 sm:w-36 font-bold text-slate-800 shrink-0">Tonsil R / L</label>
              <div className="flex-1 min-w-0">
                <NormalSelect
                  id="input-tht-tonsil-rl"
                  disabled={disabled}
                  value={tht.tonsilRL !== undefined ? tht.tonsilRL : 'normal'}
                  onChange={(val) => handleThtChange('tonsilRL', val)}
                  options={TONSIL_OPTIONS}
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-1.5 text-xs">
              <label className="w-32 sm:w-36 font-bold text-slate-800 shrink-0">Faring</label>
              <div className="flex-1 min-w-0">
                <NormalSelect
                  id="input-tht-faring"
                  disabled={disabled}
                  value={tht.faring !== undefined ? tht.faring : 'normal'}
                  onChange={(val) => handleThtChange('faring', val)}
                  options={['normal', 'tenang', 'hiperemis (-)', 'granuler (-)', 'abnormal']}
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-1.5 text-xs">
              <label className="w-32 sm:w-36 font-bold text-slate-800 shrink-0">Audiogram</label>
              <div className="flex-1 min-w-0">
                <NormalSelect
                  id="input-tht-audiogram"
                  disabled={disabled}
                  value={tht.audiogram !== undefined ? tht.audiogram : 'normal'}
                  onChange={(val) => handleThtChange('audiogram', val)}
                  options={['normal', 'dalam batas normal', 'hearing loss ringan', 'tuli konduktif', 'tuli sensorineural', 'abnormal', 'DBN']}
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-1.5 text-xs">
              <label className="w-32 sm:w-36 font-bold text-slate-800 shrink-0">KES. THT</label>
              <div className="flex-1 min-w-0">
                <NormalSelect
                  id="input-kes-tht"
                  disabled={disabled}
                  value={tht.kesTHT !== undefined ? tht.kesTHT : 'DBN'}
                  onChange={(val) => handleThtChange('kesTHT', val)}
                  options={DBN_OPTIONS}
                  className="w-full font-bold"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Kolom 3: Genetalia dan Anorectal */}
        <div className="min-w-0">
          <div className="border border-slate-400/80 rounded-md p-3 bg-white shadow-2xs space-y-2 min-w-0">
            <div className="text-xs font-black tracking-tight text-slate-800 uppercase pb-1 border-b border-slate-100">
              PEMERIKSAAN GENETALIA DAN ANORECTAL
            </div>

            <div className="flex items-center justify-between gap-1.5 text-xs">
              <label className="w-24 sm:w-28 font-bold text-slate-800 shrink-0">Hernia</label>
              <div className="flex-1 min-w-0">
                <NormalSelect
                  id="input-genetalia-hernia"
                  disabled={disabled}
                  value={genetalia.hernia !== undefined ? genetalia.hernia : 'normal'}
                  onChange={(val) => handleGenetaliaChange('hernia', val)}
                  options={['normal', 'tidak ada', 'hernia inguinalis (-)', 'hernia umbilikalis (-)', 'abnormal']}
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-1.5 text-xs">
              <label className="w-24 sm:w-28 font-bold text-slate-800 shrink-0">Haemorroid</label>
              <div className="flex-1 min-w-0">
                <NormalSelect
                  id="input-genetalia-haemorroid"
                  disabled={disabled}
                  value={genetalia.haemorroid !== undefined ? genetalia.haemorroid : 'normal'}
                  onChange={(val) => handleGenetaliaChange('haemorroid', val)}
                  options={['normal', 'tidak ada', 'grade 1', 'grade 2', 'haemorroid interna (-)', 'abnormal']}
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-1.5 text-xs">
              <label className="w-24 sm:w-28 font-bold text-slate-800 shrink-0">Spincer Ani</label>
              <div className="flex-1 min-w-0">
                <NormalSelect
                  id="input-genetalia-spincer-ani"
                  disabled={disabled}
                  value={genetalia.spincerAni !== undefined ? genetalia.spincerAni : 'normal'}
                  onChange={(val) => handleGenetaliaChange('spincerAni', val)}
                  options={['normal', 'tonus baik', 'kuat', 'lemah', 'abnormal']}
                  className="w-full"
                />
              </div>
            </div>

            <div className="border border-slate-300 rounded p-2 bg-slate-50/50 space-y-1.5 mt-1 min-w-0">
              <div className="text-[11px] font-black text-slate-800 uppercase tracking-tight">
                LAKI - LAKI
              </div>
              <div className="space-y-1.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs min-w-0">
                  <label className="text-[11px] font-semibold text-slate-700 leading-tight shrink-0">
                    Epididymis/Testis/Prostat
                  </label>
                  <div className="w-full sm:w-32 min-w-0">
                    <NormalSelect
                      id="input-genetalia-pria-testis"
                      disabled={disabled}
                      value={genetalia.epididymisTestisProstat !== undefined ? genetalia.epididymisTestisProstat : 'normal'}
                      onChange={(val) => handleGenetaliaChange('epididymisTestisProstat', val)}
                      options={['normal', 'tidak teraba massa', 'BPH (-)', 'abnormal']}
                      className="w-full"
                    />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs min-w-0">
                  <label className="text-[11px] font-semibold text-slate-700 leading-tight shrink-0">
                    Varicocele, Hydrocele
                  </label>
                  <div className="w-full sm:w-32 min-w-0">
                    <NormalSelect
                      id="input-genetalia-pria-varicocele"
                      disabled={disabled}
                      value={genetalia.varicoceleHydrocele !== undefined ? genetalia.varicoceleHydrocele : 'normal'}
                      onChange={(val) => handleGenetaliaChange('varicoceleHydrocele', val)}
                      options={['normal', 'tidak ada', 'varicocele (-/-)', 'hydrocele (-/-)', 'abnormal']}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="border border-slate-300 rounded p-2 bg-slate-50/50 space-y-1.5 mt-1 min-w-0">
              <div className="text-[11px] font-black text-slate-800 uppercase tracking-tight">
                PEREMPUAN
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-1 text-xs min-w-0">
                  <label className="text-[11px] font-semibold text-slate-700 shrink-0">
                    Flour Albus
                  </label>
                  <div className="w-28 sm:w-32 min-w-0">
                    <NormalSelect
                      id="input-genetalia-wanita-flour-albus"
                      disabled={disabled}
                      value={genetalia.flourAlbus !== undefined ? genetalia.flourAlbus : 'normal'}
                      onChange={(val) => handleGenetaliaChange('flourAlbus', val)}
                      options={['normal', 'tidak ada', 'fisiologis', 'patologis (-)', 'abnormal']}
                      className="w-full"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between gap-1 text-xs min-w-0">
                  <label className="text-[11px] font-semibold text-slate-700 shrink-0">
                    Paps Smear
                  </label>
                  <div className="w-28 sm:w-32 min-w-0">
                    <NormalSelect
                      id="input-genetalia-wanita-paps-smear"
                      disabled={disabled}
                      value={genetalia.papsSmear !== undefined ? genetalia.papsSmear : 'normal'}
                      onChange={(val) => handleGenetaliaChange('papsSmear', val)}
                      options={['normal', 'dalam batas normal', 'kelas 1 (normal)', 'belum diperiksa', '-']}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-1.5 text-xs pt-1">
              <label className="w-24 sm:w-28 font-bold text-slate-800 shrink-0">Leher</label>
              <div className="flex-1 min-w-0">
                <NormalSelect
                  id="input-fisik-leher"
                  disabled={disabled}
                  value={genetalia.leher !== undefined ? genetalia.leher : 'normal'}
                  onChange={(val) => handleGenetaliaChange('leher', val)}
                  options={['normal', 'pembesaran KGB (-)', 'simetris', 'kaku kuduk (-)', 'abnormal']}
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-1.5 text-xs">
              <label className="w-24 sm:w-28 font-bold text-slate-800 shrink-0">JVP</label>
              <div className="flex-1 min-w-0">
                <NormalSelect
                  id="input-fisik-jvp"
                  disabled={disabled}
                  value={genetalia.jvp !== undefined ? genetalia.jvp : 'normal'}
                  onChange={(val) => handleGenetaliaChange('jvp', val)}
                  options={['normal', '5-2 cmH2O', 'tidak meningkat', 'meningkat', 'abnormal']}
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-1.5 text-xs">
              <label className="w-24 sm:w-28 font-bold text-slate-800 shrink-0">Struma</label>
              <div className="flex-1 min-w-0">
                <NormalSelect
                  id="input-fisik-struma"
                  disabled={disabled}
                  value={genetalia.struma !== undefined ? genetalia.struma : 'normal'}
                  onChange={(val) => handleGenetaliaChange('struma', val)}
                  options={['normal', 'tidak ada', 'tiroid membesar (-)', 'difus (-)', 'abnormal']}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {(onPrevTab || onNextTab) && (
        <div className="flex items-center justify-between pt-3 border-t border-slate-200">
          <div>
            {onPrevTab && (
              <button
                id="btn-prev-to-umum"
                type="button"
                onClick={onPrevTab}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Kembali ke UMUM</span>
              </button>
            )}
          </div>
          <div className="text-xs text-slate-500 font-medium hidden sm:block">
            Tahap 2 : <span className="font-bold text-slate-700">Pemeriksaan Fisik (1)</span>
          </div>
          <div>
            {onNextTab && (
              <button
                id="btn-next-to-fisik2"
                type="button"
                onClick={onNextTab}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm shadow-blue-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>Lanjut ke FISIK (2)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
