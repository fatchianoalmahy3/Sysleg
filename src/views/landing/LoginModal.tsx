import React from 'react';
import { 
  Shield, 
  ArrowRight, 
  AlertCircle, 
  Loader2, 
  Award, 
  UserCheck, 
  MapPin, 
  Users 
} from 'lucide-react';

interface LoginModalProps {
  email: string;
  setEmail: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  loading: boolean;
  error: string;
  onLogin: (e: React.FormEvent) => void;
  onQuickDemoLogin: (role: string, demoEmail: string) => void;
  onBackToLanding: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  email,
  setEmail,
  password,
  setPassword,
  loading,
  error,
  onLogin,
  onQuickDemoLogin,
  onBackToLanding
}) => {
  return (
    <div 
      id="login-view-modal"
      className="fixed inset-0 z-50 w-full h-full bg-slate-900 overflow-y-auto overscroll-y-contain touch-scroll-y p-3 sm:p-6 flex items-start sm:items-center justify-center py-6"
      style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}
    >
      <div className="max-w-lg w-full bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-slate-100 my-auto mb-24 shrink-0">
        <div className="p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <Shield className="text-white w-6 h-6" />
            </div>
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-100">
              Multi-Tenant Gateway
            </span>
          </div>

          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Sistem Pemenangan ERP</h2>
          <p className="text-slate-500 mt-1 mb-6 text-xs">Pintu Masuk Terpadu Berdasarkan Hak Akses & Tupoksi</p>

          {error && (
            <div className="p-4 bg-rose-50 text-rose-700 rounded-xl flex items-start gap-3 mb-5 text-xs font-semibold border border-rose-200">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-500" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={onLogin} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Pengguna</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium min-h-[44px]"
                placeholder="nama@domain.com"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium min-h-[44px]"
                placeholder="password123"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 py-3 font-bold text-sm transition-all shadow-md shadow-indigo-600/25 flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Masuk ke Sistem'}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          {/* Quick Demo Simulator Login Buttons */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2.5">
              Simulasi Login Instan (Pilih Peran):
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onQuickDemoLogin('CALEG_UTAMA', 'caleg@domain.com')}
                className="px-3 py-2 text-left rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 transition-all cursor-pointer"
              >
                <div className="text-[11px] font-bold text-slate-900 flex items-center gap-1.5">
                  <Award className="w-3 h-3 text-amber-500" /> Caleg Utama
                </div>
                <div className="text-[9px] text-slate-400 truncate">Kandidat & War Room</div>
              </button>

              <button
                type="button"
                onClick={() => onQuickDemoLogin('TIM_SES', 'timses@domain.com')}
                className="px-3 py-2 text-left rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 transition-all cursor-pointer"
              >
                <div className="text-[11px] font-bold text-slate-900 flex items-center gap-1.5">
                  <UserCheck className="w-3 h-3 text-purple-500" /> Tim Ses Utama
                </div>
                <div className="text-[9px] text-slate-400 truncate">Sekretariat & Pendaftaran</div>
              </button>

              <button
                type="button"
                onClick={() => onQuickDemoLogin('KORCAM', 'korcam@domain.com')}
                className="px-3 py-2 text-left rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 transition-all cursor-pointer"
              >
                <div className="text-[11px] font-bold text-slate-900 flex items-center gap-1.5">
                  <MapPin className="w-3 h-3 text-emerald-500" /> Korcam
                </div>
                <div className="text-[9px] text-slate-400 truncate">Koordinator Kecamatan</div>
              </button>

              <button
                type="button"
                onClick={() => onQuickDemoLogin('RELAWAN_LAPANGAN', 'relawan@domain.com')}
                className="px-3 py-2 text-left rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 transition-all cursor-pointer"
              >
                <div className="text-[11px] font-bold text-slate-900 flex items-center gap-1.5">
                  <Users className="w-3 h-3 text-sky-500" /> Relawan Lapangan
                </div>
                <div className="text-[9px] text-slate-400 truncate">Input KTP & C1 TPS</div>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <button 
              onClick={onBackToLanding} 
              className="text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer py-2"
            >
              ← Kembali ke Halaman Utama
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
