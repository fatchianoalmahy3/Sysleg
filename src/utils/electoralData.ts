export const PARTAI_POLITIK_LIST = [
  '01 - PKB (Partai Kebangkitan Bangsa)',
  '02 - Partai Gerindra',
  '03 - PDI Perjuangan',
  '04 - Partai Golkar',
  '05 - Partai NasDem',
  '06 - Partai Buruh',
  '07 - Partai Gelora Indonesia',
  '08 - PKS (Partai Keadilan Sejahtera)',
  '09 - PKN (Partai Kebangkitan Nusantara)',
  '10 - Partai Hanura',
  '11 - Partai Garda Republik Indonesia (Garuda)',
  '12 - PAN (Partai Amanat Nasional)',
  '13 - PBB (Partai Bulan Bintang)',
  '14 - Partai Demokrat',
  '15 - PSI (Partai Solidaritas Indonesia)',
  '16 - Partai Perindo',
  '17 - PPP (Partai Persatuan Pembangunan)',
  '24 - Partai Ummat',
  'Non-Partai / Perseorangan (DPD-RI / Pilkada Jalur Independen)',
  'Partai Aceh (Partai Lokal Aceh)',
  'PAS Aceh (Partai Adil Sejahtera Aceh)',
  'Partai SIRA (Soliditas Independen Rakyat Aceh)',
  'PDA (Partai Darul Aceh)'
];

export const TINGKAT_PEMILIHAN_OPTIONS = [
  'DPRD KAB/KOTA',
  'DPRD PROVINSI',
  'DPR-RI',
  'DPD-RI',
  'PILKADA (BUPATI/WALIKOTA/GUBERNUR)'
];

export function getEstimatedTps(tingkat: string): string {
  switch (tingkat) {
    case 'DPRD KAB/KOTA':
      return '~400 - 900 TPS (Satu Wilayah Dapil)';
    case 'DPRD PROVINSI':
      return '~2.500 - 5.000 TPS (Lintas Kota/Kabupaten)';
    case 'DPR-RI':
      return '~7.000 - 12.000 TPS (Dapil Nasional)';
    case 'DPD-RI':
      return 'Seluruh TPS Se-Provinsi';
    case 'PILKADA (BUPATI/WALIKOTA/GUBERNUR)':
      return '~1.500 - 4.500 TPS (Karesidenan / Kota / Kabupaten)';
    default:
      return '~500 - 1.000 TPS';
  }
}

export function getDapilSuggestions(tingkat: string, provinsi: string, kota: string): string[] {
  if (tingkat === 'DPRD KAB/KOTA') {
    const cityName = kota || 'Kota/Kab';
    return [
      `Dapil 1 ${cityName}`,
      `Dapil 2 ${cityName}`,
      `Dapil 3 ${cityName}`,
      `Dapil 4 ${cityName}`,
      `Dapil 5 ${cityName}`,
      `Dapil 6 ${cityName}`,
      `Dapil 7 ${cityName}`,
      'Lainnya / Ketik Sendiri'
    ];
  }

  if (tingkat === 'DPR-RI') {
    if (provinsi.toUpperCase().includes('JAWA TIMUR') || provinsi.toUpperCase().includes('EAST JAVA')) {
      return [
        'Jawa Timur I (Surabaya & Sidoarjo)',
        'Jawa Timur II (Pasuruan & Probolinggo)',
        'Jawa Timur III (Banyuwangi, Bondowoso, Situbondo)',
        'Jawa Timur IV (Lumajang & Jember)',
        'Jawa Timur V (Malang Raya - Kota, Kab, Batu)',
        'Jawa Timur VI (Blitar, Kediri, Tulungagung)',
        'Jawa Timur VII (Pacitan, Ponorogo, Trenggalek, Magetan, Ngawi)',
        'Jawa Timur VIII (Jombang, Madiun, Mojokerto, Nganjuk)',
        'Jawa Timur IX (Bojonegoro & Tuban)',
        'Jawa Timur X (Gresik & Lamongan)',
        'Jawa Timur XI (Madura Raya)',
        'Lainnya / Ketik Sendiri'
      ];
    }
    if (provinsi.toUpperCase().includes('JAWA BARAT') || provinsi.toUpperCase().includes('WEST JAVA')) {
      return [
        'Jawa Barat I (Kota Bandung & Cimahi)',
        'Jawa Barat II (Kab. Bandung & Bandung Barat)',
        'Jawa Barat III (Kota Bogor & Cianjur)',
        'Jawa Barat IV (Sukabumi Raya)',
        'Jawa Barat V (Kab. Bogor)',
        'Jawa Barat VI (Kota Depok & Kota Bekasi)',
        'Jawa Barat VII (Kab. Bekasi, Karawang, Purwakarta)',
        'Jawa Barat VIII (Cirebon & Indramayu)',
        'Jawa Barat IX (Majalengka, Subang, Sumedang)',
        'Jawa Barat X (Ciamis, Kuningan, Pangandaran, Banjar)',
        'Jawa Barat XI (Garut & Tasikmalaya)',
        'Lainnya / Ketik Sendiri'
      ];
    }
    if (provinsi.toUpperCase().includes('DKI JAKARTA')) {
      return [
        'DKI Jakarta I (Jakarta Timur)',
        'DKI Jakarta II (Jakarta Pusat, Selatan, Luar Negeri)',
        'DKI Jakarta III (Jakarta Barat, Utara, Kep. Seribu)',
        'Lainnya / Ketik Sendiri'
      ];
    }
    if (provinsi.toUpperCase().includes('JAWA TENGAH') || provinsi.toUpperCase().includes('CENTRAL JAVA')) {
      return [
        'Jawa Tengah I (Semarang, Kendal, Salatiga)',
        'Jawa Tengah II (Kudus, Jepara, Demak)',
        'Jawa Tengah III (Grobogan, Blora, Rembang, Pati)',
        'Jawa Tengah IV (Wonogiri, Karanganyar, Sragen)',
        'Jawa Tengah V (Solo, Sukoharjo, Klaten, Boyolali)',
        'Jawa Tengah VI (Magelang, Purworejo, Temanggung, Wonosobo)',
        'Jawa Tengah VII (Purbalingga, Banjarnegara, Kebumen)',
        'Jawa Tengah VIII (Banyumas & Cilacap)',
        'Jawa Tengah IX (Tegal & Brebes)',
        'Jawa Tengah X (Batang, Pekalongan, Pemalang)',
        'Lainnya / Ketik Sendiri'
      ];
    }
    const provName = provinsi || 'Provinsi';
    return [
      `${provName} I`,
      `${provName} II`,
      `${provName} III`,
      'Lainnya / Ketik Sendiri'
    ];
  }

  if (tingkat === 'DPRD PROVINSI') {
    const provName = provinsi || 'Provinsi';
    const cityName = kota ? ` (${kota})` : '';
    return [
      `${provName} 1${cityName}`,
      `${provName} 2`,
      `${provName} 3`,
      `${provName} 4`,
      `${provName} 5`,
      `${provName} 6`,
      'Lainnya / Ketik Sendiri'
    ];
  }

  if (tingkat === 'PILKADA (BUPATI/WALIKOTA/GUBERNUR)') {
    const target = kota ? `Pilkada ${kota}` : provinsi ? `Pilkada Provinsi ${provinsi}` : 'Pilkada Wilayah';
    return [target, 'Lainnya / Ketik Sendiri'];
  }

  if (tingkat === 'DPD-RI') {
    return [`Dapil Provinsi ${provinsi || 'Terkait'}`];
  }

  return ['Dapil Wilayah 1', 'Dapil Wilayah 2', 'Lainnya / Ketik Sendiri'];
}

export interface PricingPlanTier {
  id: 'TIER_1_STANDARD' | 'TIER_2_PRO_AI';
  name: string;
  tagline: string;
  price: number;
  badge?: string;
  isPopular?: boolean;
  features: string[];
}

export interface PricingMatrixMap {
  [tingkatPemilihan: string]: {
    tier1Price: number;
    tier2Price: number;
    tier2Badge: string;
  };
}

export const DEFAULT_PRICING_MATRIX: PricingMatrixMap = {
  'DPRD KAB/KOTA': {
    tier1Price: 7500000,
    tier2Price: 12500000,
    tier2Badge: 'PALING POPULER'
  },
  'DPRD PROVINSI': {
    tier1Price: 20000000,
    tier2Price: 35000000,
    tier2Badge: 'REKOMENDASI PROVINSI'
  },
  'DPR-RI': {
    tier1Price: 50000000,
    tier2Price: 85000000,
    tier2Badge: 'ENTERPRISE VICTORY'
  },
  'PILKADA (BUPATI/WALIKOTA/GUBERNUR)': {
    tier1Price: 50000000,
    tier2Price: 85000000,
    tier2Badge: 'KOMANDO KEPALA DAERAH'
  },
  'DPD-RI': {
    tier1Price: 35000000,
    tier2Price: 60000000,
    tier2Badge: 'PROVINSI PENUH'
  }
};

export const STANDARD_FEATURES = [
  'Cakupan Kuota Penuh Seluruh TPS di Dapil Terpilih',
  'Private Dedicated Cloud Storage (100% Data Hak Milik Caleg)',
  'Manajemen Relawan Bertingkat (Korcam, Kordes, Saksi TPS)',
  'Form Input & Validasi Format NIK 16-Digit Pemilih',
  'Quick Count & Real Count C1 dengan Kompresi Gambar On-Device (<300KB)',
  'Peta Defisit Suara per Kecamatan & Matriks Saksi TPS',
  'Ekspor Database Excel & Cetak Dokumen QR Code Kriptografi',
  'Sainte-Laguë Parlemen & Dashboard Command Center'
];

export const PRO_AI_FEATURES = [
  'Termasuk Seluruh Fitur Paket Standard / Pratama',
  '★ Modul Audit Keuangan Kampanye (RAB & LPJ Keuangan)',
  '★ Indeks Efisiensi Cost-per-Vote (CPV) & Otomatisasi Warning Mark-Up',
  '★ Integrasi Katalog Harga BPS Daerah & Rekonsiliasi Sisa Kas SILPA',
  '★ Simulator "What-If" Sainte-Laguë & Stress-Test Persaingan',
  '★ AI OCR Auto-Scanner C1 Plano & Dokumen e-KTP',
  '★ Multi-Admin Timses dengan Hak Akses Terpisah & Prioritas Support VIP'
];

export type PackageTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'ENTERPRISE';

export const TIER_RANK: Record<PackageTier, number> = {
  BRONZE: 1,
  SILVER: 2,
  GOLD: 3,
  PLATINUM: 4,
  ENTERPRISE: 5
};

export interface TierCapability {
  maxTPS: number;
  label: string;
  badgeColor: string;
  financialAudit: boolean;
  cpvEngine: boolean;
  sainteLagueSimulator: boolean;
  ocrScannerC1: boolean;
  qrCodeVerification: boolean;
  customSchemaLowCode: boolean;
}

export const TIER_CAPABILITIES: Record<PackageTier, TierCapability> = {
  BRONZE: {
    maxTPS: 100,
    label: 'Bronze Pratama (DPRD Kab/Kota)',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    financialAudit: false,
    cpvEngine: false,
    sainteLagueSimulator: false,
    ocrScannerC1: false,
    qrCodeVerification: true,
    customSchemaLowCode: false
  },
  SILVER: {
    maxTPS: 500,
    label: 'Silver Madya (DPRD Provinsi)',
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
    financialAudit: true,
    cpvEngine: true,
    sainteLagueSimulator: true,
    ocrScannerC1: false,
    qrCodeVerification: true,
    customSchemaLowCode: false
  },
  GOLD: {
    maxTPS: 2500,
    label: 'Gold Utama (DPR-RI)',
    badgeColor: 'bg-amber-500 text-white border-amber-600 font-semibold',
    financialAudit: true,
    cpvEngine: true,
    sainteLagueSimulator: true,
    ocrScannerC1: true,
    qrCodeVerification: true,
    customSchemaLowCode: true
  },
  PLATINUM: {
    maxTPS: 5000,
    label: 'Platinum Senator (DPD-RI)',
    badgeColor: 'bg-indigo-600 text-white border-indigo-700 font-semibold',
    financialAudit: true,
    cpvEngine: true,
    sainteLagueSimulator: true,
    ocrScannerC1: true,
    qrCodeVerification: true,
    customSchemaLowCode: true
  },
  ENTERPRISE: {
    maxTPS: 99999,
    label: 'Enterprise Victory (Pilkada Kepala Daerah)',
    badgeColor: 'bg-purple-600 text-white border-purple-700 font-black',
    financialAudit: true,
    cpvEngine: true,
    sainteLagueSimulator: true,
    ocrScannerC1: true,
    qrCodeVerification: true,
    customSchemaLowCode: true
  }
};

export function resolvePackageTier(packageNameOrTier?: string): PackageTier {
  if (!packageNameOrTier) return 'ENTERPRISE';
  const str = packageNameOrTier.toUpperCase();
  if (str.includes('PILKADA') || str.includes('BUPATI') || str.includes('GUBERNUR') || str.includes('ENTERPRISE')) {
    return 'ENTERPRISE';
  }
  if (str.includes('DPD') || str.includes('SENATOR') || str.includes('PLATINUM')) {
    return 'PLATINUM';
  }
  if (str.includes('GOLD') || str.includes('UTAMA') || str.includes('DPR-RI') || str.includes('DPR RI')) {
    return 'GOLD';
  }
  if (str.includes('SILVER') || str.includes('MADYA') || str.includes('PROVINSI')) {
    return 'SILVER';
  }
  if (str.includes('BRONZE') || str.includes('PRATAMA') || str.includes('KAB/KOTA') || str.includes('DASAR')) {
    return 'BRONZE';
  }
  return 'GOLD';
}

export function isModuleTierAllowed(requiredTier: PackageTier | undefined, currentTier: PackageTier): boolean {
  if (!requiredTier) return true;
  return TIER_RANK[currentTier] >= TIER_RANK[requiredTier];
}

export function isFeatureAllowed(featureKey: keyof TierCapability, currentTier: PackageTier): boolean {
  const capability = TIER_CAPABILITIES[currentTier];
  if (!capability) return true;
  return Boolean(capability[featureKey]);
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(amount);
}

export const DEFAULT_SYSTEM_SETTINGS = {
  id: 'global_system_settings',
  nama_lembaga: 'LEMBAGA KONSULTASI PEMENANGAN ELEKTORAL & TEKNOLOGI INFORMASI',
  sub_judul: 'SaaS Platform Manajemen Pemenangan Pemilu & Sistem Informasi Saksi TPS',
  alamat_kantor: 'Graha Pemilu Mandiri Lt. 8, Jl. Jend. Sudirman Kav. 52-53, Jakarta Selatan 12190',
  no_telp_layanan: '0812-3456-7890',
  email_resmi: 'support@pemenangancaleg.id',
  website: 'https://pemenangancaleg.id',
  bank_nama: 'BANK CENTRAL ASIA (BCA)',
  bank_rekening: '873-509-2211',
  bank_atas_nama: 'PT ELEKTORAL TEKNOLOGI NUSANTARA',
  catatan_legal: 'Dokumen ini merupakan keluaran sah sistem elektronik terverifikasi berdasarkan ketentuan UU ITE Pasal 5 Ayat 1. Seluruh transaksi dan hak akses workspace tunduk pada syarat & ketentuan layanan SaaS Pemenangan Pemilu.'
};

export const SEED_PRICING_ITEMS = [
  {
    tingkat_pemilihan: 'DPRD KAB/KOTA',
    tier: 'TIER_1_STANDARD',
    nama_paket: 'Bronze Pratama (Dapil Kab/Kota)',
    harga: 7500000,
    estimasi_tps: '~400 - 900 TPS (Satu Wilayah Dapil)',
    badge_promo: '',
    catatan_fitur: 'Manajemen relawan bertingkat, validasi NIK 16 digit, rekap suara saksi TPS & C1 kompresi (<300KB).',
    is_active: true
  },
  {
    tingkat_pemilihan: 'DPRD KAB/KOTA',
    tier: 'TIER_2_PRO_AI',
    nama_paket: 'Bronze Pro AI (Dapil Kab/Kota)',
    harga: 12500000,
    estimasi_tps: '~400 - 900 TPS (Satu Wilayah Dapil)',
    badge_promo: 'PALING POPULER',
    catatan_fitur: 'Termasuk Audit Keuangan RAB/LPJ, CPV Engine, warning mark-up, dan Sainte-Laguë What-If Simulator.',
    is_active: true
  },
  {
    tingkat_pemilihan: 'DPRD PROVINSI',
    tier: 'TIER_1_STANDARD',
    nama_paket: 'Silver Pratama (DPRD Provinsi)',
    harga: 20000000,
    estimasi_tps: '~2.500 - 5.000 TPS (Lintas Kota/Kabupaten)',
    badge_promo: '',
    catatan_fitur: 'Manajemen lintas koordinator kecamatan, rekap saksi multi-wilayah, dan cetak dokumen QR Code.',
    is_active: true
  },
  {
    tingkat_pemilihan: 'DPRD PROVINSI',
    tier: 'TIER_2_PRO_AI',
    nama_paket: 'Silver Pro AI (DPRD Provinsi)',
    harga: 35000000,
    estimasi_tps: '~2.500 - 5.000 TPS (Lintas Kota/Kabupaten)',
    badge_promo: 'REKOMENDASI PROVINSI',
    catatan_fitur: 'Audit Keuangan RAB/LPJ, BPS Price Catalog, AI OCR C1 Plano massal, dan support VIP.',
    is_active: true
  },
  {
    tingkat_pemilihan: 'DPR-RI',
    tier: 'TIER_1_STANDARD',
    nama_paket: 'Gold Pratama (DPR-RI)',
    harga: 50000000,
    estimasi_tps: '~7.000 - 12.000 TPS (Dapil Nasional)',
    badge_promo: '',
    catatan_fitur: 'Manajemen struktur relawan skala besar lintas kabupaten dan private dedicated database.',
    is_active: true
  },
  {
    tingkat_pemilihan: 'DPR-RI',
    tier: 'TIER_2_PRO_AI',
    nama_paket: 'Gold Enterprise Victory (DPR-RI)',
    harga: 85000000,
    estimasi_tps: '~7.000 - 12.000 TPS (Dapil Nasional)',
    badge_promo: 'ENTERPRISE VICTORY',
    catatan_fitur: 'Seluruh fitur komplit, audit fraud AI, custom schema low-code, dan dedicated war room server.',
    is_active: true
  },
  {
    tingkat_pemilihan: 'PILKADA (BUPATI/WALIKOTA/GUBERNUR)',
    tier: 'TIER_1_STANDARD',
    nama_paket: 'Gold Commander (Pilkada Standard)',
    harga: 50000000,
    estimasi_tps: '~1.500 - 4.500 TPS',
    badge_promo: '',
    catatan_fitur: 'Posko pemenangan terpusat & monitoring saksi TPS terpadu.',
    is_active: true
  },
  {
    tingkat_pemilihan: 'PILKADA (BUPATI/WALIKOTA/GUBERNUR)',
    tier: 'TIER_2_PRO_AI',
    nama_paket: 'Gold Pro Commander (Pilkada Complete)',
    harga: 85000000,
    estimasi_tps: '~1.500 - 4.500 TPS',
    badge_promo: 'KOMANDO KEPALA DAERAH',
    catatan_fitur: 'Peta geospasial TPS rawan, audit keuangan RAB/LPJ, dan verifikasi real-count terpadu AI.',
    is_active: true
  },
  {
    tingkat_pemilihan: 'DPD-RI',
    tier: 'TIER_1_STANDARD',
    nama_paket: 'Silver Pratama (DPD-RI)',
    harga: 35000000,
    estimasi_tps: 'Seluruh TPS Se-Provinsi',
    badge_promo: '',
    catatan_fitur: 'Pendataan relawan perseorangan & saksi independen.',
    is_active: true
  },
  {
    tingkat_pemilihan: 'DPD-RI',
    tier: 'TIER_2_PRO_AI',
    nama_paket: 'Gold Pro Victory (DPD-RI)',
    harga: 60000000,
    estimasi_tps: 'Seluruh TPS Se-Provinsi',
    badge_promo: 'PROVINSI PENUH',
    catatan_fitur: 'Audit KTP perseorangan, verifikasi syarat dukungan KPU, dan audit anggaran CPV.',
    is_active: true
  }
];

// =========================================================================
// OFFICIAL KPU KABUPATEN PONOROGO DPT 2024 (BERITA ACARA NO. 425/2023)
// 21 Kecamatan, 307 Desa/Kelurahan, 2.893 TPS, Total DPT: 758.688
// =========================================================================
export interface KpuKecamatanData {
  no: number;
  nama: string;
  dapilId: string;
  dapilNama: string;
  desaCount: number;
  tpsCount: number;
  tpsReguler: number;
  tpsLoksus: number;
  dptL: number;
  dptP: number;
  dptTotal: number;
  kuadran: 'BASIS_HIJAU' | 'BATTLEGROUND_KUNING' | 'RAWAN_MERAH';
  picKorcam: string;
  targetSuara: number;
  suaraTerkunci: number;
  catatanStrategi: string;
}

export const KPU_DPT_PONOROGO_2024: KpuKecamatanData[] = [
  {
    no: 1,
    nama: 'Slahung',
    dapilId: 'DAPIL_4',
    dapilNama: 'Dapil Ponorogo 4 (Sambit, Bungkal, Slahung, Ngrayun)',
    desaCount: 22,
    tpsCount: 168,
    tpsReguler: 168,
    tpsLoksus: 0,
    dptL: 21540,
    dptP: 21968,
    dptTotal: 43508,
    kuadran: 'RAWAN_MERAH',
    picKorcam: 'Marno, S.Pd.',
    targetSuara: 4500,
    suaraTerkunci: 2100,
    catatanStrategi: 'Fokus gerilya di kelompok tani sentra pertanian Slahung dan penguatan Kordes.'
  },
  {
    no: 2,
    nama: 'Ngrayun',
    dapilId: 'DAPIL_4',
    dapilNama: 'Dapil Ponorogo 4 (Sambit, Bungkal, Slahung, Ngrayun)',
    desaCount: 11,
    tpsCount: 198,
    tpsReguler: 198,
    tpsLoksus: 0,
    dptL: 25004,
    dptP: 24363,
    dptTotal: 49367,
    kuadran: 'BATTLEGROUND_KUNING',
    picKorcam: 'Sugeng Riyadi',
    targetSuara: 5200,
    suaraTerkunci: 2850,
    catatanStrategi: 'Medan perbukitan luas; bentuk simpul posko relawan motoris dan saksi tangguh.'
  },
  {
    no: 3,
    nama: 'Bungkal',
    dapilId: 'DAPIL_4',
    dapilNama: 'Dapil Ponorogo 4 (Sambit, Bungkal, Slahung, Ngrayun)',
    desaCount: 19,
    tpsCount: 119,
    tpsReguler: 119,
    tpsLoksus: 0,
    dptL: 15047,
    dptP: 15636,
    dptTotal: 30683,
    kuadran: 'BASIS_HIJAU',
    picKorcam: 'Triyono, S.Sos.',
    targetSuara: 4200,
    suaraTerkunci: 3100,
    catatanStrategi: 'Kekuatan basis kultural keluarga besar nahdliyin dan tokoh masyarakat desa.'
  },
  {
    no: 4,
    nama: 'Sambit',
    dapilId: 'DAPIL_4',
    dapilNama: 'Dapil Ponorogo 4 (Sambit, Bungkal, Slahung, Ngrayun)',
    desaCount: 16,
    tpsCount: 120,
    tpsReguler: 120,
    tpsLoksus: 0,
    dptL: 15912,
    dptP: 16201,
    dptTotal: 32113,
    kuadran: 'BATTLEGROUND_KUNING',
    picKorcam: 'Wahyu Hidayat',
    targetSuara: 3800,
    suaraTerkunci: 2200,
    catatanStrategi: 'Kompetisi terbuka di jalur poros Sambit-Trenggalek; intensifkan tatap muka warga.'
  },
  {
    no: 5,
    nama: 'Sawoo',
    dapilId: 'DAPIL_3',
    dapilNama: 'Dapil Ponorogo 3 (Pulung, Pudak, Sooko, Sawoo, Ngebel)',
    desaCount: 14,
    tpsCount: 194,
    tpsReguler: 194,
    tpsLoksus: 0,
    dptL: 24365,
    dptP: 24977,
    dptTotal: 49342,
    kuadran: 'BATTLEGROUND_KUNING',
    picKorcam: 'H. Joko Susilo',
    targetSuara: 5400,
    suaraTerkunci: 3150,
    catatanStrategi: 'Wilayah jalur utama Trenggalek-Ponorogo; pasang branding posko di titik strategis.'
  },
  {
    no: 6,
    nama: 'Sooko',
    dapilId: 'DAPIL_3',
    dapilNama: 'Dapil Ponorogo 3 (Pulung, Pudak, Sooko, Sawoo, Ngebel)',
    desaCount: 6,
    tpsCount: 84,
    tpsReguler: 84,
    tpsLoksus: 0,
    dptL: 9669,
    dptP: 9996,
    dptTotal: 19665,
    kuadran: 'RAWAN_MERAH',
    picKorcam: 'Wasono',
    targetSuara: 2100,
    suaraTerkunci: 950,
    catatanStrategi: 'Penetrasi awal di sentra pemukiman lembah; rangkul kelompok pemuda karang taruna.'
  },
  {
    no: 7,
    nama: 'Pulung',
    dapilId: 'DAPIL_3',
    dapilNama: 'Dapil Ponorogo 3 (Pulung, Pudak, Sooko, Sawoo, Ngebel)',
    desaCount: 18,
    tpsCount: 160,
    tpsReguler: 160,
    tpsLoksus: 0,
    dptL: 20572,
    dptP: 20890,
    dptTotal: 41462,
    kuadran: 'RAWAN_MERAH',
    picKorcam: 'Suyitno',
    targetSuara: 4200,
    suaraTerkunci: 1800,
    catatanStrategi: 'Akses pegunungan; koordinasikan posko logistik per 3 desa binaan Kordes.'
  },
  {
    no: 8,
    nama: 'Mlarak',
    dapilId: 'DAPIL_2',
    dapilNama: 'Dapil Ponorogo 2 (Jenangan, Siman, Jetis, Mlarak)',
    desaCount: 15,
    tpsCount: 108,
    tpsReguler: 105,
    tpsLoksus: 3,
    dptL: 15190,
    dptP: 13885,
    dptTotal: 29075,
    kuadran: 'BASIS_HIJAU',
    picKorcam: 'Drs. KH. Masrur',
    targetSuara: 4300,
    suaraTerkunci: 3450,
    catatanStrategi: 'Kawasan basis santri kuat (ada 3 TPS Lokasi Khusus Ponpes Gontor Putra).'
  },
  {
    no: 9,
    nama: 'Jetis',
    dapilId: 'DAPIL_2',
    dapilNama: 'Dapil Ponorogo 2 (Jenangan, Siman, Jetis, Mlarak)',
    desaCount: 14,
    tpsCount: 95,
    tpsReguler: 95,
    tpsLoksus: 0,
    dptL: 12204,
    dptP: 12609,
    dptTotal: 24813,
    kuadran: 'BASIS_HIJAU',
    picKorcam: 'Gatot Subroto',
    targetSuara: 3500,
    suaraTerkunci: 2600,
    catatanStrategi: 'Kantong suara tradisional kultural Tegalsari dan sekitarnya terawat solid.'
  },
  {
    no: 10,
    nama: 'Siman',
    dapilId: 'DAPIL_2',
    dapilNama: 'Dapil Ponorogo 2 (Jenangan, Siman, Jetis, Mlarak)',
    desaCount: 18,
    tpsCount: 140,
    tpsReguler: 136,
    tpsLoksus: 4,
    dptL: 19322,
    dptP: 18157,
    dptTotal: 37479,
    kuadran: 'BASIS_HIJAU',
    picKorcam: 'Drs. Hendro Wibowo',
    targetSuara: 5100,
    suaraTerkunci: 3400,
    catatanStrategi: 'Basis loyal Ronowijayan & Siman (ada 4 TPS Lokasi Khusus Kampus UNIDA Gontor).'
  },
  {
    no: 11,
    nama: 'Balong',
    dapilId: 'DAPIL_5',
    dapilNama: 'Dapil Ponorogo 5 (Balong, Badegan, Jambon)',
    desaCount: 20,
    tpsCount: 142,
    tpsReguler: 142,
    tpsLoksus: 0,
    dptL: 18426,
    dptP: 19401,
    dptTotal: 37827,
    kuadran: 'BATTLEGROUND_KUNING',
    picKorcam: 'Suwandi, S.P.',
    targetSuara: 4100,
    suaraTerkunci: 2450,
    catatanStrategi: 'Lumbung padi selatan; pendekatan pada himpunan petani pemakai air (HIPPA).'
  },
  {
    no: 12,
    nama: 'Kauman',
    dapilId: 'DAPIL_6',
    dapilNama: 'Dapil Ponorogo 6 (Kauman, Sampung, Sukorejo)',
    desaCount: 16,
    tpsCount: 135,
    tpsReguler: 135,
    tpsLoksus: 0,
    dptL: 18051,
    dptP: 18647,
    dptTotal: 36698,
    kuadran: 'BASIS_HIJAU',
    picKorcam: 'Endro Subroto',
    targetSuara: 4000,
    suaraTerkunci: 2800,
    catatanStrategi: 'Kekuatan basis komunitas seni Reyog Sumoroto dan paguyuban pasar tradisional.'
  },
  {
    no: 13,
    nama: 'Badegan',
    dapilId: 'DAPIL_5',
    dapilNama: 'Dapil Ponorogo 5 (Balong, Badegan, Jambon)',
    desaCount: 10,
    tpsCount: 104,
    tpsReguler: 104,
    tpsLoksus: 0,
    dptL: 13399,
    dptP: 13497,
    dptTotal: 26896,
    kuadran: 'RAWAN_MERAH',
    picKorcam: 'Sunardi',
    targetSuara: 2800,
    suaraTerkunci: 1200,
    catatanStrategi: 'Daerah tapal batas Wonogiri; fokus door-to-door dan amankan saksi luar bilik.'
  },
  {
    no: 14,
    nama: 'Sampung',
    dapilId: 'DAPIL_6',
    dapilNama: 'Dapil Ponorogo 6 (Kauman, Sampung, Sukorejo)',
    desaCount: 12,
    tpsCount: 121,
    tpsReguler: 121,
    tpsLoksus: 0,
    dptL: 15784,
    dptP: 16229,
    dptTotal: 32013,
    kuadran: 'BATTLEGROUND_KUNING',
    picKorcam: 'Kuswanto, S.Pd.',
    targetSuara: 3500,
    suaraTerkunci: 1950,
    catatanStrategi: 'Kawasan perbukitan kapur; galang tokoh paguyuban pekerja tambang & UMKM.'
  },
  {
    no: 15,
    nama: 'Sukorejo',
    dapilId: 'DAPIL_6',
    dapilNama: 'Dapil Ponorogo 6 (Kauman, Sampung, Sukorejo)',
    desaCount: 18,
    tpsCount: 166,
    tpsReguler: 166,
    tpsLoksus: 0,
    dptL: 22494,
    dptP: 23045,
    dptTotal: 45539,
    kuadran: 'BATTLEGROUND_KUNING',
    picKorcam: 'Purwanto, S.E.',
    targetSuara: 5000,
    suaraTerkunci: 2900,
    catatanStrategi: 'Kecamatan padat perbatasan Magetan; massifkan distribusi spanduk dan silaturahmi RT.'
  },
  {
    no: 16,
    nama: 'Babadan',
    dapilId: 'DAPIL_1',
    dapilNama: 'Dapil Ponorogo 1 (Kota & Babadan)',
    desaCount: 15,
    tpsCount: 201,
    tpsReguler: 201,
    tpsLoksus: 0,
    dptL: 26528,
    dptP: 27607,
    dptTotal: 54135,
    kuadran: 'BATTLEGROUND_KUNING',
    picKorcam: 'Suryadi, S.Sos.',
    targetSuara: 7200,
    suaraTerkunci: 4900,
    catatanStrategi: 'Pertarungan sengit di Ngunut dan Kadipaten; gerakkan jejaring pemuda dan sanggar reyog.'
  },
  {
    no: 17,
    nama: 'Ponorogo (Kota)',
    dapilId: 'DAPIL_1',
    dapilNama: 'Dapil Ponorogo 1 (Kota & Babadan)',
    desaCount: 19,
    tpsCount: 218,
    tpsReguler: 216,
    tpsLoksus: 2,
    dptL: 28932,
    dptP: 29610,
    dptTotal: 58542,
    kuadran: 'BASIS_HIJAU',
    picKorcam: 'Budi Santoso, S.Pd.',
    targetSuara: 9500,
    suaraTerkunci: 6850,
    catatanStrategi: 'Ibukota kabupaten (ada 2 TPS Lokasi Khusus Rutan Kelas IIB Ponorogo); kunci kantong santri dan paguyuban guru.'
  },
  {
    no: 18,
    nama: 'Jenangan',
    dapilId: 'DAPIL_2',
    dapilNama: 'Dapil Ponorogo 2 (Jenangan, Siman, Jetis, Mlarak)',
    desaCount: 17,
    tpsCount: 175,
    tpsReguler: 175,
    tpsLoksus: 0,
    dptL: 23453,
    dptP: 24041,
    dptTotal: 47494,
    kuadran: 'BATTLEGROUND_KUNING',
    picKorcam: 'Agus Triono',
    targetSuara: 4800,
    suaraTerkunci: 2650,
    catatanStrategi: 'Kawasan perbatasan Madiun; perbanyak safari pengajian dan konsolidasi tokoh desa.'
  },
  {
    no: 19,
    nama: 'Ngebel',
    dapilId: 'DAPIL_3',
    dapilNama: 'Dapil Ponorogo 3 (Pulung, Pudak, Sooko, Sawoo, Ngebel)',
    desaCount: 8,
    tpsCount: 72,
    tpsReguler: 72,
    tpsLoksus: 0,
    dptL: 8602,
    dptP: 8511,
    dptTotal: 17113,
    kuadran: 'BATTLEGROUND_KUNING',
    picKorcam: 'Supriyadi',
    targetSuara: 2200,
    suaraTerkunci: 1100,
    catatanStrategi: 'Kawasan wisata Telaga Ngebel; sinergi dengan pelaku wisata perahu, pedagang, dan petani durian.'
  },
  {
    no: 20,
    nama: 'Jambon',
    dapilId: 'DAPIL_5',
    dapilNama: 'Dapil Ponorogo 5 (Balong, Badegan, Jambon)',
    desaCount: 13,
    tpsCount: 139,
    tpsReguler: 139,
    tpsLoksus: 0,
    dptL: 18478,
    dptP: 18818,
    dptTotal: 37296,
    kuadran: 'RAWAN_MERAH',
    picKorcam: 'Darminto',
    targetSuara: 3400,
    suaraTerkunci: 1400,
    catatanStrategi: 'Akselerasi penggalangan suara lewat aspirasi air bersih dan pupuk pertanian.'
  },
  {
    no: 21,
    nama: 'Pudak',
    dapilId: 'DAPIL_3',
    dapilNama: 'Dapil Ponorogo 3 (Pulung, Pudak, Sooko, Sawoo, Ngebel)',
    desaCount: 6,
    tpsCount: 34,
    tpsReguler: 34,
    tpsLoksus: 0,
    dptL: 3782,
    dptP: 3846,
    dptTotal: 7628,
    kuadran: 'BASIS_HIJAU',
    picKorcam: 'Wagimin',
    targetSuara: 1500,
    suaraTerkunci: 1050,
    catatanStrategi: 'Kawasan sentra sapi perah lereng Gunung Wilis; sentuh koperasi peternak susu.'
  }
];

// Aggregated Summary of Official Ponorogo DPT 2024
export const PONOROGO_DPT_OFFICIAL_SUMMARY = {
  provinsi: 'Jawa Timur',
  kabupaten: 'Kabupaten Ponorogo',
  beritaAcaraNo: '425/PL.01.02-BA/3502/2023',
  tanggalPenetapan: '21 Juni 2023',
  totalKecamatan: 21,
  totalDesa: 307,
  totalTps: 2893,
  totalTpsReguler: 2878,
  totalTpsLoksus: 15,
  totalDptL: 376754,
  totalDptP: 381934,
  totalDpt: 758688,
  totalKursiDprd: 45
};

export const DAPIL_PONOROGO_OFFICIAL = [
  {
    id: 'DAPIL_1',
    nama: 'Dapil Ponorogo 1',
    wilayah: 'Ponorogo (Kota), Babadan',
    kecamatanList: ['Ponorogo (Kota)', 'Babadan'],
    alokasiKursi: 7,
    totalDesa: 34,
    totalTps: 419,
    totalDpt: 112677,
    targetSuaraDefault: 16700
  },
  {
    id: 'DAPIL_2',
    nama: 'Dapil Ponorogo 2',
    wilayah: 'Jenangan, Siman, Jetis, Mlarak',
    kecamatanList: ['Jenangan', 'Siman', 'Jetis', 'Mlarak'],
    alokasiKursi: 8,
    totalDesa: 64,
    totalTps: 518,
    totalDpt: 138861,
    targetSuaraDefault: 17700
  },
  {
    id: 'DAPIL_3',
    nama: 'Dapil Ponorogo 3',
    wilayah: 'Sawoo, Pulung, Sooko, Pudak, Ngebel',
    kecamatanList: ['Sawoo', 'Pulung', 'Sooko', 'Pudak', 'Ngebel'],
    alokasiKursi: 8,
    totalDesa: 52,
    totalTps: 544,
    totalDpt: 135210,
    targetSuaraDefault: 15400
  },
  {
    id: 'DAPIL_4',
    nama: 'Dapil Ponorogo 4',
    wilayah: 'Ngrayun, Slahung, Bungkal, Sambit',
    kecamatanList: ['Ngrayun', 'Slahung', 'Bungkal', 'Sambit'],
    alokasiKursi: 9,
    totalDesa: 68,
    totalTps: 605,
    totalDpt: 155671,
    targetSuaraDefault: 17700
  },
  {
    id: 'DAPIL_5',
    nama: 'Dapil Ponorogo 5',
    wilayah: 'Balong, Badegan, Jambon',
    kecamatanList: ['Balong', 'Badegan', 'Jambon'],
    alokasiKursi: 6,
    totalDesa: 43,
    totalTps: 385,
    totalDpt: 102019,
    targetSuaraDefault: 10300
  },
  {
    id: 'DAPIL_6',
    nama: 'Dapil Ponorogo 6',
    wilayah: 'Kauman, Sukorejo, Sampung',
    kecamatanList: ['Kauman (Sumoroto)', 'Sukorejo', 'Sampung'],
    alokasiKursi: 7,
    totalDesa: 46,
    totalTps: 422,
    totalDpt: 114250,
    targetSuaraDefault: 12500
  }
];

