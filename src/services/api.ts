import { MODULE_REGISTRY } from '../core/registry';
import { ModuleSchema } from '../core/types';
import { IApiDriver, QueryOptions, PaginatedResult } from '../core/contracts/apiDriver';
import { FirestoreDriver } from './drivers/firestoreDriver';
import { transientQueue } from '../utils/transientQueue';
import { syncPricingMatrixWithFirestore } from './dbSeeder';

/**
 * Universal RESTful ApiService
 * Powered by Hexagonal Architecture / Driver Pattern
 * Connects directly and exclusively to Cloud Firestore.
 */
export class ApiService {
  private static firestoreDriver = new FirestoreDriver();
  private static paginationPageMap = new Map<string, number>();

  /**
   * Returns the active Firestore driver.
   */
  public static getActiveDriver(): IApiDriver {
    return this.firestoreDriver;
  }

  public static getActiveRole(): string {
    return localStorage.getItem('admin_active_role') || 'superadmin';
  }

  public static getActiveTenantId(): string {
    return localStorage.getItem('active_electoral_tenant_id') || 'TNT-DEFAULT';
  }

  // Initialize driver connection and transient queue handler
  public static async init(): Promise<boolean> {
    transientQueue.setPushHandler(async (item) => {
      try {
        await ApiService.createRecord(item.moduleId, item.payload, true);
        return true;
      } catch (err) {
        return false;
      }
    });

    // Auto-sync saas_pricing_matrix with latest tariff tiers in Firestore
    syncPricingMatrixWithFirestore().catch((err) => {
      console.warn('Non-blocking pricing matrix sync background alert:', err);
    });

    const driver = this.getActiveDriver();
    if (driver.init) {
      return await driver.init();
    }
    return true;
  }

  public static async getSchemas(): Promise<ModuleSchema[]> {
    return MODULE_REGISTRY;
  }

  public static getCachedRecords(module: string, search = ''): any[] | null {
    const schema = MODULE_REGISTRY.find((m) => m.id === module);
    const role = this.getActiveRole();
    if (schema && !schema.allowedRoles.includes(role)) return null;

    const driver = this.getActiveDriver();
    if (driver.getCachedRecords) {
      return driver.getCachedRecords(module, search);
    }
    return null;
  }

  public static async getRecords(module: string, search = '', forceRefresh = false): Promise<any[]> {
    const schema = MODULE_REGISTRY.find((m) => m.id === module);
    const role = this.getActiveRole();
    if (schema && !schema.allowedRoles.includes(role)) {
      throw new Error(`Akses ditolak. Peran '${role}' tidak diizinkan mengakses modul ini.`);
    }

    const tenantId = this.getActiveTenantId();
    const options: QueryOptions = {
      search,
      searchKeys: schema?.searchKeys || [],
      forceRefresh,
      tenantId: role === 'developer' ? undefined : tenantId
    };

    // Reset pagination page tracker on full fetch
    this.paginationPageMap.set(module, 1);

    const driver = this.getActiveDriver();
    try {
      return await driver.getRecords(module, options);
    } catch (err) {
      // Fallback to Firestore if primary driver fails
      if (driver.driverName !== 'firestore') {
        console.warn(`Fallback to Firestore driver for ${module}:`, err);
        return await this.firestoreDriver.getRecords(module, options);
      }
      throw err;
    }
  }

  public static async getPaginatedRecords(module: string, options: QueryOptions = {}): Promise<PaginatedResult<any>> {
    const schema = MODULE_REGISTRY.find((m) => m.id === module);
    const role = this.getActiveRole();
    if (schema && !schema.allowedRoles.includes(role)) {
      throw new Error(`Akses ditolak. Peran '${role}' tidak diizinkan mengakses modul ini.`);
    }

    // Align tenant keys
    const tenantId = this.getActiveTenantId();
    const mergedOptions: QueryOptions = {
      ...options,
      searchKeys: schema?.searchKeys || [],
      tenantId: role === 'developer' ? options.tenantId : tenantId
    };

    const driver = this.getActiveDriver();
    try {
      return await driver.getPaginatedRecords(module, mergedOptions);
    } catch (err) {
      if (driver.driverName !== 'firestore') {
        return await this.firestoreDriver.getPaginatedRecords(module, mergedOptions);
      }
      throw err;
    }
  }

  public static async getNextPageRecords(module: string, pageSize = 50): Promise<{ items: any[]; hasMore: boolean; totalCount: number }> {
    const currentPage = (this.paginationPageMap.get(module) || 1) + 1;
    this.paginationPageMap.set(module, currentPage);

    const paginated = await this.getPaginatedRecords(module, {
      page: currentPage,
      pageSize
    });

    return {
      items: paginated.items,
      hasMore: paginated.hasMore,
      totalCount: paginated.total
    };
  }

  public static async getRecordCount(module: string): Promise<number> {
    const role = this.getActiveRole();
    const tenantId = this.getActiveTenantId();
    const options: QueryOptions = {
      tenantId: role === 'developer' ? undefined : tenantId
    };

    const driver = this.getActiveDriver();
    try {
      return await driver.getRecordCount(module, options);
    } catch (err) {
      return await this.firestoreDriver.getRecordCount(module, options);
    }
  }

  public static invalidateCache(module?: string): void {
    if (module) {
      this.paginationPageMap.delete(module);
    } else {
      this.paginationPageMap.clear();
    }
    const driver = this.getActiveDriver();
    if (driver.invalidateCache) {
      driver.invalidateCache(module);
    }
  }

  public static async getRecordById(module: string, id: string): Promise<any> {
    const role = this.getActiveRole();
    const tenantId = role === 'developer' ? undefined : this.getActiveTenantId();

    const driver = this.getActiveDriver();
    try {
      const record = await driver.getRecordById(module, id, tenantId);
      if (record) return record;
    } catch (err) {
      console.warn(`Fallback getRecordById for ${module}/${id}:`, err);
    }
    return await this.firestoreDriver.getRecordById(module, id, tenantId);
  }

  public static async createRecord(module: string, payload: any, bypassQueue = false): Promise<any> {
    const schema = MODULE_REGISTRY.find((m) => m.id === module);
    const role = this.getActiveRole();
    if (role === 'demo') {
      alert('Mode Demo: Operasi penambahan data dinonaktifkan (Read-Only).');
      return { ...payload, id: 'demo-' + Date.now() };
    }
    if (schema && !schema.allowedRoles.includes(role)) {
      throw new Error(`Akses ditolak. Peran '${role}' tidak diizinkan menambahkan data.`);
    }

    // Hybrid mode offline queue check
    if (!bypassQueue && typeof navigator !== 'undefined' && !navigator.onLine) {
      transientQueue.enqueue(module, payload);
      return { ...payload, id: `temp_${Date.now()}`, _isOfflineQueued: true };
    }

    const tenantId = this.getActiveTenantId();
    const driver = this.getActiveDriver();

    try {
      const result = await driver.createRecord(module, payload, tenantId);
      return { ...result, _isOfflineQueued: false };
    } catch (err: any) {
      // Fallback driver or offline queue
      if (driver.driverName !== 'firestore') {
        try {
          return await this.firestoreDriver.createRecord(module, payload, tenantId);
        } catch (innerErr) {
          // continue to queue handler
        }
      }

      if (!bypassQueue && (err?.code === 'unavailable' || !navigator.onLine || err?.message?.toLowerCase().includes('network') || err?.message?.toLowerCase().includes('offline'))) {
        transientQueue.enqueue(module, payload);
        return { ...payload, id: `temp_${Date.now()}`, _isOfflineQueued: true };
      }
      throw err;
    }
  }

  public static async bulkCreateRecords(module: string, items: any[]): Promise<{ totalInserted: number; errors: any[] }> {
    const tenantId = this.getActiveTenantId();
    const driver = this.getActiveDriver();

    try {
      return await driver.bulkCreateRecords(module, items, tenantId);
    } catch (err) {
      return await this.firestoreDriver.bulkCreateRecords(module, items, tenantId);
    }
  }

  public static async updateRecord(module: string, id: string, payload: any): Promise<any> {
    const role = this.getActiveRole();
    if (role === 'demo') {
      alert('Mode Demo: Operasi pembaruan data dinonaktifkan (Read-Only).');
      return payload;
    }
    const tenantId = role === 'developer' ? undefined : this.getActiveTenantId();
    const driver = this.getActiveDriver();

    try {
      return await driver.updateRecord(module, id, payload, tenantId);
    } catch (err) {
      return await this.firestoreDriver.updateRecord(module, id, payload, tenantId);
    }
  }

  public static async deleteRecord(module: string, id: string): Promise<boolean> {
    const role = this.getActiveRole();
    if (role === 'demo') {
      alert('Mode Demo: Operasi penghapusan data dinonaktifkan (Read-Only).');
      return true;
    }
    const tenantId = role === 'developer' ? undefined : this.getActiveTenantId();
    const driver = this.getActiveDriver();

    try {
      return await driver.deleteRecord(module, id, tenantId);
    } catch (err) {
      return await this.firestoreDriver.deleteRecord(module, id, tenantId);
    }
  }

  public static async uploadFile(fileName: string, fileType: string, fileData: string | File | Blob): Promise<string> {
    const driver = this.getActiveDriver();
    if (driver.uploadFile) {
      try {
        return await driver.uploadFile(fileName, fileType, fileData);
      } catch (err) {
        console.warn('Driver upload fallback to Firestore storage:', err);
      }
    }
    return await this.firestoreDriver.uploadFile!(fileName, fileType, fileData);
  }
}
