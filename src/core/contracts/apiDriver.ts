export interface QueryOptions {
  page?: number;
  pageSize?: number;
  search?: string;
  searchKeys?: string[];
  tenantId?: string;
  filters?: Record<string, any>;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  forceRefresh?: boolean;
}

export interface PaginatedResult<T = any> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface BulkOperationResult {
  totalInserted: number;
  errors: any[];
}

/**
 * Universal Database Driver Contract (RESTful Architecture)
 * Decouples the entire UI and Business Logic from underlying database vendors
 * (e.g. Firebase Firestore, Supabase PostgreSQL, Cloud SQL, Custom REST API).
 */
export interface IApiDriver {
  readonly driverName: string;
  
  init?(): Promise<boolean>;
  
  getRecords<T = any>(
    resource: string, 
    options?: QueryOptions
  ): Promise<T[]>;
  
  getPaginatedRecords<T = any>(
    resource: string, 
    options?: QueryOptions
  ): Promise<PaginatedResult<T>>;
  
  getRecordById<T = any>(
    resource: string, 
    id: string, 
    tenantId?: string
  ): Promise<T | null>;
  
  getRecordCount(
    resource: string, 
    options?: QueryOptions
  ): Promise<number>;
  
  createRecord<T = any>(
    resource: string, 
    payload: Partial<T>, 
    tenantId?: string
  ): Promise<T>;
  
  updateRecord<T = any>(
    resource: string, 
    id: string, 
    payload: Partial<T>, 
    tenantId?: string
  ): Promise<T>;
  
  deleteRecord(
    resource: string, 
    id: string, 
    tenantId?: string
  ): Promise<boolean>;
  
  bulkCreateRecords<T = any>(
    resource: string, 
    items: Partial<T>[], 
    tenantId?: string
  ): Promise<BulkOperationResult>;
  
  bulkDeleteRecords?(
    resource: string, 
    ids: string[], 
    tenantId?: string
  ): Promise<boolean>;
  
  uploadFile?(
    fileName: string, 
    fileType: string, 
    fileData: string | File | Blob
  ): Promise<string>;
  
  invalidateCache?(resource?: string): void;
  getCachedRecords?<T = any>(resource: string, search?: string): T[] | null;
}
