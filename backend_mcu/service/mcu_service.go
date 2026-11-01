package service

import (
	"encoding/json"
	"strconv"
	"strings"

	"backend_mcu/model"
)

type MCUService struct{}

func NewMCUService() *MCUService {
	return &MCUService{}
}

func (s *MCUService) BuildUnifiedRecord(mainRecord model.MCURecord, umum model.MCUUmum, fisik model.MCUFisik, fisik2 model.MCUFisik2, lab model.MCULab, kimia model.MCUKimia, saran model.MCUSaranDokter) map[string]any {
	parseJSONField := func(jsonStr string) map[string]any {
		res := make(map[string]any)
		if jsonStr != "" && jsonStr != "{}" {
			_ = json.Unmarshal([]byte(jsonStr), &res)
		}
		return res
	}

	umumDetail := parseJSONField(umum.DetailJson)
	fisikDetail := parseJSONField(fisik.DetailJson)
	fisik2Detail := parseJSONField(fisik2.DetailJson)
	labDetail := parseJSONField(lab.DetailJson)
	kimiaDetail := parseJSONField(kimia.DetailJson)

	keluhanSistemOrgan := umumDetail["keluhanSistemOrgan"]
	if keluhanSistemOrgan == nil {
		keluhanSistemOrgan = make(map[string]any)
	}
	riwayatPenyakitDahulu := umumDetail["riwayatPenyakitDahulu"]
	if riwayatPenyakitDahulu == nil {
		riwayatPenyakitDahulu = map[string]any{
			"riwayatOperasi":   umum.RiwayatOperasi,
			"riwayatRawatInap": umum.RiwayatRawatInap,
		}
	}
	riwayatObstetri := umumDetail["riwayatObstetri"]
	riwayatKehamilan := umumDetail["riwayatKehamilan"]
	kebiasaan := umumDetail["kebiasaan"]
	riwayatPenyakitKeluarga := umumDetail["riwayatPenyakitKeluarga"]

	tandaVital, _ := fisikDetail["tandaVital"].(map[string]any)
	if tandaVital == nil {
		tandaVital = make(map[string]any)
	}
	if fisik.TinggiBadan > 0 {
		tandaVital["tinggiBadan"] = fisik.TinggiBadan
	}
	if fisik.BeratBadan > 0 {
		tandaVital["beratBadan"] = fisik.BeratBadan
	}
	if fisik.TekananDarahSys > 0 {
		tandaVital["tekananDarahSistolik"] = fisik.TekananDarahSys
	}
	if fisik.TekananDarahDia > 0 {
		tandaVital["tekananDarahDiastolik"] = fisik.TekananDarahDia
	}
	if fisik.Nadi > 0 {
		tandaVital["nadi"] = fisik.Nadi
	}
	if fisik.Pernafasan > 0 {
		tandaVital["pernafasan"] = fisik.Pernafasan
	}
	if fisik.Suhu > 0 {
		tandaVital["suhu"] = fisik.Suhu
	}
	if fisik.Bmi > 0 {
		tandaVital["bmi"] = fisik.Bmi
	}
	if fisik.BmiKategori != "" {
		tandaVital["bmiKategori"] = fisik.BmiKategori
	}
	if fisik.LingkarPerut > 0 {
		tandaVital["lingkarPerut"] = fisik.LingkarPerut
		tandaVital["oPerut"] = fisik.LingkarPerut
	}
	if fisik.OLengan != "" {
		tandaVital["oLengan"] = fisik.OLengan
	}
	if fisik.PersenLemak != "" {
		tandaVital["persenLemak"] = fisik.PersenLemak
	}

	mata, _ := fisikDetail["mata"].(map[string]any)
	if mata == nil {
		mata = map[string]any{"kesMata": fisik.KesMata}
	}
	tht, _ := fisikDetail["tht"].(map[string]any)
	if tht == nil {
		tht = map[string]any{"kesTHT": fisik.KesTHT}
	}
	genetaliaAnorectal := fisikDetail["genetaliaAnorectal"]
	pemeriksaanLeher := fisikDetail["pemeriksaanLeher"]

	gigiMulut := fisik2Detail["gigiMulut"]
	anggotaGerak := fisik2Detail["anggotaGerak"]
	reflekFisik := fisik2Detail["reflekFisik"]
	thoraxJantung := fisik2Detail["thoraxJantung"]
	thoraxParu := fisik2Detail["thoraxParu"]
	abdomenFisik2 := fisik2Detail["abdomenFisik2"]
	tulangBelakang := fisik2Detail["tulangBelakang"]

	hematologi, _ := labDetail["hematologi"].(map[string]any)
	if hematologi == nil {
		hematologi = map[string]any{
			"hemoglobin": lab.Hb,
			"leukosit":   lab.Leukosit,
			"led":        lab.Led,
			"eritrosit":  lab.Eritrosit,
			"trombosit":  lab.Trombosit,
			"hematokrit": lab.Hematokrit,
			"malaria":    lab.Malaria,
		}
	}

	urinLengkapMap, _ := labDetail["urinLengkap"].(map[string]any)
	if urinLengkapMap == nil {
		urinLengkapMap = make(map[string]any)
	}
	if urinLengkapMap["kesUrineRutin"] == nil {
		if lab.KesUrineRutin != "" && lab.KesUrineRutin != "<nil>" {
			urinLengkapMap["kesUrineRutin"] = lab.KesUrineRutin
		} else {
			urinLengkapMap["kesUrineRutin"] = "DBN"
		}
	}
	kristalDetail := labDetail["kristalDetail"]

	kimiaKlinikSub, _ := kimiaDetail["kimiaKlinik"].(map[string]any)
	if kimiaKlinikSub == nil {
		kimiaKlinikSub = make(map[string]any)
	}

	if glukosaSub, ok := kimiaKlinikSub["glukosa"].(map[string]any); ok {
		cleanGlukosa := make(map[string]any)
		for k, v := range glukosaSub {
			// Hapus key gdp, gd2pp, gulaDarahPuasa, & gulaDarah2JamPP dari sub-map glukosa
			if k != "gdp" && k != "gd2pp" && k != "gulaDarahPuasa" && k != "gulaDarah2JamPP" {
				cleanGlukosa[k] = v
			}
		}
		kimiaKlinikSub["glukosa"] = cleanGlukosa
	}

	return map[string]any{
		"id":                   mainRecord.ID,
		"employeeId":           mainRecord.EmployeeID,
		"isSpouse":             mainRecord.PatientType == "SPOUSE",
		"tanggal":              mainRecord.Tanggal,
		"umur":                 mainRecord.Umur,
		"golDarah":             mainRecord.GolDarah,
		"shift":                mainRecord.Shift,
		"bagian":               mainRecord.Bagian,
		"dokter":               mainRecord.Dokter,
		"testTahun":            mainRecord.TestTahun,
		"jenisKelamin":         mainRecord.JenisKelamin,
		"periodeMCU":           mainRecord.PeriodeMCU,
		"tanggalMCUBerikutnya": mainRecord.TanggalMCUBerikutnya,
		"hasilPemkes":          mainRecord.HasilPemkes,
		"totalKardiovaskular":  saran.TotalKardiovaskular,

		"keluhanSekarang":            umum.KeluhanSekarang,
		"riwayatPenyakit":            umum.RiwayatPenyakit,
		"alergiObat":                 umum.AlergiObat,
		"alergiMakanan":              umum.AlergiMakanan,
		"riwayatPenyakitAkibatKerja": umum.RiwayatPenyakitAkibatKerja,
		"riwayatKecelakaanKerja":     umum.RiwayatKecelakaanKerja,
		"riwayatPengobatanRutin":     umum.RiwayatPengobatanRutin,
		"riwayatVaksinasi":           umum.RiwayatVaksinasi,
		"riwayatOperasi":             umum.RiwayatOperasi,
		"riwayatRawatInap":           umum.RiwayatRawatInap,
		"kesimpulanUmum":             umum.KesimpulanUmum,
		"saranUmum":                  umum.SaranUmum,
		"keluhanSistemOrgan":         keluhanSistemOrgan,
		"riwayatPenyakitDahulu":      riwayatPenyakitDahulu,
		"riwayatObstetri":            riwayatObstetri,
		"riwayatKehamilan":           riwayatKehamilan,
		"kebiasaan":                  kebiasaan,
		"riwayatPenyakitKeluarga":    riwayatPenyakitKeluarga,

		"tinggiBadan":     fisik.TinggiBadan,
		"beratBadan":      fisik.BeratBadan,
		"tekananDarahSys": fisik.TekananDarahSys,
		"tekananDarahDia": fisik.TekananDarahDia,
		"nadi":            fisik.Nadi,
		"pernafasan":      fisik.Pernafasan,
		"suhu":            fisik.Suhu,
		"bmi":             fisik.Bmi,
		"bmiKategori":     fisik.BmiKategori,
		"lingkarPerut":    fisik.LingkarPerut,
		"kesimpulanFisik": fisik.KesimpulanFisik,
		"saranFisik":      fisik.SaranFisik,

		"tandaVital":         tandaVital,
		"mata":               mata,
		"tht":                tht,
		"genetaliaAnorectal": genetaliaAnorectal,
		"pemeriksaanLeher":   pemeriksaanLeher,

		"kesimpulanFisik2": fisik2.KesimpulanFisik2,
		"saranFisik2":      fisik2.SaranFisik2,
		"gigiMulut":        gigiMulut,
		"anggotaGerak":     anggotaGerak,
		"reflekFisik":      reflekFisik,
		"thoraxJantung":    thoraxJantung,
		"thoraxParu":       thoraxParu,
		"abdomenFisik2":    abdomenFisik2,
		"tulangBelakang":   tulangBelakang,
		"kesimpulanPenunjang": map[string]any{
			"kesTreadmill":  fisik2.KesTreadmill,
			"kesEkg":        fisik2.KesEkg,
			"kesUsgAbd":     fisik2.KesUsgAbd,
			"kesAudiometri": fisik2.KesAudiometri,
			"kesFotoThorax": fisik2.KesFotoThorax,
			"kesAutospiro":  fisik2.KesAutospiro,
		},

		"hb":            lab.Hb,
		"leukosit":      lab.Leukosit,
		"led":           lab.Led,
		"eritrosit":     lab.Eritrosit,
		"trombosit":     lab.Trombosit,
		"hematokrit":    lab.Hematokrit,
		"malaria":       lab.Malaria,
		"kesimpulanLab": lab.KesimpulanLab,
		"saranLab":      lab.SaranLab,
		"hematologi":    hematologi,
		"urinLengkap":   urinLengkapMap,
		"kristalDetail": kristalDetail,

		"gulaDarahPuasa":  kimia.GulaDarahPuasa,
		"gulaDarah2JamPP": kimia.GulaDarah2JamPP,
		"kesimpulanKimia": kimia.KesimpulanKimia,
		"saranKimia":      kimia.SaranKimia,
		"kimiaKlinik":     kimiaKlinikSub,

		"kesimpulan": saran.Kesimpulan,
		"saran":      saran.Saran,
	}
}

func (s *MCUService) ParseDetailJSON(val any) string {
	if val == nil {
		return "{}"
	}
	bytes, err := json.Marshal(val)
	if err != nil {
		return "{}"
	}
	return string(bytes)
}

func (s *MCUService) ParseToInt(val any) int {
	if val == nil {
		return 0
	}
	switch v := val.(type) {
	case float64:
		return int(v)
	case int:
		return v
	case string:
		cleanStr := strings.TrimSpace(v)
		res, err := strconv.Atoi(cleanStr)
		if err != nil {
			if f, errFloat := strconv.ParseFloat(cleanStr, 64); errFloat == nil {
				return int(f)
			}
			return 0
		}
		return res
	default:
		return 0
	}
}

func (s *MCUService) ParseToFloat(val any) float64 {
	if val == nil {
		return 0.0
	}
	switch v := val.(type) {
	case float64:
		return v
	case int:
		return float64(v)
	case string:
		cleanStr := strings.TrimSpace(v)
		res, err := strconv.ParseFloat(cleanStr, 64)
		if err != nil {
			return 0.0
		}
		return res
	default:
		return 0.0
	}
}

func (s *MCUService) CoalesceStr(newVal, oldVal string) string {
	if newVal == "" || newVal == "false" || newVal == "<nil>" || newVal == "0" {
		if oldVal != "" {
			return oldVal
		}
		return ""
	}
	return newVal
}

func (s *MCUService) CoalesceInt(newVal, oldVal int) int {
	if newVal == 0 {
		if oldVal != 0 {
			return oldVal
		}
		return 0
	}
	return newVal
}

func (s *MCUService) CoalesceFloat(newVal, oldVal float64) float64 {
	if newVal == 0.0 {
		if oldVal != 0.0 {
			return oldVal
		}
		return 0.0
	}
	return newVal
}
