import React from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Zap, 
  ShieldCheck, 
  Calculator, 
  ScanLine, 
  MapPin, 
  Check, 
  X, 
  Users, 
  Crown, 
  Building2, 
  Award,
  Wallet,
  PieChart
} from 'lucide-react';

interface LandingHeroProps {
  onOpenRegister: () => void;
  onOpenLogin: () => void;
  onQuickDemo: (role: string, email: string) => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onOpenRegister,
  onOpenLogin,
  onQuickDemo
}) => {
  return (
    <>
      {/* Top Fixed Navbar */}
      <nav className="border-b border-slate-100 bg-white/90 backdrop-blur-md fixed top-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <Sparkles className="text-white w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-slate-900">
                Pemenangan<span className="text-indigo-600">AI</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-mono uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                Intelijen & Saksi TPS
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={onOpenLogin}
              className="text-xs sm:text-sm font-bold text-slate-700 hover:text-indigo-600 px-3 sm:px-4 py-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Masuk Sistem
            </button>
            <button 
              onClick={onOpenRegister}
              className="text-xs sm:text-sm font-bold bg-indigo-600 text-white px-4 sm:px-5 py-2.5 rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
            >
              Daftar Caleg Baru
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-extrabold mb-6">
              <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
              Sistem Intelijen Pemenangan AI & Saksi TPS
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1] mb-6">
              Kunci Kursi Parlemen Tanpa <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700">Bocor Budget.</span>
            </h1>
            <p className="text-base sm:text-lg text-slate-600 mb-8 leading-relaxed max-w-xl">
              Platform tertutup yang mengunci kebocoran kas kampanye, memverifikasi suara KTP berbasis geofencing GPS, dan menghitung sisa kursi KPU dengan simulator Sainte-Laguë real-time.
            </p>

            {/* Primary Dominant CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 mb-8">
              <button 
                onClick={onOpenRegister} 
                className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-2xl px-8 py-4 font-black text-base transition-all flex items-center gap-3 shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <span>Daftar Caleg Baru</span>
                <ArrowRight className="w-5 h-5 text-indigo-200" />
              </button>
              <button 
                onClick={onOpenLogin} 
                className="bg-white border-2 border-slate-200 hover:border-indigo-500 text-slate-800 hover:text-indigo-600 rounded-2xl px-7 py-4 font-black text-base transition-all hover:bg-indigo-50/50 cursor-pointer shadow-sm"
              >
                Login Gateway
              </button>
            </div>

            {/* Secondary Trial Hub (Quick Live Demo Sandbox) */}
            <div className="bg-slate-100/90 p-4 sm:p-5 rounded-3xl border border-slate-200/90 space-y-3 shadow-xs">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-mono font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                  Atau Uji Coba Langsung (1-Klik Demo):
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  ⚡ Tanpa Ketik Password
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  onClick={() => onQuickDemo('CALEG_UTAMA', 'caleg.demo@pemenangan.id')}
                  className="bg-white hover:bg-indigo-50/80 text-slate-900 border border-slate-200 hover:border-indigo-400 p-3 rounded-2xl text-left transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer shadow-xs group"
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <Crown className="w-4 h-4 text-amber-500 shrink-0" />
                    <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 truncate">1. Demo Caleg</span>
                  </div>
                  <p className="text-[11px] font-medium text-slate-500 leading-tight">War Room Executive</p>
                </button>

                <button
                  onClick={() => onQuickDemo('KORCAM', 'korcam.surabaya@pemenangan.id')}
                  className="bg-white hover:bg-indigo-50/80 text-slate-900 border border-slate-200 hover:border-indigo-400 p-3 rounded-2xl text-left transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer shadow-xs group"
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <Users className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 truncate">2. Demo Korcam</span>
                  </div>
                  <p className="text-[11px] font-medium text-slate-500 leading-tight">Manajemen Pasukan</p>
                </button>

                <button
                  onClick={() => onQuickDemo('RELAWAN_LAPANGAN', 'relawan.saksi1@pemenangan.id')}
                  className="bg-white hover:bg-indigo-50/80 text-slate-900 border border-slate-200 hover:border-indigo-400 p-3 rounded-2xl text-left transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer shadow-xs group"
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 truncate">3. Demo Relawan</span>
                  </div>
                  <p className="text-[11px] font-medium text-slate-500 leading-tight">Input KTP & C1</p>
                </button>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-200 to-purple-100 rounded-[3rem] transform rotate-3 scale-105" />
            <div className="relative bg-slate-900 rounded-[2.5rem] p-6 text-white border-4 border-white shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-xs font-mono text-slate-400 ml-2">WAR_ROOM_EXECUTIVE_AI.v5</span>
                </div>
                <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  LIVE MONITORED
                </span>
              </div>

              {/* Live Preview Dashboard Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/60">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Target Suara KPU</span>
                  <div className="text-lg font-black text-amber-400 mt-0.5">48.500 Suara</div>
                  <span className="text-[9px] text-emerald-400">Target Tercapai: 84%</span>
                </div>
                <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/60">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Audit Kas & CPV</span>
                  <div className="text-lg font-black text-indigo-400 mt-0.5">Rp 92.500 / Suara</div>
                  <span className="text-[9px] text-indigo-300">Akurat vs Pasar AI</span>
                </div>
              </div>

              <div className="bg-indigo-950/60 p-4 rounded-2xl border border-indigo-800/50 space-y-2">
                <div className="flex items-center justify-between text-xs font-extrabold text-indigo-200">
                  <span className="flex items-center gap-1.5">
                    <PieChart className="w-4 h-4 text-amber-400" />
                    Proyeksi Kursi Sainte-Laguë (Dapil 1)
                  </span>
                  <span className="text-amber-400">AMANKAN KURSI 2</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-gradient-to-r from-indigo-500 to-amber-400 h-full w-[78%]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4 AI Core Features Showcase */}
      <div className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-indigo-600">
              SOLUSI INTELIJEN PEMENANGAN
            </span>
            <h2 className="text-3xl font-black text-slate-900 mt-2">
              4 Pilar Fitur Unggulan Pemutus Kebocoran
            </h2>
            <p className="text-slate-500 text-sm mt-2">
              Dirancang khusus untuk mengamankan anggaran, memvalidasi relawan, dan mengunci suara di TPS.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:border-indigo-300 transition-all space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-base">AI Geofencing & KTP Unik</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Penguncian koordinat GPS real-time & validasi NIK 16-digit. Otomatis menolak klaim KTP ganda atau pemilih fiktif antar-relawan.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:border-indigo-300 transition-all space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-black">
                <Wallet className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-base">AI Financial Auditor</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Pemeriksaan otomatis RAB & nota logistik terhadap Kamus Harga Pasar AI untuk mencegah penggelembutan dana oleh timses.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:border-indigo-300 transition-all space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-black">
                <Calculator className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-base">Simulator Sainte-Laguë</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Hitung proyeksi sisa kursi KPU dan amankan margin suara aman per Dapil dengan rumus pembagi ganjil resmi Sainte-Laguë.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:border-indigo-300 transition-all space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">
                <ScanLine className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-base">AI OCR C1 Scanner</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Foto lembar C1 Plano TPS langsung diakui oleh AI OCR. Lengkap dengan pembubuhan QR Code enkripsi digital resmi UU ITE.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Battle Card Comparison Matrix */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-indigo-600">
              HEAD-TO-HEAD COMPARISON
            </span>
            <h2 className="text-3xl font-black text-slate-900 mt-2">
              Mengapa Sistem AI Kita Lebih Unggul?
            </h2>
            <p className="text-slate-500 text-sm mt-2">
              Bandingkan fitur canggih kami dengan aplikasi pemilu tradisional yang kaku di pasaran.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b-2 border-slate-200">
                  <th className="py-4 px-4 text-xs font-extrabold text-slate-400 uppercase tracking-wider w-1/3">Fitur & Solusi Kunci</th>
                  <th className="py-4 px-4 text-xs font-extrabold text-rose-500 uppercase tracking-wider w-1/3 bg-rose-50/50 rounded-t-2xl">Aplikasi Pemilu Tradisional ❌</th>
                  <th className="py-4 px-4 text-xs font-extrabold text-indigo-600 uppercase tracking-wider w-1/3 bg-indigo-50/50 rounded-t-2xl">Sistem Intelijen Pemenangan AI Kita ✅</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm font-medium text-slate-700">
                <tr>
                  <td className="py-4 px-4 font-bold text-slate-900">Validasi Relawan & KTP</td>
                  <td className="py-4 px-4 bg-rose-50/20 text-slate-500">Input manual tanpa cek, rawan KTP ganda & relawan fiktif.</td>
                  <td className="py-4 px-4 bg-indigo-50/20 font-bold text-indigo-900 flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    AI Geofencing & Kunci NIK Unik
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-bold text-slate-900">Audit Pengeluaran Kas</td>
                  <td className="py-4 px-4 bg-rose-50/20 text-slate-500">Pencatatan nota biasa, tidak bisa mendeteksi mark-up dana.</td>
                  <td className="py-4 px-4 bg-indigo-50/20 font-bold text-indigo-900 flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    AI Financial Auditor & Anti Mark-Up
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-bold text-slate-900">Penghitungan Kursi KPU</td>
                  <td className="py-4 px-4 bg-rose-50/20 text-slate-500">Hanya grafik pie chart perolehan suara mentah.</td>
                  <td className="py-4 px-4 bg-indigo-50/20 font-bold text-indigo-900 flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    Engine Simulator Sainte-Laguë & CPV
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-bold text-slate-900">Input C1 Plano Saksi</td>
                  <td className="py-4 px-4 bg-rose-50/20 text-slate-500">Ketik angka manual di HP (rawan salah ketik / manipulasi).</td>
                  <td className="py-4 px-4 bg-indigo-50/20 font-bold text-indigo-900 flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    AI OCR C1 Scanner + QR Code UU ITE
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-bold text-slate-900">Aksesibilitas & Kecepatan</td>
                  <td className="py-4 px-4 bg-rose-50/20 text-slate-500">Lemot, ribet login, data terancam tercecer.</td>
                  <td className="py-4 px-4 bg-indigo-50/20 font-bold text-indigo-900 flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    Akses Demo 1-Klik & Cloud Run High-Speed
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 5 Package Tiers Pricing Showcase */}
      <div className="py-20 bg-slate-900 text-white border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400">
              5 TINGKAT PAKET PEMILIHAN
            </span>
            <h2 className="text-3xl font-black text-white mt-2">
              Disesuaikan untuk Semua Tingkat Kontestasi
            </h2>
            <p className="text-slate-400 text-sm mt-2">
              DPRD Kabupaten/Kota hingga Pilkada Kepala Daerah dengan fitur terukur.
            </p>
          </div>

          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="bg-slate-800/80 p-5 rounded-3xl border border-slate-700 flex flex-col justify-between space-y-4">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-amber-400">🥉 Tier 1</span>
                <h3 className="font-extrabold text-white text-base mt-1">DPRD Kab/Kota</h3>
                <p className="text-[11px] text-slate-400 mt-1">Bronze Pratama</p>
                <div className="text-lg font-black text-amber-300 mt-3">Rp 7,5M - 12,5M</div>
              </div>
              <button onClick={onOpenRegister} className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl text-xs cursor-pointer">
                Pilih Paket
              </button>
            </div>

            <div className="bg-slate-800/80 p-5 rounded-3xl border border-slate-700 flex flex-col justify-between space-y-4">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-slate-300">🥈 Tier 2</span>
                <h3 className="font-extrabold text-white text-base mt-1">DPRD Provinsi</h3>
                <p className="text-[11px] text-slate-400 mt-1">Silver Madya</p>
                <div className="text-lg font-black text-slate-200 mt-3">Rp 20M - 35M</div>
              </div>
              <button onClick={onOpenRegister} className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl text-xs cursor-pointer">
                Pilih Paket
              </button>
            </div>

            <div className="bg-gradient-to-b from-indigo-900 to-slate-800 p-5 rounded-3xl border-2 border-indigo-500 flex flex-col justify-between space-y-4 shadow-xl relative">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-[9px] font-black px-3 py-0.5 rounded-full uppercase tracking-wider">
                FAVORIT PUSAT
              </span>
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-amber-400">🥇 Tier 3</span>
                <h3 className="font-extrabold text-white text-base mt-1">DPR-RI</h3>
                <p className="text-[11px] text-indigo-200 mt-1">Gold Utama</p>
                <div className="text-lg font-black text-amber-400 mt-3">Rp 50M - 85M</div>
              </div>
              <button onClick={onOpenRegister} className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs cursor-pointer shadow-md">
                Pilih Paket
              </button>
            </div>

            <div className="bg-slate-800/80 p-5 rounded-3xl border border-slate-700 flex flex-col justify-between space-y-4">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-indigo-400">💎 Tier 4</span>
                <h3 className="font-extrabold text-white text-base mt-1">DPD-RI</h3>
                <p className="text-[11px] text-slate-400 mt-1">Platinum Senator</p>
                <div className="text-lg font-black text-indigo-300 mt-3">Rp 60M - 95M</div>
              </div>
              <button onClick={onOpenRegister} className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl text-xs cursor-pointer">
                Pilih Paket
              </button>
            </div>

            <div className="bg-slate-800/80 p-5 rounded-3xl border border-slate-700 flex flex-col justify-between space-y-4">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-purple-400">👑 Tier 5</span>
                <h3 className="font-extrabold text-white text-base mt-1">Pilkada Head</h3>
                <p className="text-[11px] text-slate-400 mt-1">Enterprise Victory</p>
                <div className="text-lg font-black text-purple-300 mt-3">Custom Deal</div>
              </div>
              <button onClick={onOpenRegister} className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs cursor-pointer">
                Pilih Paket
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

