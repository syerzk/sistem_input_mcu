import React, { useState, useRef, useEffect, FormEvent, ClipboardEvent, KeyboardEvent } from 'react';
import { 
  User, Lock, Eye, EyeOff, AlertCircle, Loader2, 
  ShieldCheck, Stethoscope, Check, Mail, ArrowLeft, Activity 
} from 'lucide-react';
import { requestPasswordResetEmail, submitPasswordReset } from '../services/Service';
import { API_BASE_URL } from '../config/api'; 
import { setAuthSession } from '../utils/adminAuth'; // Sesuaikan path foldernya jika perlu

interface LoginMCUProps {
  onLoginSuccess?: (userData?: { role: string; nama: string; token?: string }) => void;
}

type ViewType = 'login' | 'admin' | 'lupa';

export default function LoginMCU({ onLoginSuccess }: LoginMCUProps) {
  const [adminData, setAdminData] = useState<any>(null);
  const [currentView, setCurrentView] = useState<ViewType>('login');
  const [adminStep, setAdminStep] = useState<number>(1);
  const [lupaStep, setLupaStep] = useState<number>(1);

  // Form Inputs (Pegawai / Dokter)
  const [nik, setNik] = useState<string>('');
  const [pw, setPw] = useState<string>('');
  const [showPw, setShowPw] = useState<boolean>(false);
  const [rememberNik, setRememberNik] = useState<boolean>(false);

  // Admin Inputs
  const [anik, setAnik] = useState<string>('');
  const [apw, setApw] = useState<string>('');
  const [showApw, setShowApw] = useState<boolean>(false);
  const [otpValues, setOtpValues] = useState<string[]>(['', '', '', '', '', '']);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

 // Lupa Password Inputs (Email & Pemberitahuan Email)
  const [resetEmail, setResetEmail] = useState<string>('');
  const [resetNotice, setResetNotice] = useState<string>(
    'Jika email terdaftar pada sistem, pemberitahuan dan instruksi pemulihan kata sandi telah dikirimkan.'
  );

  // Reset Password via Token dari Email (?reset_token=...)
  const [resetToken, setResetToken] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showNewPw, setShowNewPw] = useState<boolean>(false);
  const [showConfirmPw, setShowConfirmPw] = useState<boolean>(false);
  const [resetSuccessMsg, setResetSuccessMsg] = useState<string>('');

  // Pesan Error & Loading
  const [errorMsg, setErrorMsg] = useState({ login: '', admin: '', otp: '', lupa: '', rst: '' });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const applyResetTokenFromLocation = () => {
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = (params.get('reset_token') || '').trim();
    if (tokenFromUrl) {
      setResetToken(tokenFromUrl);
      setCurrentView('lupa');
      setLupaStep(3);
    }
    };

    applyResetTokenFromLocation();
    window.addEventListener('popstate',applyResetTokenFromLocation);
    return () => {
      window.removeEventListener('popstate', applyResetTokenFromLocation);
    };
  }, []);
  
 
  const navigateTo = (viewHash: string) => {
    if (viewHash === 'admin') {
      setCurrentView('admin');
      setAdminStep(1);
    } else if (viewHash === 'lupa-password') {
      setCurrentView('lupa');
      setLupaStep(1);
    } else {
      setCurrentView('login');
    }
  };

  // 1. Integrasi Login Pegawai / Dokter ke Backend Go (/api/auth/login)
  const handleLoginSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!nik.trim() || !pw) {
      setErrorMsg(prev => ({ ...prev, login: 'NIK dan kata sandi wajib diisi.' }));
      return;
    }
    setErrorMsg(prev => ({ ...prev, login: '' }));
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: nik.trim(), password: pw })
      });
      const json = await response.json();

      setIsLoading(false);

      if (!response.ok || !json.success) {
        setErrorMsg(prev => ({ ...prev, login: json.error || 'Gagal masuk. Periksa kembali NIK dan kata sandi.' }));
        return;
      }

      const userData = json.data;
      
      if (userData.role === 'admin') {
        setAnik(nik.trim());
        setApw(pw);
        setCurrentView('admin');
        setAdminStep(2);
        return;
      }

      setAuthSession({
        token: userData.token,
        role: userData.role,
        username: nik.trim(),
        nama: userData.nama
      });

      localStorage.setItem('pusri_mcu_user', JSON.stringify(userData));
      if (userData.token) {
        localStorage.setItem('pusri_mcu_token', userData.token);
      }

      // Langsung panggil sukses login tanpa nyangkut di halaman sukses statis
      if (onLoginSuccess) {
        onLoginSuccess({ role: userData.role, nama: userData.nama, token: userData.token });
      }

    } catch (err) {
      setIsLoading(false);
      setErrorMsg(prev => ({ ...prev, login: 'Tidak dapat terhubung ke server backend (Port 8080).' }));
    }
  };

  // 2. Step 1 Admin: Validasi Kredensial Awal ke Backend
  const handleAdminStep1 = async (e: FormEvent) => {
    e.preventDefault();
    if (!anik.trim() || !apw) {
      setErrorMsg(prev => ({ ...prev, admin: 'NIK dan kata sandi wajib diisi.' }));
      return;
    }
    setErrorMsg(prev => ({ ...prev, admin: '' }));
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: anik.trim(), password: apw })
      });
      const json = await response.json();

      setIsLoading(false);

      if (!response.ok || !json.success) {
        setErrorMsg(prev => ({ ...prev, admin: json.error || 'Kredensial administrator salah.' }));
        return;
      }
      setAdminData(json.data);
      setAdminStep(2);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);

    } catch (err) {
      setIsLoading(false);
      setErrorMsg(prev => ({ ...prev, admin: 'Gagal terhubung ke server backend.' }));
    }
  };

  const handleOtpInput = (index: number, value: string) => {
    const cleanVal = value.replace(/\D/g, '');
    const newOtp = [...otpValues];
    newOtp[index] = cleanVal;
    setOtpValues(newOtp);
    if (cleanVal && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: ClipboardEvent<HTMLDivElement>) => {
    const pasteData = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, 6);
    if (pasteData) {
      e.preventDefault();
      const newOtp = [...otpValues];
      [...pasteData].forEach((char, idx) => { newOtp[idx] = char; });
      setOtpValues(newOtp);
    }
  };

  const isOtpComplete = otpValues.every(val => val !== '');

  // 3. Step 2 Admin: Verifikasi Kode OTP ke Backend Go (/api/auth/verify-otp)
  const handleOtpVerify = async () => {
    if (!isOtpComplete) return;
    const code = otpValues.join('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: anik.trim(), otpCode: code })
      });
      const json = await response.json();

      setIsLoading(false);

      if (!response.ok || !json.success) {
        setOtpValues(['', '', '', '', '', '']);
        setErrorMsg(prev => ({ ...prev, otp: json.error || 'Kode OTP salah atau kedaluwarsa.' }));
        otpRefs.current[0]?.focus();
        return;
      }

      setErrorMsg(prev => ({ ...prev, otp: '' }));
      const userData = json.data;

      setAuthSession({
        token: userData.token,
        role: userData.role,
        username: anik.trim(),
        nama: userData.nama
      });

      localStorage.setItem('pusri_mcu_token', userData.token);
      localStorage.setItem('pusri_mcu_user', JSON.stringify(userData));
      sessionStorage.setItem('pusri_admin_session', 'true');

      if (onLoginSuccess) {
        onLoginSuccess({ role: userData.role, nama: userData.nama, token: userData.token });
      }

    } catch (err) {
      setIsLoading(false);
      setErrorMsg(prev => ({ ...prev, otp: 'Gagal terhubung ke server verifikasi OTP.' }));
    }
  };


  const handleLupaSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const cleanEmail = resetEmail.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      setErrorMsg(prev => ({ ...prev, lupa: 'Masukkan alamat email yang valid.' }));
      return;
    }

    setErrorMsg(prev => ({ ...prev, lupa: '' }));
    setIsLoading(true);

    const result = await requestPasswordResetEmail(cleanEmail);

    setIsLoading(false);

    if (!result.success) {
      setErrorMsg(prev => ({
        ...prev,
        lupa: result.error || 'Gagal mengirim permintaan pemulihan kata sandi.'
      }));
      return;
    }

    if (result.message) {
      setResetNotice(result.message);
    }
    setLupaStep(2);
  };

  const handleResetPasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!resetToken) {
      setErrorMsg(prev => ({ ...prev, rst: 'Token reset tidak valid. Silakan ulangi permintaan lupa kata sandi.' }));
      return;
    }
    if (newPassword.length < 8) {
      setErrorMsg(prev => ({ ...prev, rst: 'Kata sandi baru minimal 8 karakter.' }));
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg(prev => ({ ...prev, rst: 'Konfirmasi kata sandi tidak cocok.' }));
      return;
    }

    setErrorMsg(prev => ({ ...prev, rst: '' }));
    setIsLoading(true);

    const result = await submitPasswordReset(resetToken, newPassword);

    setIsLoading(false);

    if (!result.success) {
      setErrorMsg(prev => ({
        ...prev,
        rst: result.error || 'Tautan tidak valid atau sudah kedaluwarsa.'
      }));
      return;
    }

    setResetSuccessMsg(
      result.message || 'Kata sandi berhasil diperbarui. Silakan masuk menggunakan kata sandi baru Anda.'
    );
    window.history.replaceState(null, '', '/login');
    setLupaStep(4);
  };

  
  const isAdminMode = currentView === 'admin';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-['Plus_Jakarta_Sans',sans-serif] flex flex-col justify-between">
      {/* Header dengan logo.png */}
      <header className="flex justify-between items-center gap-3 px-4 sm:px-12 py-3 bg-white border-b border-slate-200 relative">
        <a className="flex items-center gap-3.5 text-inherit no-underline" href="/login" onClick={(e) => { e.preventDefault(); navigateTo('login'); }}>
          <div className="bg-white rounded-xl p-1 border border-slate-200 shadow-sm flex items-center justify-center h-11 w-11 overflow-hidden">
            <img 
              src="/logo.png" 
              alt="Logo PT Pusri Palembang" 
              className="h-full w-full object-contain" 
            />
          </div>
          <div className="hidden sm:block w-[1px] h-[34px] bg-slate-200"></div>
          <div>
            <small className="block text-[11px] text-slate-500 font-medium">PT Pupuk Sriwidjaja Palembang</small>
            <b className="text-[15.5px] text-[#06305F] font-extrabold tracking-tight">Sistem Informasi Medical Check Up</b>
          </div>
        </a>

        <button 
          onClick={() => navigateTo(isAdminMode ? 'login' : 'admin')}
          className="font-inherit font-bold cursor-pointer rounded-[10px] px-4 py-2.5 border-[1.5px] border-[#06305F] bg-transparent text-[#06305F] inline-flex items-center gap-2 text-xs sm:text-sm hover:bg-blue-50 transition-all"
        >
          {isAdminMode ? (
            <>
              <Stethoscope className="w-4 h-4" />
              <span>Login Pegawai dan Dokter</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4" />
              <span>Login Admin</span>
            </>
          )}
        </button>
      </header>

      {/* Split Content dengan Background Sisi Kiri Warna Navy (#06305F) */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] flex-1 min-h-[calc(100vh-75px)]">
        <aside className="bg-gradient-to-br from-[#06305F] via-[#083b75] to-[#042040] text-white p-7 sm:p-14 flex flex-col justify-center gap-7 relative overflow-hidden border-r border-blue-900">
          <div className="absolute -right-[70px] -top-[70px] w-[200px] h-[200px] rounded-full bg-amber-400/20 pointer-events-none"></div>
          <div className="absolute -right-[105px] -top-[105px] w-[270px] h-[270px] rounded-full border border-blue-400/30 pointer-events-none"></div>

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-amber-400 mb-2">
              <span className="w-6 h-[3px] bg-amber-400 rounded-sm"></span>
              PT Pupuk Sriwidjaja Palembang
            </div>
            <h2 className="m-0 text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight text-white">
              Sistem Informasi<br />
              <span className="text-amber-400">Medical Check Up</span><br />
              Karyawan
            </h2>
            <p className="mt-3 text-slate-200 text-sm sm:text-base max-w-[30em]">
              Menjaga kesehatan karyawan untuk produktivitas yang berkelanjutan.
            </p>
          </div>

          <div className="grid gap-3 max-w-[31em] relative z-10">
            <div className="flex gap-3.5 items-start p-4 rounded-xl border border-blue-800/60 bg-blue-950/40 backdrop-blur-sm shadow-sm">
              <div className="w-[38px] h-[38px] rounded-[10px] bg-amber-400 text-slate-900 flex items-center justify-center shrink-0 font-bold">
                <Activity className="w-5 h-5 text-[#06305F]" />
              </div>
              <div>
                <b className="block text-sm font-bold text-white">Aturan MCU rutin karyawan</b>
                <span className="text-xs text-slate-300">Laki-laki 1 tahun sekali, perempuan 2 tahun sekali sesuai SOP K3LH.</span>
              </div>
            </div>

            <div className="flex gap-3.5 items-start p-4 rounded-xl border border-blue-800/60 bg-blue-950/40 backdrop-blur-sm shadow-sm">
              <div className="w-[38px] h-[38px] rounded-[10px] bg-amber-400 text-slate-900 flex items-center justify-center shrink-0 font-bold">
                <ShieldCheck className="w-5 h-5 text-[#06305F]" />
              </div>
              <div>
                <b className="block text-sm font-bold text-white">Data rekam medis terlindungi</b>
                <span className="text-xs text-slate-300">Akses dibatasi sesuai peran dan tercatat dalam log audit.</span>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex items-center justify-center p-7 sm:p-4 bg-slate-50">
          {currentView === 'login' && (
            <section className="w-full max-w-[450px] bg-white border border-slate-200 rounded-[20px] p-7 sm:p-9 shadow-xl relative overflow-hidden">
              <div className="absolute left-0 right-0 top-0 h-[5px] bg-gradient-to-r from-[#06305F] via-[#06305F] to-amber-400"></div>
              
              <h1 className="text-2xl font-extrabold text-slate-900 mt-1 mb-1.5 tracking-tight">Masuk</h1>
              <p className="text-slate-500 text-sm mb-5">Gunakan akun SSO perusahaan Anda untuk mengakses aplikasi.</p>

              {errorMsg.login && (
                <div className="flex gap-2.5 items-start bg-red-50 text-red-700 border border-red-200 rounded-xl p-3 text-xs mb-4">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMsg.login}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Username / NIK</label>
                  <div className="flex items-center border-[1.5px] border-slate-300 rounded-xl bg-slate-50 transition-all focus-within:border-[#06305F] focus-within:ring-4 focus-within:ring-blue-500/10 focus-within:bg-white">
                    <User className="w-4 h-4 text-slate-400 ml-3.5 shrink-0" />
                    <input 
                      type="text" 
                      value={nik} 
                      onChange={(e) => setNik(e.target.value)} 
                      placeholder="Masukkan Username / NIK" 
                      className="w-full bg-transparent border-0 py-3 px-3 text-sm text-slate-900 focus:outline-none" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Kata sandi</label>
                  <div className="flex items-center border-[1.5px] border-slate-300 rounded-xl bg-slate-50 transition-all focus-within:border-[#06305F] focus-within:ring-4 focus-within:ring-blue-500/10 focus-within:bg-white">
                    <Lock className="w-4 h-4 text-slate-400 ml-3.5 shrink-0" />
                    <input 
                      type={showPw ? 'text' : 'password'} 
                      value={pw} 
                      onChange={(e) => setPw(e.target.value)} 
                      placeholder="Masukkan kata sandi" 
                      className="w-full bg-transparent border-0 py-3 px-3 text-sm text-slate-900 focus:outline-none" 
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPw(!showPw)} 
                      className="border-0 bg-transparent text-slate-400 px-3.5 cursor-pointer hover:text-[#06305F]"
                    >
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-600">
                    <input 
                      type="checkbox" 
                      checked={rememberNik} 
                      onChange={(e) => setRememberNik(e.target.checked)} 
                      className="w-4 h-4 accent-[#06305F] rounded" 
                    /> 
                    Ingat NIK saya
                  </label>
                  <a href="/login" onClick={(e) => { e.preventDefault(); navigateTo('lupa-password'); }} className="font-bold text-[#06305F] no-underline hover:underline">
                    Lupa kata sandi?
                  </a>
                </div>

                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-[#06305F] hover:bg-[#042040] text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Masuk</span>
                </button>
              </form>

             
              <p className="text-center text-xs text-slate-400 mt-4">Autentikasi melalui IDENTIK SSO Pupuk Indonesia</p>
            </section>
          )}

          {currentView === 'admin' && (
            <section className="w-full max-w-[450px] bg-white border border-slate-200 rounded-[20px] p-7 sm:p-9 shadow-xl relative overflow-hidden">
              <div className="absolute left-0 right-0 top-0 h-[5px] bg-gradient-to-r from-[#06305F] via-blue-700 to-amber-400"></div>

              <div className="flex gap-2 mb-5 text-xs">
                <div className={`flex-1 py-2 px-3 rounded-full text-center font-semibold border transition-all ${adminStep === 1 ? 'bg-amber-400 text-slate-900 border-amber-400 font-bold' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                  1. Verifikasi akun
                </div>
                <div className={`flex-1 py-2 px-3 rounded-full text-center font-semibold border transition-all ${adminStep === 2 ? 'bg-amber-400 text-slate-900 border-amber-400 font-bold' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                  2. Kode autentikator
                </div>
              </div>

              {adminStep === 1 && (
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-900 mb-1">Login Administrator</h1>
                  <p className="text-slate-500 text-sm mb-4">Akses khusus pengelola sistem dengan verifikasi dua langkah.</p>
                  
                  <div className="flex gap-2.5 items-start bg-amber-50 text-amber-800 border border-amber-200 rounded-xl p-3 text-xs mb-4 font-medium">
                    <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                    <span>Setiap login administrator tercatat dalam log audit.</span>
                  </div>

                  {errorMsg.admin && (
                    <div className="flex gap-2.5 items-start bg-red-50 text-red-700 border border-red-200 rounded-xl p-3 text-xs mb-4">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{errorMsg.admin}</span>
                    </div>
                  )}

                  <form onSubmit={handleAdminStep1} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Username / NIK administrator</label>
                      <div className="flex items-center border-[1.5px] border-slate-300 rounded-xl bg-slate-50 transition-all focus-within:border-[#06305F] focus-within:ring-4 focus-within:ring-blue-500/10 focus-within:bg-white">
                        <User className="w-4 h-4 text-slate-400 ml-3.5 shrink-0" />
                        <input 
                          type="text" 
                          value={anik} 
                          onChange={(e) => setAnik(e.target.value)} 
                          placeholder="Masukkan Username" 
                          className="w-full bg-transparent border-0 py-3 px-3 text-sm text-slate-900 focus:outline-none" 
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Kata sandi</label>
                      <div className="flex items-center border-[1.5px] border-slate-300 rounded-xl bg-slate-50 transition-all focus-within:border-[#06305F] focus-within:ring-4 focus-within:ring-blue-500/10 focus-within:bg-white">
                        <Lock className="w-4 h-4 text-slate-400 ml-3.5 shrink-0" />
                        <input 
                          type={showApw ? 'text' : 'password'} 
                          value={apw} 
                          onChange={(e) => setApw(e.target.value)} 
                          placeholder="Masukkan kata sandi" 
                          className="w-full bg-transparent border-0 py-3 px-3 text-sm text-slate-900 focus:outline-none" 
                        />
                        <button 
                          type="button" 
                          onClick={() => setShowApw(!showApw)} 
                          className="border-0 bg-transparent text-slate-400 px-3.5 cursor-pointer hover:text-[#06305F]"
                        >
                          {showApw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      disabled={isLoading}
                      className="w-full py-3 px-4 bg-[#06305F] hover:bg-[#042040] text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                      <span>Lanjutkan</span>
                    </button>
                  </form>

                  <a href="/login" onClick={(e) => { e.preventDefault(); navigateTo('login'); }} className="inline-flex items-center gap-1.5 text-xs font-bold text-[#06305F] no-underline mt-5 hover:underline">
                    <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke login pegawai dan dokter
                  </a>
                </div>
              )}

              {adminStep === 2 && (
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-900 mb-1">Verifikasi Dua Langkah (2FA)</h1>
                  <p className="text-slate-500 text-sm mb-4">
                    {adminData?.needsSetup 
                      ? "Akun ini belum tertaut. Silakan scan QR Code di bawah menggunakan aplikasi Google Authenticator."
                      : "Buka aplikasi Google Authenticator di ponsel Anda, lalu masukkan 6 digit kode."}
                  </p>

                  {adminData?.needsSetup && adminData?.otpAuthUrl && (
                    <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl mb-4 text-center space-y-2">
                      <div className="flex justify-center">
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(adminData.otpAuthUrl)}`} 
                          alt="QR Code Google Authenticator" 
                          className="rounded-lg border p-1 bg-white shadow-xs"
                        />
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Atau masukkan kodenya secara manual: <br />
                        <code className="font-mono font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded select-all">
                          {adminData.otpSecret}
                        </code>
                      </p>
                    </div>
                  )}

                  {errorMsg.otp && (
                    <div className="flex gap-2.5 items-start bg-red-50 text-red-700 border border-red-200 rounded-xl p-3 text-xs mb-4">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{errorMsg.otp}</span>
                    </div>
                  )}

                  <div className="flex justify-center gap-2 mb-5" onPaste={handleOtpPaste}>
                    {otpValues.map((val, idx) => (
                      <input 
                        key={idx}
                        ref={el => { otpRefs.current[idx] = el; }}
                        type="text"
                        maxLength={1}
                        inputMode="numeric"
                        value={val}
                        onChange={(e) => handleOtpInput(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        className="w-11 h-14 text-center text-xl font-extrabold bg-slate-50 border-[1.5px] border-slate-300 rounded-xl focus:border-[#06305F] focus:ring-4 focus:ring-blue-500/10 focus:bg-white focus:outline-none"
                      />
                    ))}
                  </div>

                  <button 
                    type="button"
                    onClick={handleOtpVerify}
                    disabled={!isOtpComplete || isLoading}
                    className="w-full py-3 px-4 bg-[#06305F] hover:bg-[#042040] text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>Verifikasi dan masuk</span>
                  </button>

                  <button 
                    type="button" 
                    onClick={() => setAdminStep(1)} 
                    className="border-0 bg-transparent text-[#06305F] font-bold text-xs inline-flex items-center gap-1.5 mt-4 cursor-pointer hover:underline"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Ganti akun
                  </button>
                </div>
              )}
            </section>
          )}

          {currentView === 'lupa' && (
            <section className="w-full max-w-[450px] bg-white border border-slate-200 rounded-[20px] p-7 sm:p-9 shadow-xl relative overflow-hidden">
              <div className="absolute left-0 right-0 top-0 h-[5px] bg-gradient-to-r from-[#06305F] via-[#06305F] to-amber-400"></div>

              {lupaStep === 1 && (
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-900 mb-1">Lupa kata sandi</h1>
                  <p className="text-slate-500 text-sm mb-5">
                    Masukkan alamat email terdaftar untuk menerima pemberitahuan dan instruksi pemulihan kata sandi.
                  </p>

                  {errorMsg.lupa && (
                    <div className="flex gap-2.5 items-start bg-red-50 text-red-700 border border-red-200 rounded-xl p-3 text-xs mb-4">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{errorMsg.lupa}</span>
                    </div>
                  )}

                  <form onSubmit={handleLupaSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Email</label>
                      <div className="flex items-center border-[1.5px] border-slate-300 rounded-xl bg-slate-50 transition-all focus-within:border-[#06305F] focus-within:ring-4 focus-within:ring-blue-500/10 focus-within:bg-white">
                        <Mail className="w-4 h-4 text-slate-400 ml-3.5 shrink-0" />
                        <input
                          type="email"
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                          placeholder="Masukkan email terdaftar"
                          className="w-full bg-transparent border-0 py-3 px-3 text-sm text-slate-900 focus:outline-none"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3 px-4 bg-[#06305F] hover:bg-[#042040] text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                      <span>Kirim pemberitahuan ke email</span>
                    </button>
                  </form>

                  <a
                    href="/login"
                    onClick={(e) => {
                      e.preventDefault();
                      navigateTo('login');
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#06305F] no-underline mt-5 hover:underline"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke login
                  </a>
                </div>
              )}


              {lupaStep === 2 && (
                <div className="text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-blue-100 text-[#06305F] flex items-center justify-center mx-auto">
                    <Mail className="w-7 h-7" />
                  </div>

                  <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Periksa email Anda</h1>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {resetNotice}
                    </p>
                    <p className="text-xs font-mono font-bold text-[#06305F] bg-blue-50 border border-blue-200 rounded-lg py-1.5 px-3 mt-3 inline-block break-all">
                      {resetEmail}
                    </p>
                  </div>

                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Periksa kotak masuk (<em>Inbox</em>) atau folder <em>Spam</em>. Jika akun dikelola terpusat melalui SSO perusahaan, ikuti panduan pemulihan akun SSO atau hubungi Helpdesk TI.
                  </p>

                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={handleLupaSubmit}
                    className="w-full py-2.5 px-4 border-[1.5px] border-[#06305F] text-[#06305F] hover:bg-blue-50 font-bold rounded-xl transition-all cursor-pointer disabled:opacity-50 text-xs sm:text-sm flex items-center justify-center gap-2"
                  >
                    {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>Kirim ulang pemberitahuan</span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      setLupaStep(1);
                      setResetEmail('');
                      navigateTo('login');
                    }}
                    className="w-full py-3 px-4 bg-[#06305F] hover:bg-[#042040] text-white font-bold rounded-xl transition-all shadow-md cursor-pointer text-sm"
                  >
                    Kembali ke login
                  </button>
                </div>
              )}
              {lupaStep === 3 && (
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-900 mb-1">Buat kata sandi baru</h1>
                  <p className="text-slate-500 text-sm mb-5">
                    Masukkan kata sandi baru minimal 8 karakter untuk akun Anda.
                  </p>

                  {errorMsg.rst && (
                    <div className="flex gap-2.5 items-start bg-red-50 text-red-700 border border-red-200 rounded-xl p-3 text-xs mb-4">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{errorMsg.rst}</span>
                    </div>
                  )}

                  <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Kata sandi baru</label>
                      <div className="flex items-center border-[1.5px] border-slate-300 rounded-xl bg-slate-50 transition-all focus-within:border-[#06305F] focus-within:ring-4 focus-within:ring-blue-500/10 focus-within:bg-white">
                        <Lock className="w-4 h-4 text-slate-400 ml-3.5 shrink-0" />
                        <input
                          type={showNewPw ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Minimal 8 karakter"
                          className="w-full bg-transparent border-0 py-3 px-3 text-sm text-slate-900 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPw(!showNewPw)}
                          className="border-0 bg-transparent text-slate-400 px-3.5 cursor-pointer hover:text-[#06305F]"
                        >
                          {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Konfirmasi kata sandi baru</label>
                      <div className="flex items-center border-[1.5px] border-slate-300 rounded-xl bg-slate-50 transition-all focus-within:border-[#06305F] focus-within:ring-4 focus-within:ring-blue-500/10 focus-within:bg-white">
                        <Lock className="w-4 h-4 text-slate-400 ml-3.5 shrink-0" />
                        <input
                          type={showConfirmPw ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Ulangi kata sandi baru"
                          className="w-full bg-transparent border-0 py-3 px-3 text-sm text-slate-900 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPw(!showConfirmPw)}
                          className="border-0 bg-transparent text-slate-400 px-3.5 cursor-pointer hover:text-[#06305F]"
                        >
                          {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3 px-4 bg-[#06305F] hover:bg-[#042040] text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                      <span>Simpan kata sandi baru</span>
                    </button>
                  </form>
                </div>
              )}

              {lupaStep === 4 && (
                <div className="text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                    <Check className="w-7 h-7" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Kata sandi diperbarui</h1>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {resetSuccessMsg}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setLupaStep(1);
                      setResetToken('');
                      setNewPassword('');
                      setConfirmPassword('');
                      navigateTo('login');
                    }}
                    className="w-full py-3 px-4 bg-[#06305F] hover:bg-[#042040] text-white font-bold rounded-xl transition-all shadow-md cursor-pointer text-sm"
                  >
                    Masuk dengan kata sandi baru
                  </button>
                </div>
              )}

              
            </section>
          )}
        </main>
      </div>

      <footer className="text-center py-3 text-xs text-slate-500 border-t border-slate-200 bg-white">
        &copy; {new Date().getFullYear()} PT Pupuk Sriwidjaja Palembang &bull; RS Pusri Medical Check-Up Information System
      </footer>
    </div>
  );
}