import React from 'react';
import { Lock } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  title: string;
  description: string;
}

// İçeriği soluk ve etkileşimsiz gösterir; üstüne "Yakında" kartı koyar.
export const ComingSoonLock: React.FC<Props> = ({ children, title, description }) => (
  <div className="relative flex-1 min-h-0 overflow-hidden">
    <div
      className="absolute inset-0 flex flex-col overflow-hidden opacity-40 blur-[1.5px] pointer-events-none select-none"
      aria-hidden="true"
      inert
    >
      {children}
    </div>
    <div className="absolute inset-0 z-10 flex items-center justify-center p-6">
      <div className="max-w-xs w-full text-center rounded-[28px] bg-card border-[1.5px] border-edge hard px-6 py-7">
        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-t2 text-on-tone flex items-center justify-center">
          <Lock className="w-6 h-6" />
        </div>
        <h3 className="font-serif text-2xl text-ink">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-mute">{description}</p>
      </div>
    </div>
  </div>
);
