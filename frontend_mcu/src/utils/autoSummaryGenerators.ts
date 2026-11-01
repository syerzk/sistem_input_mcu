import { MCURecord, FitnessStatus } from '../types';
import { calculateBMI, calculateCardiovascularRisk, detectAbnormalities, formatIndonesianDate } from './mcuHelpers';

export interface AutoSummaryResult {
  updatedRecord: Partial<MCURecord>;
  findings: string[];
  summaryMessage: string;
}

/**
 * HELPER PUSAT: SINTESIS KESIMPULAN, SARAN, DAN HASIL PEMKES (FITNESS STATUS)
 * Otomatis menyimpulkan kelaikan kerja, butir kesimpulan, saran rekomendasi,
 * dan risiko kardiovaskular agar langsung masuk ke panel HASIL PEMKES, KESIMPULAN, & SARAN.
 */
export function synthesizeConclusionAndAdvice(current: MCURecord): {
  kesimpulan: string;
  saran: string;
  hasilPemkes: FitnessStatus;
  totalKardiovaskular: string;
  detectedIssues: string[];
} {
  const isMale = current.jenisKelamin === 'L';
  const nextInterval = isMale ? '1 (satu) tahun sekali' : '2 (dua) tahun sekali';
  const detectedIssues = detectAbnormalities(current);
  const cvdRisk = calculateCardiovascularRisk(current);

  let conclusionText = '';
  if (detectedIssues.length === 0) {
    conclusionText = 'Secara umum kondisi kesehatan baik, semua parameter pemeriksaan fisik, penunjang, laboratorium, dan kimia klinik dalam batas normal (DBN), serta memenuhi kualifikasi kelaikan kerja (Fit to Work).';
  } else {
    const issueListStr = detectedIssues.map((item, idx) => `${idx + 1}. ${item}`).join('. ');
    conclusionText = `${issueListStr}.`;
  }

  const adviceList: string[] = [];

  if (detectedIssues.length === 0) {
    adviceList.push('Pertahankan pola hidup sehat, konsumsi gizi seimbang, dan istirahat yang cukup.');
    adviceList.push('Lakukan aktivitas fisik / olahraga aerobik teratur minimal 150 menit per minggu.');
    adviceList.push('Gunakan alat pelindung diri (APD) sesuai standar K3 di area kerja operasional PT Pusri.');
    adviceList.push(`Ikuti jadwal Medical Check-Up (MCU) berkala berikutnya: ${formatIndonesianDate(current.tanggalMCUBerikutnya)} (${nextInterval}).`);
  } else {
    if (detectedIssues.some(i => i.includes('Hipertensi') || i.includes('Pre-Hipertensi'))) {
      adviceList.push('Diet rendah natrium (kurangi konsumsi garam & makanan olahan). Rutin kontrol tekanan darah di Poliklinik/RS Pusri.');
    }
    if (detectedIssues.some(i => i.includes('Kolesterol') || i.includes('Trigliserida') || i.includes('Lipid') || i.includes('LDL'))) {
      adviceList.push('Diet rendah lemak jenuh dan kolesterol (kurangi gorengan/santan), perbanyak konsumsi serat sayur & buah.');
    }
    if (detectedIssues.some(i => i.includes('Gula') || i.includes('Diabetes') || i.includes('DM'))) {
      adviceList.push('Batasi konsumsi karbohidrat sederhana/gula olahan, kontrol kadar glukosa darah berkala, dan konsultasi Dokter Spesialis.');
    }
    if (detectedIssues.some(i => i.includes('Asam Urat') || i.includes('Hiperurisemia'))) {
      adviceList.push('Diet rendah purin (hindari jeroan, emping, seafood berlebih) dan perbanyak minum air putih minimal 2-2.5 liter/hari.');
    }
    if (detectedIssues.some(i => i.includes('Obesitas') || i.includes('Kelebihan') || i.includes('BMI'))) {
      adviceList.push('Program penurunan dan kontrol berat badan ideal melalui defisit kalori gizi seimbang dan olahraga aerobik rutin.');
    }
    if (detectedIssues.some(i => i.includes('Underweight') || i.includes('Kurang'))) {
      adviceList.push('Tingkatkan asupan nutrisi padat gizi seimbang dan konsultasi gizi untuk mencapai berat badan ideal.');
    }
    if (detectedIssues.some(i => i.includes('Anemia') || i.includes('Hemoglobin'))) {
      adviceList.push('Evaluasi penyebab anemia, tingkatkan asupan makanan kaya zat besi (sayuran hijau, daging tanpa lemak).');
    }
    if (detectedIssues.some(i => i.includes('Proteinuria') || i.includes('Sedimen') || i.includes('Bakteriuria') || i.includes('Silinder'))) {
      adviceList.push('Tingkatkan hidrasi air putih minimal 2.5 liter/hari, hindari menahan kencing, dan evaluasi urinalisis ulang.');
    }
    if (detectedIssues.some(i => i.includes('Hati') || i.includes('SGOT') || i.includes('SGPT'))) {
      adviceList.push('Hindari konsumsi obat hepatotoksik tanpa resep dokter, hindari alkohol, dan evaluasi fungsi hati ulang 1-3 bulan.');
    }
    if (detectedIssues.some(i => i.includes('HBsAg'))) {
      adviceList.push('Konsultasi dokter spesialis penyakit dalam untuk evaluasi status hepatitis B dan pemeriksaan lanjutan.');
    }
    if (detectedIssues.some(i => i.includes('Rontgen') || i.includes('Thorax'))) {
      adviceList.push('Konsultasi dokter spesialis paru / radiologi untuk tindak lanjut hasil rontgen thorax.');
    }
    if (detectedIssues.some(i => i.includes('EKG') || i.includes('Jantung'))) {
      adviceList.push('Konsultasi dokter spesialis jantung (Sp.JP) untuk evaluasi rekam jantung.');
    }
    if (detectedIssues.some(i => i.includes('Audiometri'))) {
      adviceList.push('Wajib memakai Ear Plug / Ear Muff di area bising tinggi dan evaluasi audiometri berkala.');
    }
    if (detectedIssues.some(i => i.includes('Spirometri'))) {
      adviceList.push('Wajib gunakan masker respirator di area berdebu/uap kimia dan hindari paparan asap rokok.');
    }
    if (detectedIssues.some(i => i.includes('Gigi') || i.includes('Karies') || i.includes('Mulut'))) {
      adviceList.push('Periksa dan rawat kesehatan gigi serta penambalan/pembersihan karang gigi di poli gigi.');
    }
    if (detectedIssues.some(i => i.includes('Mata') || i.includes('Visus') || i.includes('Refraksi'))) {
      adviceList.push('Pemeriksaan refraksi mata lanjutan dan penggunaan kacamata koreksi yang sesuai.');
    }
    if (current.kebiasaan?.merokok) {
      adviceList.push('Ikuti Program Berhenti Merokok (Smoking Cessation Program K3 Pusri).');
    }

    adviceList.push(`Rutin kontrol kesehatan dan jadwal MCU berkala berikutnya: ${formatIndonesianDate(current.tanggalMCUBerikutnya)} (${nextInterval}).`);
  }

  const formattedSaran = adviceList.map((item, idx) => `${idx + 1}. ${item}`).join(' ');

  let fitness: FitnessStatus = 'Fit';
  if (detectedIssues.length === 0) {
    fitness = 'Fit';
  } else {
    const isCritical = detectedIssues.some(i =>
      i.includes('HBsAg') ||
      i.includes('EKG Abnormal') ||
      i.includes('Rontgen Thorax Abnormal') ||
      i.includes('TD: 16') ||
      i.includes('TD: 17') ||
      i.includes('TD: 18')
    );
    if (isCritical || detectedIssues.length >= 4) {
      fitness = 'Temporary Unfit';
    } else {
      fitness = 'Fit with Note';
    }
  }

  return {
    kesimpulan: conclusionText,
    saran: formattedSaran,
    hasilPemkes: fitness,
    totalKardiovaskular: cvdRisk.level,
    detectedIssues
  };
}

/**
 * 1. AUTO GENERATE KESIMPULAN / AUTO-FILL TAB UMUM
 * Menyimpulkan dan mengisi data anamnesis, riwayat keluhan, kebiasaan, dan riwayat keluarga,
 * serta langsung mengupdate KESIMPULAN, SARAN, & HASIL PEMKES di panel bawah.
 */
export function autoGenerateTabUmum(current: MCURecord): AutoSummaryResult {
  const isMale = current.jenisKelamin === 'L';
  const findings: string[] = [];

  const keluhan = current.keluhanSekarang?.trim()
    ? current.keluhanSekarang
    : 'Tidak ada keluhan klinis yang dirasakan saat ini (kondisi sehat dan fit).';

  const riwayat = current.riwayatPenyakit?.trim()
    ? current.riwayatPenyakit
    : 'Tidak ada riwayat penyakit kronis, rawat inap, ataupun riwayat operasi sebelumnya.';

  const kehamilan = isMale
    ? '-'
    : (current.riwayatKehamilan && current.riwayatKehamilan !== '-'
        ? current.riwayatKehamilan
        : 'G..P..A.., Tidak sedang hamil/menyusui, siklus menstruasi teratur.');

  if (current.keluhanSekarang?.trim() && !current.keluhanSekarang.toLowerCase().includes('tidak')) {
    findings.push(`Keluhan: ${current.keluhanSekarang}`);
  }

  // Cek Review of Systems / Keluhan Organ
  const organSymptoms: string[] = [];
  if (current.keluhanSistemOrgan?.kepalaPusing) organSymptoms.push('Pusing / Nyeri Kepala');
  if (current.keluhanSistemOrgan?.mataKabur) organSymptoms.push('Pandangan Kabur');
  if (current.keluhanSistemOrgan?.telingaBerdenging) organSymptoms.push('Tinnitus');
  if (current.keluhanSistemOrgan?.batukPilek) organSymptoms.push('Batuk / Pilek');
  if (current.keluhanSistemOrgan?.sesakNafas) organSymptoms.push('Sesak Napas');
  if (current.keluhanSistemOrgan?.nyeriDada) organSymptoms.push('Nyeri Dada');
  if (current.keluhanSistemOrgan?.gangguanPencernaan) organSymptoms.push('Gangguan Cerna');
  if (current.keluhanSistemOrgan?.nyeriUluHati) organSymptoms.push('Nyeri Ulu Hati / Gastritis');
  if (current.keluhanSistemOrgan?.pegalOtotSendi) organSymptoms.push('Nyeri Otot / Sendi');
  if (current.keluhanSistemOrgan?.kesemutan) organSymptoms.push('Parestesia / Kesemutan');
  if (organSymptoms.length > 0) {
    findings.push(`Keluhan Organ: ${organSymptoms.join(', ')}`);
  }

  if (current.riwayatPenyakit?.trim() && !current.riwayatPenyakit.toLowerCase().includes('tidak')) {
    findings.push(`Riwayat Penyakit: ${current.riwayatPenyakit}`);
  }

  // Cek Riwayat Penyakit Dahulu Spesifik
  const pastIllnesses: string[] = [];
  if (current.riwayatPenyakitDahulu?.hipertensi) pastIllnesses.push('Hipertensi');
  if (current.riwayatPenyakitDahulu?.diabetesMelitus) pastIllnesses.push('DM');
  if (current.riwayatPenyakitDahulu?.penyakitJantung) pastIllnesses.push('Penyakit Jantung');
  if (current.riwayatPenyakitDahulu?.asmaParu) pastIllnesses.push('Asma / Paru');
  if (current.riwayatPenyakitDahulu?.penyakitGinjal) pastIllnesses.push('Ginjal');
  if (pastIllnesses.length > 0) {
    findings.push(`Riwayat Penyakit Dahulu: ${pastIllnesses.join(', ')}`);
  }

  // Cek Kebiasaan Merokok & APD
  if (current.kebiasaan?.merokok) {
    findings.push(`Perokok aktif (${current.kebiasaan.merokokBatangPerHari || '10'} btg/hari, ${current.kebiasaan.jenisRokok || 'Kretek'})`);
  }
  if (current.kebiasaan?.penggunaanApd && current.kebiasaan.penggunaanApd !== 'Lengkap Sesuai Matriks') {
    findings.push(`Kepatuhan APD: ${current.kebiasaan.penggunaanApd}`);
  }

  const tabUmumUpdates: Partial<MCURecord> = {
    keluhanSekarang: keluhan,
    riwayatPenyakit: riwayat,
    riwayatKehamilan: kehamilan,
    olahraga: current.olahraga !== undefined ? current.olahraga : true,
    olahragaKeterangan: current.olahragaKeterangan || 'Jogging / senam aerobik 2-3x seminggu @ 30 menit',
    olahragaFrekuensi: current.olahragaFrekuensi || '2-3x seminggu',
    alergiObat: current.alergiObat || false,
    alergiObatKeterangan: current.alergiObatKeterangan || 'Tidak ada riwayat alergi obat atau makanan',
    alergiMakanan: current.alergiMakanan || 'Tidak ada',
    riwayatPenyakitAkibatKerja: current.riwayatPenyakitAkibatKerja || 'Tidak ada (Nihil)',
    riwayatKecelakaanKerja: current.riwayatKecelakaanKerja || 'Tidak pernah (Nihil)',
    riwayatPengobatanRutin: current.riwayatPengobatanRutin || 'Tidak ada',
    riwayatVaksinasi: current.riwayatVaksinasi || 'Lengkap (Hepatitis B & Tetanus/COVID-19)',
    kebiasaan: {
      merokok: current.kebiasaan?.merokok ?? false,
      merokokBatangPerHari: current.kebiasaan?.merokokBatangPerHari || '',
      merokokLamaTahun: current.kebiasaan?.merokokLamaTahun || '',
      jenisRokok: current.kebiasaan?.jenisRokok || 'Filter',
      minumAlkohol: current.kebiasaan?.minumAlkohol ?? false,
      minumAlkoholKeterangan: current.kebiasaan?.minumAlkoholKeterangan || '',
      minumKopi: current.kebiasaan?.minumKopi ?? false,
      minumKopiCangkirPerHari: current.kebiasaan?.minumKopiCangkirPerHari || '',
      polaTidurJamPerHari: current.kebiasaan?.polaTidurJamPerHari || '7-8 jam',
      penggunaanApd: current.kebiasaan?.penggunaanApd || 'Lengkap Sesuai Matriks',
      lainLain: current.kebiasaan?.lainLain ?? false,
      lainLainKeterangan: current.kebiasaan?.lainLainKeterangan || ''
    }
  };

  // Sintesis khusus untuk Tab UMUM
  let kesUmum = '';
  let sarUmum = '';
  if (findings.length === 0) {
    kesUmum = 'Tidak ada keluhan klinis yang dirasakan (anamnesis dalam batas normal), riwayat kesehatan kerja dan kebiasaan baik.';
    sarUmum = 'Pertahankan pola hidup sehat, pola tidur cukup, dan patuhi pemakaian APD di tempat kerja.';
  } else {
    kesUmum = `Temuan anamnesis & riwayat: ${findings.join(', ')}.`;
    sarUmum = 'Kelola faktor risiko/keluhan yang dialami, konsultasi dokter jika gejala berulang, dan patuhi prosedur K3.';
  }

  // Sintesis global ke panel HASIL PEMKES
  const intermediate = { ...current, ...tabUmumUpdates } as MCURecord;
  const syn = synthesizeConclusionAndAdvice(intermediate);

  const updatedRecord: Partial<MCURecord> = {
    ...tabUmumUpdates,
    kesimpulanUmum: kesUmum,
    saranUmum: sarUmum,
    hasilPemkes: syn.hasilPemkes,
    totalKardiovaskular: syn.totalKardiovaskular
  };

  const summaryMessage = findings.length > 0
    ? `Data Anamnesis disimpulkan & masuk ke Hasil (${findings.join('; ')}). Status: ${syn.hasilPemkes}.`
    : `Data Anamnesis disimpulkan & masuk ke Hasil: Kondisi sehat tanpa keluhan. Status: ${syn.hasilPemkes}.`;

  return { updatedRecord, findings, summaryMessage };
}

/**
 * 2. AUTO GENERATE KESIMPULAN TAB FISIK
 * Menyimpulkan KES. FISIK, KES. MATA, dan KES. THT berdasarkan tanda vital & hasil periksa
 */
export function autoGenerateTabFisik(current: MCURecord): AutoSummaryResult {
  const findings: string[] = [];
  const vitals = { ...(current.tandaVital || {}) };
  const mata = { ...(current.mata || {}) };
  const tht = { ...(current.tht || {}) };
  const genetalia = { ...(current.genetaliaAnorectal || {}) };

  // --- Analisis Tanda Vital ---
  let isVitalAbnormal = false;
  const sbp = Number(vitals.tekananDarahSistolik) || 0;
  const dbp = Number(vitals.tekananDarahDiastolik) || 0;

  if (sbp >= 140 || dbp >= 90) {
    isVitalAbnormal = true;
    findings.push(`Hipertensi (TD ${sbp}/${dbp} mmHg)`);
  } else if (sbp >= 130 || dbp >= 85) {
    isVitalAbnormal = true;
    findings.push(`Pre-Hipertensi (TD ${sbp}/${dbp} mmHg)`);
  } else if (sbp > 0 && sbp < 90) {
    isVitalAbnormal = true;
    findings.push(`Hipotensi (TD ${sbp}/${dbp} mmHg)`);
  }

  // Hitung BMI jika ada tinggi & berat badan
  const bb = Number(vitals.beratBadan) || 0;
  const tb = Number(vitals.tinggiBadan) || 0;
  if (bb > 0 && tb > 0) {
    const { bmi, category } = calculateBMI(bb, tb);
    vitals.bmi = bmi;
    vitals.bmiKategori = category;
    if (bmi >= 25.0) {
      isVitalAbnormal = true;
      findings.push(`Kelebihan BB / Obesitas (BMI ${bmi})`);
    } else if (bmi < 18.5 && bmi > 0) {
      isVitalAbnormal = true;
      findings.push(`Berat Badan Kurang (BMI ${bmi})`);
    }
  }

  const nadi = Number(vitals.nadi) || 0;
  if (nadi > 100) {
    isVitalAbnormal = true;
    findings.push(`Takikardia (Nadi ${nadi} x/mnt)`);
  } else if (nadi > 0 && nadi < 55) {
    isVitalAbnormal = true;
    findings.push(`Bradikardia (Nadi ${nadi} x/mnt)`);
  }

  const rr = Number(vitals.pernafasan) || 0;
  if (rr > 22) {
    isVitalAbnormal = true;
    findings.push(`Takipnea (RR ${rr} x/mnt)`);
  }

  const suhu = Number(vitals.suhu) || 0;
  if (suhu >= 37.8) {
    isVitalAbnormal = true;
    findings.push(`Febris / Demam (Suhu ${suhu} °C)`);
  }

  if (vitals.kulitDanRambut && vitals.kulitDanRambut !== 'normal') {
    isVitalAbnormal = true;
    findings.push(`Kulit/Rambut: ${vitals.kulitDanRambut}`);
  }

  vitals.kesFisik = isVitalAbnormal ? 'TIDAK DBN' : 'DBN';

  // --- Analisis Mata ---
  let isMataAbnormal = false;
  if (mata.visusTanpaKM && mata.visusTanpaKM !== 'OD : E OS : E' && !mata.visusTanpaKM.includes('6/6')) {
    isMataAbnormal = true;
    findings.push(`Visus Mata: ${mata.visusTanpaKM}`);
  }
  if (mata.butaWarna && mata.butaWarna !== 'Normal') {
    isMataAbnormal = true;
    findings.push(`Buta Warna: ${mata.butaWarna}`);
  }
  if (mata.conjungtiva && mata.conjungtiva !== 'normal' && mata.conjungtiva !== 'Normal') {
    isMataAbnormal = true;
    findings.push(`Konjungtiva: ${mata.conjungtiva}`);
  }
  if (mata.sclera && mata.sclera !== 'normal' && mata.sclera !== 'Normal') {
    isMataAbnormal = true;
    findings.push(`Sklera: ${mata.sclera}`);
  }
  if (mata.penyakitMata && mata.penyakitMata !== 'normal' && mata.penyakitMata !== '-') {
    isMataAbnormal = true;
    findings.push(`Penyakit Mata: ${mata.penyakitMata}`);
  }

  mata.kesMata = isMataAbnormal ? 'TIDAK DBN' : 'DBN';

  // --- Analisis THT ---
  let isThtAbnormal = false;
  if (tht.serumenPlug && tht.serumenPlug !== 'normal' && tht.serumenPlug !== 'tidak ada' && tht.serumenPlug !== '-') {
    isThtAbnormal = true;
    findings.push(`THT Serumen: ${tht.serumenPlug}`);
  }
  if (tht.septumDeviasi && tht.septumDeviasi !== 'normal' && tht.septumDeviasi !== 'tidak ada' && tht.septumDeviasi !== '-') {
    isThtAbnormal = true;
    findings.push(`Septum Deviasi: ${tht.septumDeviasi}`);
  }
  if (tht.tonsilRL && tht.tonsilRL !== 'normal' && tht.tonsilRL !== 'T1-T1') {
    isThtAbnormal = true;
    findings.push(`Tonsil: ${tht.tonsilRL}`);
  }
  if (tht.faring && tht.faring !== 'normal') {
    isThtAbnormal = true;
    findings.push(`Faring: ${tht.faring}`);
  }
  if (tht.telinga && tht.telinga !== 'normal') {
    isThtAbnormal = true;
    findings.push(`Telinga: ${tht.telinga}`);
  }

  tht.kesTHT = isThtAbnormal ? 'TIDAK DBN' : 'DBN';

  // Pastikan organ fisik standar berstatus normal jika belum diisi
  if (!genetalia.hernia) genetalia.hernia = 'normal';
  if (!genetalia.haemorroid) genetalia.haemorroid = 'normal';
  if (!genetalia.leher) genetalia.leher = 'normal';
  if (!genetalia.jvp) genetalia.jvp = 'normal';
  if (!genetalia.struma) genetalia.struma = 'normal';

  const tabFisikUpdates: Partial<MCURecord> = {
    tandaVital: vitals as any,
    mata: mata as any,
    tht: tht as any,
    genetaliaAnorectal: genetalia as any
  };

  // Sintesis khusus untuk Tab FISIK
  let kesFisik = '';
  let sarFisik = '';
  if (findings.length === 0) {
    kesFisik = 'Tanda vital (tensi, nadi, pernafasan, suhu), status gizi BMI, visus mata, dan THT dalam batas normal (DBN).';
    sarFisik = 'Pertahankan aktivitas fisik rutin, ergonomi kerja yang baik, dan istirahatkan mata secara berkala saat bekerja.';
  } else {
    kesFisik = `Temuan fisik: ${findings.join(', ')}.`;
    const saranItems: string[] = [];
    if (findings.some(f => f.includes('Hipertensi'))) saranItems.push('Diet rendah garam, kontrol tensi berkala');
    if (findings.some(f => f.includes('BMI') || f.includes('Obesitas'))) saranItems.push('Latihan fisik aerobik dan perbaiki pola makan');
    if (findings.some(f => f.includes('Mata') || f.includes('Visus'))) saranItems.push('Pemeriksaan refraksi mata dan kacamata koreksi');
    if (findings.some(f => f.includes('THT') || f.includes('Serumen'))) saranItems.push('Pembersihan serumen telinga di poli THT');
    sarFisik = saranItems.length > 0 ? saranItems.join(', ') + '.' : 'Konsultasi dokter untuk penanganan kelainan fisik.';
  }

  const intermediate = { ...current, ...tabFisikUpdates } as MCURecord;
  const syn = synthesizeConclusionAndAdvice(intermediate);

  const updatedRecord: Partial<MCURecord> = {
    ...tabFisikUpdates,
    kesimpulanFisik: kesFisik,
    saranFisik: sarFisik,
    hasilPemkes: syn.hasilPemkes,
    totalKardiovaskular: syn.totalKardiovaskular
  };

  const summaryMessage = findings.length > 0
    ? `Kesimpulan Fisik: Disetel KES. FISIK (${vitals.kesFisik}) & langsung masuk ke Hasil Pemkes (${syn.hasilPemkes}). Temuan: ${findings.join(', ')}.`
    : `Kesimpulan Fisik: Seluruh Tanda Vital, Mata, & THT DBN. Hasil Pemkes: ${syn.hasilPemkes}.`;

  return { updatedRecord, findings, summaryMessage };
}

/**
 * 3. AUTO GENERATE KESIMPULAN TAB FISIK (2) & PENUNJANG
 * Menyimpulkan Gigi & Mulut serta Kesimpulan Penunjang (EKG, Treadmill, USG, Audiometri, Foto Thorax, Autospiro)
 */
export function autoGenerateTabFisik2(current: MCURecord): AutoSummaryResult {
  const findings: string[] = [];
  const gigi = { ...(current.gigiMulut || {}) };
  const penunjang = { ...(current.penunjangFisik || {}) };
  const kes = { ...(current.kesimpulanPenunjang || {}) };

  // --- Analisis Gigi & Mulut ---
  let isGigiAbnormal = false;
  const kariesStr = String(gigi.karies || '').trim().toLowerCase();
  if (kariesStr && kariesStr !== '0' && kariesStr !== 'tidak ada' && kariesStr !== '-' && kariesStr !== 'normal') {
    isGigiAbnormal = true;
    findings.push(`Karies Gigi: ${gigi.karies}`);
  }
  if (gigi.kebersihan === 'Kurang') {
    isGigiAbnormal = true;
    findings.push('Kebersihan Mulut Kurang / Karang Gigi');
  }
  if (gigi.gusi && gigi.gusi !== 'normal') {
    isGigiAbnormal = true;
    findings.push(`Kelainan Gusi: ${gigi.gusi}`);
  }
  gigi.kesGigi = isGigiAbnormal ? 'TIDAK DBN' : 'DBN';

  // --- Analisis Kesimpulan Penunjang ---
  // EKG
  if (penunjang.ekgKesimpulan === 'Abnormal' || (penunjang.ekg && !penunjang.ekg.toLowerCase().includes('normal') && !penunjang.ekg.toLowerCase().includes('sinus'))) {
    kes.kesEkg = 'TIDAK DBN';
    findings.push(`EKG: ${penunjang.ekg || 'Abnormal'}`);
  } else {
    kes.kesEkg = 'DBN';
  }

  // Foto Thorax
  if (penunjang.rontgenKesimpulan === 'Abnormal' || (penunjang.rontgenThorax && (penunjang.rontgenThorax.toLowerCase().includes('kardiomegali') || penunjang.rontgenThorax.toLowerCase().includes('infiltrat')))) {
    kes.kesFotoThorax = 'TIDAK DBN';
    findings.push(`Foto Thorax: ${penunjang.rontgenThorax || 'Abnormal'}`);
  } else {
    kes.kesFotoThorax = 'DBN';
  }

  // Audiometri
  if (penunjang.audiometriKesimpulan && penunjang.audiometriKesimpulan !== 'Normal') {
    kes.kesAudiometri = 'TIDAK DBN';
    findings.push(`Audiometri: ${penunjang.audiometriKesimpulan}`);
  } else {
    kes.kesAudiometri = 'DBN';
  }

  // Autospirometri
  if (penunjang.spirometriKesimpulan && penunjang.spirometriKesimpulan !== 'Normal') {
    kes.kesAutospiro = 'TIDAK DBN';
    findings.push(`Spirometri: ${penunjang.spirometriKesimpulan}`);
  } else {
    kes.kesAutospiro = 'DBN';
  }

  // USG Abdomen & Treadmill
  const usgStr = (current.abdomenFisik2?.usgAbdomen || '').toLowerCase();
  if (usgStr.includes('fatty') || usgStr.includes('kista') || usgStr.includes('batu') || usgStr.includes('abnormal')) {
    kes.kesUsgAbd = 'TIDAK DBN';
    findings.push(`USG Abdomen: ${current.abdomenFisik2?.usgAbdomen}`);
  } else {
    kes.kesUsgAbd = 'DBN';
  }

  const tmStr = (current.thoraxJantung?.treadmillHasil || current.penunjangFisik?.treadmillTest || '').toLowerCase();
  if (tmStr.includes('iskemik') || tmStr.includes('ischemic') || tmStr.includes('positif') || tmStr.includes('abnormal')) {
    kes.kesTreadmill = 'TIDAK DBN';
    findings.push(`Treadmill: ${tmStr}`);
  } else {
    kes.kesTreadmill = 'DBN';
  }

  const tabFisik2Updates: Partial<MCURecord> = {
    gigiMulut: gigi as any,
    kesimpulanPenunjang: kes as any
  };

  // Sintesis khusus untuk Tab FISIK (2) & Penunjang
  let kesFisik2 = '';
  let sarFisik2 = '';
  if (findings.length === 0) {
    kesFisik2 = 'Kondisi gigi dan mulut serta seluruh pemeriksaan penunjang (EKG, foto thorax, spirometri, audiometri, USG) dalam batas normal (DBN).';
    sarFisik2 = 'Sikat gigi minimal 2x sehari, kontrol berkala ke dokter gigi per 6 bulan, dan gunakan pelindung telinga/masker di area kerja yang berisiko.';
  } else {
    kesFisik2 = `Temuan gigi/penunjang: ${findings.join(', ')}.`;
    const saranItems: string[] = [];
    if (findings.some(f => f.includes('Gigi') || f.includes('Karies'))) saranItems.push('Perawatan dan penambalan gigi di Poli Gigi');
    if (findings.some(f => f.includes('EKG') || f.includes('Treadmill'))) saranItems.push('Konsultasi Dokter Spesialis Jantung');
    if (findings.some(f => f.includes('Thorax'))) saranItems.push('Konsultasi Dokter Spesialis Paru / Radiologi');
    if (findings.some(f => f.includes('Audiometri'))) saranItems.push('Gunakan earplug/earmuff di area bising dan evaluasi audiometri');
    if (findings.some(f => f.includes('Spirometri'))) saranItems.push('Gunakan masker respirator dan hindari paparan debu');
    sarFisik2 = saranItems.length > 0 ? saranItems.join(', ') + '.' : 'Konsultasi dokter untuk tindak lanjut hasil penunjang.';
  }

  const intermediate = { ...current, ...tabFisik2Updates } as MCURecord;
  const syn = synthesizeConclusionAndAdvice(intermediate);

  const updatedRecord: Partial<MCURecord> = {
    ...tabFisik2Updates,
    kesimpulanFisik2: kesFisik2,
    saranFisik2: sarFisik2,
    hasilPemkes: syn.hasilPemkes,
    totalKardiovaskular: syn.totalKardiovaskular
  };

  const summaryMessage = findings.length > 0
    ? `Kesimpulan Fisik (2) & Penunjang disimpulkan & masuk ke Hasil Pemkes (${syn.hasilPemkes}). Temuan: ${findings.join(', ')}.`
    : `Kesimpulan Fisik (2) & Penunjang: DBN. Hasil Pemkes: ${syn.hasilPemkes}.`;

  return { updatedRecord, findings, summaryMessage };
}

/**
 * 4. AUTO GENERATE KESIMPULAN TAB LABORATORIUM
 * Menyimpulkan KES. URINE RUTIN dan mengevaluasi status Darah Lengkap / Hematologi
 */
export function autoGenerateTabLaboratorium(current: MCURecord): AutoSummaryResult {
  const findings: string[] = [];
  const urin = { ...(current.urinLengkap || {}) };
  const sedimen = { ...(urin.sedimen || {}) };
  const hematologi = { ...(current.hematologi || {}) };

  // --- Analisis Urin Lengkap ---
  let isUrineAbnormal = false;
  const prot = (urin.proteinAlbumin || '').toLowerCase();
  if (prot && prot !== 'negatif' && prot !== 'normal' && prot !== '-') {
    isUrineAbnormal = true;
    findings.push(`Proteinuria (${urin.proteinAlbumin})`);
  }

  const red = (urin.reduksi || urin.glukosa || '').toLowerCase();
  if (red && red !== 'negatif' && red !== 'normal' && red !== '-') {
    isUrineAbnormal = true;
    findings.push(`Glukosuria / Reduksi Urine Positif (${urin.reduksi || urin.glukosa})`);
  }

  const bili = (urin.bilirubin || '').toLowerCase();
  if (bili && bili !== 'negatif' && bili !== '-') {
    isUrineAbnormal = true;
    findings.push(`Bilirubin Urine Positif`);
  }

  const uro = (urin.urobilinogen || '').toLowerCase();
  if (uro && uro !== 'negatif' && uro !== 'normal' && uro !== '-') {
    isUrineAbnormal = true;
    findings.push(`Urobilinogen Meningkat`);
  }

  // Sedimen Urin
  const leuSed = Number(sedimen.leukosit || sedimen.lekositWbc) || 0;
  if (leuSed > 5) {
    isUrineAbnormal = true;
    findings.push(`Sedimen Leukosit Meningkat (${leuSed}/lp)`);
  }

  const eriSed = Number(sedimen.eritrosit || sedimen.eritrositRbc) || 0;
  if (eriSed > 2) {
    isUrineAbnormal = true;
    findings.push(`Sedimen Eritrosit / Hematuria (${eriSed}/lp)`);
  }

  if (sedimen.bakteri && sedimen.bakteri.toLowerCase() !== 'negatif' && sedimen.bakteri !== '-') {
    isUrineAbnormal = true;
    findings.push(`Bakteriuria (${sedimen.bakteri})`);
  }

  if (sedimen.silinder && sedimen.silinder.toLowerCase() !== 'negatif' && sedimen.silinder !== '-') {
    isUrineAbnormal = true;
    findings.push(`Silinderuria (${sedimen.silinder})`);
  }

  urin.kesUrineRutin = isUrineAbnormal ? 'TIDAK DBN' : 'DBN';

  // --- Analisis Hematologi ---
  const hb = Number(hematologi.hemoglobin) || 0;
  const isMale = current.jenisKelamin === 'L';
  if (hb > 0) {
    if (isMale && hb < 13.0) findings.push(`Anemia Ringan (Hb ${hb} g/dL)`);
    else if (!isMale && hb < 12.0) findings.push(`Anemia Ringan (Hb ${hb} g/dL)`);
    else if (hb > 18.0) findings.push(`Polisitemia (Hb ${hb} g/dL)`);
  }

  const leu = Number(hematologi.leukosit) || 0;
  if (leu > 11.5) findings.push(`Leukositosis (${leu} 10^3/uL)`);
  else if (leu > 0 && leu < 4.0) findings.push(`Leukopenia (${leu} 10^3/uL)`);

  const plt = Number(hematologi.trombosit) || 0;
  if (plt > 450) findings.push(`Trombositosis (${plt} 10^3/uL)`);
  else if (plt > 0 && plt < 140) findings.push(`Trombositopenia (${plt} 10^3/uL)`);

  const led = Number(hematologi.led) || 0;
  const ledMax = isMale ? 15 : 20;
  if (led > ledMax) findings.push(`LED Meningkat (${led} mm/jam)`);

  const tabLabUpdates: Partial<MCURecord> = {
    urinLengkap: urin as any,
    hematologi: hematologi as any
  };

  // Sintesis khusus untuk Tab LABORATORIUM
  let kesLab = '';
  let sarLab = '';
  if (findings.length === 0) {
    kesLab = 'Darah lengkap (Hb, Leukosit, Trombosit, LED) dan Urinalisis rutin dalam batas normal (DBN).';
    sarLab = 'Jaga hidrasi cairan tubuh minimal 2 liter air putih per hari, hindari menahan kencing, dan konsumsi makanan kaya zat besi.';
  } else {
    kesLab = `Temuan laboratorium: ${findings.join(', ')}.`;
    const saranItems: string[] = [];
    if (findings.some(f => f.includes('Anemia'))) saranItems.push('Tingkatkan makanan kaya zat besi & asam folat');
    if (findings.some(f => f.includes('Proteinuria') || f.includes('Sedimen') || f.includes('Bakteriuria'))) saranItems.push('Minum air putih minimal 2.5 L/hari & evaluasi urinalisis ulang');
    if (findings.some(f => f.includes('Leukositosis'))) saranItems.push('Evaluasi fokus infeksi/inflamasi');
    sarLab = saranItems.length > 0 ? saranItems.join(', ') + '.' : 'Konsultasi dokter untuk evaluasi hasil laboratorium.';
  }

  const intermediate = { ...current, ...tabLabUpdates } as MCURecord;
  const syn = synthesizeConclusionAndAdvice(intermediate);

  const updatedRecord: Partial<MCURecord> = {
    ...tabLabUpdates,
    kesimpulanLab: kesLab,
    saranLab: sarLab,
    hasilPemkes: syn.hasilPemkes,
    totalKardiovaskular: syn.totalKardiovaskular
  };

  const summaryMessage = findings.length > 0
    ? `Kesimpulan Lab disetel (${urin.kesUrineRutin}) & masuk ke Hasil Pemkes (${syn.hasilPemkes}). Temuan: ${findings.join(', ')}.`
    : `Kesimpulan Lab: Urin dan Darah Lengkap DBN. Hasil Pemkes: ${syn.hasilPemkes}.`;

  return { updatedRecord, findings, summaryMessage };
}

/**
 * 5. AUTO GENERATE KESIMPULAN TAB KIMIA KLINIK
 * Menyimpulkan KES. LAB (DBN / TIDAK DBN / ABNORMAL) dan KES. HBSAG berdasarkan fungsi organ & serologi
 */
export function autoGenerateTabKimiaKlinik(current: MCURecord): AutoSummaryResult {
  const findings: string[] = [];
  const kk = { ...(current.kimiaKlinik || {}) };
  const hati = { ...(kk.fungsiHati || {}) };
  const ginjal = { ...(kk.fungsiGinjal || {}) };
  const lipid = { ...(kk.profilLipid || {}) };
  const glukosa = { ...(kk.glukosa || {}) };
  const kes = { ...(kk.kesimpulanKimia || {}) };
  const isMale = current.jenisKelamin === 'L';

  let abnormalCount = 0;

  // 1. Fungsi Hati
  const sgot = Number(hati.sgot) || 0;
  const sgpt = Number(hati.sgpt) || 0;
  const sgotLimit = isMale ? 37 : 32;
  const sgptLimit = isMale ? 41 : 33;
  if (sgot > sgotLimit || sgpt > sgptLimit) {
    abnormalCount++;
    findings.push(`Peningkatan Enzim Hati (SGOT ${sgot || '-'}, SGPT ${sgpt || '-'} U/L)`);
  }

  const gammaGT = Number(hati.gammaGT) || 0;
  if (gammaGT > 55) {
    abnormalCount++;
    findings.push(`Gamma GT Meningkat (${gammaGT} U/L)`);
  }

  const biliTot = Number(hati.bilirubinTotal) || 0;
  if (biliTot > 1.2) {
    abnormalCount++;
    findings.push(`Bilirubin Total Meningkat (${biliTot} mg/dL)`);
  }

  // 2. Fungsi Ginjal
  const ureum = Number(ginjal.ureum) || 0;
  if (ureum > 50) {
    abnormalCount++;
    findings.push(`Ureum Darah Meningkat (${ureum} mg/dL)`);
  }

  const kreat = Number(ginjal.kreatinin) || 0;
  const kreatLimit = isMale ? 1.3 : 1.1;
  if (kreat > kreatLimit) {
    abnormalCount++;
    findings.push(`Kreatinin Serum Meningkat (${kreat} mg/dL)`);
  }

  const au = Number(ginjal.asamUrat) || 0;
  const auLimit = isMale ? 7.0 : 5.7;
  if (au > auLimit) {
    abnormalCount++;
    findings.push(`Hiperurisemia / Asam Urat Tinggi (${au} mg/dL)`);
  }

  // 3. Profil Lipid
  const kol = Number(lipid.kolesterolTotal) || 0;
  if (kol >= 240) {
    abnormalCount += 2;
    findings.push(`Hiperkolesterolemia Berat (${kol} mg/dL)`);
  } else if (kol >= 200) {
    abnormalCount++;
    findings.push(`Hiperkolesterolemia Ringan (${kol} mg/dL)`);
  }

  const tg = Number(lipid.trigliserida) || 0;
  if (tg >= 200) {
    abnormalCount++;
    findings.push(`Hipertrigliseridemia (${tg} mg/dL)`);
  } else if (tg >= 150) {
    abnormalCount++;
    findings.push(`Trigliserida Borderline High (${tg} mg/dL)`);
  }

  const ldl = Number(lipid.ldl) || 0;
  if (ldl >= 160) {
    abnormalCount++;
    findings.push(`LDL Kolesterol Tinggi (${ldl} mg/dL)`);
  } else if (ldl >= 130) {
    abnormalCount++;
    findings.push(`LDL Kolesterol Borderline (${ldl} mg/dL)`);
  }

  // 4. Glukosa
  const gdp = Number(glukosa.gdp || glukosa.gulaDarahPuasa) || 0;
  if (gdp >= 126) {
    abnormalCount += 2;
    findings.push(`Glukosa Puasa Tinggi / Suspek DM (${gdp} mg/dL)`);
  } else if (gdp >= 100) {
    abnormalCount++;
    findings.push(`Pre-Diabetes / Glukosa Puasa Terganggu (${gdp} mg/dL)`);
  }

  const gd2pp = Number(glukosa.gd2pp || glukosa.gulaDarah2JamPP) || 0;
  if (gd2pp >= 200) {
    abnormalCount += 2;
    findings.push(`Glukosa 2 Jam PP Tinggi (${gd2pp} mg/dL)`);
  } else if (gd2pp >= 140) {
    abnormalCount++;
    findings.push(`Toleransi Glukosa Terganggu 2 Jam PP (${gd2pp} mg/dL)`);
  }

  // 5. Kesimpulan HBsAg
  const hbsAgStatus = (kk.immunologi?.hbsAg || kk.serologiNarkoba?.hbsAg || '').toLowerCase();
  if (hbsAgStatus.includes('positif') || hbsAgStatus.includes('reaktif')) {
    kes.kesHbsag = 'Positif';
    abnormalCount += 2;
    findings.push('HBsAg Reaktif / Positif');
  } else {
    kes.kesHbsag = 'Negatif';
  }

  // Simpulkan KES. LAB
  if (abnormalCount === 0) {
    kes.kesLab = 'DBN';
  } else if (abnormalCount <= 2) {
    kes.kesLab = 'TIDAK DBN';
  } else {
    kes.kesLab = 'ABNORMAL';
  }

  const tabKimiaUpdates: Partial<MCURecord> = {
    kimiaKlinik: {
      ...kk,
      kesimpulanKimia: kes
    } as any
  };

  // Sintesis khusus untuk Tab KIMIA KLINIK
  let kesKimia = '';
  let sarKimia = '';
  if (findings.length === 0) {
    kesKimia = 'Fungsi hati (SGOT/SGPT), ginjal (ureum/kreatinin/asam urat), profil lipid, gula darah, dan serologi HBsAg dalam batas normal (DBN).';
    sarKimia = 'Pertahankan diet rendah lemak jenuh dan gula sederhana, konsumsi makanan berserat, serta pertahankan gaya hidup sehat.';
  } else {
    kesKimia = `Temuan kimia klinik: ${findings.join(', ')}.`;
    const saranItems: string[] = [];
    if (findings.some(f => f.includes('Kolesterol') || f.includes('Trigliserida') || f.includes('Lipid') || f.includes('LDL'))) {
      saranItems.push('Diet rendah lemak/gorengan & tingkatkan konsumsi serat');
    }
    if (findings.some(f => f.includes('Asam Urat'))) saranItems.push('Diet rendah purin & minum air putih banyak');
    if (findings.some(f => f.includes('Glukosa') || f.includes('DM'))) saranItems.push('Batasi asupan karbohidrat sederhana/manis & kontrol gula darah');
    if (findings.some(f => f.includes('Enzim Hati') || f.includes('SGOT') || f.includes('SGPT'))) saranItems.push('Hindari obat hepatotoksik & periksa faal hati ulang');
    if (findings.some(f => f.includes('HBsAg'))) saranItems.push('Konsultasi Dokter Spesialis Penyakit Dalam untuk tindak lanjut Hepatitis B');
    sarKimia = saranItems.length > 0 ? saranItems.join(', ') + '.' : 'Konsultasi dokter untuk evaluasi hasil kimia darah.';
  }

  const intermediate = { ...current, ...tabKimiaUpdates } as MCURecord;
  const syn = synthesizeConclusionAndAdvice(intermediate);

  const updatedRecord: Partial<MCURecord> = {
    ...tabKimiaUpdates,
    kesimpulanKimia: kesKimia,
    saranKimia: sarKimia,
    hasilPemkes: syn.hasilPemkes,
    totalKardiovaskular: syn.totalKardiovaskular
  };

  const summaryMessage = findings.length > 0
    ? `Kesimpulan Kimia: KES. LAB disetel ${kes.kesLab} & langsung masuk ke Hasil Pemkes (${syn.hasilPemkes}). Temuan: ${findings.join(', ')}.`
    : `Kesimpulan Kimia: Seluruh Faal Organ DBN. Hasil Pemkes: ${syn.hasilPemkes}.`;

  return { updatedRecord, findings, summaryMessage };
}

/**
 * 6. AUTO GENERATE KESIMPULAN TAB SARAN DR
 * Mengagregasi kesimpulan dari semua tab menjadi KESIMPULAN, SARAN, STATUS FIT, & RISIKO KARDIOVASKULAR
 */
export function autoGenerateTabSaranDr(current: MCURecord): AutoSummaryResult {
  const syn = synthesizeConclusionAndAdvice(current);

  const updatedRecord: Partial<MCURecord> = {
    kesimpulan: syn.kesimpulan,
    saran: syn.saran,
    hasilPemkes: syn.hasilPemkes,
    totalKardiovaskular: syn.totalKardiovaskular
  };

  const summaryMessage = syn.detectedIssues.length > 0
    ? `Disimpulkan langsung ke Hasil Pemkes (${syn.hasilPemkes}): ${syn.detectedIssues.length} catatan klinis terdeteksi.`
    : `Disimpulkan langsung ke Hasil Pemkes: Fit to Work (Semua parameter DBN).`;

  return { updatedRecord, findings: syn.detectedIssues, summaryMessage };
}

/**
 * 7. AUTO GENERATE KESIMPULAN SEMUA TAB (ALL-IN-ONE AGGREGATE)
 * Menjalankan auto-generasi kesimpulan untuk UMUM, FISIK, FISIK (2), LAB, KIMIA KLINIK, dan SARAN DR secara menyeluruh
 */
export function autoGenerateAllTabs(current: MCURecord): AutoSummaryResult {
  const r1 = autoGenerateTabUmum(current);
  const intermediate1 = { ...current, ...r1.updatedRecord } as MCURecord;

  const r2 = autoGenerateTabFisik(intermediate1);
  const intermediate2 = { ...intermediate1, ...r2.updatedRecord } as MCURecord;

  const r3 = autoGenerateTabFisik2(intermediate2);
  const intermediate3 = { ...intermediate2, ...r3.updatedRecord } as MCURecord;

  const r4 = autoGenerateTabLaboratorium(intermediate3);
  const intermediate4 = { ...intermediate3, ...r4.updatedRecord } as MCURecord;

  const r5 = autoGenerateTabKimiaKlinik(intermediate4);
  const intermediate5 = { ...intermediate4, ...r5.updatedRecord } as MCURecord;

  const r6 = autoGenerateTabSaranDr(intermediate5);

  const combinedRecord: Partial<MCURecord> = {
    ...r1.updatedRecord,
    ...r2.updatedRecord,
    ...r3.updatedRecord,
    ...r4.updatedRecord,
    ...r5.updatedRecord,
    ...r6.updatedRecord
  };

  const allFindings = Array.from(new Set([
    ...r1.findings,
    ...r2.findings,
    ...r3.findings,
    ...r4.findings,
    ...r5.findings,
    ...r6.findings
  ]));

  const summaryMessage = allFindings.length > 0
    ? `Berhasil menyimpulkan seluruh bagian (${allFindings.length} catatan klinis teridentifikasi). Status: ${r6.updatedRecord.hasilPemkes}.`
    : `Berhasil menyimpulkan seluruh bagian: Seluruh parameter Fisik, Penunjang, Lab, & Kimia Normal (DBN). Status: Fit to Work.`;

  return {
    updatedRecord: combinedRecord,
    findings: allFindings,
    summaryMessage
  };
}
