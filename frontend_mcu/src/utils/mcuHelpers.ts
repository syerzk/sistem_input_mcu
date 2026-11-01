import { MCURecord, Gender } from '../types';

export function calculateBMI(weightKg: number, heightCm: number): { bmi: number; category: string } {
  if (!weightKg || !heightCm || heightCm <= 0) {
    return { bmi: 0, category: '-' };
  }
  const heightM = heightCm / 100;
  const bmi = Number((weightKg / (heightM * heightM)).toFixed(1));
  
  let category = 'Normal / Ideal';
  if (bmi < 18.5) {
    category = 'Underweight (Kurang BB)';
  } else if (bmi >= 18.5 && bmi < 23.0) {
    category = 'Normal / Ideal (Asia-Pacific)';
  } else if (bmi >= 23.0 && bmi < 25.0) {
    category = 'Overweight Ringan / At Risk';
  } else if (bmi >= 25.0 && bmi < 30.0) {
    category = 'Obesitas Tingkat I';
  } else {
    category = 'Obesitas Tingkat II (Berat)';
  }

  return { bmi, category };
}

export function calculateNextMCUDueDate(examDate: string, gender: Gender): { nextDate: string; intervalYears: number; intervalText: string } {
  if (!examDate) {
    const today = new Date();
    const yearsToAdd = gender === 'L' ? 1 : 2;
    today.setFullYear(today.getFullYear() + yearsToAdd);
    return {
      nextDate: today.toISOString().split('T')[0],
      intervalYears: yearsToAdd,
      intervalText: gender === 'L' ? '1 Tahun Sekali (Pria)' : '2 Tahun Sekali (Wanita)'
    };
  }

  try {
    const [year, month, day] = examDate.split('-').map(Number);
    const yearsToAdd = gender === 'L' ? 1 : 2;
    const nextYear = year + yearsToAdd;
    const formattedMonth = String(month).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    
    return {
      nextDate: `${nextYear}-${formattedMonth}-${formattedDay}`,
      intervalYears: yearsToAdd,
      intervalText: gender === 'L' ? '1 Tahun Sekali (Laki-laki)' : '2 Tahun Sekali (Perempuan)'
    };
  } catch (e) {
    return {
      nextDate: examDate,
      intervalYears: gender === 'L' ? 1 : 2,
      intervalText: gender === 'L' ? '1 Tahun Sekali (Laki-laki)' : '2 Tahun Sekali (Perempuan)'
    };
  }
}

export function formatIndonesianDate(dateStr: string): string {
  if (!dateStr) return '-';
  try {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  } catch {
    return dateStr;
  }
}

export function getInitialMCURecord(): MCURecord {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const currentYear = String(today.getFullYear());

  const { nextDate } = calculateNextMCUDueDate(todayStr, 'L');

  return {
    id: `MCU-${currentYear}-${Date.now().toString().slice(-4)}`,
    badge: '',
    nama: '',
    isSpouse: false,
    tanggal: todayStr,
    umur: 30,
    golDarah: 'O',
    shift: 'S',
    bagian: 'Kompartemen Operasi (Pusri-IB / II / III / IV)',
    dokter: 'DR. NURSYIRWAN, Sp.Ok',
    testTahun: currentYear,
    jenisKelamin: 'L',
    periodeMCU: '1 Tahun',
    tanggalMCUBerikutnya: nextDate,
    
    keluhanSekarang: '',
    keluhanSistemOrgan: {
      kepalaPusing: false,
      mataKabur: false,
      telingaBerdenging: false,
      batukPilek: false,
      sesakNafas: false,
      nyeriDada: false,
      gangguanPencernaan: false,
      nyeriUluHati: false,
      pegalOtotSendi: false,
      kesemutan: false,
      lainLain: ''
    },
    riwayatPenyakit: '',
    riwayatPenyakitDahulu: {
      hipertensi: false,
      diabetesMelitus: false,
      penyakitJantung: false,
      asmaParu: false,
      hepatitis: false,
      penyakitGinjal: false,
      alergi: false,
      stroke: false,
      kankerTumor: false,
      riwayatOperasi: '',
      riwayatRawatInap: ''
    },
    riwayatPenyakitAkibatKerja: '',
    riwayatKecelakaanKerja: '',
    riwayatPengobatanRutin: '',
    riwayatVaksinasi: '',
    riwayatKehamilan: '-',
    olahraga: false,
    olahragaKeterangan: '',
    olahragaFrekuensi: '',
    alergiObat: false,
    alergiObatKeterangan: '',
    alergiMakanan: '',
    kebiasaan: {
      merokok: false,
      merokokBatangPerHari: '',
      merokokLamaTahun: '',
      jenisRokok: '',
      minumAlkohol: false,
      minumAlkoholKeterangan: '',
      minumKopi: false,
      minumKopiCangkirPerHari: '',
      polaTidurJamPerHari: '',
      penggunaanApd: '',
      lainLain: false,
      lainLainKeterangan: ''
    },
    riwayatPenyakitKeluarga: {
      darahTinggi: false,
      kencingManis: false,
      gangguanPendengaran: false,
      stroke: false,
      sesakNafas: false,
      jantung: false,
      alergi: false,
      kanker: false,
      ginjal: false,
      lainLain: false,
      lainLainKeterangan: ''
    },

    tandaVital: {
      tekananDarahSistolik: '',
      tekananDarahDiastolik: '',
      nadi: '',
      pernafasan: '',
      suhu: '',
      beratBadan: '',
      tinggiBadan: '',
      kulitDanRambut: '',
      kesFisik: 'DBN',
      oLengan: '',
      persenLemak: '',
      oPerut: '',
      bmi: '',
      bmiKategori: 'Normal / Ideal',
      lingkarPerut: ''
    },
    mata: {
      refraksiMataRL: '',
      visusTanpaKM: '',
      penyakitMata: 'normal',
      conjungtiva: 'normal',
      sclera: 'normal',
      kelainanLain: '',
      kesMata: 'DBN',
      visusOD: '6/6',
      visusOS: '6/6',
      kacamata: false,
      butaWarna: 'Normal',
      lapangPandang: 'Normal',
      konjungtiva: 'Normal',
      sklera: 'Normal'
    },
    tht: {
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
      kesTHT: 'DBN',
      telingaKanan: '',
      telingaKiri: '',
      tenggorokan: '',
      tonsil: ''
    },
    genetaliaAnorectal: {
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
    },
    gigiMulut: {
      gigi: '',
      mulut: 'normal',
      gusi: 'normal',
      kesGigi: 'DBN',
      karies: 'Tidak ada',
      tambalan: 'Tidak ada',
      gigiHilang: '',
      kebersihan: 'Baik',
      catatanGigi: ''
    },

    anggotaGerak: {
      tremor: 'normal',
      sembab: 'normal',
      paralyse: 'normal'
    },
    reflekFisik: {
      pupil: 'normal',
      patela: 'normal',
      archiles: 'normal'
    },
    thoraxJantung: {
      batasBatasJantung: 'normal',
      iramaJantung: 'normal',
      suaraJantungMumur: 'normal',
      ecg: 'normal',
      treadmillTipe: 'TREADMILL',
      treadmillHasil: 'normal'
    },
    thoraxParu: {
      perkusi: 'normal',
      auskultasi: 'normal',
      thoraxPhoto: 'normal',
      autospirometri: 'Komb(%FVC*27 %,FEV1.0% 27%)'
    },
    abdomenFisik2: {
      dindingPerut: 'normal',
      perut: 'normal',
      hati: 'normal',
      limpa: 'normal',
      ginjal: 'normal',
      usgAbdomen: ''
    },
    tulangBelakang: {
      ginjal: 'normal'
    },
    kesimpulanPenunjang: {
      kesTreadmill: 'DBN',
      kesEkg: 'DBN',
      kesUsgAbd: 'DBN',
      kesAudiometri: 'DBN',
      kesFotoThorax: 'DBN',
      kesAutospiro: 'DBN'
    },

    pemeriksaanFisikLanjutan: {
      leher: '',
      kelenjarGetahBening: '',
      tiroid: '',
      jvp: '',
      dadaThorax: '',
      paru: '',
      jantung: '',
      abdomen: '',
      heparLien: '',
      ekstremitas: '',
      refleks: '',
      kulit: ''
    },
    penunjangFisik: {
      rontgenThorax: '',
      rontgenKesimpulan: 'Normal',
      ekg: '',
      ekgKesimpulan: 'Normal',
      audiometri: '',
      audiometriKesimpulan: 'Normal',
      spirometri: '',
      spirometriKesimpulan: 'Normal'
    },

    hematologi: {
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
    },
    urinLengkap: {
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
    },

    kimiaKlinik: {
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
        gdp: '',
        gd2pp: '',
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
      },
      serologiNarkoba: {
        hbsAg: 'Non-Reaktif',
        antiHCV: 'Non-Reaktif',
        amp: 'Negatif',
        thc: 'Negatif',
        mop: 'Negatif',
        bzo: 'Negatif'
      }
    },

    hasilPemkes: 'Fit',
    kesimpulan: '',
    saran: '',
    totalKardiovaskular: '',

    kesimpulanUmum: '',
    saranUmum: '',
    kesimpulanFisik: '',
    saranFisik: '',
    kesimpulanFisik2: '',
    saranFisik2: '',
    kesimpulanLab: '',
    saranLab: '',
    kesimpulanKimia: '',
    saranKimia: '',
  };
}

export function calculateCardiovascularRisk(record: MCURecord): { score: number; level: string; label: string; details: string } {
  let score = 0;
  const isMale = record.jenisKelamin === 'L';
  const age = Number(record.umur) || 30;

  if (age < 35) score += 0;
  else if (age < 45) score += isMale ? 2 : 1;
  else if (age < 55) score += isMale ? 4 : 3;
  else if (age < 65) score += isMale ? 6 : 5;
  else score += isMale ? 8 : 7;

  if (record.kebiasaan?.merokok) {
    score += isMale ? 3 : 2;
  }

  const sbp = Number(record.tandaVital?.tekananDarahSistolik) || 120;
  if (sbp >= 160) score += 3;
  else if (sbp >= 140) score += 2;
  else if (sbp >= 130) score += 1;

  const tc = Number(record.kimiaKlinik?.profilLipid?.kolesterolTotal) || 180;
  if (tc >= 240) score += 3;
  else if (tc >= 200) score += 2;
  else if (tc >= 160) score += 1;

  const hdl = Number(record.kimiaKlinik?.profilLipid?.hdl) || 50;
  if (hdl < 40) score += 2;
  else if (hdl >= 60) score -= 1;

  const gdp = Number(record.kimiaKlinik?.glukosa?.gdp || record.kimiaKlinik?.glukosa?.gulaDarahPuasa) || 90;
  if (gdp >= 126 || record.riwayatPenyakitKeluarga?.kencingManis) {
    score += 2;
  }

  const bmi = Number(record.tandaVital?.bmi) || 22.5;
  if (bmi >= 30) score += 2;
  else if (bmi >= 25) score += 1;

  let level = 'Rendah (<10%)';
  if (score >= 12) {
    level = 'Sangat Tinggi (>30%)';
  } else if (score >= 8) {
    level = 'Tinggi (20 - 30%)';
  } else if (score >= 4) {
    level = 'Sedang (10 - 20%)';
  } else {
    level = 'Rendah (<10%)';
  }

  return {
    score,
    level,
    label: `Skor Kardiovaskular: ${level}`,
    details: `Berdasarkan usia (${age} th), jenis kelamin, tensi (${sbp} mmHg), kolesterol total (${tc} mg/dL), status rokok, dan glukosa.`
  };
}

export function detectAbnormalities(record: MCURecord): string[] {
  const issues: string[] = [];

  const sistolik = Number(record.tandaVital?.tekananDarahSistolik);
  const diastolik = Number(record.tandaVital?.tekananDarahDiastolik);
  if (sistolik >= 140 || diastolik >= 90) {
    issues.push(`Hipertensi (TD: ${sistolik}/${diastolik} mmHg)`);
  } else if (sistolik >= 130 || diastolik >= 85) {
    issues.push(`Pre-Hipertensi (TD: ${sistolik}/${diastolik} mmHg)`);
  }

  const bmi = Number(record.tandaVital?.bmi);
  if (bmi >= 25.0) {
    issues.push(`Kelebihan Berat Badan / Obesitas (BMI: ${bmi})`);
  } else if (bmi < 18.5 && bmi > 0) {
    issues.push(`Underweight / Berat Badan Kurang (BMI: ${bmi})`);
  }

  if (record.mata?.butaWarna && record.mata.butaWarna !== 'Normal') {
    issues.push(`Buta Warna: ${record.mata.butaWarna}`);
  }
  if (record.mata?.kesMata && record.mata.kesMata !== 'DBN' && record.mata.kesMata !== 'Normal') {
    issues.push(`Mata: ${record.mata.kesMata}`);
  }

  if (record.tht?.kesTHT && record.tht.kesTHT !== 'DBN' && record.tht.kesTHT !== 'Normal') {
    issues.push(`THT: ${record.tht.kesTHT}`);
  }

  if (record.gigiMulut?.kesGigi && record.gigiMulut.kesGigi !== 'DBN' && record.gigiMulut.kesGigi !== 'Normal') {
    issues.push(`Gigi & Mulut: ${record.gigiMulut.kesGigi}`);
  }

  if (record.penunjangFisik?.rontgenKesimpulan === 'Abnormal') {
    issues.push(`Rontgen Thorax Abnormal: ${record.penunjangFisik.rontgenThorax}`);
  }
  if (record.penunjangFisik?.ekgKesimpulan === 'Abnormal') {
    issues.push(`EKG Abnormal: ${record.penunjangFisik.ekg}`);
  }
  if (record.penunjangFisik?.audiometriKesimpulan && record.penunjangFisik.audiometriKesimpulan !== 'Normal') {
    issues.push(`Audiometri: ${record.penunjangFisik.audiometriKesimpulan}`);
  }
  if (record.penunjangFisik?.spirometriKesimpulan && record.penunjangFisik.spirometriKesimpulan !== 'Normal') {
    issues.push(`Spirometri: ${record.penunjangFisik.spirometriKesimpulan}`);
  }

  if (record.kesimpulanPenunjang?.kesEkg && record.kesimpulanPenunjang.kesEkg !== 'DBN') {
    issues.push(`EKG: ${record.kesimpulanPenunjang.kesEkg}`);
  }
  if (record.kesimpulanPenunjang?.kesFotoThorax && record.kesimpulanPenunjang.kesFotoThorax !== 'DBN') {
    issues.push(`Foto Thorax: ${record.kesimpulanPenunjang.kesFotoThorax}`);
  }

  const hb = Number(record.hematologi?.hemoglobin);
  if (hb > 0) {
    const isMale = record.jenisKelamin === 'L';
    if (isMale && hb < 13.0) issues.push(`Hemoglobin Rendah / Suspek Anemia (${hb} g/dL)`);
    else if (!isMale && hb < 12.0) issues.push(`Hemoglobin Rendah / Suspek Anemia (${hb} g/dL)`);
  }

  const leu = Number(record.hematologi?.leukosit);
  if (leu > 11.5) issues.push(`Leukositosis (${leu} 10^3/uL)`);
  else if (leu > 0 && leu < 4.0) issues.push(`Leukopenia (${leu} 10^3/uL)`);

  if (record.urinLengkap?.proteinAlbumin && record.urinLengkap.proteinAlbumin !== 'Negatif' && record.urinLengkap.proteinAlbumin !== 'Normal') {
    issues.push(`Proteinuria (${record.urinLengkap.proteinAlbumin})`);
  }
  if (record.urinLengkap?.reduksi && record.urinLengkap.reduksi !== 'Negatif') {
    issues.push(`Reduksi Urine Positif (${record.urinLengkap.reduksi})`);
  }

  const kol = Number(record.kimiaKlinik?.profilLipid?.kolesterolTotal);
  if (kol >= 200) {
    issues.push(`Hiperkolesterolemia (Kolesterol Total: ${kol} mg/dL)`);
  }

  const tg = Number(record.kimiaKlinik?.profilLipid?.trigliserida);
  if (tg >= 200) {
    issues.push(`Hipertrigliseridemia (${tg} mg/dL)`);
  }

  const ldl = Number(record.kimiaKlinik?.profilLipid?.ldl);
  if (ldl > 130) {
    issues.push(`LDL Kolesterol Tinggi (${ldl} mg/dL)`);
  }

  const gdp = Number(record.kimiaKlinik?.glukosa?.gdp || record.kimiaKlinik?.glukosa?.gulaDarahPuasa);
  if (gdp >= 126) {
    issues.push(`Kadar Gula Darah Puasa Tinggi / Suspek DM (${gdp} mg/dL)`);
  } else if (gdp >= 100) {
    issues.push(`Pre-Diabetes / Gangguan Toleransi Glukosa (${gdp} mg/dL)`);
  }

  const au = Number(record.kimiaKlinik?.fungsiGinjal?.asamUrat);
  const auLimit = record.jenisKelamin === 'L' ? 7.0 : 5.7;
  if (au > auLimit) {
    issues.push(`Hiperurisemia / Asam Urat Tinggi (${au} mg/dL)`);
  }

  const sgot = Number(record.kimiaKlinik?.fungsiHati?.sgot);
  const sgpt = Number(record.kimiaKlinik?.fungsiHati?.sgpt);
  const sgotLimit = record.jenisKelamin === 'L' ? 37 : 32;
  const sgptLimit = record.jenisKelamin === 'L' ? 41 : 33;
  if (sgot > sgotLimit || sgpt > sgptLimit) {
    issues.push(`Peningkatan Enzim Hati (SGOT: ${sgot || '-'}, SGPT: ${sgpt || '-'} U/L)`);
  }

  if (record.kimiaKlinik?.immunologi?.hbsAg === 'Positif' || record.kimiaKlinik?.serologiNarkoba?.hbsAg === 'Reaktif' || record.kimiaKlinik?.serologiNarkoba?.hbsAg === 'Positif') {
    issues.push('HBsAg Reaktif / Positif');
  }

  return issues;
}
