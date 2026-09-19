export type FieldType = 
  | 'text' 
  | 'textarea'
  | 'number' 
  | 'select' 
  | 'date'
  | 'email'
  | 'phone'
  | 'boolean'
  | 'richtext' 
  | 'file' 
  | 'location'
  | 'region_province'
  | 'region_city'
  | 'region_district'
  | 'region_village';

export interface FieldValidation {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: string;
  patternMessage?: string;
}

export interface FieldSchema {
  key: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  options?: string[]; // For 'select' type
  validation?: FieldValidation;
  roles?: string[]; // RBAC level: roles allowed to modify/write this field
  defaultValue?: any;
  helpText?: string;
  readOnly?: boolean;
  colSpan?: 1 | 2;
  currency?: boolean;
  unit?: string;
}

export type PackageTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'ENTERPRISE';

export interface ModuleSchema {
  id: string; // matches backend table name/endpoint (e.g. 'products')
  title: string;
  icon: string; // Lucide icon name
  allowedRoles: string[]; // Access roles
  requiredTier?: PackageTier; // Feature gating by SaaS subscription package tier
  searchKeys?: string[]; // Keys to search by
  fields: FieldSchema[];
  description?: string;
  actionLabels?: {
    createButton?: string;
  };
}

export type PageViewMode = 'list' | 'create' | 'edit' | 'detail' | 'import_export';

export interface AppNavigationState {
  moduleId: string;
  viewMode: PageViewMode;
  selectedItemId?: string | null;
}

export type UserRole = 
  | 'developer'
  | 'administrator'
  | 'superadmin'
  | 'koordinator'
  | 'relawan'
  | 'demo';

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  tenantId?: string;
}

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  message: string;
  action?: ToastAction;
  duration?: number;
}
