import { createClient, SupabaseClient } from '@supabase/supabase-js';

const getViteEnv = (key: string): string => {
  if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
    const val = (import.meta as any).env[key];
    if (val && typeof val === 'string' && val.trim() !== '') return val.trim();
  }
  return '';
};

function isValidHttpUrl(string: string): boolean {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
}

export const isSupabaseConfigured = (): boolean => {
  const url = getViteEnv('VITE_SUPABASE_URL');
  const key = getViteEnv('VITE_SUPABASE_ANON_KEY');
  return Boolean(url && key && isValidHttpUrl(url) && !url.includes('demo-pemenangancaleg'));
};

let _supabaseInstance: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient => {
  if (!_supabaseInstance) {
    const rawUrl = getViteEnv('VITE_SUPABASE_URL');
    const rawKey = getViteEnv('VITE_SUPABASE_ANON_KEY');

    const validUrl = rawUrl && isValidHttpUrl(rawUrl) ? rawUrl : 'https://placeholder-electoral.supabase.co';
    const validKey = rawKey && rawKey.length > 10 ? rawKey : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.placeholder';

    _supabaseInstance = createClient(validUrl, validKey, {
      auth: { persistSession: true, autoRefreshToken: true },
      db: { schema: 'public' }
    });
  }
  return _supabaseInstance;
};

// Safe Proxy export for backward compatibility so `supabase.from(...)` never crashes on module load
export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const instance = getSupabase();
    const val = (instance as any)[prop];
    return typeof val === 'function' ? val.bind(instance) : val;
  }
});
