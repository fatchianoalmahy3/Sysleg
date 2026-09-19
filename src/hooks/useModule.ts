import { useState, useEffect, useCallback } from 'react';
import { ApiService } from '../services/api';
import { SEED_PRICING_ITEMS, DEFAULT_SYSTEM_SETTINGS } from '../utils/electoralData';

export function useModule(moduleId: string) {

  const [data, setData] = useState<any[]>(() => {
    return ApiService.getCachedRecords(moduleId) || [];
  });
  const [totalServerCount, setTotalServerCount] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(() => {
    const cached = ApiService.getCachedRecords(moduleId);
    return !(cached && cached.length > 0);
  });
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const refresh = useCallback(async (forceRefresh = false) => {
    // SWR Pattern: check immediate cache
    const cached = ApiService.getCachedRecords(moduleId, searchQuery);
    if (cached && cached.length > 0 && !forceRefresh) {
      setData(cached);
      setLoading(false);
    } else if (forceRefresh) {
      setLoading(true);
    }

    setError(null);
    try {
      // Parallelize: getRecords and getRecordCount in Promise.all for 2x faster network trip
      const [records, count] = await Promise.all([
        ApiService.getRecords(moduleId, searchQuery, forceRefresh),
        ApiService.getRecordCount(moduleId).catch(() => null)
      ]);

      let finalRecords = records;

      // Role & Spatial Geofencing Isolation Filter (Data Leakage Prevention)
      const activeRole = localStorage.getItem('admin_active_role') || 'superadmin';
      const userKecamatan = localStorage.getItem('user_kecamatan') || '';
      const userDesa = localStorage.getItem('user_desa') || '';
      const userEmail = localStorage.getItem('admin_email') || '';

      if (activeRole === 'relawan' && moduleId === 'konstituen') {
        // Canvasser Relawan only sees their own inputted constituents or assigned village
        finalRecords = finalRecords.filter((rec: any) => 
          rec.input_by === userEmail || 
          (userDesa && rec.desa === userDesa) || 
          (!rec.input_by && !rec.desa)
        );
      } else if (activeRole === 'koordinator' && userKecamatan) {
        // Korcam Koordinator only sees records within their assigned kecamatan
        if (['rab_aspirasi', 'lpj_kegiatan', 'target_dapil_wilayah', 'user_relawan', 'quick_count_c1'].includes(moduleId)) {
          finalRecords = finalRecords.filter((rec: any) => {
            const itemKec = rec.kecamatan || rec.kecamatan_tugas || rec.wilayah_kecamatan || rec.kecamatan_penugasan;
            return !itemKec || itemKec === userKecamatan;
          });
        }
      }

      // Auto-Seed default pricing matrix if empty and no search query
      if (records.length === 0 && !searchQuery && moduleId === 'saas_pricing_matrix') {
        try {
          const seeded: any[] = [];
          for (const item of SEED_PRICING_ITEMS) {
            const created = await ApiService.createRecord('saas_pricing_matrix', item);
            seeded.push(created);
          }
          finalRecords = seeded;
        } catch (seedErr) {
          console.warn('Auto-seed saas_pricing_matrix fallback error:', seedErr);
        }
      }

      // Auto-Seed default system settings if empty and no search query
      if (records.length === 0 && !searchQuery && moduleId === 'saas_system_settings') {
        try {
          const created = await ApiService.createRecord('saas_system_settings', DEFAULT_SYSTEM_SETTINGS);
          finalRecords = [created];
        } catch (seedErr) {
          console.warn('Auto-seed saas_system_settings fallback error:', seedErr);
        }
      }

      setData(finalRecords);
      const effectiveCount = count !== null ? Math.max(count, finalRecords.length) : finalRecords.length;
      setTotalServerCount(effectiveCount);
      setHasMore(effectiveCount > finalRecords.length);

    } catch (err: any) {
      setError(err.message || 'Gagal memuat data dari basis data.');
    } finally {
      setLoading(false);
    }
  }, [moduleId, searchQuery]);

  // Trigger search / refresh on mount & query change
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Load Next Page (Cursor Pagination)
  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const result = await ApiService.getNextPageRecords(moduleId, 100);
      if (result.items.length > 0) {
        setData((prev) => {
          const existingIds = new Set(prev.map(i => i.id));
          const filtered = result.items.filter(i => !existingIds.has(i.id));
          return [...prev, ...filtered];
        });
      }
      setHasMore(result.hasMore);
    } catch (err: any) {
      console.warn('Failed to load more records:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  const getItemById = async (id: string) => {
    try {
      return await ApiService.getRecordById(moduleId, id);
    } catch (err: any) {
      setError(err.message || 'Gagal mengambil detail data.');
      throw err;
    }
  };

  const createItem = async (payload: any) => {
    setError(null);
    try {
      let finalPayload = { ...payload };

      // [Milestone 5 - Auto-tagging Identity]
      const currentUserEmail = localStorage.getItem('admin_email') || 'unknown@user.com';
      if (!finalPayload.input_by) {
        finalPayload.input_by = currentUserEmail;
      }
      if (moduleId === 'rab_aspirasi' && !finalPayload.pengaju) {
        finalPayload.pengaju = currentUserEmail;
      }
      if (moduleId === 'lpj_kegiatan' && !finalPayload.pic) {
        finalPayload.pic = currentUserEmail;
      }

      // [Milestone 4 - AI Financial Auditor & Fixed CPV Integration]
      if (moduleId === 'rab_aspirasi') {
        const FIX_CPV_RATE = 100000; // Rp 100.000 / Suara (Caleg's Fixed Rule)
        
        // 1. Calculate Alokasi Pemilih (Locked logic)
        const targetSuara = Number(payload.target_suara) || 0;
        finalPayload.alokasi_pemilih = targetSuara * FIX_CPV_RATE;
        finalPayload.status = 'PENDING_AUDIT'; // Initial status

        // 2. Audit Kebutuhan Logistik using Gemini AI API (If provided)
        if (payload.deskripsi && payload.deskripsi.trim() !== '') {
          try {
            const auditRes = await fetch('/api/audit-rab', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ description: payload.deskripsi })
            });
            const auditData = await auditRes.json();
            
            if (auditData.success) {
              finalPayload.estimasi_ai = auditData.data.approvedCost; // Price + 5%
            } else {
              console.warn("AI Audit failed:", auditData.error);
              finalPayload.estimasi_ai = 0;
            }
          } catch (aiError) {
            console.error("AI Audit Network Error:", aiError);
            finalPayload.estimasi_ai = 0;
          }
        } else {
          finalPayload.estimasi_ai = 0;
        }
      }

      // [Milestone 4 - LPJ Audit Validation]
      if (moduleId === 'lpj_kegiatan') {
        finalPayload.status_audit = 'MENUNGGU_AUDIT';
      }

      const newItem = await ApiService.createRecord(moduleId, finalPayload);
      setData((prev) => [newItem, ...prev]);
      if (totalServerCount !== null) setTotalServerCount(totalServerCount + 1);
      return newItem;
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan data.');
      throw err;
    }
  };

  const bulkImportItems = async (items: any[]) => {
    setError(null);
    try {
      const result = await ApiService.bulkCreateRecords(moduleId, items);
      await refresh(true);
      return result;
    } catch (err: any) {
      setError(err.message || 'Gagal mengimpor data massal.');
      throw err;
    }
  };

  const updateItem = async (id: string, payload: any) => {
    setError(null);
    try {
      const updatedItem = await ApiService.updateRecord(moduleId, id, payload);
      setData((prev) => prev.map((item) => (item.id === id ? updatedItem : item)));
      return updatedItem;
    } catch (err: any) {
      setError(err.message || 'Gagal memperbarui data.');
      throw err;
    }
  };

  const deleteItem = async (id: string) => {
    setError(null);
    try {
      await ApiService.deleteRecord(moduleId, id);
      setData((prev) => prev.filter((item) => item.id !== id));
      if (totalServerCount !== null && totalServerCount > 0) setTotalServerCount(totalServerCount - 1);
    } catch (err: any) {
      setError(err.message || 'Gagal menghapus data.');
      throw err;
    }
  };

  return {
    data,
    totalServerCount,
    loading,
    loadingMore,
    hasMore,
    error,
    searchQuery,
    setSearchQuery,
    refresh,
    loadMore,
    getItemById,
    createItem,
    bulkImportItems,
    updateItem,
    deleteItem
  };
}
