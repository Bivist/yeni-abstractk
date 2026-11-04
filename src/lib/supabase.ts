import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase istemcisi. Anahtarlar .env dosyasından (VITE_ önekli) okunur.
 * Anahtarlar tanımlı değilse istemci null olur ve uygulama eskisi gibi, hesapsız (yalnızca
 * yerel) çalışmaya devam eder; yani giriş özelliği isteğe bağlıdır.
 *
 * Not: anon (publishable) anahtar tarayıcıya gömülmek üzere tasarlanmıştır; veriyi
 * korumak Satır Düzeyi Güvenlik (RLS) kurallarının işidir (supabase/schema.sql).
 */
const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim();
// Yeni Supabase panelinde anahtarın adı "publishable key"; eski adı "anon key". İkisi de kabul edilir.
const key = (
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) ||
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)
)?.trim();

export const supabase: SupabaseClient | null =
  url && key
    ? createClient(url, key, {
        auth: {
          flowType: 'pkce',
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      })
    : null;

export const authEnabled = !!supabase;
