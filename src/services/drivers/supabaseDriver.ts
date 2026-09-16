import { IApiDriver, QueryOptions, PaginatedResult, BulkOperationResult } from '../../core/contracts/apiDriver';
import { supabase, isSupabaseConfigured } from '../supabase';

export class SupabaseDriver implements IApiDriver {
  public readonly driverName = 'supabase';

  public async init(): Promise<boolean> {
    return isSupabaseConfigured();
  }

  public async getRecords<T = any>(resource: string, options?: QueryOptions): Promise<T[]> {
    let query = supabase.from(resource).select('*');

    if (options?.tenantId && resource !== 'saas_tenant_approval' && resource !== 'saas_pricing_matrix' && resource !== 'saas_system_settings') {
      query = query.eq('tenant_id', options.tenantId);
    }

    if (options?.search && options.searchKeys && options.searchKeys.length > 0) {
      const orFilter = options.searchKeys.map(k => `${k}.ilike.%${options.search}%`).join(',');
      query = query.or(orFilter);
    }

    const sortBy = options?.sortBy || 'created_at';
    const ascending = options?.sortOrder === 'asc';
    query = query.order(sortBy, { ascending });

    if (options?.pageSize) {
      query = query.limit(options.pageSize);
    }

    const { data, error } = await query;
    if (error) {
      console.error(`[SupabaseDriver] getRecords error for ${resource}:`, error);
      throw new Error(`Supabase Query Error: ${error.message}`);
    }
    return (data || []) as T[];
  }

  public async getPaginatedRecords<T = any>(resource: string, options?: QueryOptions): Promise<PaginatedResult<T>> {
    const page = options?.page || 1;
    const pageSize = options?.pageSize || 25;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase.from(resource).select('*', { count: 'exact' });

    if (options?.tenantId && resource !== 'saas_tenant_approval' && resource !== 'saas_pricing_matrix' && resource !== 'saas_system_settings') {
      query = query.eq('tenant_id', options.tenantId);
    }

    if (options?.search && options.searchKeys && options.searchKeys.length > 0) {
      const orFilter = options.searchKeys.map(k => `${k}.ilike.%${options.search}%`).join(',');
      query = query.or(orFilter);
    }

    const sortBy = options?.sortBy || 'created_at';
    const ascending = options?.sortOrder === 'asc';
    query = query.order(sortBy, { ascending }).range(from, to);

    const { data, count, error } = await query;
    if (error) {
      console.error(`[SupabaseDriver] getPaginatedRecords error for ${resource}:`, error);
      throw new Error(`Supabase Query Error: ${error.message}`);
    }

    const total = count || 0;
    return {
      items: (data || []) as T[],
      total,
      page,
      pageSize,
      hasMore: to < total - 1
    };
  }

  public async getRecordById<T = any>(resource: string, id: string, tenantId?: string): Promise<T | null> {
    let query = supabase.from(resource).select('*').eq('id', id);
    if (tenantId && resource !== 'saas_tenant_approval' && resource !== 'saas_pricing_matrix' && resource !== 'saas_system_settings') {
      query = query.eq('tenant_id', tenantId);
    }
    const { data, error } = await query.single();
    if (error || !data) return null;
    return data as T;
  }

  public async getRecordCount(resource: string, options?: QueryOptions): Promise<number> {
    let query = supabase.from(resource).select('*', { count: 'exact', head: true });
    if (options?.tenantId && resource !== 'saas_tenant_approval' && resource !== 'saas_pricing_matrix' && resource !== 'saas_system_settings') {
      query = query.eq('tenant_id', options.tenantId);
    }
    const { count, error } = await query;
    if (error) return 0;
    return count || 0;
  }

  public async createRecord<T = any>(resource: string, payload: Partial<T>, tenantId?: string): Promise<T> {
    const itemWithMeta: any = {
      ...payload,
      tenant_id: tenantId || (payload as any).tenant_id || 'TNT-DEFAULT',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase.from(resource).insert([itemWithMeta]).select().single();
    if (error) {
      console.error(`[SupabaseDriver] createRecord error for ${resource}:`, error);
      throw new Error(`Supabase Insert Error: ${error.message}`);
    }
    return data as T;
  }

  public async updateRecord<T = any>(resource: string, id: string, payload: Partial<T>, tenantId?: string): Promise<T> {
    const itemWithMeta: any = {
      ...payload,
      updated_at: new Date().toISOString()
    };

    let query = supabase.from(resource).update(itemWithMeta).eq('id', id);
    if (tenantId && resource !== 'saas_tenant_approval' && resource !== 'saas_pricing_matrix' && resource !== 'saas_system_settings') {
      query = query.eq('tenant_id', tenantId);
    }

    const { data, error } = await query.select().single();
    if (error) {
      console.error(`[SupabaseDriver] updateRecord error for ${resource}:`, error);
      throw new Error(`Supabase Update Error: ${error.message}`);
    }
    return data as T;
  }

  public async deleteRecord(resource: string, id: string, tenantId?: string): Promise<boolean> {
    let query = supabase.from(resource).delete().eq('id', id);
    if (tenantId && resource !== 'saas_tenant_approval' && resource !== 'saas_pricing_matrix' && resource !== 'saas_system_settings') {
      query = query.eq('tenant_id', tenantId);
    }
    const { error } = await query;
    return !error;
  }

  public async bulkCreateRecords<T = any>(resource: string, items: Partial<T>[], tenantId?: string): Promise<BulkOperationResult> {
    const enrichedItems = items.map(item => ({
      ...item,
      tenant_id: tenantId || (item as any).tenant_id || 'TNT-DEFAULT',
      created_at: (item as any).created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    const { data, error } = await supabase.from(resource).insert(enrichedItems).select();
    if (error) {
      return { totalInserted: 0, errors: [error.message] };
    }
    return { totalInserted: data ? data.length : 0, errors: [] };
  }

  public async uploadFile(fileName: string, fileType: string, fileData: string | File | Blob): Promise<string> {
    const ext = fileType === 'image/webp' ? '.webp' : (fileName.substring(fileName.lastIndexOf('.')) || '');
    const uniqueName = `upload_${Date.now()}_${Math.random().toString(36).substring(2, 7)}${ext}`;

    let fileBody: any = fileData;
    if (typeof fileData === 'string' && fileData.startsWith('data:')) {
      const arr = fileData.split(',');
      const mime = arr[0].match(/:(.*?);/)?.[1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      fileBody = new Blob([u8arr], { type: mime });
    }

    const { data, error } = await supabase.storage.from('media').upload(uniqueName, fileBody, {
      contentType: fileType
    });

    if (error) {
      throw new Error(`Supabase Storage Upload Error: ${error.message}`);
    }

    const { data: publicData } = supabase.storage.from('media').getPublicUrl(data.path);
    return publicData.publicUrl;
  }
}
