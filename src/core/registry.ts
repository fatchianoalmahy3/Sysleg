import { ModuleSchema } from './types';

// RT/RW Number Generators
const generateNumberOptions = (max: number) => Array.from({ length: max }, (_, i) => String(i + 1).padStart(2, '0'));
const RT_OPTIONS = generateNumberOptions(50);
const RW_OPTIONS = generateNumberOptions(30);

export const MODULE_REGISTRY: ModuleSchema[] = [
  {
    id: 'dashboard',
    title: 'Command Center',
    description: 'Pusat Analitik, Peta Geospasial & Monitoring SaaS',
    icon: 'LayoutDashboard',
    allowedRoles: ['developer', 'superadmin', 'demo'],
    searchKeys: [],
    fields: []
  },
  {
    id: 'saas_tenant_approval',
    title: 'Antrean Persetujuan Caleg (SaaS)',
    description: 'Verifikasi pendaftaran Caleg baru dari Landing Page, aktivasi workspace, dan pembuatan akun Tim Ses otomatis.',
    icon: 'ShieldCheck',
    allowedRoles: ['developer', 'administrator'],
    searchKeys: ['nama_caleg', 'email', 'partai', 'nama_dapil', 'status', 'tenant_id'],
    fields: [
      { key: 'nama_caleg', label: 'Nama Lengkap Caleg & Gelar', type: 'text', validation: { required: true } },
      { key: 'email', label: 'Email Resmi Caleg', type: 'email', validation: { required: true } },
      { key: 'no_wa', label: 'Nomor WhatsApp (Aktif)', type: 'phone', validation: { required: true } },
      { 
        key: 'tingkat_pemilihan', 
        label: 'Tingkat Pemilihan', 
        type: 'select', 
        options: ['DPR-RI', 'DPRD PROVINSI', 'DPRD KAB/KOTA', 'DPD-RI', 'PILKADA (BUPATI/WALIKOTA/GUBERNUR)'],
        validation: { required: true } 
      },
      { key: 'nama_dapil', label: 'Nama Dapil Wilayah', type: 'text', validation: { required: true } },
      { key: 'provinsi', label: 'Provinsi Target', type: 'region_province', validation: { required: true }, defaultValue: 'Jawa Timur' },
      { key: 'kota', label: 'Kota/Kabupaten', type: 'text', validation: { required: true } },
      { key: 'partai', label: 'Partai Politik', type: 'text', validation: { required: true } },
      { key: 'nomor_urut', label: 'Nomor Urut', type: 'number', validation: { required: true, min: 1 } },
      { 
        key: 'paket', 
        label: 'Paket Berlangganan SaaS', 
        type: 'select', 
        options: [
          'Paket Bronze / Pratama (DPRD Kab/Kota) - Rp 7,5M - 12,5M',
          'Paket Silver / Madya (DPRD Provinsi) - Rp 20M - 35M',
          'Paket Gold / Utama (DPR RI & Pilkada) - Rp 50M - 85M'
        ],
        validation: { required: true } 
      },
      { key: 'harga_kesepakatan', label: 'Tarif / Nilai Investasi (Rp)', type: 'number' },
      { 
        key: 'status', 
        label: 'Status Persetujuan Akun', 
        type: 'select', 
        options: ['PENDING_VERIFIKASI', 'DISETUJUI_AKTIF', 'DITOLAK', 'DIBEKUKAN'],
        defaultValue: 'PENDING_VERIFIKASI',
        validation: { required: true }
      },
      { key: 'tenant_id', label: 'ID Tenant Unik (Auto)', type: 'text', readOnly: true },
      { key: 'akun_timses_email', label: 'Akun Tim Ses Ter-generate', type: 'email', readOnly: true },
      { key: 'catatan_superadmin', label: 'Catatan Verifikasi Superadmin', type: 'textarea' }
    ]
  },
  {
    id: 'saas_pricing_matrix',
    title: 'Manajemen Tarif & Paket (SaaS)',
    description: 'Konfigurasi harga bertingkat (Tier 1 & Tier 2) berdasarkan tingkat pemilihan untuk pendaftaran Caleg.',
    icon: 'CreditCard',
    allowedRoles: ['developer', 'administrator'],
    searchKeys: ['tingkat_pemilihan', 'tier', 'badge_promo'],
    fields: [
      {
        key: 'tingkat_pemilihan',
        label: 'Tingkat Pemilihan',
        type: 'select',
        options: ['DPRD KAB/KOTA', 'DPRD PROVINSI', 'DPR-RI', 'DPD-RI', 'PILKADA (BUPATI/WALIKOTA/GUBERNUR)'],
        validation: { required: true }
      },
      {
        key: 'tier',
        label: 'Tingkatan Fitur (Tier)',
        type: 'select',
        options: ['TIER_1_STANDARD', 'TIER_2_PRO_AI'],
        validation: { required: true }
      },
      { key: 'nama_paket', label: 'Label Nama Paket', type: 'text', validation: { required: true } },
      { key: 'harga', label: 'Tarif Harga (Rp)', type: 'number', validation: { required: true, min: 0 } },
      { key: 'estimasi_tps', label: 'Estimasi Kuota TPS', type: 'text', validation: { required: true } },
      { key: 'badge_promo', label: 'Badge Khusus / Promo', type: 'text' },
      { key: 'catatan_fitur', label: 'Catatan & Fitur Khusus', type: 'textarea' },
      { key: 'is_active', label: 'Aktif di Form Pendaftaran', type: 'boolean', defaultValue: true }
    ]
  },
  {
    id: 'master_caleg',
    title: 'Profil & Kebijakan',
    description: 'Konfigurasi identitas calon, target, dan kebijakan nilai uang (CPV).',
    icon: 'UserCircle',
    allowedRoles: ['developer', 'superadmin', 'demo'],
    searchKeys: ['nama_lengkap', 'partai'],
    fields: [
      { key: 'nama_lengkap', label: 'Nama Lengkap & Gelar', type: 'text', validation: { required: true } },
      { key: 'nomor_urut', label: 'Nomor Urut', type: 'number', validation: { required: true, min: 1 } },
      { key: 'partai', label: 'Nama Partai', type: 'text', validation: { required: true } },
      { key: 'slogan', label: 'Slogan / Tagline', type: 'text', validation: { required: true } },
      { key: 'target_suara_global', label: 'Target Suara Global', type: 'number', validation: { required: true, min: 1 } },
      { key: 'alokasi_cpv', label: 'Lock Alokasi Pemilih (CPV/Suara)', type: 'number', validation: { required: true }, defaultValue: 100000 },
      { key: 'foto_logo', label: 'Foto Caleg / Logo (Opsional)', type: 'file' }
    ]
  },
  {
    id: 'master_dapil',
    title: 'Master Dapil & Wilayah',
    description: 'Pembatasan wilayah tempur (Geofencing) Top-Down.',
    icon: 'MapPin',
    allowedRoles: ['developer', 'superadmin', 'demo'],
    searchKeys: ['provinsi', 'kota', 'kecamatan', 'desa'],
    fields: [
      { key: 'nama_dapil', label: 'Nama Dapil', type: 'text', validation: { required: true } },
      { key: 'provinsi', label: 'Provinsi', type: 'region_province', validation: { required: true }, defaultValue: 'Jawa Timur' },
      { key: 'kota', label: 'Kota / Kabupaten', type: 'region_city', validation: { required: true } },
      { key: 'kecamatan', label: 'Kecamatan', type: 'region_district', validation: { required: true } },
      { key: 'desa', label: 'Desa / Kelurahan', type: 'region_village', validation: { required: true } },
      { key: 'target_tps', label: 'Jumlah TPS', type: 'number', validation: { required: true, min: 1 } }
    ]
  },
  {
    id: 'user_relawan',
    title: 'Struktur Tim Relawan & Saksi',
    description: 'Hierarki komando berjenjang Korcam, Kordes, Koordinator RT/RW, Canvasser hingga Saksi TPS & Penggajian.',
    icon: 'Users',
    allowedRoles: ['developer', 'superadmin', 'koordinator', 'demo'],
    searchKeys: ['nama', 'email', 'tingkat_penugasan', 'kecamatan_tugas', 'desa_tugas', 'role', 'status_kehadiran_tps', 'status_pencairan_honor'],
    fields: [
      { key: 'nama', label: 'Nama Lengkap Relawan', type: 'text', validation: { required: true } },
      { key: 'nik', label: 'NIK Relawan', type: 'text', placeholder: '16 digit NIK...', validation: { required: true, min: 16 } },
      { key: 'email', label: 'Email / Username (Login)', type: 'email', validation: { required: true } },
      { key: 'nomor_wa', label: 'Nomor WhatsApp (Aktif)', type: 'phone', validation: { required: true } },
      { 
        key: 'tingkat_penugasan', 
        label: 'Tingkat Penugasan (Hierarki)', 
        type: 'select', 
        options: ['KORCAM (Koordinator Kecamatan)', 'KORDES (Koordinator Desa/Kelurahan)', 'KOR_RW (Koordinator RW)', 'KOR_RT (Koordinator RT)', 'CANVASSER (Relawan Door-to-Door)', 'SAKSI_TPS (Saksi TPS Resmi)'],
        defaultValue: 'CANVASSER (Relawan Door-to-Door)',
        validation: { required: true }
      },
      { key: 'parent_coordinator', label: 'Nama / ID Koordinator di Atasnya (Parent PIC)', type: 'text', placeholder: 'Pilih nama Korcam/Kordes penanggung jawab...' },
      { key: 'provinsi_tugas', label: 'Provinsi Penugasan', type: 'text', validation: { required: true }, defaultValue: 'Jawa Timur' },
      { key: 'kota_tugas', label: 'Kota/Kabupaten Penugasan', type: 'region_city', validation: { required: true }, defaultValue: 'Kabupaten Ponorogo' },
      { key: 'kecamatan_tugas', label: 'Kecamatan Penugasan', type: 'region_district', validation: { required: true } },
      { key: 'desa_tugas', label: 'Desa/Kelurahan Penugasan', type: 'region_village', validation: { required: false } },
      { key: 'tps_tugas', label: 'Nomor TPS Penugasan (Khusus Saksi TPS)', type: 'text', placeholder: 'Contoh: TPS 005' },
      { 
        key: 'status_kehadiran_tps', 
        label: 'Monitoring Kehadiran di TPS (Hari-H)', 
        type: 'select', 
        options: ['BELUM_HADIR', 'STANDBY_BUKA_TPS', 'SEDANG_REKAP_HITUNG', 'SELESAI_SERAHKAN_C1'],
        defaultValue: 'BELUM_HADIR'
      },
      { key: 'honor_tps', label: 'Honorarium Saksi / Uang Saku (Rp)', type: 'number', defaultValue: 200000, validation: { min: 0 } },
      { 
        key: 'status_pencairan_honor', 
        label: 'Status Pencairan Honorarium', 
        type: 'select', 
        options: ['BELUM_CAIR', 'SIAP_DICAIRKAN', 'SUDAH_TRANSFER_C1_VALID', 'DITAHAN_C1_BELUM_LENGKAP'],
        defaultValue: 'BELUM_CAIR'
      },
      { key: 'rekening_ewallet_saksi', label: 'No Rekening / E-Wallet Saksi (BCA/BRI/DANA/Gopay)', type: 'text' },
      { 
        key: 'role', 
        label: 'Tupoksi Akses (Role)', 
        type: 'select', 
        options: ['CALEG_UTAMA', 'TIM_SES', 'KORCAM', 'RELAWAN_LAPANGAN', 'SIMPATISAN_PENDING'],
        defaultValue: 'RELAWAN_LAPANGAN',
        validation: { required: true }
      },
      { 
        key: 'status', 
        label: 'Status Relawan', 
        type: 'select', 
        options: ['AKTIF', 'SUSPEND', 'MENUNGGU_VERIFIKASI'],
        defaultValue: 'AKTIF',
        validation: { required: true }
      },
      { key: 'foto_relawan', label: 'Foto KTA / Wajah Relawan', type: 'file' }
    ]
  },
  {
    id: 'data_dpt',
    title: 'Master DPT Pemilih KPU',
    description: 'Bank data resmi Daftar Pemilih Tetap (DPT) KPU untuk pencarian pemilih, target TPS & TPS Lokasi Khusus (Loksus).',
    icon: 'Layers',
    allowedRoles: ['developer', 'superadmin', 'koordinator', 'relawan', 'demo'],
    searchKeys: ['nik', 'nama', 'kecamatan', 'desa', 'nomor_tps', 'status_afiliasi', 'kategori_tps'],
    fields: [
      { key: 'nik', label: 'NIK Pemilih', type: 'text', placeholder: '16 digit NIK...', validation: { required: true, min: 16 } },
      { key: 'nama', label: 'Nama Lengkap Pemilih', type: 'text', validation: { required: true, min: 2 } },
      { key: 'jenis_kelamin', label: 'Jenis Kelamin', type: 'select', options: ['Laki-laki', 'Perempuan'], validation: { required: true } },
      { key: 'usia', label: 'Perkiraan Usia', type: 'number', validation: { required: false } },
      { key: 'provinsi', label: 'Provinsi', type: 'region_province', validation: { required: true }, defaultValue: 'Jawa Timur' },
      { key: 'kota', label: 'Kabupaten/Kota', type: 'text', validation: { required: true }, defaultValue: 'Kabupaten Ponorogo' },
      { key: 'kecamatan', label: 'Kecamatan', type: 'region_district', validation: { required: true } },
      { key: 'desa', label: 'Desa / Kelurahan', type: 'region_village', validation: { required: true } },
      { key: 'rw', label: 'Nomor RW', type: 'select', options: RW_OPTIONS, validation: { required: false } },
      { key: 'rt', label: 'Nomor RT', type: 'select', options: RT_OPTIONS, validation: { required: false } },
      { key: 'nomor_tps', label: 'Nomor TPS Terdaftar', type: 'text', placeholder: 'Contoh: TPS 004', validation: { required: true } },
      { 
        key: 'kategori_tps', 
        label: 'Kategori TPS Pemilih', 
        type: 'select', 
        options: ['TPS_REGULER', 'TPS_LOKSUS_PESANTREN', 'TPS_LOKSUS_RUTAN', 'TPS_LOKSUS_RSUD'],
        defaultValue: 'TPS_REGULER',
        validation: { required: true }
      },
      { 
        key: 'status_afiliasi', 
        label: 'Status Pendekatan / Afiliasi', 
        type: 'select', 
        options: ['BELUM_DIDEKATI', 'TARGET_PROSPEK', 'LOYALIS_PASTI', 'SWING_VOTER', 'PENDUKUNG_LAWAN'],
        defaultValue: 'BELUM_DIDEKATI',
        validation: { required: true }
      },
      { key: 'catatan_afiliasi', label: 'Catatan Pendekatan / Tokoh', type: 'textarea' }
    ]
  },
  {
    id: 'konstituen',
    title: 'Database Konstituen (KTP)',
    description: 'Pencatatan data dengan Auto-Fill Geo-Fencing Top-Down, bukti fisik e-KTP, dan Skor Kepastian Suara (Certainty Score).',
    icon: 'Database',
    allowedRoles: ['developer', 'superadmin', 'koordinator', 'relawan', 'demo'],
    actionLabels: {
      createButton: 'Catat Pemilih / KTP Baru'
    },
    searchKeys: ['name', 'nik', 'phone', 'kecamatan', 'desa', 'skor_kepastian'],
    fields: [
      { key: 'nik', label: 'Nomor Induk Kependudukan (NIK)', type: 'text', placeholder: '16 digit NIK...', validation: { required: true, min: 16 } },
      { key: 'name', label: 'Nama Lengkap (Sesuai KTP)', type: 'text', validation: { required: true, min: 3 } },
      { key: 'gender', label: 'Jenis Kelamin', type: 'select', options: ['Laki-laki', 'Perempuan'], validation: { required: true } },
      { key: 'phone', label: 'Nomor HP / WhatsApp', type: 'phone' },
      
      // Auto-filled & Locked by System Based on User Scope
      { key: 'provinsi', label: 'Provinsi', type: 'region_province', readOnly: true, validation: { required: true } },
      { key: 'kota', label: 'Kabupaten/Kota', type: 'text', readOnly: true, validation: { required: true } },
      { key: 'kecamatan', label: 'Kecamatan', type: 'text', readOnly: true, validation: { required: true } },
      { key: 'desa', label: 'Desa/Kelurahan', type: 'text', readOnly: true, validation: { required: true } },
      
      // Number Wheel Dropdowns (Anti-Typo)
      { key: 'rw', label: 'Nomor RW', type: 'select', options: RW_OPTIONS, validation: { required: true } },
      { key: 'rt', label: 'Nomor RT', type: 'select', options: RT_OPTIONS, validation: { required: true } },
      { key: 'nomor_tps', label: 'Nomor TPS', type: 'text', placeholder: 'Contoh: TPS 002' },
      
      // Voter Certainty Scoring
      { 
        key: 'skor_kepastian', 
        label: 'Skor Kepastian Suara (Voter Certainty)', 
        type: 'select', 
        options: ['PASTI_COBLOS_100', 'KEMUNGKINAN_BESAR_75', 'RAGU_SWING_50', 'RAWAN_PINDAH_25'],
        defaultValue: 'PASTI_COBLOS_100',
        validation: { required: true }
      },
      { 
        key: 'faktor_pengaruh_kunci', 
        label: 'Faktor Pengaruh Utama Pemilih', 
        type: 'select', 
        options: ['TOKOH_AGAMA_KYAI', 'JARINGAN_KELUARGA_BESAR', 'BANTUAN_ASPIRASI_POKIR', 'KEDEKATAN_PERSONAL_CALEG', 'PROGRAM_KERJA_PARTAI'],
        defaultValue: 'TOKOH_AGAMA_KYAI'
      },
      
      { key: 'ktp_image_url', label: 'Bukti Foto KTP', type: 'file' },
      { key: 'location', label: 'Titik Kordinat (Otomatis)', type: 'location', validation: { required: true } },
      { key: 'input_by', label: 'Auto-Tag Relawan', type: 'text', readOnly: true },
      { key: 'notes', label: 'Catatan/Aspirasi Tambahan', type: 'textarea' }
    ]
  },
  {
    id: 'quick_count_c1',
    title: 'Quick Count & Saksi TPS (C1 Plano)',
    description: 'Rekapitulasi perolehan suara sah TPS secara realtime, audit integritas matematis C1, watermark forensik GPS, dan verifikasi KPU.',
    icon: 'Award',
    allowedRoles: ['developer', 'superadmin', 'koordinator', 'relawan', 'demo'],
    searchKeys: ['nomor_tps', 'kecamatan', 'desa', 'nama_saksi', 'status_verifikasi', 'kategori_tps'],
    fields: [
      { key: 'nomor_tps', label: 'Nomor TPS', type: 'text', placeholder: 'Contoh: TPS 008', validation: { required: true } },
      { 
        key: 'kategori_tps', 
        label: 'Klasifikasi TPS', 
        type: 'select', 
        options: ['TPS_REGULER', 'TPS_LOKSUS_PESANTREN', 'TPS_LOKSUS_RUTAN', 'TPS_LOKSUS_RSUD'],
        defaultValue: 'TPS_REGULER',
        validation: { required: true }
      },
      { key: 'provinsi', label: 'Provinsi', type: 'region_province', validation: { required: true }, defaultValue: 'Jawa Timur' },
      { key: 'kota', label: 'Kabupaten/Kota', type: 'text', validation: { required: true }, defaultValue: 'Kabupaten Ponorogo' },
      { key: 'kecamatan', label: 'Kecamatan', type: 'region_district', validation: { required: true } },
      { key: 'desa', label: 'Desa / Kelurahan', type: 'region_village', validation: { required: true } },
      { key: 'nama_saksi', label: 'Nama Saksi Petugas TPS', type: 'text', validation: { required: true } },
      { key: 'no_wa_saksi', label: 'No WA Saksi', type: 'phone', validation: { required: true } },
      { key: 'suara_sah_caleg', label: 'Perolehan Suara Sah Caleg (Nomor Kita)', type: 'number', validation: { required: true, min: 0 } },
      { key: 'total_suara_sah', label: 'Total Seluruh Suara Sah di TPS', type: 'number', validation: { required: true, min: 0 } },
      { key: 'suara_tidak_sah', label: 'Jumlah Suara Tidak Sah / Rusak', type: 'number', validation: { required: true, min: 0 } },
      { key: 'total_pengguna_hak_pilih', label: 'Total Pemilih Hadir Menggunakan Hak Pilih (Sah + Tidak Sah)', type: 'number', validation: { required: true, min: 0 } },
      { 
        key: 'status_audit_matematis', 
        label: 'Audit Integritas Matematis C1', 
        type: 'select', 
        options: ['AUDIT_MATEMATIS_PAS_VALID', 'SELISIH_SUARA_WARNING', 'SUARA_CALEG_MELEBIHI_TOTAL'],
        defaultValue: 'AUDIT_MATEMATIS_PAS_VALID',
        readOnly: true
      },
      { key: 'foto_form_c1', label: 'Foto Lembar Form C1 Plano Fisik (Watermarked)', type: 'file', validation: { required: true } },
      { key: 'titik_lokasi_tps', label: 'GPS Lokasi Input Saksi (Forensik)', type: 'location', validation: { required: true } },
      { key: 'watermark_hash_forensik', label: 'Digital Hash Forensik (SHA-256)', type: 'text', readOnly: true },
      { 
        key: 'status_verifikasi', 
        label: 'Status Verifikasi Tabulasi Data', 
        type: 'select', 
        options: ['BELUM_DIVERIFIKASI', 'TERVERIFIKASI_SAH', 'SELISIH_SUARA_WARNING', 'DITOLAK_BURAM', 'LOKASI_GPS_MENYIMPANG'],
        defaultValue: 'BELUM_DIVERIFIKASI',
        validation: { required: true }
      },
      { key: 'catatan_kejadian_khusus', label: 'Catatan Kejadian Khusus di TPS', type: 'textarea' }
    ]
  },
  {
    id: 'rab_aspirasi',
    title: 'RAB & Aspirasi Wilayah',
    description: 'Manajemen anggaran kampanye terintegrasi (Hub & Spoke), asal-usul pos operasional (termasuk Saksi, Logistik, Canvassing, dan Mobilisasi Hari-H), otomasi 5% dana darurat, dan audit deviasi standar harga pasar AI.',
    icon: 'Wallet',
    allowedRoles: ['developer', 'superadmin', 'koordinator', 'demo'],
    requiredTier: 'SILVER',
    searchKeys: ['nomor_rab', 'nama_kegiatan', 'pos_anggaran', 'pengaju', 'kecamatan'],
    fields: [
      { key: 'nomor_rab', label: 'Nomor Registrasi RAB / Pos', type: 'text', readOnly: true, defaultValue: 'RAB-AUTO' },
      { key: 'nama_kegiatan', label: 'Uraian Nama Kegiatan / Pengadaan', type: 'text', validation: { required: true } },
      { 
        key: 'pos_anggaran', 
        label: 'Pos Anggaran Operasional (Hub Induk)', 
        type: 'select', 
        options: [
          'HONOR_SAKSI_TPS (Honorarium & Pelatihan Saksi)',
          'LOGISTIK_BANNER_APK (Spanduk, Baliho, Bendera, Kaos)',
          'DANA_MOBILISASI_HARI_H (Bantuan Transport Pemilih TPS A1 / Serangan Fajar)',
          'KONSUMSI_KONSOLIDASI (Rapat Kordes, Korcam, Tokoh Masyarakat)',
          'TRANSPORT_CANVASSING (Operasional Relawan Door-to-Door)',
          'SOUND_TENDA_ACARA (Sewa Perlengkapan Sosialisasi Tatap Muka)',
          'BANTUAN_ASPIRASI_POKIR (Sembako & Aspirasi Komunitas Basis)',
          'OPERASIONAL_POSKO (ATK, Internet, Listrik, Posko Pemenangan)'
        ],
        validation: { required: true },
        defaultValue: 'HONOR_SAKSI_TPS (Honorarium & Pelatihan Saksi)'
      },
      { 
        key: 'sumber_data_asal', 
        label: 'Sumber Referensi / Asal-Usul Data', 
        type: 'select', 
        options: [
          'MODUL_SAKSI_TPS (Integrasi Kuota & Standar Honor Saksi)',
          'MODUL_LOGISTIK_APK (Integrasi Standar BPS & Target APK Wilayah)',
          'MODUL_KONSTITUEN_KTP_A1 (Integrasi Data Pemilih Pasti / DPT A1)',
          'MODUL_KORDES_CANVASSING (Integrasi Rute Door-to-Door)',
          'MANUAL_TERVERIFIKASI (Pengajuan Khusus Tim Pemenangan)'
        ],
        validation: { required: true },
        defaultValue: 'MODUL_SAKSI_TPS (Integrasi Kuota & Standar Honor Saksi)'
      },
      { key: 'pengaju', label: 'Nama Penanggung Jawab (PIC / Pengaju)', type: 'text', validation: { required: true } },
      { key: 'nomor_wa_pj', label: 'Nomor WhatsApp PIC / Pengaju', type: 'phone', validation: { required: true } },
      { key: 'provinsi', label: 'Provinsi', type: 'region_province', readOnly: true, validation: { required: true } },
      { key: 'kota', label: 'Kota/Kabupaten', type: 'text', readOnly: true, validation: { required: true } },
      { key: 'kecamatan', label: 'Wilayah Kecamatan', type: 'region_district', validation: { required: true } },
      { key: 'desa', label: 'Wilayah Desa / Kelurahan', type: 'region_village' },
      { key: 'target_tps_cakupan', label: 'Target / Cakupan TPS', type: 'text', placeholder: 'Contoh: TPS 001 - TPS 015 Mangkujayan' },
      
      { key: 'volume', label: 'Volume / Kuantitas Kebutuhan', type: 'number', validation: { required: true, min: 1 }, defaultValue: 1 },
      { key: 'satuan', label: 'Satuan (orang / m2 / porsi / paket / pcs)', type: 'text', validation: { required: true }, defaultValue: 'orang' },
      { key: 'harga_satuan_diajukan', label: 'Harga Satuan Diajukan (Rp)', type: 'number', validation: { required: true, min: 100 } },
      { key: 'subtotal_pokok', label: 'Subtotal Kebutuhan Pokok (Rp)', type: 'number', readOnly: true },
      { key: 'dana_darurat_5persen', label: 'Dana Cadangan Darurat 5% (Otomatis Bendahara)', type: 'number', readOnly: true },
      { key: 'alokasi_pemilih', label: 'Total Pagu Pencairan Termasuk 5% Darurat (Rp)', type: 'number', readOnly: true },
      
      { key: 'target_suara', label: 'Target Suara Terkunci (Output Suara)', type: 'number', validation: { required: true, min: 1 }, defaultValue: 100 },
      { key: 'estimasi_ai', label: 'Audit Standar Pasar BPS & AI (Batas Plafon Wajar)', type: 'number', readOnly: true },
      { key: 'cpv_unit', label: 'Cost-per-Vote (CPV) Terhitung (Rp/Suara)', type: 'number', readOnly: true, currency: true, unit: '/ suara' },
      { 
        key: 'status_audit_markup', 
        label: 'Hasil Audit Algoritma Deviasi', 
        type: 'select', 
        options: ['WAJAR_SESUAI_PASAR', 'PERINGATAN_MARKUP', 'SANGAT_BOROS_EVALUASI'],
        defaultValue: 'WAJAR_SESUAI_PASAR',
        readOnly: true
      },
      { 
        key: 'status', 
        label: 'Status Persetujuan Pencairan Dana', 
        type: 'select', 
        options: ['PENDING_AUDIT', 'MENUNGGU_CALEG', 'DISETUJUI_BENDAHARA', 'DP_CAIR', 'LUNAS', 'DITOLAK'],
        defaultValue: 'PENDING_AUDIT'
      },
      { key: 'rekening_tujuan', label: 'Rekening Bank / E-Wallet Penyaluran (PIC)', type: 'text', placeholder: 'BCA 873-509-2211 a.n Budi Santoso' },
      { key: 'bukti_nota_rekening', label: 'Lampiran Nota / Proposal / Rekening Penyaluran', type: 'file' },
      { key: 'deskripsi', label: 'Rincian Kebutuhan & Catatan Audit Asal-Usul', type: 'textarea' }
    ]
  },
  {
    id: 'lpj_kegiatan',
    title: 'Audit LPJ, Kwitansi & Sisa Kas (SILPA)',
    description: 'Laporan pertanggungjawaban geo-tagged terikat nomor registrasi RAB, verifikasi kwitansi riil, dan rekonsiliasi pengembalian sisa dana (SILPA).',
    icon: 'ShieldCheck',
    allowedRoles: ['developer', 'superadmin', 'koordinator', 'demo'],
    requiredTier: 'SILVER',
    searchKeys: ['nomor_rab_terkait', 'kegiatan', 'pic', 'status_audit'],
    fields: [
      { key: 'nomor_rab_terkait', label: 'Nomor Registrasi RAB Terkait (Wajib)', type: 'text', validation: { required: true }, placeholder: 'Contoh: RAB-PNG-SAKSI-01' },
      { key: 'kegiatan', label: 'Uraian Nama Kegiatan / Pengeluaran LPJ', type: 'text', validation: { required: true } },
      { key: 'pic', label: 'Penanggung Jawab (PIC Pelaksana)', type: 'text', validation: { required: true } },
      { key: 'kecamatan', label: 'Wilayah Kecamatan', type: 'region_district', validation: { required: true } },
      { key: 'desa', label: 'Wilayah Desa / Kelurahan', type: 'region_village' },
      
      { key: 'dana_diterima', label: 'Total Dana Kas Diterima dari RAB (Rp)', type: 'number', validation: { required: true, min: 100 } },
      { key: 'nominal_terpakai', label: 'Total Realisasi Terpakai Sesuai Kwitansi (Rp)', type: 'number', validation: { required: true, min: 0 } },
      { key: 'sisa_kas_silpa', label: 'Sisa Dana / SILPA Harus Disetor Balik (Rp)', type: 'number', readOnly: true },
      { 
        key: 'status_silpa', 
        label: 'Status Rekonsiliasi SILPA', 
        type: 'select', 
        options: ['PAS_SESUAI_PAGU', 'LEBIH_KEMBALIKAN_KAS', 'DEFISIT_KLAIM_DARURAT'],
        defaultValue: 'PAS_SESUAI_PAGU',
        readOnly: true
      },
      
      { key: 'foto_bukti', label: 'Foto Kwitansi / Nota Asli / Daftar Nominatif', type: 'file', validation: { required: true } },
      { key: 'lokasi', label: 'Koordinat GPS Geo-Tagging Lokasi Eksekusi', type: 'location', validation: { required: true } },
      { 
        key: 'status_audit', 
        label: 'Status Audit & Pengesahan LPJ', 
        type: 'select', 
        options: ['MENUNGGU_AUDIT', 'SAH_SESUAI_KTP', 'DITOLAK_INDIKASI_FIKTIF', 'SELESAI_TEREKONSILIASI'],
        defaultValue: 'MENUNGGU_AUDIT'
      },
      { key: 'bukti_setor_silpa', label: 'Struk Pengembalian Sisa Kas ke Bendahara (Jika Ada SILPA)', type: 'file' },
      { key: 'catatan_lpj', label: 'Catatan Kendala Lapangan & Penggunaan Dana Darurat 5%', type: 'textarea' }
    ]
  },
  {
    id: 'saas_system_settings',
    title: 'Pengaturan Kop Surat & Tagihan (Superadmin)',
    description: 'Konfigurasi kop surat resmi lembaga/konsultan pemenangan, kontak layanan, rekening bank invoice, dan catatan legalitas UU ITE untuk dokumen cetak.',
    icon: 'Settings',
    allowedRoles: ['developer'],
    searchKeys: ['nama_lembaga', 'email_resmi', 'bank_nama'],
    fields: [
      { key: 'nama_lembaga', label: 'Nama Lembaga / Konsultan Pemenangan', type: 'text', validation: { required: true }, defaultValue: 'LEMBAGA KONSULTASI PEMENANGAN ELEKTORAL & TEKNOLOGI INFORMASI' },
      { key: 'sub_judul', label: 'Sub-Judul Unit / Layanan', type: 'text', defaultValue: 'SaaS Platform Manajemen Pemenangan Pemilu & Sistem Informasi Saksi TPS' },
      { key: 'alamat_kantor', label: 'Alamat Kantor & Gedung', type: 'textarea', validation: { required: true }, defaultValue: 'Graha Pemilu Mandiri Lt. 8, Jl. Jend. Sudirman Kav. 52-53, Jakarta Selatan 12190' },
      { key: 'no_telp_layanan', label: 'Nomor Telepon / WhatsApp CS', type: 'phone', validation: { required: true }, defaultValue: '0812-3456-7890' },
      { key: 'email_resmi', label: 'Email Resmi Helpdesk', type: 'email', validation: { required: true }, defaultValue: 'support@pemenangancaleg.id' },
      { key: 'website', label: 'Alamat Website Resmi', type: 'text', defaultValue: 'https://pemenangancaleg.id' },
      { 
        key: 'bank_nama', 
        label: 'Nama Bank Penampung Invoice', 
        type: 'select', 
        options: ['BANK CENTRAL ASIA (BCA)', 'BANK MANDIRI', 'BANK RAKYAT INDONESIA (BRI)', 'BANK NEGARA INDONESIA (BNI)', 'BANK SYARIAH INDONESIA (BSI)'],
        defaultValue: 'BANK CENTRAL ASIA (BCA)',
        validation: { required: true }
      },
      { key: 'bank_rekening', label: 'Nomor Rekening Bank', type: 'text', validation: { required: true }, defaultValue: '873-509-2211' },
      { key: 'bank_atas_nama', label: 'Rekening Atas Nama', type: 'text', validation: { required: true }, defaultValue: 'PT ELEKTORAL TEKNOLOGI NUSANTARA' },
      { key: 'catatan_legal', label: 'Catatan Kaki & Legalitas UU ITE', type: 'textarea', defaultValue: 'Dokumen ini merupakan keluaran sah sistem elektronik terverifikasi berdasarkan ketentuan UU ITE Pasal 5 Ayat 1. Seluruh transaksi dan hak akses workspace tunduk pada syarat & ketentuan layanan SaaS Pemenangan Pemilu.' }
    ]
  },
  {
    id: 'target_dapil_wilayah',
    title: 'Target Suara & Wilayah Gerilya',
    description: 'Manajemen target suara per kecamatan dan desa (Meso-Level), klasifikasi kuadran (Basis, Battleground, Rawan), dan pemantauan gap suara.',
    icon: 'Target',
    allowedRoles: ['developer', 'superadmin', 'koordinator', 'demo'],
    searchKeys: ['kecamatan', 'desa', 'kabupaten', 'status_wilayah'],
    fields: [
      { key: 'provinsi', label: 'Provinsi', type: 'region_province', validation: { required: true }, defaultValue: 'Jawa Timur' },
      { key: 'kabupaten', label: 'Kabupaten / Kota', type: 'text', validation: { required: true }, defaultValue: 'Kabupaten Ponorogo' },
      { key: 'kecamatan', label: 'Kecamatan Penugasan', type: 'region_district', validation: { required: true } },
      { key: 'desa', label: 'Desa / Kelurahan (Meso-Level 307 Desa)', type: 'region_village' },
      { key: 'jumlah_dpt', label: 'Jumlah DPT Resmi KPU', type: 'number', validation: { required: true, min: 1 } },
      { key: 'target_suara', label: 'Target Suara Caleg', type: 'number', validation: { required: true, min: 1 } },
      { key: 'suara_terkunci', label: 'Realisasi / Komitmen Terkunci', type: 'number', validation: { required: true, min: 0 }, defaultValue: 0, unit: 'KTP' },
      { key: 'gap_suara', label: 'Defisit / Gap Suara (Target - Realisasi)', type: 'number', readOnly: true, unit: 'Suara' },
      { 
        key: 'status_wilayah', 
        label: 'Klasifikasi Kuadran Wilayah', 
        type: 'select', 
        options: ['BASIS_HIJAU (Aman / Loyal)', 'BATTLEGROUND_KUNING (Medan Tempur Kritis)', 'RAWAN_MERAH (Penetrasi Rendah)'],
        defaultValue: 'BATTLEGROUND_KUNING (Medan Tempur Kritis)',
        validation: { required: true }
      },
      { key: 'pic_korcam', label: 'Penanggung Jawab Wilayah (Korcam/Kordes)', type: 'text' },
      { key: 'catatan_strategi', label: 'Catatan Aksi Gerilya Lapangan', type: 'textarea' }
    ]
  },
  {
    id: 'standar_harga_daerah',
    title: 'Kamus Standar Harga Pasar Daerah (AI Benchmark)',
    description: 'Referensi rentang harga wajar komoditas politik dan operasional per kabupaten/kota yang ditaksir oleh AI Gemini untuk mencegah mark-up anggaran.',
    icon: 'FileSpreadsheet',
    allowedRoles: ['developer', 'superadmin', 'demo'],
    requiredTier: 'SILVER',
    searchKeys: ['kategori_item', 'kabupaten_kota'],
    fields: [
      { key: 'provinsi', label: 'Provinsi', type: 'region_province', validation: { required: true }, defaultValue: 'Jawa Timur' },
      { key: 'kabupaten_kota', label: 'Kabupaten / Kota', type: 'text', validation: { required: true }, defaultValue: 'Kabupaten Ponorogo' },
      { 
        key: 'kategori_item', 
        label: 'Kategori Pengeluaran / Komoditas', 
        type: 'select', 
        options: [
          'Honor Saksi TPS (Hari-H & Rekap)',
          'Cetak Spanduk / Banner MMT Outdoor',
          'Konsumsi / Nasi Box Pertemuan Warga',
          'Uang Transport Relawan Door-to-Door / Canvasser',
          'Sewa Sound System & Tenda Pertemuan Warga',
          'Paket Sembako / Bantuan Aspirasi Sederhana',
          'Bahan Sosialisasi / Kaos & Atribut'
        ],
        validation: { required: true }
      },
      { key: 'satuan', label: 'Satuan Ukuran', type: 'text', validation: { required: true }, defaultValue: 'per orang / per item' },
      { key: 'harga_batas_bawah', label: 'Batas Harga Bawah Wajar (Rp)', type: 'number', validation: { required: true, min: 0 } },
      { key: 'harga_batas_atas', label: 'Batas Harga Atas Wajar / Plafon (Rp)', type: 'number', validation: { required: true, min: 0 } },
      { key: 'sumber_intelijen', label: 'Sumber Intelijen Pasar', type: 'text', defaultValue: 'AI Gemini Regional Benchmark' },
      { key: 'catatan_pasar', label: 'Catatan Dinamika Pasar Lokal', type: 'textarea' }
    ]
  },
  {
    id: 'anggaran_kampanye',
    title: 'Anggaran, Audit Mark-Up & Cost-per-Vote',
    description: 'Pencatatan realisasi dana kampanye dengan audit deviasi harga otomatis terhadap standar pasar dan rasio Cost-per-Vote (CPV).',
    icon: 'Wallet',
    allowedRoles: ['developer', 'superadmin', 'demo'],
    requiredTier: 'SILVER',
    searchKeys: ['uraian_kegiatan', 'kecamatan', 'status_audit_algoritma'],
    fields: [
      { key: 'uraian_kegiatan', label: 'Uraian Pengeluaran / Kegiatan', type: 'text', validation: { required: true } },
      { 
        key: 'kategori_item', 
        label: 'Kategori Item', 
        type: 'select', 
        options: [
          'Honor Saksi TPS (Hari-H & Rekap)',
          'Cetak Spanduk / Banner MMT Outdoor',
          'Konsumsi / Nasi Box Pertemuan Warga',
          'Uang Transport Relawan Door-to-Door / Canvasser',
          'Sewa Sound System & Tenda Pertemuan Warga',
          'Paket Sembako / Bantuan Aspirasi Sederhana',
          'Bahan Sosialisasi / Kaos & Atribut',
          'Lainnya / Operasional Kantor Posko'
        ],
        validation: { required: true }
      },
      { key: 'kecamatan', label: 'Wilayah Alokasi (Kecamatan)', type: 'region_district', validation: { required: true } },
      { key: 'volume', label: 'Volume / Kuantitas', type: 'number', validation: { required: true, min: 1 }, defaultValue: 1 },
      { key: 'satuan', label: 'Satuan', type: 'text', validation: { required: true }, defaultValue: 'porsi / orang / lembar' },
      { key: 'harga_satuan_diajukan', label: 'Harga Satuan Diajukan (Rp)', type: 'number', validation: { required: true, min: 1 } },
      { key: 'total_anggaran', label: 'Total Anggaran (Volume x Harga)', type: 'number', readOnly: true },
      { key: 'target_suara_alokasi', label: 'Target Suara Wilayah Ini', type: 'number', validation: { required: false, min: 1 }, defaultValue: 1000 },
      { key: 'cpv_terhitung', label: 'Cost-per-Vote (CPV) Terhitung (Rp/Suara)', type: 'number', readOnly: true, currency: true, unit: '/ suara' },
      { 
        key: 'status_audit_algoritma', 
        label: 'Status Audit Algoritma', 
        type: 'select', 
        options: ['WAJAR_SESUAI_PASAR', 'PERINGATAN_MARKUP', 'SANGAT_BOROS_EVALUASI'],
        defaultValue: 'WAJAR_SESUAI_PASAR',
        readOnly: true
      },
      { key: 'potensi_pemborosan', label: 'Estimasi Selisih Mark-up (Rp)', type: 'number', readOnly: true },
      { key: 'catatan_audit', label: 'Catatan Audit Otomatis Algoritma', type: 'textarea', readOnly: true }
    ]
  },
  {
    id: 'simulasi_sainte_lague',
    title: 'Simulasi Sainte-Laguë Parlemen',
    description: 'Tabulasi suara partai politik, kalkulasi otomatis pembagi Sainte-Laguë (1, 3, 5, 7, 9) dan margin keselamatan kursi terakhir.',
    icon: 'Award',
    allowedRoles: ['developer', 'superadmin', 'demo'],
    requiredTier: 'SILVER',
    searchKeys: ['nama_partai', 'nama_caleg_terpilih', 'status_kursi'],
    fields: [
      { key: 'nama_partai', label: 'Nama Partai Politik', type: 'text', validation: { required: true } },
      { key: 'nomor_urut_partai', label: 'Nomor Urut Partai', type: 'number', validation: { required: true, min: 1 } },
      { key: 'suara_total_partai', label: 'Suara Sah Total Partai + Caleg', type: 'number', validation: { required: true, min: 0 } },
      { key: 'nama_caleg_terpilih', label: 'Nama Caleg Suara Terbanyak Partai', type: 'text' },
      { key: 'is_partai_kita', label: 'Ini Partai Pengusung Kita?', type: 'boolean', defaultValue: false },
      { key: 'kursi_diperoleh', label: 'Total Kursi Dimenangkan (Hasil Sainte-Laguë)', type: 'number', readOnly: true, defaultValue: 0 },
      { 
        key: 'status_kursi', 
        label: 'Status Lolos Parlemen', 
        type: 'select', 
        options: ['LOLOS_KURSI_AMAN', 'KURSI_TERAKHIR_RAWAN', 'BELUM_LOLOS_KURSI'],
        defaultValue: 'BELUM_LOLOS_KURSI',
        readOnly: true
      },
      { key: 'selisih_suara_aman', label: 'Margin Suara Aman / Kebutuhan Suara Tambahan', type: 'number', readOnly: true },
      { key: 'analisis_taktis', label: 'Analisis & Catatan Taktis Parlemen', type: 'textarea' }
    ]
  },

  {
    id: 'manajemen_tenant_saas',
    title: 'Manajemen Klien (SaaS)',
    description: 'Manajemen Langganan dan Akses Klien SaaS (Khusus Vendor)',
    icon: '🏢',
    allowedRoles: ['developer', 'administrator'],
    fields: [
      { key: 'nama_klien', label: 'Nama Klien / Kandidat', type: 'text', validation: { required: true } },
      { key: 'jenis_paket', label: 'Paket Berlangganan', type: 'select', options: ['Tier 1 (Dasar)', 'Tier 2 (Pro)', 'Enterprise'], validation: { required: true } },
      { key: 'status_bayar', label: 'Status Tagihan', type: 'select', options: ['Lunas', 'Menunggak', 'Suspend'], defaultValue: 'Lunas' },
      { key: 'kuota_dpt', label: 'Limit Kuota DPT', type: 'number', validation: { required: true } },
      { key: 'tanggal_berakhir', label: 'Berakhir Pada', type: 'date' }
    ]
  }
];