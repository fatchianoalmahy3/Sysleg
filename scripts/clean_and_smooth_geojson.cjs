const fs = require('fs');
const path = require('path');

function cross(o, a, b) {
  return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
}

function convexHull(points) {
  if (points.length <= 3) return points;
  const pts = points.slice().sort((a, b) => a[0] === b[0] ? a[1] - b[1] : a[0] - b[0]);
  const lower = [];
  for (let p of pts) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) {
      lower.pop();
    }
    lower.push(p);
  }
  const upper = [];
  for (let i = pts.length - 1; i >= 0; i--) {
    const p = pts[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) {
      upper.pop();
    }
    upper.push(p);
  }
  upper.pop();
  lower.pop();
  const hull = lower.concat(upper);
  hull.push(hull[0]); // close polygon
  return hull;
}

function getAllPoints(geom) {
  const pts = [];
  function walk(c) {
    if (typeof c[0] === 'number') {
      pts.push([c[0], c[1]]);
    } else {
      c.forEach(walk);
    }
  }
  walk(geom.coordinates);
  return pts;
}

const dapilFiles = [1, 2, 3, 4, 5, 6].map(i => path.join(process.cwd(), `public/data/desa_dapil_${i}.json`));
dapilFiles.push(path.join(process.cwd(), 'public/data/ponorogo_desa_all.json'));

dapilFiles.forEach(filePath => {
  if (!fs.existsSync(filePath)) return;
  const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  const grouped = new Map();
  raw.features.forEach(f => {
    const name = f.properties.name || f.properties.NAMOBJ || 'Desa';
    if (!grouped.has(name)) {
      grouped.set(name, {
        properties: f.properties,
        points: []
      });
    }
    const pts = getAllPoints(f.geometry);
    grouped.get(name).points.push(...pts);
  });

  const newFeatures = [];
  grouped.forEach((data, name) => {
    const pointMap = new Map();
    data.points.forEach(p => {
      const key = `${p[0].toFixed(5)},${p[1].toFixed(5)}`;
      pointMap.set(key, p);
    });
    const uniquePts = Array.from(pointMap.values());
    const hull = convexHull(uniquePts);

    newFeatures.push({
      type: 'Feature',
      properties: {
        ...data.properties,
        name: name,
        pointCount: hull.length
      },
      geometry: {
        type: 'Polygon',
        coordinates: [hull]
      }
    });
  });

  const output = {
    type: 'FeatureCollection',
    name: path.basename(filePath, '.json'),
    features: newFeatures
  };

  fs.writeFileSync(filePath, JSON.stringify(output), 'utf8');
  console.log(`Cleaned ${path.basename(filePath)}: ${raw.features.length} -> ${newFeatures.length} smooth polygons`);
});

console.log('All GeoJSON files successfully cleaned and smoothed.');
