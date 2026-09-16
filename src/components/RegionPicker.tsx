import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { getProvinces, getCities, getDistricts, getVillages } from '../utils/regionApi';

interface RegionPickerProps {
  type: 'region_province' | 'region_city' | 'region_district' | 'region_village';
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
  formData: Record<string, any>;
  fieldKey: string;
}

export function RegionPicker({ type, value, onChange, disabled, formData, fieldKey }: RegionPickerProps) {
  const [options, setOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // We need to know which keys map to parent fields based on our schema.
  // E.g., if this is 'region_city', we need the province value.
  // By convention in our registry, fields are named 'provinsi', 'kota', 'kecamatan', 'desa'.
  // We'll extract them loosely by checking common keys in formData.
  const prov = formData.provinsi || formData.provinsi_tugas || '';
  const city = formData.kota || formData.kota_tugas || '';
  const dist = formData.kecamatan || formData.kecamatan_tugas || '';

  useEffect(() => {
    let isMounted = true;
    const fetchOptions = async () => {
      setLoading(true);
      try {
        let res: any[] = [];
        if (type === 'region_province') {
          res = await getProvinces();
        } else if (type === 'region_city' && prov) {
          res = await getCities(prov);
        } else if (type === 'region_district' && prov && city) {
          res = await getDistricts(prov, city);
        } else if (type === 'region_village' && prov && city && dist) {
          res = await getVillages(prov, city, dist);
        }
        if (isMounted) {
          // Sort alphabetically
          res.sort((a, b) => a.name.localeCompare(b.name));
          setOptions(res);
        }
      } catch (err) {
        console.warn("Error fetching regions", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchOptions();
    return () => { isMounted = false; };
  }, [type, prov, city, dist]);

  const inputBaseClasses = "w-full px-4 py-2.5 text-xs border rounded-xl shadow-2xs focus:outline-none focus:ring-3 transition-all font-medium appearance-none";
  const inputStateClasses = disabled 
    ? "bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed opacity-90"
    : "bg-white border-slate-300 focus:border-indigo-500 focus:ring-indigo-100 text-slate-800";

  return (
    <div className="relative">
      <select
        disabled={disabled || loading}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputBaseClasses} ${inputStateClasses}`}
      >
        <option value="">
          {loading ? 'Memuat data...' : `-- Pilih ${type.split('_')[1].toUpperCase()} --`}
        </option>
        {options.map(opt => (
          <option key={opt.id} value={opt.name}>{opt.name}</option>
        ))}
      </select>
      
      {/* Loading Spinner or Dropdown Arrow */}
      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
        {loading ? (
          <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />
        ) : (
          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </div>
    </div>
  );
}
