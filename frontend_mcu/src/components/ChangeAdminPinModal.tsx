import React, { useState } from 'react';
import { KeyRound, Lock, Eye, EyeOff, X, CheckCircle2, AlertCircle, ShieldCheck, RotateCcw, Loader2, Database } from 'lucide-react';
import { verifyAdminPin, verifyAdminPinAsync, setAdminPin, resetAdminPinToDefault, isCustomPinSet, DEFAULT_ADMIN_PIN } from '../utils/adminAuth';
import { API_BASE_URL } from '../config/api';

interface ChangeAdminPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newPin: string) => void;
  isAlreadyAuthenticated?: boolean;
}

export const ChangeAdminPinModal: React.FC<ChangeAdminPinModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  isAlreadyAuthenticated = false
}) => {
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  const [showOldPin, setShowOldPin] = useState(false);
  const [showNewPin, setShowNewPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleResetForm = () => {
    setOldPin('');
    setNewPin('');
    setConfirmPin('');
    setError('');
    setSuccessMsg('');
    setIsSaving(false);
  };

  const handleClose = () => {
    handleResetForm();
    onClose();
  };

 const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    setError('');
    setSuccessMsg('');

    // 1. Wajib isi PIN lama untuk verifikasi keamanan
    if (!oldPin.trim()) {
      setError('Silakan masukkan PIN lama / saat ini untuk verifikasi keamanan.');
      return;
    }

    // 2. Validasi PIN baru
    const cleanNewPin = newPin.trim();
    if (!cleanNewPin) {
      setError('Silakan tentukan PIN / Password baru.');
      return;
    }

    if (cleanNewPin.length < 4) {
      setError('PIN baru minimal harus terdiri dari 4 karakter.');
      return;
    }

    if (cleanNewPin !== confirmPin.trim()) {
      setError('Konfirmasi PIN baru tidak cocok dengan PIN baru.');
      return;
    }

    // 3. Kirim data ke API Backend Go (Database PostgreSQL)
    setIsSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/change-pin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          oldPin: oldPin.trim(),
          newPin: cleanNewPin,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'PIN lama salah atau gagal memperbarui PIN di database.');
      }

      setSuccessMsg('Password Admin berhasil diperbarui di database PostgreSQL!');
      
      setTimeout(() => {
        onSuccess(cleanNewPin);
        handleClose();
      }, 900);
    } catch (err: any) {
      console.error('Failed to update admin pin:', err);
      setError(err?.message || 'Gagal terhubung ke server backend atau PIN lama salah.');
    } finally {
      setIsSaving(false);
    }
  };


  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm leading-tight text-white flex items-center gap-1.5">
                UBAH PIN / PASSWORD ADMIN
              </h3>
              <p className="text-[11px] text-slate-400">
                Pengaturan Hak Akses Database MCU RS PT Pusri
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-600 leading-relaxed">
              Gunakan PIN / Password yang aman dan hanya diketahui oleh administrator berwenang. Status proteksi: 
              <strong className="text-emerald-700 ml-1 font-semibold">
                Aktif & Terenkripsi
              </strong>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

       {/* Input PIN Lama (Wajib diisi untuk keamanan) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              PIN / Password Lama <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showOldPin ? 'text' : 'password'}
                value={oldPin}
                onChange={(e) => {
                  setOldPin(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Masukkan PIN saat ini..."
                className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 transition-all outline-hidden"
              />
              <button
                type="button"
                onClick={() => setShowOldPin(!showOldPin)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                title={showOldPin ? 'Sembunyikan' : 'Tampilkan'}
              >
                {showOldPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Input PIN Baru */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              PIN / Password Baru <span className="text-slate-400 font-normal">(Min. 4 Karakter)</span>
            </label>
            <div className="relative">
              <input
                type={showNewPin ? 'text' : 'password'}
                value={newPin}
                onChange={(e) => {
                  setNewPin(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Masukkan PIN baru..."
                className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 transition-all outline-hidden"
              />
              <button
                type="button"
                onClick={() => setShowNewPin(!showNewPin)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                title={showNewPin ? 'Sembunyikan' : 'Tampilkan'}
              >
                {showNewPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Input Konfirmasi PIN Baru */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Konfirmasi PIN Baru
            </label>
            <div className="relative">
              <input
                type={showConfirmPin ? 'text' : 'password'}
                value={confirmPin}
                onChange={(e) => {
                  setConfirmPin(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Ulangi PIN baru..."
                className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 transition-all outline-hidden"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPin(!showConfirmPin)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                title={showConfirmPin ? 'Sembunyikan' : 'Tampilkan'}
              >
                {showConfirmPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>


          {/* Modal Actions */}
          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-blue-600/30 flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Menyimpan ke Database...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Simpan PIN Baru</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
