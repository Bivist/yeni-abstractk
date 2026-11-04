import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X } from 'lucide-react';

interface PolarAuroraEffectProps {
  isActive: boolean;
  onDismiss: () => void;
  durationSeconds?: number;
}

export const PolarAuroraEffect: React.FC<PolarAuroraEffectProps> = ({
  isActive,
  onDismiss,
  durationSeconds = 60
}) => {
  const [timeLeft, setTimeLeft] = useState(durationSeconds);

  useEffect(() => {
    if (!isActive) return;
    setTimeLeft(durationSeconds);

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onDismiss();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, durationSeconds, onDismiss]);

  if (!isActive) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-[90] pointer-events-none select-none overflow-hidden">
      {/* Dark Polar Night Atmosphere Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.88 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1.2 }}
        className="absolute inset-0 bg-[#020914] mix-blend-multiply pointer-events-none"
      />

      {/* Undulating Aurora Ribbons (Emerald, Mint, Cyan & Polar Violet) */}
      <div className="absolute inset-x-0 top-0 h-[70vh] pointer-events-none overflow-hidden opacity-85">
        {/* Aurora Curtain 1: Emerald Green Wave */}
        <motion.div
          animate={{
            x: ['-10%', '8%', '-10%'],
            y: ['0%', '6%', '0%'],
            scaleY: [1, 1.25, 1],
            opacity: [0.75, 0.95, 0.75]
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          className="absolute -top-16 -left-[20%] w-[140%] h-[55vh] blur-2xl opacity-80"
          style={{
            background: 'radial-gradient(ellipse at 50% 30%, rgba(16, 185, 129, 0.55) 0%, rgba(6, 182, 212, 0.35) 45%, transparent 75%)',
            transform: 'rotate(-4deg)'
          }}
        />

        {/* Aurora Curtain 2: Turquoise / Cyan Wave */}
        <motion.div
          animate={{
            x: ['8%', '-12%', '8%'],
            y: ['3%', '-4%', '3%'],
            scaleY: [1.1, 0.9, 1.1],
            opacity: [0.65, 0.85, 0.65]
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          className="absolute -top-10 -right-[20%] w-[140%] h-[50vh] blur-3xl opacity-75"
          style={{
            background: 'radial-gradient(ellipse at 50% 40%, rgba(56, 189, 248, 0.5) 0%, rgba(168, 85, 247, 0.3) 50%, transparent 75%)',
            transform: 'rotate(3deg)'
          }}
        />

        {/* Aurora Curtain 3: Polar Purple Ribbons */}
        <motion.div
          animate={{
            x: ['-5%', '10%', '-5%'],
            scaleX: [1, 1.15, 1],
            opacity: [0.5, 0.75, 0.5]
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          className="absolute top-10 left-[10%] w-[80%] h-[40vh] blur-xl opacity-60"
          style={{
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.4) 0%, rgba(45, 212, 191, 0.35) 60%, transparent 100%)'
          }}
        />

        {/* Distant Polar Stars & Floating Ice Crystals */}
        <div className="absolute inset-0">
          {[
            { x: 15, y: 12, s: 2 },
            { x: 35, y: 22, s: 2.5 },
            { x: 62, y: 14, s: 1.5 },
            { x: 78, y: 28, s: 2 },
            { x: 88, y: 10, s: 3 },
            { x: 25, y: 40, s: 2 },
            { x: 50, y: 35, s: 1.5 }
          ].map((st, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white animate-pulse"
              style={{
                left: `${st.x}%`,
                top: `${st.y}%`,
                width: `${st.s}px`,
                height: `${st.s}px`,
                boxShadow: '0 0 6px #67e8f9'
              }}
            />
          ))}
        </div>
      </div>

      {/* Frosty Ice Crystals & Frosted Vignette on All 4 Screen Corners */}
      {/* Top Left Frost */}
      <div className="absolute top-0 left-0 w-44 h-44 pointer-events-none">
        <svg viewBox="0 0 160 160" className="w-full h-full" fill="none">
          <defs>
            <radialGradient id="frostTL" cx="0" cy="0" r="140" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#bae6fd" stopOpacity="0.85" />
              <stop offset="40%" stopColor="#7dd3fc" stopOpacity="0.45" />
              <stop offset="80%" stopColor="#38bdf8" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
            </radialGradient>
          </defs>
          <path d="M0 0 L150 0 C120 40, 80 50, 60 70 C40 90, 30 130, 0 150 Z" fill="url(#frostTL)" />
          {/* Delicate Ice Needles / Frost Crystals */}
          <path d="M0 0 L55 55 M0 25 L45 50 M25 0 L50 45" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" opacity="0.9" />
          <path d="M0 0 L30 80 M80 30 L0 0 M20 60 L60 20" stroke="#bae6fd" strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
          <circle cx="28" cy="28" r="2" fill="#ffffff" />
          <circle cx="55" cy="18" r="1.5" fill="#ffffff" />
          <circle cx="18" cy="55" r="1.5" fill="#ffffff" />
        </svg>
      </div>

      {/* Top Right Frost */}
      <div className="absolute top-0 right-0 w-44 h-44 pointer-events-none scale-x-[-1]">
        <svg viewBox="0 0 160 160" className="w-full h-full" fill="none">
          <defs>
            <radialGradient id="frostTR" cx="0" cy="0" r="140" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#bae6fd" stopOpacity="0.85" />
              <stop offset="40%" stopColor="#7dd3fc" stopOpacity="0.45" />
              <stop offset="80%" stopColor="#38bdf8" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
            </radialGradient>
          </defs>
          <path d="M0 0 L150 0 C120 40, 80 50, 60 70 C40 90, 30 130, 0 150 Z" fill="url(#frostTR)" />
          <path d="M0 0 L55 55 M0 25 L45 50 M25 0 L50 45" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" opacity="0.9" />
          <path d="M0 0 L30 80 M80 30 L0 0" stroke="#bae6fd" strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
          <circle cx="32" cy="32" r="2" fill="#ffffff" />
        </svg>
      </div>

      {/* Bottom Left Frost */}
      <div className="absolute bottom-0 left-0 w-44 h-44 pointer-events-none scale-y-[-1]">
        <svg viewBox="0 0 160 160" className="w-full h-full" fill="none">
          <defs>
            <radialGradient id="frostBL" cx="0" cy="0" r="140" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#bae6fd" stopOpacity="0.8" />
              <stop offset="45%" stopColor="#38bdf8" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
            </radialGradient>
          </defs>
          <path d="M0 0 L140 0 C110 35, 75 45, 55 65 C35 85, 25 120, 0 140 Z" fill="url(#frostBL)" />
          <path d="M0 0 L50 50 M0 20 L40 45" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" opacity="0.85" />
        </svg>
      </div>

      {/* Bottom Right Frost */}
      <div className="absolute bottom-0 right-0 w-44 h-44 pointer-events-none scale-[-1]">
        <svg viewBox="0 0 160 160" className="w-full h-full" fill="none">
          <defs>
            <radialGradient id="frostBR" cx="0" cy="0" r="140" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#bae6fd" stopOpacity="0.8" />
              <stop offset="45%" stopColor="#38bdf8" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
            </radialGradient>
          </defs>
          <path d="M0 0 L140 0 C110 35, 75 45, 55 65 C35 85, 25 120, 0 140 Z" fill="url(#frostBR)" />
          <path d="M0 0 L50 50 M0 20 L40 45" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" opacity="0.85" />
        </svg>
      </div>

      {/* Border Rim Frost Sheen */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          boxShadow: 'inset 0 0 55px rgba(186, 230, 253, 0.35), inset 0 0 120px rgba(6, 182, 212, 0.2)'
        }}
      />

      {/* Polar Night Timer Floating Badge (Interactive dismiss) */}
      <motion.div
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -40, opacity: 0 }}
        className="absolute top-16 left-1/2 -translate-x-1/2 z-50 pointer-events-auto"
      >
        <div className="bg-[#031526]/90 border border-cyan-400/60 shadow-xl shadow-cyan-500/25 px-3.5 py-1.5 rounded-full flex items-center gap-2 text-white backdrop-blur-md">
          <span className="text-sm">❄️</span>
          <span className="text-xs font-bold tracking-wide text-cyan-200">
            Kutup Gece Modu
          </span>
          <span className="text-[11px] font-mono font-bold text-cyan-400 bg-cyan-950/70 px-2 py-0.5 rounded-md border border-cyan-700/50">
            {timeFormatted}
          </span>
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Kapat"
            className="w-5 h-5 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
