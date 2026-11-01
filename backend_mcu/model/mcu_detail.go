package model

type MCUUmum struct {
	MCURecordID                uint   `gorm:"primaryKey;column:mcu_record_id" json:"mcuRecordId"`
	KeluhanSekarang            string `gorm:"type:text;column:keluhan_sekarang" json:"keluhanSekarang"`
	RiwayatPenyakit            string `gorm:"type:text;column:riwayat_penyakit" json:"riwayatPenyakit"`
	AlergiObat                 string `gorm:"type:varchar(255);column:alergi_obat" json:"alergiObat"`
	AlergiMakanan              string `gorm:"type:varchar(255);column:alergi_makanan" json:"alergiMakanan"`
	RiwayatPenyakitAkibatKerja string `gorm:"type:text;column:riwayat_penyakit_akibat_kerja" json:"riwayatPenyakitAkibatKerja"`
	RiwayatKecelakaanKerja     string `gorm:"type:text;column:riwayat_kecelakaan_kerja" json:"riwayatKecelakaanKerja"`
	RiwayatPengobatanRutin     string `gorm:"type:text;column:riwayat_pengobatan_rutin" json:"riwayatPengobatanRutin"`
	RiwayatVaksinasi           string `gorm:"type:text;column:riwayat_vaksinasi" json:"riwayatVaksinasi"`
	RiwayatOperasi             string `gorm:"type:text;column:riwayat_operasi" json:"riwayatOperasi"`
	RiwayatRawatInap           string `gorm:"type:text;column:riwayat_rawat_inap" json:"riwayatRawatInap"`
	KesimpulanUmum             string `gorm:"type:text;column:kesimpulan_umum" json:"kesimpulanUmum"`
	SaranUmum                  string `gorm:"type:text;column:saran_umum" json:"saranUmum"`
	DetailJson                 string `gorm:"type:text;column:detail_json" json:"detailjson,omitempty"`
}

func (MCUUmum) TableName() string { return "mcu_umum" }

type MCUFisik struct {
	MCURecordID     uint    `gorm:"primaryKey;column:mcu_record_id" json:"mcuRecordId"`
	TinggiBadan     int     `gorm:"column:tinggi_badan" json:"tinggiBadan"`
	BeratBadan      int     `gorm:"column:berat_badan" json:"beratBadan"`
	TekananDarahSys int     `gorm:"column:tekanan_darah_sys" json:"tekananDarahSys"`
	TekananDarahDia int     `gorm:"column:tekanan_darah_dia" json:"tekananDarahDia"`
	Nadi            int     `gorm:"column:nadi" json:"nadi"`
	Pernafasan      int     `gorm:"column:pernafasan" json:"pernafasan"`
	Suhu            float64 `gorm:"column:suhu" json:"suhu"`
	Bmi             float64 `gorm:"column:bmi" json:"bmi"`
	BmiKategori     string  `gorm:"type:varchar(50);column:bmi_kategori" json:"bmiKategori"`
	LingkarPerut    int     `gorm:"column:lingkar_perut" json:"lingkarPerut"`
	OLengan         string  `gorm:"type:varchar(20);column:o_lengan" json:"oLengan"`
	PersenLemak     string  `gorm:"type:varchar(20);column:persen_lemak" json:"persenLemak"`
	KesMata         string  `gorm:"type:varchar(50);column:kes_mata" json:"kesMata"`
	KesTHT          string  `gorm:"type:varchar(50);column:kes_tht" json:"kesTHT"`
	KesFisik        string  `gorm:"type:varchar(50);column:kes_fisik" json:"kesFisik"`
	KesimpulanFisik string  `gorm:"type:text;column:kesimpulan_fisik" json:"kesimpulanFisik"`
	SaranFisik      string  `gorm:"type:text;column:saran_fisik" json:"saranFisik"`
	DetailJson      string  `gorm:"type:text;column:detail_json" json:"detailJson,omitempty"`
}

func (MCUFisik) TableName() string { return "mcu_fisik" }

type MCUFisik2 struct {
	MCURecordID      uint   `gorm:"primaryKey;column:mcu_record_id" json:"mcuRecordId"`
	KesTreadmill     string `gorm:"type:varchar(50);column:kes_treadmill" json:"kesTreadmill"`
	KesEkg           string `gorm:"type:varchar(50);column:kes_ecg" json:"kesEkg"`
	KesUsgAbd        string `gorm:"type:varchar(50);column:kes_usg_abd" json:"kesUsgAbd"`
	KesAudiometri    string `gorm:"type:varchar(50);column:kes_audiometri" json:"kesAudiometri"`
	KesFotoThorax    string `gorm:"type:varchar(50);column:kes_foto_thorax" json:"kesFotoThorax"`
	KesAutospiro     string `gorm:"type:varchar(50);column:kes_autospiro" json:"kesAutospiro"`
	KesimpulanFisik2 string `gorm:"type:text;column:kesimpulan_fisik2" json:"kesimpulanFisik2"`
	SaranFisik2      string `gorm:"type:text;column:saran_fisik2" json:"saranFisik2"`
	DetailJson       string `gorm:"type:text;column:detail_json" json:"detailJson,omitempty"`
}

func (MCUFisik2) TableName() string { return "mcu_fisik2" }

type MCULab struct {
	MCURecordID   uint    `gorm:"primaryKey;column:mcu_record_id" json:"mcuRecordId"`
	Hb            float64 `gorm:"column:hb" json:"hb"`
	Leukosit      int     `gorm:"column:leukosit" json:"leukosit"`
	Led           int     `gorm:"column:led" json:"led"`
	Eritrosit     float64 `gorm:"column:eritrosit" json:"eritrosit"`
	Trombosit     int     `gorm:"column:trombosit" json:"trombosit"`
	Hematokrit    float64 `gorm:"column:hematokrit" json:"hematokrit"`
	Malaria       string  `gorm:"type:varchar(30);column:malaria" json:"malaria"`
	KesUrineRutin string  `gorm:"type:varchar(50);column:kes_urine_rutin" json:"kesUrineRutin"`
	KesimpulanLab string  `gorm:"type:text;column:kesimpulan_lab" json:"kesimpulanLab"`
	SaranLab      string  `gorm:"type:text;column:saran_lab" json:"saranLab"`
	DetailJson    string  `gorm:"type:text;column:detail_json" json:"detailJson"`
}

func (MCULab) TableName() string { return "mcu_lab" }

type MCUKimia struct {
	MCURecordID     uint    `gorm:"primaryKey;column:mcu_record_id" json:"mcuRecordId"`
	Sgot            int     `gorm:"column:sgot" json:"sgot"`
	Sgpt            int     `gorm:"column:sgpt" json:"sgpt"`
	BilirubinTotal  float64 `gorm:"column:bilirubin_total" json:"bilirubinTotal"`
	KolesterolTotal int     `gorm:"column:kolesterol_total" json:"kolesterolTotal"`
	Trigliserida    int     `gorm:"column:trigliserida" json:"trigliserida"`
	Hdl             int     `gorm:"column:hdl" json:"hdl"`
	Ldl             int     `gorm:"column:ldl" json:"ldl"`
	Ureum           int     `gorm:"column:ureum" json:"ureum"`
	Kreatinin       float64 `gorm:"column:kreatinin" json:"kreatinin"`
	AsamUrat        float64 `gorm:"column:asam_urat" json:"asamUrat"`
	GulaDarahPuasa  int     `gorm:"column:gula_darah_puasa" json:"gulaDarahPuasa"`
	GulaDarah2JamPP int     `gorm:"column:gula_darah_2_jam_pp" json:"gulaDarah2JamPP"`
	KesLab          string  `gorm:"type:varchar(50);column:kes_lab" json:"kesLab"`
	KesHbsag        string  `gorm:"type:varchar(50);column:kes_hbsag" json:"kesHbsag"`
	KesimpulanKimia string  `gorm:"type:text;column:kesimpulan_kimia" json:"kesimpulanKimia"`
	SaranKimia      string  `gorm:"type:text;column:saran_kimia" json:"saranKimia"`
	DetailJson      string  `gorm:"type:text;column:detail_json" json:"detailJson,omitempty"`
}

func (MCUKimia) TableName() string { return "mcu_kimia" }

type MCUSaranDokter struct {
	MCURecordID         uint   `gorm:"primaryKey;column:mcu_record_id" json:"mcuRecordId"`
	Kesimpulan          string `gorm:"type:text;column:kesimpulan" json:"kesimpulan"`
	Saran               string `gorm:"type:text;column:saran" json:"saran"`
	TotalKardiovaskular string `gorm:"type:varchar(50);column:total_kardiovaskular" json:"totalKardiovaskular"`
}

func (MCUSaranDokter) TableName() string { return "mcu_saran_dokter" }
