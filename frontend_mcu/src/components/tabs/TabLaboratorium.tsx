import React from 'react';
import { MCURecord } from '../../types';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { synthesizeConclusionAndAdvice } from '../../utils/autoSummaryGenerators';
import { PosNegSelect, DEFAULT_POS_NEG_OPTIONS, URINE_TEST_OPTIONS, KRISTAL_OPTIONS, SILINDER_OPTIONS } from '../PosNegSelect';

interface TabLaboratoriumProps {
  data: MCURecord;
  onChange: (updates: Partial<MCURecord>) => void;
  disabled?: boolean;
  onNextTab?: () => void;
  onPrevTab?: () => void;
}

// Helper untuk menyaring input hanya angka, titik, koma, dan strip
const sanitizeNumericInput = (val: string) => {
  return val.replace(/[^0-9.,-]/g, '');
};

export const TabLaboratorium: React.FC<TabLaboratoriumProps> = ({ data, onChange, disabled, onNextTab, onPrevTab }) => {
  const isMale = data.jenisKelamin !== 'P';

  const hem = data.hematologi || {
    hemoglobin: '',
    hematokrit: '',
    leukosit: '',
    trombosit: '',
    led: '',
    eritrosit: '',
    malaria: 'Negatif',
    hitungJenis: {
      basofil: '',
      eosinofil: '',
      batang: '',
      segmen: '',
      limfosit: '',
      monosit: '',
      staf: '',
      netrofit: ''
    }
  };

  const diff = hem.hitungJenis || {
    basofil: '',
    eosinofil: '',
    batang: '',
    segmen: '',
    limfosit: '',
    monosit: '',
    staf: '',
    netrofit: ''
  };

  const urin = data.urinLengkap || {
    warna: 'Kuning Jernih',
    kejernihan: 'Jernih',
    ph: 6.0,
    beratJenis: 1.015,
    proteinAlbumin: 'Negatif',
    reduksi: 'Negatif',
    glukosa: 'Negatif',
    bilirubin: 'Negatif',
    urobilinogen: 'Negatif',
    granuler: 'Negatif',
    hyaline: 'Negatif',
    bakteri: 'Negatif',
    lainLain: '',
    kesUrineRutin: 'DBN',
    sedimen: {
      leukosit: '',
      eritrosit: '',
      epitel: '',
      kristal: 'Negatif',
      silinder: 'Negatif',
      bakteri: 'Negatif',
      eritrositRbc: '',
      lekositWbc: '',
      selEpitel: ''
    },
    kristalDetail: {
      asamUrat: 'Negatif',
      amorf: 'Negatif',
      triplePhosp: 'Negatif',
      caOx: 'Negatif'
    }
  };

  const sedimen = urin.sedimen || {
    leukosit: '',
    eritrosit: '',
    epitel: '',
    kristal: 'Negatif',
    silinder: 'Negatif',
    bakteri: 'Negatif',
    eritrositRbc: '',
    lekositWbc: '',
    selEpitel: ''
  };

  const kristal = urin.kristalDetail || {
    asamUrat: 'Negatif',
    amorf: 'Negatif',
    triplePhosp: 'Negatif',
    caOx: 'Negatif'
  };

  const handleHemChange = (field: keyof MCURecord['hematologi'], value: string) => {
    onChange({
      hematologi: {
        ...hem,
        [field]: sanitizeNumericInput(value)
      }
    });
  };

  const handleDiffChange = (field: keyof NonNullable<MCURecord['hematologi']['hitungJenis']>, value: string) => {
    onChange({
      hematologi: {
        ...hem,
        hitungJenis: {
          ...diff,
          [field]: sanitizeNumericInput(value)
        }
      }
    });
  };

  const handleUrinChange = (field: keyof MCURecord['urinLengkap'], value: string) => {
    onChange({
      urinLengkap: {
        ...urin,
        [field]: value
      }
    });
  };

  const handleSedimenChange = (field: keyof NonNullable<MCURecord['urinLengkap']['sedimen']>, value: string) => {
    onChange({
      urinLengkap: {
        ...urin,
        sedimen: {
          ...sedimen,
          [field]: sanitizeNumericInput(value)
        }
      }
    });
  };

  const handleKristalChange = (field: keyof NonNullable<MCURecord['urinLengkap']['kristalDetail']>, value: string) => {
    onChange({
      urinLengkap: {
        ...urin,
        kristalDetail: {
          ...kristal,
          [field]: value
        }
      }
    });
  };

  return (
    <div id="tab-laboratorium-container" className="space-y-3">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 items-start">
        
        <div className="border border-slate-400/80 rounded-md p-3.5 bg-white shadow-2xs space-y-2">
          <div className="text-xs font-black tracking-tight text-slate-800 uppercase pb-1.5 border-b border-slate-100">
            HEMATOLOGI DARAH LENGKAP
          </div>

          <div className="space-y-1.5 pt-1 text-xs">
            
            <div className="flex items-center gap-2">
              <label className="w-28 font-bold text-slate-800 shrink-0">HB</label>
              <input
                id="input-lab-hb"
                type="text"
                disabled={disabled}
                value={hem.hemoglobin !== undefined ? hem.hemoglobin : ''}
                onChange={(e) => handleHemChange('hemoglobin', e.target.value)}
                placeholder=""
                className="w-32 px-2 py-0.5 text-xs bg-white border border-slate-300 rounded font-mono"
              />
              <span className="text-slate-600 font-medium font-sans text-xs">
                {isMale ? 'L.13.2-17.3 g/dL' : 'P.11.7-15.5 g/dL'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <label className="w-28 font-bold text-slate-800 shrink-0">Leukosit</label>
              <input
                id="input-lab-leukosit"
                type="text"
                disabled={disabled}
                value={hem.leukosit !== undefined ? hem.leukosit : ''}
                onChange={(e) => handleHemChange('leukosit', e.target.value)}
                placeholder=""
                className="w-32 px-2 py-0.5 text-xs bg-white border border-slate-300 rounded font-mono"
              />
              <span className="text-slate-600 font-medium font-sans text-xs">
                4.5-11.5 (1000/uL)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <label className="w-28 font-bold text-slate-800 shrink-0">LED</label>
              <input
                id="input-lab-led"
                type="text"
                disabled={disabled}
                value={hem.led !== undefined ? hem.led : ''}
                onChange={(e) => handleHemChange('led', e.target.value)}
                placeholder=""
                className="w-32 px-2 py-0.5 text-xs bg-white border border-slate-300 rounded font-mono"
              />
              <span className="text-slate-600 font-medium font-sans text-xs">
                0-10 mm/jam
              </span>
            </div>

            <div className="pt-1">
              <div className="font-bold text-slate-800 text-xs mb-1">
                Hitung Jenis
              </div>

              <div className="space-y-1.5 pl-3">
                
                <div className="flex items-center gap-2">
                  <label className="w-24 text-slate-700 font-medium shrink-0">Eosinopil</label>
                  <input
                    id="input-diff-eosinofil"
                    type="text"
                    disabled={disabled}
                    value={diff.eosinofil !== undefined ? diff.eosinofil : ''}
                    onChange={(e) => handleDiffChange('eosinofil', e.target.value)}
                    placeholder=""
                    className="w-32 px-2 py-0.5 text-xs bg-white border border-slate-300 rounded font-mono"
                  />
                  <span className="text-slate-600 font-medium font-sans text-xs">
                    2-4 %
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <label className="w-24 text-slate-700 font-medium shrink-0">Basopil</label>
                  <input
                    id="input-diff-basofil"
                    type="text"
                    disabled={disabled}
                    value={diff.basofil !== undefined ? diff.basofil : ''}
                    onChange={(e) => handleDiffChange('basofil', e.target.value)}
                    placeholder=""
                    className="w-32 px-2 py-0.5 text-xs bg-white border border-slate-300 rounded font-mono"
                  />
                  <span className="text-slate-600 font-medium font-sans text-xs">
                    0-1 %
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <label className="w-24 text-slate-700 font-medium shrink-0">Staf</label>
                  <input
                    id="input-diff-staf"
                    type="text"
                    disabled={disabled}
                    value={diff.staf ?? ''}
                    onChange={(e) => {
                      handleDiffChange('staf', e.target.value);
                    }}
                    placeholder=""
                    className="w-32 px-2 py-0.5 text-xs bg-white border border-slate-300 rounded font-mono"
                  />
                  <span className="text-slate-600 font-medium font-sans text-xs">
                    2-5 %
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <label className="w-24 text-slate-700 font-medium shrink-0">Netrofit</label>
                  <input
                    id="input-diff-netrofit"
                    type="text"
                    disabled={disabled}
                    value={diff.netrofit ?? ''}
                    onChange={(e) => {
                      handleDiffChange('netrofit', e.target.value);
              
                    }}
                    placeholder=""
                    className="w-32 px-2 py-0.5 text-xs bg-white border border-slate-300 rounded font-mono"
                  />
                  <span className="text-slate-600 font-medium font-sans text-xs">
                    50-70 %
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <label className="w-24 text-slate-700 font-medium shrink-0">Lymposit</label>
                  <input
                    id="input-diff-lymposit"
                    type="text"
                    disabled={disabled}
                    value={diff.limfosit !== undefined ? diff.limfosit : ''}
                    onChange={(e) => handleDiffChange('limfosit', e.target.value)}
                    placeholder=""
                    className="w-32 px-2 py-0.5 text-xs bg-white border border-slate-300 rounded font-mono"
                  />
                  <span className="text-slate-600 font-medium font-sans text-xs">
                    25-40 %
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <label className="w-24 text-slate-700 font-medium shrink-0">Monosit</label>
                  <input
                    id="input-diff-monosit"
                    type="text"
                    disabled={disabled}
                    value={diff.monosit !== undefined ? diff.monosit : ''}
                    onChange={(e) => handleDiffChange('monosit', e.target.value)}
                    placeholder=""
                    className="w-32 px-2 py-0.5 text-xs bg-white border border-slate-300 rounded font-mono"
                  />
                  <span className="text-slate-600 font-medium font-sans text-xs">
                    2-8 %
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <label className="w-28 font-bold text-slate-800 shrink-0">Eritrosit</label>
              <input
                id="input-lab-eritrosit"
                type="text"
                disabled={disabled}
                value={hem.eritrosit !== undefined ? hem.eritrosit : ''}
                onChange={(e) => handleHemChange('eritrosit', e.target.value)}
                placeholder=""
                className="w-32 px-2 py-0.5 text-xs bg-white border border-slate-300 rounded font-mono"
              />
              <span className="text-slate-600 font-medium font-sans text-xs">
                {isMale ? 'L.4,2-6,0jt mm' : 'P.3,8-5,2jt mm'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <label className="w-28 font-bold text-slate-800 shrink-0">Trombosit</label>
              <input
                id="input-lab-trombosit"
                type="text"
                disabled={disabled}
                value={hem.trombosit !== undefined ? hem.trombosit : ''}
                onChange={(e) => handleHemChange('trombosit', e.target.value)}
                placeholder=""
                className="w-32 px-2 py-0.5 text-xs bg-white border border-slate-300 rounded font-mono"
              />
              <span className="text-slate-600 font-medium font-sans text-xs">
                150-450 (1000/uL)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <label className="w-28 font-bold text-slate-800 shrink-0">Hematokrit</label>
              <input
                id="input-lab-hematokrit"
                type="text"
                disabled={disabled}
                value={hem.hematokrit !== undefined ? hem.hematokrit : ''}
                onChange={(e) => handleHemChange('hematokrit', e.target.value)}
                placeholder=""
                className="w-32 px-2 py-0.5 text-xs bg-white border border-slate-300 rounded font-mono"
              />
              <span className="text-slate-600 font-medium font-sans text-xs">
                {isMale ? 'L.42-52 %' : 'P.37-47 %'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <label className="w-28 font-bold text-slate-800 shrink-0">Malaria</label>
              <PosNegSelect
                id="input-lab-malaria"
                disabled={disabled}
                value={hem.malaria !== undefined ? hem.malaria : 'Negatif'}
                onChange={(val) => handleHemChange('malaria', val)}
                options={DEFAULT_POS_NEG_OPTIONS}
                className="w-32"
              />
              <span className="text-slate-600 font-medium font-sans text-xs">
                Negatif
              </span>
            </div>
          </div>
        </div>

        <div className="border border-slate-400/80 rounded-md p-3.5 bg-white shadow-2xs space-y-3">
          <div className="text-xs font-black tracking-tight text-slate-800 uppercase pb-1.5 border-b border-slate-100">
            URINE LENGKAP
          </div>

          <div className="space-y-3 text-xs">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 items-start">
              
              <div className="space-y-1.5">
                
                <div className="flex items-center gap-1.5">
                  <label className="w-28 font-medium text-slate-800 shrink-0 leading-tight">
                    Protein / Albumin
                  </label>
                  <PosNegSelect
                    id="input-urin-protein"
                    disabled={disabled}
                    value={urin.proteinAlbumin !== undefined ? urin.proteinAlbumin : 'Negatif'}
                    onChange={(val) => handleUrinChange('proteinAlbumin', val)}
                    options={URINE_TEST_OPTIONS}
                    className="w-28"
                  />
                  <span className="text-slate-600 font-medium font-sans text-xs">
                    Negatif
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <label className="w-28 font-medium text-slate-800 shrink-0 leading-tight">
                    Reduksi
                  </label>
                  <PosNegSelect
                    id="input-urin-reduksi"
                    disabled={disabled}
                    value={urin.reduksi !== undefined ? urin.reduksi : (urin.glukosa !== undefined ? urin.glukosa : 'Negatif')}
                    onChange={(val) => {
                      onChange({
                        urinLengkap: {
                          ...urin,
                          reduksi: val,
                          glukosa: val
                        }
                      });
                    }}
                    options={URINE_TEST_OPTIONS}
                    className="w-28"
                  />
                  <span className="text-slate-600 font-medium font-sans text-xs">
                    Negatif
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <label className="w-28 font-medium text-slate-800 shrink-0 leading-tight">
                    Urobilinogen
                  </label>
                  <PosNegSelect
                    id="input-urin-urobilinogen"
                    disabled={disabled}
                    value={urin.urobilinogen !== undefined ? urin.urobilinogen : 'Negatif'}
                    onChange={(val) => handleUrinChange('urobilinogen', val)}
                    options={['Negatif', 'Normal', 'Positif (+1)', 'Positif (+2)', 'Positif', '-']}
                    className="w-28"
                  />
                  <span className="text-slate-600 font-medium font-sans text-xs">
                    Negatif
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <label className="w-28 font-medium text-slate-800 shrink-0 leading-tight">
                    Bilirubin
                  </label>
                  <PosNegSelect
                    id="input-urin-bilirubin"
                    disabled={disabled}
                    value={urin.bilirubin !== undefined ? urin.bilirubin : 'Negatif'}
                    onChange={(val) => handleUrinChange('bilirubin', val)}
                    options={URINE_TEST_OPTIONS}
                    className="w-28"
                  />
                  <span className="text-slate-600 font-medium font-sans text-xs">
                    Negatif
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="font-bold text-slate-800 text-xs">
                  Silinder
                </div>

                <div className="flex items-center gap-1.5 pl-2">
                  <label className="w-20 font-medium text-slate-700 shrink-0">
                    Granuler
                  </label>
                  <PosNegSelect
                    id="input-silinder-granuler"
                    disabled={disabled}
                    value={urin.granuler !== undefined ? urin.granuler : 'Negatif'}
                    onChange={(val) => handleUrinChange('granuler', val)}
                    options={SILINDER_OPTIONS}
                    className="w-28"
                  />
                  <span className="text-slate-600 font-medium font-sans text-xs">
                    Negatif
                  </span>
                </div>

                <div className="flex items-center gap-1.5 pl-2">
                  <label className="w-20 font-medium text-slate-700 shrink-0">
                    Hyaline
                  </label>
                  <PosNegSelect
                    id="input-silinder-hyaline"
                    disabled={disabled}
                    value={urin.hyaline !== undefined ? urin.hyaline : 'Negatif'}
                    onChange={(val) => handleUrinChange('hyaline', val)}
                    options={SILINDER_OPTIONS}
                    className="w-28"
                  />
                  <span className="text-slate-600 font-medium font-sans text-xs">
                    Negatif
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <label className="w-22 font-medium text-slate-800 shrink-0">
                    Bakteri
                  </label>
                  <PosNegSelect
                    id="input-urin-bakteri"
                    disabled={disabled}
                    value={urin.bakteri !== undefined ? urin.bakteri : (sedimen.bakteri !== undefined ? sedimen.bakteri : 'Negatif')}
                    onChange={(val) => {
                      onChange({
                        urinLengkap: {
                          ...urin,
                          bakteri: val,
                          sedimen: {
                            ...sedimen,
                            bakteri: val
                          }
                        }
                      });
                    }}
                    options={KRISTAL_OPTIONS}
                    className="w-28" 
                  />
                  <span className="text-slate-600 font-medium font-sans text-xs">
                    Negatif
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <label className="w-22 font-medium text-slate-800 shrink-0">
                    Lain-lain
                  </label>
                  <input
                    id="input-urin-lain-lain"
                    type="text"
                    disabled={disabled}
                    value={urin.lainLain !== undefined ? urin.lainLain : ''}
                    onChange={(e) => handleUrinChange('lainLain', e.target.value)}
                    placeholder=""
                    className="w-24 px-2 py-0.5 text-xs bg-white border border-slate-300 rounded font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2 border-t border-slate-100 items-end">
              
              <div className="sm:col-span-7 space-y-2">
                
                <div>
                  <div className="font-bold text-slate-800 text-xs mb-1">
                    Sedimen
                  </div>
                  <div className="space-y-1.5 pl-2">
                    
                    <div className="flex items-center gap-1.5">
                      <label className="w-28 font-medium text-slate-700 shrink-0">
                        Eritrosit / Rbc
                      </label>
                      <input
                        id="input-sedimen-eritrosit-rbc"
                        type="text"
                        disabled={disabled}
                        value={sedimen.eritrosit !== undefined ? sedimen.eritrosit : ''}
                        onChange={(e) => {
                          handleSedimenChange('eritrosit', e.target.value);
                        }}
                        placeholder=""
                        className="w-20 px-2 py-0.5 text-xs bg-white border border-slate-300 rounded font-mono"
                      />
                      <span className="text-slate-600 font-medium font-sans text-xs">
                        &lt;3 /Lpb
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <label className="w-28 font-medium text-slate-700 shrink-0">
                        Lekosit / Wbc
                      </label>
                      <input
                        id="input-sedimen-lekosit-wbc"
                        type="text"
                        disabled={disabled}
                        value={sedimen.leukosit !== undefined ? sedimen.leukosit : ''}
                        onChange={(e) => {
                          handleSedimenChange('leukosit', e.target.value);
                        }}
                        placeholder=""
                        className="w-20 px-2 py-0.5 text-xs bg-white border border-slate-300 rounded font-mono"
                      />
                      <span className="text-slate-600 font-medium font-sans text-xs">
                        &lt;5 /Lpb
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <label className="w-28 font-medium text-slate-700 shrink-0">
                        Sel Epitel
                      </label>
                      <input
                        id="input-sedimen-sel-epitel"
                        type="text"
                        disabled={disabled}
                        value={sedimen.epitel !== undefined ? sedimen.epitel : ''}
                        onChange={(e) => {
                          handleSedimenChange('epitel', e.target.value);
                        }}
                        placeholder=""
                        className="w-20 px-2 py-0.5 text-xs bg-white border border-slate-300 rounded font-mono"
                      />
                      <span className="text-slate-600 font-medium font-sans text-xs">
                        &lt;=15
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="font-bold text-slate-800 text-xs mb-1">
                    Kristal
                  </div>
                  <div className="space-y-1.5 pl-2">
                    
                    <div className="flex items-center gap-1.5">
                      <label className="w-28 font-medium text-slate-700 shrink-0">
                        Asam Urat
                      </label>
                      <PosNegSelect
                        id="input-kristal-asam-urat"
                        disabled={disabled}
                        value={kristal.asamUrat !== undefined ? kristal.asamUrat : 'Negatif'}
                        onChange={(val) => handleKristalChange('asamUrat', val)}
                        options={KRISTAL_OPTIONS}
                        className="w-24"
                      />
                      <span className="text-slate-600 font-medium font-sans text-xs">
                        Negatif
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <label className="w-28 font-medium text-slate-700 shrink-0">
                        Amorf
                      </label>
                      <PosNegSelect
                        id="input-kristal-amorf"
                        disabled={disabled}
                        value={kristal.amorf !== undefined ? kristal.amorf : 'Negatif'}
                        onChange={(val) => handleKristalChange('amorf', val)}
                        options={KRISTAL_OPTIONS}
                        className="w-24"
                      />
                      <span className="text-slate-600 font-medium font-sans text-xs">
                        Negatif
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <label className="w-28 font-medium text-slate-700 shrink-0">
                        Triple Phosp
                      </label>
                      <PosNegSelect
                        id="input-kristal-triple-phosp"
                        disabled={disabled}
                        value={kristal.triplePhosp !== undefined ? kristal.triplePhosp : 'Negatif'}
                        onChange={(val) => handleKristalChange('triplePhosp', val)}
                        options={KRISTAL_OPTIONS}
                        className="w-24"
                      />
                      <span className="text-slate-600 font-medium font-sans text-xs">
                        Negatif
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <label className="w-28 font-medium text-slate-700 shrink-0">
                        Ca.ox
                      </label>
                      <PosNegSelect
                        id="input-kristal-ca-ox"
                        disabled={disabled}
                        value={kristal.caOx !== undefined ? kristal.caOx : 'Negatif'}
                        onChange={(val) => handleKristalChange('caOx', val)}
                        options={KRISTAL_OPTIONS}
                        className="w-24"
                      />
                      <span className="text-slate-600 font-medium font-sans text-xs">
                        Negatif
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="sm:col-span-5 pb-2">
                <div className="border border-slate-400 rounded p-2.5 bg-slate-50/50 flex items-center justify-between gap-2">
                  <label className="text-xs font-black text-slate-800 uppercase">
                    KES. URINE RUTIN
                  </label>
                  <input
                    id="input-kes-urine-rutin"
                    type="text"
                    disabled={disabled}
                    value={urin.kesUrineRutin !== undefined ? urin.kesUrineRutin : 'DBN'}
                    onChange={(e) => handleUrinChange('kesUrineRutin', e.target.value)}
                    placeholder="DBN"
                    className="w-20 sm:w-24 px-2 py-1 text-xs bg-white border border-slate-300 rounded font-mono font-bold text-center shrink-0"
                  />
                </div>
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
                id="btn-prev-to-fisik2"
                type="button"
                onClick={onPrevTab}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Kembali ke FISIK (2)</span>
              </button>
            )}
          </div>
          <div className="text-xs text-slate-500 font-medium hidden sm:block">
            Tahap 4 : <span className="font-bold text-slate-700">Laboratorium (Darah &amp; Urin)</span>
          </div>
          <div>
            {onNextTab && (
              <button
                id="btn-next-to-kimia-klinik"
                type="button"
                onClick={onNextTab}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm shadow-blue-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>Lanjut ke KIMIA KLINIK</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};