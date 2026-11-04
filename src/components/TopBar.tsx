import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { LogoMark } from './Logo';

interface TopBarProps {
  onGoHome: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  reelsMode?: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({ onGoHome, isDark, onToggleTheme, reelsMode = false }) => (
  <header className="relative z-20 flex items-center justify-between px-5 pt-[max(env(safe-area-inset-top),12px)] pb-2">
    <button type="button" onClick={onGoHome} title="Ana sayfa" className="flex items-center gap-2.5 rounded-xl active:scale-95 transition-transform">
      <LogoMark size={34} />
      <span className="font-serif text-[26px] leading-none tracking-tight text-ink">Abstract</span>
      {reelsMode && <span className="chip bg-t1">Akış modu</span>}
    </button>

    <button
      type="button"
      onClick={onToggleTheme}
      data-tour="theme-btn"
      aria-label="Tema değiştir"
      title={isDark ? 'Gündüz görünümüne geç' : 'Gece görünümüne geç'}
      className="w-11 h-11 rounded-full bg-soft text-ink flex items-center justify-center active:scale-90 transition"
    >
      {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  </header>
);
