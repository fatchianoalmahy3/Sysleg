/**
 * Election & Budget Mathematical Engine (Deterministic, Zero-Cost, Pure TypeScript)
 * Handles:
 * 1. Sainte-Laguë Seat Distribution (Pembagi 1, 3, 5, 7, 9, ...)
 * 2. Cost-per-Vote (CPV) Efficiency Calculation
 * 3. Market Price Mark-up Auditing
 * 4. Region Priority Quadrants (Basis, Battleground, Rawan)
 */

export interface PartyVoteData {
  id: string;
  name: string;
  votes: number;
  calegName?: string;
  isUserParty?: boolean;
}

export interface SainteLagueSeatWinner {
  seatNumber: number;
  partyId: string;
  partyName: string;
  quotient: number;
  divisor: number;
  calegName?: string;
  isUserParty: boolean;
}

export interface SainteLagueResult {
  totalSeats: number;
  totalVotes: number;
  seatWinners: SainteLagueSeatWinner[];
  partySeats: Record<string, { name: string; seats: number; isUserParty: boolean }>;
  userPartyStats: {
    totalSeatsWon: number;
    lastWonSeatNumber?: number;
    safetyMarginVotes: number; // Gap to lose or gain next seat
    nextSeatNeedsVotes: number; // How many more votes needed to win 1 extra seat
    status: 'LOLOS_KURSI' | 'KURSI_TERAKHIR_RAWAN' | 'BELUM_DAPAT_KURSI';
  };
}

/**
 * Calculates official Sainte-Laguë parliamentary seat allocation.
 * Uses odd divisors: 1, 3, 5, 7, 9, 11, ...
 */
export function calculateSainteLague(parties: PartyVoteData[], totalSeats: number): SainteLagueResult {
  const partySeats: Record<string, { name: string; seats: number; isUserParty: boolean }> = {};
  parties.forEach(p => {
    partySeats[p.id] = { name: p.name, seats: 0, isUserParty: !!p.isUserParty };
  });

  const seatWinners: SainteLagueSeatWinner[] = [];
  const totalVotes = parties.reduce((sum, p) => sum + (p.votes || 0), 0);

  // Allocate seats 1 by 1
  for (let seat = 1; seat <= totalSeats; seat++) {
    let bestParty: PartyVoteData | null = null;
    let highestQuotient = -1;
    let winningDivisor = 1;

    for (const party of parties) {
      const currentSeats = partySeats[party.id].seats;
      const divisor = (currentSeats * 2) + 1; // 1, 3, 5, 7, ...
      const quotient = (party.votes || 0) / divisor;

      if (quotient > highestQuotient) {
        highestQuotient = quotient;
        bestParty = party;
        winningDivisor = divisor;
      }
    }

    if (bestParty && highestQuotient > 0) {
      partySeats[bestParty.id].seats += 1;
      seatWinners.push({
        seatNumber: seat,
        partyId: bestParty.id,
        partyName: bestParty.name,
        quotient: Math.round(highestQuotient),
        divisor: winningDivisor,
        calegName: bestParty.calegName,
        isUserParty: !!bestParty.isUserParty
      });
    }
  }

  // Calculate safety margin for user party
  const userParty = parties.find(p => p.isUserParty) || parties[0];
  const userPartyId = userParty ? userParty.id : '';
  const userPartySeats = userPartyId ? partySeats[userPartyId]?.seats || 0 : 0;

  // Find last won seat
  const userWonSeats = seatWinners.filter(w => w.partyId === userPartyId);
  const lastWonSeat = userWonSeats[userWonSeats.length - 1];

  let safetyMarginVotes = 0;
  let nextSeatNeedsVotes = 0;
  let status: 'LOLOS_KURSI' | 'KURSI_TERAKHIR_RAWAN' | 'BELUM_DAPAT_KURSI' = 'BELUM_DAPAT_KURSI';

  if (userPartySeats > 0 && lastWonSeat) {
    // Find closest competitor that barely missed a seat
    const nonUserAllocations = seatWinners.filter(w => w.partyId !== userPartyId);
    const minQuotientToBeat = nonUserAllocations.length > 0 
      ? Math.min(...nonUserAllocations.map(w => w.quotient)) 
      : 0;

    safetyMarginVotes = Math.max(0, Math.round((lastWonSeat.quotient - minQuotientToBeat) * lastWonSeat.divisor));

    if (lastWonSeat.seatNumber === totalSeats || safetyMarginVotes < 500) {
      status = 'KURSI_TERAKHIR_RAWAN';
    } else {
      status = 'LOLOS_KURSI';
    }
  } else {
    status = 'BELUM_DAPAT_KURSI';
    // Calculate votes needed to beat the lowest winning quotient
    const lowestWinningQuotient = seatWinners.length > 0 ? seatWinners[seatWinners.length - 1].quotient : 0;
    const currentVotes = userParty?.votes || 0;
    nextSeatNeedsVotes = Math.max(0, Math.round(lowestWinningQuotient + 1 - currentVotes));
  }

  return {
    totalSeats,
    totalVotes,
    seatWinners,
    partySeats,
    userPartyStats: {
      totalSeatsWon: userPartySeats,
      lastWonSeatNumber: lastWonSeat?.seatNumber,
      safetyMarginVotes,
      nextSeatNeedsVotes,
      status
    }
  };
}

/**
 * Cost-Per-Vote (CPV) calculator and status classifier.
 */
export interface CPVResult {
  cpv: number;
  status: 'SANGAT_EFISIEN' | 'MODERAT' | 'BOROS' | 'DATA_BELUM_LENGKAP';
  badgeColor: string;
  recommendation: string;
}

export function calculateCostPerVote(totalCost: number, targetOrLockedVotes: number): CPVResult {
  if (!targetOrLockedVotes || targetOrLockedVotes <= 0) {
    return {
      cpv: 0,
      status: 'DATA_BELUM_LENGKAP',
      badgeColor: 'bg-slate-100 text-slate-600',
      recommendation: 'Tetapkan target suara atau catat pemilih terkunci terlebih dahulu.'
    };
  }

  const cpv = Math.round(totalCost / targetOrLockedVotes);

  if (cpv <= 50000) {
    return {
      cpv,
      status: 'SANGAT_EFISIEN',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      recommendation: 'Biaya sangat efisien. Model pergerakan relawan door-to-door organik sangat efektif.'
    };
  } else if (cpv <= 150000) {
    return {
      cpv,
      status: 'MODERAT',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
      recommendation: 'Biaya dalam batas toleransi wajar kampanye proporsional.'
    };
  } else {
    return {
      cpv,
      status: 'BOROS',
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
      recommendation: 'Peringatan: Pengeluaran melebihi rasio suara. Evaluasi pos biaya operasional atau alihkan ke wilayah lain.'
    };
  }
}

/**
 * Audit proposed expense item against local market price range.
 */
export interface ExpenseAuditResult {
  status: 'WAJAR' | 'PERINGATAN_MARKUP' | 'TERLALU_RENDAH';
  priceDifference: number;
  wasteAmount: number;
  badgeClass: string;
  notes: string;
}

export function auditExpenseItem(
  proposedPrice: number, 
  volume: number, 
  standardMin: number, 
  standardMax: number
): ExpenseAuditResult {
  if (!proposedPrice || proposedPrice <= 0 || !standardMax || standardMax <= 0) {
    return {
      status: 'WAJAR',
      priceDifference: 0,
      wasteAmount: 0,
      badgeClass: 'bg-slate-100 text-slate-700',
      notes: 'Belum ada standar harga daerah untuk item ini.'
    };
  }

  if (proposedPrice > standardMax) {
    const diff = proposedPrice - standardMax;
    const waste = diff * (volume || 1);
    return {
      status: 'PERINGATAN_MARKUP',
      priceDifference: diff,
      wasteAmount: waste,
      badgeClass: 'bg-rose-100 text-rose-800 border-rose-300 font-bold',
      notes: `Harga melebihi standar wajar daerah (Maks Rp ${standardMax.toLocaleString('id-ID')}). Potensi inefisiensi Rp ${waste.toLocaleString('id-ID')}.`
    };
  } else if (proposedPrice < standardMin * 0.7) {
    return {
      status: 'TERLALU_RENDAH',
      priceDifference: proposedPrice - standardMin,
      wasteAmount: 0,
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
      notes: 'Harga di bawah standar wajar. Pastikan spesifikasi barang dan kualitas tidak fiktif.'
    };
  }

  return {
    status: 'WAJAR',
    priceDifference: 0,
    wasteAmount: 0,
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    notes: 'Harga sesuai dengan standar pasar wajar wilayah.'
  };
}

/**
 * Region Priority Classification
 */
export function classifyRegionPriority(dpt: number, targetVotes: number, lockedVotes: number): {
  status: 'BASIS_HIJAU' | 'BATTLEGROUND_KUNING' | 'RAWAN_MERAH';
  progressPercent: number;
  badgeClass: string;
  actionGuidance: string;
} {
  const target = targetVotes || 1;
  const progressPercent = Math.min(100, Math.round((lockedVotes / target) * 100));

  if (progressPercent >= 80) {
    return {
      status: 'BASIS_HIJAU',
      progressPercent,
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      actionGuidance: 'Basis kuat. Pertahankan loyalitas & siapkan saksi militan untuk kawal C1.'
    };
  } else if (progressPercent >= 40) {
    return {
      status: 'BATTLEGROUND_KUNING',
      progressPercent,
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
      actionGuidance: 'Medan tempur penentu. Kerahkan 70% tim gerilya door-to-door untuk tutup gap suara.'
    };
  } else {
    return {
      status: 'RAWAN_MERAH',
      progressPercent,
      badgeClass: 'bg-rose-100 text-rose-800 border-rose-300',
      actionGuidance: 'Penetrasi rendah. Dekati tokoh kunci atau alihkan fokus jika wilayah tidak responsif.'
    };
  }
}
