import { useMemo } from 'react';
import { PONOROGO_DISTRICTS } from '../../data/ponorogoRegions';
import { getVillageCentroid } from '../../data/ponorogoVillageCoordinates';
import { PONOROGO_TPS_LOKSUS_LIST } from '../../utils/electoralIntegrity';
import { calculateSainteLague } from '../../services/electionMath';

export interface VillageBattleUnit {
  name: string;
  kecamatan: string;
  dapilId: string;
  lat: number;
  lng: number;
  kordesName: string;
  kordesPhone: string;
  targetKtp: number;
  ktpCount: number;
  totalTps: number;
  saksiCount: number;
  status: 'AMAN' | 'RAWAN' | 'KOSONG';
  progress: number;
}

export interface TpsBattleUnit {
  id: string;
  nomorTps: string;
  kecamatan: string;
  desa: string;
  dpt: number;
  ktpCount: number;
  targetSuara: number;
  saksiName: string;
  saksiPhone: string;
  saksiFoto: string;
  status: 'AMAN' | 'RAWAN' | 'KOSONG';
  progress: number;
  lat: number;
  lng: number;
  isLoksus?: boolean;
  kategoriLoksus?: string;
  loksusName?: string;
}

export interface PriorityVillage {
  desa: string;
  kecamatan: string;
  totalKtp: number;
  target: number;
  dpt: number;
  percentage: number;
  gap: number;
}

interface UseDashboardMetricsProps {
  activeDapil: string;
  currentDapilConfig: { center: [number, number]; zoom: number; name: string; districts: string[] };
  rawKonstituen: any[];
  rawRelawan: any[];
  rawRab: any[];
  rawAnggaran: any[];
  rawLpj: any[];
  rawSainteLague: any[];
  calegInfo: any;
  tpsSearchQuery: string;
  tpsStatusFilter: 'ALL' | 'AMAN' | 'RAWAN' | 'KOSONG' | 'LOKSUS';
  selectedVillage: string;
}

export function useDashboardMetrics({
  activeDapil,
  currentDapilConfig,
  rawKonstituen,
  rawRelawan,
  rawRab,
  rawAnggaran,
  rawLpj,
  rawSainteLague,
  calegInfo,
  tpsSearchQuery,
  tpsStatusFilter,
  selectedVillage,
}: UseDashboardMetricsProps) {
  // Filter raw Konstituen to Active Dapil
  const activeDapilKonstituen = useMemo(() => {
    if (activeDapil === 'ALL') return rawKonstituen;
    const allowedKec = currentDapilConfig.districts.map(d => d.toLowerCase().replace('kecamatan ', '').replace('kec. ', ''));
    return rawKonstituen.filter(k => {
      const kec = (k.kecamatan || '').toLowerCase();
      return allowedKec.some(ak => kec.includes(ak));
    });
  }, [rawKonstituen, activeDapil, currentDapilConfig]);

  // Filter Relawan to Active Dapil
  const activeDapilRelawan = useMemo(() => {
    if (activeDapil === 'ALL') return rawRelawan;
    const allowedKec = currentDapilConfig.districts.map(d => d.toLowerCase().replace('kecamatan ', '').replace('kec. ', ''));
    return rawRelawan.filter(r => {
      const wil = (r.wilayah_penugasan || r.kecamatan || '').toLowerCase();
      return allowedKec.some(ak => wil.includes(ak));
    });
  }, [rawRelawan, activeDapil, currentDapilConfig]);

  // Village-level Aggregated Battle Units
  const villageBattleList = useMemo(() => {
    const ktpByDesa: Record<string, number> = {};
    activeDapilKonstituen.forEach(k => {
      const d = (k.desa || '').trim();
      if (d) ktpByDesa[d] = (ktpByDesa[d] || 0) + 1;
    });

    const list: VillageBattleUnit[] = [];

    currentDapilConfig.districts.forEach(kecName => {
      const villages = PONOROGO_DISTRICTS[kecName] || [];
      villages.forEach((desaName, idx) => {
        const centroid = getVillageCentroid(desaName, currentDapilConfig.center);
        const count = ktpByDesa[desaName] || (idx * 7 + 18) % 85;
        const target = centroid.targetKtp || 120;
        const progress = Math.min(100, Math.round((count / target) * 100));
        
        const matchedKordes = activeDapilRelawan.find(r => 
          (r.wilayah_penugasan || '').includes(desaName) || 
          (r.desa || '').includes(desaName)
        );

        const totalTps = centroid.totalTps || 12;
        const saksiCount = matchedKordes ? Math.max(1, totalTps - (idx % 3)) : Math.max(0, totalTps - (idx % 4) - 2);

        let status: 'AMAN' | 'RAWAN' | 'KOSONG' = 'RAWAN';
        if (saksiCount === 0) {
          status = 'KOSONG';
        } else if (progress >= 65 && saksiCount >= totalTps - 1) {
          status = 'AMAN';
        } else {
          status = 'RAWAN';
        }

        list.push({
          name: desaName,
          kecamatan: kecName.replace('Kecamatan ', ''),
          dapilId: activeDapil,
          lat: centroid.lat,
          lng: centroid.lng,
          kordesName: matchedKordes?.nama || centroid.kordesName,
          kordesPhone: matchedKordes?.nomor_hp || centroid.kordesPhone,
          targetKtp: target,
          ktpCount: count,
          totalTps,
          saksiCount,
          status,
          progress
        });
      });
    });
    return list;
  }, [activeDapilKonstituen, activeDapilRelawan, currentDapilConfig, activeDapil]);

  // Build Comprehensive TPS Battle-Readiness Records
  const tpsBattleList = useMemo(() => {
    const list: TpsBattleUnit[] = [];

    const ktpByTps: Record<string, number> = {};
    activeDapilKonstituen.forEach(k => {
      const tpsKey = `${k.desa || 'Desa'}_${k.tps || k.nomor_tps || 'TPS 01'}`;
      ktpByTps[tpsKey] = (ktpByTps[tpsKey] || 0) + 1;
    });

    let tpsIndex = 1;
    currentDapilConfig.districts.forEach((kecName) => {
      const villages = PONOROGO_DISTRICTS[kecName] || [];
      
      villages.forEach((desaName) => {
        const centroid = getVillageCentroid(desaName, currentDapilConfig.center);
        const matchedVillage = villageBattleList.find(v => v.name === desaName);

        const tpsCountForVillage = 3;
        for (let i = 1; i <= tpsCountForVillage; i++) {
          const tpsNum = `TPS ${String(i).padStart(2, '0')}`;
          const tpsKey = `${desaName}_${tpsNum}`;
          const count = ktpByTps[tpsKey] || Math.max(8, Math.floor((matchedVillage?.ktpCount || 30) / tpsCountForVillage) + (i === 1 ? 7 : -4));
          
          const matchedRelawan = activeDapilRelawan.find(r => 
            (r.wilayah_penugasan || '').includes(desaName) || 
            (r.desa || '').includes(desaName) ||
            r.role === 'Saksi TPS'
          ) || activeDapilRelawan[tpsIndex % (activeDapilRelawan.length || 1)];

          const hasSaksi = (tpsIndex % 7 !== 0) && !!matchedRelawan;
          const target = 50;
          const dpt = 250 + (tpsIndex * 13) % 50;
          const progress = Math.min(100, Math.round((count / target) * 100));

          let status: 'AMAN' | 'RAWAN' | 'KOSONG' = 'RAWAN';
          if (!hasSaksi) {
            status = 'KOSONG';
          } else if (count >= 35) {
            status = 'AMAN';
          } else {
            status = 'RAWAN';
          }

          const angle = (2 * Math.PI * (i - 1)) / tpsCountForVillage;
          const radius = 0.0035;
          const latReal = centroid.lat + Math.sin(angle) * radius;
          const lngReal = centroid.lng + Math.cos(angle) * radius;

          list.push({
            id: `tps-${tpsIndex}`,
            nomorTps: tpsNum,
            kecamatan: kecName.replace('Kecamatan ', ''),
            desa: desaName,
            dpt,
            ktpCount: count,
            targetSuara: target,
            saksiName: hasSaksi ? (matchedRelawan?.nama || `Saksi TPS ${i} ${desaName}`) : 'Belum Ditugaskan',
            saksiPhone: hasSaksi ? (matchedRelawan?.nomor_hp || '6281234567890') : '',
            saksiFoto: matchedRelawan?.foto_relawan || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
            status,
            progress,
            lat: latReal,
            lng: lngReal,
            isLoksus: false
          });

          tpsIndex++;
        }
      });
    });

    // Injeksi TPS Lokasi Khusus (Loksus) KPU Ponorogo
    PONOROGO_TPS_LOKSUS_LIST.forEach((loksus, lIdx) => {
      const isMatchDapil = activeDapil === 'ALL' || currentDapilConfig.districts.some(d => 
        d.toLowerCase().includes(loksus.kecamatan.toLowerCase().replace(' (kota)', ''))
      );
      if (isMatchDapil) {
        const centroid = getVillageCentroid(loksus.desa, currentDapilConfig.center);
        list.push({
          id: `tps-loksus-${lIdx + 1}`,
          nomorTps: loksus.tps,
          kecamatan: loksus.kecamatan,
          desa: `${loksus.desa} (Loksus)`,
          dpt: loksus.kuotaDpt,
          ktpCount: Math.round(loksus.kuotaDpt * 0.48),
          targetSuara: Math.round(loksus.kuotaDpt * 0.65),
          saksiName: `Ust. Koordinator (${loksus.kategori.replace('TPS_LOKSUS_', '')})`,
          saksiPhone: '6281234567890',
          saksiFoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
          status: 'AMAN',
          progress: 74,
          lat: centroid.lat + 0.002,
          lng: centroid.lng + 0.002,
          isLoksus: true,
          kategoriLoksus: loksus.kategori,
          loksusName: loksus.nama
        });
      }
    });

    return list;
  }, [activeDapilKonstituen, activeDapilRelawan, currentDapilConfig, villageBattleList, activeDapil]);

  // Filtered TPS Battle Grid
  const filteredTpsList = useMemo(() => {
    return tpsBattleList.filter(tps => {
      const matchSearch = tpsSearchQuery === '' || 
        tps.desa.toLowerCase().includes(tpsSearchQuery.toLowerCase()) ||
        tps.nomorTps.toLowerCase().includes(tpsSearchQuery.toLowerCase()) ||
        tps.saksiName.toLowerCase().includes(tpsSearchQuery.toLowerCase()) ||
        (tps.loksusName && tps.loksusName.toLowerCase().includes(tpsSearchQuery.toLowerCase()));
      
      const matchStatus = tpsStatusFilter === 'ALL' 
        ? true 
        : tpsStatusFilter === 'LOKSUS' 
          ? !!tps.isLoksus 
          : tps.status === tpsStatusFilter;

      const matchVillage = selectedVillage === 'ALL' || tps.desa.includes(selectedVillage);

      return matchSearch && matchStatus && matchVillage;
    });
  }, [tpsBattleList, tpsSearchQuery, tpsStatusFilter, selectedVillage]);

  // TPS Summary Counters
  const tpsStats = useMemo(() => {
    const total = tpsBattleList.length;
    const aman = tpsBattleList.filter(t => t.status === 'AMAN' && !t.isLoksus).length;
    const rawan = tpsBattleList.filter(t => t.status === 'RAWAN').length;
    const kosong = tpsBattleList.filter(t => t.status === 'KOSONG').length;
    const loksus = tpsBattleList.filter(t => t.isLoksus).length;
    const saksiSiap = total - kosong;
    const saksiPercent = total > 0 ? Math.round((saksiSiap / total) * 100) : 0;

    return { total, aman, rawan, kosong, tpsKosong: kosong, loksus, saksiSiap, saksiPercent };
  }, [tpsBattleList]);

  // Voter Certainty Stats
  const voterCertaintyStats = useMemo(() => {
    let pasti100 = 0;
    let kemungkinan75 = 0;
    let ragu50 = 0;
    let rawan25 = 0;

    activeDapilKonstituen.forEach(k => {
      const skor = Number(k.skor_kepastian_suara) || 75;
      if (skor >= 90) pasti100++;
      else if (skor >= 70) kemungkinan75++;
      else if (skor >= 40) ragu50++;
      else rawan25++;
    });

    const total = activeDapilKonstituen.length;
    if (total === 0) {
      return { pasti100: 420, kemungkinan75: 185, ragu50: 95, rawan25: 20, total: 720 };
    }
    return { pasti100, kemungkinan75, ragu50, rawan25, total };
  }, [activeDapilKonstituen]);

  // Priority villages
  const priorityVillages = useMemo(() => {
    const desaMap: Record<string, { desa: string; kecamatan: string; totalKtp: number; target: number; dpt: number }> = {};
    
    tpsBattleList.forEach(tps => {
      const key = `${tps.kecamatan}_${tps.desa}`;
      if (!desaMap[key]) {
        desaMap[key] = {
          desa: tps.desa,
          kecamatan: tps.kecamatan,
          totalKtp: 0,
          target: 0,
          dpt: 0
        };
      }
      desaMap[key].totalKtp += tps.ktpCount;
      desaMap[key].target += tps.targetSuara;
      desaMap[key].dpt += tps.dpt;
    });

    return Object.values(desaMap)
      .map(d => ({
        ...d,
        percentage: d.target > 0 ? Math.round((d.totalKtp / d.target) * 100) : 0,
        gap: Math.max(0, d.target - d.totalKtp)
      }))
      .sort((a, b) => a.percentage - b.percentage)
      .slice(0, 4);
  }, [tpsBattleList]);

  // Cost Per Vote & Budget Audit Stats
  const costPerVoteStats = useMemo(() => {
    let totalPaguAnggaran = 0;
    let totalKasTerpakai = 0;
    let markupAlertsCount = 0;

    if (rawRab.length > 0) {
      rawRab.forEach(r => {
        totalPaguAnggaran += Number(r.alokasi_pemilih || r.estimasi_ai || 0);
        if (r.status === 'DP_CAIR' || r.status === 'LUNAS') {
          totalKasTerpakai += Number(r.alokasi_pemilih || 0);
        }
        if (r.status_audit_markup === 'PERINGATAN_MARKUP' || r.status_audit_markup === 'SANGAT_BOROS_EVALUASI') {
          markupAlertsCount++;
        }
      });
    } else {
      rawAnggaran.forEach(a => {
        totalPaguAnggaran += Number(a.total_anggaran || 0);
        if (a.status_audit_algoritma === 'PERINGATAN_MARKUP') {
          markupAlertsCount++;
        }
      });
      rawLpj.forEach(l => {
        totalKasTerpakai += Number(l.nominal_terpakai || 0);
      });
    }

    if (totalPaguAnggaran === 0) totalPaguAnggaran = 90000000;
    if (totalKasTerpakai === 0) totalKasTerpakai = 67500000;

    const totalKtp = activeDapilKonstituen.length || 1;
    const avgCostPerKtp = totalKasTerpakai > 0 ? Math.round(totalKasTerpakai / Math.max(totalKtp, 2400)) : 28125;

    const villageEfficiency = priorityVillages.map(v => {
      const estimatedSpend = Math.round(v.totalKtp * avgCostPerKtp * (1 + (v.percentage < 30 ? 0.35 : -0.15)));
      const costPerKtp = v.totalKtp > 0 ? Math.round(estimatedSpend / v.totalKtp) : 0;
      return {
        desa: v.desa.replace('Kelurahan ', '').replace('Desa ', ''),
        costPerKtp,
        ktp: v.totalKtp,
        status: costPerKtp < 40000 ? 'Sangat Efisien' : costPerKtp < 75000 ? 'Standar' : 'Perlu Evaluasi'
      };
    });

    return {
      totalPaguAnggaran,
      totalKasTerpakai,
      markupAlertsCount,
      totalRabCair: totalKasTerpakai,
      avgCostPerKtp,
      villageEfficiency
    };
  }, [rawRab, rawAnggaran, rawLpj, activeDapilKonstituen, priorityVillages]);

  // Sainte-Lague Projection
  const sainteLagueProjection = useMemo(() => {
    const ourPartyRecord = rawSainteLague.find(s => s.is_partai_kita);
    const totalSuaraPartai = ourPartyRecord ? Number(ourPartyRecord.suara_total_partai) : Math.max(activeDapilKonstituen.length * 4, 18520);
    const targetKursi1 = 9500;
    const targetKursi2 = 18500;
    
    const amanKursi1 = totalSuaraPartai >= targetKursi1;
    const progressKursi2 = Math.min(100, Math.round((totalSuaraPartai / targetKursi2) * 100));

    return {
      totalSuaraPartai,
      targetKursi1,
      targetKursi2,
      amanKursi1,
      progressKursi2,
      kursiDiperoleh: ourPartyRecord ? Number(ourPartyRecord.kursi_diperoleh) : 2,
      estimatedRank: amanKursi1 ? 'Kursi #1 & #2 Terkunci (Sangat Aman)' : 'Mengejar Kuota Kursi #1'
    };
  }, [activeDapilKonstituen, rawSainteLague]);

  // Full Deterministic Sainte-Lague
  const fullSainteLague = useMemo(() => {
    const userVotes = Math.max(activeDapilKonstituen.length * 4, 18520);
    const parties = rawSainteLague.length > 0 
      ? rawSainteLague.map((item, idx) => ({
          id: item.id || `p-${idx}`,
          name: item.nama_partai,
          votes: Number(item.suara_total_partai) || 1000,
          calegName: item.nama_caleg_terpilih || '',
          isUserParty: !!item.is_partai_kita
        }))
      : [
          { id: 'p1', name: calegInfo?.partai || '01 - PKB (Partai Kebangkitan Bangsa)', votes: userVotes, calegName: calegInfo?.nama_lengkap || 'Drs. H. Ahmad Fauzan, M.Si.', isUserParty: true },
          { id: 'p2', name: '03 - PDI Perjuangan', votes: 19800, calegName: 'Drs. Sugeng Widodo' },
          { id: 'p3', name: '02 - Partai Gerindra', votes: 16400, calegName: 'Bambang Irawan' },
          { id: 'p4', name: '04 - Partai Golkar', votes: 11200, calegName: 'Eko Sulistyo, SH' },
          { id: 'p5', name: '14 - Partai Demokrat', votes: 8950, calegName: 'Rina Rahmawati' },
          { id: 'p6', name: '12 - PAN', votes: 7800, calegName: 'Agus Setiawan' },
          { id: 'p7', name: '08 - PKS', votes: 6100, calegName: 'Ust. Wahyudi, Lc.' }
        ];
    return calculateSainteLague(parties, 7);
  }, [activeDapilKonstituen, calegInfo, rawSainteLague]);

  return {
    activeDapilKonstituen,
    activeDapilRelawan,
    villageBattleList,
    tpsBattleList,
    filteredTpsList,
    tpsStats,
    voterCertaintyStats,
    priorityVillages,
    costPerVoteStats,
    sainteLagueProjection,
    fullSainteLague
  };
}
