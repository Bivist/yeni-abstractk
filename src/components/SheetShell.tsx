import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface SheetShellProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  headerRight?: React.ReactNode;
  /** false ise dışarı dokunma / Esc ile kapanmaz (açılış giriş ekranı). */
  dismissible?: boolean;
  z?: string;
}

/** Tüm alt panellerin (filtre, ayrıntı, klasör, giriş) ortak kabuğu. */
export const SheetShell: React.FC<SheetShellProps> = ({
  title,
  onClose,
  children,
  footer,
  headerRight,
  dismissible = true,
  z = 'z-50'
}) => {
  useEffect(() => {
    if (!dismissible) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [dismissible, onClose]);

  return (
    <div className={`fixed inset-0 ${z} flex items-end justify-center`} role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-[#06130f]/60 backdrop-blur-[2px]" onClick={dismissible ? onClose : undefined} />
      <div className="sheet-in relative w-full max-w-[520px] max-h-[92dvh] flex flex-col bg-paper text-ink rounded-t-[28px] border-[1.5px] border-b-0 border-edge overflow-hidden">
        <div className="mx-auto mt-2.5 h-1.5 w-10 rounded-full bg-line shrink-0" />
        <div className="flex items-center justify-between gap-3 px-5 pt-3 pb-3 shrink-0">
          <h2 className="font-serif text-xl text-ink">{title}</h2>
          <div className="flex items-center gap-2">
            {headerRight}
            <button
              type="button"
              onClick={onClose}
              aria-label="Kapat"
              className="w-11 h-11 rounded-full bg-soft text-ink flex items-center justify-center active:scale-90 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-5 pb-5">{children}</div>
        {footer && (
          <div className="shrink-0 px-5 pt-3 border-t border-line bg-card pb-[max(env(safe-area-inset-bottom),12px)]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
