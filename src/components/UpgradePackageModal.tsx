import React from 'react';
import { PackageTier, TIER_CAPABILITIES } from '../utils/electoralData';
import { ShieldAlert, Sparkles, CheckCircle2, Lock, ArrowRight, X } from 'lucide-react';

interface UpgradePackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  requiredTier: PackageTier;
  currentTier: PackageTier;
  moduleTitle: string;
  onSimulateUpgrade?: (newTier: PackageTier) => void;
}

export function UpgradePackageModal({
  isOpen,
  onClose,
  requiredTier,
  currentTier,
  moduleTitle,
  onSimulateUpgrade
}: UpgradePackageModalProps) {
  if (!isOpen) return null;

  const reqCap = TIER_CAPABILITIES[requiredTier];
  const curCap = TIER_CAPABILITIES[currentTier];

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200">
        {/* Header Banner */}
        <div className="p-6 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/60 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 font-bold">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-mono font-bold tracking-wider text-amber-400 uppercase block">
                Fitur Terkunci (Gated Feature)
              </span>
              <h3 className="text-lg font-black text-white">{moduleTitle}</h3>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Modul ini membutuhkan lisensi tingkat <strong className="text-amber-300">{reqCap?.label || requiredTier}</strong>. Paket Anda saat ini: <span className="underline">{curCap?.label || currentTier}</span>.
          </p>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-5">
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Paket Aktif Anda</span>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full border ${curCap?.badgeColor}`}>
                  {curCap?.label || currentTier}
                </span>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400" />
            <div className="space-y-0.5 text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Dibutuhkan</span>
              <div>
                <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full border ${reqCap?.badgeColor}`}>
                  {reqCap?.label || requiredTier}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-extrabold text-slate-800 block">
              Keunggulan Modul & Fitur yang Akan Terbuka:
            </span>
            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Audit Keuangan Kampanye & CPV:</strong> Transparansi pengeluaran & deteksi mark-up.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Simulator Sainte-Laguë What-If:</strong> Proyeksi perebutan kursi parlemen & margin aman.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>AI OCR C1 Scanner & Multi-Admin:</strong> Verifikasi cepat tanpa ketik ulang data.</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            {onSimulateUpgrade && (
              <button
                onClick={() => {
                  onSimulateUpgrade(requiredTier);
                  onClose();
                }}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Simulasikan Upgrade ke Paket {reqCap?.label}</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs transition-colors cursor-pointer"
            >
              Kembali ke Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
