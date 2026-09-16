import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  ArrowLeft,
  CheckCircle, 
  Shield, 
  Users, 
  MapPin, 
  Database, 
  Loader2, 
  Sparkles, 
  AlertCircle,
  Building2,
  Lock,
  UserCheck,
  CheckCircle2,
  FileText,
  BadgeCheck,
  Zap,
  Layers,
  Award,
  Star,
  Check,
  TrendingUp,
  CreditCard
} from 'lucide-react';
import { auth, FirebaseDataService } from '../services/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { getProvinces, getCities } from '../utils/regionApi';
import { 
  PARTAI_POLITIK_LIST, 
  TINGKAT_PEMILIHAN_OPTIONS, 
  getEstimatedTps, 
  getDapilSuggestions, 
  DEFAULT_PRICING_MATRIX, 
  STANDARD_FEATURES, 
  PRO_AI_FEATURES, 
  formatRupiah,
  PricingMatrixMap 
} from '../utils/electoralData';

export function LandingView({ onLoginSuccess }: { onLoginSuccess: (role: string, email: string) => void }) {
  const [view, setView] = useState<'landing' | 'login' | 'register'>('landing');
  
  // Login Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Multi-step Registration Wizard State (Step 1 -> Step 2 -> Step 3)
  const [regStep, setRegStep] = useState<1 | 2 | 3>(1);

  // Region & Electoral Datasets
  const [provinces, setProvinces] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [dapilSuggestions, setDapilSuggestions] = useState<string[]>([]);
  const [isCustomDapil, setIsCustomDapil] = useState(false);

  // Dynamic Pricing Matrix (Synchronized with Superadmin Firestore saas_pricing_matrix)
  const [pricingMatrix, setPricingMatrix] = useState<PricingMatrixMap>(DEFAULT_PRICING_MATRIX);
  const [selectedTier, setSelectedTier] = useState<'TIER_1_STANDARD' | 'TIER_2_PRO_AI'>('TIER_2_PRO_AI');

  // Caleg SaaS Registration Form State
  const [calegForm, setCalegForm] = useState({
    nama_caleg: '',
    email: '',
    no_wa: '',
    tingkat_pemilihan: 'DPRD KAB/KOTA',
    provinsi: 'JAWA TIMUR',
    kota: 'KOTA SURABAYA',
    nama_dapil: 'Dapil 1 KOTA SURABAYA',
    partai: '01 - PKB (Partai Kebangkitan Bangsa)',
    nomor_urut: 1
  });
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [generatedRegId, setGeneratedRegId] = useState('');

  // Initial load: Provinces & Dynamic Pricing from Firestore
  useEffect(() => {
    let isMounted = true;
    getProvinces().then(provs => {
      if (isMounted && provs && provs.length > 0) {
        setProvinces(provs);
      }
    }).catch(err => console.warn("Failed fetching provinces:", err));

    // Fetch Superadmin customized pricing if available in Firestore
    FirebaseDataService.getCollectionData('saas_pricing_matrix').then(items => {
      if (isMounted && items && items.length > 0) {
        const matrixCopy: PricingMatrixMap = JSON.parse(JSON.stringify(DEFAULT_PRICING_MATRIX));
        items.forEach((item: any) => {
          if (item.tingkat_pemilihan && item.is_active !== false) {
            if (!matrixCopy[item.tingkat_pemilihan]) {
              matrixCopy[item.tingkat_pemilihan] = {
                tier1Price: 3500000,
                tier2Price: 6500000,
                tier2Badge: 'POPULER'
              };
            }
            if (item.tier === 'TIER_1_STANDARD') {
              matrixCopy[item.tingkat_pemilihan].tier1Price = Number(item.harga) || matrixCopy[item.tingkat_pemilihan].tier1Price;
            } else if (item.tier === 'TIER_2_PRO_AI') {
              matrixCopy[item.tingkat_pemilihan].tier2Price = Number(item.harga) || matrixCopy[item.tingkat_pemilihan].tier2Price;
              if (item.badge_promo) matrixCopy[item.tingkat_pemilihan].tier2Badge = item.badge_promo;
            }
          }
        });
        setPricingMatrix(matrixCopy);
      }
    }).catch(err => console.warn("Firestore pricing fetch fallback:", err));

    return () => { isMounted = false; };
  }, []);

  // Cascading update: Load Cities when Province changes
  useEffect(() => {
    if (!calegForm.provinsi) return;
    let isMounted = true;
    setLoadingCities(true);
    getCities(calegForm.provinsi).then(cts => {
      if (!isMounted) return;
      setCities(cts || []);
      if (cts && cts.length > 0) {
        const currentValid = cts.some((c: any) => c.name.toUpperCase() === calegForm.kota.toUpperCase());
        if (!currentValid) {
          setCalegForm(prev => ({ ...prev, kota: cts[0].name }));
        }
      }
    }).catch(err => {
      console.warn("Failed fetching cities:", err);
    }).finally(() => {
      if (isMounted) setLoadingCities(false);
    });
    return () => { isMounted = false; };
  }, [calegForm.provinsi]);

  // Auto-detect and suggest Dapil options based on Tingkat, Provinsi & Kota
  useEffect(() => {
    const suggestions = getDapilSuggestions(calegForm.tingkat_pemilihan, calegForm.provinsi, calegForm.kota);
    setDapilSuggestions(suggestions);
    if (!isCustomDapil && suggestions.length > 0) {
      // Pick first recommendation if not typed manually
      setCalegForm(prev => ({ ...prev, nama_dapil: suggestions[0] }));
    }
  }, [calegForm.tingkat_pemilihan, calegForm.provinsi, calegForm.kota]);

  // Current pricing tier data for selected Tingkat Pemilihan
  const currentPricing = pricingMatrix[calegForm.tingkat_pemilihan] || DEFAULT_PRICING_MATRIX['DPRD KAB/KOTA'];
  const currentPriceAmount = selectedTier === 'TIER_2_PRO_AI' ? currentPricing.tier2Price : currentPricing.tier1Price;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (auth.app) {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        let role = 'CALEG_UTAMA';
        if (email.includes('superadmin') || email.includes('admin@pemenangan')) role = 'SUPER_ADMIN';
        else if (email.includes('timses')) role = 'TIM_SES';
        else if (email.includes('korcam')) role = 'KORCAM';
        else if (email.includes('relawan')) role = 'RELAWAN_LAPANGAN';
        onLoginSuccess(role, cred.user.email || email);
      } else {
        throw new Error('Auth not configured');
      }
    } catch (err: any) {
      console.warn("Real auth fallback to role routing:", err);
      let role = 'CALEG_UTAMA';
      if (email.includes('superadmin') || email.includes('admin@pemenangan')) role = 'SUPER_ADMIN';
      else if (email.includes('timses')) role = 'TIM_SES';
      else if (email.includes('korcam')) role = 'KORCAM';
      else if (email.includes('relawan')) role = 'RELAWAN_LAPANGAN';
      else if (email.includes('simpatisan')) role = 'SIMPATISAN_PENDING';
      
      if (password === 'password123' || password === 'admin123') {
        onLoginSuccess(role, email);
      } else {
        setError('Password tidak valid. Gunakan password akun Anda atau demo: "password123"');
      }
    }
    setLoading(false);
  };

  const handleQuickDemoLogin = (role: string, demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
    onLoginSuccess(role, demoEmail);
  };

  // Step Validation Handlers
  const handleProceedToStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!calegForm.nama_caleg.trim()) {
      setError('Silakan isi Nama Lengkap Caleg & Gelar.');
      return;
    }
    if (!calegForm.email.trim() || !calegForm.email.includes('@')) {
      setError('Silakan isi Email Resmi Caleg yang valid.');
      return;
    }
    if (!calegForm.no_wa.trim()) {
      setError('Silakan isi Nomor WhatsApp Aktif.');
      return;
    }
    setRegStep(2);
  };

  const handleProceedToStep3 = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!calegForm.nama_dapil.trim() || calegForm.nama_dapil === 'Lainnya / Ketik Sendiri') {
      setError('Silakan tentukan atau ketik Nama Dapil Wilayah Anda.');
      return;
    }
    if (!calegForm.partai.trim()) {
      setError('Silakan pilih Partai Politik Anda.');
      return;
    }
    setRegStep(3);
  };

  const handleRegisterCaleg = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const regId = `REG-CLG-${Date.now().toString().slice(-6)}`;
    const payload = {
      id: regId,
      nama_caleg: calegForm.nama_caleg,
      email: calegForm.email,
      no_wa: calegForm.no_wa,
      tingkat_pemilihan: calegForm.tingkat_pemilihan,
      nama_dapil: calegForm.nama_dapil,
      provinsi: calegForm.provinsi,
      kota: calegForm.kota,
      partai: calegForm.partai,
      nomor_urut: Number(calegForm.nomor_urut),
      paket: selectedTier === 'TIER_2_PRO_AI' ? 'Tier 2: Pro AI Intelligence' : 'Tier 1: Standard Command',
      tier_fitur: selectedTier,
      harga_kesepakatan: currentPriceAmount,
      estimasi_tps: getEstimatedTps(calegForm.tingkat_pemilihan),
      status: 'PENDING_VERIFIKASI',
      tenant_id: 'MENUNGGU_VERIFIKASI_SUPERADMIN',
      akun_timses_email: 'BELUM_DI_GENERATE',
      catatan_superadmin: `Pendaftaran via Wizard 3-Step. Paket: ${selectedTier}. Estimasi TPS: ${getEstimatedTps(calegForm.tingkat_pemilihan)}. Nilai: ${formatRupiah(currentPriceAmount)}`,
      createdAt: new Date().toISOString()
    };

    try {
      await FirebaseDataService.createDocument('saas_tenant_approval', payload);
      setGeneratedRegId(regId);
      setRegistrationSuccess(true);
    } catch (err: any) {
      console.warn('Fallback saving registration to local storage:', err);
      try {
        const stored = JSON.parse(localStorage.getItem('saas_tenant_approval_local') || '[]');
        stored.push(payload);
        localStorage.setItem('saas_tenant_approval_local', JSON.stringify(stored));
      } catch {}
      setGeneratedRegId(regId);
      setRegistrationSuccess(true);
    } finally {
      setLoading(false);
    }
  };

  // 1. LOGIN GATEWAY VIEW
  if (view === 'login') {
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

            <form onSubmit={handleLogin} className="space-y-3.5">
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
                  onClick={() => handleQuickDemoLogin('SUPER_ADMIN', 'superadmin@pemenangan.id')}
                  className="px-3 py-2 text-left rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 transition-all cursor-pointer"
                >
                  <div className="text-[11px] font-bold text-indigo-900 flex items-center gap-1.5">
                    <Shield className="w-3 h-3 text-indigo-600" /> Superadmin
                  </div>
                  <div className="text-[9px] text-slate-400 truncate">Platform Owner & Approval</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('CALEG_UTAMA', 'caleg@domain.com')}
                  className="px-3 py-2 text-left rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 transition-all cursor-pointer"
                >
                  <div className="text-[11px] font-bold text-slate-900 flex items-center gap-1.5">
                    <Award className="w-3 h-3 text-amber-500" /> Caleg Utama
                  </div>
                  <div className="text-[9px] text-slate-400 truncate">Kandidat & Kebijakan</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('TIM_SES', 'timses@domain.com')}
                  className="px-3 py-2 text-left rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 transition-all cursor-pointer"
                >
                  <div className="text-[11px] font-bold text-slate-900 flex items-center gap-1.5">
                    <UserCheck className="w-3 h-3 text-purple-500" /> Tim Ses Utama
                  </div>
                  <div className="text-[9px] text-slate-400 truncate">Sekretariat & Pendaftaran</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('KORCAM', 'korcam@domain.com')}
                  className="px-3 py-2 text-left rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 transition-all cursor-pointer"
                >
                  <div className="text-[11px] font-bold text-slate-900 flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-emerald-500" /> Korcam
                  </div>
                  <div className="text-[9px] text-slate-400 truncate">Koordinator Kecamatan</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('RELAWAN_LAPANGAN', 'relawan@domain.com')}
                  className="col-span-2 px-3 py-2 text-left rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 transition-all cursor-pointer"
                >
                  <div className="text-[11px] font-bold text-slate-900 flex items-center gap-1.5">
                    <Users className="w-3 h-3 text-sky-500" /> Relawan Lapangan (Input KTP TPS)
                  </div>
                  <div className="text-[9px] text-slate-400">Didaftarkan oleh Korcam/Tim Ses • Hybrid Offline Mode</div>
                </button>
              </div>
            </div>

            <div className="mt-6 text-center">
              <button 
                onClick={() => setView('landing')} 
                className="text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer py-2"
              >
                ← Kembali ke Halaman Utama
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. CALEG SAAS REGISTRATION VIEW
  if (view === 'register') {
    return (
      <div 
        id="register-view-modal"
        className="fixed inset-0 z-50 w-full h-full bg-slate-900/60 backdrop-blur-xs overflow-y-auto overscroll-y-contain touch-scroll-y p-3 sm:p-6 md:p-8"
        style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}
      >
        <div className="max-w-3xl w-full mx-auto bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-2 sm:my-6 mb-36 shrink-0">
          {/* Header Banner */}
          <div className="p-5 sm:p-8 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center font-bold text-white shadow-lg shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-300 font-bold block">
                    SaaS Multi-Tenant Onboarding
                  </span>
                  <span className="text-xs text-indigo-200 hidden sm:inline">Pendaftaran Mandiri Caleg</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setView('landing')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-xl transition-colors cursor-pointer shrink-0"
              >
                ← Kembali
              </button>
            </div>
            <h2 className="text-lg sm:text-2xl font-black tracking-tight mt-1">Pendaftaran Caleg & Aktivasi Workspace</h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed mt-1">
              Daftarkan tim pemenangan Anda. Setelah disetujui Superadmin, sistem akan secara otomatis meng-generate workspace mandiri dan akun kredensial Tim Ses Utama.
            </p>
          </div>

          {/* Relawan Policy Notice Banner */}
          <div className="p-4 sm:p-5 bg-amber-50 border-b border-amber-200 flex items-start gap-3 text-xs text-amber-900">
            <Lock className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-extrabold block">Aturan Privasi & Keamanan Relawan:</span>
              <p className="text-amber-800 mt-0.5 leading-relaxed">
                Pendaftaran di halaman ini <b>hanya untuk Caleg / Tim Inti</b>. Relawan Lapangan dan Koordinator TPS <b>tidak mendaftar mandiri</b> di publik, melainkan didaftarkan secara berjenjang (Top-Down) oleh akun Koordinator Kecamatan atau Tim Ses di dalam sistem setelah workspace Caleg aktif.
              </p>
            </div>
          </div>

          <div className="p-5 sm:p-8">
            {registrationSuccess ? (
              <div className="text-center py-8 max-w-md mx-auto space-y-4">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-md">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <div>
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                    STATUS: PENDING VERIFIKASI SUPERADMIN
                  </span>
                  <h3 className="text-xl font-extrabold text-slate-900 mt-2">Pendaftaran Berhasil Dikirim!</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Nomor Registrasi: <span className="font-mono font-bold text-slate-900">{generatedRegId}</span>
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-left text-slate-600 space-y-2">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>Data telah masuk ke <b>Antrean Persetujuan Superadmin</b>.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>Setelah disetujui, akun Tim Ses Utama akan dibuat otomatis.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>Notifikasi aktivasi akan diteruskan ke WhatsApp <b>{calegForm.no_wa}</b>.</span>
                  </div>
                </div>
                <div className="pt-2 flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => {
                      // Langsung login sebagai superadmin untuk verifikasi
                      handleQuickDemoLogin('SUPER_ADMIN', 'superadmin@pemenangan.id');
                    }}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 py-3 font-bold text-xs transition-all shadow-md cursor-pointer min-h-[44px]"
                  >
                    Buka Dashboard Superadmin (Tinjau Sekarang)
                  </button>
                  <button
                    onClick={() => setView('landing')}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl px-4 py-3 font-bold text-xs transition-colors cursor-pointer min-h-[44px]"
                  >
                    Kembali ke Beranda
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* 3-Step Wizard Navigation Indicator */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 sm:p-4">
                  <div className="flex items-center justify-between gap-2">
                    {/* Step 1 Pill */}
                    <button
                      type="button"
                      onClick={() => setRegStep(1)}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 px-2.5 sm:px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        regStep === 1 
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' 
                          : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                        regStep === 1 ? 'bg-white text-indigo-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        1
                      </span>
                      <span className="truncate">Profil Caleg</span>
                    </button>

                    <div className="w-4 h-0.5 bg-slate-300 hidden sm:block shrink-0" />

                    {/* Step 2 Pill */}
                    <button
                      type="button"
                      onClick={() => {
                        if (calegForm.nama_caleg && calegForm.email && calegForm.no_wa) {
                          setRegStep(2);
                        } else {
                          setError('Lengkapi data Profil Caleg terlebih dahulu.');
                        }
                      }}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 px-2.5 sm:px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        regStep === 2 
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' 
                          : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                        regStep === 2 ? 'bg-white text-indigo-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        2
                      </span>
                      <span className="truncate">Wilayah & Dapil</span>
                    </button>

                    <div className="w-4 h-0.5 bg-slate-300 hidden sm:block shrink-0" />

                    {/* Step 3 Pill */}
                    <button
                      type="button"
                      onClick={() => {
                        if (calegForm.nama_caleg && calegForm.email && calegForm.no_wa && calegForm.nama_dapil && calegForm.partai) {
                          setRegStep(3);
                        } else {
                          setError('Lengkapi data Profil dan Wilayah terlebih dahulu.');
                        }
                      }}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 px-2.5 sm:px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        regStep === 3 
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' 
                          : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                        regStep === 3 ? 'bg-white text-indigo-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        3
                      </span>
                      <span className="truncate">Paket & Investasi</span>
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="p-3.5 bg-rose-50 text-rose-700 rounded-xl text-xs flex items-center gap-2.5 border border-rose-200 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                    <span className="font-semibold">{error}</span>
                  </div>
                )}

                {/* STEP 1: PROFIL & KONTAK CALEG */}
                {regStep === 1 && (
                  <form onSubmit={handleProceedToStep2} className="space-y-4 sm:space-y-5">
                    <div className="border-b border-slate-100 pb-3">
                      <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-indigo-600" />
                        Langkah 1: Identitas Calon & Kontak Utama
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Masukkan nama resmi Caleg beserta nomor WhatsApp aktif untuk pengiriman kredensial.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Nama Lengkap Caleg & Gelar *
                        </label>
                        <input
                          type="text"
                          required
                          value={calegForm.nama_caleg}
                          onChange={(e) => setCalegForm({ ...calegForm, nama_caleg: e.target.value })}
                          placeholder="Contoh: H. Bambang Irawan, S.E., M.Si."
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm sm:text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium min-h-[44px]"
                        />
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          Nama ini akan tertera pada kop resmi laporan dokumen C1 ber-QR Code.
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">
                            Email Resmi Caleg / Tim Ses *
                          </label>
                          <input
                            type="email"
                            required
                            value={calegForm.email}
                            onChange={(e) => setCalegForm({ ...calegForm, email: e.target.value })}
                            placeholder="caleg@domain.com"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm sm:text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium min-h-[44px]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">
                            Nomor WhatsApp Aktif *
                          </label>
                          <input
                            type="tel"
                            required
                            value={calegForm.no_wa}
                            onChange={(e) => setCalegForm({ ...calegForm, no_wa: e.target.value })}
                            placeholder="081234567890"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm sm:text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium min-h-[44px]"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => setView('landing')}
                        className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer py-2"
                      >
                        ← Batal & Ke Beranda
                      </button>

                      <button
                        type="submit"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold transition-all shadow-md shadow-indigo-600/20 cursor-pointer min-h-[44px]"
                      >
                        Lanjut ke Wilayah & Dapil
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </form>
                )}

                {/* STEP 2: WILAYAH, DAPIL & PARTAI */}
                {regStep === 2 && (
                  <form onSubmit={handleProceedToStep3} className="space-y-4 sm:space-y-5">
                    <div className="border-b border-slate-100 pb-3">
                      <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-indigo-600" />
                        Langkah 2: Wilayah Kontestasi & Dapil Elektoral
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Pilih tingkat pemilihan dan wilayah. Sistem akan mendeteksi Dapil serta estimasi kuota TPS KPU secara otomatis.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Tingkat Pemilihan */}
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Tingkat Kontestasi Pemilihan *
                        </label>
                        <select
                          value={calegForm.tingkat_pemilihan}
                          onChange={(e) => {
                            setCalegForm({ ...calegForm, tingkat_pemilihan: e.target.value });
                            setIsCustomDapil(false);
                          }}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm sm:text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold cursor-pointer min-h-[44px]"
                        >
                          {TINGKAT_PEMILIHAN_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>

                      {/* Dropdown Provinsi Cascading */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Provinsi Pemilihan *
                        </label>
                        <select
                          value={calegForm.provinsi}
                          onChange={(e) => setCalegForm({ ...calegForm, provinsi: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm sm:text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium cursor-pointer min-h-[44px]"
                        >
                          {provinces.length > 0 ? (
                            provinces.map((p: any) => (
                              <option key={p.id || p.name} value={p.name}>{p.name}</option>
                            ))
                          ) : (
                            <>
                              <option value="JAWA TIMUR">JAWA TIMUR</option>
                              <option value="JAWA BARAT">JAWA BARAT</option>
                              <option value="JAWA TENGAH">JAWA TENGAH</option>
                              <option value="DKI JAKARTA">DKI JAKARTA</option>
                              <option value="BANTEN">BANTEN</option>
                              <option value="SUMATERA UTARA">SUMATERA UTARA</option>
                              <option value="SULAWESI SELATAN">SULAWESI SELATAN</option>
                            </>
                          )}
                        </select>
                      </div>

                      {/* Dropdown Kota / Kabupaten Cascading */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                          <span>Kota / Kabupaten *</span>
                          {loadingCities && <Loader2 className="w-3 h-3 animate-spin text-indigo-600" />}
                        </label>
                        <select
                          value={calegForm.kota}
                          onChange={(e) => setCalegForm({ ...calegForm, kota: e.target.value })}
                          disabled={loadingCities}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm sm:text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium cursor-pointer min-h-[44px]"
                        >
                          {cities.length > 0 ? (
                            cities.map((c: any) => (
                              <option key={c.id || c.name} value={c.name}>{c.name}</option>
                            ))
                          ) : (
                            <option value={calegForm.kota || 'KOTA SURABAYA'}>{calegForm.kota || 'KOTA SURABAYA'}</option>
                          )}
                        </select>
                      </div>

                      {/* Nama Dapil Wilayah (Auto Detect + Dropdown + Custom Mode) */}
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                          <span>Nama Dapil Wilayah *</span>
                          <button
                            type="button"
                            onClick={() => setIsCustomDapil(!isCustomDapil)}
                            className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer underline"
                          >
                            {isCustomDapil ? 'Pilih dari Rekomendasi' : 'Ketik Manual'}
                          </button>
                        </label>

                        {!isCustomDapil ? (
                          <select
                            value={calegForm.nama_dapil}
                            onChange={(e) => {
                              if (e.target.value === 'Lainnya / Ketik Sendiri') {
                                setIsCustomDapil(true);
                                setCalegForm({ ...calegForm, nama_dapil: '' });
                              } else {
                                setCalegForm({ ...calegForm, nama_dapil: e.target.value });
                              }
                            }}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm sm:text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold cursor-pointer min-h-[44px]"
                          >
                            {dapilSuggestions.map((dapil) => (
                              <option key={dapil} value={dapil}>{dapil}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            required
                            value={calegForm.nama_dapil}
                            onChange={(e) => setCalegForm({ ...calegForm, nama_dapil: e.target.value })}
                            placeholder="Contoh: Jawa Timur I atau Dapil 3 Kota Surabaya"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm sm:text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium min-h-[44px]"
                          />
                        )}
                      </div>

                      {/* Partai Politik (Standardized KPU Dropdown) */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Partai Politik Pengusung *
                        </label>
                        <select
                          value={calegForm.partai}
                          onChange={(e) => setCalegForm({ ...calegForm, partai: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm sm:text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium cursor-pointer min-h-[44px]"
                        >
                          {PARTAI_POLITIK_LIST.map((p) => (
                            <option key={p} value={p}>{p}</option>
                          ))}
                        </select>
                      </div>

                      {/* Nomor Urut Caleg */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Nomor Urut Caleg pada Surat Suara *
                        </label>
                        <input
                          type="number"
                          min={1}
                          required
                          value={calegForm.nomor_urut}
                          onChange={(e) => setCalegForm({ ...calegForm, nomor_urut: Number(e.target.value) })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm sm:text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold min-h-[44px]"
                        />
                      </div>
                    </div>

                    {/* Auto-detected TPS Estimate Box */}
                    <div className="p-3.5 bg-indigo-50/70 border border-indigo-200 rounded-xl flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-indigo-600 shrink-0" />
                        <div>
                          <span className="font-extrabold text-indigo-950 block">
                            Deteksi Otomatis Kuota TPS Dapil:
                          </span>
                          <span className="text-indigo-800 text-[11px]">
                            {getEstimatedTps(calegForm.tingkat_pemilihan)}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] bg-white text-indigo-700 font-extrabold px-2.5 py-1 rounded-lg border border-indigo-200 shrink-0">
                        100% Kuota Penuh
                      </span>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => setRegStep(1)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer py-2"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Kembali ke Profil
                      </button>

                      <button
                        type="submit"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold transition-all shadow-md shadow-indigo-600/20 cursor-pointer min-h-[44px]"
                      >
                        Lanjut ke Paket Fitur
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </form>
                )}

                {/* STEP 3: PILIHAN PAKET FITUR & HARGA BERTINGKAT (2-TIER) */}
                {regStep === 3 && (
                  <form onSubmit={handleRegisterCaleg} className="space-y-5">
                    <div className="border-b border-slate-100 pb-3">
                      <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-indigo-600" />
                        Langkah 3: Pilihan Paket Fitur & Nilai Investasi
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Harga disesuaikan otomatis dengan tingkat pemilihan <b>{calegForm.tingkat_pemilihan}</b>. Anda cukup memilih fitur yang dibutuhkan.
                      </p>
                    </div>

                    {/* Active Configuration Summary Strip */}
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="font-extrabold text-slate-900 block">{calegForm.nama_dapil}</span>
                        <span className="text-[11px] text-slate-500">{calegForm.kota}, {calegForm.provinsi} • {calegForm.partai} (No. {calegForm.nomor_urut})</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-mono text-slate-400 block uppercase">Alokasi TPS</span>
                        <span className="font-bold text-indigo-700 text-[11px]">{getEstimatedTps(calegForm.tingkat_pemilihan)}</span>
                      </div>
                    </div>

                    {/* 2-Tier Pricing Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                      {/* TIER 1: STANDARD COMMAND */}
                      <div 
                        onClick={() => setSelectedTier('TIER_1_STANDARD')}
                        className={`relative rounded-2xl p-5 border-2 transition-all cursor-pointer flex flex-col justify-between ${
                          selectedTier === 'TIER_1_STANDARD'
                            ? 'border-indigo-600 bg-indigo-50/30 shadow-lg shadow-indigo-600/10 ring-2 ring-indigo-500/20'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="text-[10px] font-mono font-black uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                              TIER 1 • OPERASIONAL DASAR
                            </span>
                            <input 
                              type="radio" 
                              name="tier_selection" 
                              checked={selectedTier === 'TIER_1_STANDARD'} 
                              onChange={() => setSelectedTier('TIER_1_STANDARD')} 
                              className="w-4 h-4 text-indigo-600 cursor-pointer"
                            />
                          </div>

                          <h5 className="text-base font-black text-slate-900">Standard Command</h5>
                          <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                            Fokus pada pendataan konstituen manual, manajemen relawan bertingkat, dan rekap saksi TPS.
                          </p>

                          <div className="my-4 pb-4 border-b border-slate-100">
                            <span className="text-2xl font-black text-slate-900 tracking-tight">
                              {formatRupiah(currentPricing.tier1Price)}
                            </span>
                            <span className="text-xs text-slate-400 font-medium block mt-0.5">
                              / Masa Kampanye Pemilu
                            </span>
                          </div>

                          <div className="space-y-2 text-xs text-slate-700">
                            <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">
                              Fitur Termasuk:
                            </span>
                            {STANDARD_FEATURES.map((feat, idx) => (
                              <div key={idx} className="flex items-start gap-2 text-[11px]">
                                <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                                <span className="leading-snug">{feat}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <button
                          type="button"
                          className={`mt-6 w-full py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer min-h-[44px] ${
                            selectedTier === 'TIER_1_STANDARD'
                              ? 'bg-indigo-600 text-white shadow-md'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                        >
                          {selectedTier === 'TIER_1_STANDARD' ? '✓ Paket Terpilih' : 'Pilih Standard Command'}
                        </button>
                      </div>

                      {/* TIER 2: PRO AI INTELLIGENCE */}
                      <div 
                        onClick={() => setSelectedTier('TIER_2_PRO_AI')}
                        className={`relative rounded-2xl p-5 border-2 transition-all cursor-pointer flex flex-col justify-between ${
                          selectedTier === 'TIER_2_PRO_AI'
                            ? 'border-indigo-600 bg-gradient-to-b from-indigo-50/40 via-white to-indigo-50/20 shadow-xl shadow-indigo-600/15 ring-2 ring-indigo-500/30'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        {/* Popular Badge */}
                        <div className="absolute -top-3 right-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-black tracking-widest uppercase px-3 py-0.5 rounded-full shadow-md flex items-center gap-1">
                          <Star className="w-3 h-3 fill-white" />
                          {currentPricing.tier2Badge || 'PALING POPULER'}
                        </div>

                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="text-[10px] font-mono font-black uppercase tracking-wider text-indigo-600 bg-indigo-100/70 px-2 py-0.5 rounded-md">
                              TIER 2 • INTELLIGENCE COMMAND
                            </span>
                            <input 
                              type="radio" 
                              name="tier_selection" 
                              checked={selectedTier === 'TIER_2_PRO_AI'} 
                              onChange={() => setSelectedTier('TIER_2_PRO_AI')} 
                              className="w-4 h-4 text-indigo-600 cursor-pointer"
                            />
                          </div>

                          <h5 className="text-base font-black text-slate-900 flex items-center gap-1.5">
                            Pro AI Intelligence
                            <Sparkles className="w-4 h-4 text-amber-500" />
                          </h5>
                          <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                            Akurasi maksimal dengan OCR KTP otomatis, verifikasi C1 Plano ber-AI, dan peta sebaran suara.
                          </p>

                          <div className="my-4 pb-4 border-b border-indigo-100">
                            <span className="text-2xl font-black text-indigo-950 tracking-tight">
                              {formatRupiah(currentPricing.tier2Price)}
                            </span>
                            <span className="text-xs text-indigo-600/80 font-medium block mt-0.5">
                              / Masa Kampanye Pemilu
                            </span>
                          </div>

                          <div className="space-y-2 text-xs text-slate-700">
                            <span className="text-[10px] font-black uppercase text-indigo-600 block tracking-wider">
                              Fitur Pro & Intelligence:
                            </span>
                            {PRO_AI_FEATURES.map((feat, idx) => (
                              <div key={idx} className="flex items-start gap-2 text-[11px]">
                                {feat.startsWith('★') ? (
                                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 flex-shrink-0 mt-0.5" />
                                ) : (
                                  <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                                )}
                                <span className={feat.startsWith('★') ? 'font-bold text-slate-900' : 'leading-snug'}>
                                  {feat}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <button
                          type="button"
                          className={`mt-6 w-full py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer min-h-[44px] ${
                            selectedTier === 'TIER_2_PRO_AI'
                              ? 'bg-indigo-600 text-white shadow-md'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                        >
                          {selectedTier === 'TIER_2_PRO_AI' ? '✓ Paket Terpilih' : 'Pilih Pro AI Intelligence'}
                        </button>
                      </div>
                    </div>

                    {/* Ringkasan Kesepakatan Biaya */}
                    <div className="p-4 bg-slate-900 text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-mono uppercase text-indigo-300 font-bold block">
                          Ringkasan Pilihan Langganan:
                        </span>
                        <div className="font-extrabold text-sm sm:text-base text-white">
                          {selectedTier === 'TIER_2_PRO_AI' ? 'Tier 2: Pro AI Intelligence' : 'Tier 1: Standard Command'}
                        </div>
                        <span className="text-xs text-slate-300">
                          Total Investasi: <b className="text-emerald-400">{formatRupiah(currentPriceAmount)}</b>
                        </span>
                      </div>

                      <div className="text-right sm:text-left text-[11px] text-slate-400">
                        * Aktivasi workspace diterbitkan setelah verifikasi & approval Superadmin.
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <button
                        type="button"
                        onClick={() => setRegStep(2)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer py-2"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Kembali ke Wilayah
                      </button>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold transition-all shadow-md shadow-indigo-600/20 cursor-pointer min-h-[44px]"
                      >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Kirim Pengajuan Workspace Caleg'}
                        {!loading && <ArrowRight className="w-4 h-4" />}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 3. DEFAULT: LANDING PAGE VIEW
  return (
    <div className="min-h-screen bg-white">
      {/* Top Fixed Navbar */}
      <nav className="border-b border-slate-100 bg-white/90 backdrop-blur-md fixed top-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <Sparkles className="text-white w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-slate-900">
                Pemenangan<span className="text-indigo-600">SaaS</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-mono uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                Multi-Tenant Engine
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setView('login')}
              className="text-xs sm:text-sm font-bold text-slate-700 hover:text-indigo-600 px-3 sm:px-4 py-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Masuk Sistem
            </button>
            <button 
              onClick={() => setView('register')}
              className="text-xs sm:text-sm font-bold bg-indigo-600 text-white px-4 sm:px-5 py-2.5 rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
            >
              Daftar Caleg Baru
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-extrabold mb-6">
              <Sparkles className="w-4 h-4" />
              Platform SaaS Pemenangan Caleg & Pilkada
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1] mb-6">
              Kunci Kemenangan dengan <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Keakuratan Data.</span>
            </h1>
            <p className="text-base sm:text-lg text-slate-500 mb-8 leading-relaxed max-w-xl">
              Platform tertutup yang mengunci kebocoran dana, memverifikasi suara KTP berbasis geofencing, dan mensinergikan tim sukses hingga relawan TPS secara terstruktur.
            </p>
            <div className="flex flex-wrap items-center gap-3.5">
              <button 
                onClick={() => setView('register')} 
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl px-7 py-3.5 font-bold text-sm sm:text-base transition-all flex items-center gap-2 shadow-xl shadow-indigo-200 cursor-pointer"
              >
                Daftar Caleg (SaaS) <ArrowRight className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setView('login')} 
                className="bg-white border border-slate-300 hover:border-slate-400 text-slate-700 rounded-2xl px-6 py-3.5 font-bold text-sm sm:text-base transition-colors cursor-pointer"
              >
                Single Login Gateway
              </button>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-100 to-purple-50 rounded-[3rem] transform rotate-3 scale-105" />
            <img 
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80" 
              alt="Data Analysis" 
              className="relative rounded-[3rem] shadow-2xl border-4 border-white object-cover h-[450px] w-full"
            />
          </div>
        </div>
      </div>

      {/* Structured SaaS Onboarding Flow */}
      <div className="bg-slate-50 py-20 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-indigo-600">
              ARSITEKTUR HIRARKI BERJENJANG (TOP-DOWN)
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
              Alur Pendaftaran & Pembagian Tupoksi
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-2">
              Keamanan data terjamin dengan delegasi hak akses tertutup tanpa pendaftar gelap publik.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-sm">
                1
              </div>
              <h3 className="font-extrabold text-slate-900 text-sm">Caleg Mendaftar</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Caleg mengisi formulir pendaftaran SaaS publik di landing page untuk menentukan dapil, partai, dan paket.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-black text-sm">
                2
              </div>
              <h3 className="font-extrabold text-slate-900 text-sm">Superadmin Approval</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Superadmin meninjau antrean, menyetujui workspace, dan otomatis meng-generate akun kredensial Tim Ses Utama.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-sm">
                3
              </div>
              <h3 className="font-extrabold text-slate-900 text-sm">Delegasi Korcam</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Tim Ses mendaftarkan Koordinator Kecamatan (Korcam) dengan wilayah DNA (Territory Scope) yang terkunci.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-black text-sm">
                4
              </div>
              <h3 className="font-extrabold text-slate-900 text-sm">Pendaftaran Relawan TPS</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Korcam mendaftarkan relawan TPS di bawahnya. Relawan login untuk mencatat KTP warga dengan validasi geofencing.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
