import React from 'react';
import { TabId } from '../types';
import { Home, Heart, Compass, Activity, Settings, Lock } from 'lucide-react';

interface BottomNavProps {
  currentTab: TabId;
  onSelectTab: (tab: TabId) => void;
  langDict: Record<string, string>;
  likesCount: number;
  desktop?: boolean;
}

const ITEMS: { id: TabId; labelKey: string; Icon: React.ElementType }[] = [
  { id: 'home', labelKey: 'tab_home', Icon: Home },
  { id: 'likes', labelKey: 'tab_likes', Icon: Heart },
  { id: 'disc', labelKey: 'tab_explore', Icon: Compass },
  { id: 'dashboard', labelKey: 'tab_dashboard', Icon: Activity },
  { id: 'sets', labelKey: 'tab_settings', Icon: Settings }
];

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onSelectTab, langDict, likesCount, desktop = false }) => (
  <nav className={desktop ? "relative z-20 w-60 shrink-0 px-3 py-5 border-r border-line bg-paper overflow-y-auto" : "relative z-20 px-3 pt-2 pb-[max(env(safe-area-inset-bottom),10px)]"} aria-label="Ana gezinme">
    <div className={desktop ? "flex flex-col gap-2 rounded-[24px] bg-card border-[1.5px] border-edge hard-sm p-2" : "mx-auto max-w-md flex items-end justify-between rounded-[30px] bg-card border-[1.5px] border-edge hard-sm px-1.5 pb-1.5 pt-1.5"}>
      {ITEMS.map(({ id, labelKey, Icon }) => {
        const active = currentTab === id;
        const center = id === 'disc';
        return (
          <button
            key={id}
            type="button"
            onClick={() => onSelectTab(id)}
            data-tour={`nav-${id}`}
            aria-current={active ? 'page' : undefined}
            className={desktop ? "relative w-full flex flex-row items-center justify-start gap-3 min-h-[50px] px-3 rounded-2xl" : "flex-1 flex flex-col items-center justify-end gap-1 min-h-[52px] rounded-2xl"}
          >
            {center ? (
              <span
                className={`${desktop ? "w-10 h-10 rounded-xl" : "-mt-7 w-14 h-14 rounded-full"} border-[1.5px] border-edge flex items-center justify-center hard-sm transition-transform active:scale-90 ${
                  active ? 'bg-accent text-accent-ink' : 'bg-t1 text-on-tone'
                }`}
              >
                <Icon className="w-6 h-6" strokeWidth={2.2} />
              </span>
            ) : (
              <span className={`${desktop ? "w-10 h-10 rounded-xl" : "relative w-12 h-8 rounded-full"} flex items-center justify-center transition-colors ${active ? 'bg-soft text-accent-fg' : 'text-mute'}`}>
                <Icon className="w-[22px] h-[22px]" strokeWidth={active ? 2.4 : 1.9} fill={id === 'likes' && active ? 'currentColor' : 'none'} />
                {id === 'likes' && likesCount > 0 && (
                  <span className="absolute -top-1 right-0 min-w-[18px] h-[18px] px-1 rounded-full bg-accent text-accent-ink text-[10px] font-extrabold flex items-center justify-center">
                    {likesCount > 99 ? '99+' : likesCount}
                  </span>
                )}
              </span>
            )}
            <span className={`${desktop ? "text-sm" : "text-[11px]"} leading-none ${active ? 'font-extrabold text-ink' : 'font-semibold text-mute'}`}>
              {langDict[labelKey]}
              {id === 'dashboard' && <Lock className="inline w-2.5 h-2.5 ml-0.5 -mt-0.5 opacity-70" />}
            </span>
          </button>
        );
      })}
    </div>
  </nav>
);
