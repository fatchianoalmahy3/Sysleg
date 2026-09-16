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
  Layers
} from 'lucide-react';

interface BottomNavProps {
  activeModuleId: string;
  onModuleSelect: (id: string) => void;
  userRole: string;
  onOpenDrawer: () => void;
  onQuickAdd?: () => void;
  viewMode?: string;
}

export function BottomNav({
  activeModuleId,
  onModuleSelect,
  userRole,
  onOpenDrawer,
  onQuickAdd,
  viewMode = 'list'
}: BottomNavProps) {
  // 1. SUPER ADMIN NAVIGATION (Platform Monitoring & Caleg Approval Queue)
  if (userRole === 'SUPER_ADMIN') {
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

  // 2. RELAWAN LAPANGAN NAVIGATION (Optimized for Field Work & Fast Data Entry)
  if (userRole === 'RELAWAN_LAPANGAN') {
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

  // 2. KOORDINATOR KECAMATAN (KORCAM) NAVIGATION
  if (userRole === 'KORCAM') {
    return (
      <nav 
        id="bottom-nav-korcam"
        aria-label="Navigasi Bawah Korcam"
        className="md:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 z-40 px-2 py-1 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]"
      >
        <div className="flex items-center justify-around max-w-md mx-auto">
          {/* RAB & Aspirasi */}
          <button
            id="bottom-nav-korcam-rab"
            onClick={() => onModuleSelect('rab_aspirasi')}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer min-h-[48px] min-w-[54px] ${
              activeModuleId === 'rab_aspirasi' ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div className={`p-1 rounded-lg ${activeModuleId === 'rab_aspirasi' ? 'bg-indigo-50 text-indigo-600' : ''}`}>
              <Wallet className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-medium tracking-tight mt-0.5">RAB Wilayah</span>
          </button>

          {/* Tim Relawan */}
          <button
            id="bottom-nav-korcam-relawan"
            onClick={() => onModuleSelect('user_relawan')}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer min-h-[48px] min-w-[54px] ${
              activeModuleId === 'user_relawan' ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div className={`p-1 rounded-lg ${activeModuleId === 'user_relawan' ? 'bg-indigo-50 text-indigo-600' : ''}`}>
              <Users className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-medium tracking-tight mt-0.5">Relawan</span>
          </button>

          {/* Data Konstituen */}
          <button
            id="bottom-nav-korcam-konstituen"
            onClick={() => onModuleSelect('konstituen')}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer min-h-[48px] min-w-[54px] ${
              activeModuleId === 'konstituen' ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div className={`p-1 rounded-lg ${activeModuleId === 'konstituen' ? 'bg-indigo-50 text-indigo-600' : ''}`}>
              <Database className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-medium tracking-tight mt-0.5">Warga KTP</span>
          </button>

          {/* Menu Lainnya Drawer */}
          <button
            id="bottom-nav-korcam-menu"
            onClick={onOpenDrawer}
            className="flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer min-h-[48px] min-w-[54px] text-slate-500 hover:text-slate-800"
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

  // 3. CALEG UTAMA / SUPER ADMIN NAVIGATION
  return (
    <nav 
      id="bottom-nav-caleg"
      aria-label="Navigasi Bawah Caleg"
      className="md:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 z-40 px-1 py-1 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {/* Command Center Dashboard */}
        <button
          id="bottom-nav-caleg-dashboard"
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

        {/* Master Dapil */}
        <button
          id="bottom-nav-caleg-dapil"
          onClick={() => onModuleSelect('master_dapil')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer min-h-[48px] min-w-[50px] ${
            activeModuleId === 'master_dapil' ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className={`p-1 rounded-lg ${activeModuleId === 'master_dapil' ? 'bg-indigo-50 text-indigo-600' : ''}`}>
            <MapPin className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-medium tracking-tight mt-0.5">Dapil</span>
        </button>

        {/* Tim Relawan */}
        <button
          id="bottom-nav-caleg-relawan"
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

        {/* Data Warga Konstituen */}
        <button
          id="bottom-nav-caleg-konstituen"
          onClick={() => onModuleSelect('konstituen')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer min-h-[48px] min-w-[50px] ${
            activeModuleId === 'konstituen' ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className={`p-1 rounded-lg ${activeModuleId === 'konstituen' ? 'bg-indigo-50 text-indigo-600' : ''}`}>
            <Database className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-medium tracking-tight mt-0.5">Warga</span>
        </button>

        {/* Menu Lainnya Drawer */}
        <button
          id="bottom-nav-caleg-menu"
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
