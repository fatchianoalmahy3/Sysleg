import React, { useState, useEffect } from 'react';
import { MODULE_REGISTRY } from './core/registry';
import { PageViewMode, ToastMessage } from './core/types';
import { useModule } from './hooks/useModule';
import { Layout } from './components/Layout';
import { ListView } from './views/ListView';
import { FormView } from './views/FormView';
import { DetailView } from './views/DetailView';
import { ImportExportView } from './views/ImportExportView';
import { PrintDocumentView } from './views/PrintDocumentView';
import { DashboardView } from './views/DashboardView';
import { LandingView } from './views/LandingView';
import { ToastContainer } from './components/Toast';
import { ConfirmDialog } from './components/ConfirmDialog';
import { FirebaseDataService, isConfigured } from './services/firebase';
import { ApiService } from './services/api';
import { 
  classifyRegionPriority, 
  auditExpenseItem, 
  calculateCostPerVote 
} from './services/electionMath';
import { 
  Terminal, 
  ShieldAlert, 
  Code2,
  DatabaseZap
} from 'lucide-react';

// Helper function to normalize role identifiers to canonical system roles
export const normalizeRole = (rawRole: string): string => {
  if (!rawRole) return 'superadmin';
  const r = rawRole.toUpperCase().trim();
  if (r === 'DEVELOPER' || r === 'DEV' || r === 'GOD_MODE' || r === 'GODMODE') return 'developer';
  if (r === 'CALEG_UTAMA' || r === 'SUPER_ADMIN' || r === 'CALEG' || r === 'SUPERADMIN') return 'superadmin';
  if (r === 'KORCAM' || r === 'TIM_SES' || r === 'KOORDINATOR') return 'koordinator';
  if (r === 'RELAWAN_LAPANGAN' || r === 'RELAWAN' || r === 'SAKSI_TPS') return 'relawan';
  if (r === 'ADMINISTRATOR' || r === 'ADMIN') return 'administrator';
  if (r === 'DEMO') return 'demo';
  return rawRole.toLowerCase();
};

export default function App() {
  const [appState, setAppState] = useState<'landing' | 'app'>(() => {
    return localStorage.getItem('is_logged_in') ? 'app' : 'landing';
  });

  // Strict Guardrail Check
  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-rose-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border-2 border-rose-200 p-8 text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-sm">
            <DatabaseZap className="w-10 h-10" />
          </div>
          <div className="space-y-3">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Koneksi Database Terputus</h1>
            <p className="text-sm text-slate-600 leading-relaxed font-medium">
              Aplikasi telah dihentikan sementara (Guardrail aktif). Tidak ada konfigurasi Firebase yang valid terdeteksi, sehingga aplikasi menolak menggunakan database bawaan (Sandbox).
            </p>
          </div>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-left space-y-2">
            <p className="text-xs font-bold text-slate-800">Tindakan yang Diperlukan:</p>
            <ul className="text-xs text-slate-600 list-disc pl-4 space-y-1 font-mono">
              <li>Lengkapi <span className="text-indigo-600">VITE_FIREBASE_*</span> di AI Studio Secrets / Vercel.</li>
              <li>Atau buat <span className="text-emerald-600">firebase-local-secret.json</span> di folder root.</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  const [activeModuleId, setActiveModuleId] = useState('dashboard');
  const [dashboardLens, setDashboardLens] = useState<'IKHTISAR' | 'PETA_TERITORI' | 'TPS_PASUKAN' | 'C1_REALCOUNT' | 'SEMUA'>('IKHTISAR');
  const [viewMode, setViewMode] = useState<PageViewMode | 'print'>('list');
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  const [userRole, setUserRole] = useState(() => {
    const storedEmail = (localStorage.getItem('admin_email') || '').toLowerCase().trim();
    if (storedEmail.includes('developer') || storedEmail.includes('dev@') || storedEmail.startsWith('dev.')) {
      return 'developer';
    }
    const stored = localStorage.getItem('admin_active_role') || 'superadmin';
    return normalizeRole(stored);
  });
  
  const [userEmail, setUserEmail] = useState(() => {
    return localStorage.getItem('admin_email') || 'caleg@domain.com';
  });

  const [showBlueprint, setShowBlueprint] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Interactive Toast State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  
  // Confirm Delete State
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteItemData, setDeleteItemData] = useState<any | null>(null);

  // Active module schema
  const activeModule = MODULE_REGISTRY.find(m => m.id === activeModuleId) || MODULE_REGISTRY[0];

  // Dynamic CRUD state for current active module (skip if dashboard)
  const isDashboard = activeModuleId === 'dashboard';
  const {
    data,
    totalServerCount,
    loading,
    loadingMore,
    hasMore,
    error,
    searchQuery,
    setSearchQuery,
    refresh,
    loadMore,
    createItem,
    bulkImportItems,
    updateItem,
    deleteItem
  } = useModule(isDashboard ? 'konstituen' : activeModuleId); // pass a dummy valid id when dashboard

  useEffect(() => {
    ApiService.init().catch((err) => {
      console.warn('Failed to initialize ApiService transient queue:', err);
    });
  }, []);

  const showToast = (
    message: string, 
    type: 'success' | 'error' | 'info' | 'warning' = 'info',
    title?: string,
    action?: { label: string; onClick: () => void }
  ) => {
    const newToast: ToastMessage = {
      id: `toast_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      message,
      type,
      title,
      action
    };
    setToasts(prev => [newToast, ...prev].slice(0, 5)); // max 5 stacked toasts
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleLoginSuccess = (rawRole: string, email: string) => {
    const role = normalizeRole(rawRole);
    setUserRole(role);
    setUserEmail(email);
    localStorage.setItem('admin_active_role', role);
    localStorage.setItem('admin_email', email);
    localStorage.setItem('is_logged_in', 'true');
    
    // Auto-inject Mock DNA Wilayah based on role to simulate Top-Down geofencing
    localStorage.setItem('user_provinsi', 'Jawa Timur');
    localStorage.setItem('user_kota', 'Kota Surabaya');
    if (role === 'koordinator') {
      localStorage.setItem('user_kecamatan', 'Wonokromo');
      localStorage.setItem('user_desa', ''); // Covers all villages in Wonokromo
    } else if (role === 'relawan') {
      localStorage.setItem('user_kecamatan', 'Wonokromo');
      localStorage.setItem('user_desa', 'Darmo'); // Restricted to one village
    } else {
      localStorage.setItem('user_kecamatan', '');
      localStorage.setItem('user_desa', '');
    }

    setAppState('app');
    const roleTitles: Record<string, string> = {
      superadmin: 'CALEG UTAMA (KANDIDAT)',
      koordinator: 'KORCAM / TIM SES',
      relawan: 'RELAWAN LAPANGAN',
      administrator: 'SAAS ADMIN OWNER',
      developer: 'DEVELOPER GOD MODE',
      demo: 'DEMO CLIENT INTERAKTIF'
    };
    showToast(`Berhasil masuk sebagai: ${roleTitles[role] || role.toUpperCase()}`, 'success', 'Login Sukses');
    
    // Auto-route based on role
    if (role === 'developer') {
      setActiveModuleId('saas_tenant_approval');
    } else if (role === 'superadmin' || role === 'demo') {
      setActiveModuleId('dashboard');
    } else if (role === 'administrator') {
      setActiveModuleId('user_relawan');
    } else if (role === 'koordinator') {
      setActiveModuleId('user_relawan');
    } else if (role === 'relawan') {
      setActiveModuleId('konstituen');
    } else {
      setActiveModuleId('dashboard');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('is_logged_in');
    setAppState('landing');
  };

  // Handle role change with simulator feedback
  const handleRoleChange = (newRole: string) => {
    handleLoginSuccess(newRole, `simulator_${newRole.toLowerCase()}@domain.com`);
    setTimeout(() => refresh(), 50);
  };

  // Module change handler
  const handleModuleSelect = (id: string) => {
    setActiveModuleId(id);
    setViewMode('list');
    setSelectedItem(null);
    setSearchQuery('');
  };

  // Navigation handlers
  const handleGoToList = () => {
    setViewMode('list');
    setSelectedItem(null);
  };

  const handleGoToAdd = () => {
    setSelectedItem(null);
    setViewMode('create');
  };

  const handleGoToEdit = (item: any) => {
    setSelectedItem(item);
    setViewMode('edit');
  };

  const handleGoToDetail = (item: any) => {
    setSelectedItem(item);
    setViewMode('detail');
  };

  const handleGoToImportExport = () => {
    setViewMode('import_export');
  };

  const handleGoToPrint = () => {
    setViewMode('print');
  };

  // Form submit handler (Create / Update)
  const handleFormSubmit = async (values: Record<string, any>) => {
    setIsSaving(true);
    try {
      // AUTOMATION: SaaS Tenant Approval Workflow
      // When Superadmin approves a Caleg registration:
      // 1. Generate unique tenant_id
      // 2. Generate Tim Ses email credential
      // 3. Auto-create Tim Ses User in 'user_relawan'
      // 4. Auto-create Caleg Profile in 'master_caleg'
      if (activeModule.id === 'saas_tenant_approval' && values.status === 'DISETUJUI_AKTIF') {
        const rawSlug = (values.email || values.nama_caleg || 'caleg')
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '')
          .slice(0, 8);
        
        if (!values.tenant_id || values.tenant_id.includes('MENUNGGU')) {
          values.tenant_id = `TNT-${rawSlug.toUpperCase()}-${Date.now().toString().slice(-4)}`;
        }
        
        if (!values.akun_timses_email || values.akun_timses_email.includes('BELUM')) {
          values.akun_timses_email = `timses.${rawSlug}@pemenangan.id`;
        }

        // Auto-provision Tim Ses Account in 'user_relawan'
        try {
          const timsesPayload = {
            id: `USR-TIMSES-${Date.now().toString().slice(-6)}`,
            nama: `Tim Ses - ${values.nama_caleg}`,
            email: values.akun_timses_email,
            nomor_wa: values.no_wa || '',
            provinsi_tugas: values.provinsi || 'Jawa Timur',
            kota_tugas: values.kota || '',
            kecamatan_tugas: '',
            desa_tugas: '',
            role: 'administrator',
            status: 'AKTIF',
            tenant_id: values.tenant_id,
            createdAt: new Date().toISOString()
          };
          await FirebaseDataService.createDocument('user_relawan', timsesPayload);
        } catch (e) {
          console.warn('Auto-create timses account fallback:', e);
        }

        // Auto-provision Caleg Profile in 'master_caleg'
        try {
          const masterCalegPayload = {
            id: `CLG-${Date.now().toString().slice(-6)}`,
            nama_lengkap: values.nama_caleg,
            nomor_urut: Number(values.nomor_urut) || 1,
            partai: values.partai || 'Independen',
            slogan: `Pemenangan Bersama Rakyat (${values.nama_dapil || ''})`,
            target_suara_global: 50000,
            alokasi_cpv: 100000,
            tenant_id: values.tenant_id,
            createdAt: new Date().toISOString()
          };
          await FirebaseDataService.createDocument('master_caleg', masterCalegPayload);
        } catch (e) {
          console.warn('Auto-create master caleg fallback:', e);
        }

        showToast(
          `Workspace ${values.nama_caleg} disetujui! Akun Tim Ses (${values.akun_timses_email}) berhasil digenerate otomatis.`,
          'success',
          'SaaS Workspace & Akun Tim Ses Dibuat'
        );
      }

      // AUTOMATION: Target Suara & Wilayah Gerilya Math
      if (activeModule.id === 'target_dapil_wilayah') {
        const target = Number(values.target_suara) || 0;
        const terkunci = Number(values.suara_terkunci) || 0;
        const dpt = Number(values.jumlah_dpt) || 1;
        values.gap_suara = Math.max(0, target - terkunci);

        const priority = classifyRegionPriority(dpt, target, terkunci);
        if (!values.status_wilayah || values.status_wilayah.includes('BATTLEGROUND')) {
          values.status_wilayah = priority.status === 'BASIS_HIJAU' 
            ? 'BASIS_HIJAU (Aman / Loyal)' 
            : priority.status === 'BATTLEGROUND_KUNING' 
            ? 'BATTLEGROUND_KUNING (Medan Tempur Kritis)' 
            : 'RAWAN_MERAH (Penetrasi Rendah)';
        }
        if (!values.catatan_strategi) {
          values.catatan_strategi = priority.actionGuidance;
        }
      }

      // AUTOMATION: Anggaran & Audit Mark-Up Otomatis Algoritma (Zero AI Cost)
      if (activeModule.id === 'anggaran_kampanye') {
        const vol = Number(values.volume) || 1;
        const harga = Number(values.harga_satuan_diajukan) || 0;
        const total = vol * harga;
        values.total_anggaran = total;

        const targetSuara = Number(values.target_suara_alokasi) || 1000;
        const cpv = Math.round(total / targetSuara);
        values.cpv_terhitung = cpv;

        // Standar harga acuan pasar lokal Jawa Timur / Ponorogo
        const STANDARD_PRICE_BENCHMARK: Record<string, { min: number; max: number }> = {
          'Honor Saksi TPS (Hari-H & Rekap)': { min: 200000, max: 350000 },
          'Cetak Spanduk / Banner MMT Outdoor': { min: 18000, max: 28000 },
          'Konsumsi / Nasi Box Pertemuan Warga': { min: 15000, max: 25000 },
          'Uang Transport Relawan Door-to-Door / Canvasser': { min: 50000, max: 100000 },
          'Sewa Sound System & Tenda Pertemuan Warga': { min: 500000, max: 1500000 },
          'Paket Sembako / Bantuan Aspirasi Sederhana': { min: 50000, max: 100000 },
          'Bahan Sosialisasi / Kaos & Atribut': { min: 25000, max: 55000 }
        };

        const benchmark = STANDARD_PRICE_BENCHMARK[values.kategori_item] || { min: 10000, max: 250000 };
        const audit = auditExpenseItem(harga, vol, benchmark.min, benchmark.max);

        values.status_audit_algoritma = audit.status === 'PERINGATAN_MARKUP'
          ? 'PERINGATAN_MARKUP'
          : cpv > 150000
          ? 'SANGAT_BOROS_EVALUASI'
          : 'WAJAR_SESUAI_PASAR';

        values.potensi_pemborosan = audit.wasteAmount;
        values.catatan_audit = audit.notes + ` (Cost per Vote: Rp ${cpv.toLocaleString('id-ID')} / suara)`;
      }

      // AUTOMATION: Sainte-Laguë Status
      if (activeModule.id === 'simulasi_sainte_lague') {
        const totalSuara = Number(values.suara_total_partai) || 0;
        if (totalSuara >= 15000) {
          values.status_kursi = 'LOLOS_KURSI_AMAN';
          values.kursi_diperoleh = Math.max(1, Math.floor(totalSuara / 15000));
          values.selisih_suara_aman = Math.round(totalSuara * 0.15);
        } else if (totalSuara >= 8000) {
          values.status_kursi = 'KURSI_TERAKHIR_RAWAN';
          values.kursi_diperoleh = 1;
          values.selisih_suara_aman = Math.round(15000 - totalSuara);
        } else {
          values.status_kursi = 'BELUM_LOLOS_KURSI';
          values.kursi_diperoleh = 0;
          values.selisih_suara_aman = Math.max(0, 8000 - totalSuara);
        }
      }

      if (viewMode === 'edit' && selectedItem) {
        const updated = await updateItem(selectedItem.id, values);
        setSelectedItem(updated);
        showToast(
          'Data berhasil diverifikasi dan tersimpan ke Cloud Database!', 
          'success', 
          'Tersimpan di Cloud DB',
          { label: 'Lihat', onClick: () => setViewMode('detail') }
        );
        setViewMode('detail');
      } else {
        const created = await createItem(values);
        if (created?._isOfflineQueued) {
          showToast(
            'Koneksi server terputus. Data baru tersimpan di antrean perangkat ini (Belum masuk Cloud DB).', 
            'warning', 
            'Tersimpan di Antrean Lokal'
          );
        } else if (userRole === 'demo') {
          showToast(
            'Simulasi Berhasil! Data pengujian telah ditambahkan ke sesi simulasi Anda.', 
            'success', 
            'Mode Simulasi Demo'
          );
        } else {
          showToast(
            'Data baru berhasil diverifikasi dan tersimpan ke Cloud Database!', 
            'success', 
            'Tersimpan di Cloud DB',
            { label: 'Detail', onClick: () => { setSelectedItem(created); setViewMode('detail'); } }
          );
        }
        setViewMode('list');
      }
    } catch (err: any) {
      showToast(err.message || 'Gagal menyimpan entri data.', 'error', 'Error Penyimpanan');
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  // Delete handler - trigger confirm dialog
  const requestDelete = (id: string) => {
    const item = data.find((i: any) => i.id === id);
    setDeleteId(id);
    setDeleteItemData(item);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteItem(deleteId);
      showToast('Data berhasil dihapus dari database.', 'info', 'Data Terhapus');
      if (viewMode === 'detail' || viewMode === 'edit') {
        handleGoToList();
      }
    } catch (err: any) {
      showToast(err.message || 'Gagal menghapus entri data.', 'error', 'Gagal Hapus');
    } finally {
      setDeleteId(null);
      setDeleteItemData(null);
    }
  };

  // Bulk import handler
  const handleBulkImport = async (items: any[]) => {
    const result = await bulkImportItems(items);
    showToast(`Sukses mengimpor ${result.totalInserted} baris data via Excel!`, 'success', 'Import Sukses');
    return result;
  };

  const isAllowedToView = activeModule.allowedRoles.includes(userRole);

  if (appState === 'landing') {
    return <LandingView onLoginSuccess={handleLoginSuccess} />;
  }

  // APP VIEW
  return (
    <Layout
      modules={MODULE_REGISTRY}
      activeModuleId={activeModuleId}
      onModuleSelect={handleModuleSelect}
      userRole={userRole}
      onRoleChange={handleRoleChange}
      viewMode={viewMode}
      onViewModeChange={setViewMode}
      onLogout={handleLogout}
      onSyncSuccess={() => refresh()}
      onShowToast={showToast}
      dashboardLens={dashboardLens}
      onLensChange={setDashboardLens}
      onQuickAdd={() => {
        if (activeModuleId !== 'konstituen') {
          setActiveModuleId('konstituen');
        }
        handleGoToAdd();
      }}
    >
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Developer Blueprint Toggle & God Mode Status Banner */}
        {userRole === 'developer' && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-gradient-to-r from-amber-950 via-slate-900 to-slate-950 border border-amber-500/40 text-amber-200 px-4 py-3 rounded-2xl text-xs shadow-lg">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shrink-0"></span>
              <span className="font-mono font-black text-[10px] text-amber-300 bg-amber-500/20 border border-amber-400/40 px-2 py-0.5 rounded uppercase tracking-wider">
                🛠️ GOD MODE AKTIF
              </span>
              <span className="text-slate-300">
                Akses Pengembang Sistem (<strong className="text-white">{userEmail}</strong>): Seluruh modul terbuka, batasan multi-tenant & geofencing dinonaktifkan.
              </span>
            </div>
            <button
              onClick={() => setShowBlueprint(prev => !prev)}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-amber-900/60 hover:bg-amber-800 text-amber-100 font-bold rounded-xl transition-colors cursor-pointer text-xs border border-amber-600/50 shrink-0"
            >
              <Code2 className="w-4 h-4 text-amber-400" />
              <span>{showBlueprint ? 'Tutup Schema Inspector' : 'Inspeksi Schema Blueprint'}</span>
            </button>
          </div>
        )}

        {/* Schema Blueprint Inspector (Collapsible for Superadmin) */}
        {userRole === 'developer' && showBlueprint && (
          <div className="bg-slate-950 rounded-2xl overflow-hidden shadow-xl border border-slate-800 animate-in fade-in duration-200">
            <div className="px-5 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-indigo-400" />
                Live TypeScript Schema Definition ({activeModule.id})
              </span>
              <span className="text-[10px] px-2 py-0.5 bg-indigo-500/10 text-indigo-400 font-mono font-bold rounded">
                REST BACKEND VALIDATION CONTRACT
              </span>
            </div>
            <div className="p-5 font-mono text-[11px] text-indigo-300 leading-relaxed overflow-x-auto max-h-64">
              <pre className="text-white select-all">
                {JSON.stringify(activeModule, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* RBAC Access Denied Guard */}
        {isDashboard && !['developer', 'administrator', 'superadmin', 'demo'].includes(userRole) ? (
          <div className="bg-white border-2 border-dashed border-rose-200 rounded-2xl p-12 text-center space-y-4 shadow-xs">
            <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-800">Hak Akses Modul Dibatasi (403 Forbidden)</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                Peran Anda saat ini (<strong>{userRole.replace('_', ' ')}</strong>) tidak memiliki izin untuk melihat Dashboard Command Center.
              </p>
            </div>
          </div>
        ) : !isDashboard && !isAllowedToView ? (
          <div className="bg-white border-2 border-dashed border-rose-200 rounded-2xl p-12 text-center space-y-4 shadow-xs">
            <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-800">Hak Akses Modul Dibatasi (403 Forbidden)</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                Peran Anda saat ini (<strong>{userRole.replace('_', ' ')}</strong>) tidak memiliki izin untuk melihat modul <strong>{activeModule.title}</strong>.
              </p>
            </div>
          </div>
        ) : (
          /* Multi-Page Views Rendered based on viewMode */
          <div>
            {isDashboard ? (
              <DashboardView 
                userRole={userRole}
                onSwitchRole={handleRoleChange}
                activeSegmentProp={dashboardLens}
                onSegmentChangeProp={setDashboardLens}
                onNavigateModule={(moduleId, contextQuery) => {
                  setActiveModuleId(moduleId);
                  if (contextQuery) {
                    setSearchQuery(contextQuery);
                  }
                  setViewMode('list');
                }}
              />
            ) : viewMode === 'list' && (
              <ListView
                schema={activeModule}
                data={data}
                totalServerCount={totalServerCount}
                loading={loading}
                loadingMore={loadingMore}
                hasMore={hasMore}
                onLoadMore={loadMore}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onRefresh={() => refresh(true)}
                onAddClick={handleGoToAdd}
                onEditClick={handleGoToEdit}
                onDetailClick={handleGoToDetail}
                onDeleteClick={requestDelete}
                onImportExportClick={handleGoToImportExport}
                onPrintClick={handleGoToPrint}
                userRole={userRole}
              />
            )}

            {(viewMode === 'create' || viewMode === 'edit') && (
              <FormView
                schema={activeModule}
                initialData={viewMode === 'edit' ? selectedItem : null}
                onSubmit={handleFormSubmit}
                onBack={handleGoToList}
                loading={isSaving}
              />
            )}

            {viewMode === 'detail' && selectedItem && (
              <DetailView
                schema={activeModule}
                item={selectedItem}
                onBack={handleGoToList}
                onEdit={handleGoToEdit}
                onDelete={requestDelete}
                onPrint={handleGoToPrint}
                userRole={userRole}
              />
            )}

            {viewMode === 'import_export' && (
              <ImportExportView
                schema={activeModule}
                currentData={data}
                onBack={handleGoToList}
                onBulkImport={handleBulkImport}
                userRole={userRole}
              />
            )}

            {viewMode === 'print' && (
              <PrintDocumentView
                schema={activeModule}
                data={data}
                onBack={handleGoToList}
                userRole={userRole}
              />
            )}
          </div>
        )}
      </div>

      {/* Global Modals & Notifications */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
      
      <ConfirmDialog
        isOpen={!!deleteId}
        title="Konfirmasi Hapus Data"
        message={`Apakah Anda yakin ingin menghapus data ini secara permanen?`}
        confirmLabel="Hapus Data"
        cancelLabel="Batal"
        variant="danger"
        previewData={deleteItemData ? [
          { label: 'ID', value: deleteItemData.id },
          { label: 'Modul', value: activeModule.title }
        ] : undefined}
        onConfirm={confirmDelete}
        onCancel={() => {
          setDeleteId(null);
          setDeleteItemData(null);
        }}
      />
    </Layout>
  );
}
