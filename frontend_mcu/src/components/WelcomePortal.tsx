import React from 'react';
import { RsPusriLogo } from './RsPusriLogo';
import { ArrowRight, Building2, Activity } from 'lucide-react';

interface WelcomePortalProps {
  onEnter: () => void;
}

export const WelcomePortal: React.FC<WelcomePortalProps> = ({ onEnter }) => {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 overflow-hidden font-sans selection:bg-blue-500 selection:text-white">
      
      {/* Background Pusri Factory Image - Crystal Clear, Zero Blur */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          src="/pusri_factory_bg.jpg"
          alt="Kompleks Pabrik PT Pupuk Sriwidjaja Palembang"
          className="w-full h-full object-cover object-center brightness-100 contrast-105"
          referrerPolicy="no-referrer"
        />
        {/* Subtle Darkening Overlay to ensure crisp contrast without blurring any factory details */}
        <div className="absolute inset-0 bg-slate-950/30"></div>
      </div>

      {/* Clean Translucent Card - Zero Blur so the factory background remains 100% sharp and visible */}
      <div className="relative z-10 w-full max-w-2xl rounded-3xl bg-slate-950/65 border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.8)] p-6 sm:p-9 space-y-6 text-white transition-all hover:border-white/30">
        
        {/* Top Header Row: Centered Logos */}
        <div className="flex items-center justify-center pb-5 border-b border-white/15">
          <div className="flex items-center justify-center gap-3.5 sm:gap-4">
            <div className="flex items-center justify-center shrink-0 hover:scale-105 transition-transform" title="PT Pupuk Sriwidjaja Palembang">
              <img
                src="/logo.png"
                alt="Logo PT Pusri Palembang"
                className="h-10 sm:h-12 w-auto object-contain drop-shadow-md select-none"
                referrerPolicy="no-referrer"
              />
            </div>
            
            <div className="h-8 sm:h-9 w-px bg-white/25"></div>

            <div className="flex items-center hover:scale-105 transition-transform" title="PT Graha Pusri Medika - RS Pusri">
              <RsPusriLogo size="sm" variant="white" />
            </div>
          </div>
        </div>

        {/* Title Section */}
        <div className="space-y-2 text-center pt-1">
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase drop-shadow-md">
            SISTEM INFORMASI MEDICAL CHECK UP
          </h1>
          <p className="text-xs sm:text-sm text-slate-200 font-medium flex items-center justify-center gap-1.5 drop-shadow-xs">
            <Building2 className="w-4 h-4 text-slate-300 shrink-0" />
            <span>Pabrik PT Pupuk Sriwidjaja Palembang &bull; RS Pusri</span>
          </p>
        </div>

        {/* Direct Action 1-Click Button */}
        <div className="space-y-3 pt-1">
          <button
            type="button"
            onClick={onEnter}
            className="w-full group relative flex items-center justify-center gap-3 py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-extrabold text-sm sm:text-base tracking-wide shadow-xl shadow-blue-600/40 hover:shadow-blue-500/60 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer border border-blue-400/40"
          >
            <Activity className="w-5 h-5 text-blue-200 animate-pulse" />
            <span>MASUK KE HALAMAN MCU</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform text-white" />
          </button>

          <div className="flex items-center justify-center gap-2 text-[11px] text-slate-200 font-medium drop-shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>Akses Cepat 1-Klik &bull; Langsung terbuka tanpa perlu kata sandi</span>
          </div>
        </div>

        {/* Institutional Footer */}
        <div className="pt-3 border-t border-white/15 text-center text-[10px] text-slate-300 font-medium drop-shadow-xs">
          PT Graha Pusri Medika &bull; PT Pupuk Sriwidjaja Palembang &bull; Pupuk Indonesia Holding
        </div>

      </div>

    </div>
  );
};
