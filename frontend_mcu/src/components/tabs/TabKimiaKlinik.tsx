import React from 'react';
import { MCURecord } from '../../types';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { synthesizeConclusionAndAdvice } from '../../utils/autoSummaryGenerators';
import { PosNegSelect, DEFAULT_POS_NEG_OPTIONS, URINE_TEST_OPTIONS, SEROLOGY_OPTIONS } from '../PosNegSelect';

interface TabKimiaKlinikProps {
  data: MCURecord;
  onChange: (updates: Partial<MCURecord>) => void;
  disabled?: boolean;
  onNextTab?: () => void;
  onPrevTab?: () => void;
}

// Helper untuk membatasi input hanya angka, titik, koma, dan strip (-)
const sanitizeNumericInput = (val: string) => {
  return val.replace(/[^0-9.,-]/g, '');
};

export const TabKimiaKlinik: React.FC<TabKimiaKlinikProps> = ({ data, onChange, disabled, onNextTab, onPrevTab }) => {
  const isMale = data.jenisKelamin !== 'P';

  const kk = data.kimiaKlinik || {
    fungsiHati: {
      sgot: '',
      sgpt: '',
      gammaGT: '',
      alkalinePhospat: '',
      alkaliFosfatase: '',
      bilirubinTotal: '',
      bilirubinDirek: '',
      bilirubinIndirek: '',
      proteinTotal: '',
      albumin: '',
      globulin: ''
    },
    fungsiGinjal: {
      ureum: '',
      kreatinin: '',
      asamUrat: '',
      egfr: ''
    },
    profilLipid: {
      kolesterolTotal: '',
      hdl: '',
      ldl: '',
      trigliserida: ''
    },
    glukosa: {
      gulaDarahPuasa: '',
      gulaDarah2JamPP: '',
      urineReduksiPuasa: 'Negatif',
      urineReduksi2JamPP: 'Negatif',
      hba1c: ''
    },
    immunologi: {
      hbsAg: '-',
      antiHBs: '-',
      asto: '-',
      rematoidFaktor: '-',
      crp: '-'
    },
    kesimpulanKimia: {
      kesLab: 'DBN',
      kesHbsag: 'Negatif'
    }
  };

  const hati = kk.fungsiHati || {
    sgot: '',
    sgpt: '',
    gammaGT: '',
    alkalinePhospat: '',
    bilirubinTotal: '',
    bilirubinDirek: '',
    bilirubinIndirek: '',
    proteinTotal: '',
    albumin: '',
    globulin: ''
  };

  const lipid = kk.profilLipid || {
    kolesterolTotal: '',
    trigliserida: '',
    hdl: '',
    ldl: ''
  };

  const ginjal = kk.fungsiGinjal || {
    ureum: '',
    kreatinin: '',
    asamUrat: ''
  };

  const gula = kk.glukosa || {
    gdp: '',
    gd2pp: '',
    gulaDarahPuasa: '',
    gulaDarah2JamPP: '',
    urineReduksiPuasa: 'Negatif',
    urineReduksi2JamPP: 'Negatif'
  };

  const imuno = kk.immunologi || {
    hbsAg: '-',
    antiHBs: '-',
    asto: '-',
    rematoidFaktor: '-',
    crp: '-'
  };

  const kes = kk.kesimpulanKimia || {
    kesLab: 'DBN',
    kesHbsag: 'Negatif'
  };

  const handleHatiChange = (field: keyof NonNullable<MCURecord['kimiaKlinik']['fungsiHati']>, value: any) => {
    onChange({
      kimiaKlinik: {
        ...kk,
        fungsiHati: {
          ...hati,
          [field]: typeof value === 'string' ? sanitizeNumericInput(value) : value
        }
      }
    });
  };

  const handleLipidChange = (field: keyof NonNullable<MCURecord['kimiaKlinik']['profilLipid']>, value: any) => {
    onChange({
      kimiaKlinik: {
        ...kk,
        profilLipid: {
          ...lipid,
          [field]: typeof value === 'string' ? sanitizeNumericInput(value) : value
        }
      }
    });
  };

  const handleGinjalChange = (field: keyof NonNullable<MCURecord['kimiaKlinik']['fungsiGinjal']>, value: any) => {
    onChange({
      kimiaKlinik: {
        ...kk,
        fungsiGinjal: {
          ...ginjal,
          [field]: typeof value === 'string' ? sanitizeNumericInput(value) : value
        }
      }
    });
  };

  const handleGulaChange = (field: keyof NonNullable<MCURecord['kimiaKlinik']['glukosa']>, value: any) => {
    const finalVal = typeof value === 'string' && !field.includes('urineReduksi') ? sanitizeNumericInput(value) : value;
    onChange({
      kimiaKlinik: {
        ...kk,
        glukosa: {
          ...gula,
          [field]: finalVal
        }
      }
    });
  };

  const handleImunoChange = (field: keyof NonNullable<MCURecord['kimiaKlinik']['immunologi']>, value: any) => {
    onChange({
      kimiaKlinik: {
        ...kk,
        immunologi: {
          ...imuno,
          [field]: value
        }
      }
    });
  };

  const handleKesChange = (field: keyof NonNullable<MCURecord['kimiaKlinik']['kesimpulanKimia']>, value: any) => {
    onChange({
      kimiaKlinik: {
        ...kk,
        kesimpulanKimia: {
          ...kes,
          [field]: value
        }
      }
    });
  };

  return (
    <div id="tab-kimia-klinik-container" className="space-y-3">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-start">
        
        {/* FALL HATI */}
        <div className="lg:col-span-4">
          <div className="border border-slate-400/80 rounded-md p-3.5 bg-white shadow-2xs space-y-2">
            <div className="text-xs font-black tracking-tight text-slate-800 uppercase pb-1.5 border-b border-slate-100">
              FALL HATI
            </div>

            <div className="space-y-1.5 text-xs pt-1">
              <div className="font-bold text-slate-800 text-xs">
                Bilirubin
              </div>

              <div className="flex items-center gap-2 pl-4">
                <label className="w-24 font-medium text-slate-700 shrink-0">Total</label>
                <input
                  id="input-hati-bilirubin-total"
                  type="text"
                  disabled={disabled}
                  value={hati.bilirubinTotal !== undefined ? hati.bilirubinTotal : ''}
                  onChange={(e) => handleHatiChange('bilirubinTotal', e.target.value)}
                  placeholder=""
                  className="w-24 px-2 py-0.5 text-xs bg-white border border-slate-300 rounded font-mono"
                />
                <span className="text-slate-600 font-medium font-sans text-xs">
                  &lt;=1,2 mg/dL
                </span>
              </div>

              <div className="flex items-center gap-2 pl-4">
                <label className="w-24 font-medium text-slate-700 shrink-0">Direct</label>
                <input
                  id="input-hati-bilirubin-direct"
                  type="text"
                  disabled={disabled}
                  value={hati.bilirubinDirek !== undefined ? hati.bilirubinDirek : ''}
                  onChange={(e) => handleHatiChange('bilirubinDirek', e.target.value)}
                  placeholder=""
                  className="w-24 px-2 py-0.5 text-xs bg-white border border-slate-300 rounded font-mono"
                />
                <span className="text-slate-600 font-medium font-sans text-xs">
                  0-0,2 mg/dL
                </span>
              </div>

              <div className="flex items-center gap-2 pl-4">
                <label className="w-24 font-medium text-slate-700 shrink-0">Indirect</label>
                <input
                  id="input-hati-bilirubin-indirect"
                  type="text"
                  disabled={disabled}
                  value={hati.bilirubinIndirek !== undefined ? hati.bilirubinIndirek : ''}
                  onChange={(e) => handleHatiChange('bilirubinIndirek', e.target.value)}
                  placeholder=""
                  className="w-24 px-2 py-0.5 text-xs bg-white border border-slate-300 rounded font-mono"
                />
                <span className="text-slate-600 font-medium font-sans text-xs">
                  0.2-0,6 mg/dL
                </span>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <label className="w-32 font-bold text-slate-800 shrink-0">Alkaline Phospat</label>
                <input
                  id="input-hati-alkaline-phospat"
                  type="text"
                  disabled={disabled}
                  value={hati.alkalinePhospat ?? ''}
                  onChange={(e) => {
                    handleHatiChange('alkalinePhospat', e.target.value);
                  }}
                  placeholder=""
                  className="w-24 px-2 py-0.5 text-xs bg-white border border-slate-300 rounded font-mono"
                />
                <span className="text-slate-600 font-medium font-sans text-xs">
                  {isMale ? 'L: <128 U/L' : 'P: <104 U/L'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <label className="w-32 font-bold text-slate-800 shrink-0">SGPT</label>
                <input
                  id="input-hati-sgpt"
                  type="text"
                  disabled={disabled}
                  value={hati.sgpt !== undefined ? hati.sgpt : ''}
                  onChange={(e) => handleHatiChange('sgpt', e.target.value)}
                  placeholder=""
                  className="w-24 px-2 py-0.5 text-xs bg-white border border-slate-300 rounded font-mono"
                />
                <span className="text-slate-600 font-medium font-sans text-xs">
                  {isMale ? 'L: <=41 U/L' : 'P: <=33 U/L'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <label className="w-32 font-bold text-slate-800 shrink-0">SGOT</label>
                <input
                  id="input-hati-sgot"
                  type="text"
                  disabled={disabled}
                  value={hati.sgot !== undefined ? hati.sgot : ''}
                  onChange={(e) => handleHatiChange('sgot', e.target.value)}
                  placeholder=""
                  className="w-24 px-2 py-0.5 text-xs bg-white border border-slate-300 rounded font-mono"
                />
                <span className="text-slate-600 font-medium font-sans text-xs">
                  {isMale ? 'L. <=37 U/L' : 'P. <=32 U/L'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <label className="w-32 font-bold text-slate-800 shrink-0">Gamma GT</label>
                <input
                  id="input-hati-gamma-gt"
                  type="text"
                  disabled={disabled}
                  value={hati.gammaGT !== undefined ? hati.gammaGT : ''}
                  onChange={(e) => handleHatiChange('gammaGT', e.target.value)}
                  placeholder=""
                  className="w-24 px-2 py-0.5 text-xs bg-white border border-slate-300 rounded font-mono"
                />
                <span className="text-slate-600 font-medium font-sans text-xs">
                  {isMale ? 'L. 8-61 U/L' : 'P. 5-36 U/L'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <label className="w-32 font-bold text-slate-800 shrink-0">Protein Total</label>
                <input
                  id="input-hati-protein-total"
                  type="text"
                  disabled={disabled}
                  value={hati.proteinTotal !== undefined ? hati.proteinTotal : ''}
                  onChange={(e) => handleHatiChange('proteinTotal', e.target.value)}
                  placeholder=""
                  className="w-24 px-2 py-0.5 text-xs bg-white border border-slate-300 rounded font-mono"
                />
                <span className="text-slate-600 font-medium font-sans text-xs">
                  6,7-8,7 Gr/dL
                </span>
              </div>

              <div className="flex items-center gap-2">
                <label className="w-32 font-bold text-slate-800 shrink-0">Albumin</label>
                <input
                  id="input-hati-albumin"
                  type="text"
                  disabled={disabled}
                  value={hati.albumin !== undefined ? hati.albumin : ''}
                  onChange={(e) => handleHatiChange('albumin', e.target.value)}
                  placeholder=""
                  className="w-24 px-2 py-0.5 text-xs bg-white border border-slate-300 rounded font-mono"
                />
                <span className="text-slate-600 font-medium font-sans text-xs">
                  3,9-5,0 Gr/dL
                </span>
              </div>

              <div className="flex items-center gap-2">
                <label className="w-32 font-bold text-slate-800 shrink-0">Globulin</label>
                <input
                  id="input-hati-globulin"
                  type="text"
                  disabled={disabled}
                  value={hati.globulin !== undefined ? hati.globulin : ''}
                  onChange={(e) => handleHatiChange('globulin', e.target.value)}
                  placeholder=""
                  className="w-24 px-2 py-0.5 text-xs bg-white border border-slate-300 rounded font-mono"
                />
                <span className="text-slate-600 font-medium font-sans text-xs">
                  2,3-3,5 Gr/dL
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* LEMAK, FALL GINJAL & GULA DARAH */}
        <div className="lg:col-span-4 space-y-3">
          
          <div className="border border-slate-400/80 rounded-md p-3.5 bg-white shadow-2xs space-y-2">
            <div className="text-xs font-black tracking-tight text-slate-800 uppercase pb-1 border-b border-slate-100">
              LEMAK
            </div>

            <div className="space-y-1.5 text-xs pt-0.5">
              <div className="flex items-center justify-between gap-2">
                <label className="w-28 font-bold text-slate-800 shrink-0">Kolest. Total</label>
                <input
                  id="input-lipid-kolesterol-total"
                  type="text"
                  disabled={disabled}
                  value={lipid.kolesterolTotal !== undefined ? lipid.kolesterolTotal : ''}
                  onChange={(e) => handleLipidChange('kolesterolTotal', e.target.value)}
                  placeholder=""
                  className="w-24 px-2 py-0.5 text-xs bg-white border border-slate-300 rounded font-mono"
                />
                <span className="w-24 text-right text-slate-600 font-medium font-sans text-xs">
                  &lt;=200 mg/dL
                </span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <label className="w-28 font-bold text-slate-800 shrink-0">Trigliserida</label>
                <input
                  id="input-lipid-trigliserida"
                  type="text"
                  disabled={disabled}
                  value={lipid.trigliserida !== undefined ? lipid.trigliserida : ''}
                  onChange={(e) => handleLipidChange('trigliserida', e.target.value)}
                  placeholder=""
                  className="w-24 px-2 py-0.5 text-xs bg-white border border-slate-300 rounded font-mono"
                />
                <span className="w-24 text-right text-slate-600 font-medium font-sans text-xs">
                  &lt;=200 mg/dL
                </span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <label className="w-28 font-bold text-slate-800 shrink-0">HDL Kolest</label>
                <input
                  id="input-lipid-hdl"
                  type="text"
                  disabled={disabled}
                  value={lipid.hdl !== undefined ? lipid.hdl : ''}
                  onChange={(e) => handleLipidChange('hdl', e.target.value)}
                  placeholder=""
                  className="w-24 px-2 py-0.5 text-xs bg-white border border-slate-300 rounded font-mono"
                />
                <span className="w-24 text-right text-slate-600 font-medium font-sans text-xs">
                  &gt;=40 mg/dL
                </span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <label className="w-28 font-bold text-slate-800 shrink-0">LDL Kolest</label>
                <input
                  id="input-lipid-ldl"
                  type="text"
                  disabled={disabled}
                  value={lipid.ldl !== undefined ? lipid.ldl : ''}
                  onChange={(e) => handleLipidChange('ldl', e.target.value)}
                  placeholder=""
                  className="w-24 px-2 py-0.5 text-xs bg-white border border-slate-300 rounded font-mono"
                />
                <span className="w-24 text-right text-slate-600 font-medium font-sans text-xs">
                  &lt;=100 mg/dL
                </span>
              </div>
            </div>
          </div>

          <div className="border border-slate-400/80 rounded-md p-3.5 bg-white shadow-2xs space-y-2">
            <div className="text-xs font-black tracking-tight text-slate-800 uppercase pb-1 border-b border-slate-100">
              FALL GINJAL
            </div>

            <div className="space-y-1.5 text-xs pt-0.5">
              <div className="flex items-center justify-between gap-2">
                <label className="w-28 font-bold text-slate-800 shrink-0">Ureum</label>
                <input
                  id="input-ginjal-ureum"
                  type="text"
                  disabled={disabled}
                  value={ginjal.ureum !== undefined ? ginjal.ureum : ''}
                  onChange={(e) => handleGinjalChange('ureum', e.target.value)}
                  placeholder=""
                  className="w-24 px-2 py-0.5 text-xs bg-white border border-slate-300 rounded font-mono"
                />
                <span className="w-28 text-right text-slate-600 font-medium font-sans text-xs">
                  10-50 mg/dL
                </span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <label className="w-28 font-bold text-slate-800 shrink-0">Kreatinin</label>
                <input
                  id="input-ginjal-kreatinin"
                  type="text"
                  disabled={disabled}
                  value={ginjal.kreatinin !== undefined ? ginjal.kreatinin : ''}
                  onChange={(e) => handleGinjalChange('kreatinin', e.target.value)}
                  placeholder=""
                  className="w-24 px-2 py-0.5 text-xs bg-white border border-slate-300 rounded font-mono"
                />
                <span className="w-28 text-right text-slate-600 font-medium font-sans text-xs">
                  {isMale ? 'L.0,7-1,2 mg/dL' : 'P.0,5-0,9 mg/dL'}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <label className="w-28 font-bold text-slate-800 shrink-0">Asam Urat</label>
                <input
                  id="input-ginjal-asam-urat"
                  type="text"
                  disabled={disabled}
                  value={ginjal.asamUrat !== undefined ? ginjal.asamUrat : ''}
                  onChange={(e) => handleGinjalChange('asamUrat', e.target.value)}
                  placeholder=""
                  className="w-24 px-2 py-0.5 text-xs bg-white border border-slate-300 rounded font-mono"
                />
                <span className="w-28 text-right text-slate-600 font-medium font-sans text-xs">
                  {isMale ? 'L.3,4-7,0 mg/dL' : 'P.2,4-5,7 mg/dL'}
                </span>
              </div>
            </div>
          </div>

          <div className="border border-slate-400/80 rounded-md p-3.5 bg-white shadow-2xs space-y-2">
            <div className="text-xs font-black tracking-tight text-slate-800 uppercase pb-1 border-b border-slate-100">
              GULA DARAH
            </div>

            <div className="space-y-1.5 text-xs pt-0.5">
              <div className="flex items-center justify-between gap-2">
                <label className="w-36 font-semibold text-slate-800 shrink-0">Gula Darah Puasa</label>
                <input
                  id="input-gula-darah-puasa"
                  type="text"
                  disabled={disabled}
                  value={gula.gulaDarahPuasa !== undefined ? gula.gulaDarahPuasa : ''}
                  onChange={(e) => {
                    handleGulaChange('gulaDarahPuasa', e.target.value);
                  }}
                  placeholder=""
                  className="w-24 px-2 py-0.5 text-xs bg-white border border-slate-300 rounded font-mono"
                />
                <span className="w-24 text-right text-slate-600 font-medium font-sans text-xs">
                  70-99 mg/dL
                </span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <label className="w-36 font-semibold text-slate-800 shrink-0">Gula Darah 2 Jam PP</label>
                <input
                  id="input-gula-darah-2jam-pp"
                  type="text"
                  disabled={disabled}
                  value={gula.gulaDarah2JamPP !== undefined ? gula.gulaDarah2JamPP : ''}
                  onChange={(e) => {
                    handleGulaChange('gulaDarah2JamPP', e.target.value);
                  }}
                  placeholder=""
                  className="w-24 px-2 py-0.5 text-xs bg-white border border-slate-300 rounded font-mono"
                />
                <span className="w-24 text-right text-slate-600 font-medium font-sans text-xs">
                  &lt;=140 mg/dL
                </span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <label className="w-36 font-semibold text-slate-800 shrink-0">Urine Reduksi Puasa</label>
                <PosNegSelect
                  id="input-urine-reduksi-puasa"
                  disabled={disabled}
                  value={gula.urineReduksiPuasa !== undefined ? gula.urineReduksiPuasa : 'Negatif'}
                  onChange={(val) => handleGulaChange('urineReduksiPuasa', val)}
                  options={URINE_TEST_OPTIONS}
                  className="w-28"
                />
                <span className="w-24 text-right text-slate-600 font-medium font-sans text-xs">
                  Negatif
                </span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <label className="w-36 font-semibold text-slate-800 shrink-0">Urine Reduksi 2 Jam PP</label>
                <PosNegSelect
                  id="input-urine-reduksi-2jam-pp"
                  disabled={disabled}
                  value={gula.urineReduksi2JamPP !== undefined ? gula.urineReduksi2JamPP : 'Negatif'}
                  onChange={(val) => handleGulaChange('urineReduksi2JamPP', val)}
                  options={URINE_TEST_OPTIONS}
                  className="w-28"
                />
                <span className="w-24 text-right text-slate-600 font-medium font-sans text-xs">
                  Negatif
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* IMMUNOLOGI & KESIMPULAN */}
        <div className="lg:col-span-4 space-y-3">
          
          <div className="border border-slate-400/80 rounded-md p-3.5 bg-white shadow-2xs space-y-2">
            <div className="text-xs font-black tracking-tight text-slate-800 uppercase pb-1 border-b border-slate-100">
              IMMUNOLOGI
            </div>

            <div className="space-y-1.5 text-xs pt-0.5">
              <div className="flex items-center justify-between gap-2">
                <label className="w-32 font-bold text-slate-800 shrink-0">HBs Ag</label>
                <PosNegSelect
                  id="input-imuno-hbsag"
                  disabled={disabled}
                  value={imuno.hbsAg !== undefined ? imuno.hbsAg : '-'}
                  onChange={(val) => handleImunoChange('hbsAg', val)}
                  options={SEROLOGY_OPTIONS}
                  className="w-28"
                />
                <span className="w-20 text-right text-slate-600 font-medium font-sans text-xs">
                  Negatif
                </span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <label className="w-32 font-bold text-slate-800 shrink-0">Anti HBs</label>
                <PosNegSelect
                  id="input-imuno-antihbs"
                  disabled={disabled}
                  value={imuno.antiHBs !== undefined ? imuno.antiHBs : '-'}
                  onChange={(val) => handleImunoChange('antiHBs', val)}
                  options={SEROLOGY_OPTIONS}
                  className="w-28"
                />
                <span className="w-20 text-right text-slate-600 font-medium font-sans text-xs">
                  Negatif
                </span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <label className="w-32 font-bold text-slate-800 shrink-0">ASTO</label>
                <PosNegSelect
                  id="input-imuno-asto"
                  disabled={disabled}
                  value={imuno.asto !== undefined ? imuno.asto : '-'}
                  onChange={(val) => handleImunoChange('asto', val)}
                  options={['Negatif', 'Positif', '-']}
                  className="w-28"
                />
                <span className="w-20 text-right text-slate-600 font-medium font-sans text-xs">
                  Negatif
                </span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <label className="w-32 font-bold text-slate-800 shrink-0">Rematoid Faktor</label>
                <PosNegSelect
                  id="input-imuno-rematoid-faktor"
                  disabled={disabled}
                  value={imuno.rematoidFaktor !== undefined ? imuno.rematoidFaktor : '-'}
                  onChange={(val) => handleImunoChange('rematoidFaktor', val)}
                  options={['Negatif', 'Positif', '-']}
                  className="w-28"
                />
                <span className="w-20 text-right text-slate-600 font-medium font-sans text-xs">
                  Negatif
                </span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <label className="w-32 font-bold text-slate-800 shrink-0">CRP</label>
                <PosNegSelect
                  id="input-imuno-crp"
                  disabled={disabled}
                  value={imuno.crp !== undefined ? imuno.crp : '-'}
                  onChange={(val) => handleImunoChange('crp', val)}
                  options={['Negatif', 'Positif', '-']}
                  className="w-28"
                />
                <span className="w-20 text-right text-slate-600 font-medium font-sans text-xs">
                  Negatif
                </span>
              </div>
            </div>
          </div>

          <div className="border border-slate-400/80 rounded-md p-3.5 bg-white shadow-2xs space-y-2">
            <div className="flex items-center justify-between gap-2 text-xs">
              <label className="w-28 font-bold text-slate-800 shrink-0">KES. LAB</label>
              <select
                id="input-kes-lab"
                disabled={disabled}
                value={kes.kesLab !== undefined ? kes.kesLab : 'DBN'}
                onChange={(e) => handleKesChange('kesLab', e.target.value)}
                className="flex-1 px-2 py-0.5 text-xs bg-white border border-slate-300 rounded font-bold text-slate-800 cursor-pointer"
              >
                <option value="DBN">DBN</option>
                <option value="TIDAK DBN">TIDAK DBN</option>
                <option value="ABNORMAL">ABNORMAL</option>
                {kes.kesLab && !['DBN', 'TIDAK DBN', 'ABNORMAL'].includes(kes.kesLab) && (
                  <option value={kes.kesLab}>{kes.kesLab}</option>
                )}
              </select>
            </div>

            <div className="flex items-center justify-between gap-2 text-xs">
              <label className="w-28 font-bold text-slate-800 shrink-0">KES. HBSAG</label>
              <PosNegSelect
                id="input-kes-hbsag"
                disabled={disabled}
                value={kes.kesHbsag !== undefined ? kes.kesHbsag : 'Negatif'}
                onChange={(val) => handleKesChange('kesHbsag', val)}
                options={['Negatif', 'Positif', 'Non-Reaktif', 'Reaktif']}
                className="flex-1 font-bold"
              />
            </div>
          </div>
        </div>
      </div>

      {(onPrevTab || onNextTab) && (
        <div className="flex items-center justify-between pt-3 border-t border-slate-200">
          <div>
            {onPrevTab && (
              <button
                id="btn-prev-to-lab"
                type="button"
                onClick={onPrevTab}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Kembali ke LABORATORIUM</span>
              </button>
            )}
          </div>
          <div className="text-xs text-slate-500 font-medium hidden sm:block">
            Tahap 5 : <span className="font-bold text-slate-700">Kimia Klinik &amp; Serologi</span>
          </div>
          <div>
            {onNextTab && (
              <button
                id="btn-next-to-saran-dr"
                type="button"
                onClick={onNextTab}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm shadow-blue-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>Lanjut ke SARAN DR</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};