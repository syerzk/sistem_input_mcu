import React from 'react';
import { 
  Database, 
  CheckCircle2, 
  X, 
  AlertCircle, 
  User, 
  BadgeCheck, 
  Building2, 
  Calendar, 
  ArrowRight, 
  Loader2, 
  Server, 
  Cloud 
} from 'lucide-react';
import { MCURecord } from '../types';

interface ConfirmSaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  record: MCURecord;
  activeTab: string;
  isSaving: boolean;
  isExistingRecord: boolean;
}

export const ConfirmSaveModal: React.FC<ConfirmSaveModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  record,
  activeTab,
  isSaving,
  isExistingRecord
}) => {
  if (!isOpen) return null;

  const isFinalTab = activeTab === 'SARAN DR';

  const badgeClass = isExistingRecord 
    ? 'bg-amber-100 text-amber-800' 
    : 'bg-emerald-100 text-emerald-800';

  const hasilClass = record.hasilPemkes === 'Fit'
    ? 'bg-emerald-100 text-emerald-800'
    : record.hasilPemkes === 'Unfit'
    ? 'bg-rose-100 text-rose-800'
    : 'bg-amber-100 text-amber-800';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 transform transition-all animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-save-title"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/15 rounded-lg backdrop-blur-xs">
              <Database className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 id="confirm-save-title" className="text-base font-bold text-white tracking-wide">
                Konfirmasi Penyimpanan Data
              </h3>
              <p className="text-xs text-blue-100">
                {isExistingRecord ? 'Perbarui data rekam medis ke Database' : 'Tambahkan data rekam medis baru ke Database'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="p-1.5 text-blue-100 hover:text-white hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
            aria-label="Tutup dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          {/* Status banner */}
          <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-xs text-blue-900 leading-relaxed">
              <span className="font-bold block text-sm text-blue-950 mb-0.5">
                Apakah Anda yakin ingin {isExistingRecord ? 'mengupdate' : 'menyimpan'} data ini?
              </span>
              Data rekam medis MCU akan disinkronkan langsung ke <span className="font-bold">(PostgreSQL)</span> dan database lokal terhubung.
            </div>
          </div>

          {/* Patient Details Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between border-b border-slate-200 pb-2">
              <span>Informasi Karyawan & Pasien</span>1
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-500 flex items-center gap-1 text-[11px]">
                  <BadgeCheck className="w-3.5 h-3.5 text-blue-600" /> No. Badge:
                </span>
                <span className="font-bold text-slate-900 text-sm">
                  {record.badge || '-'}
                </span>
              </div>

              <div>
                <span className="text-slate-500 flex items-center gap-1 text-[11px]">
                  <User className="w-3.5 h-3.5 text-blue-600" /> Nama Lengkap:
                </span>
                <span className="font-bold text-slate-900 truncate block text-sm" title={record.nama}>
                  {record.nama || '-'}
                </span>
              </div>

              <div>
                <span className="text-slate-500 flex items-center gap-1 text-[11px]">
                  <Building2 className="w-3.5 h-3.5 text-slate-500" /> Unit Kerja:
                </span>
                <span className="font-semibold text-slate-800 truncate block" title={record.bagian}>
                  {record.bagian || '-'}
                </span>
              </div>

              <div>
                <span className="text-slate-500 flex items-center gap-1 text-[11px]">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" /> Tgl Pemeriksaan:
                </span>
                <span className="font-semibold text-slate-800">
                  {record.tanggal || '-'}
                </span>
              </div>
            </div>

            {/* MCU Result Status if available */}
            {record.hasilPemkes && (
              <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs">
                <span className="text-slate-600">Hasil Kesimpulan Pemkes:</span>
                <span className={"px-2.5 py-0.5 rounded-md font-bold text-xs " + hasilClass}>
                  {record.hasilPemkes}
                </span>
              </div>
            )}
          </div>


          <p className="text-[11px] text-slate-500 italic text-center">
            {isFinalTab 
              ? 'Setelah disimpan, seluruh data rekam medis MCU lengkap akan tersimpan permanen.'
              : 'Setelah disimpan, formulir akan otomatis berpindah ke tahap pemeriksaan berikutnya.'}
          </p>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
          >
            Batal
          </button>
          
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSaving}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg text-xs font-bold shadow-md shadow-blue-600/30 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Menyimpan ke Database...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>{isExistingRecord ? 'Ya, Update Data' : 'Ya, Insert ke Database'}</span>
                {!isFinalTab && <ArrowRight className="w-3.5 h-3.5 ml-0.5" />}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
