import React from 'react';
import { SlidersHorizontal, RefreshCw } from 'lucide-react';

interface EmptyDeckProps {
  onOpenFilter?: () => void;
  onReset?: () => void;
  message: string;
}

/** Gösterilecek makale kalmadığında çıkan boş durum. */
export const EmptyDeck: React.FC<EmptyDeckProps> = ({ onOpenFilter, onReset, message }) => (
  <div className="absolute inset-0 rounded-[28px] bg-soft flex flex-col items-center justify-center text-center px-8 gap-4">
    <div className="relative w-32 h-28" aria-hidden="true">
      <div className="absolute inset-x-3 top-3 h-24 -rotate-[8deg] rounded-2xl border-2 border-dashed border-mute/60" />
      <div className="absolute inset-x-3 top-2 h-24 rotate-[6deg] rounded-2xl border-2 border-dashed border-mute/60" />
      <div className="absolute inset-x-3 top-0 h-24 rounded-2xl border-2 border-dashed border-edge bg-card" />
    </div>
    <h3 className="font-serif text-2xl text-ink">Bu destede makale kalmadı</h3>
    <p className="text-sm text-mute max-w-[30ch] leading-relaxed">{message}</p>
    <div className="flex flex-wrap items-center justify-center gap-2.5 mt-1">
      {onOpenFilter && (
        <button type="button" onClick={onOpenFilter} className="btn btn-primary">
          <SlidersHorizontal className="w-4 h-4" /> Filtreleri değiştir
        </button>
      )}
      {onReset && (
        <button type="button" onClick={onReset} className="btn btn-line">
          <RefreshCw className="w-4 h-4" /> Tümünü keşfet
        </button>
      )}
    </div>
    <p className="absolute bottom-4 text-xs text-mute">© 2026 Binali. Her hakkı saklıdır.</p>
  </div>
);
