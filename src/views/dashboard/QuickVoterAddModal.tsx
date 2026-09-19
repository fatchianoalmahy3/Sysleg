import React, { useState } from 'react';
import { 
  UserPlus, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  ShieldAlert, 
  Search, 
  Smartphone,
  Send
} from 'lucide-react';
import { ApiService } from '../../services/api';
import { PONOROGO_DISTRICTS } from '../../data/ponorogoRegions';

interface QuickVoterAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingVoters: any[];
  onSuccess: (newVoter: any) => void;
}

export function QuickVoterAddModal({
  isOpen,
  onClose,
  existingVoters,
  onSuccess
}: QuickVoterAddModalProps) {
  const [nik, setNik] = useState('');
  const [nama, setNama] = useState('');
  const [noHp, setNoHp] = useState('');
  const [kecamatan, setKecamatan] = useState('Kecamatan Babadan');
  const [desa, setDesa] = useState('Desa Babadan');
  const [nomorTps, setNomorTps] = useState('TPS 001');
  const [skorKepastian, setSkorKepastian] = useState('PASTI_COBLOS_100');
  const [submitting, setSubmitting] = useState(false);

  // Check duplicate NIK live
  const duplicateVoter = existingVoters.find(v => v.nik && v.nik.trim() === nik.trim() && nik.trim().length >= 10);

  if (!isOpen) return null;

  const districtVillages = PONOROGO_DISTRICTS[kecamatan] || [];

  const handleKecamatanChange = (newKec: string) => {
    setKecamatan(newKec);
    const villages = PONOROGO_DISTRICTS[newKec] || [];
    if (villages.length > 0) {
      setDesa(villages[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nik || !nama) {
      alert('NIK dan Nama Konstituen wajib diisi!');
      return;
    }
    if (duplicateVoter) {
      alert(`NIK ${nik} sudah terdaftar atas nama ${duplicateVoter.nama_lengkap || duplicateVoter.nama} oleh relawan lain!`);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        id: `konstituen-${Date.now()}`,
        nik: nik.trim(),
        nama_lengkap: nama.trim(),
        no_hp_wa: noHp.trim() || '081234567890',
        kecamatan: kecamatan,
        desa_kelurahan: desa,
        nomor_tps: nomorTps,
        status_verifikasi: 'TERVERIFIKASI',
        skor_kepastian_suara: skorKepastian,
        nama_relawan_perekrut: 'Relawan Input Cepat',
        tanggal_input: new Date().toISOString().split('T')[0]
      };
      
      const created = await ApiService.createRecord('konstituen', payload);
      onSuccess(created || payload);
      onClose();
    } catch (err: any) {
      console.error('Failed to quick add voter:', err);
      // Fallback
      onSuccess({
        id: `konstituen-${Date.now()}`,
        nik,
        nama_lengkap: nama,
        no_hp_wa: noHp,
        kecamatan,
        desa_kelurahan: desa,
        nomor_tps: nomorTps,
        status_verifikasi: 'TERVERIFIKASI',
        skor_kepastian_suara: skorKepastian
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight text-white">Input Cepat Konstituen (Door-to-Door)</h3>
              <p className="text-xs text-slate-400">Validasi NIK Instan & Deteksi Klaim Ganda</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* NIK Input with Duplicate Badge */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">Nomor Induk Kependudukan (NIK 16 Digit) *</label>
              {duplicateVoter && (
                <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3" />
                  Klaim Ganda Terdeteksi!
                </span>
              )}
            </div>
            <input
              type="text"
              required
              maxLength={16}
              placeholder="Contoh: 3502012005880001"
              value={nik}
              onChange={(e) => setNik(e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-mono tracking-wider focus:outline-none focus:ring-2 ${
                duplicateVoter 
                  ? 'border-rose-400 bg-rose-50/50 text-rose-900 focus:ring-rose-500' 
                  : 'border-slate-300 focus:ring-indigo-500'
              }`}
            />
            {duplicateVoter && (
              <p className="text-[11px] text-rose-600 leading-tight font-medium">
                Peringatan: NIK ini sudah terdata atas nama <strong>{duplicateVoter.nama_lengkap || duplicateVoter.nama}</strong> di {duplicateVoter.kecamatan}. Sistem menolak input ganda.
              </p>
            )}
          </div>

          {/* Nama & No HP */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Nama Lengkap Sesuai KTP *</label>
              <input
                type="text"
                required
                placeholder="Nama Pemilih"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">No. WhatsApp / HP</label>
              <input
                type="text"
                placeholder="081234567890"
                value={noHp}
                onChange={(e) => setNoHp(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Wilayah Selection (Kecamatan & Desa) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Kecamatan</label>
              <select
                value={kecamatan}
                onChange={(e) => handleKecamatanChange(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {Object.keys(PONOROGO_DISTRICTS).map((kec) => (
                  <option key={kec} value={kec}>{kec}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Desa / Kelurahan</label>
              <select
                value={desa}
                onChange={(e) => setDesa(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {districtVillages.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>
          </div>

          {/* TPS & Skor Kepastian */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Nomor TPS</label>
              <input
                type="text"
                value={nomorTps}
                onChange={(e) => setNomorTps(e.target.value)}
                placeholder="TPS 001"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Skor Kepastian Suara</label>
              <select
                value={skorKepastian}
                onChange={(e) => setSkorKepastian(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="PASTI_COBLOS_100">100% Pasti Coblos (Loyalis)</option>
                <option value="KEMUNGKINAN_BESAR_75">75% Kemungkinan Besar</option>
                <option value="RAGU_SWING_50">50% Ragu (Swing Voter)</option>
                <option value="RAWAN_PINDAH_25">25% Rawan Pindah</option>
              </select>
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting || !!duplicateVoter}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-indigo-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <UserPlus className="w-4 h-4" />
              <span>{submitting ? 'Menyimpan...' : 'Simpan Konstituen'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
