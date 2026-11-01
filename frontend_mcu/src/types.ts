export type Gender = 'L' | 'P';
export type ShiftType = 'S' | 'NS';
export type BloodType = 'A' | 'B' | 'AB' | 'O' | 'Belum Tahu';
export type RhesusType = '+' | '-' | 'Unknown';
export type FitnessStatus = 'Fit' | 'Fit with Note' | 'Temporary Unfit' | 'Unfit';

export interface Employee {
  badge: string;
  nama: string;
  isSpouse?: boolean;
  spouseOfBadge?: string;
  jenisKelamin: Gender;
  umur: number;
  tanggalLahir?: string;
  golDarah: BloodType;
  rhesus: RhesusType;
  shift: ShiftType;
  bagian: string;
  jabatan?: string;
  telepon?: string;
  email?: string;
}

export interface MCURecord {
  id: string;
  badge: string;
  nama: string;
  isSpouse: boolean;
  tanggal: string;
  umur: number;
  golDarah: string;
  shift: ShiftType;
  bagian: string;
  dokter: string;
  testTahun: string;
  jenisKelamin: Gender;
  periodeMCU: string;
  tanggalMCUBerikutnya: string;
  
  keluhanSekarang: string;
  keluhanSistemOrgan?: {
    kepalaPusing?: boolean;
    mataKabur?: boolean;
    telingaBerdenging?: boolean;
    batukPilek?: boolean;
    sesakNafas?: boolean;
    nyeriDada?: boolean;
    gangguanPencernaan?: boolean;
    nyeriUluHati?: boolean;
    pegalOtotSendi?: boolean;
    kesemutan?: boolean;
    lainLain?: string;
  };
  riwayatPenyakit: string;
  riwayatPenyakitDahulu?: {
    hipertensi?: boolean;
    diabetesMelitus?: boolean;
    penyakitJantung?: boolean;
    asmaParu?: boolean;
    hepatitis?: boolean;
    penyakitGinjal?: boolean;
    alergi?: boolean;
    stroke?: boolean;
    kankerTumor?: boolean;
    riwayatOperasi?: string;
    riwayatRawatInap?: string;
  };
  riwayatPenyakitAkibatKerja?: string;
  riwayatKecelakaanKerja?: string;
  riwayatPengobatanRutin?: string;
  riwayatVaksinasi?: string;
  riwayatKehamilan: string;
  olahraga: boolean;
  olahragaKeterangan?: string;
  olahragaFrekuensi?: string;
  alergiObat: boolean;
  alergiObatKeterangan?: string;
  alergiMakanan?: string;
  kebiasaan: {
    merokok: boolean;
    merokokBatangPerHari?: string;
    merokokLamaTahun?: string;
    jenisRokok?: 'Filter' | 'Kretek' | 'Vape / Elektrik' | 'Cerutu' | string;
    minumAlkohol: boolean;
    minumAlkoholKeterangan?: string;
    minumKopi?: boolean;
    minumKopiCangkirPerHari?: string;
    polaTidurJamPerHari?: string;
    penggunaanApd?: 'Lengkap Sesuai Matriks' | 'Kadang-kadang' | 'Jarang / Tidak Pakai' | string;
    lainLain: boolean;
    lainLainKeterangan?: string;
  };
  riwayatPenyakitKeluarga: {
    darahTinggi: boolean;
    kencingManis: boolean;
    gangguanPendengaran: boolean;
    stroke: boolean;
    sesakNafas: boolean;
    jantung: boolean;
    alergi: boolean;
    kanker?: boolean;
    ginjal?: boolean;
    lainLain: boolean;
    lainLainKeterangan?: string;
  };

  tandaVital: {
    tekananDarahSistolik: number | string;
    tekananDarahDiastolik: number | string;
    nadi: number | string;
    pernafasan: number | string;
    suhu: number | string;
    beratBadan: number | string;
    tinggiBadan: number | string;
    kulitDanRambut?: string;
    kesFisik?: string;
    oLengan?: number | string;
    persenLemak?: number | string;
    oPerut?: number | string;
    bmi: number | string;
    bmiKategori: string;
    lingkarPerut: number | string;
  };
  mata: {
    refraksiMataRL?: string;
    visusTanpaKM?: string;
    penyakitMata?: string;
    conjungtiva?: string;
    sclera?: string;
    kelainanLain?: string;
    kesMata?: string;
    visusOD?: string;
    visusOS?: string;
    kacamata?: boolean;
    butaWarna?: 'Normal' | 'Parsial' | 'Total' | string;
    lapangPandang?: 'Normal' | 'Menyempit' | string;
    konjungtiva?: 'Normal' | 'Anemis' | string;
    sklera?: 'Normal' | 'Ikterik' | string;
  };
  tht: {
    telinga?: string;
    membranTympaniRL?: string;
    reflekCahaya?: string;
    serumenPlug?: string;
    hidung?: string;
    septumDeviasi?: string;
    concha?: string;
    polyp?: string;
    kerongkongan?: string;
    tonsilRL?: string;
    faring?: string;
    audiogram?: string;
    kesTHT?: string;
    telingaKanan?: string;
    telingaKiri?: string;
    tenggorokan?: string;
    tonsil?: string;
  };
  genetaliaAnorectal?: {
    hernia?: string;
    haemorroid?: string;
    spincerAni?: string;
    epididymisTestisProstat?: string;
    varicoceleHydrocele?: string;
    flourAlbus?: string;
    papsSmear?: string;
    leher?: string;
    jvp?: string;
    struma?: string;
  };
  gigiMulut: {
    gigi?: string;
    mulut?: string;
    gusi?: string;
    kesGigi?: string;
    karies: string;
    tambalan: string;
    gigiHilang: string;
    kebersihan: 'Baik' | 'Cukup' | 'Kurang';
    catatanGigi: string;
  };

  anggotaGerak?: {
    tremor?: string;
    sembab?: string;
    paralyse?: string;
  };
  reflekFisik?: {
    pupil?: string;
    patela?: string;
    archiles?: string;
  };
  thoraxJantung?: {
    batasBatasJantung?: string;
    iramaJantung?: string;
    suaraJantungMumur?: string;
    ecg?: string;
    treadmillTipe?: string;
    treadmillHasil?: string;
  };
  thoraxParu?: {
    perkusi?: string;
    auskultasi?: string;
    thoraxPhoto?: string;
    autospirometri?: string;
  };
  abdomenFisik2?: {
    dindingPerut?: string;
    perut?: string;
    hati?: string;
    limpa?: string;
    ginjal?: string;
    usgAbdomen?: string;
  };
  tulangBelakang?: {
    ginjal?: string;
  };
  kesimpulanPenunjang?: {
    kesTreadmill?: string;
    kesEkg?: string;
    kesUsgAbd?: string;
    kesAudiometri?: string;
    kesFotoThorax?: string;
    kesAutospiro?: string;
  };

  pemeriksaanFisikLanjutan: {
    leher: string;
    kelenjarGetahBening: string;
    tiroid: string;
    jvp: string;
    dadaThorax: string;
    paru: string;
    jantung: string;
    abdomen: string;
    heparLien: string;
    ekstremitas: string;
    refleks: string;
    kulit: string;
  };
  penunjangFisik: {
    rontgenThorax: string;
    rontgenKesimpulan: 'Normal' | 'Abnormal';
    ekg: string;
    ekgKesimpulan: 'Normal' | 'Abnormal';
    audiometri: string;
    audiometriKesimpulan: 'Normal' | 'NIHL' | 'Gangguan Konduksi' | 'Presbikusis' | 'Abnormal';
    spirometri: string;
    spirometriKesimpulan: 'Normal' | 'Restriksi' | 'Obstruksi' | 'Campuran' | 'Abnormal';
    treadmillTest?: string;
  };

  hematologi: {
    hemoglobin: number | string;
    hematokrit: number | string;
    leukosit: number | string;
    trombosit: number | string;
    led: number | string;
    eritrosit: number | string;
    malaria?: string;
    hitungJenis: {
      basofil: number | string;
      eosinofil: number | string;
      batang: number | string;
      segmen: number | string;
      limfosit: number | string;
      monosit: number | string;
      staf?: number | string;
      netrofit?: number | string;
    };
  };
  urinLengkap: {
    warna?: string;
    kejernihan?: string;
    ph?: number | string;
    beratJenis?: number | string;
    proteinAlbumin: string;
    reduksi?: string;
    glukosa: string;
    bilirubin: string;
    urobilinogen: string;
    granuler?: string;
    hyaline?: string;
    bakteri?: string;
    lainLain?: string;
    kesUrineRutin?: string;
    sedimen: {
      leukosit: string;
      eritrosit: string;
      epitel: string;
      kristal: string;
      silinder: string;
      bakteri: string;
      eritrositRbc?: string;
      lekositWbc?: string;
      selEpitel?: string;
    };
    kristalDetail?: {
      asamUrat?: string;
      amorf?: string;
      triplePhosp?: string;
      caOx?: string;
    };
  };
  feses?: {
    konsistensi: string;
    darahSamar: string;
    telurCacing: string;
    amuba: string;
  };

  kimiaKlinik: {
    fungsiHati: {
      sgot: number | string;
      sgpt: number | string;
      gammaGT: number | string;
      alkaliFosfatase?: number | string;
      alkalinePhospat?: number | string;
      bilirubinTotal: number | string;
      bilirubinDirek: number | string;
      bilirubinIndirek?: number | string;
      proteinTotal?: number | string;
      albumin?: number | string;
      globulin?: number | string;
    };
    fungsiGinjal: {
      ureum: number | string;
      kreatinin: number | string;
      asamUrat: number | string;
      egfr?: number | string;
    };
    profilLipid: {
      kolesterolTotal: number | string;
      hdl: number | string;
      ldl: number | string;
      trigliserida: number | string;
    };
    glukosa: {
      hba1c?: number | string;
      gulaDarahPuasa?: number | string;
      gulaDarah2JamPP?: number | string;
      urineReduksiPuasa?: string;
      urineReduksi2JamPP?: string;
    };
    immunologi?: {
      hbsAg?: string;
      antiHBs?: string;
      asto?: string;
      rematoidFaktor?: string;
      crp?: string;
    };
    kesimpulanKimia?: {
      kesLab?: string;
      kesHbsag?: string;
    };
    serologiNarkoba?: {
      hbsAg: 'Non-Reaktif' | 'Reaktif' | string;
      antiHCV?: 'Non-Reaktif' | 'Reaktif' | string;
      amp?: 'Negatif' | 'Positif' | string;
      thc?: 'Negatif' | 'Positif' | string;
      mop?: 'Negatif' | 'Positif' | string;
      bzo?: 'Negatif' | 'Positif' | string;
    };
  };

  hasilPemkes: FitnessStatus;
  kesimpulan: string;
  saran: string;
  totalKardiovaskular?: string;

  // Kesimpulan & Saran Khusus Per Jenis Pemeriksaan (Per Tab)
  kesimpulanUmum?: string;
  saranUmum?: string;
  kesimpulanFisik?: string;
  saranFisik?: string;
  kesimpulanFisik2?: string;
  saranFisik2?: string;
  kesimpulanLab?: string;
  saranLab?: string;
  kesimpulanKimia?: string;
  saranKimia?: string;

  createdAt?: string;
  updatedAt?: string;
}
