import { 
  KPU_DPT_PONOROGO_2024, 
  DAPIL_PONOROGO_OFFICIAL 
} from '../../utils/electoralData';

// 1. Official Master Dapil Kabupaten Ponorogo (6 Dapil - Total 45 Kursi - KPU 2024)
export const SEED_MASTER_DAPIL = DAPIL_PONOROGO_OFFICIAL.map(d => ({
  id: `DAPIL-PNG-0${d.id.replace('DAPIL_', '')}`,
  nama_dapil: `${d.nama} (${d.wilayah})`,
  provinsi: 'Jawa Timur',
  kota: 'Kabupaten Ponorogo',
  kecamatan: d.kecamatanList[0],
  desa: `${d.totalDesa} Desa/Kelurahan`,
  target_tps: d.totalTps,
  tenant_id: 'TNT-DEFAULT',
  createdAt: new Date().toISOString()
}));

// 2. Master Profil Caleg
export const SEED_MASTER_CALEG = [
  {
    id: 'CLG-PONOROGO-01',
    nama_lengkap: 'Drs. H. Ahmad Fauzan, M.Si.',
    nomor_urut: 1,
    partai: '01 - PKB (Partai Kebangkitan Bangsa)',
    slogan: 'Nyawiji Mbangun Ponorogo Berkemajuan & Berdaya',
    target_suara_global: 18500,
    alokasi_cpv: 85000,
    tenant_id: 'TNT-DEFAULT',
    foto_logo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    createdAt: new Date().toISOString()
  }
];

// 3. Target Suara & Wilayah Gerilya (21 Kecamatan Lengkap - KPU Kabupaten Ponorogo 2024)
export const SEED_TARGET_WILAYAH = KPU_DPT_PONOROGO_2024.map(k => ({
  id: `TGT-KEC-${k.nama.toUpperCase().replace(/[^A-Z]/g, '')}`,
  provinsi: 'Jawa Timur',
  kabupaten: 'Kabupaten Ponorogo',
  kecamatan: k.nama,
  jumlah_dpt: k.dptTotal,
  target_suara: k.targetSuara,
  suara_terkunci: k.suaraTerkunci,
  gap_suara: k.targetSuara - k.suaraTerkunci,
  status_wilayah: k.kuadran === 'BASIS_HIJAU' 
    ? 'BASIS_HIJAU (Aman / Loyal)' 
    : k.kuadran === 'BATTLEGROUND_KUNING' 
    ? 'BATTLEGROUND_KUNING (Medan Tempur Kritis)' 
    : 'RAWAN_MERAH (Penetrasi Rendah)',
  pic_korcam: `${k.picKorcam} (Korcam ${k.nama})`,
  catatan_strategi: k.catatanStrategi,
  tenant_id: 'TNT-DEFAULT',
  createdAt: new Date().toISOString()
}));
