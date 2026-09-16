import { IApiDriver, QueryOptions, PaginatedResult, BulkOperationResult } from '../../core/contracts/apiDriver';
import { FirebaseDataService, testFirestoreConnection } from '../firebase';

export class FirestoreDriver implements IApiDriver {
  public readonly driverName = 'firestore';

  public async init(): Promise<boolean> {
    return await testFirestoreConnection();
  }

  public getCachedRecords<T = any>(resource: string, search = ''): T[] | null {
    return FirebaseDataService.getCachedData(resource, search) as T[] | null;
  }

  public invalidateCache(resource?: string): void {
    FirebaseDataService.invalidateCache(resource);
  }

  public async getRecords<T = any>(resource: string, options?: QueryOptions): Promise<T[]> {
    const search = options?.search || '';
    const forceRefresh = Boolean(options?.forceRefresh);
    const tenantId = options?.tenantId;

    let results = await FirebaseDataService.getCollectionData(resource, search, forceRefresh);

    // Apply strict tenant isolation if tenantId is provided
    if (tenantId && resource !== 'saas_tenant_approval' && resource !== 'saas_pricing_matrix' && resource !== 'saas_system_settings') {
      results = results.filter((item: any) => !item.tenant_id || item.tenant_id === tenantId);
    }

    return results as T[];
  }

  public async getPaginatedRecords<T = any>(resource: string, options?: QueryOptions): Promise<PaginatedResult<T>> {
    const pageSize = options?.pageSize || 25;
    const page = options?.page || 1;
    
    // Fetch all or cached items and slice smoothly with in-memory metadata
    const allItems = await this.getRecords<T>(resource, options);
    const total = allItems.length;
    const startIndex = (page - 1) * pageSize;
    const paginatedItems = allItems.slice(startIndex, startIndex + pageSize);

    return {
      items: paginatedItems,
      total,
      page,
      pageSize,
      hasMore: startIndex + pageSize < total
    };
  }

  public async getRecordById<T = any>(resource: string, id: string, tenantId?: string): Promise<T | null> {
    const record = await FirebaseDataService.getDocument(resource, id);
    if (!record) return null;

    if (tenantId && record.tenant_id && record.tenant_id !== tenantId && 
        resource !== 'saas_tenant_approval' && resource !== 'saas_pricing_matrix' && resource !== 'saas_system_settings') {
      return null;
    }

    return record as T;
  }

  public async getRecordCount(resource: string, options?: QueryOptions): Promise<number> {
    if (options?.tenantId) {
      const records = await this.getRecords(resource, options);
      return records.length;
    }
    return await FirebaseDataService.getCollectionCount(resource);
  }

  public async createRecord<T = any>(resource: string, payload: Partial<T>, tenantId?: string): Promise<T> {
    const enrichedPayload: any = { ...payload };
    if (tenantId && !enrichedPayload.tenant_id && resource !== 'saas_pricing_matrix' && resource !== 'saas_system_settings') {
      enrichedPayload.tenant_id = tenantId;
    }
    const doc = await FirebaseDataService.createDocument(resource, enrichedPayload);
    return doc as T;
  }

  public async updateRecord<T = any>(resource: string, id: string, payload: Partial<T>, tenantId?: string): Promise<T> {
    const enrichedPayload: any = { ...payload };
    if (tenantId && !enrichedPayload.tenant_id && resource !== 'saas_pricing_matrix' && resource !== 'saas_system_settings') {
      enrichedPayload.tenant_id = tenantId;
    }
    const doc = await FirebaseDataService.updateDocument(resource, id, enrichedPayload);
    return doc as T;
  }

  public async deleteRecord(resource: string, id: string, _tenantId?: string): Promise<boolean> {
    return await FirebaseDataService.deleteDocument(resource, id);
  }

  public async bulkCreateRecords<T = any>(resource: string, items: Partial<T>[], tenantId?: string): Promise<BulkOperationResult> {
    const enrichedItems = items.map(item => {
      const copy: any = { ...item };
      if (tenantId && !copy.tenant_id && resource !== 'saas_pricing_matrix' && resource !== 'saas_system_settings') {
        copy.tenant_id = tenantId;
      }
      return copy;
    });
    return await FirebaseDataService.bulkCreate(resource, enrichedItems);
  }

  public async uploadFile(fileName: string, fileType: string, fileData: string | File | Blob): Promise<string> {
    return await FirebaseDataService.uploadFile(fileName, fileType, fileData);
  }
}
