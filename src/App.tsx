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
  Terminal, 
  ShieldAlert, 
  Code2,
  DatabaseZap
} from 'lucide-react';

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
  const [viewMode, setViewMode] = useState<PageViewMode | 'print'>('list');
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  const [userRole, setUserRole] = useState(() => {
    return localStorage.getItem('admin_active_role') || 'CALEG_UTAMA';
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

  const handleLoginSuccess = (role: string, email: string) => {
    setUserRole(role);
    setUserEmail(email);
    localStorage.setItem('admin_active_role', role);
    localStorage.setItem('admin_email', email);
    localStorage.setItem('is_logged_in', 'true');
    
    // Auto-inject Mock DNA Wilayah based on role to simulate Top-Down geofencing
    localStorage.setItem('user_provinsi', 'Jawa Timur');
    localStorage.setItem('user_kota', 'Kota Surabaya');
    if (role === 'KORCAM') {
      localStorage.setItem('user_kecamatan', 'Wonokromo');
      localStorage.setItem('user_desa', ''); // Covers all villages in Wonokromo
    } else if (role === 'RELAWAN_LAPANGAN') {
      localStorage.setItem('user_kecamatan', 'Wonokromo');
      localStorage.setItem('user_desa', 'Darmo'); // Restricted to one village
    } else {
      localStorage.setItem('user_kecamatan', '');
      localStorage.setItem('user_desa', '');
    }

    setAppState('app');
    showToast(`Berhasil masuk sebagai: ${role.replace('_', ' ')}`, 'success', 'Login Sukses');
    
    // Auto-route based on role
    if (role === 'SUPER_ADMIN') {
      setActiveModuleId('saas_tenant_approval');
    } else if (role === 'CALEG_UTAMA') {
      setActiveModuleId('dashboard');
    } else if (role === 'TIM_SES') {
      setActiveModuleId('user_relawan');
    } else if (role === 'KORCAM') {
      setActiveModuleId('rab_aspirasi');
    } else if (role === 'RELAWAN_LAPANGAN') {
      setActiveModuleId('konstituen');
    } else {
      setActiveModuleId('user_relawan');
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
            role: 'TIM_SES',
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
      onQuickAdd={() => {
        if (activeModuleId !== 'konstituen') {
          setActiveModuleId('konstituen');
        }
        handleGoToAdd();
      }}
    >
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Developer Blueprint Toggle (Only for SUPER_ADMIN, discreet) */}
        {userRole === 'SUPER_ADMIN' && (
          <div className="flex items-center justify-between bg-slate-900/90 border border-slate-800 text-slate-300 px-4 py-2 rounded-xl text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
              <span className="font-semibold text-white">Superadmin Workspace: {userEmail}</span>
            </div>
            <button
              onClick={() => setShowBlueprint(prev => !prev)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-indigo-300 font-bold rounded-lg transition-colors cursor-pointer text-[11px]"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>{showBlueprint ? 'Tutup Schema Inspector' : 'Schema Inspector'}</span>
            </button>
          </div>
        )}

        {/* Schema Blueprint Inspector (Collapsible for Superadmin) */}
        {userRole === 'SUPER_ADMIN' && showBlueprint && (
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
        {isDashboard && !['SUPER_ADMIN', 'CALEG_UTAMA', 'TIM_SES'].includes(userRole) ? (
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
              <DashboardView />
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
