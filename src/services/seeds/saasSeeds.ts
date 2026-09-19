// Skenario Simulasi Sainte-Laguë (Dapil Ponorogo 1 - Alokasi 7 Kursi)
export const SEED_SAINTE_LAGUE = [
  {
    id: 'STL-01-PKB',
    nama_partai: '01 - PKB (Partai Kebangkitan Bangsa)',
    nomor_urut_partai: 1,
    suara_total_partai: 18520,
    nama_caleg_terpilih: 'Drs. H. Ahmad Fauzan, M.Si.',
    is_partai_kita: true,
    kursi_diperoleh: 2,
    status_kursi: 'LOLOS_KURSI_AMAN',
    selisih_suara_aman: 4120,
    analisis_taktis: 'PKB berhasil mengunci Kursi ke-2 dan Kursi ke-5 di Dapil Ponorogo 1. Posisi sangat aman dengan safety margin +4.120 suara dari ambang batas kursi terakhir.',
    tenant_id: 'TNT-DEFAULT',
    createdAt: new Date().toISOString()
  },
  {
    id: 'STL-02-PDIP',
    nama_partai: '03 - PDI Perjuangan',
    nomor_urut_partai: 3,
    suara_total_partai: 19800,
    nama_caleg_terpilih: 'Drs. Sugeng Widodo',
    is_partai_kita: false,
    kursi_diperoleh: 2,
    status_kursi: 'LOLOS_KURSI_AMAN',
    selisih_suara_aman: 3200,
    analisis_taktis: 'Meraih Kursi ke-1 dan Kursi ke-6. Basis perkotaan solid.',
    tenant_id: 'TNT-DEFAULT',
    createdAt: new Date().toISOString()
  },
  {
    id: 'STL-03-GERINDRA',
    nama_partai: '02 - Partai Gerindra',
    nomor_urut_partai: 2,
    suara_total_partai: 16400,
    nama_caleg_terpilih: 'Bambang Irawan, S.E.',
    is_partai_kita: false,
    kursi_diperoleh: 1,
    status_kursi: 'LOLOS_KURSI_AMAN',
    selisih_suara_aman: 7400,
    analisis_taktis: 'Meraih Kursi ke-3 secara definitif.',
    tenant_id: 'TNT-DEFAULT',
    createdAt: new Date().toISOString()
  },
  {
    id: 'STL-04-GOLKAR',
    nama_partai: '04 - Partai Golkar',
    nomor_urut_partai: 4,
    suara_total_partai: 11200,
    nama_caleg_terpilih: 'Eko Sulistyo, S.H.',
    is_partai_kita: false,
    kursi_diperoleh: 1,
    status_kursi: 'LOLOS_KURSI_AMAN',
    selisih_suara_aman: 2200,
    analisis_taktis: 'Meraih Kursi ke-4.',
    tenant_id: 'TNT-DEFAULT',
    createdAt: new Date().toISOString()
  },
  {
    id: 'STL-05-DEMOKRAT',
    nama_partai: '14 - Partai Demokrat',
    nomor_urut_partai: 14,
    suara_total_partai: 8950,
    nama_caleg_terpilih: 'Rina Rahmawati, S.Sos.',
    is_partai_kita: false,
    kursi_diperoleh: 1,
    status_kursi: 'KURSI_TERAKHIR_RAWAN',
    selisih_suara_aman: 450,
    analisis_taktis: 'Mengunci Kursi ke-7 (kursi penutup), namun margin selisih sangat tipis hanya +450 suara di atas PAN.',
    tenant_id: 'TNT-DEFAULT',
    createdAt: new Date().toISOString()
  },
  {
    id: 'STL-06-PAN',
    nama_partai: '12 - PAN (Partai Amanat Nasional)',
    nomor_urut_partai: 12,
    suara_total_partai: 7800,
    nama_caleg_terpilih: 'Agus Setiawan',
    is_partai_kita: false,
    kursi_diperoleh: 0,
    status_kursi: 'BELUM_LOLOS_KURSI',
    selisih_suara_aman: -1150,
    analisis_taktis: 'Peringkat ke-8, defisit 1.150 suara untuk merebut kursi terakhir dari Partai Demokrat.',
    tenant_id: 'TNT-DEFAULT',
    createdAt: new Date().toISOString()
  },
  {
    id: 'STL-07-PKS',
    nama_partai: '08 - PKS (Partai Keadilan Sejahtera)',
    nomor_urut_partai: 8,
    suara_total_partai: 6100,
    nama_caleg_terpilih: 'Ust. Wahyudi, Lc.',
    is_partai_kita: false,
    kursi_diperoleh: 0,
    status_kursi: 'BELUM_LOLOS_KURSI',
    selisih_suara_aman: -2850,
    analisis_taktis: 'Belum memenuhi kuota pembagi Sainte-Laguë tahap pertama.',
    tenant_id: 'TNT-DEFAULT',
    createdAt: new Date().toISOString()
  },
  {
    id: 'STL-08-NASDEM',
    nama_partai: '05 - Partai NasDem',
    nomor_urut_partai: 5,
    suara_total_partai: 4800,
    nama_caleg_terpilih: 'Sunarto, M.Pd.',
    is_partai_kita: false,
    kursi_diperoleh: 0,
    status_kursi: 'BELUM_LOLOS_KURSI',
    selisih_suara_aman: -4150,
    analisis_taktis: 'Belum memperoleh kursi di Dapil 1 Ponorogo.',
    tenant_id: 'TNT-DEFAULT',
    createdAt: new Date().toISOString()
  }
];

// Antrean Pendaftaran & Verifikasi Caleg (SaaS Tenant Approval)
export const SEED_TENANT_APPROVAL = [
  {
    id: 'APP-CLG-001',
    nama_caleg: 'dr. H. Bambang Hermanto, Sp.OG',
    email: 'dr.bambang@caleg-dprri.id',
    no_wa: '08113456789',
    tingkat_pemilihan: 'DPR-RI',
    nama_dapil: 'Dapil Jawa Timur VII (Ponorogo, Pacitan, Trenggalek, Magetan, Ngawi)',
    provinsi: 'Jawa Timur',
    kota: 'Kabupaten Ponorogo',
    partai: '01 - PKB (Partai Kebangkitan Bangsa)',
    nomor_urut: 2,
    paket: 'Tier 3 (Enterprise)',
    status: 'MENUNGGU_VERIFIKASI',
    tenant_id: 'TNT-DPRRI-001',
    catatan_verifikasi: 'Berkas KTA dan penetrasi DPT KPU siap diproses.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'APP-CLG-002',
    nama_caleg: 'Hj. Siti Aminah, S.E.',
    email: 'siti.aminah@caleg-dprdjatim.id',
    no_wa: '08123499887',
    tingkat_pemilihan: 'DPRD PROVINSI',
    nama_dapil: 'Dapil Jatim IX (Ponorogo, Pacitan, Trenggalek)',
    provinsi: 'Jawa Timur',
    kota: 'Kabupaten Ponorogo',
    partai: '03 - PDI Perjuangan',
    nomor_urut: 1,
    paket: 'Tier 2 (Pro)',
    status: 'TERVERIFIKASI',
    tenant_id: 'TNT-DPRDPROV-002',
    catatan_verifikasi: 'Workspace aktif, kuota 250.000 DPT telah dialokasikan.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'APP-CLG-003',
    nama_caleg: 'Ir. Hendra Prasetyo',
    email: 'hendra.caleg@pemenangan.id',
    no_wa: '08133567890',
    tingkat_pemilihan: 'DPRD KAB/KOTA',
    nama_dapil: 'Dapil Ponorogo 2 (Jenangan, Siman, Jetis, Mlarak)',
    provinsi: 'Jawa Timur',
    kota: 'Kabupaten Ponorogo',
    partai: '02 - Partai Gerindra',
    nomor_urut: 1,
    paket: 'Tier 1 (Dasar)',
    status: 'MENUNGGU_VERIFIKASI',
    tenant_id: 'TNT-DAPIL2-003',
    catatan_verifikasi: 'Menunggu konfirmasi bukti transfer pembayaran paket.',
    createdAt: new Date().toISOString()
  }
];

// Manajemen Klien & Kuota DPT SaaS (Vendor Dashboard)
export const SEED_MANAJEMEN_TENANT = [
  {
    id: 'TNT-MGT-001',
    nama_klien: 'Drs. H. Ahmad Fauzan, M.Si. (Dapil 1 Ponorogo)',
    jenis_paket: 'Tier 2 (Pro)',
    status_bayar: 'Lunas',
    kuota_dpt: 150000,
    dpt_terpakai: 29030,
    tanggal_aktivasi: '2024-01-10',
    kontak_pj: '081234567891 (Budi Santoso)',
    domain_klien: 'ahmadfauzan.pemenangan.id',
    createdAt: new Date().toISOString()
  },
  {
    id: 'TNT-MGT-002',
    nama_klien: 'dr. H. Bambang Hermanto, Sp.OG (DPR-RI Jatim VII)',
    jenis_paket: 'Enterprise',
    status_bayar: 'Lunas',
    kuota_dpt: 500000,
    dpt_terpakai: 184500,
    tanggal_aktivasi: '2024-01-15',
    kontak_pj: '08113456789 (Humas Timses)',
    domain_klien: 'bambanghermanto.dprri.id',
    createdAt: new Date().toISOString()
  },
  {
    id: 'TNT-MGT-003',
    nama_klien: 'Hj. Siti Aminah, S.E. (DPRD Jatim IX)',
    jenis_paket: 'Tier 2 (Pro)',
    status_bayar: 'Lunas',
    kuota_dpt: 250000,
    dpt_terpakai: 94200,
    tanggal_aktivasi: '2024-02-01',
    kontak_pj: '08123499887 (Sekretariat DPC)',
    domain_klien: 'sitiaminah.dprdjatim.id',
    createdAt: new Date().toISOString()
  },
  {
    id: 'TNT-MGT-004',
    nama_klien: 'Ir. Hendra Prasetyo (Dapil 2 Ponorogo)',
    jenis_paket: 'Tier 1 (Dasar)',
    status_bayar: 'Menunggak',
    kuota_dpt: 100000,
    dpt_terpakai: 12400,
    tanggal_aktivasi: '2024-02-10',
    kontak_pj: '08133567890 (Ir. Hendra)',
    domain_klien: 'hendraprasetyo.pemenangan.id',
    createdAt: new Date().toISOString()
  }
];
