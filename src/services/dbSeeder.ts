import { db } from './firebase';
import { collection, doc, setDoc, getDocs, limit, writeBatch } from 'firebase/firestore';
import { 
  SEED_PRICING_ITEMS, 
  DEFAULT_SYSTEM_SETTINGS 
} from '../utils/electoralData';
import { PONOROGO_DAPIL_OFFICIAL } from '../data/ponorogoRegions';

// Official Master Dapil Kabupaten Ponorogo (6 Dapil - Total 45 Kursi)
export const SEED_MASTER_DAPIL = [
  {
    id: 'DAPIL-PNG-01',
    nama_dapil: 'Dapil Ponorogo 1 (Kota & Babadan)',
    provinsi: 'Jawa Timur',
    kota: 'Kabupaten Ponorogo',
    kecamatan: 'Ponorogo (Kota)',
    desa: 'Kelurahan Mangkujayan',
    target_tps: 560,
    tenant_id: 'TNT-DEFAULT',
    createdAt: new Date().toISOString()
  },
  {
    id: 'DAPIL-PNG-02',
    nama_dapil: 'Dapil Ponorogo 2 (Jenangan, Siman, Jetis, Mlarak)',
    provinsi: 'Jawa Timur',
    kota: 'Kabupaten Ponorogo',
    kecamatan: 'Siman',
    desa: 'Desa Siman',
    target_tps: 520,
    tenant_id: 'TNT-DEFAULT',
    createdAt: new Date().toISOString()
  },
  {
    id: 'DAPIL-PNG-03',
    nama_dapil: 'Dapil Ponorogo 3 (Pulung, Pudak, Sooko, Sawoo)',
    provinsi: 'Jawa Timur',
    kota: 'Kabupaten Ponorogo',
    kecamatan: 'Pulung',
    desa: 'Desa Pulung',
    target_tps: 480,
    tenant_id: 'TNT-DEFAULT',
    createdAt: new Date().toISOString()
  },
  {
    id: 'DAPIL-PNG-04',
    nama_dapil: 'Dapil Ponorogo 4 (Ngrayun, Slahung, Bungkal, Sambit)',
    provinsi: 'Jawa Timur',
    kota: 'Kabupaten Ponorogo',
    kecamatan: 'Slahung',
    desa: 'Desa Slahung',
    target_tps: 580,
    tenant_id: 'TNT-DEFAULT',
    createdAt: new Date().toISOString()
  },
  {
    id: 'DAPIL-PNG-05',
    nama_dapil: 'Dapil Ponorogo 5 (Balong, Badegan, Jambon)',
    provinsi: 'Jawa Timur',
    kota: 'Kabupaten Ponorogo',
    kecamatan: 'Balong',
    desa: 'Desa Balong',
    target_tps: 390,
    tenant_id: 'TNT-DEFAULT',
    createdAt: new Date().toISOString()
  },
  {
    id: 'DAPIL-PNG-06',
    nama_dapil: 'Dapil Ponorogo 6 (Kauman, Sampung, Sukorejo)',
    provinsi: 'Jawa Timur',
    kota: 'Kabupaten Ponorogo',
    kecamatan: 'Kauman (Sumoroto)',
    desa: 'Desa Kauman',
    target_tps: 350,
    tenant_id: 'TNT-DEFAULT',
    createdAt: new Date().toISOString()
  }
];

export const SEED_MASTER_CALEG = [
  {
    id: 'CLG-PONOROGO-01',
    nama_lengkap: 'H. Irfan Almahy, S.T., M.M.',
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

export const SEED_RELAWAN = [
  {
    id: 'USR-KORCAM-PNG',
    nama: 'Budi Santoso, S.Pd.',
    nik: '3502011205840001',
    email: 'korcam.ponorogo@pemenangan.id',
    nomor_wa: '081234567891',
    tingkat_penugasan: 'KORCAM (Koordinator Kecamatan)',
    parent_coordinator: 'Timses Utama Caleg Ponorogo',
    provinsi_tugas: 'Jawa Timur',
    kota_tugas: 'Kabupaten Ponorogo',
    kecamatan_tugas: 'Kecamatan Ponorogo (Kota)',
    desa_tugas: '',
    tps_tugas: '',
    role: 'KORCAM',
    status: 'AKTIF',
    tenant_id: 'TNT-DEFAULT',
    foto_relawan: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    createdAt: new Date().toISOString()
  },
  {
    id: 'USR-KORDES-MNG',
    nama: 'Ahmad Fauzi, S.Kom.',
    nik: '3502012308900002',
    email: 'kordes.mangkujayan@pemenangan.id',
    nomor_wa: '081234567892',
    tingkat_penugasan: 'KORDES (Koordinator Desa/Kelurahan)',
    parent_coordinator: 'Budi Santoso (Korcam Ponorogo)',
    provinsi_tugas: 'Jawa Timur',
    kota_tugas: 'Kabupaten Ponorogo',
    kecamatan_tugas: 'Kecamatan Ponorogo (Kota)',
    desa_tugas: 'Kelurahan Mangkujayan',
    tps_tugas: '',
    role: 'RELAWAN_LAPANGAN',
    status: 'AKTIF',
    tenant_id: 'TNT-DEFAULT',
    foto_relawan: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    createdAt: new Date().toISOString()
  },
  {
    id: 'USR-SAKSI-TPS07',
    nama: 'Siti Rahmawati',
    nik: '3502015509930003',
    email: 'saksi.tps07.mangkujayan@pemenangan.id',
    nomor_wa: '081234567893',
    tingkat_penugasan: 'SAKSI_TPS (Saksi TPS Resmi)',
    parent_coordinator: 'Ahmad Fauzi (Kordes Mangkujayan)',
    provinsi_tugas: 'Jawa Timur',
    kota_tugas: 'Kabupaten Ponorogo',
    kecamatan_tugas: 'Kecamatan Ponorogo (Kota)',
    desa_tugas: 'Kelurahan Mangkujayan',
    tps_tugas: 'TPS 007',
    role: 'RELAWAN_LAPANGAN',
    status: 'AKTIF',
    tenant_id: 'TNT-DEFAULT',
    foto_relawan: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
    createdAt: new Date().toISOString()
  }
];

export const SEED_DPT = [
  {
    id: 'DPT-350201-0001',
    nik: '3502011102780001',
    nama: 'Bambang Supriyanto',
    jenis_kelamin: 'Laki-laki',
    usia: 48,
    provinsi: 'Jawa Timur',
    kota: 'Kabupaten Ponorogo',
    kecamatan: 'Kecamatan Ponorogo (Kota)',
    desa: 'Kelurahan Mangkujayan',
    rw: '03',
    rt: '02',
    nomor_tps: 'TPS 007',
    status_afiliasi: 'LOYALIS_PASTI',
    catatan_afiliasi: 'Tokoh RT setempat dekat Alun-alun Ponorogo, siap menggalang 35 suara keluarga.',
    tenant_id: 'TNT-DEFAULT',
    createdAt: new Date().toISOString()
  },
  {
    id: 'DPT-350201-0002',
    nik: '3502014506820002',
    nama: 'Sri Wahyuni, S.Pd.',
    jenis_kelamin: 'Perempuan',
    usia: 44,
    provinsi: 'Jawa Timur',
    kota: 'Kabupaten Ponorogo',
    kecamatan: 'Kecamatan Ponorogo (Kota)',
    desa: 'Kelurahan Mangkujayan',
    rw: '03',
    rt: '02',
    nomor_tps: 'TPS 007',
    status_afiliasi: 'TARGET_PROSPEK',
    catatan_afiliasi: 'Koordinator Paguyuban Guru PAUD Ponorogo Kota, respon sangat baik terhadap visi pendidikan caleg.',
    tenant_id: 'TNT-DEFAULT',
    createdAt: new Date().toISOString()
  },
  {
    id: 'DPT-350201-0003',
    nik: '3502012108950003',
    nama: 'Dimas Anggara Pratama',
    jenis_kelamin: 'Laki-laki',
    usia: 30,
    provinsi: 'Jawa Timur',
    kota: 'Kabupaten Ponorogo',
    kecamatan: 'Kecamatan Babadan',
    desa: 'Desa Ngunut',
    rw: '01',
    rt: '04',
    nomor_tps: 'TPS 003',
    status_afiliasi: 'SWING_VOTER',
    catatan_afiliasi: 'Pemuda penggerak sanggar reyog Ponorogo, apresiatif program pelestarian budaya.',
    tenant_id: 'TNT-DEFAULT',
    createdAt: new Date().toISOString()
  }
];

export const SEED_KONSTITUEN = [
  {
    id: 'KST-3502-001',
    nik: '3502011102780001',
    name: 'Bambang Supriyanto',
    gender: 'Laki-laki',
    phone: '081298765432',
    provinsi: 'Jawa Timur',
    kota: 'Kabupaten Ponorogo',
    kecamatan: 'Kecamatan Ponorogo (Kota)',
    desa: 'Kelurahan Mangkujayan',
    rw: '03',
    rt: '02',
    ktp_image_url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=60',
    location: '-7.8687, 111.4623',
    input_by: 'kordes.mangkujayan@pemenangan.id',
    notes: 'e-KTP Ponorogo Asli telah diverifikasi fisik dan lokasi GPS terkonfirmasi di sekitar Alun-alun Ponorogo.',
    tenant_id: 'TNT-DEFAULT',
    createdAt: new Date().toISOString()
  },
  {
    id: 'KST-3502-002',
    nik: '3502014506820002',
    name: 'Sri Wahyuni, S.Pd.',
    gender: 'Perempuan',
    phone: '081387654321',
    provinsi: 'Jawa Timur',
    kota: 'Kabupaten Ponorogo',
    kecamatan: 'Kecamatan Ponorogo (Kota)',
    desa: 'Kelurahan Mangkujayan',
    rw: '03',
    rt: '02',
    ktp_image_url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=60',
    location: '-7.8710, 111.4650',
    input_by: 'kordes.mangkujayan@pemenangan.id',
    notes: 'Dukungan pasti keluarga besar Mangkujayan RT 02 RW 03.',
    tenant_id: 'TNT-DEFAULT',
    createdAt: new Date().toISOString()
  }
];

export const SEED_QUICK_COUNT = [
  {
    id: 'QC-TPS007-MANGKUJAYAN',
    nomor_tps: 'TPS 007',
    provinsi: 'Jawa Timur',
    kota: 'Kabupaten Ponorogo',
    kecamatan: 'Kecamatan Ponorogo (Kota)',
    desa: 'Kelurahan Mangkujayan',
    nama_saksi: 'Siti Rahmawati',
    no_wa_saksi: '081234567893',
    suara_sah_caleg: 158,
    total_suara_sah: 242,
    suara_tidak_sah: 6,
    foto_form_c1: 'https://images.unsplash.com/photo-1568667256549-094345857637?w=800&auto=format&fit=crop&q=60',
    titik_lokasi_tps: '-7.8687, 111.4623',
    status_verifikasi: 'TERVERIFIKASI_SAH',
    catatan_kejadian_khusus: 'Penghitungan suara Plano C1 selesai pukul 14.45 WIB dengan aman dan tertib.',
    tenant_id: 'TNT-DEFAULT',
    createdAt: new Date().toISOString()
  }
];

export const SEED_RAB = [
  {
    id: 'RAB-PNG-001',
    pengaju: 'korcam.ponorogo@pemenangan.id',
    provinsi: 'Jawa Timur',
    kota: 'Kabupaten Ponorogo',
    kecamatan: 'Kecamatan Ponorogo (Kota)',
    target_suara: 750,
    deskripsi: 'Pengadaan paket aspirasi warga dan konsolidasi akbar 45 Saksi TPS se-Kecamatan Ponorogo Kota.',
    alokasi_pemilih: 45000000,
    estimasi_ai: 46200000,
    status: 'DP_CAIR',
    tenant_id: 'TNT-DEFAULT',
    createdAt: new Date().toISOString()
  }
];

/**
 * Seeder Engine: Writes real starter documents directly to Cloud Firestore
 */
export async function seedCloudDatabase(): Promise<{ success: boolean; totalWritten: number; message: string }> {
  try {
    let totalWritten = 0;

    const writeCollectionBatch = async (collectionName: string, items: any[]) => {
      const batch = writeBatch(db);
      for (const item of items) {
        const itemDocId = item.id || `doc-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
        const docRef = doc(db, collectionName, itemDocId);
        batch.set(docRef, item, { merge: true });
        totalWritten++;
      }
      await batch.commit();
    };

    // 1. Seed saas_system_settings
    await writeCollectionBatch('saas_system_settings', [DEFAULT_SYSTEM_SETTINGS]);

    // 2. Seed saas_pricing_matrix
    await writeCollectionBatch('saas_pricing_matrix', SEED_PRICING_ITEMS.map((item, idx) => ({
      id: `price-matrix-${idx + 1}`,
      ...item,
      tenant_id: 'TNT-DEFAULT',
      createdAt: new Date().toISOString()
    })));

    // 3. Seed master_caleg
    await writeCollectionBatch('master_caleg', SEED_MASTER_CALEG);

    // 4. Seed master_dapil
    await writeCollectionBatch('master_dapil', SEED_MASTER_DAPIL);

    // 5. Seed user_relawan
    await writeCollectionBatch('user_relawan', SEED_RELAWAN);

    // 6. Seed data_dpt
    await writeCollectionBatch('data_dpt', SEED_DPT);

    // 7. Seed konstituen
    await writeCollectionBatch('konstituen', SEED_KONSTITUEN);

    // 8. Seed quick_count_c1
    await writeCollectionBatch('quick_count_c1', SEED_QUICK_COUNT);

    // 9. Seed rab_aspirasi
    await writeCollectionBatch('rab_aspirasi', SEED_RAB);

    return {
      success: true,
      totalWritten,
      message: `Berhasil menulis ${totalWritten} dokumen starter Kabupaten Ponorogo ke 9 koleksi Cloud Firestore!`
    };
  } catch (error: any) {
    console.error('Failed seeding Cloud Firestore:', error);
    throw new Error(error.message || 'Gagal melakukan seeding basis data Cloud.');
  }
}
