import React from 'react';
import { MCURecord } from '../../types';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { synthesizeConclusionAndAdvice } from '../../utils/autoSummaryGenerators';
import {
  NormalSelect,
  DEFAULT_NORMAL_OPTIONS,
  DBN_OPTIONS,
  GIGI_OPTIONS,
  GERAK_OPTIONS,
  REFLEK_OPTIONS,
  THORAX_JANTUNG_OPTIONS,
  THORAX_PARU_OPTIONS,
  ABDOMEN_OPTIONS,
  TULANG_BELAKANG_OPTIONS
} from '../NormalSelect';

interface TabFisik2Props {
  data: MCURecord;
  onChange: (updates: Partial<MCURecord>) => void;
  disabled?: boolean;
  onNextTab?: () => void;
  onPrevTab?: () => void;
}

export const TabFisik2: React.FC<TabFisik2Props> = ({ data, onChange, disabled, onNextTab, onPrevTab }) => {
  
  const gigi = data.gigiMulut || {
    gigi: '',
    mulut: 'normal',
    gusi: 'normal',
    kesGigi: 'DBN',
    karies: 'Tidak ada',
    tambalan: 'Tidak ada',
    gigiHilang: '0',
    kebersihan: 'Baik',
    catatanGigi: ''
  };

  const gerak = data.anggotaGerak || {
    tremor: 'normal',
    sembab: 'normal',
    paralyse: 'normal'
  };

  const reflek = data.reflekFisik || {
    pupil: 'normal',
    patela: 'normal',
    archiles: 'normal'
  };

  const jantung = data.thoraxJantung || {
    batasBatasJantung: 'normal',
    iramaJantung: 'normal',
    suaraJantungMumur: 'normal',
    ecg: 'normal',
    treadmillTipe: 'TREADMILL',
    treadmillHasil: 'normal'
  };

  const paru = data.thoraxParu || {
    perkusi: 'normal',
    auskultasi: 'normal',
    thoraxPhoto: 'normal',
    autospirometri: 'Komb(%FVC*27 %,FEV1.0% 27%)'
  };

  const abdomen = data.abdomenFisik2 || {
    dindingPerut: 'normal',
    perut: 'normal',
    hati: 'normal',
    limpa: 'normal',
    ginjal: 'normal',
    usgAbdomen: ''
  };

  const tulang = data.tulangBelakang || {
    ginjal: 'normal'
  };

  const kes = data.kesimpulanPenunjang || {
    kesTreadmill: 'DBN',
    kesEkg: 'DBN',
    kesUsgAbd: 'DBN',
    kesAudiometri: 'DBN',
    kesFotoThorax: 'DBN',
    kesAutospiro: 'DBN'
  };

  const handleGigiChange = (field: keyof MCURecord['gigiMulut'], value: string) => {
    onChange({
      gigiMulut: {
        ...gigi,
        [field]: value
      }
    });
  };

  const handleGerakChange = (field: keyof NonNullable<MCURecord['anggotaGerak']>, value: string) => {
    onChange({
      anggotaGerak: {
        ...gerak,
        [field]: value
      }
    });
  };

  const handleReflekChange = (field: keyof NonNullable<MCURecord['reflekFisik']>, value: string) => {
    onChange({
      reflekFisik: {
        ...reflek,
        [field]: value
      }
    });
  };

  const handleJantungChange = (field: keyof NonNullable<MCURecord['thoraxJantung']>, value: string) => {
    onChange({
      thoraxJantung: {
        ...jantung,
        [field]: value
      }
    });
  };

  const handleParuChange = (field: keyof NonNullable<MCURecord['thoraxParu']>, value: string) => {
    onChange({
      thoraxParu: {
        ...paru,
        [field]: value
      }
    });
  };

  const handleAbdomenChange = (field: keyof NonNullable<MCURecord['abdomenFisik2']>, value: string) => {
    onChange({
      abdomenFisik2: {
        ...abdomen,
        [field]: value
      }
    });
  };

  const handleTulangChange = (field: keyof NonNullable<MCURecord['tulangBelakang']>, value: string) => {
    onChange({
      tulangBelakang: {
        ...tulang,
        [field]: value
      }
    });
  };

  const handleKesChange = (field: keyof NonNullable<MCURecord['kesimpulanPenunjang']>, value: string) => {
    onChange({
      kesimpulanPenunjang: {
        ...kes,
        [field]: value
      }
    });
  };

  const handleAutoFillNormal = () => {
    const normalUpdates = {
      gigiMulut: {
        ...gigi,
        gigi: 'normal',
        mulut: 'normal',
        gusi: 'normal',
        kesGigi: 'DBN',
        karies: 'Tidak ada',
        tambalan: 'Tidak ada',
        gigiHilang: '0',
        kebersihan: 'Baik' as const
      },
      penunjangFisik: {
        ...data.penunjangFisik,
        rontgenThorax: 'Cor dan Pulmo dalam batas normal',
        rontgenKesimpulan: 'Normal' as const,
        ekg: 'Normal Sinus Rhythm',
        ekgKesimpulan: 'Normal' as const,
        audiometri: 'Pendengaran normal bilateral (< 25 dB)',
        audiometriKesimpulan: 'Normal' as const,
        spirometri: 'Faal paru normal (FVC > 80%, FEV1 > 80%)',
        spirometriKesimpulan: 'Normal' as const
      },
      kesimpulanPenunjang: {
        kesTreadmill: 'DBN',
        kesEkg: 'DBN',
        kesUsgAbd: 'DBN',
        kesAudiometri: 'DBN',
        kesFotoThorax: 'DBN',
        kesAutospiro: 'DBN'
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
      label: 'KES. GIGI',
      value: gigi.kesGigi || 'DBN',
      isNormal: gigi.kesGigi === 'DBN'
    },
    {
      label: 'EKG',
      value: kes.kesEkg || 'DBN',
      isNormal: kes.kesEkg === 'DBN'
    },
    {
      label: 'THORAX',
      value: kes.kesFotoThorax || 'DBN',
      isNormal: kes.kesFotoThorax === 'DBN'
    },
    {
      label: 'AUDIOMETRI',
      value: kes.kesAudiometri || 'DBN',
      isNormal: kes.kesAudiometri === 'DBN'
    },
    {
      label: 'SPIRO',
      value: kes.kesAutospiro || 'DBN',
      isNormal: kes.kesAutospiro === 'DBN'
    }
  ];

  return (
    <div id="tab-fisik2-container" className="space-y-3">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-start">
        
        <div className="lg:col-span-4 space-y-3">
          
          <div className="border border-slate-400/80 rounded-md p-3 bg-white shadow-2xs space-y-2">
            <div className="text-xs font-black tracking-tight text-slate-800 uppercase pb-1 border-b border-slate-100">
              PEMERIKSAAN GIGI
            </div>

            <div className="flex items-center justify-between gap-2 text-xs">
              <label className="w-24 font-bold text-slate-800 shrink-0">Gigi</label>
              <NormalSelect
                id="input-gigi-status"
                disabled={disabled}
                value={gigi.gigi || 'normal'}
                onChange={(val) => handleGigiChange('gigi', val)}
                options={['normal', 'karies (+)', 'tambalan (+)', 'ompong / tanggal', 'karang gigi (+)', 'abnormal', '-']}
              />
            </div>

            <div className="flex items-center justify-between gap-2 text-xs">
              <label className="w-24 font-bold text-slate-800 shrink-0">Mulut</label>
              <NormalSelect
                id="input-gigi-mulut"
                disabled={disabled}
                value={gigi.mulut !== undefined ? gigi.mulut : 'normal'}
                onChange={(val) => handleGigiChange('mulut', val)}
                options={['normal', 'stomatitis (-)', 'mukosa licin', 'abnormal']}
              />
            </div>

            <div className="flex items-center justify-between gap-2 text-xs">
              <label className="w-24 font-bold text-slate-800 shrink-0">Gusi</label>
              <NormalSelect
                id="input-gigi-gusi"
                disabled={disabled}
                value={gigi.gusi !== undefined ? gigi.gusi : 'normal'}
                onChange={(val) => handleGigiChange('gusi', val)}
                options={['normal', 'gingivitis (-)', 'perdarahan (-)', 'abnormal']}
              />
            </div>

            <div className="flex items-center justify-between gap-2 text-xs">
              <label className="w-24 font-bold text-slate-800 shrink-0">KES. GIGI</label>
              <NormalSelect
                id="input-kes-gigi"
                disabled={disabled}
                value={gigi.kesGigi !== undefined ? gigi.kesGigi : 'DBN'}
                onChange={(val) => handleGigiChange('kesGigi', val)}
                options={DBN_OPTIONS}
                className="flex-1 font-bold"
              />
            </div>
          </div>

          <div className="border border-slate-400/80 rounded-md p-3 bg-white shadow-2xs space-y-2">
            <div className="text-xs font-black tracking-tight text-slate-800 uppercase pb-1 border-b border-slate-100">
              PEMERIKSAAN ANGGOTA GERAK
            </div>

            <div className="flex items-center justify-between gap-2 text-xs">
              <label className="w-24 font-bold text-slate-800 shrink-0">Tremor</label>
              <NormalSelect
                id="input-gerak-tremor"
                disabled={disabled}
                value={gerak.tremor !== undefined ? gerak.tremor : 'normal'}
                onChange={(val) => handleGerakChange('tremor', val)}
                options={['normal', 'tidak ada', 'tremor halus', 'tremor kasar', 'abnormal']}
              />
            </div>

            <div className="flex items-center justify-between gap-2 text-xs">
              <label className="w-24 font-bold text-slate-800 shrink-0">Sembab</label>
              <NormalSelect
                id="input-gerak-sembab"
                disabled={disabled}
                value={gerak.sembab !== undefined ? gerak.sembab : 'normal'}
                onChange={(val) => handleGerakChange('sembab', val)}
                options={['normal', 'tidak ada', 'edema pretibial (-)', 'edema anasarka', 'abnormal']}
              />
            </div>

            <div className="flex items-center justify-between gap-2 text-xs">
              <label className="w-24 font-bold text-slate-800 shrink-0">Paralyse</label>
              <NormalSelect
                id="input-gerak-paralyse"
                disabled={disabled}
                value={gerak.paralyse !== undefined ? gerak.paralyse : 'normal'}
                onChange={(val) => handleGerakChange('paralyse', val)}
                options={['normal', 'tidak ada', 'paresis (-)', 'hemiparese', 'abnormal']}
              />
            </div>
          </div>

          <div className="border border-slate-400/80 rounded-md p-3 bg-white shadow-2xs space-y-2">
            <div className="text-xs font-black tracking-tight text-slate-800 uppercase pb-1 border-b border-slate-100">
              PEMERIKSAAN REFLEK
            </div>

            <div className="flex items-center justify-between gap-2 text-xs">
              <label className="w-24 font-bold text-slate-800 shrink-0">Pupil</label>
              <NormalSelect
                id="input-reflek-pupil"
                disabled={disabled}
                value={reflek.pupil !== undefined ? reflek.pupil : 'normal'}
                onChange={(val) => handleReflekChange('pupil', val)}
                options={['normal', 'isokor (3mm/3mm)', 'reflek cahaya (+/+)', 'anisokor', 'abnormal']}
              />
            </div>

            <div className="flex items-center justify-between gap-2 text-xs">
              <label className="w-24 font-bold text-slate-800 shrink-0">Patela</label>
              <NormalSelect
                id="input-reflek-patela"
                disabled={disabled}
                value={reflek.patela !== undefined ? reflek.patela : 'normal'}
                onChange={(val) => handleReflekChange('patela', val)}
                options={['normal', 'positif (+/+)', 'meningkat', 'menurun', 'abnormal']}
              />
            </div>

            <div className="flex items-center justify-between gap-2 text-xs">
              <label className="w-24 font-bold text-slate-800 shrink-0">Archiles</label>
              <NormalSelect
                id="input-reflek-archiles"
                disabled={disabled}
                value={reflek.archiles !== undefined ? reflek.archiles : 'normal'}
                onChange={(val) => handleReflekChange('archiles', val)}
                options={['normal', 'positif (+/+)', 'meningkat', 'menurun', 'abnormal']}
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-3">
          <div className="border border-slate-400/80 rounded-md p-3 bg-white shadow-2xs space-y-3">
            <div className="text-xs font-black tracking-tight text-slate-800 uppercase pb-1 border-b border-slate-100">
              PEMERIKSAAN THORAX
            </div>

            <div className="space-y-2">
              <div className="text-[11px] font-black text-slate-800 uppercase tracking-tight">
                JANTUNG
              </div>

              <div className="flex items-center justify-between gap-2 text-xs">
                <label className="w-36 font-semibold text-slate-700 leading-tight shrink-0">
                  Batas-batas Jantung
                </label>
                <NormalSelect
                  id="input-jantung-batas"
                  disabled={disabled}
                  value={jantung.batasBatasJantung !== undefined ? jantung.batasBatasJantung : 'normal'}
                  onChange={(val) => handleJantungChange('batasBatasJantung', val)}
                  options={['normal', 'dalam batas normal', 'kardiomegali', 'geser ke kiri', 'abnormal']}
                />
              </div>

              <div className="flex items-center justify-between gap-2 text-xs">
                <label className="w-36 font-semibold text-slate-700 leading-tight shrink-0">
                  Irama Jantung
                </label>
                <NormalSelect
                  id="input-jantung-irama"
                  disabled={disabled}
                  value={jantung.iramaJantung !== undefined ? jantung.iramaJantung : 'normal'}
                  onChange={(val) => handleJantungChange('iramaJantung', val)}
                  options={['normal', 'reguler', 'irreguler', 'sinus rhythm', 'fibrilasi', 'abnormal']}
                />
              </div>

              <div className="flex items-center justify-between gap-2 text-xs">
                <label className="w-36 font-semibold text-slate-700 leading-tight shrink-0">
                  Suara Jantung dan Mumur
                </label>
                <NormalSelect
                  id="input-jantung-suara-murmur"
                  disabled={disabled}
                  value={jantung.suaraJantungMumur !== undefined ? jantung.suaraJantungMumur : 'normal'}
                  onChange={(val) => handleJantungChange('suaraJantungMumur', val)}
                  options={['normal', 'murni', 'murmur (-)', 'murmur (+)', 'gallop (-)', 'abnormal']}
                />
              </div>

              <div className="flex items-center justify-between gap-2 text-xs">
                <label className="w-36 font-semibold text-slate-700 leading-tight shrink-0">
                  ECG
                </label>
                <NormalSelect
                  id="input-jantung-ecg"
                  disabled={disabled}
                  value={jantung.ecg !== undefined ? jantung.ecg : 'normal'}
                  onChange={(val) => handleJantungChange('ecg', val)}
                  options={['normal', 'sinus rhythm (normal)', 'sinus bradikardi', 'sinus takikardi', 'ST elevasi', 'abnormal', 'DBN']}
                />
              </div>

              <div className="flex items-center justify-between gap-2 text-xs pt-0.5">
                <select
                  id="select-treadmill-type"
                  disabled={disabled}
                  value={jantung.treadmillTipe || 'TREADMILL'}
                  onChange={(e) => handleJantungChange('treadmillTipe', e.target.value)}
                  className="w-28 px-1.5 py-0.5 bg-white border border-slate-300 rounded text-xs font-semibold cursor-pointer"
                >
                  <option value="TREADMILL">TREADMILL</option>
                  <option value="ERGOCYCLE">ERGOCYCLE</option>
                  <option value="HARVARD">HARVARD TEST</option>
                </select>
                <NormalSelect
                  id="input-jantung-treadmill-hasil"
                  disabled={disabled}
                  value={jantung.treadmillHasil !== undefined ? jantung.treadmillHasil : 'normal'}
                  onChange={(val) => handleJantungChange('treadmillHasil', val)}
                  options={['normal', 'kapasitas fungsional baik', 'iskemia respon (-)', 'positif iskemia', 'abnormal', 'DBN']}
                />
              </div>
            </div>

            <div className="border-t border-slate-200 pt-2.5 space-y-2">
              <div className="text-[11px] font-black text-slate-800 uppercase tracking-tight">
                PARU - PARU
              </div>

              <div className="flex items-center justify-between gap-2 text-xs">
                <label className="w-32 font-semibold text-slate-700 leading-tight shrink-0">
                  Perkusi
                </label>
                <NormalSelect
                  id="input-paru-perkusi"
                  disabled={disabled}
                  value={paru.perkusi !== undefined ? paru.perkusi : 'normal'}
                  onChange={(val) => handleParuChange('perkusi', val)}
                  options={['normal', 'sonor (+/+)', 'hipersonor', 'redup', 'abnormal']}
                />
              </div>

              <div className="flex items-center justify-between gap-2 text-xs">
                <label className="w-32 font-semibold text-slate-700 leading-tight shrink-0">
                  Auskultasi
                </label>
                <NormalSelect
                  id="input-paru-auskultasi"
                  disabled={disabled}
                  value={paru.auskultasi !== undefined ? paru.auskultasi : 'normal'}
                  onChange={(val) => handleParuChange('auskultasi', val)}
                  options={['normal', 'vesikuler (+/+)', 'ronkhi (-/-)', 'wheezing (-/-)', 'abnormal']}
                />
              </div>

              <div className="flex items-center justify-between gap-2 text-xs">
                <label className="w-32 font-semibold text-slate-700 leading-tight shrink-0">
                  Thorax Photo
                </label>
                <NormalSelect
                  id="input-paru-thorax-photo"
                  disabled={disabled}
                  value={paru.thoraxPhoto !== undefined ? paru.thoraxPhoto : 'normal'}
                  onChange={(val) => handleParuChange('thoraxPhoto', val)}
                  options={['normal', 'cor dan pulmo DBN', 'bronkitis', 'infiltrat (-)', 'abnormal', 'DBN']}
                />
              </div>

              <div className="flex items-center justify-between gap-2 text-xs">
                <label className="w-32 font-semibold text-slate-700 leading-tight shrink-0">
                  Autospirometri
                </label>
                <NormalSelect
                  id="input-paru-autospirometri"
                  disabled={disabled}
                  value={paru.autospirometri !== undefined ? paru.autospirometri : 'Komb(%FVC*27 %,FEV1.0% 27%)'}
                  onChange={(val) => handleParuChange('autospirometri', val)}
                  options={['normal', 'Komb(%FVC*27 %,FEV1.0% 27%)', 'restriktif ringan', 'obstruktif ringan', 'DBN']}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-3">
          
          <div className="border border-slate-400/80 rounded-md p-3 bg-white shadow-2xs space-y-2">
            <div className="text-xs font-black tracking-tight text-slate-800 uppercase pb-1 border-b border-slate-100">
              PEMERIKSAAN ABDOMEN
            </div>

            <div className="flex items-center justify-between gap-2 text-xs">
              <label className="w-28 font-bold text-slate-800 shrink-0">Dinding Perut</label>
              <NormalSelect
                id="input-abdomen-dinding"
                disabled={disabled}
                value={abdomen.dindingPerut !== undefined ? abdomen.dindingPerut : 'normal'}
                onChange={(val) => handleAbdomenChange('dindingPerut', val)}
                options={['normal', 'supel', 'soefl', 'nyeri tekan (-)', 'distensi (-)', 'abnormal']}
              />
            </div>

            <div className="flex items-center justify-between gap-2 text-xs">
              <label className="w-28 font-bold text-slate-800 shrink-0">Perut</label>
              <NormalSelect
                id="input-abdomen-perut"
                disabled={disabled}
                value={abdomen.perut !== undefined ? abdomen.perut : 'normal'}
                onChange={(val) => handleAbdomenChange('perut', val)}
                options={['normal', 'datar', 'lemas', 'meteorismus (-)', 'abnormal']}
              />
            </div>

            <div className="flex items-center justify-between gap-2 text-xs">
              <label className="w-28 font-bold text-slate-800 shrink-0">Hati</label>
              <NormalSelect
                id="input-abdomen-hati"
                disabled={disabled}
                value={abdomen.hati !== undefined ? abdomen.hati : 'normal'}
                onChange={(val) => handleAbdomenChange('hati', val)}
                options={['normal', 'tidak teraba (DBN)', 'teraba 1 jari BAC', 'hepatomegali', 'abnormal']}
              />
            </div>

            <div className="flex items-center justify-between gap-2 text-xs">
              <label className="w-28 font-bold text-slate-800 shrink-0">Limpa</label>
              <NormalSelect
                id="input-abdomen-limpa"
                disabled={disabled}
                value={abdomen.limpa !== undefined ? abdomen.limpa : 'normal'}
                onChange={(val) => handleAbdomenChange('limpa', val)}
                options={['normal', 'tidak teraba (S0)', 'schuffner 1', 'splenomegali', 'abnormal']}
              />
            </div>

            <div className="flex items-center justify-between gap-2 text-xs">
              <label className="w-28 font-bold text-slate-800 shrink-0">Ginjal</label>
              <NormalSelect
                id="input-abdomen-ginjal"
                disabled={disabled}
                value={abdomen.ginjal !== undefined ? abdomen.ginjal : 'normal'}
                onChange={(val) => handleAbdomenChange('ginjal', val)}
                options={['normal', 'ballotement (-/-)', 'nyeri ketok (-/-)', 'teraba membesar', 'abnormal']}
              />
            </div>

            <div className="flex items-center justify-between gap-2 text-xs">
              <label className="w-28 font-bold text-slate-800 shrink-0">USG Abdomen</label>
              <NormalSelect
                id="input-abdomen-usg"
                disabled={disabled}
                value={abdomen.usgAbdomen || 'normal'}
                onChange={(val) => handleAbdomenChange('usgAbdomen', val)}
                options={['normal', 'hepar, lien, ginjal DBN', 'fatty liver', 'kolelitiasis', 'DBN', '-']}
              />
            </div>
          </div>

          <div className="border border-slate-400/80 rounded-md p-3 bg-white shadow-2xs space-y-2">
            <div className="text-xs font-black tracking-tight text-slate-800 uppercase pb-1 border-b border-slate-100">
              TULANG BELAKANG
            </div>

            <div className="flex items-center justify-between gap-2 text-xs">
              <label className="w-28 font-bold text-slate-800 shrink-0">Ginjal</label>
              <NormalSelect
                id="input-tulang-belakang-ginjal"
                disabled={disabled}
                value={tulang.ginjal !== undefined ? tulang.ginjal : 'normal'}
                onChange={(val) => handleTulangChange('ginjal', val)}
                options={['normal', 'skoliosis (-)', 'lordosis (-)', 'kifosis (-)', 'nyeri tekan (-)', 'abnormal']}
              />
            </div>
          </div>

          <div className="border border-slate-400/80 rounded-md p-3 bg-white shadow-2xs space-y-2">
            
            <div className="flex items-center justify-between gap-2 text-xs">
              <label className="w-36 font-bold text-slate-800 shrink-0">KES. TREADMILL</label>
              <NormalSelect
                id="input-kes-treadmill"
                disabled={disabled}
                value={kes.kesTreadmill !== undefined ? kes.kesTreadmill : 'DBN'}
                onChange={(val) => handleKesChange('kesTreadmill', val)}
                options={DBN_OPTIONS}
                className="flex-1 font-bold"
              />
            </div>

            <div className="flex items-center justify-between gap-2 text-xs">
              <label className="w-36 font-bold text-slate-800 shrink-0">KES. EKG</label>
              <NormalSelect
                id="input-kes-ekg"
                disabled={disabled}
                value={kes.kesEkg !== undefined ? kes.kesEkg : 'DBN'}
                onChange={(val) => handleKesChange('kesEkg', val)}
                options={DBN_OPTIONS}
                className="flex-1 font-bold"
              />
            </div>

            <div className="flex items-center justify-between gap-2 text-xs">
              <label className="w-36 font-bold text-slate-800 shrink-0">KES. USG ABD</label>
              <NormalSelect
                id="input-kes-usg-abd"
                disabled={disabled}
                value={kes.kesUsgAbd !== undefined ? kes.kesUsgAbd : 'DBN'}
                onChange={(val) => handleKesChange('kesUsgAbd', val)}
                options={DBN_OPTIONS}
                className="flex-1 font-bold"
              />
            </div>

            <div className="flex items-center justify-between gap-2 text-xs">
              <label className="w-36 font-bold text-slate-800 shrink-0">KES. AUDIOMETRI</label>
              <NormalSelect
                id="input-kes-audiometri"
                disabled={disabled}
                value={kes.kesAudiometri !== undefined ? kes.kesAudiometri : 'DBN'}
                onChange={(val) => handleKesChange('kesAudiometri', val)}
                options={DBN_OPTIONS}
                className="flex-1 font-bold"
              />
            </div>

            <div className="flex items-center justify-between gap-2 text-xs">
              <label className="w-36 font-bold text-slate-800 shrink-0">KES. FOTO THORAX</label>
              <NormalSelect
                id="input-kes-foto-thorax"
                disabled={disabled}
                value={kes.kesFotoThorax !== undefined ? kes.kesFotoThorax : 'DBN'}
                onChange={(val) => handleKesChange('kesFotoThorax', val)}
                options={DBN_OPTIONS}
                className="flex-1 font-bold"
              />
            </div>

            <div className="flex items-center justify-between gap-2 text-xs">
              <label className="w-36 font-bold text-slate-800 shrink-0">KES. AUTOSPIRO</label>
              <NormalSelect
                id="input-kes-autospiro"
                disabled={disabled}
                value={kes.kesAutospiro !== undefined ? kes.kesAutospiro : 'DBN'}
                onChange={(val) => handleKesChange('kesAutospiro', val)}
                options={DBN_OPTIONS}
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
                id="btn-prev-to-fisik"
                type="button"
                onClick={onPrevTab}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Kembali ke FISIK</span>
              </button>
            )}
          </div>
          <div className="text-xs text-slate-500 font-medium hidden sm:block">
            Tahap 3 :<span className="font-bold text-slate-700">Pemeriksaan Fisik (2)</span>
          </div>
          <div>
            {onNextTab && (
              <button
                id="btn-next-to-lab"
                type="button"
                onClick={onNextTab}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm shadow-blue-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>Lanjut ke LABORATORIUM</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
