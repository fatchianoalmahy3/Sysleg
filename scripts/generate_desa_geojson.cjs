const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Implementation of Douglas-Peucker simplification
function getSqDist(p1, p2) {
  const dx = p1[0] - p2[0], dy = p1[1] - p2[1];
  return dx * dx + dy * dy;
}
function getSqSegDist(p, p1, p2) {
  let x = p1[0], y = p1[1], dx = p2[0] - x, dy = p2[1] - y;
  if (dx !== 0 || dy !== 0) {
    const t = ((p[0] - x) * dx + (p[1] - y) * dy) / (dx * dx + dy * dy);
    if (t > 1) { x = p2[0]; y = p2[1]; }
    else if (t > 0) { x += dx * t; y += dy * t; }
  }
  dx = p[0] - x; dy = p[1] - y;
  return dx * dx + dy * dy;
}
function simplifyDPStep(points, first, last, sqTolerance, simplified) {
  let maxSqDist = sqTolerance, index;
  for (let i = first + 1; i < last; i++) {
    const sqDist = getSqSegDist(points[i], points[first], points[last]);
    if (sqDist > maxSqDist) { index = i; maxSqDist = sqDist; }
  }
  if (maxSqDist > sqTolerance) {
    if (index - first > 1) simplifyDPStep(points, first, index, sqTolerance, simplified);
    simplified.push(points[index]);
    if (last - index > 1) simplifyDPStep(points, index, last, sqTolerance, simplified);
  }
}
function simplify(points, tolerance) {
  if (points.length <= 2) return points;
  const sqTolerance = tolerance * tolerance;
  const last = points.length - 1;
  const simplified = [points[0]];
  simplifyDPStep(points, 0, last, sqTolerance, simplified);
  simplified.push(points[last]);
  return simplified;
}

function simplifyRing(ring, tol = 0.00025) {
  const simp = simplify(ring, tol).map(([lng, lat]) => [
    Math.round(lng * 100000) / 100000,
    Math.round(lat * 100000) / 100000
  ]);
  // ensure ring is closed
  if (simp.length > 2) {
    const first = simp[0];
    const last = simp[simp.length - 1];
    if (first[0] !== last[0] || first[1] !== last[1]) {
      simp.push([first[0], first[1]]);
    }
  }
  return simp;
}

function pointInPoly(pt, poly) {
  let inside = false;
  const x = pt[0], y = pt[1];
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0], yi = poly[i][1];
    const xj = poly[j][0], yj = poly[j][1];
    const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

function distSq(p1, p2) {
  return (p1[0]-p2[0])**2 + (p1[1]-p2[1])**2;
}

function getPolyCentroid(coords) {
  let sumLng = 0, sumLat = 0, count = 0;
  function traverse(ring) {
    if (typeof ring[0] === "number") {
      sumLng += ring[0];
      sumLat += ring[1];
      count++;
    } else {
      ring.forEach(traverse);
    }
  }
  traverse(coords);
  return [sumLng / count, sumLat / count];
}

function main() {
  const outputDir = path.join(process.cwd(), 'public', 'data');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Load district polygons
  const geoJsonContent = fs.readFileSync(path.join(process.cwd(), 'src/data/ponorogoGeoJson.ts'), 'utf8');
  const districts = [];
  const lines = geoJsonContent.split('\n');
  let currentDist = null;
  let inCoords = false;
  let currentCoords = [];

  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (l.includes('id: "kec_')) {
      const id = l.match(/kec_[a-z_]+/)[0];
      currentDist = { id, coords: [] };
    }
    if (currentDist && l.includes('dapilId:')) {
      currentDist.dapilId = l.match(/DAPIL_[1-6]/)[0];
      currentDist.dapilNumber = parseInt(l.match(/DAPIL_([1-6])/)[1]);
    }
    if (currentDist && l.includes('dapilName:')) {
      currentDist.dapilName = l.match(/dapilName: "([^"]+)"/)[1];
    }
    if (currentDist && l.includes('name: "Kecamatan')) {
      currentDist.name = l.match(/name: "([^"]+)"/)[1];
    }
    if (currentDist && l.includes('coordinates: [[')) {
      inCoords = true;
      currentCoords = [];
      continue;
    }
    if (inCoords) {
      if (l.includes(']]')) {
        inCoords = false;
        currentDist.coords = currentCoords;
        let sx = 0, sy = 0;
        currentCoords.forEach(([x, y]) => { sx += x; sy += y; });
        currentDist.center = [sx / currentCoords.length, sy / currentCoords.length];
        districts.push(currentDist);
        currentDist = null;
      } else {
        const match = l.match(/\[([0-9.-]+),\s*([0-9.-]+)\]/);
        if (match) currentCoords.push([parseFloat(match[1]), parseFloat(match[2])]);
      }
    }
  }

  // Load villages by district
  const regionsContent = fs.readFileSync(path.join(process.cwd(), 'src/data/ponorogoRegions.ts'), 'utf8');
  const districtVillages = {};
  let curDist = null;
  for (const l of regionsContent.split('\n')) {
    const dMatch = l.match(/\x27(Kecamatan [^\x27]+)\x27:/);
    if (dMatch) {
      curDist = dMatch[1];
      districtVillages[curDist] = [];
    } else if (curDist) {
      const vMatch = l.match(/\x27(Desa [^\x27]+|Kelurahan [^\x27]+)\x27/);
      if (vMatch) {
        districtVillages[curDist].push(vMatch[1]);
      }
    }
  }

  // Load raw
  const raw = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'ADMINISTRASI_AR_DESAKEL.json'), 'utf8'));
  console.log(`Original GeoJSON size: ${(fs.statSync('ADMINISTRASI_AR_DESAKEL.json').size / (1024*1024)).toFixed(2)} MB`);

  const featuresByDapil = {
    DAPIL_1: [],
    DAPIL_2: [],
    DAPIL_3: [],
    DAPIL_4: [],
    DAPIL_5: [],
    DAPIL_6: []
  };
  const allFeatures = [];
  const distVillageUsage = {};

  raw.geometries.forEach((g, idx) => {
    const center = getPolyCentroid(g.coordinates);
    let matchedDist = null;
    for (const d of districts) {
      if (pointInPoly(center, d.coords)) {
        matchedDist = d;
        break;
      }
    }
    if (!matchedDist) {
      let minDist = 999;
      for (const d of districts) {
        const dsq = distSq(center, d.center);
        if (dsq < minDist) {
          minDist = dsq;
          matchedDist = d;
        }
      }
    }

    const vList = districtVillages[matchedDist.name] || ['Desa Wilayah'];
    distVillageUsage[matchedDist.name] = (distVillageUsage[matchedDist.name] || 0);
    const vIdx = distVillageUsage[matchedDist.name] % vList.length;
    distVillageUsage[matchedDist.name]++;
    const villageName = vList[vIdx];

    let simplifiedGeom = null;
    if (g.type === 'Polygon') {
      simplifiedGeom = {
        type: 'Polygon',
        coordinates: g.coordinates.map(r => simplifyRing(r, 0.00025))
      };
    } else if (g.type === 'MultiPolygon') {
      simplifiedGeom = {
        type: 'MultiPolygon',
        coordinates: g.coordinates.map(p => p.map(r => simplifyRing(r, 0.00025)))
      };
    }

    const feature = {
      type: 'Feature',
      id: `desa_${matchedDist.id}_${idx}`,
      properties: {
        id: `desa_${matchedDist.id}_${idx}`,
        name: villageName,
        village: villageName.replace(/^(Desa |Kelurahan )/, ''),
        type: villageName.startsWith('Kelurahan') ? 'Kelurahan' : 'Desa',
        district: matchedDist.name.replace('Kecamatan ', '').replace(' (Kota)', '').replace(' (Sumoroto)', ''),
        districtFullName: matchedDist.name,
        dapilId: matchedDist.dapilId,
        dapilNumber: matchedDist.dapilNumber,
        dapilName: matchedDist.dapilName,
        center: [Math.round(center[1] * 10000) / 10000, Math.round(center[0] * 10000) / 10000]
      },
      geometry: simplifiedGeom
    };

    featuresByDapil[matchedDist.dapilId].push(feature);
    allFeatures.push(feature);
  });

  // Export split files per Dapil
  for (let d = 1; d <= 6; d++) {
    const dapilKey = `DAPIL_${d}`;
    const collection = {
      type: 'FeatureCollection',
      dapilId: dapilKey,
      dapilNumber: d,
      features: featuresByDapil[dapilKey]
    };
    const jsonStr = JSON.stringify(collection);
    const dest = path.join(outputDir, `desa_dapil_${d}.json`);
    fs.writeFileSync(dest, jsonStr);
    const gz = zlib.gzipSync(Buffer.from(jsonStr));
    console.log(`[DAPIL ${d}] Saved ${collection.features.length} features -> ${dest} (${(jsonStr.length/1024).toFixed(1)} KB, GZip: ${(gz.length/1024).toFixed(1)} KB)`);
  }

  // Export combined all-dapil file
  const allCollection = {
    type: 'FeatureCollection',
    features: allFeatures
  };
  const allJsonStr = JSON.stringify(allCollection);
  const allDest = path.join(outputDir, 'ponorogo_desa_all.json');
  fs.writeFileSync(allDest, allJsonStr);
  console.log(`[ALL] Saved ${allFeatures.length} features -> ${allDest} (${(allJsonStr.length/1024).toFixed(1)} KB)`);
}

main();
