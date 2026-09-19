import React, { useState } from 'react';
import { 
  Award, 
  Smartphone, 
  Map, 
  Sparkles, 
  ShieldCheck, 
  ChevronRight, 
  Users, 
  X,
  Compass
} from 'lucide-react';

interface DemoGuideCardProps {
  onOpenSainteLague: () => void;
  onOpenSaksiPortal: () => void;
  onOpenTerritoryMap: () => void;
  onSwitchRole?: (role: string) => void;
  currentRole?: string;
}

export function DemoGuideCard({
  onOpenSainteLague,
  onOpenSaksiPortal,
  onOpenTerritoryMap,
  onSwitchRole,
  currentRole = 'demo'
}: DemoGuideCardProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) {
    return (
      <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-950 text-white rounded-2xl shadow-xs border border-indigo-500/30 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold text-indigo-200">Mode Simulasi Interaktif (Demo Sandbox)</span>
          <span className="hidden sm:inline text-slate-400 text-[11px]">— Data mock aman untuk eksplorasi.</span>
        </div>
        <button
          onClick={() => setIsDismissed(false)}
          className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-300 hover:text-white underline cursor-pointer"
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Buka Panduan Uji</span>
        </button>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-indigo-500/30">
      {/* Background Decorative Accent */}
      <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Top Header Bar */}
      <div className="flex items-start justify-between gap-3 relative z-10 mb-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-[11px] font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Sesi Demonstrasi Interaktif Caleg</span>
            <span className="mx-1 text-indigo-400/50">•</span>
            <span className="text-emerald-400 font-mono">Sandbox Aman</span>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Panduan Uji Cepat Sistem Cakra Elektoral</span>
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Eksplorasi kemampuan War Room pemenangan Anda. Klik salah satu dari 3 skenario unggulan berikut untuk melihat simulasi real-time:
          </p>
        </div>

        <button
          onClick={() => setIsDismissed(true)}
          className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
          title="Sembunyikan panduan"
          aria-label="Tutup panduan"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* 3 Core Interactive Test Scenarios */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 relative z-10 my-4">
        {/* Scenario 1: Sainte-Laguë */}
        <button
          onClick={onOpenSainteLague}
          className="group text-left p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-indigo-400/50 transition-all duration-200 cursor-pointer flex flex-col justify-between"
        >
          <div className="space-y-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center border border-amber-500/30 group-hover:scale-105 transition-transform">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">Skenario 1</div>
              <h3 className="text-sm font-black text-white group-hover:text-amber-200 transition-colors">
                Kalkulator Sainte-Laguë
              </h3>
              <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                Uji perhitungan pembagi 1, 3, 5, 7, 9 kursi DPRD & deteksi margin keamanan kursi terakhir.
              </p>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-xs font-bold text-amber-300 group-hover:translate-x-0.5 transition-transform">
            <span>Buka Simulasi Kursi</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </button>

        {/* Scenario 2: Saksi Phone Simulator */}
        <button
          onClick={onOpenSaksiPortal}
          className="group text-left p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-400/50 transition-all duration-200 cursor-pointer flex flex-col justify-between"
        >
          <div className="space-y-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center border border-emerald-500/30 group-hover:scale-105 transition-transform">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider">Skenario 2</div>
              <h3 className="text-sm font-black text-white group-hover:text-emerald-200 transition-colors">
                Uji Handphone Saksi TPS
              </h3>
              <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                Simulasi saksi TPS: Absen geofencing GPS, foto C1 Plano, validasi angka, dan kuncian honor.
              </p>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-xs font-bold text-emerald-300 group-hover:translate-x-0.5 transition-transform">
            <span>Buka Portal Saksi HP</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </button>

        {/* Scenario 3: Territorial Map Radar */}
        <button
          onClick={onOpenTerritoryMap}
          className="group text-left p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-indigo-400/50 transition-all duration-200 cursor-pointer flex flex-col justify-between"
        >
          <div className="space-y-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center border border-indigo-500/30 group-hover:scale-105 transition-transform">
              <Map className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider">Skenario 3</div>
              <h3 className="text-sm font-black text-white group-hover:text-indigo-200 transition-colors">
                Radar Peta Teritori GIS
              </h3>
              <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                Inspeksi pergerakan suara per desa di Ponorogo, deteksi desa rawan, dan TPS Loksus Pondok Gontor.
              </p>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-xs font-bold text-indigo-300 group-hover:translate-x-0.5 transition-transform">
            <span>Buka Radar Geospasial</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </button>
      </div>

      {/* Perspective Switcher for Complete Empathy */}
      {onSwitchRole && (
        <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs relative z-10">
          <div className="flex items-center gap-2 text-slate-300">
            <Users className="w-4 h-4 text-indigo-400 shrink-0" />
            <span className="font-medium">Uji Tampilan Sebagai Peran Lain:</span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => onSwitchRole('demo')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                currentRole === 'demo'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white/10 text-slate-300 hover:bg-white/20'
              }`}
            >
              Caleg / Komando (Demo)
            </button>
            <button
              onClick={() => onSwitchRole('relawan')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                currentRole === 'relawan'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white/10 text-slate-300 hover:bg-white/20'
              }`}
            >
              Relawan Mobile
            </button>
            <button
              onClick={() => onSwitchRole('koordinator')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                currentRole === 'koordinator'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white/10 text-slate-300 hover:bg-white/20'
              }`}
            >
              Korcam Wilayah
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
