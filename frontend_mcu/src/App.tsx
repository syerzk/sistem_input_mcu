import React, { useState, useEffect } from 'react';
import { MCURecord } from './types';
import { INITIAL_MCU_RECORDS } from './data/mockData';
import { getInitialMCURecord, formatIndonesianDate } from './utils/mcuHelpers';
import { HeaderNavbar } from './components/HeaderNavbar';
import { ScheduleReminderBanner } from './components/ScheduleReminderBanner';
import { TabUmum } from './components/tabs/TabUmum';
import { TabFisik } from './components/tabs/TabFisik';
import { TabFisik2 } from './components/tabs/TabFisik2';
import { TabLaboratorium } from './components/tabs/TabLaboratorium';
import { TabKimiaKlinik } from './components/tabs/TabKimiaKlinik';
import { TabSaranDr } from './components/tabs/TabSaranDr';
import { BottomBar } from './components/BottomBar';
import { ReportModal } from './components/ReportModal';
import { ExcelImportModal } from './components/ExcelImportModal';
import { ScheduleTrackerModal } from './components/ScheduleTrackerModal';
import { DataListModal } from './components/DataListModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { ChangeAdminPinModal } from './components/ChangeAdminPinModal';
import { RsPusriLogo } from './components/RsPusriLogo';
import { WelcomePortal } from './components/WelcomePortal';
import { BadgeEntryPage } from './components/BadgeEntryPage';
import { MySqlManagerModal } from './components/MySqlManagerModal';
import { ConfirmSaveModal } from './components/ConfirmSaveModal';
import { isAdminSessionActive, setAdminSession } from './utils/adminAuth';
import { API_BASE_URL } from './config/api';

import {
  saveMySqlRecord,
  deleteMySqlRecord,
  bulkSaveMySqlRecords,
  fetchMySqlRecords
} from './services/Service';

import {
  autoGenerateTabUmum,
  autoGenerateTabFisik,
  autoGenerateTabFisik2,
  autoGenerateTabLaboratorium,
  autoGenerateTabKimiaKlinik,
  autoGenerateTabSaranDr,
  autoGenerateAllTabs
} from './utils/autoSummaryGenerators';
import {
  CheckCircle2,
  CalendarClock,
  Database,
  Printer,
  FileSpreadsheet,
  Menu,
  X,
  Stethoscope,
  ChevronRight,
  HeartPulse,
  Lock,
  LockOpen,
  ShieldCheck,
  KeyRound,
  LogOut,
  Search,
  Cloud,
  Wifi,
  Sparkles
} from 'lucide-react';

type TabKey = 'UMUM' | 'FISIK' | 'FISIK (2)' | 'LABORATORIUM' | 'KIMIA KLINIK' | 'SARAN DR';
type AppPage = 'PORTAL' | 'BADGE_ENTRY' | 'MCU_DETAIL';

const TABS: TabKey[] = ['UMUM', 'FISIK', 'FISIK (2)', 'LABORATORIUM', 'KIMIA KLINIK', 'SARAN DR'];

export default function App() {
  const [records, setRecords] = useState<MCURecord[]>([]);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);

  // Inisialisasi awal currentRecord berdasarkan ID lengkap di sessionStorage agar tepat sasaran
  const [currentRecord, setCurrentRecord] = useState<MCURecord>(() => {
    try {
      const savedId = sessionStorage.getItem('pusri_active_mcu_id');
      const savedRecordsStr = localStorage.getItem('pusri_mcu_records_v4_50');
      
      if (savedId && savedRecordsStr) {
        const parsedRecords: MCURecord[] = JSON.parse(savedRecordsStr);
        const matched = parsedRecords.find((r) => r.id === savedId);
        if (matched) return matched;
      }
    } catch (e) {
      console.error('Failed to load active record from storage', e);
    }
    return getInitialMCURecord();
  });

  // Inisialisasi tab aktif agar form tetap stay di tab terakhir sebelum refresh
  const [activeTab, setActiveTab] = useState<TabKey>(() => {
    try {
      const savedTab = sessionStorage.getItem('pusri_active_mcu_tab') as TabKey;
      if (savedTab && TABS.includes(savedTab)) {
        return savedTab;
      }
    } catch {
      // fallback
    }
    return 'UMUM';
  });

  const [enableEdit, setEnableEdit] = useState<boolean>(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [isScheduleTrackerOpen, setIsScheduleTrackerOpen] = useState(false);
  const [isDataListOpen, setIsDataListOpen] = useState(false);
  const [isMySqlOpen, setIsMySqlOpen] = useState(false);
  
  // State untuk Modal Konfirmasi Simpan
  const [isConfirmSaveOpen, setIsConfirmSaveOpen] = useState(false);
  const [isSavingRecord, setIsSavingRecord] = useState(false);
  
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return isAdminSessionActive();
  });
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [adminLoginPurpose, setAdminLoginPurpose] = useState<'DATABASE' | 'EXCEL_IMPORT' | null>(null);
  const [isChangePinOpen, setIsChangePinOpen] = useState(false);
  
  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(false);
  const [isCloudSyncing, setIsCloudSyncing] = useState<boolean>(true);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState<AppPage>(() => {
    try {
      const savedPage = sessionStorage.getItem('pusri_mcu_page');
      if (savedPage === 'BADGE_ENTRY' || savedPage === 'MCU_DETAIL' || savedPage === 'PORTAL') {
        return savedPage as AppPage;
      }
      const entered = sessionStorage.getItem('pusri_mcu_portal_entered');
      if (entered === 'true') {
        return 'BADGE_ENTRY';
      }
    } catch {
      // fallback
    }
    return 'PORTAL';
  });

  const handleEnterMCU = () => {
    setCurrentPage('BADGE_ENTRY');
    try {
      sessionStorage.setItem('pusri_mcu_page', 'BADGE_ENTRY');
      sessionStorage.setItem('pusri_mcu_portal_entered', 'true');
    } catch (e) {
      console.error(e);
    }
    showToast('Silakan masukkan Nomor Badge Karyawan.');
  };

  const handleReturnToPortal = () => {
    setCurrentPage('PORTAL');
    try {
      sessionStorage.setItem('pusri_mcu_page', 'PORTAL');
      sessionStorage.removeItem('pusri_mcu_portal_entered');
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenBadgePage = () => {
    setCurrentPage('BADGE_ENTRY');
    try {
      sessionStorage.setItem('pusri_mcu_page', 'BADGE_ENTRY');
    } catch (e) {
      console.error(e);
    }
  };

  const handleProceedFromBadge = (selectedRecord: MCURecord) => {
    const existingRecord = records.find(
      (r) => r.id === selectedRecord.id || (r.badge && selectedRecord.badge && r.badge.toLowerCase() === selectedRecord.badge.toLowerCase() && r.isSpouse === selectedRecord.isSpouse && r.testTahun === selectedRecord.testTahun)
    );

    const targetRecord = existingRecord ? { ...existingRecord, ...selectedRecord } : {
      ...getInitialMCURecord(),
      badge: selectedRecord.badge || '',
      nama: selectedRecord.nama || '',
      testTahun: selectedRecord.testTahun || '2026',
      isSpouse: selectedRecord.isSpouse || false
    };

    setRecords((prev) => {
      const exists = prev.some((r) => r.id === targetRecord.id);
      if (!exists) {
        return [targetRecord, ...prev];
      }
      return prev.map((r) => r.id === targetRecord.id ? { ...r, ...targetRecord } : r);
    });

    if (existingRecord) {
      saveMySqlRecord(targetRecord).catch(() => {});
    }

    try {
      sessionStorage.setItem('pusri_active_mcu_id', targetRecord.id);
      sessionStorage.setItem('pusri_active_mcu_badge', targetRecord.badge);
      sessionStorage.setItem('pusri_active_mcu_is_spouse', String(targetRecord.isSpouse));
      sessionStorage.setItem('pusri_active_mcu_year', targetRecord.testTahun || '2026');
    } catch (e) {
      console.error(e);
    }

    setCurrentRecord(targetRecord);
    setCurrentPage('MCU_DETAIL');
    setActiveTab('UMUM');
    try {
      sessionStorage.setItem('pusri_mcu_page', 'MCU_DETAIL');
      sessionStorage.setItem('pusri_mcu_portal_entered', 'true');
    } catch (e) {
      console.error(e);
    }
    showToast(`Formulir Input MCU Detail siap untuk Badge ${targetRecord.badge}`);
  };

  
  // SINKRONISASI SAAT MEMUAT / REFRESH HALAMAN BERDASARKAN ID SPESIFIK & TAHUN AKTIF
  useEffect(() => {
    setIsCloudSyncing(true);
    setIsLoadingData(true);

    const initData = async () => {
      try {
        const mysqlRecords = await fetchMySqlRecords();
        if (mysqlRecords && mysqlRecords.length > 0) {
          setRecords(mysqlRecords);
        } else {
          setRecords([]);
        }
        setIsCloudConnected(true);

        const activeId = sessionStorage.getItem('pusri_active_mcu_id');
        const activeBadge = sessionStorage.getItem('pusri_active_mcu_badge');
        const activeIsSpouse = sessionStorage.getItem('pusri_active_mcu_is_spouse') === 'true';
        const activeYear = sessionStorage.getItem('pusri_active_mcu_year') || '2026';
        
        if (activeId || activeBadge) {
          try {
            const targetId = activeId || (activeIsSpouse ? `MCU-${activeYear}-${activeBadge?.trim()}-spouse` : `MCU-${activeYear}-${activeBadge?.trim()}`);
           const url = `${API_BASE_URL}/api/records/badge/${activeBadge?.trim() || ''}?id=${encodeURIComponent(targetId)}&is_spouse=${activeIsSpouse}&test_tahun=${activeYear}`;
            
            const res = await fetch(url);
            const json = await res.json();
            if (json.success && json.data) {
              const recordData = json.data.mcuRecord || json.data;
              if (recordData && (recordData.badge || recordData.id)) {
                setCurrentRecord(recordData);
              }
            }
          } catch (err) {
            console.error("Gagal memuat detail aktif dari backend:", err);
          }
        }
      } catch (err) {
        console.error("Gagal mengambil data dari MySQL", err);
        setIsCloudConnected(false);
      } finally {
        setIsCloudSyncing(false);
        setIsLoadingData(false);
      }
    };

    initData();
  }, []);

  // Simpan state record dan tab aktif ke sessionStorage & localStorage agar tetap stay saat refresh
  useEffect(() => {
    try {
      if (currentRecord.badge && currentRecord.id) {
        sessionStorage.setItem('pusri_active_mcu_id', currentRecord.id);
        sessionStorage.setItem('pusri_active_mcu_badge', currentRecord.badge);
        sessionStorage.setItem('pusri_active_mcu_is_spouse', String(currentRecord.isSpouse || false));
        sessionStorage.setItem('pusri_active_mcu_year', currentRecord.testTahun || '2026');
      }
      sessionStorage.setItem('pusri_active_mcu_tab', activeTab);
    } catch (e) {
      console.error('Failed to save state locally', e);
    }
  }, [records, currentRecord, activeTab]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleOpenExcelImport = () => {
    if (isAdmin) {
      setIsExcelModalOpen(true);
    } else {
      setAdminLoginPurpose('EXCEL_IMPORT');
      setIsAdminLoginOpen(true);
      showToast('🔒 Hak Akses Admin diperlukan untuk mengimpor file Excel.');
    }
  };

  const handleOpenDatabase = () => {
    if (isAdmin) {
      setIsDataListOpen(true);
    } else {
      setAdminLoginPurpose('DATABASE');
      setIsAdminLoginOpen(true);
    }
  };

  const handleAdminLoginSuccess = () => {
    setIsAdmin(true);
    setAdminSession(true);
    setIsAdminLoginOpen(false);
    if (adminLoginPurpose === 'EXCEL_IMPORT') {
      setIsExcelModalOpen(true);
      showToast('🔓 Mode Admin Terverifikasi. Silakan pilih & impor file Excel.');
    } else {
      setIsDataListOpen(true);
      showToast('🔓 Hak Akses Admin Terverifikasi. Membuka Database Pasien.');
    }
    setAdminLoginPurpose(null);
  };

  const handleLockAdmin = () => {
    setAdminSession(false);
    setIsAdmin(false);
    showToast('🔒 Akses Admin Berhasil Dikunci.');
  };

  const handlePinChangeSuccess = (_newPin: string) => {
    showToast('🔑 PIN / Password Admin berhasil diperbarui!');
  };

 const handleUpdateCurrentRecord = async (updates: Partial<MCURecord>) => {
  if ('isSpouse' in updates) {
    const nextIsSpouse = Boolean(updates.isSpouse);
    setCurrentRecord((prev) => ({
      ...prev,
      isSpouse: nextIsSpouse
    }));
    showToast(`Status pasien diubah ke ${nextIsSpouse ? 'Istri/Suami' : 'Karyawan'}. Tekan Load Data/Enter untuk memuat.`);
    return;
  }

  // 2. Untuk update field biasa selain perubahan isSpouse
  setCurrentRecord((prev) => ({ ...prev, ...updates }));
};
  
  const handleAutoGenerateTab = (targetTab: TabKey | 'ALL') => {
    let result;
    if (targetTab === 'ALL') {
      result = autoGenerateAllTabs(currentRecord);
    } else if (targetTab === 'UMUM') {
      result = autoGenerateTabUmum(currentRecord);
    } else if (targetTab === 'FISIK') {
      result = autoGenerateTabFisik(currentRecord);
    } else if (targetTab === 'FISIK (2)') {
      result = autoGenerateTabFisik2(currentRecord);
    } else if (targetTab === 'LABORATORIUM') {
      result = autoGenerateTabLaboratorium(currentRecord);
    } else if (targetTab === 'KIMIA KLINIK') {
      result = autoGenerateTabKimiaKlinik(currentRecord);
    } else if (targetTab === 'SARAN DR') {
      result = autoGenerateTabSaranDr(currentRecord);
    }

    if (result) {
      handleUpdateCurrentRecord(result.updatedRecord);
      showToast(`✨ ${result.summaryMessage}`);
    }
  };

  const handleNextTab = () => {
    const currentIndex = TABS.indexOf(activeTab);
    if (currentIndex < TABS.length - 1) {
      const nextTab = TABS[currentIndex + 1];
      setActiveTab(nextTab);
    }
  };

  const handlePrevTab = () => {
    const currentIndex = TABS.indexOf(activeTab);
    if (currentIndex > 0) {
      const prevTab = TABS[currentIndex - 1];
      setActiveTab(prevTab);
    }
  };
  
  const handleSaveData = () => {
    if (!currentRecord.badge || !currentRecord.nama) {
      showToast('⚠️ Mohon isi Nomor Badge dan Nama Karyawan terlebih dahulu.');
      return;
    }
    setIsConfirmSaveOpen(true);
  };

 const handleConfirmSave = async () => {
    if (!currentRecord.badge || !currentRecord.nama) return;

    setIsSavingRecord(true);
    const testYear = currentRecord.testTahun || String(new Date().getFullYear());

    // Gunakan ID dari currentRecord (jika draf baru/belum tersimpan di DB, gunakan '0')
    const finalRecordId = currentRecord.id ? String(currentRecord.id) : '0';

    const updatedRecord: MCURecord = {
      ...currentRecord,
      id: finalRecordId,
      updatedAt: new Date().toISOString()
    };

    // Pengecekan apakah record sudah ada di local state (berdasarkan ID DB atau kombinasi badge+isSpouse+testTahun)
    const isExisting = records.some(
      (r) =>
        (String(r.id) !== '0' && String(r.id) === String(updatedRecord.id)) ||
        (r.badge?.toLowerCase() === updatedRecord.badge?.toLowerCase() &&
          Boolean(r.isSpouse) === Boolean(updatedRecord.isSpouse) &&
          String(r.testTahun) === String(testYear))
    );

    try {
      console.log("Mengirim data ke backend lokal:", updatedRecord.id);
      const success = await saveMySqlRecord(updatedRecord);
      if (success === false) {
        showToast('Peringatan: Server merespon gagal, tetapi data dicoba simpan ke lokal.');
      }
    } catch (err) {
      console.error("Gagal koneksi ke API lokal:", err);
      showToast('Error: Gagal terhubung ke server Go port 8080.');
      setIsSavingRecord(false);
      setIsConfirmSaveOpen(false);
      return;
    }

    setRecords((prev) => {
      const existingIdx = prev.findIndex(
        (r) =>
          (String(r.id) !== '0' && String(r.id) === String(updatedRecord.id)) ||
          (r.badge?.toLowerCase() === updatedRecord.badge?.toLowerCase() &&
            Boolean(r.isSpouse) === Boolean(updatedRecord.isSpouse) &&
            String(r.testTahun) === String(testYear))
      );

      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = updatedRecord;
        return updated;
      } else {
        return [
          {
            ...updatedRecord,
            createdAt: new Date().toISOString()
          },
          ...prev
        ];
      }
    });

    setIsSavingRecord(false);
    setIsConfirmSaveOpen(false);

    const currentTabIdx = TABS.indexOf(activeTab);
    const actionLabel = isExisting ? 'diupdate ke' : 'disimpan permanen ke';

    if (currentTabIdx < TABS.length - 1) {
      const nextTab = TABS[currentTabIdx + 1];
      setActiveTab(nextTab);
      showToast(`Data sukses ${actionLabel} Database! Berpindah ke tahap ${nextTab}.`);
    } else {
      showToast(`Data MCU ${updatedRecord.nama} berhasil tersimpan permanen di Database!`);
    }
  };

  const handleClearForm = () => {
    const blank = getInitialMCURecord();
    setCurrentRecord(blank);
    setActiveTab('UMUM');
    showToast('Formulir berhasil dikosongkan untuk entri data baru.');
  };

  const handleSelectRecordById = (id: string) => {
    if (!id) return;
    const found = records.find((r) => r.id === id);
    if (found) {
      try {
        sessionStorage.setItem('pusri_active_mcu_id', found.id);
        sessionStorage.setItem('pusri_active_mcu_badge', found.badge);
        sessionStorage.setItem('pusri_active_mcu_is_spouse', String(found.isSpouse || false));
        sessionStorage.setItem('pusri_active_mcu_year', found.testTahun || '2026');
      } catch (e) {
        console.error(e);
      }
      setCurrentRecord(found);
      showToast(`Memuat data MCU: ${found.nama} (${found.badge})`);
    }
  };

  const handleLoadPatientByBadge = async (badgeInput: string) => {
    const trimmed = badgeInput.trim();
    if (!trimmed) {
      showToast(' Mohon masukkan nomor badge terlebih dahulu.');
      return;
    }

    const testYear = currentRecord.testTahun || '2026';
    const isSpouseActive = currentRecord.isSpouse || false;
    const targetId = isSpouseActive 
      ? `MCU-${testYear}-${trimmed}-spouse` 
      : `MCU-${testYear}-${trimmed}`;

    const foundLocal = records.find((r) => r.id === targetId || (r.badge.toLowerCase() === trimmed.toLowerCase() && r.isSpouse === isSpouseActive && r.testTahun === testYear));
    
    if (foundLocal) {
      try {
        sessionStorage.setItem('pusri_active_mcu_id', foundLocal.id);
        sessionStorage.setItem('pusri_active_mcu_badge', foundLocal.badge);
        sessionStorage.setItem('pusri_active_mcu_is_spouse', String(foundLocal.isSpouse || false));
        sessionStorage.setItem('pusri_active_mcu_year', foundLocal.testTahun || '2026');
      } catch (e) {
        console.error(e);
      }
      setCurrentRecord(foundLocal);
      showToast(`Berhasil memuat data MCU: ${foundLocal.nama} (Badge: ${foundLocal.badge})`);
      return;
    }

    try {
      const url = `${API_BASE_URL}/api/records/badge/${trimmed}?is_spouse=${isSpouseActive}&test_tahun=${testYear}`;
        
      const res = await fetch(url);
      const json = await res.json();

      if (json.success && json.data) {
        const recordData = json.data.mcuRecord || json.data;
        if (recordData && (recordData.badge || recordData.id)) {
          try {
            sessionStorage.setItem('pusri_active_mcu_id', recordData.id);
            sessionStorage.setItem('pusri_active_mcu_badge', recordData.badge);
            sessionStorage.setItem('pusri_active_mcu_is_spouse', String(recordData.isSpouse || false));
            sessionStorage.setItem('pusri_active_mcu_year', recordData.testTahun || '2026');
          } catch (e) {
            console.error(e);
          }
          setCurrentRecord(recordData);
          showToast(`✅ Berhasil memuat data MCU dari Database: ${recordData.nama} (Badge: ${recordData.badge})`);
          return;
        }
      }
    } catch (error) {
      console.log("Gagal memuat dari backend.");
    }

    showToast(`⚠️ Data belum ada. Silakan lengkapi formulir dan simpan.`);
  };

  const handleDeleteRecord = (id: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
    deleteMySqlRecord(id).catch(() => {});
    showToast('Data MCU berhasil dihapus.');
    if (currentRecord.id === id) {
      handleClearForm();
    }
  };

  const handleResetToSample50 = () => {
    setRecords(INITIAL_MCU_RECORDS);
    if (INITIAL_MCU_RECORDS.length > 0) {
      setCurrentRecord(INITIAL_MCU_RECORDS[0]);
    }
    showToast('Berhasil memuat ulang 50 data MCU sampel.');
  };

  const handleImportRecords = (newRecords: MCURecord[]) => {
    setRecords((prev) => [...newRecords, ...prev]);
    if (newRecords.length > 0) {
      setCurrentRecord(newRecords[0]);
    }
    bulkSaveMySqlRecords(newRecords).catch(() => {});
    showToast(`Berhasil mengimpor ${newRecords.length} data MCU ke Database.`);
  };

  const maleCount = records.filter(r => r.jenisKelamin === 'L').length;
  const femaleCount = records.filter(r => r.jenisKelamin === 'P').length;
  const fitCount = records.filter(r => r.hasilPemkes === 'Fit').length;

  // Tampilkan loading spinner yang rapi selama fetching data dari backend
  if (isLoadingData) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-3">
        <div className="w-9 h-9 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <div className="text-center">
          <p className="text-xs font-bold text-slate-700">Menghubungkan ke Database...</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Memuat data rekam medis MCU RS Pusri</p>
        </div>
      </div>
    );
  }
  
  if (currentPage === 'PORTAL') {
    return <WelcomePortal onEnter={handleEnterMCU} />;
  }

  if (currentPage === 'BADGE_ENTRY') {
    return (
      <div id="pusri-mcu-badge-screen">
        {toastMessage && (
          <div className="fixed top-4 right-4 z-50 max-w-md bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-2.5 text-xs animate-bounce">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}
        <BadgeEntryPage
          records={records}
          currentBadge={currentRecord.badge}
          onProceedToDetail={handleProceedFromBadge}
          onReturnToPortal={handleReturnToPortal}
          onOpenDatabase={handleOpenDatabase}
          onOpenScheduleTracker={() => setIsScheduleTrackerOpen(true)}
          isAdmin={isAdmin}
          isCloudConnected={isCloudConnected}
        />
        {isScheduleTrackerOpen && (
          <ScheduleTrackerModal
            isOpen={isScheduleTrackerOpen}
            onClose={() => setIsScheduleTrackerOpen(false)}
            records={records}
            onSelectRecord={(rec) => {
              handleProceedFromBadge(rec);
              setIsScheduleTrackerOpen(false);
            }}
          />
        )}
        {isDataListOpen && (
          <DataListModal
            isOpen={isDataListOpen}
            onClose={() => setIsDataListOpen(false)}
            records={records}
            onSelectRecord={(rec) => {
              handleProceedFromBadge(rec);
              setIsDataListOpen(false);
            }}
            onDeleteRecord={handleDeleteRecord}
  
            onLockAdmin={handleLockAdmin}
            onChangeAdminPin={() => setIsChangePinOpen(true)}
          />
        )}
        {isAdminLoginOpen && (
          <AdminLoginModal
            isOpen={isAdminLoginOpen}
            onClose={() => setIsAdminLoginOpen(false)}
            onSuccess={handleAdminLoginSuccess}
            onOpenChangePin={() => setIsChangePinOpen(true)}
          />
        )}
      </div>
    );
  }

  return (
    <div id="pusri-mcu-app" className="min-h-screen bg-slate-50 text-slate-900 flex flex-col md:flex-row font-sans selection:bg-blue-200">
      
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 max-w-md bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-2.5 text-xs animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="md:hidden bg-white text-slate-800 p-3 flex items-center justify-between border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="h-9 px-1 py-0.5 rounded-lg flex items-center justify-center">
            <RsPusriLogo size="sm" variant="color" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-medium">Unit Kesehatan Kerja &amp; K3LH</div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <aside
        className={`w-64 bg-white text-slate-700 border-r border-slate-200 shrink-0 flex flex-col justify-between z-30 transition-all duration-300 shadow-sm ${
          mobileMenuOpen
            ? 'fixed inset-y-0 left-0 flex shadow-2xl'
            : 'hidden md:flex sticky top-0 h-screen overflow-y-auto'
        }`}
      >
        <div className="p-4 space-y-6">
          
          <div className="pb-4 border-b border-slate-200 space-y-2">
            <div className="px-1 py-1 flex items-center justify-center hover:scale-[1.02] transition-transform">
              <RsPusriLogo size="full" variant="color" />
            </div>
            <div className="flex items-center justify-center px-1">
              <span className="text-[10px] text-slate-500 font-medium">Unit Kesehatan Kerja &amp; K3LH</span>
            </div>
          </div>

          <nav className="space-y-1 text-xs">
            <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase px-2 mb-1">
              Menu Utama
            </div>
            
            <button
              id="nav-btn-badge-entry"
              type="button"
              onClick={() => {
                handleOpenBadgePage();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-slate-700 hover:text-blue-700 hover:bg-blue-50 font-medium transition-all cursor-pointer border border-transparent hover:border-blue-200"
              title="Kembali ke Halaman Masukkan Nomor Badge"
            >
              <div className="flex items-center gap-2.5">
                <Search className="w-4 h-4 text-blue-600" />
                <span>Cari / Input No. Badge</span>
              </div>
            </button>

            <button
              id="nav-btn-input-mcu"
              type="button"
              onClick={() => {
                setActiveTab('UMUM');
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg bg-blue-600 text-white font-semibold shadow-sm shadow-blue-600/30 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Stethoscope className="w-4 h-4 text-white" />
                <span>Input MCU Detail</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-80" />
            </button>

            <button
              type="button"
              onClick={() => {
                setIsScheduleTrackerOpen(true);
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100 font-medium transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <CalendarClock className="w-4 h-4 text-indigo-600" />
                <span>Jadwal &amp; Siklus MCU</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                handleOpenDatabase();
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg font-medium transition-all cursor-pointer ${
                isAdmin
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Database className={`w-4 h-4 ${isAdmin ? 'text-emerald-600' : 'text-slate-500'}`} />
                <span>Database Pasien</span>
              </div>
              <div>
                {isAdmin ? (
                  <span className="text-[9px] bg-emerald-100 text-emerald-700 border border-emerald-300 px-1.5 py-0.5 rounded font-bold">
                    Admin
                  </span>
                ) : (
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                )}
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsReportOpen(true);
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100 font-medium transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Printer className="w-4 h-4 text-amber-600" />
                <span>Lembar Laporan &amp; Cetak</span>
              </div>
            </button>

            {/* Tombol Impor File Excel disembunyikan (hidden) sementara sesuai permintaan, kode tetap dipertahankan */}
            {/*
            <button
              type="button"
              onClick={() => {
                handleOpenExcelImport();
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg font-medium transition-all cursor-pointer ${
                isAdmin
                  ? 'bg-emerald-50/50 border border-emerald-200/60 text-emerald-800 hover:bg-emerald-100/70'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileSpreadsheet className={`w-4 h-4 ${isAdmin ? 'text-emerald-600' : 'text-slate-500'}`} />
                <span>Impor File Excel</span>
              </div>
              <div>
                {isAdmin ? (
                  <span className="text-[9px] bg-emerald-100 text-emerald-700 border border-emerald-300 px-1.5 py-0.5 rounded font-bold">
                    Admin
                  </span>
                ) : (
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                )}
              </div>
            </button>
              */}
          </nav>

          <div className="pt-2 border-t border-slate-200 text-xs space-y-2">
            <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase px-2">
              Statistik Rekam Medis
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 shadow-2xs">
                <div className="text-[10px] text-slate-500">Total Pasien</div>
                <div className="text-base font-bold text-slate-800 font-mono">{records.length}</div>
              </div>
              <div className="bg-emerald-50/70 p-2 rounded-lg border border-emerald-200/80 shadow-2xs">
                <div className="text-[10px] text-emerald-700 font-medium">Status Fit</div>
                <div className="text-base font-bold text-emerald-700 font-mono">{fitCount}</div>
              </div>
              <div className="bg-blue-50/70 p-2 rounded-lg border border-blue-200/80 shadow-2xs">
                <div className="text-[10px] text-blue-700 font-medium">Laki-Laki</div>
                <div className="text-sm font-bold text-blue-800 font-mono">{maleCount}</div>
              </div>
              <div className="bg-pink-50/70 p-2 rounded-lg border border-pink-200/80 shadow-2xs">
                <div className="text-[10px] text-pink-700 font-medium">Perempuan</div>
                <div className="text-sm font-bold text-pink-800 font-mono">{femaleCount}</div>
              </div>
            </div>

            {/* Admin Status Card */}
            <div className={`mt-3 p-2.5 rounded-xl border flex items-center justify-between text-xs transition-colors shadow-2xs ${
              isAdmin
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}>
              <div className="flex items-center gap-2">
                <div className={`p-1 rounded-md ${isAdmin ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200/80 text-slate-600'}`}>
                  {isAdmin ? <ShieldCheck className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-800">
                    {isAdmin ? 'Admin Terverifikasi' : 'Akses Database Dikunci'}
                  </div>
                  <div className="text-[9px] text-slate-500">
                    {isAdmin ? 'Akses penuh database' : 'Perlu PIN Admin'}
                  </div>
                </div>
              </div>
              {isAdmin ? (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setIsChangePinOpen(true)}
                    className="p-1 hover:bg-slate-200 text-slate-600 hover:text-amber-700 rounded border border-slate-200 cursor-pointer"
                    title="Ubah PIN Admin"
                  >
                    <KeyRound className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={handleLockAdmin}
                    className="px-2 py-1 bg-amber-100 hover:bg-amber-200 text-[10px] font-bold text-amber-800 rounded border border-amber-300 cursor-pointer shadow-2xs"
                    title="Kunci kembali sesi admin"
                  >
                    Kunci
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setIsAdminLoginOpen(true)}
                    className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-[10px] font-bold text-white rounded shadow-xs cursor-pointer"
                  >
                    Login
                  </button>
                </div>
              )}
            </div>

            {/* Tombol Kembali ke Halaman Depan / Portal */}
            <button
              type="button"
              onClick={handleReturnToPortal}
              className="w-full mt-2.5 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 text-[11px] font-semibold border border-slate-200 transition-all cursor-pointer shadow-2xs"
              title="Kembali ke Halaman Pembuka (Portal)"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar ke Halaman Depan</span>
            </button>
          </div>
        </div>

      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <main className="flex-1 max-w-6xl w-full mx-auto p-3 sm:p-5 lg:p-6 flex flex-col">
          
          <HeaderNavbar
            currentRecord={currentRecord}
            onChange={handleUpdateCurrentRecord}
            enableEdit={enableEdit}
            onToggleEdit={setEnableEdit}
            onOpenReport={() => setIsReportOpen(true)}
            onOpenExcelModal={handleOpenExcelImport}
            onOpenDataList={handleOpenDatabase}
            onOpenScheduleTracker={() => setIsScheduleTrackerOpen(true)}
            savedRecords={records}
            onSelectRecord={handleSelectRecordById}
            onLoadPatientByBadge={handleLoadPatientByBadge}
            onOpenBadgePage={handleOpenBadgePage}
            isAdmin={isAdmin}
            isCloudConnected={isCloudConnected}
          />

          <ScheduleReminderBanner record={currentRecord} />

          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden flex-1 flex flex-col">
            
            <div className="flex flex-wrap items-center justify-between border-b border-slate-200 bg-slate-50/80 px-3 pt-2 gap-2">
              <div className="flex flex-wrap gap-1">
                {TABS.map((tabName) => {
                  const isActive = activeTab === tabName;
                  return (
                    <button
                      key={tabName}
                      id={`tab-btn-${tabName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                      type="button"
                      onClick={() => setActiveTab(tabName)}
                      className={`px-3.5 py-2 text-xs font-bold uppercase tracking-wider transition-all border-t-2 -mb-px rounded-t-md cursor-pointer ${
                        isActive
                          ? 'bg-white border-blue-600 text-blue-700 shadow-2xs font-black'
                          : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                      }`}
                    >
                      {tabName}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-3 sm:p-4 flex-1">
              {activeTab === 'UMUM' && (
                <TabUmum
                  data={currentRecord}
                  onChange={handleUpdateCurrentRecord}
                  disabled={!enableEdit}
                  onNextTab={handleNextTab}
                />
              )}

              {activeTab === 'FISIK' && (
                <TabFisik
                  data={currentRecord}
                  onChange={handleUpdateCurrentRecord}
                  disabled={!enableEdit}
                  onNextTab={handleNextTab}
                  onPrevTab={handlePrevTab}
                />
              )}

              {activeTab === 'FISIK (2)' && (
                <TabFisik2
                  data={currentRecord}
                  onChange={handleUpdateCurrentRecord}
                  disabled={!enableEdit}
                  onNextTab={handleNextTab}
                  onPrevTab={handlePrevTab}
                />
              )}

              {activeTab === 'LABORATORIUM' && (
                <TabLaboratorium
                  data={currentRecord}
                  onChange={handleUpdateCurrentRecord}
                  disabled={!enableEdit}
                  onNextTab={handleNextTab}
                  onPrevTab={handlePrevTab}
                />
              )}

              {activeTab === 'KIMIA KLINIK' && (
                <TabKimiaKlinik
                  data={currentRecord}
                  onChange={handleUpdateCurrentRecord}
                  disabled={!enableEdit}
                  onNextTab={handleNextTab}
                  onPrevTab={handlePrevTab}
                />
              )}

              {activeTab === 'SARAN DR' && (
                <TabSaranDr
                  data={currentRecord}
                  onChange={handleUpdateCurrentRecord}
                  disabled={!enableEdit}
                  onPrevTab={handlePrevTab}
                  onSaveData={handleSaveData}
                />
              )}
            </div>
          </div>

          <BottomBar
            data={currentRecord}
            onChange={handleUpdateCurrentRecord}
            onSaveData={handleSaveData}
            onClearForm={handleClearForm}
            onOpenReport={() => setIsReportOpen(true)}
            onAutoGenerate={() => handleAutoGenerateTab('ALL')}
            activeTab={activeTab}
          />
        </main>

        <footer className="py-3 text-center text-[11px] text-slate-500 bg-white border-t border-slate-200 mt-auto">
          Rumah Sakit PT Pusri Palembang &bull; Unit Medical Check Up (MCU) Berkala Karyawan PT Pupuk Sriwidjaja &bull; Siklus: Pria (1 Thn) | Wanita (2 Thn)
        </footer>
      </div>

      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        record={currentRecord}
      />

      <ExcelImportModal
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
        onImportRecords={handleImportRecords}
        isAdmin={isAdmin}
        onRequestAdminLogin={() => {
          setAdminLoginPurpose('EXCEL_IMPORT');
          setIsAdminLoginOpen(true);
        }}
      />

      <ScheduleTrackerModal
        isOpen={isScheduleTrackerOpen}
        onClose={() => setIsScheduleTrackerOpen(false)}
        records={records}
        onSelectRecord={async (rec) => {
          if (!rec.badge) {
            setCurrentRecord(rec);
            setCurrentPage('MCU_DETAIL');
            setActiveTab('UMUM');
            setIsScheduleTrackerOpen(false);
            return;
          }

          try {
            const res = await fetch(`${API_BASE_URL}/api/records/badge/${rec.badge.trim()}?id=${encodeURIComponent(rec.id)}&is_spouse=${rec.isSpouse || false}&test_tahun=${rec.testTahun || '2026'}`);
            const json = await res.json();

            if (json.success && json.data) {
              const recordData = json.data.mcuRecord || json.data;
              if (recordData && (recordData.badge || recordData.id)) {
                setCurrentRecord(recordData);
                sessionStorage.setItem('pusri_active_mcu_id', recordData.id);
                sessionStorage.setItem('pusri_active_mcu_badge', recordData.badge);
                sessionStorage.setItem('pusri_active_mcu_is_spouse', String(recordData.isSpouse || false));
                sessionStorage.setItem('pusri_active_mcu_year', recordData.testTahun || '2026');
                showToast(`✅ Berhasil memuat data dari Database untuk Badge ${recordData.badge}`);
              } else {
                setCurrentRecord(rec);
              }
            } else {
              setCurrentRecord(rec);
            }
          } catch (err) {
            console.error("Gagal mengambil detail dari API, menggunakan data lokal:", err);
            setCurrentRecord(rec);
          }

          setCurrentPage('MCU_DETAIL');
          setActiveTab('UMUM');
          setIsScheduleTrackerOpen(false);
        }}
      />

      <DataListModal
        isOpen={isDataListOpen}
        onClose={() => setIsDataListOpen(false)}
        records={records}
        onSelectRecord={async (rec) => {
          if (!rec.badge) {
            setCurrentRecord(rec);
            setCurrentPage('MCU_DETAIL');
            setActiveTab('UMUM');
            setIsDataListOpen(false);
            return;
          }

          try {
            const res = await fetch(`${API_BASE_URL}/api/records/badge/${rec.badge.trim()}?id=${encodeURIComponent(rec.id)}&is_spouse=${rec.isSpouse || false}&test_tahun=${rec.testTahun || '2026'}`);
            const json = await res.json();

            if (json.success && json.data) {
              const recordData = json.data.mcuRecord || json.data;
              if (recordData && (recordData.badge || recordData.id)) {
                setCurrentRecord(recordData);
                sessionStorage.setItem('pusri_active_mcu_id', recordData.id);
                sessionStorage.setItem('pusri_active_mcu_badge', recordData.badge);
                sessionStorage.setItem('pusri_active_mcu_is_spouse', String(recordData.isSpouse || false));
                sessionStorage.setItem('pusri_active_mcu_year', recordData.testTahun || '2026');
                showToast(` Berhasil memuat data dari Database untuk Badge ${recordData.badge}`);
              } else {
                setCurrentRecord(rec);
              }
            } else {
              setCurrentRecord(rec);
            }
          } catch (err) {
            setCurrentRecord(rec);
          }

          setCurrentPage('MCU_DETAIL');
          setActiveTab('UMUM');
          setIsDataListOpen(false);
        }}
        onDeleteRecord={handleDeleteRecord}
       
        onLockAdmin={handleLockAdmin}
        onChangeAdminPin={() => setIsChangePinOpen(true)}
      />

      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => {
          setIsAdminLoginOpen(false);
          setAdminLoginPurpose(null);
        }}
        onSuccess={handleAdminLoginSuccess}
        onOpenChangePin={() => setIsChangePinOpen(true)}
        purpose={adminLoginPurpose}
      />

      <ChangeAdminPinModal
        isOpen={isChangePinOpen}
        onClose={() => setIsChangePinOpen(false)}
        onSuccess={handlePinChangeSuccess}
        isAlreadyAuthenticated={isAdmin}
      />

      <ConfirmSaveModal
        isOpen={isConfirmSaveOpen}
        onClose={() => setIsConfirmSaveOpen(false)}
        onConfirm={handleConfirmSave}
        record={currentRecord}
        activeTab={activeTab}
        isSaving={isSavingRecord}
        isExistingRecord={records.some((r) => r.id === currentRecord.id || (Boolean(r.badge && currentRecord.badge) && r.badge.toLowerCase() === currentRecord.badge.toLowerCase()))}
      />

      <MySqlManagerModal
        isOpen={isMySqlOpen}
        onClose={() => setIsMySqlOpen(false)}
        records={records}
      />
    </div>
  );
}