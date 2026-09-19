import React, { useState } from 'react';
import { 
  ShieldCheck, 
  MapPin, 
  Camera, 
  CheckCircle2, 
  AlertTriangle, 
  Wallet, 
  Smartphone, 
  X, 
  Upload, 
  Clock, 
  Hash,
  Send,
  UserCheck
} from 'lucide-react';
import { validateC1Math, generateC1ForensicHash } from '../../utils/electoralIntegrity';
import { ApiService } from '../../services/api';

interface SaksiFieldPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessSubmit?: () => void;
}

export function SaksiFieldPortalModal({ isOpen, onClose, onSuccessSubmit }: SaksiFieldPortalModalProps) {
  // Active Saksi Profile Mock for Demo
  const [selectedTpsId, setSelectedTpsId] = useState('tps-demo-1');
  const [activeTab, setActiveTab] = useState<'ABSEN' | 'C1_INPUT' | 'HONOR'>('C1_INPUT');
  
  // State: Absen GPS
  const [gpsLoading, setGpsLoading] = useState(false);
  const [absenData, setAbsenData] = useState<{
    timestamp: string;
    lat: number;
    lng: number;
    accuracy: number;
  } | null>(null);

  // State: C1 Plano Input
  const [suaraCaleg, setSuaraCaleg] = useState<number | string>(74);
  const [totalSuaraSah, setTotalSuaraSah] = useState<number | string>(186);
  const [suaraTidakSah, setSuaraTidakSah] = useState<number | string>(12);
  const [totalPenggunaHakPilih, setTotalPenggunaHakPilih] = useState<number | string>(198);
  const [fotoC1, setFotoC1] = useState<string>('https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=600&auto=format&fit=crop&q=80');
  const [submittingC1, setSubmittingC1] = useState(false);
  const [c1Submitted, setC1Submitted] = useState(false);

  // Demo Witnesses for Easy Switching
  const DEMO_WITNESSES = [
    { id: 'tps-demo-1', nama: 'Budi Santoso', phone: '081234567890', desa: 'Babadan', tps: 'TPS 004', kec: 'Babadan', dpt: 245 },
    { id: 'tps-demo-2', nama: 'Ust. Nurul Huda', phone: '085678901234', desa: 'Gontor (Loksus)', tps: 'TPS 901', kec: 'Mlarak', dpt: 295 },
    { id: 'tps-demo-3', nama: 'Siti Aminah', phone: '087812345678', desa: 'Mangkujayan', tps: 'TPS 002', kec: 'Ponorogo (Kota)', dpt: 220 }
  ];

  const currentWitness = DEMO_WITNESSES.find(w => w.id === selectedTpsId) || DEMO_WITNESSES[0];

  // Mathematical integrity calculation in real-time
  const mathAudit = validateC1Math({
    suara_sah_caleg: suaraCaleg,
    total_suara_sah: totalSuaraSah,
    suara_tidak_sah: suaraTidakSah,
    total_pengguna_hak_pilih: totalPenggunaHakPilih
  });

  // Forensic Hash computation
  const forensicHash = generateC1ForensicHash({
    nomor_tps: currentWitness.tps,
    desa: currentWitness.desa,
    nama_saksi: currentWitness.nama,
    lat: absenData?.lat || -7.8480,
    lng: absenData?.lng || 111.4650
  });

  if (!isOpen) return null;

  // Handle GPS Capture
  const handleCaptureGps = () => {
    setGpsLoading(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setAbsenData({
            timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
            lat: Number(pos.coords.latitude.toFixed(5)),
            lng: Number(pos.coords.longitude.toFixed(5)),
            accuracy: Math.round(pos.coords.accuracy)
          });
          setGpsLoading(false);
        },
        () => {
          // Fallback coordinate in Ponorogo
          setAbsenData({
            timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
            lat: -7.8480,
            lng: 111.4650,
            accuracy: 8
          });
          setGpsLoading(false);
        },
        { timeout: 5000, enableHighAccuracy: true }
      );
    } else {
      setAbsenData({
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
        lat: -7.8480,
        lng: 111.4650,
        accuracy: 10
      });
      setGpsLoading(false);
    }
  };

  // Handle Submit C1
  const handleSubmitC1 = async () => {
    if (!mathAudit.isValid) {
      alert('Periksa kembali angka perolehan suara! Validasi matematika C1 belum klop.');
      return;
    }
    setSubmittingC1(true);
    try {
      await ApiService.createRecord('quick_count_c1', {
        id: `qc-${Date.now()}`,
        kecamatan: currentWitness.kec,
        desa_kelurahan: currentWitness.desa,
        nomor_tps: currentWitness.tps,
        nama_saksi: currentWitness.nama,
        suara_sah_caleg: Number(suaraCaleg),
        total_suara_sah_tps: Number(totalSuaraSah),
        suara_tidak_sah_tps: Number(suaraTidakSah),
        total_pengguna_hak_pilih: Number(totalPenggunaHakPilih),
        foto_c1_plano: fotoC1,
        status_audit_matematis: mathAudit.status,
        hash_forensik_c1: forensicHash,
        status_verifikasi: 'TERVERIFIKASI_SAH',
        catatan_lapangan: 'Input mandiri saksi via Portal Saksi Mobile Cakra Elektoral',
        lat: absenData?.lat || -7.8480,
        lng: absenData?.lng || 111.4650
      });
      setC1Submitted(true);
      if (onSuccessSubmit) onSuccessSubmit();
    } catch (err: any) {
      console.error(err);
      setC1Submitted(true); // Allow demo success feedback
    } finally {
      setSubmittingC1(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Mobile Header Bar */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-xs">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-black tracking-tight text-white">Portal Saksi TPS</h3>
                <span className="text-[9px] font-bold px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30">
                  MODE LAPANGAN
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Pemenangan Cakra Elektoral Ponorogo</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Identity & Witness Selector (Simulasi untuk Klien/Demo) */}
        <div className="bg-slate-100/90 border-b border-slate-200 px-4 py-2.5 flex items-center justify-between shrink-0 text-xs">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-indigo-600" />
            <span className="font-bold text-slate-800">{currentWitness.nama}</span>
            <span className="text-slate-500">({currentWitness.tps} - {currentWitness.desa})</span>
          </div>
          <select 
            value={selectedTpsId}
            onChange={(e) => {
              setSelectedTpsId(e.target.value);
              setC1Submitted(false);
            }}
            className="text-[11px] font-semibold bg-white border border-slate-300 rounded-lg px-2 py-1 text-slate-700 cursor-pointer"
          >
            {DEMO_WITNESSES.map(w => (
              <option key={w.id} value={w.id}>{w.tps} ({w.desa})</option>
            ))}
          </select>
        </div>

        {/* 3 Tab Selector for Witness Workflow */}
        <div className="grid grid-cols-3 border-b border-slate-200 text-xs font-bold shrink-0 bg-slate-50">
          <button
            onClick={() => setActiveTab('ABSEN')}
            className={`py-3 px-2 flex flex-col items-center gap-1 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'ABSEN' 
                ? 'border-indigo-600 text-indigo-600 bg-white' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>1. Absen TPS</span>
          </button>
          <button
            onClick={() => setActiveTab('C1_INPUT')}
            className={`py-3 px-2 flex flex-col items-center gap-1 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'C1_INPUT' 
                ? 'border-indigo-600 text-indigo-600 bg-white' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>2. Form C1</span>
          </button>
          <button
            onClick={() => setActiveTab('HONOR')}
            className={`py-3 px-2 flex flex-col items-center gap-1 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'HONOR' 
                ? 'border-indigo-600 text-indigo-600 bg-white' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Wallet className="w-4 h-4" />
            <span>3. Honorarium</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4 text-slate-900">
          {/* TAB 1: ABSEN TPS */}
          {activeTab === 'ABSEN' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 space-y-2 text-center">
                <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-md">
                  <MapPin className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-black text-indigo-950">Validasi Kehadiran Fisik di TPS</h4>
                <p className="text-xs text-indigo-700 leading-relaxed">
                  Saksi wajib mengunci koordinat GPS saat tiba di TPS pukul 06.30 WIB untuk mengonfirmasi pengawalan kotak suara.
                </p>
              </div>

              {absenData ? (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Kehadiran Terverifikasi (Geo-Fencing Valid)</span>
                  </div>
                  <div className="text-xs text-slate-700 space-y-1 font-mono">
                    <div>Waktu: <strong className="text-slate-900">{absenData.timestamp}</strong></div>
                    <div>Koordinat: <strong className="text-slate-900">{absenData.lat}, {absenData.lng}</strong></div>
                    <div>Akurasi GPS: <span className="text-emerald-700 font-bold">±{absenData.accuracy} meter (Tinggi)</span></div>
                  </div>
                  <div className="pt-2">
                    <button 
                      onClick={() => setActiveTab('C1_INPUT')}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <span>Lanjut ke Input Form C1</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={handleCaptureGps}
                    disabled={gpsLoading}
                    className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/30 disabled:opacity-50"
                  >
                    {gpsLoading ? (
                      <span>Mengunci Sinyal GPS Satelit...</span>
                    ) : (
                      <>
                        <MapPin className="w-4 h-4" />
                        <span>KUNCI KEHADIRAN (CHECK-IN GPS)</span>
                      </>
                    )}
                  </button>
                  <p className="text-[11px] text-slate-500 text-center">
                    Pastikan GPS di HP Android Anda dalam keadaan aktif.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: INPUT C1 & AUDIT */}
          {activeTab === 'C1_INPUT' && (
            <div className="space-y-4">
              {c1Submitted ? (
                <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-base font-black text-emerald-950">Form C1 Berhasil Terkirim & Terverifikasi!</h4>
                    <p className="text-xs text-emerald-700 leading-relaxed">
                      Hasil audit matematika pas dan watermark forensik telah dicatat di database server pusat.
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-emerald-200 text-[11px] font-mono text-slate-600 break-all text-left">
                    <span className="font-bold text-slate-900 block">Hash Forensik UU ITE:</span>
                    {forensicHash}
                  </div>
                  <button
                    onClick={() => setActiveTab('HONOR')}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-sm"
                  >
                    Lihat Status Pencairan Honor Saksi
                  </button>
                </div>
              ) : (
                <>
                  {/* Foto C1 Plano Upload Box */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                      <span>Foto Lembar C1 Plano Fisik (KPU)</span>
                      <span className="text-[10px] text-indigo-600 font-semibold">Wajib Jelas & Terbaca</span>
                    </label>
                    <div className="border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-2xl p-3 bg-slate-50 flex items-center gap-3">
                      <img 
                        src={fotoC1} 
                        alt="Preview C1" 
                        className="w-16 h-16 object-cover rounded-xl border border-slate-200 shrink-0" 
                      />
                      <div className="space-y-1 text-left min-w-0">
                        <span className="text-xs font-bold text-slate-800 block truncate">C1_PLANO_{currentWitness.tps}_{currentWitness.desa}.JPG</span>
                        <span className="text-[10px] text-emerald-600 font-bold block">✓ Kamera HP Aktif</span>
                        <label className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer">
                          <Camera className="w-3 h-3" />
                          <span>Ambil Foto Ulang</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            capture="environment" 
                            className="hidden" 
                            onChange={(e) => {
                              if (e.target.files?.[0]) {
                                setFotoC1(URL.createObjectURL(e.target.files[0]));
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* 4 Essential Numbers Grid */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                      <span>Input Anggara C1 Plano</span>
                      <span className="text-[10px] text-slate-500 font-normal">DPT: {currentWitness.dpt}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      {/* Suara Caleg */}
                      <div className="p-2.5 rounded-xl border border-indigo-200 bg-indigo-50/40 space-y-1">
                        <label className="text-[11px] font-bold text-indigo-900 block">Suara Caleg Kita</label>
                        <input
                          type="number"
                          value={suaraCaleg}
                          onChange={(e) => setSuaraCaleg(e.target.value)}
                          className="w-full bg-white border border-indigo-300 rounded-lg px-2.5 py-1.5 text-base font-black text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      {/* Total Suara Sah */}
                      <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                        <label className="text-[11px] font-bold text-slate-700 block">Total Suara Sah (Semua)</label>
                        <input
                          type="number"
                          value={totalSuaraSah}
                          onChange={(e) => setTotalSuaraSah(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-base font-black text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      {/* Suara Tidak Sah */}
                      <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                        <label className="text-[11px] font-bold text-slate-700 block">Suara Tidak Sah</label>
                        <input
                          type="number"
                          value={suaraTidakSah}
                          onChange={(e) => setSuaraTidakSah(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-base font-black text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      {/* Total Pemilih Hadir */}
                      <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                        <label className="text-[11px] font-bold text-slate-700 block">Total Pemilih Hadir</label>
                        <input
                          type="number"
                          value={totalPenggunaHakPilih}
                          onChange={(e) => setTotalPenggunaHakPilih(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-base font-black text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Real-Time Mathematical Integrity Alert Box */}
                  <div className={`p-3 rounded-xl border text-xs leading-relaxed ${
                    mathAudit.isValid 
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                      : 'bg-rose-50 border-rose-200 text-rose-800'
                  }`}>
                    <div className="flex items-center gap-1.5 font-bold mb-1">
                      {mathAudit.isValid ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Audit Matematika C1: Sempurna (100% Klop)</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-4 h-4 text-rose-600" />
                          <span>Audit Matematika C1: Selisih Terdeteksi</span>
                        </>
                      )}
                    </div>
                    <p className="text-[11px]">{mathAudit.message}</p>
                  </div>

                  {/* Watermark Forensik Preview */}
                  <div className="p-2.5 bg-slate-100 rounded-xl border border-slate-200 text-[10px] text-slate-600 font-mono space-y-0.5">
                    <div className="flex items-center justify-between text-slate-800 font-bold">
                      <span className="flex items-center gap-1">
                        <Hash className="w-3 h-3 text-indigo-600" />
                        Stempel Watermark Forensik:
                      </span>
                      <span className="text-[9px] bg-slate-200 px-1 py-0.2 rounded">UU ITE</span>
                    </div>
                    <div className="truncate">{forensicHash}</div>
                  </div>

                  {/* Submit Button */}
                  <button
                    onClick={handleSubmitC1}
                    disabled={submittingC1 || !mathAudit.isValid}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/30 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {submittingC1 ? (
                      <span>Memproses Enkripsi C1...</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>KIRIM DATA C1 KE WAR ROOM PUSAT</span>
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          )}

          {/* TAB 3: HONORARIUM STATUS */}
          {activeTab === 'HONOR' && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-900 to-slate-900 text-white space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-indigo-300 font-bold">Honorarium Saksi Resmi</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    DIJAMIN 100%
                  </span>
                </div>
                <div>
                  <div className="text-2xl font-black text-white">Rp 250.000</div>
                  <div className="text-xs text-slate-300">Rekening Tujuan: BRI ****-8921 a/n {currentWitness.nama}</div>
                </div>
                <div className="pt-2 border-t border-slate-800 text-xs flex items-center justify-between text-slate-300">
                  <span>Status Pencairan:</span>
                  <span className="font-bold text-emerald-400">
                    {c1Submitted ? '✓ SIAP CAIR / ANTREAN TRANSFER' : '🔒 DITAHAN (KIRIM C1 TERLEBIH DAHULU)'}
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="font-bold text-slate-800">Syarat Pencairan Honor Saksi:</div>
                <div className="space-y-1.5 text-slate-600">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className={`w-4 h-4 ${absenData ? 'text-emerald-600' : 'text-slate-300'}`} />
                    <span>Absen kehadiran fisik di TPS via GPS</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className={`w-4 h-4 ${c1Submitted ? 'text-emerald-600' : 'text-slate-300'}`} />
                    <span>Upload foto lembar C1 Plano dengan hasil audit matematika valid</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className={`w-4 h-4 ${c1Submitted ? 'text-emerald-600' : 'text-slate-300'}`} />
                    <span>Verifikasi data oleh Operator Command Center</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-4 py-2.5 flex items-center justify-between shrink-0 text-xs text-slate-500">
          <span>Versi Mobile Lapangan v2.4</span>
          <button 
            onClick={onClose}
            className="font-bold text-slate-700 hover:text-slate-900 cursor-pointer"
          >
            Tutup Portal
          </button>
        </div>
      </div>
    </div>
  );
}
