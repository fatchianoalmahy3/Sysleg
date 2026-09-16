import React, { useState } from 'react';
import { ModuleSchema, PageViewMode } from '../core/types';
import { BottomNav } from './BottomNav';
import { SyncNotificationBanner } from './SyncNotificationBanner';
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
  ChevronRight
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
  onShowToast
}: LayoutProps) {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'LayoutDashboard':
      case 'Home': return <Home className="w-4 h-4" />;
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
      default: return <Layers className="w-4 h-4" />;
    }
  };

  const MODULE_GROUPS = [
    {
      id: 'komando',
      label: 'Pusat Komando',
      moduleIds: ['dashboard'],
    },
    {
      id: 'teritorial',
      label: 'Teritorial & Pemilih',
      moduleIds: ['master_dapil', 'data_dpt', 'konstituen'],
    },
    {
      id: 'tim',
      label: 'Struktur & Personalia',
      moduleIds: ['master_caleg', 'user_relawan'],
    },
    {
      id: 'logistik',
      label: 'Logistik & Keuangan',
      moduleIds: ['rab_aspirasi', 'lpj_kegiatan'],
    },
    {
      id: 'pemilu',
      label: 'Hari Pemilihan (E-Day)',
      moduleIds: ['quick_count_c1'],
    },
    {
      id: 'sistem',
      label: 'Platform SaaS',
      moduleIds: ['saas_tenant_approval', 'saas_pricing_matrix', 'saas_system_settings'],
    },
  ];

  const roles = [
    { value: 'SUPER_ADMIN', label: '🛡️ Superadmin (Platform SaaS)' },
    { value: 'CALEG_UTAMA', label: '👑 Caleg Utama (Kandidat)' },
    { value: 'TIM_SES', label: '🎯 Tim Ses Utama (Sekretariat)' },
    { value: 'KORCAM', label: '👥 Koordinator Kecamatan' },
    { value: 'RELAWAN_LAPANGAN', label: '📱 Relawan Lapangan (TPS)' }
  ];

  const handleModuleClick = (id: string) => {
    onModuleSelect(id);
    setMobileDrawerOpen(false);
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
        w-64 bg-[#0f172a] text-slate-300 flex flex-col flex-shrink-0 border-r border-slate-800
        transform transition-transform duration-200 ease-in-out
        ${mobileDrawerOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Brand Header */}
        <div className="p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center font-black text-white shadow-md shadow-indigo-600/30">
              SK
            </div>
            <div>
              <span className="text-base font-black tracking-tight text-white block">Pemenangan App</span>
              <span className="text-[10px] text-indigo-400 font-mono font-bold tracking-wider uppercase block">Caleg Kabupaten v1</span>
            </div>
          </div>
          <button 
            onClick={() => setMobileDrawerOpen(false)}
            className="md:hidden p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modules Navigation Links - Grouped & Categorized */}
        <nav className="p-3.5 space-y-4 flex-1 overflow-y-auto">
          {MODULE_GROUPS.map((group) => {
            const availableModules = modules.filter(
              (mod) => group.moduleIds.includes(mod.id) && mod.allowedRoles.includes(userRole)
            );

            if (availableModules.length === 0) return null;

            return (
              <div key={group.id} className="space-y-1">
                <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold px-2.5 py-1">
                  {group.label}
                </div>
                <div className="space-y-0.5">
                  {availableModules.map((mod) => {
                    const isActive = activeModuleId === mod.id;

                    return (
                      <button
                        key={mod.id}
                        id={`sidebar-nav-${mod.id}`}
                        onClick={() => handleModuleClick(mod.id)}
                        className={`w-full flex items-center justify-between gap-2.5 px-3 py-2 rounded-xl transition-all text-left cursor-pointer min-h-[38px] ${
                          isActive
                            ? 'bg-indigo-600 text-white font-bold shadow-sm shadow-indigo-600/30'
                            : 'hover:bg-slate-800/80 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-300'}>
                            {getIcon(mod.icon)}
                          </span>
                          <span className="text-xs font-semibold truncate">{mod.title}</span>
                        </div>
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
              <span className="text-slate-300 font-medium">Firestore DB</span>
            </div>
            <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
              sysleg-5d4b8
            </span>
          </div>
        </nav>

        {/* User Role Simulator Footer */}
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
              <span className="text-sm sm:text-base font-extrabold text-slate-900">
                Pemenangan Caleg Command
              </span>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-50 text-[10px] font-bold text-emerald-700 rounded-full border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Firestore (sysleg-5d4b8)
              </span>
              {userRole === 'RELAWAN_LAPANGAN' && (
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
      />
    </div>
  );
}
