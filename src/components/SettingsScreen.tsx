import React, { useEffect, useState } from 'react';
import { SettingsState } from '../types';
import { Smartphone, Trash2, LogIn, LogOut, UserRound, Cloud, Save, Languages, Volume2, PlayCircle } from 'lucide-react';

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
  onUpdateDisplayName,
  syncStatus = 'idle',
  onOpenAuth,
  onSignOut
}) => {
  const [displayName, setDisplayName] = useState(userDisplayName || '');
  const [nameBusy, setNameBusy] = useState(false);
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
    <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-10 max-w-lg mx-auto w-full select-none">
      <h1 className="font-serif text-[32px] leading-none text-ink mb-5">{langDict.tab_settings || 'Ayarlar'}</h1>

      {/* ── Hesap ── */}
      {authEnabled && (
        <Group title={langDict.set_lbl_account || 'Hesap'}>
          {userEmail ? (
            <div className="p-4 space-y-4">
              <div className="flex items-center gap-3.5">
                <span className="w-12 h-12 rounded-full bg-t3 text-on-tone flex items-center justify-center shrink-0">
                  <UserRound className="w-6 h-6" />
                </span>
                <div className="min-w-0">
                  <b className="block text-[15px] text-ink truncate">{userDisplayName || userEmail}</b>
                  <span className="block text-xs text-mute truncate">{userEmail}</span>
                  <span className={`text-xs flex items-center gap-1 mt-0.5 ${syncStatus === 'error' ? 'text-accent-fg font-semibold' : 'text-mute'}`}>
                    <Cloud className="w-3 h-3" /> {syncText}
                  </span>
                </div>
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
