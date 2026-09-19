import React, { useState } from 'react';
import { PackageTier, TIER_CAPABILITIES, TierCapability, resolvePackageTier } from '../utils/electoralData';
import { UpgradePackageModal } from './UpgradePackageModal';
import { Lock } from 'lucide-react';

interface FeatureGateProps {
  requiredFeature: keyof TierCapability;
  requiredTier?: PackageTier;
  fallbackText?: string;
  children: React.ReactNode;
}

export function FeatureGate({
  requiredFeature,
  requiredTier = 'SILVER',
  fallbackText,
  children
}: FeatureGateProps) {
  const [modalOpen, setModalOpen] = useState(false);

  // Read current package tier from localStorage or default GOLD
  const currentTier: PackageTier = (localStorage.getItem('caleg_package_tier') as PackageTier) || 'GOLD';
  const capability = TIER_CAPABILITIES[currentTier];

  const isAllowed = Boolean(capability && capability[requiredFeature]);

  if (isAllowed) {
    return <>{children}</>;
  }

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-800 text-xs font-extrabold rounded-xl transition-all cursor-pointer shadow-2xs"
        title={`Fitur ini terkunci. Dibutuhkan Paket ${requiredTier}`}
      >
        <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
        <span>{fallbackText || `Fitur Terkunci (${requiredTier})`}</span>
      </button>

      <UpgradePackageModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        requiredTier={requiredTier}
        currentTier={currentTier}
        moduleTitle={`Fitur ${String(requiredFeature)}`}
        onSimulateUpgrade={(newTier) => {
          localStorage.setItem('caleg_package_tier', newTier);
          window.location.reload();
        }}
      />
    </>
  );
}
