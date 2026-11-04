import { supabase } from '../lib/supabase';

/** Giriş sonrası / e-posta bağlantısı sonrası dönülecek adres (alt dizinde de çalışır). */
function redirectUrl(): string {
  return `${window.location.origin}${window.location.pathname}`;
}

export interface AuthResult {
  ok: boolean;
  /** Kullanıcıya gösterilecek Türkçe mesaj (hata ya da bilgi). */
  message?: string;
  /** Doğrulama e-postası gönderildi (oturum henüz açılmadı). */
  needsConfirm?: boolean;
}

/** Supabase hata iletilerini anlaşılır Türkçeye çevirir. */
function friendly(err: { message?: string; status?: number; code?: string } | null | undefined): string {
  const msg = (err?.message || '').toLowerCase();
  const code = err?.code || '';
  if (code === 'invalid_credentials' || msg.includes('invalid login credentials')) return 'E-posta veya şifre hatalı.';
  if (code === 'email_not_confirmed' || msg.includes('email not confirmed')) return 'E-postan henüz doğrulanmamış. Gelen kutundaki bağlantıya tıkla.';
  if (code === 'user_already_exists' || msg.includes('already registered')) return 'Bu e-posta ile zaten bir hesap var. Giriş yapmayı dene.';
  if (code === 'weak_password' || msg.includes('password should be')) return 'Şifre en az 8 karakter olmalı.';
  if (code === 'same_password' || msg.includes('different from the old')) return 'Yeni şifre eskisinden farklı olmalı.';
  if (code === 'over_email_send_rate_limit' || msg.includes('rate limit') || err?.status === 429) return 'Çok fazla deneme yapıldı. Biraz bekleyip tekrar dene.';
  if (msg.includes('failed to fetch') || msg.includes('network')) return 'Bağlantı hatası. İnternetini kontrol edip tekrar dene.';
  if (msg.includes('invalid email') || code === 'validation_failed') return 'Geçerli bir e-posta adresi gir.';
  return 'Bir sorun oluştu. Lütfen tekrar dene.';
}

export async function signInWithGoogle(): Promise<AuthResult> {
  if (!supabase) return { ok: false, message: 'Giriş şu an kullanılamıyor.' };
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: redirectUrl() }
  });
  // Başarılıysa tarayıcı Google'a yönlendirilir; buraya genelde dönülmez.
  return error ? { ok: false, message: friendly(error) } : { ok: true };
}

export async function signInWithEmail(email: string, password: string): Promise<AuthResult> {
  if (!supabase) return { ok: false, message: 'Giriş şu an kullanılamıyor.' };
  const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
  return error ? { ok: false, message: friendly(error) } : { ok: true };
}

export async function signUpWithEmail(email: string, password: string, displayName = ''): Promise<AuthResult> {
  if (!supabase) return { ok: false, message: 'Giriş şu an kullanılamıyor.' };
  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: { emailRedirectTo: redirectUrl(), data: displayName.trim() ? { display_name: displayName.trim() } : {} }
  });
  if (error) return { ok: false, message: friendly(error) };
  // E-posta zaten kayıtlıysa Supabase (hesap sızdırmamak için) hata yerine boş identities döner.
  if (data.user && data.user.identities && data.user.identities.length === 0) {
    return { ok: false, message: 'Bu e-posta ile zaten bir hesap var. Giriş yapmayı dene.' };
  }
  if (!data.session) {
    return { ok: true, needsConfirm: true, message: 'Doğrulama bağlantısını e-postana gönderdik. Bağlantıya tıkladıktan sonra giriş yapabilirsin.' };
  }
  return { ok: true };
}

export async function sendPasswordReset(email: string): Promise<AuthResult> {
  if (!supabase) return { ok: false, message: 'Giriş şu an kullanılamıyor.' };
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: redirectUrl() });
  if (error) return { ok: false, message: friendly(error) };
  return { ok: true, message: 'Bu e-posta kayıtlıysa şifre yenileme bağlantısı gönderildi.' };
}

export async function updatePassword(password: string): Promise<AuthResult> {
  if (!supabase) return { ok: false, message: 'Giriş şu an kullanılamıyor.' };
  const { error } = await supabase.auth.updateUser({ password });
  return error ? { ok: false, message: friendly(error) } : { ok: true, message: 'Şifren güncellendi.' };
}

/** Kullanıcının isteğe bağlı görünen adını Supabase profil metadata alanında saklar. */
export async function updateDisplayName(displayName: string): Promise<AuthResult> {
  if (!supabase) return { ok: false, message: 'Profil şu an güncellenemiyor.' };
  const cleanName = displayName.trim();
  if (!cleanName || cleanName.length > 40) {
    return { ok: false, message: 'İsim 1–40 karakter arasında olmalı.' };
  }
  const { error } = await supabase.auth.updateUser({ data: { display_name: cleanName } });
  return error
    ? { ok: false, message: 'İsim kaydedilemedi. Lütfen tekrar dene.' }
    : { ok: true, message: 'Görünen adın güncellendi.' };
}

/** Fotoğrafı 320px'e küçültüp JPEG olarak kullanıcının özel klasörüne yükler. */
export async function uploadAvatar(file: File): Promise<AuthResult> {
  if (!supabase) return { ok: false, message: 'Profil fotoğrafı yüklenemiyor.' };
  if (!file.type.startsWith('image/')) return { ok: false, message: 'Lütfen bir görsel dosyası seç.' };
  if (file.size > 8 * 1024 * 1024) return { ok: false, message: 'Fotoğraf en fazla 8 MB olabilir.' };
  try {
    const image = await createImageBitmap(file);
    const canvas = document.createElement('canvas');
    const scale = Math.min(1, 320 / Math.max(image.width, image.height));
    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Görsel işlenemedi.');
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    image.close();
    const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(b => b ? resolve(b) : reject(new Error('Sıkıştırma başarısız.')), 'image/jpeg', 0.8));
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { ok: false, message: 'Önce hesabına giriş yapmalısın.' };
    const path = `${user.id}/avatar.jpg`;
    const { error } = await supabase.storage.from('avatars').upload(path, blob, { contentType: 'image/jpeg', upsert: true, cacheControl: '3600' });
    if (error) throw error;
    const { data } = supabase.storage.from('avatars').getPublicUrl(path);
    const { error: metaError } = await supabase.auth.updateUser({ data: { avatar_url: `${data.publicUrl}?v=${Date.now()}` } });
    if (metaError) throw metaError;
    return { ok: true, message: 'Profil fotoğrafın güncellendi.' };
  } catch (error) {
    console.error('Avatar upload error:', error);
    return { ok: false, message: 'Fotoğraf yüklenemedi. Supabase depolama ayarlarını kontrol et.' };
  }
}

export async function removeAvatar(): Promise<AuthResult> {
  if (!supabase) return { ok: false, message: 'Profil güncellenemiyor.' };
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { ok: false, message: 'Önce hesabına giriş yapmalısın.' };
    const { error } = await supabase.storage.from('avatars').remove([`${user.id}/avatar.jpg`]);
    if (error) throw error;
    const { error: metaError } = await supabase.auth.updateUser({ data: { avatar_url: null } });
    if (metaError) throw metaError;
    return { ok: true, message: 'Profil fotoğrafın kaldırıldı.' };
  } catch {
    return { ok: false, message: 'Fotoğraf kaldırılamadı. Tekrar dene.' };
  }
}

export async function signOutUser(): Promise<void> {
  if (!supabase) return;
  await supabase.auth.signOut({ scope: 'local' }); // yalnızca bu cihaz; diğer cihazlar açık kalır
}
