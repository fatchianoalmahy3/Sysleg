// Ponorogo Village/Kelurahan Centroid Coordinates for Radar Map
// Provides realistic distribution of TPS points rather than random mathematical scatter.

export interface VillageCoordinate {
  name: string;
  lat: number;
  lng: number;
  kordesName: string;
  kordesPhone: string;
  totalTps: number;
  targetKtp: number;
}

export const PONOROGO_VILLAGES_COORDINATES: Record<string, VillageCoordinate> = {
  // DAPIL 1 - Ponorogo Kota
  'Banyudono': { name: 'Banyudono', lat: -7.8711, lng: 111.4645, kordesName: 'Budi Santoso', kordesPhone: '08123456001', totalTps: 15, targetKtp: 350 },
  'Bangunsari': { name: 'Bangunsari', lat: -7.8643, lng: 111.4651, kordesName: 'Siti Aminah', kordesPhone: '08123456002', totalTps: 12, targetKtp: 300 },
  'Surodikraman': { name: 'Surodikraman', lat: -7.8690, lng: 111.4720, kordesName: 'Agus Purnomo', kordesPhone: '08123456003', totalTps: 10, targetKtp: 250 },
  'Nologaten': { name: 'Nologaten', lat: -7.8655, lng: 111.4782, kordesName: 'Rini Setyawati', kordesPhone: '08123456004', totalTps: 14, targetKtp: 400 },
  'Kepatihan': { name: 'Kepatihan', lat: -7.8621, lng: 111.4699, kordesName: 'Joko Widodo', kordesPhone: '08123456005', totalTps: 11, targetKtp: 280 },
  'Mangkujayan': { name: 'Mangkujayan', lat: -7.8732, lng: 111.4695, kordesName: 'Eko Prasetyo', kordesPhone: '08123456006', totalTps: 13, targetKtp: 320 },
  'Broto': { name: 'Broto', lat: -7.8755, lng: 111.4710, kordesName: 'Sugeng Haryadi', kordesPhone: '08123456007', totalTps: 9, targetKtp: 220 },
  'Kertosari': { name: 'Kertosari', lat: -7.8751, lng: 111.4855, kordesName: 'Slamet Rahardjo', kordesPhone: '08123456008', totalTps: 18, targetKtp: 500 },
  'Cokromenggalan': { name: 'Cokromenggalan', lat: -7.8622, lng: 111.4852, kordesName: 'Sri Wahyuni', kordesPhone: '08123456009', totalTps: 12, targetKtp: 300 },
  'Keniten': { name: 'Keniten', lat: -7.8575, lng: 111.4721, kordesName: 'Hendro', kordesPhone: '08123456010', totalTps: 15, targetKtp: 380 },
  
  // DAPIL 1 - Babadan
  'Babadan': { name: 'Babadan', lat: -7.8321, lng: 111.4789, kordesName: 'M. Yusuf', kordesPhone: '08123456011', totalTps: 16, targetKtp: 420 },
  'Purwosari': { name: 'Purwosari', lat: -7.8415, lng: 111.4852, kordesName: 'Ahmad Fauzi', kordesPhone: '08123456012', totalTps: 10, targetKtp: 250 },
  'Lembah': { name: 'Lembah', lat: -7.8485, lng: 111.4921, kordesName: 'Nurul Huda', kordesPhone: '08123456013', totalTps: 8, targetKtp: 200 },
  'Sukosari': { name: 'Sukosari', lat: -7.8512, lng: 111.4805, kordesName: 'Yanto', kordesPhone: '08123456014', totalTps: 11, targetKtp: 270 },
  'Pondok': { name: 'Pondok', lat: -7.8385, lng: 111.4720, kordesName: 'Supriyanto', kordesPhone: '08123456015', totalTps: 13, targetKtp: 310 },
  'Cekok': { name: 'Cekok', lat: -7.8391, lng: 111.4650, kordesName: 'Bambang', kordesPhone: '08123456016', totalTps: 12, targetKtp: 290 },
  'Japan': { name: 'Japan', lat: -7.8455, lng: 111.4580, kordesName: 'Wahyu', kordesPhone: '08123456017', totalTps: 14, targetKtp: 360 },
};

/**
 * Fallback to generate a realistic coordinate near the district center if the village is not mapped
 */
export function getVillageCentroid(villageName: string, districtCenter: [number, number]): VillageCoordinate {
  const match = PONOROGO_VILLAGES_COORDINATES[villageName];
  if (match) return match;

  // Generate deterministic jitter based on village string hash
  let hash = 0;
  for (let i = 0; i < villageName.length; i++) {
    hash = villageName.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const jitterLat = (Math.sin(hash) * 0.02) - 0.01;
  const jitterLng = (Math.cos(hash) * 0.02) - 0.01;

  return {
    name: villageName,
    lat: districtCenter[0] + jitterLat,
    lng: districtCenter[1] + jitterLng,
    kordesName: 'Belum Ditunjuk',
    kordesPhone: '',
    totalTps: 10 + (Math.abs(hash) % 8),
    targetKtp: 200 + (Math.abs(hash) % 150)
  };
}
