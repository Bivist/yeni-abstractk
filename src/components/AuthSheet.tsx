import React, { useEffect, useState } from 'react';
import { Mail, Lock, Loader2, UserRound } from 'lucide-react';
import {
  signInWithGoogle,
  signInWithEmail,
  signUpWithEmail,
  sendPasswordReset,
  updatePassword,
  type AuthResult
} from '../utils/auth';
import { SheetShell } from './SheetShell';

type Mode = 'signin' | 'signup' | 'forgot' | 'recovery';

interface AuthSheetProps {
  isOpen: boolean;
  onClose: () => void;
  /** Şifre yenileme bağlantısıyla gelindiyse true: yeni şifre formu açılır. */
  recovery: boolean;
  onRecoveryDone: () => void;
  /** Açılış ekranı: "Misafir olarak devam et" düğmesini gösterir. */
  guestOption?: boolean;
  langDict: Record<string, string>;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const GoogleLogo = () => (
  <svg className="w-5 h-5" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" />
    <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.4-4.8 7.1l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.4z" />
    <path fill="#FBBC05" d="M10.5 28.7A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.8-4.7l-7.9-6.1A24 24 0 0 0 0 24c0 3.9.9 7.5 2.6 10.8l7.9-6.1z" />
    <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.9 2.3-8.4 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z" />
  </svg>
);

const iconCls = 'w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-mute';

export const AuthSheet: React.FC<AuthSheetProps> = ({ isOpen, onClose, recovery, onRecoveryDone, guestOption = false, langDict }) => {
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  // Her açılışta formu temizle; şifre yenileme bağlantısıyla gelindiyse o moda geç.
  useEffect(() => {
    if (!isOpen) return;
    setMode(recovery ? 'recovery' : 'signin');
    setPassword('');
    setError(null);
    setInfo(null);
  }, [isOpen, recovery]);

  if (!isOpen) return null;

  const switchMode = (m: Mode) => { setMode(m); setError(null); setInfo(null); setPassword(''); };

  const finish = (res: AuthResult, closeOnOk = true) => {
    if (!res.ok) { setError(res.message || 'Bir sorun oluştu.'); return; }
    if (res.message) setInfo(res.message);
    if (closeOnOk && !res.needsConfirm && !res.message) onClose();
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setError(null);
    setInfo(null);

    if (mode !== 'recovery' && !EMAIL_RE.test(email.trim())) { setError('Geçerli bir e-posta adresi gir.'); return; }
    if (mode !== 'forgot' && password.length < 8) { setError('Şifre en az 8 karakter olmalı.'); return; }

    setBusy(true);
    try {
      if (mode === 'signin') finish(await signInWithEmail(email, password));
      else if (mode === 'signup') finish(await signUpWithEmail(email, password, displayName));
      else if (mode === 'forgot') finish(await sendPasswordReset(email), false);
      else {
        const res = await updatePassword(password);
        if (res.ok) { onRecoveryDone(); onClose(); }
        else setError(res.message || 'Bir sorun oluştu.');
      }
    } finally { setBusy(false); }
  };

  const google = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    const res = await signInWithGoogle();
    if (!res.ok) { setError(res.message || 'Google ile giriş başlatılamadı.'); setBusy(false); }
    // Başarılıysa sayfa Google'a yönlenir; busy açık kalması sorun değil.
  };

  const title =
    mode === 'signin' ? (langDict.auth_signin || 'Giriş yap')
    : mode === 'signup' ? (langDict.auth_signup || 'Hesap oluştur')
    : mode === 'forgot' ? (langDict.auth_forgot_title || 'Şifreni yenile')
    : (langDict.auth_new_password || 'Yeni şifre belirle');

  const linkBtn = 'font-bold text-accent-fg underline underline-offset-2';

  return (
    <SheetShell title={title} onClose={onClose} z="z-[80]" dismissible={!guestOption}>
      <div className="space-y-4">
        {mode !== 'recovery' && mode !== 'forgot' && (
          <>
            <button type="button" onClick={google} disabled={busy} className="btn btn-line w-full !min-h-[52px] bg-card">
              <GoogleLogo />
              {langDict.auth_google || 'Google ile devam et'}
            </button>
            <div className="flex items-center gap-3 text-xs text-mute">
              <span className="flex-1 h-px bg-line" />
              {langDict.auth_or || 'veya e-posta ile'}
              <span className="flex-1 h-px bg-line" />
            </div>
          </>
        )}

        {mode === 'forgot' && <p className="text-sm text-mute leading-relaxed">{langDict.auth_forgot_desc || 'E-posta adresini yaz, sana şifreni yenilemen için bir bağlantı gönderelim.'}</p>}
        {mode === 'recovery' && <p className="text-sm text-mute leading-relaxed">{langDict.auth_recovery_desc || 'Hesabın için yeni bir şifre belirle (en az 8 karakter).'}</p>}

        <form onSubmit={submit} className="space-y-3" noValidate>
          {mode === 'signup' && (
            <label className="relative block">
              <span className="sr-only">Görünen ad (isteğe bağlı)</span>
              <UserRound className={iconCls} />
              <input type="text" autoComplete="nickname" maxLength={40} value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Görünen ad (isteğe bağlı)" className="field !pl-10" />
            </label>
          )}

          {mode !== 'recovery' && (
            <label className="relative block">
              <span className="sr-only">E-posta</span>
              <Mail className={iconCls} />
              <input type="email" inputMode="email" autoComplete="email" autoCapitalize="none" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={langDict.auth_email || 'E-posta'} className="field !pl-10" />
            </label>
          )}
          {mode !== 'forgot' && (
            <label className="relative block">
              <span className="sr-only">Şifre</span>
              <Lock className={iconCls} />
              <input
                type="password"
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'signin' ? (langDict.auth_password || 'Şifre') : (langDict.auth_password_new || 'Şifre (en az 8 karakter)')}
                className="field !pl-10"
              />
            </label>
          )}

          {error && <p role="alert" className="text-sm font-semibold text-accent-fg leading-relaxed">{error}</p>}
          {info && <p role="status" className="text-sm font-semibold text-ok leading-relaxed">{info}</p>}

          <button type="submit" disabled={busy} className="btn btn-primary w-full !min-h-[52px] border-[1.5px] border-edge hard-sm">
            {busy && <Loader2 className="w-4 h-4 animate-spin" />}
            {mode === 'signin' ? (langDict.auth_signin || 'Giriş yap')
              : mode === 'signup' ? (langDict.auth_signup || 'Hesap oluştur')
              : mode === 'forgot' ? (langDict.auth_send_link || 'Bağlantı gönder')
              : (langDict.auth_save_password || 'Şifreyi kaydet')}
          </button>
        </form>

        <div className="text-center text-sm text-mute space-y-2">
          {mode === 'signin' && (
            <>
              <button type="button" onClick={() => switchMode('forgot')} className="underline underline-offset-2">{langDict.auth_forgot || 'Şifremi unuttum'}</button>
              <p>{langDict.auth_no_account || 'Hesabın yok mu?'}{' '}
                <button type="button" onClick={() => switchMode('signup')} className={linkBtn}>{langDict.auth_signup || 'Hesap oluştur'}</button>
              </p>
            </>
          )}
          {mode === 'signup' && (
            <p>{langDict.auth_have_account || 'Zaten hesabın var mı?'}{' '}
              <button type="button" onClick={() => switchMode('signin')} className={linkBtn}>{langDict.auth_signin || 'Giriş yap'}</button>
            </p>
          )}
          {mode === 'forgot' && <button type="button" onClick={() => switchMode('signin')} className={linkBtn}>{langDict.auth_back || 'Girişe dön'}</button>}
        </div>

        {guestOption && mode !== 'recovery' && (
          <div className="pt-1">
            <button type="button" onClick={onClose} className="btn btn-ghost w-full !min-h-[52px]">
              {langDict.auth_guest || 'Misafir olarak devam et'}
            </button>
            <p className="text-xs text-center text-mute leading-relaxed mt-2">
              {langDict.auth_guest_note || 'Hesap olmadan da tüm özellikleri kullanabilirsin; veriler yalnızca bu cihazda kalır. İstediğin zaman Ayarlar\'dan giriş yapabilirsin.'}
            </p>
          </div>
        )}

        <p className="text-xs text-center text-mute leading-relaxed">
          {langDict.auth_privacy || 'Hesap isteğe bağlıdır. Giriş yaparsan beğenilerin, klasörlerin ve ayarların hesabına yedeklenir ve cihazlar arasında eşitlenir.'}
        </p>
      </div>
    </SheetShell>
  );
};
