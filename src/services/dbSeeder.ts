import { db } from './firebase';
import { doc, writeBatch, collection, getDocs } from 'firebase/firestore';
import { 
  SEED_PRICING_ITEMS, 
  DEFAULT_SYSTEM_SETTINGS
} from '../utils/electoralData';

// Modular seeds imports
import { SEED_MASTER_DAPIL, SEED_MASTER_CALEG, SEED_TARGET_WILAYAH } from './seeds/electoralSeeds';
import { SEED_STANDAR_HARGA, SEED_ANGGARAN_KAMPANYE, SEED_LPJ_KEGIATAN, SEED_RAB } from './seeds/financeSeeds';
import { SEED_RELAWAN, SEED_DPT, SEED_KONSTITUEN, SEED_QUICK_COUNT } from './seeds/fieldSeeds';
import { SEED_SAINTE_LAGUE, SEED_TENANT_APPROVAL, SEED_MANAJEMEN_TENANT } from './seeds/saasSeeds';

// Re-export all seed datasets for universal consumer access
export {
  SEED_MASTER_DAPIL,
  SEED_MASTER_CALEG,
  SEED_TARGET_WILAYAH,
  SEED_STANDAR_HARGA,
  SEED_ANGGARAN_KAMPANYE,
  SEED_LPJ_KEGIATAN,
  SEED_SAINTE_LAGUE,
  SEED_RELAWAN,
  SEED_DPT,
  SEED_KONSTITUEN,
  SEED_QUICK_COUNT,
  SEED_RAB,
  SEED_TENANT_APPROVAL,
  SEED_MANAJEMEN_TENANT
};

/**
 * Auto-sync function for saas_pricing_matrix
 * Ensures Cloud Firestore always holds the updated pricing matrix records.
 */
export async function syncPricingMatrixWithFirestore(): Promise<void> {
  try {
    const existingSnap = await getDocs(collection(db, 'saas_pricing_matrix'));
    let needsUpdate = false;
    
    if (existingSnap.empty) {
      needsUpdate = true;
    } else {
      for (const docSnap of existingSnap.docs) {
        const data = docSnap.data();
        if (data.harga < 7500000 || data.nama_paket?.includes('Standard Command') || data.nama_paket?.includes('Pro AI Intelligence')) {
          needsUpdate = true;
          break;
        }
      }
    }

    if (needsUpdate) {
      if (!existingSnap.empty) {
        const deleteBatch = writeBatch(db);
        existingSnap.docs.forEach(d => deleteBatch.delete(d.ref));
        await deleteBatch.commit();
      }

      const insertBatch = writeBatch(db);
      SEED_PRICING_ITEMS.forEach((item, idx) => {
        const ref = doc(db, 'saas_pricing_matrix', `price-matrix-${idx + 1}`);
        insertBatch.set(ref, {
          id: `price-matrix-${idx + 1}`,
          ...item,
          tenant_id: 'TNT-DEFAULT',
          createdAt: new Date().toISOString()
        }, { merge: true });
      });
      await insertBatch.commit();
      console.log('✅ saas_pricing_matrix auto-synced with new pricing tiers in Cloud Firestore.');
    }
  } catch (err) {
    console.warn('Auto-sync saas_pricing_matrix error:', err);
  }
}

/**
 * Clean Modular Seeder Engine
 * Orchestrates writing comprehensive starter documents directly to Cloud Firestore across all 16 collections.
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

    // 1. saas_system_settings
    await writeCollectionBatch('saas_system_settings', [DEFAULT_SYSTEM_SETTINGS]);

    // 2. saas_pricing_matrix (Purge old documents first to guarantee clean overwrite)
    try {
      const existingPricingSnap = await getDocs(collection(db, 'saas_pricing_matrix'));
      if (!existingPricingSnap.empty) {
        const deleteBatch = writeBatch(db);
        existingPricingSnap.docs.forEach(d => {
          deleteBatch.delete(d.ref);
        });
        await deleteBatch.commit();
      }
    } catch (e) {
      console.warn('Non-blocking cleanup warning on saas_pricing_matrix:', e);
    }

    await writeCollectionBatch('saas_pricing_matrix', SEED_PRICING_ITEMS.map((item, idx) => ({
      id: `price-matrix-${idx + 1}`,
      ...item,
      tenant_id: 'TNT-DEFAULT',
      createdAt: new Date().toISOString()
    })));

    // 3. master_caleg
    await writeCollectionBatch('master_caleg', SEED_MASTER_CALEG);

    // 4. master_dapil
    await writeCollectionBatch('master_dapil', SEED_MASTER_DAPIL);

    // 5. target_dapil_wilayah
    await writeCollectionBatch('target_dapil_wilayah', SEED_TARGET_WILAYAH);

    // 6. standar_harga_daerah
    await writeCollectionBatch('standar_harga_daerah', SEED_STANDAR_HARGA);

    // 7. anggaran_kampanye
    await writeCollectionBatch('anggaran_kampanye', SEED_ANGGARAN_KAMPANYE);

    // 8. lpj_kegiatan
    await writeCollectionBatch('lpj_kegiatan', SEED_LPJ_KEGIATAN);

    // 9. simulasi_sainte_lague
    await writeCollectionBatch('simulasi_sainte_lague', SEED_SAINTE_LAGUE);

    // 10. user_relawan
    await writeCollectionBatch('user_relawan', SEED_RELAWAN);

    // 11. data_dpt
    await writeCollectionBatch('data_dpt', SEED_DPT);

    // 12. konstituen
    await writeCollectionBatch('konstituen', SEED_KONSTITUEN);

    // 13. quick_count_c1
    await writeCollectionBatch('quick_count_c1', SEED_QUICK_COUNT);

    // 14. rab_aspirasi
    await writeCollectionBatch('rab_aspirasi', SEED_RAB);

    // 15. saas_tenant_approval
    await writeCollectionBatch('saas_tenant_approval', SEED_TENANT_APPROVAL);

    // 16. manajemen_tenant_saas
    await writeCollectionBatch('manajemen_tenant_saas', SEED_MANAJEMEN_TENANT);

    return {
      success: true,
      totalWritten,
      message: `Berhasil menyinkronkan ${totalWritten} data master starter Kabupaten Ponorogo ke seluruh 16 koleksi Cloud Firestore secara terintegrasi!`
    };
  } catch (error: any) {
    console.error('Failed seeding Cloud Firestore:', error);
    throw new Error(error.message || 'Gagal melakukan seeding basis data Cloud.');
  }
}
