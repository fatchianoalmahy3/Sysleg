const BASE_URL = 'https://www.emsifa.com/api-wilayah-indonesia/api';

const cache: Record<string, any[]> = {};

async function fetchWithCache(url: string) {
  if (cache[url]) return cache[url];
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    cache[url] = data;
    return data;
  } catch (e) {
    console.warn("Region API Error:", e);
    return [];
  }
}

export async function getProvinces() {
  return fetchWithCache(`${BASE_URL}/provinces.json`);
}

export async function getCities(provinceName: string) {
  if (!provinceName) return [];
  const provs = await getProvinces();
  const prov = provs.find((p: any) => p.name.toUpperCase() === provinceName.toUpperCase());
  if (!prov) return [];
  return fetchWithCache(`${BASE_URL}/regencies/${prov.id}.json`);
}

export async function getDistricts(provinceName: string, cityName: string) {
  if (!cityName) return [];
  const cities = await getCities(provinceName);
  const city = cities.find((c: any) => c.name.toUpperCase() === cityName.toUpperCase());
  if (!city) return [];
  return fetchWithCache(`${BASE_URL}/districts/${city.id}.json`);
}

export async function getVillages(provinceName: string, cityName: string, districtName: string) {
  if (!districtName) return [];
  const dists = await getDistricts(provinceName, cityName);
  const dist = dists.find((d: any) => d.name.toUpperCase() === districtName.toUpperCase());
  if (!dist) return [];
  return fetchWithCache(`${BASE_URL}/villages/${dist.id}.json`);
}
