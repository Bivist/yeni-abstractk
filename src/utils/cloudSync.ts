import { supabase } from '../lib/supabase';
import { Paper, SettingsState, LighthouseWatchState, ReadingHistoryItem } from '../types';
import {
  sanitizeLiked,
  sanitizeFolders,
  sanitizeHistory,
  sanitizeLighthouseWatch,
  sanitizeSettings,
  localDateStr
} from './storage';

/** Hesaba bağlı, bulutta tutulan kullanıcı verisi. */
export interface UserSnapshot {
  liked: Paper[];
  folders: Record<string, string[]>;
  history: ReadingHistoryItem[];
  streak: LighthouseWatchState;
  settings: SettingsState;
}

/** Bulutta henüz hiç kayıt yoksa null döner. */
export async function pullCloud(
  userId: string,
  settingsDefaults: SettingsState
): Promise<UserSnapshot | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('user_data')
    .select('liked, folders, history, streak, settings')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    liked: sanitizeLiked(data.liked),
    folders: sanitizeFolders(data.folders),
    history: sanitizeHistory(data.history),
    streak: sanitizeLighthouseWatch(data.streak),
    settings: sanitizeSettings(data.settings, settingsDefaults)
  };
}

export async function pushCloud(userId: string, snap: UserSnapshot): Promise<void> {
  if (!supabase) return;
  // trP (çeviri Promise'i) JSON'a yazılmasın diye makaleler temizlenir.
  const liked = snap.liked.map(({ trP, ...rest }) => rest);
  const { error } = await supabase.from('user_data').upsert(
    {
      user_id: userId,
      liked,
      folders: snap.folders,
      history: snap.history,
      streak: snap.streak,
      settings: snap.settings,
      updated_at: new Date().toISOString()
    },
    { onConflict: 'user_id' }
  );
  if (error) throw error;
}

/** Hesaptaki tüm bulut verisini siler (satır kalır, içerik sıfırlanır). */
export async function clearCloud(userId: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from('user_data').delete().eq('user_id', userId);
  if (error) throw error;
}

/**
 * İlk girişte yerel (misafir) veri ile bulut verisi birleştirilir; hiçbir şey kaybolmasın diye
 * kayıtlar birleşim (union) olarak tutulur. Bu birleştirme yalnızca girişte yapılır; sonrasında
 * değişiklikler olduğu gibi buluta yazılır (silinen beğeni geri gelmez).
 */
export function mergeSnapshots(local: UserSnapshot, cloud: UserSnapshot): UserSnapshot {
  // Beğeniler: bulut sırası korunur, yalnızca bulutta olmayan yerel makaleler başa eklenir.
  const cloudIds = new Set(cloud.liked.map(p => p.id));
  const liked = [...local.liked.filter(p => !cloudIds.has(p.id)), ...cloud.liked];

  // Klasörler: makale başına klasör listelerinin birleşimi.
  const folders: Record<string, string[]> = {};
  for (const src of [cloud.folders, local.folders]) {
    for (const [id, names] of Object.entries(src)) {
      folders[id] = Array.from(new Set([...(folders[id] || []), ...names]));
    }
  }

  // Okuma geçmişi: paperId'ye göre tekilleştir, en yeni 50.
  const byId = new Map<string, ReadingHistoryItem>();
  for (const h of [...cloud.history, ...local.history]) {
    const prev = byId.get(h.paperId);
    if (!prev || h.timestamp > prev.timestamp) byId.set(h.paperId, h);
  }
  const history = Array.from(byId.values())
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 50);

  // Fener Nöbeti: her iki tarafın en iyisi. Bulut serisi dünden kalmışsa bir gün eklenir.
  const today = localDateStr();
  const yesterday = localDateStr(new Date(Date.now() - 86400000));
  const cloudStreak =
    cloud.streak.lastVisitDate === today || cloud.streak.lastVisitDate === yesterday
      ? cloud.streak.streakDays
      : 1;
  const sameDay = cloud.streak.lastVisitDate === today;
  const streakDays = Math.max(local.streak.streakDays, cloudStreak);
  const streak: LighthouseWatchState = {
    streakDays,
    lastVisitDate: today,
    dailyGoal: cloud.streak.dailyGoal || local.streak.dailyGoal,
    totalReadCount: Math.max(local.streak.totalReadCount, cloud.streak.totalReadCount),
    todayReadCount: sameDay
      ? Math.max(local.streak.todayReadCount, cloud.streak.todayReadCount)
      : local.streak.todayReadCount,
    beamPower: Math.min(100, Math.round((streakDays / 7) * 100))
  };

  // Ayarlar: hesaptaki ayarlar geçerli olur.
  return { liked, folders, history, streak, settings: cloud.settings };
}
