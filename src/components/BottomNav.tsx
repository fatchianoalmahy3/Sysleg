import React from 'react';
import { 
  Home, 
  Users, 
  Database, 
  MapPin, 
  Wallet, 
  Menu, 
  Plus, 
  UserCheck, 
  Layers,
  Award,
  FileCheck2,
  Flame,
  Map,
  ShieldCheck,
  LayoutGrid
} from 'lucide-react';

export type DashboardLensType = 'IKHTISAR' | 'PETA_TERITORI' | 'TPS_PASUKAN' | 'C1_REALCOUNT' | 'SEMUA';

interface BottomNavProps {
  activeModuleId: string;
  onModuleSelect: (id: string) => void;
  userRole: string;
  onOpenDrawer: () => void;
  onQuickAdd?: () => void;
  viewMode?: string;
  dashboardLens?: DashboardLensType;
  onLensChange?: (lens: DashboardLensType) => void;
}

export function BottomNav({
  activeModuleId,
  onModuleSelect,
  userRole,
  onOpenDrawer,
  onQuickAdd,
  viewMode = 'list',
  dashboardLens = 'IKHTISAR',
  onLensChange
}: BottomNavProps) {
  // =========================================================================
  // 1. CONTEXT: INSIDE DASHBOARD (COMMAND CENTER LENSES FOR ONE-THUMB FOCUS)
  // When on the Dashboard module, the Bottom Nav dynamically transforms into
  // the 4 Strategic Lenses + Menu Drawer for zero-clutter mobile experience.
  // =========================================================================
  if (activeModuleId === 'dashboard') {
    const handleLensClick = (lens: DashboardLensType) => {
      if (onLensChange) {
        onLensChange(lens);
      }
    };

    return (
      <nav 
        id="bottom-nav-dashboard-context"
        aria-label="Navigasi Lensa Dashboard Mobile"
        className="md:hidden fixed bottom-0 inset-x-0 bg-slate-950/95 backdrop-blur-md border-t border-indigo-500/30 z-40 px-1 py-1 shadow-[0_-4px_24px_rgba(0,0,0,0.4)]"
      >
        <div className="flex items-center justify-around max-w-lg mx-auto">
          {/* Lensa 1: Ikhtisar Eksekutif (Ringkasan Kemenangan) */}
          <button
            id="bottom-nav-lens-ikhtisar"
            onClick={() => handleLensClick('IKHTISAR')}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer min-h-[48px] min-w-[54px] ${
              dashboardLens === 'IKHTISAR' 
                ? 'text-indigo-400 font-black' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className={`p-1 rounded-lg transition-all ${
              dashboardLens === 'IKHTISAR' 
                ? 'bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500/50 shadow-xs' 
                : ''
            }`}>
              <Flame className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold tracking-tight mt-0.5">Ringkasan</span>
          </button>

          {/* Lensa 2: Radar Teritori GIS (Peta Desa & Rawan) */}
          <button
            id="bottom-nav-lens-peta"
            onClick={() => handleLensClick('PETA_TERITORI')}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer min-h-[48px] min-w-[54px] ${
              dashboardLens === 'PETA_TERITORI' 
                ? 'text-indigo-400 font-black' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className={`p-1 rounded-lg transition-all ${
              dashboardLens === 'PETA_TERITORI' 
                ? 'bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500/50 shadow-xs' 
                : ''
            }`}>
              <Map className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold tracking-tight mt-0.5">Peta Radar</span>
          </button>

          {/* Lensa 3: Benteng TPS & Pasukan Saksi */}
          <button
            id="bottom-nav-lens-saksi"
            onClick={() => handleLensClick('TPS_PASUKAN')}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer min-h-[48px] min-w-[54px] ${
              dashboardLens === 'TPS_PASUKAN' 
                ? 'text-indigo-400 font-black' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className={`p-1 rounded-lg transition-all ${
              dashboardLens === 'TPS_PASUKAN' 
                ? 'bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500/50 shadow-xs' 
                : ''
            }`}>
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold tracking-tight mt-0.5">Saksi TPS</span>
          </button>

          {/* Lensa 4: C1 Plano & Real-Count */}
          <button
            id="bottom-nav-lens-c1"
            onClick={() => handleLensClick('C1_REALCOUNT')}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer min-h-[48px] min-w-[54px] ${
              dashboardLens === 'C1_REALCOUNT' 
                ? 'text-indigo-400 font-black' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className={`p-1 rounded-lg transition-all ${
              dashboardLens === 'C1_REALCOUNT' 
                ? 'bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500/50 shadow-xs' 
                : ''
            }`}>
              <FileCheck2 className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold tracking-tight mt-0.5">C1 Plano</span>
          </button>

          {/* Drawer Menu Modul Lainnya */}
          <button
            id="bottom-nav-dashboard-menu"
            onClick={onOpenDrawer}
            className="flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer min-h-[48px] min-w-[50px] text-slate-400 hover:text-slate-200"
          >
            <div className="p-1 rounded-lg">
              <Menu className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-medium tracking-tight mt-0.5">Menu</span>
          </button>
        </div>
      </nav>
    );
  }

  // =========================================================================
  // 2. CONTEXT: RELAWAN ROLE (FIELD GROUND WORK & DIRECT SCAN ENTRY)
  // =========================================================================
  if (userRole === 'relawan') {
    const isDataActive = activeModuleId === 'konstituen' && viewMode !== 'create';
    const isCreateActive = activeModuleId === 'konstituen' && viewMode === 'create';

    return (
      <nav 
        id="bottom-nav-relawan"
        aria-label="Navigasi Bawah Relawan"
        className="md:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 z-40 px-3 py-1.5 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]"
      >
        <div className="flex items-center justify-around max-w-md mx-auto relative">
          {/* Data Konstituen (Warga) */}
          <button
            id="bottom-nav-relawan-data"
            onClick={() => onModuleSelect('konstituen')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer min-h-[48px] min-w-[56px] ${
              isDataActive 
                ? 'text-indigo-600 font-bold' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div className={`p-1 rounded-lg ${isDataActive ? 'bg-indigo-50 text-indigo-600' : ''}`}>
              <Database className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-medium tracking-tight mt-0.5">Data Warga</span>
          </button>

          {/* Center Prominent (+) Input KTP Button */}
          <div className="relative -top-4 flex flex-col items-center">
            <button
              id="bottom-nav-relawan-quick-add"
              onClick={() => {
                if (onQuickAdd) {
                  onQuickAdd();
                } else {
                  onModuleSelect('konstituen');
                }
              }}
              className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg transition-transform active:scale-95 cursor-pointer border-4 border-white ${
                isCreateActive
                  ? 'bg-emerald-600 shadow-emerald-600/30 ring-2 ring-emerald-400'
                  : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/35'
              }`}
              title="Input KTP & Scan Baru"
            >
              <Plus className="w-7 h-7 stroke-[2.5]" />
            </button>
            <span className="text-[10px] font-bold text-slate-700 mt-0.5">
              {isCreateActive ? 'Sedang Input' : 'Input KTP'}
            </span>
          </div>

          {/* Menu Lain / Profil Drawer */}
          <button
            id="bottom-nav-relawan-menu"
            onClick={onOpenDrawer}
            className="flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer min-h-[48px] min-w-[56px] text-slate-500 hover:text-slate-800"
          >
            <div className="p-1 rounded-lg">
              <Menu className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-medium tracking-tight mt-0.5">Menu / Profil</span>
          </button>
        </div>
      </nav>
    );
  }

  // =========================================================================
  // 3. CONTEXT: SUPERADMIN / DEVELOPER WORKSPACE
  // =========================================================================
  if (userRole === 'developer') {
    return (
      <nav 
        id="bottom-nav-superadmin"
        aria-label="Navigasi Bawah Superadmin"
        className="md:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 z-40 px-1 py-1 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]"
      >
        <div className="flex items-center justify-around max-w-lg mx-auto">
          {/* Dashboard Command Center */}
          <button
            id="bottom-nav-sa-dashboard"
            onClick={() => onModuleSelect('dashboard')}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer min-h-[48px] min-w-[50px] ${
              activeModuleId === 'dashboard' ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div className={`p-1 rounded-lg ${activeModuleId === 'dashboard' ? 'bg-indigo-50 text-indigo-600' : ''}`}>
              <Home className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-medium tracking-tight mt-0.5">Beranda</span>
          </button>

          {/* Antrean Persetujuan Caleg (SaaS Approval) */}
          <button
            id="bottom-nav-sa-approval"
            onClick={() => onModuleSelect('saas_tenant_approval')}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer min-h-[48px] min-w-[50px] ${
              activeModuleId === 'saas_tenant_approval' ? 'text-emerald-600 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div className={`p-1 rounded-lg ${activeModuleId === 'saas_tenant_approval' ? 'bg-emerald-50 text-emerald-600' : ''}`}>
              <UserCheck className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-medium tracking-tight mt-0.5">Approval</span>
          </button>

          {/* Data Caleg */}
          <button
            id="bottom-nav-sa-caleg"
            onClick={() => onModuleSelect('master_caleg')}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer min-h-[48px] min-w-[50px] ${
              activeModuleId === 'master_caleg' ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div className={`p-1 rounded-lg ${activeModuleId === 'master_caleg' ? 'bg-indigo-50 text-indigo-600' : ''}`}>
              <Layers className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-medium tracking-tight mt-0.5">Caleg</span>
          </button>

          {/* Manajemen Relawan Global */}
          <button
            id="bottom-nav-sa-relawan"
            onClick={() => onModuleSelect('user_relawan')}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer min-h-[48px] min-w-[50px] ${
              activeModuleId === 'user_relawan' ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div className={`p-1 rounded-lg ${activeModuleId === 'user_relawan' ? 'bg-indigo-50 text-indigo-600' : ''}`}>
              <Users className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-medium tracking-tight mt-0.5">Relawan</span>
          </button>

          {/* Menu Lainnya Drawer */}
          <button
            id="bottom-nav-sa-menu"
            onClick={onOpenDrawer}
            className="flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer min-h-[48px] min-w-[50px] text-slate-500 hover:text-slate-800"
          >
            <div className="p-1 rounded-lg">
              <Menu className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-medium tracking-tight mt-0.5">Lainnya</span>
          </button>
        </div>
      </nav>
    );
  }

  // =========================================================================
  // 4. CONTEXT: DATA MODULES (E.G. KONSTITUEN, RELAWAN, LOGISTIK, ETC.)
  // Bottom Nav provides instant Action (Quick Add), List view, Dashboard jump, and Menu.
  // =========================================================================
  const isDataListing = viewMode === 'list';
  const isCreating = viewMode === 'create';

  return (
    <nav 
      id="bottom-nav-data-context"
      aria-label="Navigasi Bawah Modul Data"
      className="md:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 z-40 px-2 py-1 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto relative">
        {/* Tombol Balik ke Dashboard Cockpit */}
        <button
          id="bottom-nav-data-back-dashboard"
          onClick={() => onModuleSelect('dashboard')}
          className="flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer min-h-[48px] min-w-[50px] text-slate-500 hover:text-indigo-600"
        >
          <div className="p-1 rounded-lg hover:bg-indigo-50">
            <Home className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-medium tracking-tight mt-0.5">Cockpit</span>
        </button>

        {/* Tombol Data List Aktif */}
        <button
          id="bottom-nav-data-list"
          onClick={() => {
            if (viewMode !== 'list') {
              onModuleSelect(activeModuleId);
            }
          }}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer min-h-[48px] min-w-[50px] ${
            isDataListing ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className={`p-1 rounded-lg ${isDataListing ? 'bg-indigo-50 text-indigo-600' : ''}`}>
            <Database className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-medium tracking-tight mt-0.5">Data Tabel</span>
        </button>

        {/* Center Prominent (+) Input Data Baru */}
        {onQuickAdd && (
          <div className="relative -top-3 flex flex-col items-center">
            <button
              id="bottom-nav-data-quick-add"
              onClick={onQuickAdd}
              className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg transition-transform active:scale-95 cursor-pointer border-2 border-white ${
                isCreating
                  ? 'bg-emerald-600 shadow-emerald-600/30 ring-2 ring-emerald-400'
                  : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/35'
              }`}
              title="Tambah Data Baru"
            >
              <Plus className="w-6 h-6 stroke-[2.5]" />
            </button>
            <span className="text-[9px] font-bold text-slate-700 mt-0.5">
              {isCreating ? 'Sedang Input' : '+ Input'}
            </span>
          </div>
        )}

        {/* Tombol Sainte-Lague / Parlemen Shortcut */}
        <button
          id="bottom-nav-data-kursi"
          onClick={() => onModuleSelect('simulasi_sainte_lague')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer min-h-[48px] min-w-[50px] ${
            activeModuleId === 'simulasi_sainte_lague' ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className={`p-1 rounded-lg ${activeModuleId === 'simulasi_sainte_lague' ? 'bg-indigo-50 text-indigo-600' : ''}`}>
            <Award className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-medium tracking-tight mt-0.5">Kursi</span>
        </button>

        {/* Menu Lainnya Drawer */}
        <button
          id="bottom-nav-data-menu"
          onClick={onOpenDrawer}
          className="flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer min-h-[48px] min-w-[50px] text-slate-500 hover:text-slate-800"
        >
          <div className="p-1 rounded-lg">
            <Menu className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-medium tracking-tight mt-0.5">Menu</span>
        </button>
      </div>
    </nav>
  );
}

