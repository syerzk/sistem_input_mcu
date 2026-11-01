package handler

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"backend_mcu/dto"
	"backend_mcu/model"
	"backend_mcu/repository"
	"backend_mcu/service"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type MCUHandler struct {
	db         *gorm.DB
	mcuRepo    *repository.MCURepository
	adminRepo  *repository.AdminRepository
	doctorRepo *repository.DoctorRepository
	service    *service.MCUService
}

func NewMCUHandler(db *gorm.DB, mcuRepo *repository.MCURepository, adminRepo *repository.AdminRepository, doctorRepo *repository.DoctorRepository, svc *service.MCUService) *MCUHandler {
	return &MCUHandler{
		db:         db,
		mcuRepo:    mcuRepo,
		adminRepo:  adminRepo,
		doctorRepo: doctorRepo,
		service:    svc,
	}
}

func SendJSON(w http.ResponseWriter, status int, payload dto.JSONResponse) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(payload)
}

func (h *MCUHandler) HandleHealth(w http.ResponseWriter, r *http.Request) {
	var sqlDb, err = h.db.DB()
	dbStatus := "Connected"
	if err != nil || sqlDb.Ping() != nil {
		dbStatus = "Disconnected"
	}
	SendJSON(w, http.StatusOK, dto.JSONResponse{
		Success: true,
		Message: "Database Online",
		Data: map[string]interface{}{
			"dbStatus": dbStatus,
		},
	})
}

func (h *MCUHandler) HandleVerifyPin(w http.ResponseWriter, r *http.Request) {
	r.Body = http.MaxBytesReader(w, r.Body, 2<<20)
	var payload dto.AdminAuthPayload
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		SendJSON(w, http.StatusBadRequest, dto.JSONResponse{Success: false, Error: "Format request salah"})
		return
	}

	admin, err := h.adminRepo.GetAdminByUsername("admin")
	if err != nil {
		SendJSON(w, http.StatusUnauthorized, dto.JSONResponse{Success: false, Error: "Data admin tidak ditemukan"})
		return
	}
	if err := bcrypt.CompareHashAndPassword([]byte(admin.PasswordHash), []byte(payload.Pin)); err != nil {
		SendJSON(w, http.StatusUnauthorized, dto.JSONResponse{Success: false, Error: "PIN Salah"})
		return
	}

	SendJSON(w, http.StatusOK, dto.JSONResponse{Success: true, Message: "Valid"})

}

func (h *MCUHandler) HandleChangePin(w http.ResponseWriter, r *http.Request) {
	r.Body = http.MaxBytesReader(w, r.Body, 2<<20)
	var payload struct {
		OldPin string `json:"oldPin"`
		NewPin string `json:"newPin"`
	}

	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		SendJSON(w, http.StatusBadRequest, dto.JSONResponse{Success: false, Error: "Format request salah"})
		return
	}

	admin, err := h.adminRepo.GetAdminByUsername("admin")
	if err != nil {
		SendJSON(w, http.StatusUnauthorized, dto.JSONResponse{Success: false, Error: "Data admin tidak ditemukan di database"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(admin.PasswordHash), []byte(payload.OldPin)); err != nil {
		SendJSON(w, http.StatusUnauthorized, dto.JSONResponse{Success: false, Error: "PIN Lama salah! Perubahan ditolak."})
		return
	}

	if len(payload.NewPin) < 4 {
		SendJSON(w, http.StatusBadRequest, dto.JSONResponse{Success: false, Error: "PIN baru minimal 4 karakter"})
		return
	}

	hashedPin, err := bcrypt.GenerateFromPassword([]byte(payload.NewPin), bcrypt.DefaultCost)
	if err != nil {
		SendJSON(w, http.StatusInternalServerError, dto.JSONResponse{Success: false, Error: "Gagal memproses PIN baru"})
		return
	}

	if err := h.adminRepo.UpdateAdminPassword("admin", string(hashedPin)); err != nil {
		SendJSON(w, http.StatusInternalServerError, dto.JSONResponse{Success: false, Error: "Gagal menyimpan PIN baru"})
		return
	}

	SendJSON(w, http.StatusOK, dto.JSONResponse{Success: true, Message: "PIN Berhasil Diperbarui ke Bcrypt!"})
}

func (h *MCUHandler) HandleGetRecords(w http.ResponseWriter, r *http.Request) {
	mainRecords, err := h.mcuRepo.FindAllRecords()
	if err != nil {
		SendJSON(w, http.StatusInternalServerError, dto.JSONResponse{Success: false, Error: err.Error()})
		return
	}

	var unifiedList []map[string]any
	for _, mainRecord := range mainRecords {
		emp := mainRecord.Employee

		umum, fisik, fisik2, lab, kimia, saran := h.mcuRepo.GetMCUDetails(mainRecord.ID)
		unifiedRecord := h.service.BuildUnifiedRecord(mainRecord, umum, fisik, fisik2, lab, kimia, saran)

		unifiedRecord["badge"] = emp.Badge

		if mainRecord.PatientType == "EMPLOYEE" {
			unifiedRecord["nama"] = emp.Nama
		} else {
			var spouse model.Spouse
			if mainRecord.SpouseID != nil {
				_ = h.db.Where("id = ?", *mainRecord.SpouseID).First(&spouse).Error
			} else {
				_ = h.db.Where("employee_id = ?", emp.ID).First(&spouse).Error
			}

			if spouse.Nama != "" {
				unifiedRecord["nama"] = spouse.Nama
			} else {
				unifiedRecord["nama"] = ""
			}
		}
		unifiedList = append(unifiedList, unifiedRecord)
	}

	SendJSON(w, http.StatusOK, dto.JSONResponse{Success: true, Data: unifiedList})
}

func (h *MCUHandler) HandleGetRecordByBadge(w http.ResponseWriter, r *http.Request, badge string) {
	isSpouseStr := r.URL.Query().Get("is_spouse")
	testYearStr := r.URL.Query().Get("test_tahun")

	if testYearStr == "" {
		testYearStr = r.URL.Query().Get("tahun") // Fallback fleksibel jika FE mengirim "tahun"
	}

	testYearInt := h.service.ParseToInt(testYearStr)
	if testYearInt == 0 {
		testYearInt = 2026 // Default running year MCU
	}

	patientType := "EMPLOYEE"
	if isSpouseStr == "true" {
		patientType = "SPOUSE"
	}

	// Step 1: Cari Karyawan berdasarkan Badge di tabel 'employees'
	var emp model.Employee
	if err := h.db.Where("badge = ?", badge).First(&emp).Error; err != nil {
		SendJSON(w, http.StatusNotFound, dto.JSONResponse{
			Success: false,
			Error:   "Karyawan dengan nomor badge " + badge + " tidak ditemukan di database",
		})
		return
	}

	// Step 2: Cari Rekam Medis berdasarkan employee_id + patient_type + test_tahun
	var mainRecord model.MCURecord
	dbQuery := h.db.Where("employee_id = ? AND patient_type = ?", emp.ID, patientType)

	if testYearStr != "" {
		dbQuery = dbQuery.Where("test_tahun = ?", testYearInt)
	}

	err := dbQuery.Order("test_tahun DESC, created_at DESC").First(&mainRecord).Error
	if err != nil {

		targetNama := emp.Nama
		var spouseID *uint = nil

		// Cari riwayat MCU terakhir untuk mengambil tanggal/bulan rutin sebelumnya
		var lastRecord model.MCURecord
		_ = h.db.Where("employee_id = ? AND patient_type = ?", emp.ID, patientType).
			Order("test_tahun DESC, created_at DESC").First(&lastRecord).Error

		// Otomatisasi Tanggal: Ambil tanggal & bulan rutin terakhir, ganti tahunnya ke testYearInt
		defaultTanggal := fmt.Sprintf("%d-01-01", testYearInt)
		if lastRecord.Tanggal != "" && len(lastRecord.Tanggal) >= 10 {
			defaultTanggal = fmt.Sprintf("%d%s", testYearInt, lastRecord.Tanggal[4:10])
		}

		// Otomatisasi Periode MCU berdasarkan Jenis Kelamin
		periodeDefault := "1 Tahun"
		if emp.JenisKelamin == "P" {
			periodeDefault = "2 Tahun"
		}

		calculatedUmur := emp.Umur
		if lastRecord.ID > 0 && lastRecord.TestTahun > 0 && lastRecord.Umur > 0 {
			selisihTahun := testYearInt - lastRecord.TestTahun
			if selisihTahun > 0 {
				calculatedUmur = lastRecord.Umur + selisihTahun
			} else {
				calculatedUmur = lastRecord.Umur
			}
		}

		if patientType == "SPOUSE" {
			var spouse model.Spouse
			errSpouse := h.db.Where("employee_id = ?", emp.ID).Order("id DESC").First(&spouse).Error
			if errSpouse == nil {
				targetNama = spouse.Nama
				spouseID = &spouse.ID

				if lastRecord.ID == 0 && spouse.Umur > 0 {
					calculatedUmur = spouse.Umur
				}

			} else {
				targetNama = "" // Belum ada pasangan terdaftar
			}
		}

		// Draft Form Kosong Lengkap (Presisi sesuai json tag FrontendMCURequest)
		draftRecord := map[string]any{
			// Header & Identitas Utama
			"id":                   0, // 0 menandakan record baru
			"badge":                emp.Badge,
			"nama":                 targetNama, // Nama Karyawan atau Pasangan Terakhir
			"isSpouse":             patientType == "SPOUSE",
			"spouseId":             spouseID,
			"tanggal":              defaultTanggal, // Tanggal rutin terisi otomatis di tahun baru
			"umur":                 calculatedUmur,
			"golDarah":             emp.GolDarah,
			"shift":                emp.Shift,
			"bagian":               emp.Bagian,
			"dokter":               "",
			"testTahun":            testYearInt,
			"jenisKelamin":         emp.JenisKelamin,
			"periodeMCU":           periodeDefault, // Otomatis 1 Thn / 2 Thn
			"tanggalMCUBerikutnya": lastRecord.TanggalMCUBerikutnya,
			"hasilPemkes":          "",
			"totalKardiovaskular":  "",

			// Gula Darah (Kimia Klinik)
			"gulaDarahPuasa":  0,
			"gulaDarah2JamPP": 0,

			// 1. Tab UMUM
			"keluhanSekarang":            "",
			"riwayatPenyakit":            "",
			"alergiObat":                 "",
			"alergiObatKeterangan":       "",
			"alergiMakanan":              "",
			"riwayatPenyakitAkibatKerja": "",
			"riwayatKecelakaanKerja":     "",
			"riwayatPengobatanRutin":     "",
			"riwayatVaksinasi":           "",
			"riwayatPenyakitDahulu":      map[string]any{},
			"checklistPenyakitDahulu":    map[string]any{},
			"riwayatObstetri":            map[string]any{},
			"riwayatKehamilan":           "",
			"keluhanSistemOrgan":         map[string]any{},
			"riwayatPenyakitKeluarga":    map[string]any{},
			"kebiasaan":                  map[string]any{},
			"kesimpulanUmum":             "",
			"saranUmum":                  "",

			// 2. Tab FISIK (1)
			"tandaVital":         map[string]any{},
			"mata":               map[string]any{},
			"tht":                map[string]any{},
			"genetaliaAnorectal": map[string]any{},
			"pemeriksaanLeher":   map[string]any{},
			"kesimpulanFisik":    "",
			"saranFisik":         "",

			// 3. Tab FISIK (2)
			"thoraxJantung":  map[string]any{},
			"thoraxParu":     map[string]any{},
			"gigiMulut":      map[string]any{},
			"anggotaGerak":   map[string]any{},
			"reflekFisik":    map[string]any{},
			"abdomenFisik2":  map[string]any{},
			"tulangBelakang": map[string]any{},
			"kesimpulanPenunjang": map[string]any{
				"kesTreadmill":  "",
				"kesEkg":        "",
				"kesUsgAbd":     "",
				"kesAudiometri": "",
				"kesFotoThorax": "",
				"kesAutospiro":  "",
			},
			"kesimpulanFisik2": "",
			"saranFisik2":      "",

			// 4. Tab LABORATORIUM
			"hematologi":    map[string]any{},
			"urinLengkap":   map[string]any{},
			"kristalDetail": map[string]any{},
			"kesimpulanLab": "",
			"saranLab":      "",

			// 5. Tab KIMIA KLINIK
			"kimiaKlinik":     map[string]any{},
			"kesimpulanKimia": "",
			"saranKimia":      "",

			// 6. Tab SARAN DOKTER & REKAPAN GLOBAL
			"kesimpulan": "", // Sesuai json:"kesimpulan"
			"saran":      "", // Sesuai json:"saran"
		}

		SendJSON(w, http.StatusOK, dto.JSONResponse{
			Success: true,
			Message: fmt.Sprintf("Form MCU %s tahun %d siap diisi (Header Terisi, Detail Kosong)", patientType, testYearInt),
			Data:    draftRecord,
		})
		return
	}

	// Step 3: Ambil rincian 6 tabel detail dan gabungkan
	umum, fisik, fisik2, lab, kimia, saran := h.mcuRepo.GetMCUDetails(mainRecord.ID)
	unifiedRecord := h.service.BuildUnifiedRecord(mainRecord, umum, fisik, fisik2, lab, kimia, saran)

	// Step 4: Set Badge & Nama terpisah
	unifiedRecord["badge"] = emp.Badge

	if patientType == "EMPLOYEE" {
		unifiedRecord["nama"] = emp.Nama
	} else {
		// Jika Pasangan (SPOUSE), ambil nama aslinya dari tabel 'spouses'
		var spouse model.Spouse
		if mainRecord.SpouseID != nil {
			_ = h.db.Where("id = ?", *mainRecord.SpouseID).First(&spouse).Error
		} else {
			_ = h.db.Where("employee_id = ?", emp.ID).Order("id DESC").First(&spouse).Error
		}

		if spouse.ID > 0 && spouse.Nama != "" {
			unifiedRecord["nama"] = spouse.Nama
		} else {
			unifiedRecord["nama"] = "" // Kosongkan agar form siap diinput nama istri baru
		}
	}

	SendJSON(w, http.StatusOK, dto.JSONResponse{
		Success: true,
		Data:    unifiedRecord,
	})
}

func (h *MCUHandler) HandleSaveRecord(w http.ResponseWriter, r *http.Request) {
	r.Body = http.MaxBytesReader(w, r.Body, 2<<20)
	var req dto.FrontendMCURequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		SendJSON(w, http.StatusBadRequest, dto.JSONResponse{Success: false, Error: "Format JSON salah"})
		return
	}

	testYear := req.TestTahun
	if (testYear == nil || fmt.Sprintf("%v", testYear) == "") && len(req.Tanggal) >= 4 {
		testYear = req.Tanggal[:4]
	}
	if testYear == nil || fmt.Sprintf("%v", testYear) == "" {
		testYear = "2026"
	}
	req.TestTahun = testYear

	testYearInt := h.service.ParseToInt(testYear)
	if testYearInt == 0 {
		testYearInt = 2026
	}

	getKimiaSubMap := func(key string) map[string]any {
		if req.KimiaKlinik == nil {
			return map[string]any{}
		}
		if sub, ok := req.KimiaKlinik[key].(map[string]any); ok {
			return sub
		}
		return map[string]any{}
	}

	fungsiHati := getKimiaSubMap("fungsiHati")
	fungsiGinjal := getKimiaSubMap("fungsiGinjal")
	profilLipid := getKimiaSubMap("profilLipid")
	kesKimiaSub := getKimiaSubMap("kesimpulanKimia")

	glukosaSub := getKimiaSubMap("glukosa")

	// Ambil nilai GDP dan GD2PP langsung dari sub-map glukosa (dengan fallback key fleksibel)
	var gdp any = glukosaSub["gulaDarahPuasa"]
	if gdp == nil || fmt.Sprintf("%v", gdp) == "" {
		gdp = glukosaSub["gdp"]
	}

	var gd2pp any = glukosaSub["gulaDarah2JamPP"]
	if gd2pp == nil || fmt.Sprintf("%v", gd2pp) == "" {
		gd2pp = glukosaSub["gd2pp"]
	}

	getVal := func(m map[string]any, k string) any {
		if m == nil {
			return nil
		}
		return m[k]
	}

	var savedRecordID uint

	err := h.db.Transaction(func(tx *gorm.DB) error {
		var emp model.Employee
		if err := tx.Where("badge = ?", req.Badge).First(&emp).Error; err != nil {
			emp = model.Employee{
				Badge:        req.Badge,
				Nama:         req.Nama,
				JenisKelamin: req.JenisKelamin,
				Umur:         req.Umur,
				GolDarah:     req.GolDarah,
				Shift:        req.Shift,
				Bagian:       req.Bagian,
			}
			if err := tx.Create(&emp).Error; err != nil {
				return err
			}
		} else {
			if !req.IsSpouse && req.Nama != "" {
				emp.Nama = req.Nama
				emp.JenisKelamin = req.JenisKelamin
				emp.Umur = req.Umur
				emp.GolDarah = req.GolDarah
				emp.Shift = req.Shift
				emp.Bagian = req.Bagian
				_ = tx.Save(&emp).Error
			}
		}

		patientType := "EMPLOYEE"
		var spouseIDPtr *uint = nil

		if req.IsSpouse {
			patientType = "SPOUSE"

			var spouse model.Spouse
			cleanNama := strings.TrimSpace(req.Nama)
			errSpouse := tx.Where("employee_id = ?", emp.ID).Order("id DESC").First(&spouse).Error

			if errSpouse != nil {
				spouse = model.Spouse{
					EmployeeID:   emp.ID,
					Nama:         req.Nama,
					JenisKelamin: req.JenisKelamin,
					Umur:         req.Umur,
					GolDarah:     req.GolDarah,
					IsActive:     true,
				}
				if err := tx.Create(&spouse).Error; err != nil {
					return err
				}
			} else {
				if cleanNama != "" && !strings.EqualFold(spouse.Nama, cleanNama) {
					// MITIGASI BEDA NAMA: Cek apakah pasangan lama punya riwayat MCU
					var previousMcuCount int64
					tx.Model(&model.MCURecord{}).
						Where("spouse_id = ? AND test_tahun < ?", spouse.ID, testYearInt).
						Count(&previousMcuCount)

					if previousMcuCount > 0 {

						newSpouse := model.Spouse{
							EmployeeID:   emp.ID,
							Nama:         req.Nama,
							JenisKelamin: req.JenisKelamin,
							Umur:         req.Umur,
							GolDarah:     req.GolDarah,
							IsActive:     true,
						}
						if err := tx.Create(&newSpouse).Error; err != nil {
							return err
						}
						spouse = newSpouse
					} else {
						spouse.Nama = cleanNama
						spouse.JenisKelamin = req.JenisKelamin
						spouse.Umur = req.Umur
						spouse.GolDarah = req.GolDarah
						spouse.IsActive = true
						if err := tx.Save(&spouse).Error; err != nil {
							return err
						}
					}
				} else {
					spouse.JenisKelamin = req.JenisKelamin
					spouse.Umur = req.Umur
					spouse.GolDarah = req.GolDarah
					spouse.IsActive = true
					if err := tx.Save(&spouse).Error; err != nil {
						return err
					}
				}
			}
			spouseIDPtr = &spouse.ID
		}
		var mainRecord model.MCURecord
		errRecord := tx.Where("employee_id = ? AND test_tahun = ? AND patient_type = ?", emp.ID, testYearInt, patientType).First(&mainRecord).Error
		if errRecord != nil {
			mainRecord = model.MCURecord{
				EmployeeID:  emp.ID,
				TestTahun:   testYearInt,
				PatientType: patientType,
			}
		}

		mainRecord.SpouseID = spouseIDPtr // Hubungkan ke kolom spouse_id di mcu_records
		mainRecord.Tanggal = req.Tanggal
		mainRecord.Umur = req.Umur
		mainRecord.GolDarah = req.GolDarah
		mainRecord.Shift = req.Shift
		mainRecord.Bagian = req.Bagian
		mainRecord.Dokter = req.Dokter
		mainRecord.JenisKelamin = req.JenisKelamin
		mainRecord.PeriodeMCU = req.PeriodeMCU
		mainRecord.TanggalMCUBerikutnya = req.TanggalMCUBerikutnya
		mainRecord.HasilPemkes = req.HasilPemkes

		cleanDokter := strings.TrimSpace(req.Dokter)
		if cleanDokter != "" && !strings.EqualFold(cleanDokter, "DR. UNKNOWN") {
			docToCreate := model.Doctor{
				Nama:      cleanDokter,
				Spesialis: "Dokter Pemeriksa",
				IsActive:  true,
			}
			// Menggunakan FirstOrCreate bawaan GORM biar aman dari bentrok ID
			errDoc := tx.Where("LOWER(nama) = ?", strings.ToLower(cleanDokter)).FirstOrCreate(&docToCreate).Error
			if errDoc != nil {
				fmt.Println("Gagal simpan ke tabel doctors:", errDoc)
			} else {
				fmt.Println("Berhasil masuk/sinkron ke tabel doctors:", cleanDokter)
			}
		}

		if err := tx.Save(&mainRecord).Error; err != nil {
			return err
		}

		savedRecordID = mainRecord.ID
		recordPK := mainRecord.ID

		opStr := ""
		rawatStr := ""
		if req.RiwayatPenyakitDahulu != nil {
			if v, ok := req.RiwayatPenyakitDahulu["riwayatOperasi"].(string); ok {
				opStr = v
			}
			if v, ok := req.RiwayatPenyakitDahulu["riwayatRawatInap"].(string); ok {
				rawatStr = v
			}
		}

		hasKeluhanOrgan := false
		if req.KeluhanSistemOrgan != nil {
			jsonBytes, _ := json.Marshal(req.KeluhanSistemOrgan)
			jsonStr := string(jsonBytes)
			if jsonStr != "" && jsonStr != "{" && jsonStr != "{}" && strings.Contains(jsonStr, "true") {
				hasKeluhanOrgan = true
			}
		}

		hasUmumData := req.KeluhanSekarang != "" || req.RiwayatPenyakit != "" ||
			(req.AlergiObat != "" && req.AlergiObat != "false") || req.AlergiObatKeterangan != "" ||
			req.AlergiMakanan != "" || req.RiwayatPenyakitAkibatKerja != "" ||
			req.RiwayatKecelakaanKerja != "" || req.RiwayatPengobatanRutin != "" ||
			req.RiwayatVaksinasi != "" || opStr != "" || rawatStr != "" ||
			req.KesimpulanUmum != "" || req.SaranUmum != "" || hasKeluhanOrgan

		if hasUmumData {
			var umumTab model.MCUUmum
			if err := tx.Where("mcu_record_id = ?", recordPK).First(&umumTab).Error; err != nil {
				umumTab = model.MCUUmum{MCURecordID: recordPK}
			}

			detailUmumMap := map[string]any{
				"keluhanSistemOrgan":      req.KeluhanSistemOrgan,
				"riwayatPenyakitDahulu":   req.RiwayatPenyakitDahulu,
				"riwayatObstetri":         req.RiwayatObstetri,
				"riwayatKehamilan":        req.RiwayatKehamilan,
				"kebiasaan":               req.Kebiasaan,
				"riwayatPenyakitKeluarga": req.RiwayatPenyakitKeluarga,
			}

			teksAlergiObat := req.AlergiObatKeterangan
			if teksAlergiObat == "" {
				teksAlergiObat = req.AlergiObat
			}

			umumTab.MCURecordID = recordPK
			umumTab.KeluhanSekarang = h.service.CoalesceStr(req.KeluhanSekarang, umumTab.KeluhanSekarang)
			umumTab.RiwayatPenyakit = h.service.CoalesceStr(req.RiwayatPenyakit, umumTab.RiwayatPenyakit)
			umumTab.AlergiObat = h.service.CoalesceStr(fmt.Sprintf("%v", req.AlergiObat), umumTab.AlergiObat)
			umumTab.AlergiMakanan = h.service.CoalesceStr(req.AlergiMakanan, umumTab.AlergiMakanan)
			umumTab.RiwayatPenyakitAkibatKerja = h.service.CoalesceStr(req.RiwayatPenyakitAkibatKerja, umumTab.RiwayatPenyakitAkibatKerja)
			umumTab.RiwayatKecelakaanKerja = h.service.CoalesceStr(req.RiwayatKecelakaanKerja, umumTab.RiwayatKecelakaanKerja)
			umumTab.RiwayatPengobatanRutin = h.service.CoalesceStr(req.RiwayatPengobatanRutin, umumTab.RiwayatPengobatanRutin)
			umumTab.RiwayatVaksinasi = h.service.CoalesceStr(req.RiwayatVaksinasi, umumTab.RiwayatVaksinasi)
			umumTab.RiwayatOperasi = h.service.CoalesceStr(opStr, umumTab.RiwayatOperasi)
			umumTab.RiwayatRawatInap = h.service.CoalesceStr(rawatStr, umumTab.RiwayatRawatInap)
			umumTab.KesimpulanUmum = h.service.CoalesceStr(req.KesimpulanUmum, umumTab.KesimpulanUmum)
			umumTab.SaranUmum = h.service.CoalesceStr(req.SaranUmum, umumTab.SaranUmum)

			jsonUmumStr := h.service.ParseDetailJSON(detailUmumMap)
			if jsonUmumStr != "{}" {
				umumTab.DetailJson = jsonUmumStr
			}
			if err := tx.Save(&umumTab).Error; err != nil {
				return err
			}
		}

		tBdn := h.service.ParseToInt(getVal(req.TandaVital, "tinggiBadan"))
		bBdn := h.service.ParseToInt(getVal(req.TandaVital, "beratBadan"))
		sysDarah := h.service.ParseToInt(getVal(req.TandaVital, "tekananDarahSistolik"))
		diaDarah := h.service.ParseToInt(getVal(req.TandaVital, "tekananDarahDiastolik"))
		nadiVal := h.service.ParseToInt(getVal(req.TandaVital, "nadi"))

		hasFisikData := tBdn > 0 || bBdn > 0 || sysDarah > 0 || diaDarah > 0 || nadiVal > 0 ||
			req.KesimpulanFisik != "" || req.SaranFisik != ""

		if hasFisikData {
			var fisikTab model.MCUFisik
			if err := tx.Where("mcu_record_id = ?", recordPK).First(&fisikTab).Error; err != nil {
				fisikTab = model.MCUFisik{MCURecordID: recordPK}
			}

			detailFisikMap := map[string]any{
				"tandaVital":         req.TandaVital,
				"mata":               req.Mata,
				"tht":                req.Tht,
				"genetaliaAnorectal": req.GenetaliaAnorectal,
				"pemeriksaanLeher":   req.PemeriksaanLeher,
			}

			lingkarPerutVal := getVal(req.TandaVital, "oPerut")
			if lingkarPerutVal == nil || fmt.Sprintf("%v", lingkarPerutVal) == "" || fmt.Sprintf("%v", lingkarPerutVal) == "0" || fmt.Sprintf("%v", lingkarPerutVal) == "<nil>" {
				lingkarPerutVal = getVal(req.TandaVital, "lingkarPerut")
			}

			fisikTab.MCURecordID = recordPK
			fisikTab.TinggiBadan = h.service.CoalesceInt(tBdn, fisikTab.TinggiBadan)
			fisikTab.BeratBadan = h.service.CoalesceInt(bBdn, fisikTab.BeratBadan)
			fisikTab.TekananDarahSys = h.service.CoalesceInt(sysDarah, fisikTab.TekananDarahSys)
			fisikTab.TekananDarahDia = h.service.CoalesceInt(diaDarah, fisikTab.TekananDarahDia)
			fisikTab.Nadi = h.service.CoalesceInt(nadiVal, fisikTab.Nadi)
			fisikTab.Pernafasan = h.service.CoalesceInt(h.service.ParseToInt(getVal(req.TandaVital, "pernafasan")), fisikTab.Pernafasan)
			fisikTab.Suhu = h.service.CoalesceFloat(h.service.ParseToFloat(getVal(req.TandaVital, "suhu")), fisikTab.Suhu)
			fisikTab.Bmi = h.service.CoalesceFloat(h.service.ParseToFloat(getVal(req.TandaVital, "bmi")), fisikTab.Bmi)
			fisikTab.BmiKategori = h.service.CoalesceStr(fmt.Sprintf("%v", getVal(req.TandaVital, "bmiKategori")), fisikTab.BmiKategori)
			fisikTab.LingkarPerut = h.service.CoalesceInt(h.service.ParseToInt(lingkarPerutVal), fisikTab.LingkarPerut)
			fisikTab.OLengan = h.service.CoalesceStr(fmt.Sprintf("%v", getVal(req.TandaVital, "oLengan")), fisikTab.OLengan)
			fisikTab.PersenLemak = h.service.CoalesceStr(fmt.Sprintf("%v", getVal(req.TandaVital, "persenLemak")), fisikTab.PersenLemak)
			fisikTab.KesMata = h.service.CoalesceStr(fmt.Sprintf("%v", getVal(req.Mata, "kesMata")), fisikTab.KesMata)
			fisikTab.KesTHT = h.service.CoalesceStr(fmt.Sprintf("%v", getVal(req.Tht, "kesTHT")), fisikTab.KesTHT)
			fisikTab.KesFisik = h.service.CoalesceStr(fmt.Sprintf("%v", getVal(req.TandaVital, "kesFisik")), fisikTab.KesFisik)
			fisikTab.KesimpulanFisik = h.service.CoalesceStr(req.KesimpulanFisik, fisikTab.KesimpulanFisik)
			fisikTab.SaranFisik = h.service.CoalesceStr(req.SaranFisik, fisikTab.SaranFisik)

			jsonFisikStr := h.service.ParseDetailJSON(detailFisikMap)
			if jsonFisikStr != "{}" {
				fisikTab.DetailJson = jsonFisikStr
			}
			if err := tx.Save(&fisikTab).Error; err != nil {
				return err
			}
		}

		valKesEcg := req.KesimpulanPenunjang.KesEkg
		if valKesEcg == "" && req.ThoraxJantung != nil {
			if thJantung, ok := req.ThoraxJantung["ekg"].(string); ok {
				valKesEcg = thJantung
			}
		}

		hasKesPenunjang := (req.KesimpulanPenunjang.KesTreadmill != "" && req.KesimpulanPenunjang.KesTreadmill != "DBN") ||
			(valKesEcg != "" && valKesEcg != "DBN") ||
			(req.KesimpulanPenunjang.KesUsgAbd != "" && req.KesimpulanPenunjang.KesUsgAbd != "DBN") ||
			(req.KesimpulanPenunjang.KesAudiometri != "" && req.KesimpulanPenunjang.KesAudiometri != "DBN") ||
			(req.KesimpulanPenunjang.KesFotoThorax != "" && req.KesimpulanPenunjang.KesFotoThorax != "DBN") ||
			(req.KesimpulanPenunjang.KesAutospiro != "" && req.KesimpulanPenunjang.KesAutospiro != "DBN")

		hasFisik2Data := req.KesimpulanFisik2 != "" || req.SaranFisik2 != "" || hasKesPenunjang

		if hasFisik2Data {
			var fisik2Tab model.MCUFisik2
			if err := tx.Where("mcu_record_id = ?", recordPK).First(&fisik2Tab).Error; err != nil {
				fisik2Tab = model.MCUFisik2{MCURecordID: recordPK}
			}

			detailFisik2Map := map[string]any{
				"gigiMulut":      req.GigiMulut,
				"anggotaGerak":   req.AnggotaGerak,
				"reflekFisik":    req.ReflekFisik,
				"thoraxJantung":  req.ThoraxJantung,
				"thoraxParu":     req.ThoraxParu,
				"abdomenFisik2":  req.AbdomenFisik2,
				"tulangBelakang": req.TulangBelakang,
			}

			fisik2Tab.MCURecordID = recordPK
			fisik2Tab.KesTreadmill = h.service.CoalesceStr(req.KesimpulanPenunjang.KesTreadmill, fisik2Tab.KesTreadmill)
			fisik2Tab.KesEkg = h.service.CoalesceStr(valKesEcg, fisik2Tab.KesEkg)
			fisik2Tab.KesUsgAbd = h.service.CoalesceStr(req.KesimpulanPenunjang.KesUsgAbd, fisik2Tab.KesUsgAbd)
			fisik2Tab.KesAudiometri = h.service.CoalesceStr(req.KesimpulanPenunjang.KesAudiometri, fisik2Tab.KesAudiometri)
			fisik2Tab.KesFotoThorax = h.service.CoalesceStr(req.KesimpulanPenunjang.KesFotoThorax, fisik2Tab.KesFotoThorax)
			fisik2Tab.KesAutospiro = h.service.CoalesceStr(req.KesimpulanPenunjang.KesAutospiro, fisik2Tab.KesAutospiro)
			fisik2Tab.KesimpulanFisik2 = h.service.CoalesceStr(req.KesimpulanFisik2, fisik2Tab.KesimpulanFisik2)
			fisik2Tab.SaranFisik2 = h.service.CoalesceStr(req.SaranFisik2, fisik2Tab.SaranFisik2)

			jsonFisik2Str := h.service.ParseDetailJSON(detailFisik2Map)
			if jsonFisik2Str != "{}" {
				fisik2Tab.DetailJson = jsonFisik2Str
			}
			if err := tx.Save(&fisik2Tab).Error; err != nil {
				return err
			}
		}

		hbVal := h.service.ParseToFloat(getVal(req.Hematologi, "hemoglobin"))
		leukositVal := h.service.ParseToInt(getVal(req.Hematologi, "leukosit"))
		trombositVal := h.service.ParseToInt(getVal(req.Hematologi, "trombosit"))

		hasLabData := hbVal > 0 || leukositVal > 0 || trombositVal > 0 || req.KesimpulanLab != "" || req.SaranLab != ""

		if hasLabData {
			var labTab model.MCULab
			if err := tx.Where("mcu_record_id = ?", recordPK).First(&labTab).Error; err != nil {
				labTab = model.MCULab{MCURecordID: recordPK}
			}

			kesUrinVal := getVal(req.UrinLengkap, "kesUrineRutin")
			if kesUrinVal == nil || fmt.Sprintf("%v", kesUrinVal) == "" || fmt.Sprintf("%v", kesUrinVal) == "<nil>" {
				kesUrinVal = "DBN"
			}

			labTab.MCURecordID = recordPK
			labTab.Hb = h.service.CoalesceFloat(hbVal, labTab.Hb)
			labTab.Leukosit = h.service.CoalesceInt(leukositVal, labTab.Leukosit)
			labTab.Led = h.service.CoalesceInt(h.service.ParseToInt(getVal(req.Hematologi, "led")), labTab.Led)
			labTab.Eritrosit = h.service.CoalesceFloat(h.service.ParseToFloat(getVal(req.Hematologi, "eritrosit")), labTab.Eritrosit)
			labTab.Trombosit = h.service.CoalesceInt(trombositVal, labTab.Trombosit)
			labTab.Hematokrit = h.service.CoalesceFloat(h.service.ParseToFloat(getVal(req.Hematologi, "hematokrit")), labTab.Hematokrit)
			labTab.Malaria = h.service.CoalesceStr(fmt.Sprintf("%v", getVal(req.Hematologi, "malaria")), labTab.Malaria)
			labTab.KesUrineRutin = h.service.CoalesceStr(fmt.Sprintf("%v", kesUrinVal), labTab.KesUrineRutin)
			labTab.KesimpulanLab = h.service.CoalesceStr(req.KesimpulanLab, labTab.KesimpulanLab)
			labTab.SaranLab = h.service.CoalesceStr(req.SaranLab, labTab.SaranLab)

			detailLabMap := map[string]any{
				"hematologi":    req.Hematologi,
				"urinLengkap":   req.UrinLengkap,
				"kristalDetail": req.KristalDetail,
			}
			jsonLabStr := h.service.ParseDetailJSON(detailLabMap)
			if jsonLabStr != "{}" {
				labTab.DetailJson = jsonLabStr
			}
			if err := tx.Save(&labTab).Error; err != nil {
				return err
			}
		}

		sgotVal := h.service.ParseToInt(fungsiHati["sgot"])
		kolTotalVal := h.service.ParseToInt(profilLipid["kolesterolTotal"])

		hasKimiaData := sgotVal > 0 || kolTotalVal > 0 || (gdp != nil && fmt.Sprintf("%v", gdp) != "" && fmt.Sprintf("%v", gdp) != "0") || req.KesimpulanKimia != "" || req.SaranKimia != ""

		if hasKimiaData {
			var kimiaTab model.MCUKimia
			if err := tx.Where("mcu_record_id = ?", recordPK).First(&kimiaTab).Error; err != nil {
				kimiaTab = model.MCUKimia{MCURecordID: recordPK}
			}

			kimiaTab.MCURecordID = recordPK
			kimiaTab.Sgot = h.service.CoalesceInt(sgotVal, kimiaTab.Sgot)
			kimiaTab.Sgpt = h.service.CoalesceInt(h.service.ParseToInt(fungsiHati["sgpt"]), kimiaTab.Sgpt)
			kimiaTab.BilirubinTotal = h.service.CoalesceFloat(h.service.ParseToFloat(fungsiHati["bilirubinTotal"]), kimiaTab.BilirubinTotal)
			kimiaTab.KolesterolTotal = h.service.CoalesceInt(kolTotalVal, kimiaTab.KolesterolTotal)
			kimiaTab.Trigliserida = h.service.CoalesceInt(h.service.ParseToInt(profilLipid["trigliserida"]), kimiaTab.Trigliserida)
			kimiaTab.Hdl = h.service.CoalesceInt(h.service.ParseToInt(profilLipid["hdl"]), kimiaTab.Hdl)
			kimiaTab.Ldl = h.service.CoalesceInt(h.service.ParseToInt(profilLipid["ldl"]), kimiaTab.Ldl)
			kimiaTab.Ureum = h.service.CoalesceInt(h.service.ParseToInt(fungsiGinjal["ureum"]), kimiaTab.Ureum)
			kimiaTab.Kreatinin = h.service.CoalesceFloat(h.service.ParseToFloat(fungsiGinjal["kreatinin"]), kimiaTab.Kreatinin)
			kimiaTab.AsamUrat = h.service.CoalesceFloat(h.service.ParseToFloat(fungsiGinjal["asamUrat"]), kimiaTab.AsamUrat)
			kimiaTab.GulaDarahPuasa = h.service.CoalesceInt(h.service.ParseToInt(gdp), kimiaTab.GulaDarahPuasa)
			kimiaTab.GulaDarah2JamPP = h.service.CoalesceInt(h.service.ParseToInt(gd2pp), kimiaTab.GulaDarah2JamPP)
			kimiaTab.KesLab = h.service.CoalesceStr(fmt.Sprintf("%v", kesKimiaSub["kesLab"]), kimiaTab.KesLab)
			kimiaTab.KesHbsag = h.service.CoalesceStr(fmt.Sprintf("%v", kesKimiaSub["kesHbsag"]), kimiaTab.KesHbsag)
			kimiaTab.KesimpulanKimia = h.service.CoalesceStr(req.KesimpulanKimia, kimiaTab.KesimpulanKimia)
			kimiaTab.SaranKimia = h.service.CoalesceStr(req.SaranKimia, kimiaTab.SaranKimia)

			kimiaCleanMap := make(map[string]any)
			if req.KimiaKlinik != nil {
				for k, v := range req.KimiaKlinik {
					kimiaCleanMap[k] = v
				}
			}

			if glukosaSubCopy, ok := kimiaCleanMap["glukosa"].(map[string]any); ok {
				cleanGlukosa := make(map[string]any)
				for k, v := range glukosaSubCopy {
					if k != "gdp" && k != "gd2pp" && k != "gulaDarahPuasa" && k != "gulaDarah2JamPP" {
						cleanGlukosa[k] = v
					}
				}
				kimiaCleanMap["glukosa"] = cleanGlukosa
			}

			jsonKimiaStr := h.service.ParseDetailJSON(map[string]any{"kimiaKlinik": req.KimiaKlinik})
			if jsonKimiaStr != "{}" {
				kimiaTab.DetailJson = jsonKimiaStr
			}
			if err := tx.Save(&kimiaTab).Error; err != nil {
				return err
			}
		}

		hasSaranData := (req.KesimpulanGlobal != "" && req.KesimpulanGlobal != "<nil>") ||
			(req.SaranGlobal != "" && req.SaranGlobal != "<nil>") ||
			(req.TotalKardiovaskular != "" && req.TotalKardiovaskular != "<nil>")

		if hasSaranData {
			var saranTab model.MCUSaranDokter
			if err := tx.Where("mcu_record_id = ?", recordPK).First(&saranTab).Error; err != nil {
				saranTab = model.MCUSaranDokter{MCURecordID: recordPK}
			}

			saranTab.MCURecordID = recordPK
			saranTab.Kesimpulan = h.service.CoalesceStr(req.KesimpulanGlobal, saranTab.Kesimpulan)
			saranTab.Saran = h.service.CoalesceStr(req.SaranGlobal, saranTab.Saran)
			saranTab.TotalKardiovaskular = h.service.CoalesceStr(req.TotalKardiovaskular, saranTab.TotalKardiovaskular)

			if err := tx.Save(&saranTab).Error; err != nil {
				return err
			}
		}

		return nil
	})

	if err != nil {
		SendJSON(w, http.StatusInternalServerError, dto.JSONResponse{Success: false, Error: err.Error()})
		return
	}

	h.RecordAudit(r, "INSERT", req.Badge, fmt.Sprintf("%d", savedRecordID), "Memperbarui Rekam Medis MCU Badge : "+req.Badge)
	SendJSON(w, http.StatusOK, dto.JSONResponse{Success: true, Message: "Data rekam medis berhasil disimpan permanen"})
}

func (h *MCUHandler) HandleGetRecordByIDDirect(w http.ResponseWriter, r *http.Request, id string) {
	recordIDUint := uint(h.service.ParseToInt(id))

	record, err := h.mcuRepo.FindMainRecordByID(recordIDUint)
	if err != nil {
		SendJSON(w, http.StatusNotFound, dto.JSONResponse{Success: false, Error: "Data riwayat MCU tidak ditemukan"})
		return
	}

	var emp model.Employee
	_ = h.db.Where("id = ?", record.EmployeeID).First(&emp).Error

	umum, fisik, fisik2, lab, kimia, saran := h.mcuRepo.GetMCUDetails(record.ID)
	unifiedRecord := h.service.BuildUnifiedRecord(record, umum, fisik, fisik2, lab, kimia, saran)

	unifiedRecord["badge"] = emp.Badge
	unifiedRecord["nama"] = emp.Nama

	SendJSON(w, http.StatusOK, dto.JSONResponse{Success: true, Data: unifiedRecord})
}

func (h *MCUHandler) HandleUpdateRecordDirect(w http.ResponseWriter, r *http.Request, id string) {
	r.Body = http.MaxBytesReader(w, r.Body, 2<<20)
	var req dto.FrontendMCURequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		SendJSON(w, http.StatusBadRequest, dto.JSONResponse{Success: false, Error: "Format JSON salah"})
		return
	}
	req.ID = id
	bodyBytes, _ := json.Marshal(req)
	r.Body = ioNopCloser(string(bodyBytes))
	h.HandleSaveRecord(w, r)
}

func ioNopCloser(s string) ioReadCloserWrapper {
	return ioReadCloserWrapper{strings.NewReader(s)}
}

type ioReadCloserWrapper struct {
	*strings.Reader
}

func (ioReadCloserWrapper) Close() error { return nil }

func (h *MCUHandler) HandleDeleteRecordDirect(w http.ResponseWriter, r *http.Request, id string) {
	recordIDUint := uint(h.service.ParseToInt(id))

	targetRec, _ := h.mcuRepo.FindMainRecordByID(recordIDUint)
	_ = h.mcuRepo.DeleteMCUData(id)

	badgeVal := "UNKNOWN"
	if targetRec.EmployeeID > 0 {
		var emp model.Employee
		if err := h.db.Where("id = ?", targetRec.EmployeeID).First(&emp).Error; err == nil {
			badgeVal = emp.Badge
		}
	}
	h.RecordAudit(r, "DELETE", badgeVal, id, "Menghapus rekam medis MCU ID: "+id)
	SendJSON(w, http.StatusOK, dto.JSONResponse{Success: true, Message: "Berhasil dihapus"})
}

func (h *MCUHandler) HandleBulkImport(w http.ResponseWriter, r *http.Request) {
	r.Body = http.MaxBytesReader(w, r.Body, 10<<20)
	var rawItems []map[string]any
	if err := json.NewDecoder(r.Body).Decode(&rawItems); err != nil {
		SendJSON(w, http.StatusBadRequest, dto.JSONResponse{Success: false, Error: "Format JSON bulk import salah"})
		return
	}

	importedCount := 0
	skippedCount := 0

	err := h.db.Transaction(func(tx *gorm.DB) error {
		for _, item := range rawItems {
			badgeVal := fmt.Sprintf("%v", item["badge"])
			namaVal := fmt.Sprintf("%v", item["nama"])

			if badgeVal == "" || badgeVal == "<nil>" {
				continue
			}

			testYear := h.service.ParseToInt(item["testTahun"])
			if testYear == 0 {
				tglStr := fmt.Sprintf("%v", item["tanggal"])
				if len(tglStr) >= 4 {
					testYear = h.service.ParseToInt(tglStr[:4])
				}
			}
			if testYear == 0 {
				testYear = 2026
			}

			patientType := "EMPLOYEE"
			if isSpouse, ok := item["isSpouse"].(bool); ok && isSpouse {
				patientType = "SPOUSE"
			}

			var emp model.Employee
			if err := tx.Where("badge = ?", badgeVal).First(&emp).Error; err != nil {
				emp = model.Employee{
					Badge: badgeVal,
					Nama:  namaVal,
				}
				if err := tx.Create(&emp).Error; err != nil {
					return err
				}
			}

			var existingRec model.MCURecord
			errCheck := tx.Where("employee_id = ? AND test_tahun = ? AND patient_type = ?", emp.ID, testYear, patientType).First(&existingRec).Error
			if errCheck == nil {
				skippedCount++
				continue
			}

			rec := model.MCURecord{
				TestTahun:   testYear,
				PatientType: patientType,
				EmployeeID:  emp.ID,
				Tanggal:     fmt.Sprintf("%v", item["tanggal"]),
				Umur:        h.service.ParseToInt(item["umur"]),
				GolDarah:    fmt.Sprintf("%v", item["golDarah"]),
				Shift:       fmt.Sprintf("%v", item["shift"]),
				Bagian:      fmt.Sprintf("%v", item["bagian"]),
				Dokter:      fmt.Sprintf("%v", item["dokter"]),
			}

			if err := tx.Create(&rec).Error; err != nil {
				return err
			}
			importedCount++
		}
		return nil
	})

	if err != nil {
		SendJSON(w, http.StatusInternalServerError, dto.JSONResponse{Success: false, Error: err.Error()})
		return
	}

	msg := fmt.Sprintf("Bulk import selesai: %d data baru dimasukkan, %d data dilewati karena sudah ada.", importedCount, skippedCount)
	SendJSON(w, http.StatusOK, dto.JSONResponse{Success: true, Message: msg})
}

// Helper membaca IP Client yang detail (mendukung X-Forwarded-For jika di balik Proxy/Docker)
func getClientIP(r *http.Request) string {
	forwarded := r.Header.Get("X-Forwarded-For")
	if forwarded != "" {
		ips := strings.Split(forwarded, ",")
		return strings.TrimSpace(ips[0])
	}
	return r.RemoteAddr
}

func (h *MCUHandler) RecordAudit(r *http.Request, aksi, badgeTerkait, recordID, detail string) {
	username := "admin"
	if ctxUser, ok := r.Context().Value("username").(string); ok && ctxUser != "" {
		username = ctxUser
	}
	ipAddress := getClientIP(r)
	logEntry := model.AuditLog{
		AdminUsername:   username,
		Aksi:            aksi,
		BadgeTerkait:    badgeTerkait,
		RecordID:        recordID,
		DetailPerubahan: detail,
		IpAddress:       ipAddress,
	}
	_ = h.adminRepo.CreateAuditLog(logEntry)
}

func (h *MCUHandler) HandleRecordsDispatcher(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		h.HandleGetRecords(w, r)
	case http.MethodPost:
		h.HandleSaveRecord(w, r)
	default:
		SendJSON(w, http.StatusMethodNotAllowed, dto.JSONResponse{Success: false, Error: "Method tidak didukung"})
	}
}

func (h *MCUHandler) HandleRecordByIDDispatcher(w http.ResponseWriter, r *http.Request) {
	rawPath := strings.TrimPrefix(r.URL.Path, "/api/records/")
	if rawPath == "" || rawPath == "bulk-import" {
		return
	}
	if strings.HasPrefix(rawPath, "badge/") {
		badge := strings.TrimPrefix(rawPath, "badge/")
		if r.Method == http.MethodGet {
			h.HandleGetRecordByBadge(w, r, badge)
		} else {
			SendJSON(w, http.StatusMethodNotAllowed, dto.JSONResponse{Success: false, Error: "Method tidak didukung"})
		}
		return
	}

	id := rawPath
	switch r.Method {
	case http.MethodGet:
		h.HandleGetRecordByIDDirect(w, r, id)
	case http.MethodPut:
		h.HandleUpdateRecordDirect(w, r, id)
	case http.MethodDelete:
		h.HandleDeleteRecordDirect(w, r, id)
	default:
		SendJSON(w, http.StatusMethodNotAllowed, dto.JSONResponse{Success: false, Error: "Method tidak didukung"})
	}
}

func (h *MCUHandler) HandleGetDoctors(w http.ResponseWriter, r *http.Request) {
	doctors, err := h.doctorRepo.FindAllActiveDoctors()
	if err != nil {
		SendJSON(w, http.StatusInternalServerError, dto.JSONResponse{Success: false, Error: err.Error()})
		return
	}
	SendJSON(w, http.StatusOK, dto.JSONResponse{Success: true, Data: doctors})

}
