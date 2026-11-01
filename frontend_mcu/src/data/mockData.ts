import { Employee, MCURecord, BloodType } from '../types';

export const PUSRI_DEPARTMENTS = [
  'Kompartemen Operasi (Pusri-IB / II / III / IV)',
  'Kompartemen Pemeliharaan & Pabrik',
  'Departemen K3LH (Keselamatan & Kesehatan Kerja)',
  'Rumah Sakit PT Pusri Palembang',
  'Departemen SDM & Organisasi',
  'Departemen Pemasaran & Logistik',
  'Departemen Keuangan & Akuntansi',
  'Departemen Riset & Tata Kelola',
  'Departemen Pengadaan & Pergudangan',
  'Departemen Teknik Proses & Energi',
  'Departemen TI & Digitalisasi',
  'Departemen Keamanan & General Affair'
];

export const DOCTORS_LIST = [
  'DR. NURSYIRWAN, Sp.Ok',
  'DR. H. AHMAD FAUZI, Sp.PD',
  'DR. RATNA DEWI, Sp.Ok',
  'DR. M. ILHAM RAMADHAN, Sp.JP',
  'DR. SITI AISYAH, M.Kes, Sp.Ok',
  'DR. BAMBANG SUTRISNO, Sp.P',
  'DR. HENDRA WIJAYA, M.Biomed'
];

const NAMES_POOL = [
  { nama: 'AHMAD BUDIMAN, ST', gender: 'L', deptIdx: 0, jabatan: 'Supervisor Operasi Pabrik 1B' },
  { nama: 'NURUL HIDAYATI, S.Si', gender: 'P', deptIdx: 2, jabatan: 'Analis Lingkungan & Ergonomi' },
  { nama: 'IR. RIZKY PRATAMA', gender: 'L', deptIdx: 1, jabatan: 'Manager Maintenance Pabrik' },
  { nama: 'DEWI ANGGRAENI, SE', gender: 'P', deptIdx: 6, jabatan: 'Senior Cost Analyst' },
  { nama: 'FAJAR SETIAWAN, AMd', gender: 'L', deptIdx: 0, jabatan: 'Operator Lapangan Amoniak' },
  { nama: 'DRG. CITRA LESTARI', gender: 'P', deptIdx: 3, jabatan: 'Dokter Gigi RS Pusri' },
  { nama: 'BAMBANG HERMANTO', gender: 'L', deptIdx: 1, jabatan: 'Teknisi Instrumentasi Pabrik' },
  { nama: 'SITI RAHMAWATI, S.Kom', gender: 'P', deptIdx: 10, jabatan: 'IT Application Specialist' },
  { nama: 'HENDRA KURNIAWAN, ST', gender: 'L', deptIdx: 9, jabatan: 'Process Engineer Urea' },
  { nama: 'RATNA SARI DEWI, SKM', gender: 'P', deptIdx: 2, jabatan: 'Safety Inspector K3' },
  { nama: 'DEDI KURNIA, ST', gender: 'L', deptIdx: 0, jabatan: 'Operator Utama Pusri II' },
  { nama: 'TRI WAHYUNI, SE', gender: 'P', deptIdx: 4, jabatan: 'Staff Manajemen SDM' },
  { nama: 'EKO PRASETYO', gender: 'L', deptIdx: 8, jabatan: 'Supervisor Pergudangan Pupuk' },
  { nama: 'MAYA ANGGRAENI, S.Farm', gender: 'P', deptIdx: 3, jabatan: 'Apoteker RS PT Pusri' },
  { nama: 'AGUS SUPRIYADI, ST', gender: 'L', deptIdx: 1, jabatan: 'Engineer Mekanikal Pabrik 3' },
  { nama: 'INDAH PERMATASARI, SE', gender: 'P', deptIdx: 5, jabatan: 'Marketing Officer Wilayah Sumsel' },
  { nama: 'WAHYU HIDAYAT', gender: 'L', deptIdx: 11, jabatan: 'Koordinator Pengamanan Obvitnas' },
  { nama: 'DIAN ANGGITA, S.Tr.Kes', gender: 'P', deptIdx: 3, jabatan: 'Analis Laboratorium Medis' },
  { nama: 'RULLY ARDIANSAH, ST', gender: 'L', deptIdx: 9, jabatan: 'Utility & Energy Engineer' },
  { nama: 'SRI WULANDARI, S.Sos', gender: 'P', deptIdx: 4, jabatan: 'Spesialis Pelatihan Karyawan' },
  { nama: 'M. ADITYA NUGRAHA', gender: 'L', deptIdx: 0, jabatan: 'Operator Lapangan Urea IB' },
  { nama: 'YULIA CITRA, SE', gender: 'P', deptIdx: 6, jabatan: 'Auditor Internal Keuangan' },
  { nama: 'HERI SANTOSO', gender: 'L', deptIdx: 1, jabatan: 'Teknisi Listrik Pabrik II' },
  { nama: 'RINA FITRIANI, S.Tr.Gz', gender: 'P', deptIdx: 3, jabatan: 'Ahli Gizi Klinis & Okupasi' },
  { nama: 'BAYU PRASETYA, ST', gender: 'L', deptIdx: 7, jabatan: 'Staff Riset Formulasi Pupuk' },
  { nama: 'MEGA MUSTIKA, SE', gender: 'P', deptIdx: 8, jabatan: 'Procurement Specialist' },
  { nama: 'ILHAM MAULANA, ST', gender: 'L', deptIdx: 0, jabatan: 'Operator Pusri IV' },
  { nama: 'ANITA WIJAYA, S.Kom', gender: 'P', deptIdx: 10, jabatan: 'Cybersecurity Analyst' },
  { nama: 'GUNAWAN WIBOWO', gender: 'L', deptIdx: 1, jabatan: 'Supervisor Fabrikasi Logam' },
  { nama: 'FITRI HANDAYANI, SKM', gender: 'P', deptIdx: 2, jabatan: 'Hygienist Industri' },
  { nama: 'DIMAS ARYA PUTRA', gender: 'L', deptIdx: 5, jabatan: 'Logistik & Distribusi Pupuk' },
  { nama: 'KARTIKA CANDRA, SE', gender: 'P', deptIdx: 6, jabatan: 'Staff Pajak & Perbendaharaan' },
  { nama: 'SURYA DHARMA, ST', gender: 'L', deptIdx: 9, jabatan: 'Chemical Process Analyst' },
  { nama: 'LIA MARLINA, Amd.Keb', gender: 'P', deptIdx: 3, jabatan: 'Bidan Okupasi RS Pusri' },
  { nama: 'BAGUS SETIAJI', gender: 'L', deptIdx: 0, jabatan: 'Shift Leader Operator Pabrik' },
  { nama: 'NITA KURNIASIH, S.Psi', gender: 'P', deptIdx: 4, jabatan: 'Psikolog Industri & SDM' },
  { nama: 'ANDI SAPUTRA, ST', gender: 'L', deptIdx: 1, jabatan: 'Teknisi Rotating Equipment' },
  { nama: 'DESI RATNASARI, S.Sos', gender: 'P', deptIdx: 11, jabatan: 'Public Relations & CSR' },
  { nama: 'ZULKARNAIN', gender: 'L', deptIdx: 8, jabatan: 'Foreman Material Handling' },
  { nama: 'TARI WIDYASTUTI, S.Stat', gender: 'P', deptIdx: 7, jabatan: 'Data Scientist Pasar Pupuk' },
  { nama: 'FARHAN MAHARDIKA', gender: 'L', deptIdx: 0, jabatan: 'Field Operator Bagging Urea' },
  { nama: 'TIARA KUSUMA, S.Ked', gender: 'P', deptIdx: 3, jabatan: 'Dokter Umum RS PT Pusri' },
  { nama: 'RIDWAN HAKIM, ST', gender: 'L', deptIdx: 9, jabatan: 'Water Treatment Specialist' },
  { nama: 'MELATI AYU, SE', gender: 'P', deptIdx: 5, jabatan: 'Customer Relation Officer' },
  { nama: 'SIGIT PURNOMO', gender: 'L', deptIdx: 1, jabatan: 'Teknisi Instrument & Otomasi' },
  { nama: 'RESTI AMALIA, SKM', gender: 'P', deptIdx: 2, jabatan: 'K3 Officer Pabrik Amoniak' },
  { nama: 'DONI DAMARA, ST', gender: 'L', deptIdx: 0, jabatan: 'Supervisor Pusri III' },
  { nama: 'PUTRI WULANDARI, S.Kom', gender: 'P', deptIdx: 10, jabatan: 'System Administrator' },
  { nama: 'ARIEF BUDIMAN', gender: 'L', deptIdx: 11, jabatan: 'Staff Sarana & Prasarana' },
  { nama: 'VIVI OKTAVIANA, SE', gender: 'P', deptIdx: 6, jabatan: 'Senior Budget Analyst' }
];

const GOL_DARAH_LIST: BloodType[] = ['A', 'B', 'O', 'AB'];

export const SAMPLE_EMPLOYEES: Employee[] = Array.from({ length: 50 }, (_, i) => {
  const badgeNum = 1110 + i;
  const badge = String(badgeNum);
  const template = NAMES_POOL[i % NAMES_POOL.length];
  const age = 24 + ((i * 3 + 5) % 35);
  const birthYear = 2026 - age;
  const birthMonth = String(1 + (i % 12)).padStart(2, '0');
  const birthDay = String(1 + ((i * 7) % 28)).padStart(2, '0');
  const golDarah = GOL_DARAH_LIST[i % GOL_DARAH_LIST.length];
  const shift = (template.gender === 'L' && i % 2 === 0) ? 'S' : 'NS';

  return {
    badge,
    nama: template.nama,
    jenisKelamin: template.gender as 'L' | 'P',
    umur: age,
    tanggalLahir: `${birthYear}-${birthMonth}-${birthDay}`,
    golDarah,
    rhesus: '+',
    shift,
    bagian: PUSRI_DEPARTMENTS[template.deptIdx],
    jabatan: template.jabatan,
    telepon: `0812-${7000 + i * 15}-${1000 + i * 23}`
  };
});

// Profiles klinik khas untuk variasi data realistis
const CLINICAL_PROFILES = [
  {
    type: 'sehat_prima',
    hasil: 'Fit' as const,
    kesimpulan: 'Status kesehatan sangat baik dan prima. Memenuhi syarat bekerja penuh (Fit to Work).',
    saran: 'Pertahankan pola makan seimbang, hidrasi cukup, dan olahraga rutin minimal 150 menit/minggu.',
    keluhan: 'Tidak ada keluhan kesehatan yang dirasakan.',
    riwayat: 'Tidak ada riwayat penyakit berat.',
    systolicBase: 115,
    diastolicBase: 75,
    sgotBase: 20,
    sgptBase: 22,
    asamUratBase: 4.8,
    gdpBase: 86,
    cholBase: 172,
    trigBase: 105,
    hdlBase: 52,
    ldlBase: 95,
    hba1cBase: 5.1,
    visusOD: '6/6',
    visusOS: '6/6',
    kacamata: false,
    ekg: 'Normal Sinus Rhythm',
    rontgen: 'Cor dan pulmo dalam batas normal, sinus kostofrenikus lancip',
    audiometri: 'Bilateral normal hearing sensitivity (< 20 dB)',
    spirometri: 'Fungsi faal paru normal (FVC > 85%, FEV1 > 85%)',
    catatanGigi: 'Gigi dan gusi bersih, tidak ada karies aktif'
  },
  {
    type: 'hipertensi_ringan',
    hasil: 'Fit with Note' as const,
    kesimpulan: 'Hipertensi Stage 1 Terkontrol. Fungsi ginjal, faal paru, dan profil metabolik dalam batas aman.',
    saran: '1. Diet rendah natrium (kurangi konsumsi garam & makanan olahan). 2. Rutin kontrol tensi di Poliklinik Pusri. 3. Manajemen stres dan olahraga aerobik teratur.',
    keluhan: 'Terkadang rasa tegang dan kaku di area tengkuk saat lembur atau lelah.',
    riwayat: 'Riwayat tekanan darah fluktuatif sejak 1 tahun terakhir.',
    systolicBase: 142,
    diastolicBase: 92,
    sgotBase: 24,
    sgptBase: 27,
    asamUratBase: 5.6,
    gdpBase: 94,
    cholBase: 198,
    trigBase: 135,
    hdlBase: 46,
    ldlBase: 118,
    hba1cBase: 5.4,
    visusOD: '6/7.5',
    visusOS: '6/6',
    kacamata: false,
    ekg: 'Sinus Rhythm, Left Ventricular Strain (-) ringan',
    rontgen: 'Cor elongasi ringan batas normal, pulmo tenang',
    audiometri: 'Pendengaran dalam batas normal bilateral',
    spirometri: 'Faal ventilasi paru normal',
    catatanGigi: 'Kalkulus ringan regio anterior bawah'
  },
  {
    type: 'dislipidemia_overweight',
    hasil: 'Fit with Note' as const,
    kesimpulan: 'Overweight dengan Dislipidemia Ringan (Kolesterol total & Trigliserida borderline tinggi).',
    saran: '1. Modifikasi diet rendah lemak jenuh & hindari gorengan. 2. Tingkatkan aktivitas fisik kardio 30 menit/hari. 3. Evaluasi profil lipid ulang 3-6 bulan.',
    keluhan: 'Cepat merasa lelah dan gerah saat beraktivitas fisik berat.',
    riwayat: 'Berat badan naik 4 kg dalam setahun terakhir.',
    systolicBase: 128,
    diastolicBase: 84,
    sgotBase: 31,
    sgptBase: 38,
    asamUratBase: 6.2,
    gdpBase: 98,
    cholBase: 232,
    trigBase: 195,
    hdlBase: 41,
    ldlBase: 148,
    hba1cBase: 5.5,
    visusOD: '6/6',
    visusOS: '6/6',
    kacamata: false,
    ekg: 'Normal Sinus Rhythm 78 bpm',
    rontgen: 'Cor dan pulmo dalam batas normal',
    audiometri: 'Normal bilateral',
    spirometri: 'Restriksi sangat ringan e.c postur obesitas (FVC 78%)',
    catatanGigi: 'Karies superfisial 1 gigi molar'
  },
  {
    type: 'hiperurisemia',
    hasil: 'Fit with Note' as const,
    kesimpulan: 'Hiperurisemia Asimtomatik (Kadar asam urat meningkat di atas nilai rujukan).',
    saran: '1. Hindari makanan tinggi purin (jeroan, emping, seafood pekat, kaldu kental). 2. Tingkatkan asupan air mineral minimal 2.5 - 3 liter/hari. 3. Hindari minuman manis tinggi fruktosa.',
    keluhan: 'Nyeri linu sesekali pada sendi jempol kaki kanan setelah konsumsi seafood.',
    riwayat: 'Asam urat pernah tinggi tahun lalu.',
    systolicBase: 122,
    diastolicBase: 80,
    sgotBase: 23,
    sgptBase: 25,
    asamUratBase: 7.9,
    gdpBase: 90,
    cholBase: 188,
    trigBase: 130,
    hdlBase: 49,
    ldlBase: 108,
    hba1cBase: 5.2,
    visusOD: '6/6',
    visusOS: '6/6',
    kacamata: false,
    ekg: 'Normal Sinus Rhythm 74 bpm',
    rontgen: 'Cor dan pulmo normal',
    audiometri: 'Normal',
    spirometri: 'Normal',
    catatanGigi: 'Gigi dan mulut baik'
  },
  {
    type: 'gangguan_visus_kacamata',
    hasil: 'Fit' as const,
    kesimpulan: 'Refraksi Miopia / Astigmatisma terkoreksi baik dengan lensa kacamata. Kondisi fisik prima.',
    saran: '1. Gunakan kacamata koreksi saat bekerja di depan monitor atau mengemudi. 2. Periksa refraksi berkala 1 tahun sekali. 3. Terapkan aturan 20-20-20 saat menatap layar.',
    keluhan: 'Pandangan agak buram saat melihat tulisan jauh tanpa kacamata.',
    riwayat: 'Memakai kacamata minus sejak masa kuliah.',
    systolicBase: 118,
    diastolicBase: 76,
    sgotBase: 19,
    sgptBase: 21,
    asamUratBase: 4.9,
    gdpBase: 88,
    cholBase: 175,
    trigBase: 110,
    hdlBase: 55,
    ldlBase: 98,
    hba1cBase: 5.0,
    visusOD: '6/12 c -1.50 -> 6/6',
    visusOS: '6/15 c -1.75 -> 6/6',
    kacamata: true,
    ekg: 'Normal Sinus Rhythm 70 bpm',
    rontgen: 'Cor dan pulmo normal',
    audiometri: 'Normal pendengaran',
    spirometri: 'Kapasitas faal paru prima',
    catatanGigi: '1 Tambalan komposit molar kiri atas dalam kondisi baik'
  },
  {
    type: 'prediabetes_gula',
    hasil: 'Fit with Note' as const,
    kesimpulan: 'Impaired Fasting Glucose / Pre-Diabetes. Fungsi kardiovaskular dan organ lain baik.',
    saran: '1. Batasi konsumsi karbohidrat sederhana, gula cair, dan camilan manis. 2. Rutin aktivitas jalan cepat 30 menit setiap hari. 3. Periksa lab GDP & HbA1c ulang 3 bulan.',
    keluhan: 'Mudah merasa haus di malam hari dan sering mengantuk setelah makan siang.',
    riwayat: 'Riwayat diabetes pada keluarga (Ibu).',
    systolicBase: 126,
    diastolicBase: 82,
    sgotBase: 28,
    sgptBase: 33,
    asamUratBase: 5.8,
    gdpBase: 114,
    cholBase: 205,
    trigBase: 170,
    hdlBase: 43,
    ldlBase: 124,
    hba1cBase: 6.1,
    visusOD: '6/6',
    visusOS: '6/6',
    kacamata: false,
    ekg: 'Normal Sinus Rhythm',
    rontgen: 'Normal',
    audiometri: 'Normal',
    spirometri: 'Normal',
    catatanGigi: 'Gingivitis marginalis ringan pada gigi bawah'
  },
  {
    type: 'noise_hearing_dip',
    hasil: 'Fit with Note' as const,
    kesimpulan: 'Suspek Mild Noise Induced Hearing Loss (NIHL) frekuensi 4000 Hz telinga kiri. Fisik umum fit.',
    saran: '1. Disiplin wajib gunakan Ear Plug / Ear Muff saat berada di area pabrik bising. 2. Hindari paparan bising non-kerja. 3. Audiometri ulang dalam 6 bulan.',
    keluhan: 'Telinga kiri kadang terasa berdenging (tinnitus) sesaat setelah shift di unit kompresor.',
    riwayat: 'Bekerja di area kebisingan mesin selama 6 tahun.',
    systolicBase: 120,
    diastolicBase: 78,
    sgotBase: 21,
    sgptBase: 23,
    asamUratBase: 5.1,
    gdpBase: 87,
    cholBase: 182,
    trigBase: 115,
    hdlBase: 50,
    ldlBase: 104,
    hba1cBase: 5.1,
    visusOD: '6/6',
    visusOS: '6/6',
    kacamata: false,
    ekg: 'Normal Sinus Rhythm 72 bpm',
    rontgen: 'Normal',
    audiometri: 'Telinga Kiri: Notching pada 4000 Hz (35 dB), Telinga Kanan: Normal',
    spirometri: 'Normal',
    catatanGigi: 'Normal'
  },
  {
    type: 'gastritis_dispepsia',
    hasil: 'Fit' as const,
    kesimpulan: 'Sindroma Dispepsia Fungsional Ringan. Seluruh uji penunjang laboratorium dan radiologi dalam batas normal.',
    saran: '1. Makan tepat waktu dengan porsi kecil tapi sering. 2. Hindari konsumsi kopi berlebihan, makanan pedas, dan asam saat perut kosong. 3. Istirahat teratur pasca shift.',
    keluhan: 'Perut terasa kembung, begah, dan perih di ulu hati saat telat makan.',
    riwayat: 'Maag kambuhan sejak 2 tahun lalu saat jadwal kerja shift malam.',
    systolicBase: 116,
    diastolicBase: 74,
    sgotBase: 22,
    sgptBase: 24,
    asamUratBase: 4.7,
    gdpBase: 89,
    cholBase: 168,
    trigBase: 98,
    hdlBase: 54,
    ldlBase: 92,
    hba1cBase: 4.9,
    visusOD: '6/6',
    visusOS: '6/6',
    kacamata: false,
    ekg: 'Normal Sinus Rhythm 68 bpm',
    rontgen: 'Normal',
    audiometri: 'Normal',
    spirometri: 'Normal',
    catatanGigi: 'Gigi lengkap, tidak ada karies'
  }
];

export function createMCURecord(index: number, employee: Employee): MCURecord {
  const isMale = employee.jenisKelamin === 'L';
  const dokter = DOCTORS_LIST[index % DOCTORS_LIST.length];
  const profile = CLINICAL_PROFILES[index % CLINICAL_PROFILES.length];

  // Variasi tanggal yang beragam sepanjang tahun 2026
  const monthNum = 1 + (index % 12);
  const dayNum = 1 + ((index * 5 + 3) % 27);
  const monthStr = String(monthNum).padStart(2, '0');
  const dayStr = String(dayNum).padStart(2, '0');
  const tanggal = `2026-${monthStr}-${dayStr}`;
  const intervalYears = isMale ? 1 : 2;
  const nextYear = 2026 + intervalYears;
  const tanggalMCUBerikutnya = `${nextYear}-${monthStr}-${dayStr}`;

  // Variasi antropometri realistis: Laki-laki 169+ cm ke atas, Perempuan 160+ cm ke atas
  const baseHeight = isMale ? 169 + ((index * 7 + 3) % 15) : 160 + ((index * 5 + 2) % 13);
  let weightOffset = 0;
  if (profile.type === 'dislipidemia_overweight') {
    weightOffset = 14 + (index % 8);
  } else if (profile.type === 'sehat_prima') {
    weightOffset = -2 + (index % 5);
  } else {
    weightOffset = 3 + (index % 6);
  }
  const beratBadan = Math.round((baseHeight - 100) + weightOffset);
  const tinggiBadan = baseHeight;
  const bmi = Number((beratBadan / Math.pow(tinggiBadan / 100, 2)).toFixed(1));
  const bmiKategori = bmi >= 30 ? 'Obesitas (Tingkat 1)' : bmi >= 25 ? 'Overweight (Kelebihan BB)' : bmi < 18.5 ? 'Underweight' : 'Normal / Ideal';

  // Variasi Tanda Vital
  const deltaV = (index % 5) - 2;
  const sistolik = profile.systolicBase + deltaV * 2;
  const diastolik = profile.diastolicBase + deltaV;
  const nadi = 68 + ((index * 3) % 18);
  const pernafasan = 16 + (index % 4);
  const suhu = Number((36.3 + ((index % 5) * 0.1)).toFixed(1));
  const lingkarPerut = isMale ? Math.round(76 + (bmi - 20) * 2.2) : Math.round(68 + (bmi - 19) * 2.1);

  // Variasi Hematologi
  const hb = Number((isMale ? 13.8 + ((index % 12) * 0.25) : 12.2 + ((index % 10) * 0.25)).toFixed(1));
  const ht = Math.round(hb * 3.0 + (index % 3));
  const leukosit = 5400 + ((index * 230) % 4200);
  const trombosit = 190000 + ((index * 7500) % 180000);
  const led = isMale ? 4 + ((index * 3) % 12) : 8 + ((index * 4) % 16);
  const eritrosit = Number((isMale ? 4.6 + ((index % 6) * 0.12) : 4.1 + ((index % 5) * 0.12)).toFixed(2));

  // Variasi Hitung Jenis Leukosit
  const eos = 1 + (index % 3);
  const bas = 0;
  const bat = 1 + (index % 3);
  const seg = 54 + (index % 12);
  const lim = 30 + ((index * 2) % 10);
  const mon = 3 + (index % 4);

  // Variasi Kimia Klinik
  const sgot = profile.sgotBase + (index % 7);
  const sgpt = profile.sgptBase + (index % 8);
  const ggt = 16 + ((index * 3) % 22);
  const alkFos = 58 + ((index * 4) % 36);
  const bTotal = Number((0.55 + ((index % 6) * 0.08)).toFixed(2));
  const bDirek = Number((0.12 + ((index % 4) * 0.04)).toFixed(2));
  const bIndirek = Number((bTotal - bDirek).toFixed(2));

  const ureum = 18 + ((index * 3) % 20);
  const kreatinin = Number((isMale ? 0.82 + ((index % 6) * 0.07) : 0.65 + ((index % 5) * 0.06)).toFixed(2));
  const asamUrat = Number((profile.asamUratBase + ((index % 5) * 0.15)).toFixed(1));
  const egfr = Math.round(92 + (index % 22));

  const chol = profile.cholBase + ((index * 3) % 16);
  const trig = profile.trigBase + ((index * 5) % 25);
  const hdl = profile.hdlBase + (index % 6);
  const ldl = Math.round(chol - hdl - (trig / 5));

  const gdp = profile.gdpBase + (index % 9);
  const gd2pp = Math.round(gdp * 1.22 + (index % 12));
  const hba1c = Number((profile.hba1cBase + ((index % 4) * 0.1)).toFixed(1));

  // Variasi Urin
  const phUrin = Number((5.5 + ((index % 4) * 0.5)).toFixed(1));
  const bjUrin = Number((1.010 + ((index % 4) * 0.005)).toFixed(3));
  const proteinUrin = profile.type === 'hipertensi_ringan' && index % 4 === 0 ? 'Trace' : 'Negatif';
  const epitelUrin = index % 2 === 0 ? 'Positif (1+)' : 'Positif (2+)';
  const leukoUrin = index % 3 === 0 ? '1-2 /LPB' : '0-1 /LPB';
  const eritroUrin = '0-1 /LPB';

  const kebiasaanMerokok = isMale && (index % 3 !== 0);
  const batangRokok = kebiasaanMerokok ? `${6 + (index % 10)} batang/hari` : '';

  return {
    id: `MCU-2026-${String(index + 1).padStart(3, '0')}`,
    badge: employee.badge,
    nama: employee.nama,
    isSpouse: false,
    tanggal,
    umur: employee.umur,
    golDarah: employee.golDarah,
    shift: employee.shift,
    bagian: employee.bagian,
    dokter,
    testTahun: '2026',
    jenisKelamin: employee.jenisKelamin,
    periodeMCU: isMale ? '1 Tahun' : '2 Tahun',
    tanggalMCUBerikutnya,

    keluhanSekarang: profile.keluhan,
    riwayatPenyakit: profile.riwayat,
    riwayatKehamilan: isMale ? '-' : (employee.umur > 30 ? `G${1 + (index % 3)}P${1 + (index % 3)}A0, anak terakhir ${3 + (index % 5)} thn` : 'Belum Pernah Hamil / Nona'),
    olahraga: index % 2 === 0,
    olahragaKeterangan: index % 2 === 0 ? `Lari/Jogging ${2 + (index % 2)}x seminggu, senam kesegaran jasmani Pusri` : 'Jalan pagi sesekali saat akhir pekan',
    alergiObat: index % 6 === 0,
    alergiObatKeterangan: index % 6 === 0 ? 'Antibiotik Golongan Penisilin (gatal/biduran)' : '',
    kebiasaan: {
      merokok: kebiasaanMerokok,
      merokokBatangPerHari: batangRokok,
      minumAlkohol: false,
      minumAlkoholKeterangan: '',
      lainLain: false,
      lainLainKeterangan: ''
    },
    riwayatPenyakitKeluarga: {
      darahTinggi: profile.type === 'hipertensi_ringan' || index % 3 === 0,
      kencingManis: profile.type === 'prediabetes_gula' || index % 4 === 0,
      gangguanPendengaran: false,
      stroke: index % 10 === 0,
      sesakNafas: false,
      jantung: index % 7 === 0,
      alergi: index % 5 === 0,
      lainLain: false,
      lainLainKeterangan: ''
    },

    tandaVital: {
      tekananDarahSistolik: sistolik,
      tekananDarahDiastolik: diastolik,
      nadi,
      pernafasan,
      suhu,
      beratBadan,
      tinggiBadan,
      bmi,
      bmiKategori,
      lingkarPerut,
      kulitDanRambut: 'normal',
      kesFisik: profile.hasil === 'Fit' ? 'DBN' : 'Catatan Ringan'
    },
    mata: {
      visusOD: profile.visusOD,
      visusOS: profile.visusOS,
      kacamata: profile.kacamata,
      butaWarna: index === 17 ? 'Parsial' : 'Normal',
      lapangPandang: 'Normal',
      konjungtiva: 'Normal',
      sklera: 'Normal',
      kesMata: profile.kacamata ? 'Miopia Terkoreksi' : 'DBN',
      penyakitMata: 'normal',
      conjungtiva: 'normal',
      sclera: 'normal'
    },
    tht: {
      telinga: 'normal',
      membranTympaniRL: 'normal',
      reflekCahaya: 'normal',
      serumenPlug: index % 8 === 0 ? 'Serumen minimal kanalis kanan' : 'normal',
      hidung: 'normal',
      septumDeviasi: 'normal',
      concha: 'normal',
      polyp: 'normal',
      kerongkongan: 'normal',
      tonsilRL: 'normal',
      faring: 'normal',
      kesTHT: profile.type === 'noise_hearing_dip' ? 'THT Catatan (Audiometri Dip)' : 'DBN',
      telingaKanan: 'Liang lapang, membran timpani intak',
      telingaKiri: profile.type === 'noise_hearing_dip' ? 'Membran timpani intak, riwayat terpapar bising' : 'Liang lapang, membran timpani intak',
      tenggorokan: 'Faring tenang, hiperemis (-)',
      tonsil: 'T1-T1 tenang, detritus (-)'
    },
    gigiMulut: {
      karies: profile.catatanGigi.includes('karies') ? '1 karies dentin' : 'Tidak ada',
      tambalan: profile.catatanGigi.includes('Tambalan') ? '1 tambalan komposit' : 'Tidak ada',
      gigiHilang: index % 5 === 0 ? '1 molar' : '0',
      kebersihan: profile.catatanGigi.includes('Kalkulus') ? 'Cukup' : 'Baik',
      catatanGigi: profile.catatanGigi,
      kesGigi: profile.catatanGigi.includes('karies') ? 'Karies Perlu Perawatan' : 'DBN',
      mulut: 'normal',
      gusi: profile.catatanGigi.includes('Gingivitis') ? 'Gingivitis marginalis ringan' : 'normal'
    },

    pemeriksaanFisikLanjutan: {
      leher: 'Normal, struma (-), pembesaran KGB (-)',
      kelenjarGetahBening: 'Tidak teraba pembesaran',
      tiroid: 'Eutiroid, normal simetris',
      jvp: 'Normal 5-2 cmH2O',
      dadaThorax: 'Simetris saat inspirasi dan ekspirasi',
      paru: 'Vesikuler normal bilateral, Ronkhi (-/-), Wheezing (-/-)',
      jantung: profile.type === 'hipertensi_ringan' ? 'BJ I-II murni reguler, bising (-), batas kiri sedikit lateral' : 'BJ I-II murni reguler, bising jantung (-)',
      abdomen: profile.type === 'gastritis_dispepsia' ? 'Supel, nyeri tekan epigastrium ringan (+), bising usus normal' : 'Supel, hepar & lien tidak teraba membesar, nyeri tekan (-)',
      heparLien: 'Tidak teraba pembesaran',
      ekstremitas: 'Akral hangat, edema pretibial (-/-), CRT < 2 detik, kekuatan 5/5',
      refleks: 'Fisiologis (+/+), Patologis (-/-)',
      kulit: 'Turgor elastis baik, ruam (-)'
    },
    penunjangFisik: {
      rontgenThorax: profile.rontgen,
      rontgenKesimpulan: 'Normal',
      ekg: profile.ekg,
      ekgKesimpulan: 'Normal',
      audiometri: profile.audiometri,
      audiometriKesimpulan: profile.type === 'noise_hearing_dip' ? 'NIHL' : 'Normal',
      spirometri: profile.spirometri,
      spirometriKesimpulan: 'Normal'
    },

    hematologi: {
      hemoglobin: hb,
      hematokrit: ht,
      leukosit,
      trombosit,
      led,
      eritrosit,
      malaria: 'Negatif',
      hitungJenis: {
        basofil: bas,
        eosinofil: eos,
        batang: bat,
        segmen: seg,
        limfosit: lim,
        monosit: mon,
        staf: bat,
        netrofit: seg
      }
    },
    urinLengkap: {
      warna: 'Kuning Jernih',
      kejernihan: 'Jernih',
      ph: phUrin,
      beratJenis: bjUrin,
      proteinAlbumin: proteinUrin,
      glukosa: profile.type === 'prediabetes_gula' && index % 2 === 0 ? 'Trace' : 'Negatif',
      reduksi: 'Negatif',
      bilirubin: 'Negatif',
      urobilinogen: 'Normal',
      hyaline: 'Negatif',
      granuler: 'Negatif',
      bakteri: 'Negatif',
      sedimen: {
        leukosit: leukoUrin,
        eritrosit: eritroUrin,
        epitel: epitelUrin,
        kristal: profile.type === 'hiperurisemia' ? 'Kristal Asam Urat (+)' : 'Negatif',
        silinder: 'Negatif',
        bakteri: 'Negatif'
      },
      kristalDetail: {
        asamUrat: profile.type === 'hiperurisemia' ? 'Positif (1+)' : 'Negatif',
        amorf: 'Negatif',
        triplePhosp: 'Negatif',
        caOx: 'Negatif'
      }
    },

    kimiaKlinik: {
      fungsiHati: {
        sgot,
        sgpt,
        gammaGT: ggt,
        alkalinePhospat: String(alkFos),
        alkaliFosfatase: alkFos,
        bilirubinTotal: bTotal,
        bilirubinDirek: bDirek,
        bilirubinIndirek: bIndirek,
        proteinTotal: Number((7.2 + ((index % 4) * 0.1)).toFixed(1)),
        albumin: Number((4.3 + ((index % 3) * 0.1)).toFixed(1)),
        globulin: Number((2.9 + ((index % 3) * 0.1)).toFixed(1))
      },
      fungsiGinjal: {
        ureum,
        kreatinin,
        asamUrat,
        egfr
      },
      profilLipid: {
        kolesterolTotal: chol,
        hdl,
        ldl,
        trigliserida: trig
      },
      glukosa: {
        gulaDarahPuasa: String(gdp),
        gulaDarah2JamPP: String(gd2pp),
        hba1c,
        urineReduksiPuasa: 'Negatif',
        urineReduksi2JamPP: 'Negatif'
      },
      immunologi: {
        hbsAg: 'Negatif',
        antiHBs: index % 5 === 0 ? 'Negatif (Perlu Booster)' : 'Positif (Titer > 100 mIU/mL)',
        asto: 'Negatif',
        rematoidFaktor: 'Negatif',
        crp: profile.type === 'gastritis_dispepsia' || profile.type === 'hipertensi_ringan' ? 'Negatif (< 1.0 mg/L)' : 'Negatif'
      },
      serologiNarkoba: {
        hbsAg: 'Non-Reaktif',
        antiHCV: 'Non-Reaktif',
        amp: 'Negatif',
        thc: 'Negatif',
        mop: 'Negatif',
        bzo: 'Negatif'
      },
      kesimpulanKimia: {
        kesLab: profile.hasil === 'Fit' ? 'DBN' : 'Lab Catatan',
        kesHbsag: 'Negatif'
      }
    },

    hasilPemkes: profile.hasil,
    kesimpulan: profile.kesimpulan,
    saran: profile.saran,
    createdAt: new Date(Date.now() - (50 - index) * 86400000).toISOString()
  };
}

export const INITIAL_MCU_RECORDS: MCURecord[] = SAMPLE_EMPLOYEES.map((emp, idx) =>
  createMCURecord(idx, emp)
);

export const REFERENCE_RANGES = {
  tekananDarah: {
    sistolikNormal: '< 120 mmHg',
    diastolikNormal: '< 80 mmHg',
    preHipertensi: '120-139 / 80-89',
    hipertensi: '>= 140 / >= 90'
  },
  bmi: {
    underweight: '< 18.5',
    normal: '18.5 - 24.9',
    overweight: '25.0 - 29.9',
    obese: '>= 30.0'
  },
  lab: {
    hb_pria: '13.5 - 17.5 g/dL',
    hb_wanita: '12.0 - 15.5 g/dL',
    leukosit: '4.000 - 10.000 /µL',
    trombosit: '150.000 - 450.000 /µL',
    led_pria: '0 - 15 mm/jam',
    led_wanita: '0 - 20 mm/jam',
    sgot: '< 37 U/L',
    sgpt: '< 41 U/L',
    ureum: '15 - 45 mg/dL',
    kreatinin_pria: '0.7 - 1.3 mg/dL',
    kreatinin_wanita: '0.6 - 1.1 mg/dL',
    asamUrat_pria: '3.5 - 7.2 mg/dL',
    asamUrat_wanita: '2.6 - 6.0 mg/dL',
    kolesterolTotal: '< 200 mg/dL',
    hdl_pria: '> 40 mg/dL',
    hdl_wanita: '> 50 mg/dL',
    ldl: '< 100 mg/dL',
    trigliserida: '< 150 mg/dL',
    gdp: '70 - 99 mg/dL',
    gd2pp: '< 140 mg/dL',
    hba1c: '< 5.7%'
  }
};
