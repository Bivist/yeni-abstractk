import React, { useState, useEffect, useCallback, useRef, lazy, Suspense } from 'react';
import { Helmet } from 'react-helmet-async';
import { Paper, FilterState, SettingsState, TabId, LighthouseWatchState, ReadingHistoryItem } from './types';
import { I18N } from './constants/i18n';
import { buildSearchTiers, fetchWorks, parseWorksToPapers, getEffectiveNodes, normalizeYears, fetchWorkById } from './utils/openalex';
import { SFX } from './utils/sfx';
import { ensureTranslatedPaper } from './utils/translate';
import { exportPapersToPrint } from './utils/export';
import { sharePaper, readSharedIdFromLocation, clearSharedParam } from './utils/share';
import { loadSettings, loadLikedPapers, loadFolders, loadHistory, loadLighthouseWatch, freshLighthouseWatch } from './utils/storage';
import { useAuth } from './hooks/useAuth';
import { authEnabled } from './lib/supabase';
import { pullCloud, pushCloud, mergeSnapshots, type UserSnapshot } from './utils/cloudSync';
import { signOutUser, updateDisplayName, uploadAvatar, removeAvatar } from './utils/auth';
import { trackEvent } from './utils/analytics';

import { IntroSplash } from './components/IntroSplash';
import { TopBar } from './components/TopBar';
import { BottomNav } from './components/BottomNav';
import { HomeScreen } from './components/HomeScreen';
import { DiscoverClassic } from './components/DiscoverClassic';
import { DiscoverReels } from './components/DiscoverReels';
import { LikesScreen } from './components/LikesScreen';
import { SeyirPanosu } from './components/SeyirPanosu';
import { SettingsScreen } from './components/SettingsScreen';
import { AuthSheet } from './components/AuthSheet';
import { OnboardingTour } from './components/OnboardingTour';
import { ComingSoonLock } from './components/ComingSoonLock';
import { FilterSheet } from './components/FilterSheet';
import { DetailSheet } from './components/DetailSheet';
import { FolderSheet } from './components/FolderSheet';
import type { EasterEggMode } from './components/ThreeEasterEgg';
// three.js (~700 KB) yalnızca easter egg açıldığında yüklensin diye ayrı parçaya bölündü.
const ThreeEasterEgg = lazy(() => import('./components/ThreeEasterEgg').then(m => ({ default: m.ThreeEasterEgg })));
import { KasalotTailSplash } from './components/KasalotTailSplash';
import { PolarAuroraEffect } from './components/PolarAuroraEffect';
import { NotFoundPage } from './components/NotFoundPage';

const DEFAULT_SETTINGS: SettingsState = {
  theme: 'auto',
  fx: true,
  translate: false,
  sound: true,
  lang: 'tr',
  reelsMode: false,
  displayMode: 'auto'
};

/** Bu cihazdaki yerel verinin hangi hesaba ait olduğunu tutar (girişte birleştirme / bulut öncelikli kararı için). */
const SYNC_UID_KEY = 'abs_sync_uid';

export default function App() {
  // Splash Screen Intro State
  const [showSplash, setShowSplash] = useState<boolean>(true);

  // Hesap oturumu ve "misafir olarak devam et" tercihi (bir kez seçilince bir daha sorulmaz)
  const auth = useAuth();
  const [guestChosen, setGuestChosen] = useState<boolean>(() => {
    try { return localStorage.getItem('abs_guest') === '1'; } catch { return false; }
  });
  const chooseGuest = useCallback(() => {
    try { localStorage.setItem('abs_guest', '1'); } catch {}
    setGuestChosen(true);
  }, []);

  // İlk kullanım turu (yalnızca ilk açılışta; Ayarlar'dan tekrar başlatılabilir)
  const [showTour, setShowTour] = useState<boolean>(false);
  const finishTour = useCallback(() => {
    try { localStorage.setItem('abs_tour_done', '1'); } catch {}
    setShowTour(false);
    setCurrentTab('home');
  }, []);

  // Active Tab
  const [currentTab, setCurrentTab] = useState<TabId>('home');

  // Settings State with LocalStorage persistence
  const [settings, setSettings] = useState<SettingsState>(() => loadSettings(DEFAULT_SETTINGS));
  const [wideViewport, setWideViewport] = useState(() => typeof window !== 'undefined' && window.matchMedia('(min-width: 900px)').matches);
  useEffect(() => {
    const media = window.matchMedia('(min-width: 900px)');
    const update = () => setWideViewport(media.matches);
    update(); media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  const desktopMode = settings.displayMode === 'desktop' || (settings.displayMode === 'auto' && wideViewport);

  // Fener Nöbeti (Lighthouse Watch Streak & Daily Reading Goal) State
  const [lighthouseWatch, setLighthouseWatch] = useState<LighthouseWatchState>(() => loadLighthouseWatch());

  useEffect(() => {
    try {
      localStorage.setItem('abs_streak', JSON.stringify(lighthouseWatch));
    } catch {}
  }, [lighthouseWatch]);

  // Reading History for Seyir Panosu (Telemetry & Reading Trends)
  const [readingHistory, setReadingHistory] = useState<ReadingHistoryItem[]>(() => loadHistory());

  useEffect(() => {
    try {
      localStorage.setItem('abs_history', JSON.stringify(readingHistory));
    } catch {}
  }, [readingHistory]);

  const trackPaperRead = useCallback((paper?: Paper) => {
    setLighthouseWatch(prev => {
      const newToday = prev.todayReadCount + 1;
      const beam = Math.min(100, Math.round((newToday / Math.max(prev.dailyGoal, 1)) * 100));
      return {
        ...prev,
        todayReadCount: newToday,
        totalReadCount: prev.totalReadCount + 1,
        beamPower: beam
      };
    });

    if (paper) {
      setReadingHistory(prev => {
        const exists = prev.some(item => item.paperId === paper.id);
        if (exists) return prev;
        return [
          {
            paperId: paper.id,
            title: paper.title,
            field: paper.field || 'Genel Bilim',
            sub: paper.sub,
            kw: paper.kw || [],
            cites: paper.cites || 0,
            timestamp: Date.now()
          },
          ...prev.slice(0, 49) // Keep 50 most recent records
        ];
      });
    }
  }, []);

  const handleUpdateDailyGoal = useCallback((goal: number) => {
    setLighthouseWatch(prev => {
      const beam = Math.min(100, Math.round((prev.todayReadCount / Math.max(goal, 1)) * 100));
      return {
        ...prev,
        dailyGoal: goal,
        beamPower: beam
      };
    });
  }, []);

  // Likes & Folders State with LocalStorage persistence
  const [likedPapers, setLikedPapers] = useState<Paper[]>(() => loadLikedPapers());

  const [folders, setFolders] = useState<Record<string, string[]>>(() => loadFolders());

  // Paper Queue & Pagination state
  const [queue, setQueue] = useState<Paper[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const seenIdsRef = useRef<Set<string>>(new Set());
  const tierIndexRef = useRef<number>(0);
  const tiersRef = useRef<any[]>([]);
  const genRef = useRef<number>(0);
  const loadingRef = useRef<boolean>(false);
  const shownInTierRef = useRef<number>(0);
  const filterRef = useRef<FilterState | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Paylaşılan bağlantıyla gelindiyse önce makale gösterilir; tur, makale kapandıktan sonra başlar.
  const sharedIdRef = useRef<string | null>(readSharedIdFromLocation());
  const [sharedStatus, setSharedStatus] = useState<'none' | 'loading' | 'ready' | 'done'>(
    sharedIdRef.current ? 'loading' : 'none'
  );
  const [pendingShared, setPendingShared] = useState<Paper | null>(null);

  // Açılış giriş ekranı: giriş yapılmamış, misafir seçilmemiş ve paylaşım bağlantısıyla gelinmemişse
  const gateOpen = authEnabled && auth.ready && !auth.user && !guestChosen && !showSplash && !sharedIdRef.current;

  // Splash (ve giriş ekranı) bitince, tur daha önce görülmediyse başlat
  useEffect(() => {
    if (showSplash || gateOpen) return;
    if (sharedStatus === 'loading' || sharedStatus === 'ready') return;
    let done = false;
    try { done = localStorage.getItem('abs_tour_done') === '1'; } catch {}
    if (!done) setShowTour(true);
  }, [showSplash, sharedStatus, gateOpen]);

  // Paylaşım bağlantısındaki makaleyi getir
  useEffect(() => {
    const id = sharedIdRef.current;
    if (!id) return;
    let cancelled = false;
    fetchWorkById(id).then(paper => {
      if (cancelled) return;
      clearSharedParam();
      if (paper) {
        setPendingShared(paper);
        setSharedStatus('ready');
      } else {
        setSharedStatus('done');
        setNotice('Paylaşılan makale bulunamadı veya yüklenemedi. Bağlantıyı kontrol edip tekrar dene.');
      }
    });
    return () => { cancelled = true; };
  }, []);

  // Filters State
  const [filter, setFilter] = useState<FilterState>({
    sel: new Set(),
    from: '',
    to: '',
    authorId: '',
    journalId: '',
    aName: '',
    jName: '',
    en: true
  });

  filterRef.current = filter;

  // Küçük uyarı kutusu: birkaç saniye sonra kendiliğinden kapanır
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 9000);
    return () => clearTimeout(t);
  }, [notice]);

  // Modal Sheet Controls
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [detailPaper, setDetailPaper] = useState<Paper | null>(null);
  const [isFolderSheetOpen, setIsFolderSheetOpen] = useState(false);
  const [folderActionType, setFolderActionType] = useState<'create' | 'assign'>('create');
  const [activeFolderTab, setActiveFolderTab] = useState('__all__');
  const [selectedLikeIds, setSelectedLikeIds] = useState<Set<string>>(new Set());

  // Easter Egg 3D State ('none' | 'pink-flowers' | 'ocean-fish')
  const [easterEgg, setEasterEgg] = useState<EasterEggMode>('none');

  // Easter Egg Speed Swipe (Sperm Whale / Kaşalot Kuyruğu)
  const [showKasalot, setShowKasalot] = useState<boolean>(false);
  const swipeTimestampsRef = useRef<number[]>([]);

  const registerSwipeForSpeedCheck = useCallback(() => {
    const now = Date.now();
    swipeTimestampsRef.current.push(now);
    // 10 second time window
    swipeTimestampsRef.current = swipeTimestampsRef.current.filter(t => now - t <= 10000);
    // If user swipes rapidly (12+ papers in 10s), breach the whale!
    if (swipeTimestampsRef.current.length >= 12) {
      setShowKasalot(true);
      swipeTimestampsRef.current = [];
    }
  }, []);

  // Easter Egg Polar Night Mode (Kutup Gece Modu - Antarktika)
  const [isPolarNight, setIsPolarNight] = useState<boolean>(false);

  // Check author / journal filter for easter egg keywords
  useEffect(() => {
    if (filter.aName) {
      const norm = filter.aName.toLowerCase();
      if (/(acuci|açuçi|asude|asoude)/i.test(norm)) {
        setEasterEgg('pink-flowers');
      } else if (/(binali|binosh|binos|binoş)/i.test(norm)) {
        setEasterEgg('ocean-fish');
      }
    }
    const combined = `${filter.aName} ${filter.jName}`.toLowerCase();
    if (/(antarktika|antarctica|antartika)/i.test(combined)) {
      setIsPolarNight(true);
    }
  }, [filter.aName, filter.jName]);

  // Save Settings
  useEffect(() => {
    try {
      localStorage.setItem('abs_s', JSON.stringify(settings));
    } catch {}
    SFX.setEnabled(settings.sound);
  }, [settings]);

  // Save Likes
  useEffect(() => {
    try {
      localStorage.setItem('abs_liked', JSON.stringify(likedPapers));
    } catch {}
  }, [likedPapers]);

  // Save Folders
  useEffect(() => {
    try {
      localStorage.setItem('abs_folders', JSON.stringify(folders));
    } catch {}
  }, [folders]);

  // Dark Mode Synchronization
  const [isDark, setIsDark] = useState<boolean>(false);

  useEffect(() => {
    const applyTheme = () => {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const shouldDark = settings.theme === 'auto' ? systemDark : settings.theme === 'dark';
      setIsDark(shouldDark);
      if (shouldDark) {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
      }
    };

    applyTheme();
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    media.addEventListener('change', applyTheme);
    return () => media.removeEventListener('change', applyTheme);
  }, [settings.theme]);

  // Localization Dictionary
  const langDict = I18N[settings.lang || 'tr'] || I18N.tr;

  useEffect(() => {
    if (detailPaper?.id) trackEvent('paper_viewed', { paper_id: detailPaper.id });
  }, [detailPaper?.id]);

  useEffect(() => {
    trackEvent('app_tab_viewed', { tab: currentTab });
  }, [currentTab]);

  useEffect(() => {
    if (auth.ready && auth.user) trackEvent('user_authenticated');
  }, [auth.user?.id, auth.ready]);

  // Splash bittikten sonra paylaşılan makaleyi aç
  useEffect(() => {
    if (showSplash || !pendingShared) return;
    setDetailPaper(pendingShared);
    setPendingShared(null);
  }, [showSplash, pendingShared]);

  const handleCloseDetail = useCallback(() => {
    setDetailPaper(null);
    setSharedStatus(prev => (prev === 'ready' ? 'done' : prev));
  }, []);

  // Kısa bilgi mesajı (paylaşım/kopyalama sonucu)
  const [toast, setToast] = useState<string | null>(null);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2800);
    return () => clearTimeout(t);
  }, [toast]);

  // ── Hesap & bulut senkronu (Supabase) ──────────────────────────────────────
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');
  // İlk çekme/birleştirme bitmiş hesabın kimliği. Bu olmadan buluta ASLA yazılmaz (üzerine yazma riski).
  const [syncedUid, setSyncedUid] = useState<string | null>(null);
  const [retryTick, setRetryTick] = useState(0);
  const lastPushedRef = useRef<string | null>(null);

  const latestRef = useRef<UserSnapshot>({ liked: likedPapers, folders, history: readingHistory, streak: lighthouseWatch, settings });
  latestRef.current = { liked: likedPapers, folders, history: readingHistory, streak: lighthouseWatch, settings };

  const snapshotJson = (snap: UserSnapshot) =>
    JSON.stringify({ ...snap, liked: snap.liked.map(({ trP, ...rest }) => rest) });

  // Şifre yenileme bağlantısıyla gelindiyse yeni şifre formunu aç
  useEffect(() => {
    if (auth.recovery) setIsAuthOpen(true);
  }, [auth.recovery]);

  // Giriş tamamlanınca giriş penceresini kapat
  useEffect(() => {
    if (auth.user && !auth.recovery) setIsAuthOpen(false);
  }, [auth.user, auth.recovery]);

  // Giriş yapıldığında: buluttan çek, birleştir, sonucu buluta yaz
  useEffect(() => {
    if (!authEnabled || !auth.ready) return;
    const uid = auth.user?.id;
    if (!uid) {
      setSyncedUid(null);
      setSyncStatus('idle');
      lastPushedRef.current = null;
      return;
    }
    if (syncedUid === uid) return;

    let cancelled = false;
    setSyncStatus('syncing');
    (async () => {
      try {
        const cloud = await pullCloud(uid, DEFAULT_SETTINGS);
        if (cancelled) return;

        let linkedHere = false;
        try { linkedHere = localStorage.getItem(SYNC_UID_KEY) === uid; } catch {}

        const local = latestRef.current;
        // Bu cihazdaki veri zaten bu hesaptan geliyorsa bulut esas alınır (başka cihazdaki silmeler korunur);
        // ilk girişte misafir verisi hesaptakiyle birleştirilir, hiçbir şey kaybolmaz.
        const next: UserSnapshot = !cloud ? local : linkedHere ? cloud : mergeSnapshots(local, cloud);

        setLikedPapers(next.liked);
        setFolders(next.folders);
        setReadingHistory(next.history);
        setLighthouseWatch(next.streak);
        setSettings(next.settings);

        await pushCloud(uid, next);
        if (cancelled) return;

        try { localStorage.setItem(SYNC_UID_KEY, uid); } catch {}
        lastPushedRef.current = snapshotJson(next);
        setSyncedUid(uid);
        setSyncStatus('synced');
        if (!linkedHere) setToast(langDict.signed_in_toast || 'Giriş yapıldı');
      } catch (err) {
        console.error('Sync error:', err);
        if (cancelled) return;
        setSyncStatus('error');
        setTimeout(() => setRetryTick(t => t + 1), 15000);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.user?.id, auth.ready, retryTick]);

  // Değişiklikleri kısa bir gecikmeyle buluta yaz
  useEffect(() => {
    const uid = auth.user?.id;
    if (!authEnabled || !uid || syncedUid !== uid) return;
    const json = snapshotJson(latestRef.current);
    if (json === lastPushedRef.current) return;

    const t = setTimeout(async () => {
      setSyncStatus('syncing');
      try {
        await pushCloud(uid, latestRef.current);
        lastPushedRef.current = json;
        setSyncStatus('synced');
      } catch (err) {
        console.error('Push error:', err);
        setSyncStatus('error');
        setTimeout(() => setRetryTick(n => n + 1), 10000);
      }
    }, 1500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [likedPapers, folders, readingHistory, lighthouseWatch, settings, syncedUid, auth.user?.id, retryTick]);

  const handleSignOut = useCallback(async () => {
    const uid = auth.user?.id;
    // Çıkıştan önce son değişiklikleri buluta yaz; yazılamazsa kullanıcıya sor.
    if (uid && syncedUid === uid) {
      try {
        await pushCloud(uid, latestRef.current);
      } catch {
        const ok = window.confirm('Son değişiklikler hesabına yedeklenemedi. Yine de çıkış yapılsın mı? (Eşitlenmemiş değişiklikler kaybolabilir.)');
        if (!ok) return;
      }
    }
    await signOutUser();
    chooseGuest(); // çıkıştan sonra giriş ekranı hemen tekrar açılmasın; Ayarlar'dan girilebilir
    // Ortak cihazlarda veri sızmasın: bu cihazdaki kişisel veri temizlenir (hesapta duruyor).
    try { localStorage.removeItem(SYNC_UID_KEY); } catch {}
    setLikedPapers([]);
    setFolders({});
    setSelectedLikeIds(new Set());
    setReadingHistory([]);
    setLighthouseWatch(freshLighthouseWatch());
    lastPushedRef.current = null;
    setSyncedUid(null);
    setToast(langDict.signed_out_toast || 'Çıkış yapıldı');
  }, [auth.user?.id, syncedUid, langDict, chooseGuest]);

  // Makaleyi bağlantıyla paylaş: telefonda paylaşım menüsü, olmazsa panoya kopyala
  const handleSharePaper = useCallback(async (paper: Paper) => {
    const result = await sharePaper(paper, settings.translate && paper.trTitle ? paper.trTitle : paper.title);
    if (result === 'shared' || result === 'copied') trackEvent('paper_shared', { paper_id: paper.id, method: result });
    if (result === 'copied') setToast(langDict.share_copied || 'Bağlantı kopyalandı');
    else if (result === 'failed') setToast(langDict.share_failed || 'Bağlantı paylaşılamadı');
  }, [settings.translate, langDict]);

  // Detay ekranındaki beğen / beğenmekten vazgeç
  const handleToggleLikeInDetail = useCallback((paper: Paper) => {
    const alreadyLiked = likedPapers.some(p => p.id === paper.id);
    trackEvent(alreadyLiked ? 'paper_unliked' : 'paper_liked', { paper_id: paper.id });
    setLikedPapers(prev =>
      prev.some(p => p.id === paper.id) ? prev.filter(p => p.id !== paper.id) : [paper, ...prev]
    );
  }, [likedPapers]);

  // Multi-tier Paper Fetching
  // Not: filtre ve "loading" bilgisi ref'lerden okunur; böylece "Uygula"dan hemen sonra
  // çalışan arama eski (bayat) filtreyle değil, güncel filtreyle yapılır.
  const fetchMorePapers = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    const thisGen = genRef.current;

    try {
      if (!tiersRef.current || !tiersRef.current.length) {
        tiersRef.current = buildSearchTiers(filterRef.current!);
        tierIndexRef.current = 0;
        shownInTierRef.current = 0;
      }

      let added = 0;
      for (let guard = 0; !added && guard < tiersRef.current.length + 1; guard++) {
        const tier = tiersRef.current[tierIndexRef.current];
        if (!tier) break;
        const count = tier.fs.length > 1 ? Math.max(6, Math.ceil(24 / tier.fs.length)) : 24;

        const results = await Promise.allSettled(
          tier.fs.map((f: string) => fetchWorks(f, count))
        );

        if (thisGen !== genRef.current) return;

        // Tüm istekler hata verdiyse "sonuç yok" demeyiz; bağlantı/sorgu hatasıdır.
        if (results.length > 0 && results.every(r => r.status === 'rejected')) {
          setNotice('Makaleler yüklenemedi. Bağlantını kontrol edip tekrar dene.');
          break;
        }

        const combinedRaw = results
          .flatMap(r => (r.status === 'fulfilled' ? r.value : []))
          .sort(() => Math.random() - 0.5);

        const { papers, addedCount } = parseWorksToPapers(combinedRaw, seenIdsRef.current, tier);
        if (addedCount > 0) {
          added = addedCount;
          shownInTierRef.current += addedCount;
          if (tier.kind === 'part') {
            setNotice(`Seçtiğin alanların tamamında ortak yayın bulunamadı. Şu anda ortak yayın bulunan şu alan kombinasyonunun makaleleri gösteriliyor: “${tier.label}”.`);
          } else if (tier.kind === 'one' && tiersRef.current.some((candidate: any) => candidate.kind === 'all' || candidate.kind === 'part')) {
            setNotice(`Seçtiğin alanların tamamında ortak yayın bulunamadı. Şu anda yayın bulunan “${tier.label}” alanındaki makaleler gösteriliyor.`);
          }
          setQueue(prev => [...prev, ...papers]);
          break;
        }

        if (tierIndexRef.current < tiersRef.current.length - 1) {
          // Bir üst kademede (ortak yayınlar) sonuç kalmadı -> kullanıcıyı bilgilendir
          if (tier.kind === 'all' || tier.kind === 'part') {
            const nextTier = tiersRef.current[tierIndexRef.current + 1];
            const nextKind = nextTier?.kind;
            const fallbackText = nextKind === 'part'
              ? `Daha küçük alan kombinasyonları deneniyor. Sonraki kombinasyon: “${nextTier.label}”.`
              : nextKind === 'one'
              ? 'Birden fazla alanın ortak yayını bulunamadı; şimdi her seçili alan ayrı ayrı taranacak.'
              : 'Seçilen alanlarda uygun yayın bulunamadı.';
            setNotice(
              tier.kind === 'all'
                ? `Seçtiğin tüm alanların ortak yayınları bulunamadı. ${fallbackText}`
                : `“${tier.label}” kombinasyonunda uygun yayın bulunamadı. ${fallbackText}`
            );
          }
          tierIndexRef.current++;
          shownInTierRef.current = 0;
        } else {
          break;
        }
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      if (thisGen === genRef.current) {
        loadingRef.current = false;
        setLoading(false);
      }
    }
  }, []);

  // Yeni bir filtreyle (veya mevcut filtreyle) aramayı sıfırdan başlatır
  const resetAndSearch = useCallback((f?: FilterState) => {
    const active = f || filterRef.current!;
    filterRef.current = active;
    genRef.current++;
    loadingRef.current = false;
    setNotice(null);
    setQueue([]);
    seenIdsRef.current = new Set();
    tiersRef.current = buildSearchTiers(active);
    tierIndexRef.current = 0;
    shownInTierRef.current = 0;
    fetchMorePapers();
  }, [fetchMorePapers]);

  // Fetch initial papers when entering Discover or upon mount
  useEffect(() => {
    if (!queue.length && !loadingRef.current) {
      resetAndSearch();
    }
  }, []);

  // Safe translation when blup (settings.translate) is active - strictly no feedback loop
  const topPaperId = queue[0]?.id;
  useEffect(() => {
    if (!settings.translate || !topPaperId) return;
    const topPaper = queue[0];
    if (topPaper && (!topPaper.trTitle || !topPaper.trAbs)) {
      let isMounted = true;
      ensureTranslatedPaper(topPaper, 'tr').then(translated => {
        if (isMounted) {
          setQueue(prev => {
            if (!prev.length || prev[0].id !== translated.id) return prev;
            return [translated, ...prev.slice(1)];
          });
        }
      });
      return () => {
        isMounted = false;
      };
    }
  }, [settings.translate, topPaperId]);

  // Swipe Action Handlers (Classic mode)
  const handleSwipe = (dir: number) => {
    if (!queue.length) return;
    registerSwipeForSpeedCheck();
    const paper = queue[0];
    trackPaperRead();
    if (dir > 0) {
      // LIKE
      SFX.right();
      if (!likedPapers.some(p => p.id === paper.id)) {
        trackEvent('paper_liked', { paper_id: paper.id, source: 'swipe' });
        setLikedPapers(prev => [paper, ...prev]);
      }
    } else {
      // PASS
      SFX.left();
    }
    setQueue(prev => prev.slice(1));
    if (queue.length < 5) {
      fetchMorePapers();
    }
  };

  // Like Paper Handler (Reels mode & Buttons)
  const handleLikePaper = (paper: Paper) => {
    registerSwipeForSpeedCheck();
    trackPaperRead();
    if (!likedPapers.some(p => p.id === paper.id)) {
      trackEvent('paper_liked', { paper_id: paper.id, source: 'reels' });
      setLikedPapers(prev => [paper, ...prev]);
    }
  };

  // Reset Filters Handler (Used when queue is empty by Anglerfish)
  const handleResetFilter = useCallback(() => {
    const cleared: FilterState = {
      sel: new Set(),
      from: '',
      to: '',
      authorId: '',
      journalId: '',
      aName: '',
      jName: '',
      en: true
    };
    setFilter(cleared);
    resetAndSearch(cleared);
  }, [resetAndSearch]);

  // Filter Summary Text
  const effectiveFilterNodes = getEffectiveNodes(filter.sel);
  const filterSummary = effectiveFilterNodes.length
    ? effectiveFilterNodes.map(n => n.label).join(' · ')
    : '';

  // Theme Toggle Quick Handler
  const handleToggleTheme = () => {
    setSettings(prev => {
      const nextTheme = isDark ? 'light' : 'dark';
      return { ...prev, theme: nextTheme };
    });
  };

  // Likes Management Handlers
  const handleRemoveLike = (index: number) => {
    setLikedPapers(prev => prev.filter((_, i) => i !== index));
  };

  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    setLikedPapers(prev => {
      const copy = [...prev];
      [copy[index - 1], copy[index]] = [copy[index], copy[index - 1]];
      return copy;
    });
  };

  const handleMoveDown = (index: number) => {
    if (index >= likedPapers.length - 1) return;
    setLikedPapers(prev => {
      const copy = [...prev];
      [copy[index], copy[index + 1]] = [copy[index + 1], copy[index]];
      return copy;
    });
  };

  const handleToggleSelectLike = (id: string) => {
    setSelectedLikeIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleClearLikes = () => {
    if (window.confirm('Tüm beğenilen makaleler silinsin mi?')) {
      setLikedPapers([]);
      setFolders({});
      setSelectedLikeIds(new Set());
    }
  };

  // Assign to folder
  const handleAssignFolder = (folderName: string) => {
    if (folderActionType === 'assign') {
      const selectedArr = Array.from(selectedLikeIds);
      trackEvent('papers_added_to_folder', { paper_count: selectedArr.length });
      setFolders(prev => {
        const next = { ...prev };
        selectedArr.forEach(id => {
          const list = next[id] ? [...next[id]] : [];
          if (!list.includes(folderName)) list.push(folderName);
          next[id] = list;
        });
        return next;
      });
      setSelectedLikeIds(new Set());
    }
  };

  // Uygulamanın tanımlı olmayan adreslerinde temaya uygun 404 ekranı göster.
  const pathname = window.location.pathname;
  const isKnownPath = pathname === '/' || pathname === '/index.html' || /^\/paper\/[^/]+\/?$/.test(pathname);
  if (!isKnownPath) return <NotFoundPage />;

  const eggClass = easterEgg === 'pink-flowers' ? 'easter-egg-pink' : easterEgg === 'ocean-fish' ? 'easter-egg-ocean' : '';
  const polarClass = isPolarNight ? 'polar-night-active' : '';

  return (
    <div className={`app-shell flex h-[100dvh] w-full ${desktopMode ? "max-w-none flex-col" : "max-w-[520px] mx-auto flex-col"} bg-paper text-ink relative overflow-hidden transition-colors duration-300 ${eggClass} ${polarClass}`}>
      {/* SEO: <head> etiketleri (görsel çıktısı yok). Değerler index.html ile aynıdır. */}
      <Helmet>
        <title>Abstract — Bilimi Kaydırarak Keşfet</title>
        <meta name="description" content="Akademik makaleleri Tinder ve Instagram Reels tarzı dokunmatik kaydırma ile keşfetme, beğenme, klasörleme ve paylaşma uygulaması." />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
      </Helmet>

      {/* 3D Three.js Easter Egg Canvas */}
      {easterEgg !== 'none' && (
        <Suspense fallback={null}>
          <ThreeEasterEgg
            mode={easterEgg}
            onDismiss={() => setEasterEgg('none')}
          />
        </Suspense>
      )}

      {/* Intro Splash Animation */}
      {showSplash && (
        <IntroSplash
          onComplete={() => setShowSplash(false)}
          lang={settings.lang}
        />
      )}

      {/* Top Application Bar */}
      <div className="shrink-0">
      <TopBar
        onGoHome={() => setCurrentTab('home')}
        isDark={isDark}
        onToggleTheme={handleToggleTheme}
        reelsMode={currentTab === 'disc' && settings.reelsMode}
      />
      </div>

      <div className={desktopMode ? "flex flex-1 min-h-0 min-w-0 flex-row-reverse" : "flex flex-1 min-h-0 min-w-0 flex-col"}>
      {/* Main Content Area */}
      <main className={desktopMode ? "flex-1 min-w-0 min-h-0 relative overflow-hidden flex flex-col max-w-[1600px] w-full mx-auto" : "flex-1 min-h-0 relative overflow-hidden flex flex-col"}>
        {currentTab === 'home' && (
          <HomeScreen
            onExplore={() => setCurrentTab('disc')}
            onOpenFilter={() => setIsFilterOpen(true)}
            onGoLikes={() => setCurrentTab('likes')}
            onGoDashboard={() => setCurrentTab('dashboard')}
            likesCount={likedPapers.length}
            langDict={langDict}
            reelsMode={settings.reelsMode}
            lighthouseWatch={lighthouseWatch}
            onUpdateDailyGoal={handleUpdateDailyGoal}
          />
        )}

        {currentTab === 'disc' && (
          settings.reelsMode ? (
            <DiscoverReels
              queue={queue}
              likedPapers={likedPapers}
              loading={loading}
              onLikePaper={handleLikePaper}
              onOpenDetails={(p) => {
                trackPaperRead(p);
                setDetailPaper(p);
              }}
              onOpenFilter={() => setIsFilterOpen(true)}
              onFetchMore={fetchMorePapers}
              filterSummary={filterSummary}
              isTranslating={settings.translate}
              langDict={langDict}
              onResetFilter={handleResetFilter}
              onSharePaper={handleSharePaper}
            />
          ) : (
            <DiscoverClassic
              queue={queue}
              loading={loading}
              onSwipe={handleSwipe}
              onOpenDetails={(p) => {
                trackPaperRead(p);
                setDetailPaper(p);
              }}
              onOpenFilter={() => setIsFilterOpen(true)}
              filterSummary={filterSummary}
              isTranslating={settings.translate}
              langDict={langDict}
              hasMore={queue.length > 0}
              onResetFilter={handleResetFilter}
              onSharePaper={handleSharePaper}
            />
          )
        )}

        {currentTab === 'likes' && (
          <LikesScreen
            likedPapers={likedPapers}
            folders={folders}
            currentFolder={activeFolderTab}
            onSelectFolder={setActiveFolderTab}
            selectedIds={selectedLikeIds}
            onToggleSelect={handleToggleSelectLike}
            onClearSelection={() => setSelectedLikeIds(new Set())}
            onOpenNewFolder={() => {
              setFolderActionType('create');
              setIsFolderSheetOpen(true);
            }}
            onOpenMoveFolder={() => {
              setFolderActionType('assign');
              setIsFolderSheetOpen(true);
            }}
            onExport={exportPapersToPrint}
            onOpenMap={() => setCurrentTab('dashboard')}
            onOpenDetails={(p) => setDetailPaper(p)}
            onSharePaper={handleSharePaper}
            onRemoveLike={handleRemoveLike}
            onMoveUp={handleMoveUp}
            onMoveDown={handleMoveDown}
            langDict={langDict}
          />
        )}

        {currentTab === 'dashboard' && (
          // Seyir bölümü şimdilik kilitli ("Yakında"); kodu duruyor, sadece etkileşim kapalı.
          // Açmak için ComingSoonLock sarmalayıcısını kaldırmak yeterli.
          <ComingSoonLock
            title={langDict.soon_title || 'Yakında'}
            description={langDict.soon_desc || ''}
          >
            <SeyirPanosu
              readingHistory={readingHistory}
              likedPapers={likedPapers}
              lighthouseWatch={lighthouseWatch}
              onOpenDetails={() => {}}
              langDict={langDict}
            />
          </ComingSoonLock>
        )}

        {currentTab === 'sets' && (
          <SettingsScreen
            settings={settings}
            onUpdateSettings={setSettings}
            onClearLikes={handleClearLikes}
            onReplayTour={() => { setCurrentTab('home'); setShowTour(true); }}
            langDict={langDict}
            authEnabled={authEnabled}
            userEmail={auth.user?.email ?? null}
            userDisplayName={(auth.user?.user_metadata?.display_name as string | undefined) || (auth.user?.user_metadata?.full_name as string | undefined) || (auth.user?.user_metadata?.name as string | undefined) || null}
            userAvatarUrl={(auth.user?.user_metadata?.avatar_url as string | undefined) || null}
            onUploadAvatar={uploadAvatar}
            onRemoveAvatar={removeAvatar}
            onUpdateDisplayName={updateDisplayName}
            syncStatus={syncStatus}
            onOpenAuth={() => setIsAuthOpen(true)}
            onSignOut={handleSignOut}
          />
        )}
      </main>

      {/* İlk kullanım turu */}
      {showTour && !showSplash && !gateOpen && (
        <OnboardingTour lang={settings.lang || 'tr'} onSetTab={setCurrentTab} onClose={finishTour} />
      )}

      {/* Easter Egg: Sperm Whale (Kaşalot) Tail Splash */}
      <KasalotTailSplash
        isOpen={showKasalot}
        onDismiss={() => setShowKasalot(false)}
      />

      {/* Easter Egg: Polar Night Mode (Kutup Gece Modu & Aurora) */}
      <PolarAuroraEffect
        isActive={isPolarNight}
        onDismiss={() => setIsPolarNight(false)}
        durationSeconds={60}
      />

      {/* Küçük uyarı kutusu (ortak yayın bulunamadı vb.) */}
      {notice && (
        <div
          role="status"
          className="absolute left-3 right-3 bottom-[104px] z-40 flex items-start gap-2 rounded-2xl border-[1.5px] border-edge bg-card text-ink hard-sm px-3.5 py-3 text-sm leading-relaxed"
        >
          <span className="flex-1">{notice}</span>
          <button
            type="button"
            onClick={() => setNotice(null)}
            aria-label="Kapat"
            className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-mute hover:bg-soft"
          >
            ✕
          </button>
        </div>
      )}

      {/* Duyarlı gezinme */}
      <BottomNav currentTab={currentTab} onSelectTab={setCurrentTab} langDict={langDict} likesCount={likedPapers.length} desktop={desktopMode} />
      </div>

      {/* Filter Bottom Sheet */}
      <FilterSheet
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filter={filter}
        onApply={(newFilter) => {
          const years = normalizeYears(newFilter.from, newFilter.to);
          const applied: FilterState = { ...newFilter, from: years.from, to: years.to };
          setFilter(applied);
          setIsFilterOpen(false);
          trackEvent('filters_applied', {
            has_subject: applied.sel.size > 0,
            has_year_range: Boolean(applied.from || applied.to),
            has_author: Boolean(applied.authorId || applied.aName),
            has_journal: Boolean(applied.journalId || applied.jName)
          });
          resetAndSearch(applied);
        }}
        langDict={langDict}
        onTriggerEasterEgg={(egg) => setEasterEgg(egg)}
        onTriggerPolarNight={() => setIsPolarNight(true)}
      />

      {/* Paper Detail Sheet */}
      <DetailSheet
        paper={detailPaper}
        onClose={handleCloseDetail}
        isTranslating={settings.translate}
        langDict={langDict}
        onShare={handleSharePaper}
        isLiked={!!detailPaper && likedPapers.some(p => p.id === detailPaper.id)}
        onToggleLike={handleToggleLikeInDetail}
        isSharedView={sharedStatus === 'ready'}
      />

      {/* Giriş / hesap penceresi */}
      {authEnabled && (
        <AuthSheet
          isOpen={isAuthOpen || gateOpen}
          onClose={() => { if (gateOpen) chooseGuest(); setIsAuthOpen(false); }}
          guestOption={gateOpen}
          recovery={auth.recovery}
          onRecoveryDone={() => { auth.clearRecovery(); setToast(langDict.password_updated_toast || 'Şifren güncellendi'); }}
          langDict={langDict}
        />
      )}

      {/* Kısa bilgi mesajı */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed left-1/2 -translate-x-1/2 bottom-28 z-[70] max-w-[88vw] rounded-full bg-ink text-paper px-4 py-2.5 text-sm font-semibold shadow-lg"
        >
          {toast}
        </div>
      )}

      {/* Folder Management Sheet */}
      <FolderSheet
        isOpen={isFolderSheetOpen}
        onClose={() => setIsFolderSheetOpen(false)}
        folderNames={Array.from(new Set(Object.values(folders).flat()))}
        onSelectFolder={handleAssignFolder}
        onCreateFolder={(name) => {
          if (folderActionType === 'assign') {
            handleAssignFolder(name);
          }
        }}
        langDict={langDict}
        isAssigning={folderActionType === 'assign'}
      />
    </div>
  );
}
