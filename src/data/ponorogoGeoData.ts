export interface DapilGeoInfo {
  id: string;
  name: string;
  shortName: string;
  dapilNumber: number;
  kursi: number;
  tpsEstimasi: number;
  targetSuaraDapil: number;
  color: string;
  borderColor: string;
  fillColor: string;
  districts: string[];
  center: [number, number];
  polygon: [number, number][];
}

export interface DistrictGeoInfo {
  id: string;
  name: string;
  dapilId: string;
  dapilNumber: number;
  center: [number, number];
  polygon: [number, number][];
  tps: number;
  targetKtp: number;
}

// 6 Official Dapil Polygons of Kabupaten Ponorogo
export const PONOROGO_DAPIL_GEO: DapilGeoInfo[] = [
  {
    id: 'DAPIL_1',
    name: 'Dapil Ponorogo 1 (Kota & Babadan)',
    shortName: 'Dapil 1',
    dapilNumber: 1,
    kursi: 9,
    tpsEstimasi: 560,
    targetSuaraDapil: 3500,
    color: '#4f46e5', // Indigo
    borderColor: '#3730a3',
    fillColor: 'rgba(79, 70, 229, 0.45)',
    districts: ['Kecamatan Ponorogo (Kota)', 'Kecamatan Babadan'],
    center: [-7.8480, 111.4680],
    polygon: [
      [-7.8100, 111.4420],
      [-7.8050, 111.4850],
      [-7.8380, 111.5020],
      [-7.8820, 111.4900],
      [-7.8920, 111.4450],
      [-7.8650, 111.4280],
      [-7.8280, 111.4250],
      [-7.8100, 111.4420]
    ]
  },
  {
    id: 'DAPIL_2',
    name: 'Dapil Ponorogo 2 (Jenangan, Siman, Jetis, Mlarak)',
    shortName: 'Dapil 2',
    dapilNumber: 2,
    kursi: 8,
    tpsEstimasi: 520,
    targetSuaraDapil: 3200,
    color: '#0891b2', // Cyan / Teal
    borderColor: '#0e7490',
    fillColor: 'rgba(8, 145, 178, 0.45)',
    districts: ['Kecamatan Jenangan', 'Kecamatan Siman', 'Kecamatan Jetis', 'Kecamatan Mlarak'],
    center: [-7.8820, 111.5200],
    polygon: [
      [-7.8050, 111.4850],
      [-7.7950, 111.5550],
      [-7.8450, 111.5750],
      [-7.9150, 111.5600],
      [-7.9350, 111.5150],
      [-7.8820, 111.4900],
      [-7.8380, 111.5020],
      [-7.8050, 111.4850]
    ]
  },
  {
    id: 'DAPIL_3',
    name: 'Dapil Ponorogo 3 (Pulung, Pudak, Sooko, Sawoo)',
    shortName: 'Dapil 3',
    dapilNumber: 3,
    kursi: 8,
    tpsEstimasi: 480,
    targetSuaraDapil: 3100,
    color: '#059669', // Emerald
    borderColor: '#047857',
    fillColor: 'rgba(5, 150, 105, 0.45)',
    districts: ['Kecamatan Pulung', 'Kecamatan Pudak', 'Kecamatan Sooko', 'Kecamatan Sawoo'],
    center: [-7.8850, 111.6400],
    polygon: [
      [-7.7950, 111.5550],
      [-7.7750, 111.6850],
      [-7.8350, 111.7450],
      [-7.9250, 111.7200],
      [-7.9850, 111.6350],
      [-7.9450, 111.5750],
      [-7.8450, 111.5750],
      [-7.7950, 111.5550]
    ]
  },
  {
    id: 'DAPIL_4',
    name: 'Dapil Ponorogo 4 (Ngrayun, Slahung, Bungkal, Sambit)',
    shortName: 'Dapil 4',
    dapilNumber: 4,
    kursi: 9,
    tpsEstimasi: 580,
    targetSuaraDapil: 3600,
    color: '#d97706', // Amber / Orange
    borderColor: '#b45309',
    fillColor: 'rgba(217, 119, 6, 0.45)',
    districts: ['Kecamatan Ngrayun', 'Kecamatan Slahung', 'Kecamatan Bungkal', 'Kecamatan Sambit'],
    center: [-8.0350, 111.4750],
    polygon: [
      [-7.9350, 111.5150],
      [-7.9450, 111.5750],
      [-7.9850, 111.6350],
      [-8.0650, 111.5900],
      [-8.1750, 111.4900],
      [-8.1450, 111.4100],
      [-8.0150, 111.3950],
      [-7.9550, 111.4450],
      [-7.9350, 111.5150]
    ]
  },
  {
    id: 'DAPIL_5',
    name: 'Dapil Ponorogo 5 (Balong, Badegan, Jambon)',
    shortName: 'Dapil 5',
    dapilNumber: 5,
    kursi: 6,
    tpsEstimasi: 390,
    targetSuaraDapil: 2600,
    color: '#e11d48', // Rose / Red
    borderColor: '#be123c',
    fillColor: 'rgba(225, 29, 72, 0.45)',
    districts: ['Kecamatan Balong', 'Kecamatan Badegan', 'Kecamatan Jambon'],
    center: [-7.9250, 111.3650],
    polygon: [
      [-7.8650, 111.3850],
      [-7.8920, 111.4450],
      [-7.9550, 111.4450],
      [-8.0150, 111.3950],
      [-7.9950, 111.2850],
      [-7.9050, 111.2650],
      [-7.8650, 111.3450],
      [-7.8650, 111.3850]
    ]
  },
  {
    id: 'DAPIL_6',
    name: 'Dapil Ponorogo 6 (Kauman, Sampung, Sukorejo)',
    shortName: 'Dapil 6',
    dapilNumber: 6,
    kursi: 5,
    tpsEstimasi: 350,
    targetSuaraDapil: 2500,
    color: '#7c3aed', // Violet / Purple
    borderColor: '#6d28d9',
    fillColor: 'rgba(124, 58, 237, 0.45)',
    districts: ['Kecamatan Kauman (Sumoroto)', 'Kecamatan Sampung', 'Kecamatan Sukorejo'],
    center: [-7.8250, 111.3750],
    polygon: [
      [-7.7650, 111.3450],
      [-7.7750, 111.4250],
      [-7.8280, 111.4250],
      [-7.8650, 111.4280],
      [-7.8650, 111.3450],
      [-7.8250, 111.2850],
      [-7.7650, 111.3450]
    ]
  }
];

// District-level centroids & coordinates for 21 districts of Ponorogo
export const PONOROGO_DISTRICTS_GEO: DistrictGeoInfo[] = [
  // DAPIL 1
  {
    id: 'kec_ponorogo',
    name: 'Kecamatan Ponorogo (Kota)',
    dapilId: 'DAPIL_1',
    dapilNumber: 1,
    center: [-7.8687, 111.4623],
    tps: 280,
    targetKtp: 1800,
    polygon: [
      [-7.8500, 111.4450],
      [-7.8480, 111.4850],
      [-7.8850, 111.4850],
      [-7.8880, 111.4450],
      [-7.8500, 111.4450]
    ]
  },
  {
    id: 'kec_babadan',
    name: 'Kecamatan Babadan',
    dapilId: 'DAPIL_1',
    dapilNumber: 1,
    center: [-7.8180, 111.4650],
    tps: 280,
    targetKtp: 1700,
    polygon: [
      [-7.8050, 111.4420],
      [-7.8050, 111.4900],
      [-7.8480, 111.4850],
      [-7.8500, 111.4420],
      [-7.8050, 111.4420]
    ]
  },

  // DAPIL 2
  {
    id: 'kec_jenangan',
    name: 'Kecamatan Jenangan',
    dapilId: 'DAPIL_2',
    dapilNumber: 2,
    center: [-7.8280, 111.5300],
    tps: 150,
    targetKtp: 900,
    polygon: [
      [-7.8050, 111.4900],
      [-7.7950, 111.5600],
      [-7.8550, 111.5600],
      [-7.8500, 111.4900],
      [-7.8050, 111.4900]
    ]
  },
  {
    id: 'kec_siman',
    name: 'Kecamatan Siman',
    dapilId: 'DAPIL_2',
    dapilNumber: 2,
    center: [-7.8850, 111.5050],
    tps: 130,
    targetKtp: 800,
    polygon: [
      [-7.8550, 111.4900],
      [-7.8550, 111.5400],
      [-7.9050, 111.5400],
      [-7.9000, 111.4900],
      [-7.8550, 111.4900]
    ]
  },
  {
    id: 'kec_jetis',
    name: 'Kecamatan Jetis',
    dapilId: 'DAPIL_2',
    dapilNumber: 2,
    center: [-7.9250, 111.5150],
    tps: 120,
    targetKtp: 750,
    polygon: [
      [-7.9000, 111.4900],
      [-7.9050, 111.5400],
      [-7.9450, 111.5400],
      [-7.9400, 111.4900],
      [-7.9000, 111.4900]
    ]
  },
  {
    id: 'kec_mlarak',
    name: 'Kecamatan Mlarak',
    dapilId: 'DAPIL_2',
    dapilNumber: 2,
    center: [-7.8950, 111.5550],
    tps: 120,
    targetKtp: 750,
    polygon: [
      [-7.8550, 111.5400],
      [-7.8550, 111.5800],
      [-7.9350, 111.5800],
      [-7.9350, 111.5400],
      [-7.8550, 111.5400]
    ]
  },

  // DAPIL 3
  {
    id: 'kec_pulung',
    name: 'Kecamatan Pulung',
    dapilId: 'DAPIL_3',
    dapilNumber: 3,
    center: [-7.8680, 111.6150],
    tps: 160,
    targetKtp: 1100,
    polygon: [
      [-7.8150, 111.5800],
      [-7.8050, 111.6600],
      [-7.9050, 111.6600],
      [-7.9050, 111.5800],
      [-7.8150, 111.5800]
    ]
  },
  {
    id: 'kec_pudak',
    name: 'Kecamatan Pudak',
    dapilId: 'DAPIL_3',
    dapilNumber: 3,
    center: [-7.8120, 111.6950],
    tps: 60,
    targetKtp: 450,
    polygon: [
      [-7.7750, 111.6600],
      [-7.7750, 111.7450],
      [-7.8550, 111.7450],
      [-7.8550, 111.6600],
      [-7.7750, 111.6600]
    ]
  },
  {
    id: 'kec_sooko',
    name: 'Kecamatan Sooko',
    dapilId: 'DAPIL_3',
    dapilNumber: 3,
    center: [-7.9150, 111.6850],
    tps: 80,
    targetKtp: 550,
    polygon: [
      [-7.8550, 111.6600],
      [-7.8550, 111.7450],
      [-7.9450, 111.7200],
      [-7.9450, 111.6600],
      [-7.8550, 111.6600]
    ]
  },
  {
    id: 'kec_sawoo',
    name: 'Kecamatan Sawoo',
    dapilId: 'DAPIL_3',
    dapilNumber: 3,
    center: [-7.9450, 111.6250],
    tps: 180,
    targetKtp: 1000,
    polygon: [
      [-7.9050, 111.5800],
      [-7.9050, 111.6600],
      [-7.9850, 111.6350],
      [-7.9750, 111.5800],
      [-7.9050, 111.5800]
    ]
  },

  // DAPIL 4
  {
    id: 'kec_sambit',
    name: 'Kecamatan Sambit',
    dapilId: 'DAPIL_4',
    dapilNumber: 4,
    center: [-7.9650, 111.5350],
    tps: 130,
    targetKtp: 850,
    polygon: [
      [-7.9350, 111.5050],
      [-7.9350, 111.5750],
      [-7.9950, 111.5750],
      [-7.9950, 111.5050],
      [-7.9350, 111.5050]
    ]
  },
  {
    id: 'kec_bungkal',
    name: 'Kecamatan Bungkal',
    dapilId: 'DAPIL_4',
    dapilNumber: 4,
    center: [-7.9850, 111.4750],
    tps: 120,
    targetKtp: 800,
    polygon: [
      [-7.9550, 111.4450],
      [-7.9550, 111.5050],
      [-8.0250, 111.5050],
      [-8.0250, 111.4450],
      [-7.9550, 111.4450]
    ]
  },
  {
    id: 'kec_slahung',
    name: 'Kecamatan Slahung',
    dapilId: 'DAPIL_4',
    dapilNumber: 4,
    center: [-8.0250, 111.4250],
    tps: 150,
    targetKtp: 950,
    polygon: [
      [-7.9850, 111.3950],
      [-7.9850, 111.4650],
      [-8.0850, 111.4650],
      [-8.0850, 111.3950],
      [-7.9850, 111.3950]
    ]
  },
  {
    id: 'kec_ngrayun',
    name: 'Kecamatan Ngrayun',
    dapilId: 'DAPIL_4',
    dapilNumber: 4,
    center: [-8.1150, 111.4850],
    tps: 180,
    targetKtp: 1000,
    polygon: [
      [-8.0450, 111.4350],
      [-8.0450, 111.5850],
      [-8.1750, 111.5150],
      [-8.1550, 111.4150],
      [-8.0450, 111.4350]
    ]
  },

  // DAPIL 5
  {
    id: 'kec_balong',
    name: 'Kecamatan Balong',
    dapilId: 'DAPIL_5',
    dapilNumber: 5,
    center: [-7.9450, 111.4150],
    tps: 160,
    targetKtp: 1000,
    polygon: [
      [-7.9050, 111.3850],
      [-7.9050, 111.4450],
      [-7.9850, 111.4450],
      [-7.9850, 111.3850],
      [-7.9050, 111.3850]
    ]
  },
  {
    id: 'kec_jambon',
    name: 'Kecamatan Jambon',
    dapilId: 'DAPIL_5',
    dapilNumber: 5,
    center: [-7.9150, 111.3450],
    tps: 120,
    targetKtp: 800,
    polygon: [
      [-7.8750, 111.3150],
      [-7.8750, 111.3850],
      [-7.9550, 111.3850],
      [-7.9550, 111.3150],
      [-7.8750, 111.3150]
    ]
  },
  {
    id: 'kec_badegan',
    name: 'Kecamatan Badegan',
    dapilId: 'DAPIL_5',
    dapilNumber: 5,
    center: [-7.9250, 111.2750],
    tps: 110,
    targetKtp: 800,
    polygon: [
      [-7.8750, 111.2350],
      [-7.8750, 111.3150],
      [-7.9750, 111.3150],
      [-7.9750, 111.2350],
      [-7.8750, 111.2350]
    ]
  },

  // DAPIL 6
  {
    id: 'kec_kauman',
    name: 'Kecamatan Kauman (Sumoroto)',
    dapilId: 'DAPIL_6',
    dapilNumber: 6,
    center: [-7.8550, 111.3850],
    tps: 140,
    targetKtp: 950,
    polygon: [
      [-7.8250, 111.3550],
      [-7.8250, 111.4250],
      [-7.8850, 111.4250],
      [-7.8850, 111.3550],
      [-7.8250, 111.3550]
    ]
  },
  {
    id: 'kec_sukorejo',
    name: 'Kecamatan Sukorejo',
    dapilId: 'DAPIL_6',
    dapilNumber: 6,
    center: [-7.8150, 111.3850],
    tps: 120,
    targetKtp: 800,
    polygon: [
      [-7.7750, 111.3550],
      [-7.7750, 111.4250],
      [-7.8250, 111.4250],
      [-7.8250, 111.3550],
      [-7.7750, 111.3550]
    ]
  },
  {
    id: 'kec_sampung',
    name: 'Kecamatan Sampung',
    dapilId: 'DAPIL_6',
    dapilNumber: 6,
    center: [-7.7850, 111.3150],
    tps: 90,
    targetKtp: 750,
    polygon: [
      [-7.7450, 111.2650],
      [-7.7450, 111.3550],
      [-7.8350, 111.3550],
      [-7.8350, 111.2650],
      [-7.7450, 111.2650]
    ]
  }
];

// Helper: Calculate Strength / Heatmap Category and Color
export function getStrengthColor(count: number, target: number): {
  category: 'KUAT' | 'SEDANG' | 'LEMAH';
  label: string;
  fillColor: string;
  borderColor: string;
  badgeBg: string;
  badgeText: string;
  percentage: number;
} {
  const percentage = target > 0 ? Math.round((count / target) * 100) : 0;

  if (percentage >= 70) {
    return {
      category: 'KUAT',
      label: 'Basis Kuat / Zona Aman (≥70%)',
      fillColor: 'rgba(16, 185, 129, 0.55)', // Emerald/Green
      borderColor: '#059669',
      badgeBg: 'bg-emerald-50 border-emerald-200',
      badgeText: 'text-emerald-700',
      percentage
    };
  } else if (percentage >= 35) {
    return {
      category: 'SEDANG',
      label: 'Zona Tempur / Penetrasi (35-69%)',
      fillColor: 'rgba(245, 158, 11, 0.55)', // Amber/Orange
      borderColor: '#d97706',
      badgeBg: 'bg-amber-50 border-amber-200',
      badgeText: 'text-amber-700',
      percentage
    };
  } else {
    return {
      category: 'LEMAH',
      label: 'Zona Rawan / Perlu Atensi (<35%)',
      fillColor: 'rgba(239, 68, 68, 0.50)', // Rose/Red
      borderColor: '#dc2626',
      badgeBg: 'bg-rose-50 border-rose-200',
      badgeText: 'text-rose-700',
      percentage
    };
  }
}
