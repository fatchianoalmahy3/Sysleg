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
    allowedRoles: ['SUPER_ADMIN', 'CALEG_UTAMA', 'TIM_SES'],
    searchKeys: [],
    fields: []
  },
  {
    id: 'saas_tenant_approval',
    title: 'Antrean Persetujuan Caleg (SaaS)',
    description: 'Verifikasi pendaftaran Caleg baru dari Landing Page, aktivasi workspace, dan pembuatan akun Tim Ses otomatis.',
    icon: 'ShieldCheck',
    allowedRoles: ['SUPER_ADMIN'],
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
        options: ['Tier 1: Standard Command', 'Tier 2: Pro AI Intelligence'],
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
    allowedRoles: ['SUPER_ADMIN'],
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
    allowedRoles: ['SUPER_ADMIN', 'CALEG_UTAMA', 'TIM_SES'],
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
    allowedRoles: ['SUPER_ADMIN', 'CALEG_UTAMA', 'TIM_SES'],
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
    description: 'Hierarki komando berjenjang Korcam, Kordes, Koordinator RT/RW, Canvasser hingga Saksi TPS.',
    icon: 'Users',
    allowedRoles: ['SUPER_ADMIN', 'CALEG_UTAMA', 'TIM_SES', 'KORCAM'],
    searchKeys: ['nama', 'email', 'tingkat_penugasan', 'kecamatan_tugas', 'desa_tugas', 'role'],
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
      { key: 'provinsi_tugas', label: 'Provinsi Penugasan', type: 'text', validation: { required: true } },
      { key: 'kota_tugas', label: 'Kota/Kabupaten Penugasan', type: 'region_city', validation: { required: true } },
      { key: 'kecamatan_tugas', label: 'Kecamatan Penugasan', type: 'region_district', validation: { required: true } },
      { key: 'desa_tugas', label: 'Desa/Kelurahan Penugasan', type: 'region_village', validation: { required: false } },
      { key: 'tps_tugas', label: 'Nomor TPS Penugasan (Khusus Saksi TPS)', type: 'text', placeholder: 'Contoh: TPS 005' },
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
    description: 'Bank data resmi Daftar Pemilih Tetap (DPT) KPU untuk pencarian pemilih, target TPS & pemetaan afiliasi.',
    icon: 'Layers',
    allowedRoles: ['SUPER_ADMIN', 'CALEG_UTAMA', 'TIM_SES', 'KORCAM', 'RELAWAN_LAPANGAN'],
    searchKeys: ['nik', 'nama', 'kecamatan', 'desa', 'nomor_tps', 'status_afiliasi'],
    fields: [
      { key: 'nik', label: 'NIK Pemilih', type: 'text', placeholder: '16 digit NIK...', validation: { required: true, min: 16 } },
      { key: 'nama', label: 'Nama Lengkap Pemilih', type: 'text', validation: { required: true, min: 2 } },
      { key: 'jenis_kelamin', label: 'Jenis Kelamin', type: 'select', options: ['Laki-laki', 'Perempuan'], validation: { required: true } },
      { key: 'usia', label: 'Perkiraan Usia', type: 'number', validation: { required: false } },
      { key: 'provinsi', label: 'Provinsi', type: 'region_province', validation: { required: true }, defaultValue: 'Jawa Timur' },
      { key: 'kota', label: 'Kabupaten/Kota', type: 'text', validation: { required: true }, defaultValue: 'Kota Surabaya' },
      { key: 'kecamatan', label: 'Kecamatan', type: 'region_district', validation: { required: true } },
      { key: 'desa', label: 'Desa / Kelurahan', type: 'region_village', validation: { required: true } },
      { key: 'rw', label: 'Nomor RW', type: 'select', options: RW_OPTIONS, validation: { required: false } },
      { key: 'rt', label: 'Nomor RT', type: 'select', options: RT_OPTIONS, validation: { required: false } },
      { key: 'nomor_tps', label: 'Nomor TPS Terdaftar', type: 'text', placeholder: 'Contoh: TPS 004', validation: { required: true } },
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
    description: 'Pencatatan data dengan Auto-Fill Geo-Fencing Top-Down dan bukti fisik e-KTP.',
    icon: 'Database',
    allowedRoles: ['SUPER_ADMIN', 'CALEG_UTAMA', 'TIM_SES', 'KORCAM', 'RELAWAN_LAPANGAN'],
    searchKeys: ['name', 'nik', 'phone', 'kecamatan', 'desa'],
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
      
      { key: 'ktp_image_url', label: 'Bukti Foto KTP', type: 'file' },
      { key: 'location', label: 'Titik Kordinat (Otomatis)', type: 'location', validation: { required: true } },
      { key: 'input_by', label: 'Auto-Tag Relawan', type: 'text', readOnly: true },
      { key: 'notes', label: 'Catatan/Aspirasi Tambahan', type: 'textarea' }
    ]
  },
  {
    id: 'quick_count_c1',
    title: 'Quick Count & Saksi TPS (C1 Plano)',
    description: 'Rekapitulasi perolehan suara sah TPS secara realtime, unggah foto plano C1 resmi, dan verifikasi KPU.',
    icon: 'Award',
    allowedRoles: ['SUPER_ADMIN', 'CALEG_UTAMA', 'TIM_SES', 'KORCAM', 'RELAWAN_LAPANGAN'],
    searchKeys: ['nomor_tps', 'kecamatan', 'desa', 'nama_saksi', 'status_verifikasi'],
    fields: [
      { key: 'nomor_tps', label: 'Nomor TPS', type: 'text', placeholder: 'Contoh: TPS 008', validation: { required: true } },
      { key: 'provinsi', label: 'Provinsi', type: 'region_province', validation: { required: true }, defaultValue: 'Jawa Timur' },
      { key: 'kota', label: 'Kabupaten/Kota', type: 'text', validation: { required: true }, defaultValue: 'Kota Surabaya' },
      { key: 'kecamatan', label: 'Kecamatan', type: 'region_district', validation: { required: true } },
      { key: 'desa', label: 'Desa / Kelurahan', type: 'region_village', validation: { required: true } },
      { key: 'nama_saksi', label: 'Nama Saksi Petugas TPS', type: 'text', validation: { required: true } },
      { key: 'no_wa_saksi', label: 'No WA Saksi', type: 'phone', validation: { required: true } },
      { key: 'suara_sah_caleg', label: 'Perolehan Suara Sah Caleg (Nomor Kita)', type: 'number', validation: { required: true, min: 0 } },
      { key: 'total_suara_sah', label: 'Total Seluruh Suara Sah di TPS', type: 'number', validation: { required: true, min: 0 } },
      { key: 'suara_tidak_sah', label: 'Jumlah Suara Tidak Sah / Rusak', type: 'number', validation: { required: true, min: 0 } },
      { key: 'foto_form_c1', label: 'Foto Lembar Form C1 Plano Fisik', type: 'file', validation: { required: true } },
      { key: 'titik_lokasi_tps', label: 'GPS Lokasi Input Saksi', type: 'location', validation: { required: true } },
      { 
        key: 'status_verifikasi', 
        label: 'Status Verifikasi Tabulasi Data', 
        type: 'select', 
        options: ['BELUM_DIVERIFIKASI', 'TERVERIFIKASI_SAH', 'SELISIH_SUARA_WARNING', 'DITOLAK_BURAM'],
        defaultValue: 'BELUM_DIVERIFIKASI',
        validation: { required: true }
      },
      { key: 'catatan_kejadian_khusus', label: 'Catatan Kejadian Khusus di TPS', type: 'textarea' }
    ]
  },
  {
    id: 'rab_aspirasi',
    title: 'RAB & Aspirasi Wilayah',
    description: 'Manajemen anggaran kampanye dan pengajuan bantuan (Di-audit AI).',
    icon: 'Wallet',
    allowedRoles: ['SUPER_ADMIN', 'CALEG_UTAMA', 'TIM_SES', 'KORCAM'],
    searchKeys: ['pengaju', 'kecamatan'],
    fields: [
      { key: 'pengaju', label: 'Nama Pengaju (Korcam/Korte)', type: 'text', validation: { required: true }, readOnly: true },
      { key: 'provinsi', label: 'Provinsi', type: 'region_province', readOnly: true, validation: { required: true } },
      { key: 'kota', label: 'Kota/Kabupaten', type: 'text', readOnly: true, validation: { required: true } },
      { key: 'kecamatan', label: 'Lokasi Kecamatan (Terkunci)', type: 'text', readOnly: true, validation: { required: true } },
      
      { key: 'target_suara', label: 'Target Suara (Otomatis x Alokasi)', type: 'number', validation: { required: true, min: 1 } },
      { key: 'deskripsi', label: 'Kebutuhan Logistik Fisik (Jelaskan rincian barang)', type: 'textarea', validation: { required: false } },
      { key: 'alokasi_pemilih', label: 'Alokasi Suara (Fix - Jangan diubah)', type: 'number', readOnly: true },
      { key: 'estimasi_ai', label: 'Audit Logistik AI (Termasuk Margin 5%)', type: 'number', readOnly: true },
      { 
        key: 'status', 
        label: 'Status Persetujuan', 
        type: 'select', 
        options: ['PENDING_AUDIT', 'MENUNGGU_CALEG', 'DP_CAIR', 'LUNAS', 'DITOLAK'],
        defaultValue: 'PENDING_AUDIT',
        readOnly: true
      }
    ]
  },
  {
    id: 'lpj_kegiatan',
    title: 'Audit LPJ & Pencairan',
    description: 'Laporan pertanggungjawaban geo-tagged untuk pencairan dana bertahap (Milestone).',
    icon: 'ShieldCheck',
    allowedRoles: ['SUPER_ADMIN', 'CALEG_UTAMA', 'TIM_SES', 'KORCAM'],
    searchKeys: ['kegiatan', 'pic'],
    fields: [
      { key: 'kegiatan', label: 'Nama RAB / Kegiatan Terkait (Dropdown)', type: 'text', validation: { required: true } },
      { key: 'pic', label: 'Penanggung Jawab (PIC)', type: 'text', validation: { required: true }, readOnly: true },
      
      // Auto-filled from user scope
      { key: 'kecamatan', label: 'Kecamatan', type: 'text', readOnly: true, validation: { required: true } },

      { key: 'foto_bukti', label: 'Foto Bukti Serah Terima / Fisik', type: 'file', validation: { required: true } },
      { key: 'lokasi', label: 'Koordinat GPS Geo-Tagging', type: 'location', validation: { required: true } },
      { key: 'nominal_terpakai', label: 'Nominal Terpakai / Dicairkan (Rp)', type: 'number', validation: { required: true, min: 1 } },
      { 
        key: 'status_audit', 
        label: 'Status Audit LPJ', 
        type: 'select', 
        options: ['MENUNGGU_AUDIT', 'SAH_SESUAI_KTP', 'DITOLAK_INDIKASI_FIKTIF'],
        defaultValue: 'MENUNGGU_AUDIT',
        readOnly: true
      }
    ]
  },
  {
    id: 'saas_system_settings',
    title: 'Pengaturan Kop Surat & Tagihan (Superadmin)',
    description: 'Konfigurasi kop surat resmi lembaga/konsultan pemenangan, kontak layanan, rekening bank invoice, dan catatan legalitas UU ITE untuk dokumen cetak.',
    icon: 'Settings',
    allowedRoles: ['SUPER_ADMIN'],
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
  }
];
