import { MODULE_REGISTRY } from '../core/registry';
import { ModuleSchema, FieldSchema } from '../core/types';

/**
 * Universal SQL & DDL Generator
 * Automatically transforms ModuleSchema from `src/core/registry.ts` into
 * standard PostgreSQL / Supabase DDL definitions with B-Tree Indexes and Row Level Security (RLS).
 */
export class SqlGenerator {
  private static mapFieldToPostgresType(field: FieldSchema): string {
    switch (field.type) {
      case 'number':
        return 'NUMERIC(15, 2)';
      case 'boolean':
        return 'BOOLEAN DEFAULT FALSE';
      case 'date':
        return 'DATE';
      case 'textarea':
      case 'richtext':
        return 'TEXT';
      case 'location':
      case 'file':
        return 'TEXT';
      default:
        return 'VARCHAR(255)';
    }
  }

  public static generatePostgresSchema(schemas: ModuleSchema[] = MODULE_REGISTRY): string {
    const lines: string[] = [
      '--',
      '-- =========================================================================',
      '-- ELECTIONS SAAS & TPS MANAGEMENT SYSTEM - COMPLETE POSTGRESQL / SUPABASE DDL',
      '-- Generated automatically from Schema-Driven Low-Code Engine',
      '-- Compatible with: PostgreSQL 14+ / Supabase Cloud Platform',
      '-- =========================================================================',
      '',
      '-- 1. Enable Required Extensions',
      'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";',
      'CREATE EXTENSION IF NOT EXISTS "pgcrypto";',
      ''
    ];

    for (const schema of schemas) {
      if (!schema.fields || schema.fields.length === 0) continue;

      lines.push(`-- ---------------------------------------------------------`);
      lines.push(`-- Table: ${schema.id} (${schema.title})`);
      lines.push(`-- Description: ${schema.description || '-'}`);
      lines.push(`-- ---------------------------------------------------------`);
      lines.push(`CREATE TABLE IF NOT EXISTS public.${schema.id} (`);
      lines.push(`    id VARCHAR(128) PRIMARY KEY,`);
      lines.push(`    tenant_id VARCHAR(64) NOT NULL DEFAULT 'TNT-DEFAULT',`);

      for (const field of schema.fields) {
        if (field.key === 'id' || field.key === 'tenant_id') continue;
        const pgType = this.mapFieldToPostgresType(field);
        const isRequired = field.validation?.required ? 'NOT NULL' : '';
        lines.push(`    ${field.key} ${pgType} ${isRequired}`.trimEnd() + ',');
      }

      lines.push(`    created_at TIMESTAMPTZ DEFAULT NOW(),`);
      lines.push(`    updated_at TIMESTAMPTZ DEFAULT NOW(),`);
      lines.push(`    created_by_role VARCHAR(64) DEFAULT 'CALEG_UTAMA'`);
      lines.push(`);`);
      lines.push('');

      // Indexes for rapid filtering & geofencing
      lines.push(`-- B-Tree Performance Indexes for ${schema.id}`);
      lines.push(`CREATE INDEX IF NOT EXISTS idx_${schema.id}_tenant ON public.${schema.id} (tenant_id);`);
      lines.push(`CREATE INDEX IF NOT EXISTS idx_${schema.id}_created_at ON public.${schema.id} (created_at DESC);`);

      if (schema.searchKeys && schema.searchKeys.length > 0) {
        for (const searchKey of schema.searchKeys) {
          if (searchKey !== 'id' && searchKey !== 'tenant_id') {
            lines.push(`CREATE INDEX IF NOT EXISTS idx_${schema.id}_${searchKey} ON public.${schema.id} (${searchKey});`);
          }
        }
      }

      // Domain-specific composite indexes
      if (schema.id === 'data_dpt') {
        lines.push(`CREATE INDEX IF NOT EXISTS idx_data_dpt_geo_tps ON public.data_dpt (tenant_id, kecamatan, desa, nomor_tps);`);
        lines.push(`CREATE INDEX IF NOT EXISTS idx_data_dpt_nik ON public.data_dpt (nik);`);
      } else if (schema.id === 'konstituen') {
        lines.push(`CREATE INDEX IF NOT EXISTS idx_konstituen_nik_tenant ON public.konstituen (tenant_id, nik);`);
        lines.push(`CREATE INDEX IF NOT EXISTS idx_konstituen_geo ON public.konstituen (tenant_id, kecamatan, desa);`);
      } else if (schema.id === 'quick_count_c1') {
        lines.push(`CREATE INDEX IF NOT EXISTS idx_qc_geo_tps ON public.quick_count_c1 (tenant_id, kecamatan, desa, nomor_tps);`);
      } else if (schema.id === 'user_relawan') {
        lines.push(`CREATE INDEX IF NOT EXISTS idx_relawan_email ON public.user_relawan (email);`);
        lines.push(`CREATE INDEX IF NOT EXISTS idx_relawan_hierarchy ON public.user_relawan (tenant_id, tingkat_penugasan, kecamatan_tugas);`);
      }

      // Row Level Security (RLS) policies for Enterprise Multi-Tenancy
      lines.push('');
      lines.push(`-- Row Level Security (RLS) Multi-Tenancy for ${schema.id}`);
      lines.push(`ALTER TABLE public.${schema.id} ENABLE ROW LEVEL SECURITY;`);
      lines.push(`DROP POLICY IF EXISTS tenant_isolation_policy ON public.${schema.id};`);
      
      if (schema.id.startsWith('saas_')) {
        // SaaS Global Configuration accessible by Superadmins
        lines.push(`CREATE POLICY saas_admin_policy ON public.${schema.id}`);
        lines.push(`    FOR ALL USING (auth.role() = 'authenticated');`);
      } else {
        // Standard Electoral Tenant Isolation
        lines.push(`CREATE POLICY tenant_isolation_policy ON public.${schema.id}`);
        lines.push(`    FOR ALL USING (`);
        lines.push(`        tenant_id = current_setting('app.current_tenant_id', true)`);
        lines.push(`        OR tenant_id = 'TNT-DEFAULT'`);
        lines.push(`        OR auth.role() = 'service_role'`);
        lines.push(`    );`);
      }

      lines.push('');
    }

    // Auto-update timestamp trigger helper
    lines.push('-- ---------------------------------------------------------');
    lines.push('-- Automatic Timestamp Update Function');
    lines.push('-- ---------------------------------------------------------');
    lines.push('CREATE OR REPLACE FUNCTION public.handle_updated_at()');
    lines.push('RETURNS TRIGGER AS $$');
    lines.push('BEGIN');
    lines.push('    NEW.updated_at = NOW();');
    lines.push('    RETURN NEW;');
    lines.push('END;');
    lines.push('$$ LANGUAGE plpgsql;');
    lines.push('');

    for (const schema of schemas) {
      if (!schema.fields || schema.fields.length === 0) continue;
      lines.push(`DROP TRIGGER IF EXISTS trg_${schema.id}_updated_at ON public.${schema.id};`);
      lines.push(`CREATE TRIGGER trg_${schema.id}_updated_at`);
      lines.push(`    BEFORE UPDATE ON public.${schema.id}`);
      lines.push(`    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();`);
      lines.push('');
    }

    return lines.join('\n');
  }

  public static downloadSqlFile(fileName: string = 'database_migration_schema.sql'): void {
    const fullSql = this.generatePostgresSchema();
    const blob = new Blob([fullSql], { type: 'text/sql;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
