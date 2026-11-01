package dto

type FrontendMCURequest struct {
	ID                   any    `json:"id"`
	Badge                string `json:"badge"`
	Nama                 string `json:"nama"`
	IsSpouse             bool   `json:"isSpouse"`
	Tanggal              string `json:"tanggal"`
	Umur                 int    `json:"umur"`
	GolDarah             string `json:"golDarah"`
	Shift                string `json:"shift"`
	Bagian               string `json:"bagian"`
	Dokter               string `json:"dokter"`
	TestTahun            any    `json:"testTahun"`
	JenisKelamin         string `json:"jenisKelamin"`
	PeriodeMCU           string `json:"periodeMCU"`
	TanggalMCUBerikutnya string `json:"tanggalMCUBerikutnya"`
	HasilPemkes          string `json:"hasilPemkes"`
	TotalKardiovaskular  string `json:"totalKardiovaskular"`

	KeluhanSekarang            string `json:"keluhanSekarang"`
	RiwayatPenyakit            string `json:"riwayatPenyakit"`
	AlergiObat                 string `json:"alergiObat"`
	AlergiObatKeterangan       string `json:"alergiObatKeterangan"`
	AlergiMakanan              string `json:"alergiMakanan"`
	RiwayatPenyakitAkibatKerja string `json:"riwayatPenyakitAkibatKerja"`
	RiwayatKecelakaanKerja     string `json:"riwayatKecelakaanKerja"`
	RiwayatPengobatanRutin     string `json:"riwayatPengobatanRutin"`
	RiwayatVaksinasi           string `json:"riwayatVaksinasi"`

	RiwayatPenyakitDahulu   map[string]any `json:"riwayatPenyakitDahulu"`
	ChecklistPenyakitDahulu any            `json:"checklistPenyakitDahulu"`
	RiwayatObstetri         any            `json:"riwayatObstetri"`
	RiwayatKehamilan        any            `json:"riwayatKehamilan"`
	KeluhanSistemOrgan      any            `json:"keluhanSistemOrgan"`
	RiwayatPenyakitKeluarga any            `json:"riwayatPenyakitKeluarga"`
	Kebiasaan               any            `json:"kebiasaan"`
	KesimpulanUmum          string         `json:"kesimpulanUmum"`
	SaranUmum               string         `json:"saranUmum"`

	TandaVital         map[string]any `json:"tandaVital"`
	Mata               map[string]any `json:"mata"`
	Tht                map[string]any `json:"tht"`
	GenetaliaAnorectal map[string]any `json:"genetaliaAnorectal"`
	PemeriksaanLeher   map[string]any `json:"pemeriksaanLeher"`

	KesimpulanFisik string `json:"kesimpulanFisik"`
	SaranFisik      string `json:"saranFisik"`

	ThoraxJantung  map[string]any `json:"thoraxJantung"`
	ThoraxParu     map[string]any `json:"thoraxParu"`
	GigiMulut      any            `json:"gigiMulut"`
	AnggotaGerak   any            `json:"anggotaGerak"`
	ReflekFisik    any            `json:"reflekFisik"`
	AbdomenFisik2  any            `json:"abdomenFisik2"`
	TulangBelakang any            `json:"tulangBelakang"`

	KesimpulanPenunjang struct {
		KesTreadmill  string `json:"kesTreadmill"`
		KesEkg        string `json:"kesEkg"`
		KesUsgAbd     string `json:"kesUsgAbd"`
		KesAudiometri string `json:"kesAudiometri"`
		KesFotoThorax string `json:"kesFotoThorax"`
		KesAutospiro  string `json:"kesAutospiro"`
	} `json:"kesimpulanPenunjang"`

	KesimpulanFisik2 string `json:"kesimpulanFisik2"`
	SaranFisik2      string `json:"saranFisik2"`

	Hematologi    map[string]any `json:"hematologi"`
	UrinLengkap   map[string]any `json:"urinLengkap"`
	KristalDetail map[string]any `json:"kristalDetail"`

	KesimpulanLab string `json:"kesimpulanLab"`
	SaranLab      string `json:"saranLab"`

	KimiaKlinik map[string]any `json:"kimiaKlinik"`

	KesimpulanKimia  string `json:"kesimpulanKimia"`
	SaranKimia       string `json:"saranKimia"`
	KesimpulanGlobal string `json:"kesimpulan"`
	SaranGlobal      string `json:"saran"`
}
