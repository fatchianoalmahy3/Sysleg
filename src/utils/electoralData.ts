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
    tier1Price: 3500000,
    tier2Price: 6500000,
    tier2Badge: 'PALING POPULER'
  },
  'DPRD PROVINSI': {
    tier1Price: 7500000,
    tier2Price: 13500000,
    tier2Badge: 'REKOMENDASI PROVINSI'
  },
  'DPR-RI': {
    tier1Price: 15000000,
    tier2Price: 27500000,
    tier2Badge: 'ENTERPRISE VICTORY'
  },
  'PILKADA (BUPATI/WALIKOTA/GUBERNUR)': {
    tier1Price: 20000000,
    tier2Price: 35000000,
    tier2Badge: 'KOMANDO KEPALA DAERAH'
  },
  'DPD-RI': {
    tier1Price: 12500000,
    tier2Price: 22500000,
    tier2Badge: 'PROVINSI PENUH'
  }
};

export const STANDARD_FEATURES = [
  'Cakupan Kuota Penuh Seluruh TPS di Dapil Terpilih',
  'Manajemen Relawan Bertingkat (Korcam, Kordes, Saksi TPS)',
  'Form Input & Rekapitulasi Konstituen / DPT',
  'Quick Count Realtime Perolehan Suara Saksi TPS',
  'Ekspor Database Excel Lengkap & Dokumen Cetak QR Code',
  'Aplikasi Responsif Seluler & Mode Hybrid Offline'
];

export const PRO_AI_FEATURES = [
  'Termasuk Seluruh Fitur Standard Command',
  '★ AI OCR Auto-Scanner e-KTP (Deteksi NIK & Nama Otomatis)',
  '★ AI OCR Verifikasi Form C1 Plano Quick Count KPU',
  '★ Peta GIS Interaktif & Heatmap Sebaran Suara',
  '★ Sistem Anti-Fraud & Deteksi Dini KTP Ganda Antar Relawan',
  '★ Multi-Admin Timses dengan Hak Akses Terpisah',
  '★ Prioritas Approval & Verifikasi Cepat oleh Superadmin'
];

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
    nama_paket: 'Standard Command (Dapil Kab/Kota)',
    harga: 3500000,
    estimasi_tps: '~400 - 900 TPS (Satu Wilayah Dapil)',
    badge_promo: '',
    catatan_fitur: 'Manajemen relawan bertingkat, input data konstituen manual, rekap suara saksi TPS.',
    is_active: true
  },
  {
    tingkat_pemilihan: 'DPRD KAB/KOTA',
    tier: 'TIER_2_PRO_AI',
    nama_paket: 'Pro AI Intelligence (Dapil Kab/Kota)',
    harga: 6500000,
    estimasi_tps: '~400 - 900 TPS (Satu Wilayah Dapil)',
    badge_promo: 'PALING POPULER',
    catatan_fitur: 'Termasuk AI Scanner KTP, Audit AI C1 Plano, Peta GIS sebaran suara.',
    is_active: true
  },
  {
    tingkat_pemilihan: 'DPRD PROVINSI',
    tier: 'TIER_1_STANDARD',
    nama_paket: 'Standard Command (DPRD Provinsi)',
    harga: 7500000,
    estimasi_tps: '~2.500 - 5.000 TPS (Lintas Kota/Kabupaten)',
    badge_promo: '',
    catatan_fitur: 'Manajemen lintas koordinator kecamatan, rekap saksi multi-wilayah.',
    is_active: true
  },
  {
    tingkat_pemilihan: 'DPRD PROVINSI',
    tier: 'TIER_2_PRO_AI',
    nama_paket: 'Pro AI Intelligence (DPRD Provinsi)',
    harga: 13500000,
    estimasi_tps: '~2.500 - 5.000 TPS (Lintas Kota/Kabupaten)',
    badge_promo: 'REKOMENDASI PROVINSI',
    catatan_fitur: 'AI OCR C1 Plano massal, multi-admin timses, prioritas server.',
    is_active: true
  },
  {
    tingkat_pemilihan: 'DPR-RI',
    tier: 'TIER_1_STANDARD',
    nama_paket: 'Standard Command (DPR-RI)',
    harga: 15000000,
    estimasi_tps: '~7.000 - 12.000 TPS (Dapil Nasional)',
    badge_promo: '',
    catatan_fitur: 'Manajemen struktur relawan skala besar lintas kabupaten.',
    is_active: true
  },
  {
    tingkat_pemilihan: 'DPR-RI',
    tier: 'TIER_2_PRO_AI',
    nama_paket: 'Enterprise Victory (DPR-RI)',
    harga: 27500000,
    estimasi_tps: '~7.000 - 12.000 TPS (Dapil Nasional)',
    badge_promo: 'ENTERPRISE VICTORY',
    catatan_fitur: 'Database berkapasitas tinggi, analisis sentimen Dapil, audit fraud AI.',
    is_active: true
  },
  {
    tingkat_pemilihan: 'PILKADA (BUPATI/WALIKOTA/GUBERNUR)',
    tier: 'TIER_1_STANDARD',
    nama_paket: 'Standard Command (Pilkada)',
    harga: 20000000,
    estimasi_tps: '~1.500 - 4.500 TPS',
    badge_promo: '',
    catatan_fitur: 'Posko pemenangan terpusat & monitoring saksi TPS.',
    is_active: true
  },
  {
    tingkat_pemilihan: 'PILKADA (BUPATI/WALIKOTA/GUBERNUR)',
    tier: 'TIER_2_PRO_AI',
    nama_paket: 'Pro AI Commander (Pilkada)',
    harga: 35000000,
    estimasi_tps: '~1.500 - 4.500 TPS',
    badge_promo: 'KOMANDO KEPALA DAERAH',
    catatan_fitur: 'Peta geospasial TPS rawan, verifikasi real-count terpadu AI.',
    is_active: true
  },
  {
    tingkat_pemilihan: 'DPD-RI',
    tier: 'TIER_1_STANDARD',
    nama_paket: 'Standard Command (DPD-RI)',
    harga: 12500000,
    estimasi_tps: 'Seluruh TPS Se-Provinsi',
    badge_promo: '',
    catatan_fitur: 'Pendataan relawan perseorangan & saksi independen.',
    is_active: true
  },
  {
    tingkat_pemilihan: 'DPD-RI',
    tier: 'TIER_2_PRO_AI',
    nama_paket: 'Pro AI Victory (DPD-RI)',
    harga: 22500000,
    estimasi_tps: 'Seluruh TPS Se-Provinsi',
    badge_promo: 'PROVINSI PENUH',
    catatan_fitur: 'Audit KTP perseorangan, verifikasi syarat dukungan KPU.',
    is_active: true
  }
];

