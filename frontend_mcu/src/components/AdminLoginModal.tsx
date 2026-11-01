import React, { useState } from 'react';
import { ShieldCheck, Lock, Eye, EyeOff, X, AlertCircle, Settings, Loader2, FileSpreadsheet, KeyRound } from 'lucide-react';
import { verifyAdminPin, verifyAdminPinAsync, setAdminSession, resetAdminPinToDefault } from '../utils/adminAuth';
import { API_BASE_URL } from '../config/api';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onOpenChangePin?: () => void;
  purpose?: 'DATABASE' | 'EXCEL_IMPORT' | null;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onOpenChangePin,
  purpose = 'DATABASE'
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [rememberSession, setRememberSession] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isVerifying) return;
    setError('');

    const cleanInput = password.trim();

    if (!cleanInput) {
      setError('Silakan masukkan password atau PIN admin.');
      return;
    }

    // Kirim verifikasi langsung ke API Backend Go (Database PostgreSQL)
    setIsVerifying(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/verify-pin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: cleanInput })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        if (rememberSession) {
          setAdminSession(true);
        }
        setPassword('');
        setError('');
        onSuccess();
        return;
      }
      setError('Password atau PIN salah. Akses ditolak.');
    } catch (err) {
      console.error('Error verifying pin:', err);
      setError('Gagal terhubung ke server backend.');
    } finally {
      setIsVerifying(false);
    }
    };

    

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 p-0.5 flex items-center justify-center shrink-0 border border-white/20 overflow-hidden">
              <img
                src="/logo_sm.png"
                alt="Logo PT Pusri"
                className="h-full w-auto object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h3 className="font-bold text-sm leading-tight text-white flex items-center gap-1.5">
                {purpose === 'EXCEL_IMPORT' ? 'OTORISASI IMPOR EXCEL' : 'OTORISASI AKSES DATABASE'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {purpose === 'EXCEL_IMPORT'
                  ? 'Mode Admin Diperlukan untuk Impor Data MCU Massal'
                  : 'Hak Akses Khusus Administrator Medis RS PT Pusri'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setPassword('');
              setError('');
              onClose();
            }}
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          
          <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-3 flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-700 leading-relaxed">
              {purpose === 'EXCEL_IMPORT' ? (
                <span>
                  Impor data MCU massal melalui file Excel akan memperbarui basis data pasien. Masukkan <strong>PIN / Password Admin</strong> untuk membuka akses impor.
                </span>
              ) : (
                <span>
                  Data rekam medis pasien bersifat rahasia. PIN Admin tersinkronisasi otomatis secara <strong> Real-Time</strong> di seluruh perangkat (laptop, PC, & HP).
                </span>
              )}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Password / PIN Otorisasi Admin
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Masukkan PIN / Password Admin..."
                autoFocus
                className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 transition-all outline-hidden"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                title={showPassword ? 'Sembunyikan' : 'Tampilkan'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 text-slate-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberSession}
                onChange={(e) => setRememberSession(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
              <span>Ingat sesi admin selama browser dibuka</span>
            </label>

            {onOpenChangePin && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenChangePin();
                }}
                className="text-blue-600 hover:text-blue-800 font-semibold hover:underline cursor-pointer flex items-center gap-1"
              >
                <Settings className="w-3 h-3" />
                <span>Ubah PIN</span>
              </button>
            )}
          </div>

          {/* Modal Actions */}
          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setPassword('');
                setError('');
                onClose();
              }}
              className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isVerifying}
              className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-blue-600/30 flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Memverifikasi...</span>
                </>
              ) : purpose === 'EXCEL_IMPORT' ? (
                <>
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Buka Impor Excel</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Buka Database</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
