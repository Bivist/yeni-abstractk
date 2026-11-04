import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SFX } from '../utils/sfx';

interface KasalotTailSplashProps {
  isOpen: boolean;
  onDismiss: () => void;
}

export const KasalotTailSplash: React.FC<KasalotTailSplashProps> = ({
  isOpen,
  onDismiss
}) => {
  const [drops, setDrops] = useState<Array<{ id: number; left: number; top: number; size: number; delay: number }>>([]);

  useEffect(() => {
    if (!isOpen) return;

    // Play water breach sound effect
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      // Deep ocean splash swoosh + wave impact
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + 1.2);

      // Noise buffer for water splash spray
      const bufferSize = audioCtx.sampleRate * 1.5;
      const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = audioCtx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;

      // Filter for rushing water sound
      const filter = audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, audioCtx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(150, audioCtx.currentTime + 1.2);

      const noiseGain = audioCtx.createGain();
      noiseGain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1.2);

      whiteNoise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(audioCtx.destination);
      whiteNoise.start();

      osc.connect(gain);
      gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.2);
      osc.start();
      osc.stop(audioCtx.currentTime + 1.3);
    } catch {}

    // Generate random water spray droplets
    const newDrops = Array.from({ length: 28 }, (_, i) => ({
      id: i,
      left: 10 + Math.random() * 80,
      top: 15 + Math.random() * 70,
      size: 6 + Math.random() * 16,
      delay: Math.random() * 0.4
    }));
    setDrops(newDrops);

    const timer = setTimeout(() => {
      onDismiss();
    }, 3800);

    return () => clearTimeout(timer);
  }, [isOpen, onDismiss]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] pointer-events-none overflow-hidden select-none flex flex-col justify-end">
      {/* Dark Oceanic Mist Vignette */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="absolute inset-0 bg-gradient-to-t from-[#02182b]/80 via-[#0369a1]/20 to-transparent"
      />

      {/* Screen Water Splatters & Running Droplets */}
      <div className="absolute inset-0 z-20">
        {drops.map((drop) => (
          <motion.div
            key={drop.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: [0, 1.3, 1],
              opacity: [0, 0.9, 0.4, 0],
              y: [0, 15, 45]
            }}
            transition={{
              duration: 2.8,
              delay: drop.delay + 0.3,
              ease: 'easeOut'
            }}
            style={{
              left: `${drop.left}%`,
              top: `${drop.top}%`,
              width: `${drop.size}px`,
              height: `${drop.size * 1.3}px`
            }}
            className="absolute rounded-full bg-radial from-white via-cyan-100/70 to-sky-300/40 backdrop-blur-xs shadow-sm shadow-cyan-900/30 border border-white/50"
          />
        ))}
      </div>

      {/* Sperm Whale (Kaşalot) Giant Fluked Tail Breach */}
      <motion.div
        initial={{ y: '120%', rotate: -8, scale: 0.85 }}
        animate={{
          y: ['120%', '-8%', '4%', '-2%', '140%'],
          rotate: [-8, 6, -3, 2, -12],
          scale: [0.85, 1.15, 1.05, 1, 0.9]
        }}
        transition={{
          duration: 3.5,
          times: [0, 0.32, 0.48, 0.65, 1],
          ease: 'easeInOut'
        }}
        className="relative z-30 w-full max-w-[480px] mx-auto flex flex-col items-center justify-end pb-0"
      >
        {/* Tail Fluke SVG */}
        <svg
          viewBox="0 0 420 340"
          className="w-full max-w-[380px] h-auto drop-shadow-2xl"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="kasalotSkin" x1="210" y1="40" x2="210" y2="340" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="45%" stopColor="#0f172a" />
              <stop offset="85%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#0369a1" />
            </linearGradient>
            <linearGradient id="waterSheen" x1="160" y1="60" x2="260" y2="280" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
              <stop offset="70%" stopColor="#38bdf8" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
            </linearGradient>
            <radialGradient id="sprayGlow" cx="50%" cy="100%" r="60%">
              <stop offset="0%" stopColor="#e0f2fe" stopOpacity="0.9" />
              <stop offset="60%" stopColor="#38bdf8" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Water Dripping Sheets from Fin Tips */}
          <path
            d="M50 145 C65 200, 95 240, 150 280 L140 310 C80 270, 50 210, 42 155 Z"
            fill="url(#waterSheen)"
            opacity="0.8"
          />
          <path
            d="M370 145 C355 200, 325 240, 270 280 L280 310 C340 270, 370 210, 378 155 Z"
            fill="url(#waterSheen)"
            opacity="0.8"
          />

          {/* Whale Peduncle (Tail Stock) & Flukes (Wings) */}
          {/* Main Sperm Whale Fluke Silhouette */}
          <path
            d="M210 290 
               C190 260, 160 210, 130 170
               C100 135, 60 115, 20 110
               C15 110, 10 114, 12 120
               C20 145, 55 180, 100 200
               C145 220, 185 245, 205 320
               L215 320
               C235 245, 275 220, 320 200
               C365 180, 400 145, 408 120
               C410 114, 405 110, 400 110
               C360 115, 320 135, 290 170
               C260 210, 230 260, 210 290 Z"
            fill="url(#kasalotSkin)"
            stroke="#38bdf8"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Median Notch (Kaşalot fluke V-indent at top center) */}
          <path
            d="M200 130 C207 145, 213 145, 220 130 C250 120, 320 100, 400 110 C340 140, 280 180, 210 210 C140 180, 80 140, 20 110 C100 100, 170 120, 200 130 Z"
            fill="#0f172a"
            opacity="0.95"
          />

          {/* Fluke Trailing Edge Scallops & Skin Texture */}
          <path
            d="M40 118 Q 80 125, 120 145 T 200 138"
            stroke="#94a3b8"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            opacity="0.6"
          />
          <path
            d="M380 118 Q 340 125, 300 145 T 220 138"
            stroke="#94a3b8"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            opacity="0.6"
          />

          {/* Central Ridge (Caudal Keel) */}
          <path
            d="M210 140 L210 320"
            stroke="#38bdf8"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.75"
          />

          {/* Water Highlight Lines Sheening on Skin */}
          <path
            d="M170 200 C150 170, 110 150, 70 135"
            stroke="#e0f2fe"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.7"
          />
          <path
            d="M250 200 C270 170, 310 150, 350 135"
            stroke="#e0f2fe"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.7"
          />

          {/* Water Droplets Cascading Off Tail */}
          <circle cx="50" cy="160" r="3.5" fill="#bae6fd" />
          <circle cx="85" cy="195" r="4" fill="#bae6fd" />
          <circle cx="140" cy="245" r="3" fill="#bae6fd" />
          <circle cx="370" cy="160" r="3.5" fill="#bae6fd" />
          <circle cx="335" cy="195" r="4" fill="#bae6fd" />
          <circle cx="280" cy="245" r="3" fill="#bae6fd" />
        </svg>

        {/* Surging Crest Waves & Foam Splash at Tail Entry Base */}
        <div className="w-full relative -mt-16 h-28 overflow-visible flex items-center justify-center">
          <svg viewBox="0 0 500 120" className="w-full h-full" fill="none">
            {/* Spray Mist Aura */}
            <ellipse cx="250" cy="80" rx="220" ry="40" fill="url(#sprayGlow)" />

            {/* Violent Foam Crest Waves */}
            <path
              d="M0 80 Q 60 40, 130 75 T 250 50 T 370 70 T 500 80 L 500 120 L 0 120 Z"
              fill="#0284c7"
            />
            <path
              d="M20 85 Q 90 55, 170 80 T 320 60 T 430 82 T 500 90 L 500 120 L 0 120 Z"
              fill="#38bdf8"
              opacity="0.8"
            />
            <path
              d="M0 95 Q 80 70, 180 90 T 350 78 T 500 95 L 500 120 L 0 120 Z"
              fill="#ffffff"
              opacity="0.9"
            />

            {/* Flying Droplets Spray Particles */}
            <circle cx="180" cy="45" r="4.5" fill="#ffffff" />
            <circle cx="210" cy="30" r="5" fill="#ffffff" />
            <circle cx="250" cy="20" r="6" fill="#ffffff" />
            <circle cx="290" cy="32" r="5" fill="#ffffff" />
            <circle cx="330" cy="48" r="4" fill="#ffffff" />
            <circle cx="140" cy="60" r="3.5" fill="#e0f2fe" />
            <circle cx="360" cy="62" r="3.5" fill="#e0f2fe" />
          </svg>
        </div>
      </motion.div>

      {/* Underwater Rumble & Speed Easter Egg Toast Badge */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="absolute top-20 left-1/2 -translate-x-1/2 z-40 bg-[#0f172a]/90 backdrop-blur-md border border-cyan-400/50 shadow-2xl shadow-cyan-500/30 text-white px-5 py-2.5 rounded-full flex items-center gap-2.5 whitespace-nowrap"
      >
        <span className="text-xl">🐋</span>
        <div>
          <b className="block text-xs font-bold text-cyan-200">
            Dev Kaşalot Yüzeye Çıktı!
          </b>
          <span className="text-[10.5px] text-sky-200">
            Hızlı kaydırma dalgaları okyanusu sarstı!
          </span>
        </div>
      </motion.div>
    </div>
  );
};
