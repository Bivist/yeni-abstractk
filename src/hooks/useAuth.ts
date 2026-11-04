import { useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export interface AuthState {
  user: User | null;
  /** Kayıtlı oturum kontrolü bitti mi? (false iken "giriş yapılmamış" varsayma) */
  ready: boolean;
  /** Kullanıcı şifre yenileme bağlantısıyla geldi; yeni şifre belirlemesi gerekir. */
  recovery: boolean;
  clearRecovery: () => void;
}

export function useAuth(): AuthState {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState<boolean>(!supabase);
  const [recovery, setRecovery] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setReady(true);
    }).catch(() => { if (active) setReady(true); });

    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      if (!active) return;
      setSession(s);
      if (event === 'PASSWORD_RECOVERY') setRecovery(true);
      if (event === 'SIGNED_OUT') setRecovery(false);
      setReady(true);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { user: session?.user ?? null, ready, recovery, clearRecovery: () => setRecovery(false) };
}
