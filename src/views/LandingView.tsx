import React, { useState, useEffect } from 'react';
import { auth, FirebaseDataService } from '../services/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { getProvinces, getCities } from '../utils/regionApi';
import { 
  getEstimatedTps, 
  getDapilSuggestions, 
  DEFAULT_PRICING_MATRIX, 
  formatRupiah,
  PricingMatrixMap 
} from '../utils/electoralData';

import { LandingHero } from './landing/LandingHero';
import { LoginModal } from './landing/LoginModal';
import { RegisterWizardModal } from './landing/RegisterWizardModal';

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
      setCalegForm(prev => ({ ...prev, nama_dapil: suggestions[0] }));
    }
  }, [calegForm.tingkat_pemilihan, calegForm.provinsi, calegForm.kota]);

  const currentPricing = pricingMatrix[calegForm.tingkat_pemilihan] || DEFAULT_PRICING_MATRIX['DPRD KAB/KOTA'];
  const currentPriceAmount = selectedTier === 'TIER_2_PRO_AI' ? currentPricing.tier2Price : currentPricing.tier1Price;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const cleanEmail = email.toLowerCase().trim();
    const cleanPassword = password.trim();

    try {
      if (auth.app) {
        const cred = await signInWithEmailAndPassword(auth, cleanEmail, cleanPassword);
        let role = 'CALEG_UTAMA';
        if (cleanEmail.includes('developer') || cleanEmail.includes('dev@') || cleanEmail.startsWith('dev.')) role = 'DEVELOPER';
        else if (cleanEmail.includes('superadmin') || cleanEmail.includes('admin@pemenangan')) role = 'SUPER_ADMIN';
        else if (cleanEmail.includes('administrator') || cleanEmail.includes('owner')) role = 'ADMINISTRATOR';
        else if (cleanEmail.includes('timses')) role = 'TIM_SES';
        else if (cleanEmail.includes('korcam')) role = 'KORCAM';
        else if (cleanEmail.includes('relawan')) role = 'RELAWAN_LAPANGAN';
        onLoginSuccess(role, cred.user.email || cleanEmail);
      } else {
        throw new Error('Auth not configured');
      }
    } catch (err: any) {
      console.warn("Real auth fallback to role routing:", err);
      let role = 'CALEG_UTAMA';
      if (cleanEmail.includes('developer') || cleanEmail.includes('dev@') || cleanEmail.startsWith('dev.')) role = 'DEVELOPER';
      else if (cleanEmail.includes('superadmin') || cleanEmail.includes('admin@pemenangan')) role = 'SUPER_ADMIN';
      else if (cleanEmail.includes('administrator') || cleanEmail.includes('owner')) role = 'ADMINISTRATOR';
      else if (cleanEmail.includes('timses')) role = 'TIM_SES';
      else if (cleanEmail.includes('korcam')) role = 'KORCAM';
      else if (cleanEmail.includes('relawan')) role = 'RELAWAN_LAPANGAN';
      else if (cleanEmail.includes('simpatisan')) role = 'SIMPATISAN_PENDING';
      
      // Allow developer bypass or demo passwords
      if (role === 'DEVELOPER' || cleanPassword === 'password123' || cleanPassword === 'admin123' || cleanPassword === 'dev123') {
        onLoginSuccess(role, cleanEmail);
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
      console.error('Error saving registration to Firestore:', err);
      alert('Gagal mengirim pendaftaran ke server: ' + (err.message || 'Silakan cek koneksi internet Anda'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {view === 'login' && (
        <LoginModal
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          loading={loading}
          error={error}
          onLogin={handleLogin}
          onQuickDemoLogin={handleQuickDemoLogin}
          onBackToLanding={() => {
            setError('');
            setView('landing');
          }}
        />
      )}

      {view === 'register' && (
        <RegisterWizardModal
          regStep={regStep}
          setRegStep={setRegStep}
          calegForm={calegForm}
          setCalegForm={setCalegForm}
          provinces={provinces}
          cities={cities}
          loadingCities={loadingCities}
          dapilSuggestions={dapilSuggestions}
          isCustomDapil={isCustomDapil}
          setIsCustomDapil={setIsCustomDapil}
          pricingMatrix={pricingMatrix}
          selectedTier={selectedTier}
          setSelectedTier={setSelectedTier}
          registrationSuccess={registrationSuccess}
          generatedRegId={generatedRegId}
          loading={loading}
          error={error}
          setError={setError}
          onProceedToStep2={handleProceedToStep2}
          onProceedToStep3={handleProceedToStep3}
          onRegisterCaleg={handleRegisterCaleg}
          onQuickDemoLogin={handleQuickDemoLogin}
          onBackToLanding={() => {
            setError('');
            setView('landing');
          }}
        />
      )}

      <LandingHero
        onOpenLogin={() => setView('login')}
        onOpenRegister={() => setView('register')}
        onQuickDemo={handleQuickDemoLogin}
      />
    </div>
  );
}
