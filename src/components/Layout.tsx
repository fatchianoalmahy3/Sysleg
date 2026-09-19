import React, { useState, useMemo } from 'react';
import { ModuleSchema, PageViewMode } from '../core/types';
import { BottomNav, DashboardLensType } from './BottomNav';
import { SyncNotificationBanner } from './SyncNotificationBanner';
import { UpgradePackageModal } from './UpgradePackageModal';
import { 
  PackageTier, 
  TIER_CAPABILITIES, 
  isModuleTierAllowed, 
  resolvePackageTier 
} from '../utils/electoralData';
import { 
  Package, 
  Users, 
  Receipt, 
  History, 
  ShieldAlert, 
  Key, 
  Database, 
  Menu, 
  X, 
  Layers, 
  SlidersHorizontal, 
  Home, 
  CheckCircle2, 
  FileSpreadsheet,
  LogOut,
  ShieldCheck,
  Building2,
  Award,
  Wallet,
  MapPin,
  UserCircle,
  CreditCard,
  Settings,
  ChevronRight,
  ChevronDown,
  Target,
  FileCheck2,
  Sparkles,
  Search,
  Lock
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  modules: ModuleSchema[];
  activeModuleId: string;
  onModuleSelect: (id: string) => void;
  userRole: string;
  onRoleChange: (role: string) => void;
  viewMode?: PageViewMode | 'print';
  onViewModeChange?: (mode: PageViewMode) => void;
  onQuickAdd?: () => void;
  onLogout?: () => void;
  onSyncSuccess?: () => void;
  onShowToast?: (message: string, type: 'success' | 'warning' | 'error' | 'info', title?: string) => void;
  dashboardLens?: DashboardLensType;
  onLensChange?: (lens: DashboardLensType) => void;
}

export function Layout({
  children,
  modules,
  activeModuleId,
  onModuleSelect,
  userRole,
  onRoleChange,
  viewMode = 'list',
  onViewModeChange,
  onQuickAdd,
  onLogout,
  onSyncSuccess,
  onShowToast,
  dashboardLens = 'IKHTISAR',
  onLensChange
}: LayoutProps) {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [navSearchQuery, setNavSearchQuery] = useState('');
  
  // Package Tier State (Simulated / Stored in localStorage)
  const [activePackageTier, setActivePackageTier] = useState<PackageTier>(() => {
    const saved = localStorage.getItem('caleg_package_tier');
    return (saved as PackageTier) || 'GOLD';
  });

  // Upgrade Modal State
  const [upgradeModalInfo, setUpgradeModalInfo] = useState<{
    isOpen: boolean;
    requiredTier: PackageTier;
    moduleTitle: string;
  }>({
    isOpen: false,
    requiredTier: 'SILVER',
    moduleTitle: ''
  });

  const handleTierChange = (newTier: PackageTier) => {
    setActivePackageTier(newTier);
    localStorage.setItem('caleg_package_tier', newTier);
    if (onShowToast) {
      onShowToast(`Paket Langganan disimulasikan sebagai: ${TIER_CAPABILITIES[newTier].label}`, 'info', 'Status Paket SaaS');
    }
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'LayoutDashboard':
      case 'Home': return <Home className="w-4 h-4" />;
      case 'Target': return <Target className="w-4 h-4" />;
      case 'ShieldCheck': return <ShieldCheck className="w-4 h-4" />;
      case 'Building2': return <Building2 className="w-4 h-4" />;
      case 'Package': return <Package className="w-4 h-4" />;
      case 'Users': return <Users className="w-4 h-4" />;
      case 'Receipt': return <Receipt className="w-4 h-4" />;
      case 'History': return <History className="w-4 h-4" />;
      case 'Database': return <Database className="w-4 h-4" />;
      case 'Award': return <Award className="w-4 h-4" />;
      case 'Wallet': return <Wallet className="w-4 h-4" />;
      case 'MapPin': return <MapPin className="w-4 h-4" />;
      case 'UserCircle': return <UserCircle className="w-4 h-4" />;
      case 'CreditCard': return <CreditCard className="w-4 h-4" />;
      case 'Settings': return <Settings className="w-4 h-4" />;
      case 'FileSpreadsheet': return <FileSpreadsheet className="w-4 h-4" />;
      case 'FileCheck2': return <FileCheck2 className="w-4 h-4" />;
      default: return <Layers className="w-4 h-4" />;
    }
  };

  // 4 Strategic Navigation Groups Aligned with Organization Tupoksi
  const MODULE_GROUPS = [
    {
      id: 'komando',
      label: '1. Command & Strategi Elektoral',
      badge: 'Eksekutif',
      moduleIds: ['dashboard', 'target_dapil_wilayah', 'simulasi_sainte_lague', 'quick_count_c1'],
    },
    {
      id: 'operasional',
      label: '2. Operasional Pasukan & Pemilih',
      badge: 'Teritorial',
      moduleIds: ['data_dpt', 'konstituen', 'user_relawan', 'master_dapil'],
    },
    {
      id: 'keuangan',
      label: '3. Audit Keuangan & Logistik',
      badge: 'Akuntabilitas',
      moduleIds: ['rab_aspirasi', 'anggaran_kampanye', 'lpj_kegiatan', 'standar_harga_daerah'],
    },
    {
      id: 'sistem',
      label: '4. Pusat Sistem & Kelengkapan Resmi',
      badge: 'Tata Kelola',
      moduleIds: ['master_caleg', 'saas_tenant_approval', 'saas_pricing_matrix', 'saas_system_settings', 'manajemen_tenant_saas'],
    },
  ];

  const roles = [
    { value: 'developer', label: '🛠️ Developer (God Mode)' },
    { value: 'administrator', label: '💼 Administrator (SaaS Owner)' },
    { value: 'superadmin', label: '👑 Caleg / Superadmin (Kandidat)' },
    { value: 'koordinator', label: '👥 Koordinator Wilayah (Korcam)' },
    { value: 'relawan', label: '📱 Relawan Lapangan (Canvasser)' },
    { value: 'demo', label: '✨ Demo Klien Interaktif' }
  ];

  const handleModuleClick = (id: string) => {
    onModuleSelect(id);
    setMobileDrawerOpen(false);
  };

  // Map module badges for visual ergonomics
  const getModuleBadge = (modId: string) => {
    switch (modId) {
      case 'dashboard': return { text: 'War Room', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' };
      case 'simulasi_sainte_lague': return { text: '7 Kursi', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
      case 'quick_count_c1': return { text: 'Forensik', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
      case 'rab_aspirasi': return { text: '+5% Darurat', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' };
      case 'standar_harga_daerah': return { text: 'AI Benchmark', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' };
      case 'lpj_kegiatan': return { text: 'SILPA', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
      case 'user_relawan': return { text: '21 Korcam', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' };
      case 'konstituen': return { text: 'e-KTP', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' };
      default: return null;
    }
  };

  return (
    <div className="h-full flex overflow-hidden font-sans bg-[#f8fafc] text-slate-900 antialiased">
      {/* Mobile Drawer Overlay Backdrop */}
      {mobileDrawerOpen && (
        <div 
          onClick={() => setMobileDrawerOpen(false)}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 md:hidden transition-opacity"
        />
      )}

      {/* Sidebar Layout (Desktop & Mobile Slide-Over Drawer) */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50
        w-72 bg-[#0f172a] text-slate-300 flex flex-col flex-shrink-0 border-r border-slate-800
        transform transition-transform duration-200 ease-in-out
        ${mobileDrawerOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Brand Header */}
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-800 bg-[#0b1120]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-indigo-500 rounded-xl flex items-center justify-center font-black text-white shadow-md shadow-indigo-600/30 tracking-tight text-sm">
              CE
            </div>
            <div>
              <span className="text-sm font-black tracking-tight text-white block">CAKRA ELEKTORAL</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] text-indigo-400 font-mono font-bold tracking-wider uppercase block">Dapil Ponorogo 1</span>
              </div>
            </div>
          </div>
          <button 
            onClick={() => setMobileDrawerOpen(false)}
            className="md:hidden p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Search in Nav */}
        <div className="px-3 pt-3 pb-1">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Cari modul / fitur (Tupoksi)..."
              value={navSearchQuery}
              onChange={(e) => setNavSearchQuery(e.target.value)}
              className="w-full pl-8.5 pr-3 py-1.5 text-xs bg-slate-900/90 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
            />
            {navSearchQuery && (
              <button 
                onClick={() => setNavSearchQuery('')} 
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Modules Navigation Links - 4 Semantic Tupoksi Groups */}
        <nav className="p-3 space-y-4 flex-1 overflow-y-auto custom-scrollbar">
          {MODULE_GROUPS.map((group) => {
            const groupModules = modules.filter((mod) => group.moduleIds.includes(mod.id));
            
            // Apply role visibility filter (developer can see all)
            const roleAllowedModules = groupModules.filter(
              (mod) => userRole === 'developer' || mod.allowedRoles.includes(userRole)
            );

            // Apply search filter if search query exists
            const availableModules = navSearchQuery.trim()
              ? roleAllowedModules.filter((m) => 
                  m.title.toLowerCase().includes(navSearchQuery.toLowerCase()) ||
                  m.description.toLowerCase().includes(navSearchQuery.toLowerCase())
                )
              : roleAllowedModules;

            if (availableModules.length === 0) return null;

            return (
              <div key={group.id} className="space-y-1">
                <div className="flex items-center justify-between px-2.5 py-1">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-extrabold">
                    {group.label}
                  </span>
                  <span className="text-[9px] font-bold text-slate-500 bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700/50">
                    {group.badge}
                  </span>
                </div>
                <div className="space-y-0.5">
                  {availableModules.map((mod) => {
                    const isActive = activeModuleId === mod.id;
                    const badge = getModuleBadge(mod.id);
                    const isAllowedByTier = userRole === 'developer' || isModuleTierAllowed(mod.requiredTier, activePackageTier);

                    return (
                      <button
                        key={mod.id}
                        id={`sidebar-nav-${mod.id}`}
                        onClick={() => {
                          if (!isAllowedByTier && mod.requiredTier) {
                            setUpgradeModalInfo({
                              isOpen: true,
                              requiredTier: mod.requiredTier,
                              moduleTitle: mod.title
                            });
                          } else {
                            handleModuleClick(mod.id);
                          }
                        }}
                        className={`w-full flex items-center justify-between gap-2.5 px-3 py-2 rounded-xl transition-all text-left cursor-pointer min-h-[38px] ${
                          isActive
                            ? 'bg-indigo-600 text-white font-bold shadow-sm shadow-indigo-600/30'
                            : !isAllowedByTier
                            ? 'opacity-70 hover:opacity-100 hover:bg-slate-800/60 text-slate-400'
                            : 'hover:bg-slate-800/80 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <span className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-300'}>
                            {getIcon(mod.icon)}
                          </span>
                          <span className="text-xs font-semibold truncate">{mod.title}</span>
                        </div>

                        {!isAllowedByTier && (
                          <span className="flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded border bg-amber-500/10 text-amber-400 border-amber-500/20 shrink-0">
                            <Lock className="w-2.5 h-2.5 text-amber-400" />
                            <span>{mod.requiredTier}</span>
                          </span>
                        )}

                        {isAllowedByTier && badge && !isActive && (
                          <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border ${badge.color} shrink-0`}>
                            {badge.text}
                          </span>
                        )}

                        {isActive && (
                          <ChevronRight className="w-3.5 h-3.5 text-indigo-200 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Cloud Database Connection Status Indicator */}
          <div className="mt-4 px-3 py-2 bg-slate-900/90 rounded-xl border border-slate-800 text-[11px] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-300 font-medium">Firestore DB (Live)</span>
            </div>
            <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
              sysleg-5d4b8
            </span>
          </div>
        </nav>

          {/* User Role & Package Tier Simulator Footer */}
          <div className="p-4 border-t border-slate-800 bg-[#0b0f19] space-y-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-slate-400 font-bold px-1">
                <span className="flex items-center gap-1.5">
                  <Key className="w-3 h-3 text-indigo-400" />
                  Simulasi Tupoksi (Role)
                </span>
                <span className="text-[9px] text-indigo-400 font-mono">LIVE</span>
              </div>
              <select
                value={userRole}
                onChange={(e) => onRoleChange(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 hover:border-slate-600 rounded-xl text-xs py-2 px-3 text-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                {roles.map((r) => (
                  <option key={r.value} value={r.value} className="bg-slate-900 text-white">
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Package Tier Simulator */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-slate-400 font-bold px-1">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  Lisensi Paket SaaS
                </span>
                <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${TIER_CAPABILITIES[activePackageTier]?.badgeColor}`}>
                  {activePackageTier}
                </span>
              </div>
              <select
                value={activePackageTier}
                onChange={(e) => handleTierChange(e.target.value as PackageTier)}
                className="w-full bg-slate-900 border border-slate-700 hover:border-slate-600 rounded-xl text-xs py-2 px-3 text-amber-300 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
              >
                <option value="BRONZE">🥉 Bronze Pratama (DPRD Kab/Kota)</option>
                <option value="SILVER">🥈 Silver Madya (DPRD Provinsi)</option>
                <option value="GOLD">🥇 Gold Utama (DPR-RI)</option>
                <option value="PLATINUM">💎 Platinum Senator (DPD-RI)</option>
                <option value="ENTERPRISE">👑 Enterprise Victory (Pilkada Kepala Daerah)</option>
              </select>
            </div>

            {/* Sidebar Logout Button */}
            {onLogout && (
              <button
                id="btn-sidebar-logout"
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-600 border border-rose-500/20 hover:border-rose-600 rounded-xl transition-all cursor-pointer min-h-[40px]"
                title="Keluar dari Akun"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Keluar Akun</span>
              </button>
            )}
          </div>
        </aside>

      {/* Main Container Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#f8fafc] pb-16 md:pb-0 overflow-hidden">
        {/* Dynamic Top App Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 md:px-8 flex items-center justify-between flex-shrink-0 shadow-2xs z-10">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
              title="Buka Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <span className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                CAKRA ELEKTORAL <span className="text-slate-400 font-normal hidden sm:inline">• War Room Ponorogo</span>
              </span>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-50 text-[10px] font-bold text-emerald-700 rounded-full border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Firestore (sysleg-5d4b8)
              </span>
              {userRole === 'relawan' && (
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 bg-indigo-50 text-[10px] font-bold text-indigo-700 rounded-full border border-indigo-200">
                  <CheckCircle2 className="w-3 h-3 text-indigo-500" />
                  Mode Lapangan (Auto Geo-Tag)
                </span>
              )}
            </div>
          </div>

          {/* Header Right Area: User Role Badge & Header Logout Button */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Peran Saat Ini</div>
              <div className="text-xs font-extrabold text-indigo-600">
                {userRole.replace(/_/g, ' ')}
              </div>
            </div>

            {onLogout && (
              <button
                id="btn-header-logout"
                onClick={onLogout}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-xl transition-all cursor-pointer min-h-[40px]"
                title="Keluar dari Sesi Sistem"
              >
                <LogOut className="w-4 h-4 text-slate-500 group-hover:text-rose-600" />
                <span className="hidden sm:inline">Keluar</span>
              </button>
            )}
          </div>
        </header>

        {/* Scrollable Viewport Content */}
        <div className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto min-h-0 pb-28 md:pb-8">
          <SyncNotificationBanner onSyncSuccess={onSyncSuccess} onShowToast={onShowToast} />
          {children}
        </div>
      </main>

      {/* Mobile Smartphone Bottom Navigation Bar */}
      <BottomNav
        activeModuleId={activeModuleId}
        onModuleSelect={handleModuleClick}
        userRole={userRole}
        onOpenDrawer={() => setMobileDrawerOpen(true)}
        onQuickAdd={onQuickAdd}
        viewMode={viewMode}
        dashboardLens={dashboardLens}
        onLensChange={onLensChange}
      />

      {/* Feature Gating Upgrade Modal */}
      <UpgradePackageModal
        isOpen={upgradeModalInfo.isOpen}
        onClose={() => setUpgradeModalInfo(prev => ({ ...prev, isOpen: false }))}
        requiredTier={upgradeModalInfo.requiredTier}
        currentTier={activePackageTier}
        moduleTitle={upgradeModalInfo.moduleTitle}
        onSimulateUpgrade={(newTier) => handleTierChange(newTier)}
      />
    </div>
  );
}

