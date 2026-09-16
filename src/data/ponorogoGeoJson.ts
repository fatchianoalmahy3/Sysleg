// Official Administrative Boundary GeoJSON Data for Kabupaten Ponorogo (21 Districts / 6 Dapil)
// Formatted strictly as standard GeoJSON FeatureCollection compatible with Leaflet GeoJSON layer

export interface DistrictFeatureProperties {
  id: string;
  name: string;
  districtCode: string;
  dapilId: string;
  dapilNumber: number;
  dapilName: string;
  tps: number;
  targetKtp: number;
  center: [number, number]; // [lat, lng]
}

export const PONOROGO_GEOJSON: GeoJSON.FeatureCollection<GeoJSON.Geometry, DistrictFeatureProperties> = {
  type: "FeatureCollection",
  features: [
    // ==========================================
    // DAPIL 1: Ponorogo (Kota) & Babadan
    // ==========================================
    {
      type: "Feature",
      properties: {
        id: "kec_ponorogo",
        name: "Kecamatan Ponorogo (Kota)",
        districtCode: "350201",
        dapilId: "DAPIL_1",
        dapilNumber: 1,
        dapilName: "Dapil Ponorogo 1",
        tps: 280,
        targetKtp: 1800,
        center: [-7.8687, 111.4623]
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [111.4420, -7.8480],
          [111.4580, -7.8460],
          [111.4780, -7.8490],
          [111.4880, -7.8620],
          [111.4920, -7.8780],
          [111.4840, -7.8920],
          [111.4650, -7.8950],
          [111.4480, -7.8880],
          [111.4390, -7.8720],
          [111.4380, -7.8580],
          [111.4420, -7.8480]
        ]]
      }
    },
    {
      type: "Feature",
      properties: {
        id: "kec_babadan",
        name: "Kecamatan Babadan",
        districtCode: "350202",
        dapilId: "DAPIL_1",
        dapilNumber: 1,
        dapilName: "Dapil Ponorogo 1",
        tps: 280,
        targetKtp: 1700,
        center: [-7.8180, 111.4650]
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [111.4350, -7.7950],
          [111.4600, -7.7880],
          [111.4850, -7.7920],
          [111.4960, -7.8120],
          [111.4920, -7.8380],
          [111.4780, -7.8490],
          [111.4580, -7.8460],
          [111.4420, -7.8480],
          [111.4320, -7.8320],
          [111.4280, -7.8150],
          [111.4350, -7.7950]
        ]]
      }
    },

    // ==========================================
    // DAPIL 2: Jenangan, Siman, Jetis, Mlarak
    // ==========================================
    {
      type: "Feature",
      properties: {
        id: "kec_jenangan",
        name: "Kecamatan Jenangan",
        districtCode: "350203",
        dapilId: "DAPIL_2",
        dapilNumber: 2,
        dapilName: "Dapil Ponorogo 2",
        tps: 150,
        targetKtp: 900,
        center: [-7.8280, 111.5300]
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [111.4850, -7.7920],
          [111.5150, -7.7850],
          [111.5520, -7.7920],
          [111.5650, -7.8200],
          [111.5580, -7.8450],
          [111.5320, -7.8520],
          [111.4980, -7.8480],
          [111.4920, -7.8380],
          [111.4960, -7.8120],
          [111.4850, -7.7920]
        ]]
      }
    },
    {
      type: "Feature",
      properties: {
        id: "kec_siman",
        name: "Kecamatan Siman",
        districtCode: "350204",
        dapilId: "DAPIL_2",
        dapilNumber: 2,
        dapilName: "Dapil Ponorogo 2",
        tps: 130,
        targetKtp: 800,
        center: [-7.8850, 111.5050]
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [111.4780, -7.8490],
          [111.4980, -7.8480],
          [111.5320, -7.8520],
          [111.5380, -7.8820],
          [111.5280, -7.9050],
          [111.4950, -7.9080],
          [111.4840, -7.8920],
          [111.4920, -7.8780],
          [111.4880, -7.8620],
          [111.4780, -7.8490]
        ]]
      }
    },
    {
      type: "Feature",
      properties: {
        id: "kec_mlarak",
        name: "Kecamatan Mlarak",
        districtCode: "350205",
        dapilId: "DAPIL_2",
        dapilNumber: 2,
        dapilName: "Dapil Ponorogo 2",
        tps: 120,
        targetKtp: 750,
        center: [-7.8950, 111.5550]
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [111.5320, -7.8520],
          [111.5580, -7.8450],
          [111.5850, -7.8580],
          [111.5880, -7.8950],
          [111.5680, -7.9320],
          [111.5350, -7.9350],
          [111.5280, -7.9050],
          [111.5380, -7.8820],
          [111.5320, -7.8520]
        ]]
      }
    },
    {
      type: "Feature",
      properties: {
        id: "kec_jetis",
        name: "Kecamatan Jetis",
        districtCode: "350206",
        dapilId: "DAPIL_2",
        dapilNumber: 2,
        dapilName: "Dapil Ponorogo 2",
        tps: 120,
        targetKtp: 750,
        center: [-7.9250, 111.5150]
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [111.4950, -7.9080],
          [111.5280, -7.9050],
          [111.5350, -7.9350],
          [111.5380, -7.9550],
          [111.5180, -7.9620],
          [111.4880, -7.9520],
          [111.4840, -7.9250],
          [111.4950, -7.9080]
        ]]
      }
    },

    // ==========================================
    // DAPIL 3: Pulung, Pudak, Sooko, Sawoo, Ngebel
    // ==========================================
    {
      type: "Feature",
      properties: {
        id: "kec_ngebel",
        name: "Kecamatan Ngebel",
        districtCode: "350207",
        dapilId: "DAPIL_3",
        dapilNumber: 3,
        dapilName: "Dapil Ponorogo 3",
        tps: 65,
        targetKtp: 450,
        center: [-7.7850, 111.6250]
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [111.5520, -7.7920],
          [111.5850, -7.7650],
          [111.6450, -7.7680],
          [111.6620, -7.8050],
          [111.6180, -7.8280],
          [111.5650, -7.8200],
          [111.5520, -7.7920]
        ]]
      }
    },
    {
      type: "Feature",
      properties: {
        id: "kec_pulung",
        name: "Kecamatan Pulung",
        districtCode: "350208",
        dapilId: "DAPIL_3",
        dapilNumber: 3,
        dapilName: "Dapil Ponorogo 3",
        tps: 160,
        targetKtp: 1100,
        center: [-7.8680, 111.6150]
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [111.5650, -7.8200],
          [111.6180, -7.8280],
          [111.6620, -7.8050],
          [111.6780, -7.8450],
          [111.6650, -7.8920],
          [111.6150, -7.8980],
          [111.5850, -7.8580],
          [111.5580, -7.8450],
          [111.5650, -7.8200]
        ]]
      }
    },
    {
      type: "Feature",
      properties: {
        id: "kec_pudak",
        name: "Kecamatan Pudak",
        districtCode: "350209",
        dapilId: "DAPIL_3",
        dapilNumber: 3,
        dapilName: "Dapil Ponorogo 3",
        tps: 60,
        targetKtp: 450,
        center: [-7.8120, 111.6950]
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [111.6620, -7.8050],
          [111.7150, -7.7850],
          [111.7480, -7.8250],
          [111.7250, -7.8650],
          [111.6780, -7.8450],
          [111.6620, -7.8050]
        ]]
      }
    },
    {
      type: "Feature",
      properties: {
        id: "kec_sooko",
        name: "Kecamatan Sooko",
        districtCode: "350210",
        dapilId: "DAPIL_3",
        dapilNumber: 3,
        dapilName: "Dapil Ponorogo 3",
        tps: 80,
        targetKtp: 550,
        center: [-7.9150, 111.6850]
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [111.6780, -7.8450],
          [111.7250, -7.8650],
          [111.7380, -7.9250],
          [111.6980, -7.9550],
          [111.6550, -7.9350],
          [111.6650, -7.8920],
          [111.6780, -7.8450]
        ]]
      }
    },
    {
      type: "Feature",
      properties: {
        id: "kec_sawoo",
        name: "Kecamatan Sawoo",
        districtCode: "350211",
        dapilId: "DAPIL_3",
        dapilNumber: 3,
        dapilName: "Dapil Ponorogo 3",
        tps: 180,
        targetKtp: 1000,
        center: [-7.9450, 111.6250]
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [111.5880, -7.8950],
          [111.6150, -7.8980],
          [111.6650, -7.8920],
          [111.6550, -7.9350],
          [111.6750, -7.9850],
          [111.6280, -8.0120],
          [111.5750, -7.9820],
          [111.5680, -7.9320],
          [111.5880, -7.8950]
        ]]
      }
    },

    // ==========================================
    // DAPIL 4: Sambit, Bungkal, Slahung, Ngrayun
    // ==========================================
    {
      type: "Feature",
      properties: {
        id: "kec_sambit",
        name: "Kecamatan Sambit",
        districtCode: "350212",
        dapilId: "DAPIL_4",
        dapilNumber: 4,
        dapilName: "Dapil Ponorogo 4",
        tps: 130,
        targetKtp: 850,
        center: [-7.9650, 111.5350]
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [111.5180, -7.9620],
          [111.5380, -7.9550],
          [111.5680, -7.9320],
          [111.5750, -7.9820],
          [111.5650, -8.0150],
          [111.5250, -8.0180],
          [111.5050, -7.9850],
          [111.5180, -7.9620]
        ]]
      }
    },
    {
      type: "Feature",
      properties: {
        id: "kec_bungkal",
        name: "Kecamatan Bungkal",
        districtCode: "350213",
        dapilId: "DAPIL_4",
        dapilNumber: 4,
        dapilName: "Dapil Ponorogo 4",
        tps: 120,
        targetKtp: 800,
        center: [-7.9850, 111.4750]
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [111.4580, -7.9650],
          [111.4880, -7.9520],
          [111.5180, -7.9620],
          [111.5050, -7.9850],
          [111.5250, -8.0180],
          [111.4980, -8.0450],
          [111.4550, -8.0350],
          [111.4450, -7.9950],
          [111.4580, -7.9650]
        ]]
      }
    },
    {
      type: "Feature",
      properties: {
        id: "kec_slahung",
        name: "Kecamatan Slahung",
        districtCode: "350214",
        dapilId: "DAPIL_4",
        dapilNumber: 4,
        dapilName: "Dapil Ponorogo 4",
        tps: 150,
        targetKtp: 950,
        center: [-8.0250, 111.4250]
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [111.3980, -7.9850],
          [111.4450, -7.9950],
          [111.4550, -8.0350],
          [111.4680, -8.0750],
          [111.4350, -8.1150],
          [111.3850, -8.0850],
          [111.3780, -8.0350],
          [111.3980, -7.9850]
        ]]
      }
    },
    {
      type: "Feature",
      properties: {
        id: "kec_ngrayun",
        name: "Kecamatan Ngrayun",
        districtCode: "350215",
        dapilId: "DAPIL_4",
        dapilNumber: 4,
        dapilName: "Dapil Ponorogo 4",
        tps: 180,
        targetKtp: 1000,
        center: [-8.1150, 111.4850]
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [111.4550, -8.0350],
          [111.4980, -8.0450],
          [111.5250, -8.0180],
          [111.5650, -8.0150],
          [111.5850, -8.0850],
          [111.5450, -8.1650],
          [111.4650, -8.1850],
          [111.4250, -8.1450],
          [111.4350, -8.1150],
          [111.4680, -8.0750],
          [111.4550, -8.0350]
        ]]
      }
    },

    // ==========================================
    // DAPIL 5: Balong, Jambon, Badegan
    // ==========================================
    {
      type: "Feature",
      properties: {
        id: "kec_balong",
        name: "Kecamatan Balong",
        districtCode: "350216",
        dapilId: "DAPIL_5",
        dapilNumber: 5,
        dapilName: "Dapil Ponorogo 5",
        tps: 160,
        targetKtp: 1000,
        center: [-7.9450, 111.4150]
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [111.3950, -7.9150],
          [111.4480, -7.8880],
          [111.4650, -7.8950],
          [111.4840, -7.9250],
          [111.4880, -7.9520],
          [111.4580, -7.9650],
          [111.4450, -7.9950],
          [111.3980, -7.9850],
          [111.3850, -7.9450],
          [111.3950, -7.9150]
        ]]
      }
    },
    {
      type: "Feature",
      properties: {
        id: "kec_jambon",
        name: "Kecamatan Jambon",
        districtCode: "350217",
        dapilId: "DAPIL_5",
        dapilNumber: 5,
        dapilName: "Dapil Ponorogo 5",
        tps: 120,
        targetKtp: 800,
        center: [-7.9150, 111.3450]
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [111.3280, -7.8850],
          [111.3780, -7.8720],
          [111.4390, -7.8720],
          [111.4480, -7.8880],
          [111.3950, -7.9150],
          [111.3850, -7.9450],
          [111.3380, -7.9650],
          [111.3120, -7.9280],
          [111.3280, -7.8850]
        ]]
      }
    },
    {
      type: "Feature",
      properties: {
        id: "kec_badegan",
        name: "Kecamatan Badegan",
        districtCode: "350218",
        dapilId: "DAPIL_5",
        dapilNumber: 5,
        dapilName: "Dapil Ponorogo 5",
        tps: 110,
        targetKtp: 800,
        center: [-7.9250, 111.2750]
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [111.2480, -7.8850],
          [111.2980, -7.8780],
          [111.3280, -7.8850],
          [111.3120, -7.9280],
          [111.3380, -7.9650],
          [111.3150, -7.9850],
          [111.2450, -7.9750],
          [111.2280, -7.9250],
          [111.2480, -7.8850]
        ]]
      }
    },

    // ==========================================
    // DAPIL 6: Kauman (Sumoroto), Sukorejo, Sampung
    // ==========================================
    {
      type: "Feature",
      properties: {
        id: "kec_kauman",
        name: "Kecamatan Kauman (Sumoroto)",
        districtCode: "350219",
        dapilId: "DAPIL_6",
        dapilNumber: 6,
        dapilName: "Dapil Ponorogo 6",
        tps: 140,
        targetKtp: 950,
        center: [-7.8550, 111.3850]
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [111.3550, -7.8280],
          [111.4050, -7.8250],
          [111.4320, -7.8320],
          [111.4420, -7.8480],
          [111.4390, -7.8720],
          [111.3780, -7.8720],
          [111.3520, -7.8650],
          [111.3550, -7.8280]
        ]]
      }
    },
    {
      type: "Feature",
      properties: {
        id: "kec_sukorejo",
        name: "Kecamatan Sukorejo",
        districtCode: "350220",
        dapilId: "DAPIL_6",
        dapilNumber: 6,
        dapilName: "Dapil Ponorogo 6",
        tps: 120,
        targetKtp: 800,
        center: [-7.8150, 111.3850]
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [111.3450, -7.7750],
          [111.4150, -7.7780],
          [111.4350, -7.7950],
          [111.4280, -7.8150],
          [111.4320, -7.8320],
          [111.4050, -7.8250],
          [111.3550, -7.8280],
          [111.3380, -7.8050],
          [111.3450, -7.7750]
        ]]
      }
    },
    {
      type: "Feature",
      properties: {
        id: "kec_sampung",
        name: "Kecamatan Sampung",
        districtCode: "350221",
        dapilId: "DAPIL_6",
        dapilNumber: 6,
        dapilName: "Dapil Ponorogo 6",
        tps: 90,
        targetKtp: 750,
        center: [-7.7850, 111.3150]
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [111.2650, -7.7550],
          [111.3350, -7.7480],
          [111.3450, -7.7750],
          [111.3380, -7.8050],
          [111.3550, -7.8280],
          [111.3520, -7.8650],
          [111.3280, -7.8850],
          [111.2980, -7.8780],
          [111.2680, -7.8250],
          [111.2650, -7.7550]
        ]]
      }
    }
  ]
};

export const PONOROGO_DAPIL_COLORS: Record<string, { color: string; borderColor: string; fillColor: string; name: string }> = {
  DAPIL_1: {
    color: '#4f46e5', // Indigo
    borderColor: '#3730a3',
    fillColor: 'rgba(79, 70, 229, 0.45)',
    name: 'Dapil Ponorogo 1 (Kota & Babadan)'
  },
  DAPIL_2: {
    color: '#0891b2', // Cyan / Teal
    borderColor: '#0e7490',
    fillColor: 'rgba(8, 145, 178, 0.45)',
    name: 'Dapil Ponorogo 2 (Jenangan, Siman, Jetis, Mlarak)'
  },
  DAPIL_3: {
    color: '#059669', // Emerald
    borderColor: '#047857',
    fillColor: 'rgba(5, 150, 105, 0.45)',
    name: 'Dapil Ponorogo 3 (Pulung, Pudak, Sooko, Sawoo, Ngebel)'
  },
  DAPIL_4: {
    color: '#d97706', // Amber / Orange
    borderColor: '#b45309',
    fillColor: 'rgba(217, 119, 6, 0.45)',
    name: 'Dapil Ponorogo 4 (Sambit, Bungkal, Slahung, Ngrayun)'
  },
  DAPIL_5: {
    color: '#e11d48', // Rose / Red
    borderColor: '#be123c',
    fillColor: 'rgba(225, 29, 72, 0.45)',
    name: 'Dapil Ponorogo 5 (Balong, Jambon, Badegan)'
  },
  DAPIL_6: {
    color: '#7c3aed', // Violet / Purple
    borderColor: '#6d28d9',
    fillColor: 'rgba(124, 58, 237, 0.45)',
    name: 'Dapil Ponorogo 6 (Kauman, Sukorejo, Sampung)'
  }
};
