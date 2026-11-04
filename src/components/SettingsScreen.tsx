import React, { useEffect, useState } from 'react';
import { SettingsState } from '../types';
import { Smartphone, Monitor, Camera, X, Trash2, LogIn, LogOut, UserRound, Cloud, Save, Languages, Volume2, PlayCircle, BookOpen, Waves, Compass } from 'lucide-react';

interface SettingsScreenProps {
  settings: SettingsState;
  onUpdateSettings: (updater: (prev: SettingsState) => SettingsState) => void;
  onClearLikes: () => void;
  onReplayTour?: () => void;
  langDict: Record<string, string>;
  /** Giriş özelliği (Supabase) yapılandırılmış mı? Değilse Hesap bölümü gizlenir. */
  authEnabled?: boolean;
  userEmail?: string | null;
  userDisplayName?: string | null;
  userAvatarUrl?: string | null;
  onUploadAvatar?: (file: File) => Promise<{ ok: boolean; message?: string }>;
  onRemoveAvatar?: () => Promise<{ ok: boolean; message?: string }>;
  onUpdateDisplayName?: (name: string) => Promise<{ ok: boolean; message?: string }>;
  syncStatus?: 'idle' | 'syncing' | 'synced' | 'error';
  onOpenAuth?: () => void;
  onSignOut?: () => void;
}

const Switch: React.FC<{ checked: boolean; onChange: (v: boolean) => void; label: string }> = ({ checked, onChange, label }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    onClick={() => onChange(!checked)}
    className={`relative w-14 h-8 rounded-full shrink-0 transition-colors ${checked ? 'bg-accent' : 'bg-line'}`}
  >
    <span className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-6' : ''}`} />
  </button>
);

function Segmented<T extends string>({ value, options, onChange, label }: { value: T; options: { v: T; label: string }[]; onChange: (v: T) => void; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="grid gap-1 p-1 rounded-2xl bg-soft" style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}>
      {options.map(o => (
        <button
          key={o.v}
          type="button"
          role="radio"
          aria-checked={value === o.v}
          onClick={() => onChange(o.v)}
          className={`min-h-[44px] rounded-xl text-sm font-bold transition-colors ${value === o.v ? 'bg-ink text-paper' : 'text-mute'}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

const Group: React.FC<{ title: string; children: React.ReactNode; danger?: boolean }> = ({ title, children, danger }) => (
  <section className="mb-6">
    <h2 className={`font-serif text-lg mb-2.5 ${danger ? 'text-accent-fg' : 'text-ink'}`}>{title}</h2>
    <div className="rounded-[22px] bg-card border border-line overflow-hidden divide-y divide-line">{children}</div>
  </section>
);

const Row: React.FC<{ icon: React.ReactNode; title: string; desc?: string; right?: React.ReactNode }> = ({ icon, title, desc, right }) => (
  <div className="p-4 flex items-center gap-3.5">
    <span className="w-11 h-11 rounded-2xl bg-t1 text-on-tone flex items-center justify-center shrink-0">{icon}</span>
    <div className="flex-1 min-w-0">
      <b className="block text-[15px] text-ink">{title}</b>
      {desc && <p className="text-xs text-mute mt-0.5 leading-relaxed">{desc}</p>}
    </div>
    {right}
  </div>
);

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  settings,
  onUpdateSettings,
  onClearLikes,
  onReplayTour,
  langDict,
  authEnabled = false,
  userEmail = null,
  userDisplayName = null,
  userAvatarUrl = null,
  onUploadAvatar,
  onRemoveAvatar,
  onUpdateDisplayName,
  syncStatus = 'idle',
  onOpenAuth,
  onSignOut
}) => {
  const [displayName, setDisplayName] = useState(userDisplayName || '');
  const [nameBusy, setNameBusy] = useState(false);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [avatarMessage, setAvatarMessage] = useState<string | null>(null);
  const [nameMessage, setNameMessage] = useState<string | null>(null);
  useEffect(() => { setDisplayName(userDisplayName || ''); }, [userDisplayName]);

  const saveDisplayName = async () => {
    if (!onUpdateDisplayName || nameBusy) return;
    setNameBusy(true);
    setNameMessage(null);
    try {
      const result = await onUpdateDisplayName(displayName);
      setNameMessage(result.message || (result.ok ? 'Kaydedildi.' : 'Kaydedilemedi.'));
    } finally { setNameBusy(false); }
  };

  const syncText =
    syncStatus === 'syncing' ? (langDict.sync_syncing || 'Eşitleniyor…')
    : syncStatus === 'error' ? (langDict.sync_error || 'Eşitlenemedi, tekrar denenecek')
    : (langDict.sync_ok || 'Verilerin hesabında yedekleniyor');

  const en = settings.lang === 'en';

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-10 max-w-5xl mx-auto w-full select-none">
      <h1 className="font-serif text-[32px] leading-none text-ink mb-5">{langDict.tab_settings || 'Ayarlar'}</h1>

      {/* ── Hesap ── */}
      {authEnabled && (
        <Group title={langDict.set_lbl_account || 'Hesap'}>
          {userEmail ? (
            <div className="p-4 space-y-4">
              <div className="flex items-center gap-3.5">
                <span className="w-14 h-14 rounded-full bg-t3 text-on-tone flex items-center justify-center shrink-0 overflow-hidden border-2 border-edge">{userAvatarUrl ? <img src={userAvatarUrl} alt="Profil fotoğrafı" className="w-full h-full object-cover" /> : <UserRound className="w-6 h-6" />}</span>
                <div className="min-w-0">
                  <b className="block text-[15px] text-ink truncate">{userDisplayName || userEmail}</b>
                  <span className="block text-xs text-mute truncate">{userEmail}</span>
                  <span className={`text-xs flex items-center gap-1 mt-0.5 ${syncStatus === 'error' ? 'text-accent-fg font-semibold' : 'text-mute'}`}>
                    <Cloud className="w-3 h-3" /> {syncText}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <label className="btn btn-primary !min-h-[40px] !px-4 cursor-pointer">
                  <Camera className="w-4 h-4" /> {userAvatarUrl ? 'Fotoğrafı değiştir' : 'Fotoğraf ekle'}
                  <input type="file" accept="image/*" className="sr-only" disabled={avatarBusy} onChange={async e => {
                    const file = e.currentTarget.files?.[0]; e.currentTarget.value = '';
                    if (!file || !onUploadAvatar) return;
                    setAvatarBusy(true); setAvatarMessage(null);
                    try { const result = await onUploadAvatar(file); setAvatarMessage(result.message || (result.ok ? 'Kaydedildi.' : 'Yüklenemedi.')); }
                    finally { setAvatarBusy(false); }
                  }} />
                </label>
                {userAvatarUrl && <button type="button" disabled={avatarBusy} onClick={async () => {
                  if (!onRemoveAvatar) return; setAvatarBusy(true); setAvatarMessage(null);
                  try { const result = await onRemoveAvatar(); setAvatarMessage(result.message || (result.ok ? 'Kaldırıldı.' : 'Kaldırılamadı.')); }
                  finally { setAvatarBusy(false); }
                }} className="btn btn-ghost !min-h-[40px] !px-4"><X className="w-4 h-4" /> Kaldır</button>}
                {avatarBusy && <span className="text-xs text-mute">Yükleniyor…</span>}
                {avatarMessage && <span role="status" className="text-xs text-mute">{avatarMessage}</span>}
              </div>

              <div>
                <label htmlFor="display-name" className="field-label">Görünen ad</label>
                <div className="flex gap-2">
                  <input
                    id="display-name"
                    type="text"
                    value={displayName}
                    maxLength={40}
                    onChange={e => setDisplayName(e.target.value)}
                    placeholder="İsmini belirle (isteğe bağlı)"
                    className="field min-w-0 flex-1"
                  />
                  <button
                    type="button"
                    onClick={saveDisplayName}
                    disabled={nameBusy || !displayName.trim() || displayName.trim() === (userDisplayName || '')}
                    aria-label="Adı kaydet"
                    className="btn btn-primary !px-4"
                  >
                    <Save className="w-4 h-4" />
                  </button>
                </div>
                {nameMessage && <p role="status" className="text-xs text-mute mt-1.5">{nameMessage}</p>}
                <p className="text-xs text-mute mt-1.5">Bu isim hesabında saklanır ve diğer cihazlarında da görünür.</p>
              </div>

              <button type="button" onClick={onSignOut} className="btn btn-ghost w-full">
                <LogOut className="w-4 h-4" /> {langDict.auth_signout || 'Çıkış yap'}
              </button>
              <p className="text-xs text-mute leading-relaxed">
                {langDict.auth_signout_note || 'Çıkış yapınca bu cihazdaki veriler silinir; hesabına giriş yaptığında geri gelir.'}
              </p>
            </div>
          ) : (
            <button type="button" onClick={onOpenAuth} className="w-full p-4 flex items-center gap-3.5 text-left">
              <span className="w-11 h-11 rounded-2xl bg-accent text-accent-ink flex items-center justify-center shrink-0">
                <LogIn className="w-5 h-5" />
              </span>
              <span>
                <b className="block text-[15px] text-ink">{langDict.auth_cta || 'Giriş yap / Hesap oluştur'}</b>
                <span className="block text-xs text-mute mt-0.5 leading-relaxed">
                  {langDict.auth_cta_desc || 'Beğenilerini yedekle, telefon ve bilgisayarında aynı veriyle devam et.'}
                </span>
              </span>
            </button>
          )}
        </Group>
      )}

      {/* ── Görünüm ── */}
      <Group title="Görünüm">
        <div className="p-4 space-y-3">
          <div>
            <p className="text-sm font-bold text-ink mb-1">Sayfa tasarımı</p>
            <p className="text-xs text-mute mb-3">Uygulamanın tüm ekranlarının görünümünü değiştir.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                { v: 'current' as const, title: 'Mevcut', desc: 'Abstract’ın özgün görünümü', Icon: Compass, swatches: ['#edf3ee', '#0f2a24', '#d81b6a'] },
                { v: 'paper' as const, title: 'Kâğıt', desc: 'Editoryal, sıcak ve sade', Icon: BookOpen, swatches: ['#f3eee5', '#4d6842', '#302820'] },
                { v: 'ocean' as const, title: 'Deniz', desc: 'Derin mavi ve deniz feneri', Icon: Waves, swatches: ['#08283b', '#39b8b0', '#e8d7a6'] }
              ].map(({ v, title, desc, Icon, swatches }) => (
                <button key={v} type="button" onClick={() => onUpdateSettings(prev => ({ ...prev, design: v }))} aria-pressed={(settings.design || 'current') === v}
                  className={`text-left rounded-2xl border-2 p-3 transition-all ${(settings.design || 'current') === v ? 'border-accent bg-soft' : 'border-line bg-card hover:border-mute'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="w-9 h-9 rounded-xl bg-paper border border-line flex items-center justify-center text-ink"><Icon className="w-5 h-5" /></span>
                    <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${(settings.design || 'current') === v ? 'border-accent' : 'border-line'}`}>
                      {(settings.design || 'current') === v && <span className="w-2.5 h-2.5 rounded-full bg-accent" />}
                    </span>
                  </div>
                  <div className="flex gap-1.5 mb-2">{swatches.map(color => <span key={color} className="w-5 h-5 rounded-full border border-black/10" style={{ backgroundColor: color }} />)}</div>
                  <b className="block text-sm text-ink">{title}</b>
                  <span className="block text-[11px] text-mute mt-0.5">{desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="p-4 space-y-2">
          <p className="text-xs text-mute">Ekran düzeni</p>
          <Segmented
            label="Ekran düzeni"
            value={settings.displayMode || 'auto'}
            onChange={v => onUpdateSettings(prev => ({ ...prev, displayMode: v }))}
            options={[
              { v: 'auto', label: 'Otomatik' },
              { v: 'mobile', label: 'Mobil' },
              { v: 'desktop', label: 'Masaüstü' }
            ]}
          />
          <p className="text-xs text-mute">Otomatik mod, ekran genişliğine göre uygun düzeni seçer.</p>
        </div>
      </Group>

      {/* ── Okuma deneyimi ── */}
      <Group title={langDict.set_lbl_experience || 'Okuma deneyimi'}>
        <Row
          icon={<Smartphone className="w-5 h-5" />}
          title={langDict.set_reels_mode || 'Akış modu'}
          desc={langDict.set_reels_desc}
          right={<Switch label={langDict.set_reels_mode || 'Akış modu'} checked={settings.reelsMode} onChange={v => onUpdateSettings(prev => ({ ...prev, reelsMode: v }))} />}
        />
        <Row
          icon={<Languages className="w-5 h-5" />}
          title={`${en ? 'Translate to Turkish' : 'Türkçe çeviri'} (${langDict.set_fish_tr || 'blup'})`}
          desc={en ? 'Shows paper titles and abstracts translated into Turkish.' : 'Makale başlığını ve özetini Türkçeye çevirerek gösterir.'}
          right={<Switch label="Türkçe çeviri" checked={settings.translate} onChange={v => onUpdateSettings(prev => ({ ...prev, translate: v }))} />}
        />
        <Row
          icon={<Volume2 className="w-5 h-5" />}
          title={langDict.set_sound || 'Ses efektleri'}
          right={<Switch label={langDict.set_sound || 'Ses efektleri'} checked={settings.sound} onChange={v => onUpdateSettings(prev => ({ ...prev, sound: v }))} />}
        />
      </Group>

      {/* ── Dil ve tema ── */}
      <section className="mb-6 space-y-4">
        <div>
          <h2 className="font-serif text-lg text-ink mb-2.5">{langDict.set_lbl_lang || 'Uygulama dili'}</h2>
          <Segmented
            label="Uygulama dili"
            value={settings.lang}
            onChange={v => onUpdateSettings(prev => ({ ...prev, lang: v }))}
            options={[{ v: 'tr', label: 'Türkçe' }, { v: 'en', label: 'English' }]}
          />
        </div>
        <div>
          <h2 className="font-serif text-lg text-ink mb-2.5">{langDict.set_lbl_theme || 'Tema'}</h2>
          <Segmented
            label="Tema"
            value={settings.theme}
            onChange={v => onUpdateSettings(prev => ({ ...prev, theme: v }))}
            options={[
              { v: 'auto', label: langDict.theme_auto || 'Sistem' },
              { v: 'light', label: langDict.theme_light || 'Açık' },
              { v: 'dark', label: langDict.theme_dark || 'Koyu' }
            ]}
          />
        </div>
      </section>

      {/* ── Tur ── */}
      {onReplayTour && (
        <section className="mb-6">
          <button type="button" onClick={onReplayTour} className="w-full rounded-[22px] bg-t2 text-on-tone p-4 flex items-center gap-3.5 text-left">
            <PlayCircle className="w-7 h-7 shrink-0" />
            <span>
              <b className="block text-[15px]">{langDict.tour_replay || 'Uygulama turunu tekrar göster'}</b>
              <span className="block text-xs mt-0.5">{langDict.tour_replay_desc}</span>
            </span>
          </button>
        </section>
      )}

      {/* ── İşlemler ── */}
      <Group title={langDict.set_lbl_actions || 'İşlemler'} danger>
        <button type="button" onClick={onClearLikes} className="w-full min-h-[56px] px-4 flex items-center gap-3 text-left text-accent-fg font-bold text-[15px]">
          <Trash2 className="w-5 h-5" />
          {langDict.clear_likes || 'Tüm beğenilenleri temizle'}
        </button>
      </Group>

      <p className="text-center text-xs text-mute px-2">
        {userEmail
          ? (langDict.privacy_note_account || 'Veriler hesabına bağlı olarak güvenle saklanır; yalnızca sen erişebilirsin.')
          : (langDict.privacy_note || 'Veriler yalnızca bu cihazın tarayıcısında saklanır.')}
      </p>
      <footer className="mt-4 pt-4 text-center border-t border-line">
        <p className="text-xs text-mute">© 2026 Binali. Her hakkı saklıdır.</p>
      </footer>
    </div>
  );
};
