import React from 'react';
import { 
  Building2, 
  Lock, 
  CheckCircle, 
  CheckCircle2, 
  UserCheck, 
  MapPin, 
  CreditCard, 
  AlertCircle, 
  Loader2, 
  ArrowRight, 
  ArrowLeft, 
  Zap, 
  Star, 
  Sparkles, 
  Check 
} from 'lucide-react';
import { 
  PARTAI_POLITIK_LIST, 
  TINGKAT_PEMILIHAN_OPTIONS, 
  STANDARD_FEATURES, 
  PRO_AI_FEATURES, 
  formatRupiah,
  PricingMatrixMap,
  getEstimatedTps 
} from '../../utils/electoralData';

interface RegisterWizardModalProps {
  regStep: 1 | 2 | 3;
  setRegStep: (step: 1 | 2 | 3) => void;
  calegForm: {
    nama_caleg: string;
    email: string;
    no_wa: string;
    tingkat_pemilihan: string;
    provinsi: string;
    kota: string;
    nama_dapil: string;
    partai: string;
    nomor_urut: number;
  };
  setCalegForm: React.Dispatch<React.SetStateAction<any>>;
  provinces: any[];
  cities: any[];
  loadingCities: boolean;
  dapilSuggestions: string[];
  isCustomDapil: boolean;
  setIsCustomDapil: (val: boolean) => void;
  pricingMatrix: PricingMatrixMap;
  selectedTier: 'TIER_1_STANDARD' | 'TIER_2_PRO_AI';
  setSelectedTier: (tier: 'TIER_1_STANDARD' | 'TIER_2_PRO_AI') => void;
  registrationSuccess: boolean;
  generatedRegId: string;
  loading: boolean;
  error: string;
  setError: (val: string) => void;
  onProceedToStep2: (e: React.FormEvent) => void;
  onProceedToStep3: (e: React.FormEvent) => void;
  onRegisterCaleg: (e: React.FormEvent) => void;
  onQuickDemoLogin: (role: string, demoEmail: string) => void;
  onBackToLanding: () => void;
}

export const RegisterWizardModal: React.FC<RegisterWizardModalProps> = ({
  regStep,
  setRegStep,
  calegForm,
  setCalegForm,
  provinces,
  cities,
  loadingCities,
  dapilSuggestions,
  isCustomDapil,
  setIsCustomDapil,
  pricingMatrix,
  selectedTier,
  setSelectedTier,
  registrationSuccess,
  generatedRegId,
  loading,
  error,
  setError,
  onProceedToStep2,
  onProceedToStep3,
  onRegisterCaleg,
  onQuickDemoLogin,
  onBackToLanding
}) => {
  const currentPricing = pricingMatrix[calegForm.tingkat_pemilihan] || pricingMatrix['DPRD KAB/KOTA'];
  const currentPriceAmount = selectedTier === 'TIER_2_PRO_AI' ? currentPricing?.tier2Price || 6500000 : currentPricing?.tier1Price || 3500000;

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
              onClick={onBackToLanding}
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
                  onClick={() => onQuickDemoLogin('SUPER_ADMIN', 'superadmin@pemenangan.id')}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 py-3 font-bold text-xs transition-all shadow-md cursor-pointer min-h-[44px]"
                >
                  Buka Dashboard Superadmin (Tinjau Sekarang)
                </button>
                <button
                  onClick={onBackToLanding}
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
                <form onSubmit={onProceedToStep2} className="space-y-4 sm:space-y-5">
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
                      onClick={onBackToLanding}
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
                <form onSubmit={onProceedToStep3} className="space-y-4 sm:space-y-5">
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
                <form onSubmit={onRegisterCaleg} className="space-y-5">
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
                            {formatRupiah(currentPricing?.tier1Price || 3500000)}
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
                        {currentPricing?.tier2Badge || 'PALING POPULER'}
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
                            {formatRupiah(currentPricing?.tier2Price || 6500000)}
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
};
