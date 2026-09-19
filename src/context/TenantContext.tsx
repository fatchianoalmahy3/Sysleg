import React, { createContext, useContext, useState, useEffect } from 'react';

interface TenantContextType {
  activeTenantId: string;
  setActiveTenantId: (tenantId: string) => void;
  tenantName: string;
  setTenantName: (name: string) => void;
  isSuperAdmin: boolean;
  clearTenant: () => void;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

const TENANT_STORAGE_KEY = 'active_electoral_tenant_id';
const TENANT_NAME_KEY = 'active_electoral_tenant_name';

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTenantId, setActiveTenantIdState] = useState<string>(() => {
    return localStorage.getItem(TENANT_STORAGE_KEY) || 'TNT-DEFAULT';
  });

  const [tenantName, setTenantNameState] = useState<string>(() => {
    return localStorage.getItem(TENANT_NAME_KEY) || 'Workspace Pemenangan Caleg';
  });

  const userRole = localStorage.getItem('admin_active_role') || 'superadmin';
  const isSuperAdmin = userRole === 'developer';

  const setActiveTenantId = (tenantId: string) => {
    const cleanId = tenantId.trim() || 'TNT-DEFAULT';
    setActiveTenantIdState(cleanId);
    localStorage.setItem(TENANT_STORAGE_KEY, cleanId);
  };

  const setTenantName = (name: string) => {
    setTenantNameState(name);
    localStorage.setItem(TENANT_NAME_KEY, name);
  };

  const clearTenant = () => {
    setActiveTenantIdState('TNT-DEFAULT');
    setTenantNameState('Workspace Pemenangan Caleg');
    localStorage.removeItem(TENANT_STORAGE_KEY);
    localStorage.removeItem(TENANT_NAME_KEY);
  };

  return (
    <TenantContext.Provider
      value={{
        activeTenantId,
        setActiveTenantId,
        tenantName,
        setTenantName,
        isSuperAdmin,
        clearTenant
      }}
    >
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = (): TenantContextType => {
  const context = useContext(TenantContext);
  if (!context) {
    // Fallback if rendered outside provider
    const activeTenantId = localStorage.getItem(TENANT_STORAGE_KEY) || 'TNT-DEFAULT';
    const tenantName = localStorage.getItem(TENANT_NAME_KEY) || 'Workspace Pemenangan Caleg';
    const userRole = localStorage.getItem('admin_active_role') || 'superadmin';
    return {
      activeTenantId,
      setActiveTenantId: (id: string) => localStorage.setItem(TENANT_STORAGE_KEY, id),
      tenantName,
      setTenantName: (name: string) => localStorage.setItem(TENANT_NAME_KEY, name),
      isSuperAdmin: userRole === 'developer',
      clearTenant: () => {
        localStorage.removeItem(TENANT_STORAGE_KEY);
        localStorage.removeItem(TENANT_NAME_KEY);
      }
    };
  }
  return context;
};
