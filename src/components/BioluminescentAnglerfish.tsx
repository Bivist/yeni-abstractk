import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Sparkles, RefreshCw, SlidersHorizontal } from 'lucide-react';

interface BioluminescentAnglerfishProps {
  onOpenFilter?: () => void;
  onReset?: () => void;
  message?: string;
}

export const BioluminescentAnglerfish: React.FC<BioluminescentAnglerfishProps> = ({
  onOpenFilter,
  onReset,
  message = "Derin suların sonuna ulaştın. Fenerbalığı karanlıkta kendi ışığıyla süzülüyor..."
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Fish Position and State
  const [fishPos, setFishPos] = useState({ x: 180, y: 150 });
  const [fishFacing, setFishFacing] = useState<1 | -1>(-1); // -1 = facing left, 1 = facing right
  const [isStartled, setIsStartled] = useState(false);

  // Physical simulation refs
  const posRef = useRef({ x: 180, y: 150 });
  const velRef = useRef({ vx: -0.6, vy: 0.2 });
  const targetFacingRef = useRef<-1 | 1>(-1);
  const startledUntilRef = useRef<number>(0);
  const lastPointerRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    let animId: number;
    let wanderTimer = 0;

    const updatePhysics = () => {
      const container = containerRef.current;
      if (!container) {
        animId = requestAnimationFrame(updatePhysics);
        return;
      }

      const rect = container.getBoundingClientRect();
      const width = rect.width || 360;
      const height = rect.height || 420;
      const padding = 50;

      wanderTimer++;
      const now = Date.now();
      const inStartledState = now < startledUntilRef.current;

      // Pointer / touch proximity check
      if (lastPointerRef.current) {
        const px = lastPointerRef.current.x - rect.left;
        const py = lastPointerRef.current.y - rect.top;

        const dx = posRef.current.x - px;
        const dy = posRef.current.y - py;
        const dist = Math.hypot(dx, dy);

        // Flee threshold: 140px
        if (dist < 140 && dist > 1) {
          startledUntilRef.current = now + 900;
          const fleeForce = Math.min(9, (140 - dist) * 0.12 + 3.5);
          velRef.current.vx += (dx / dist) * fleeForce;
          velRef.current.vy += (dy / dist) * fleeForce;

          targetFacingRef.current = dx >= 0 ? 1 : -1;
        }
      }

      // Gentle natural idle wander if not fleeing
      if (!inStartledState) {
        if (wanderTimer % 70 === 0) {
          velRef.current.vx += (Math.random() - 0.5) * 0.8;
          velRef.current.vy += (Math.random() - 0.5) * 0.6;
        }
        // Speed cap for idle
        const speed = Math.hypot(velRef.current.vx, velRef.current.vy);
        if (speed > 1.8) {
          velRef.current.vx = (velRef.current.vx / speed) * 1.8;
          velRef.current.vy = (velRef.current.vy / speed) * 1.8;
        }
      } else {
        // High speed cap during flee
        const speed = Math.hypot(velRef.current.vx, velRef.current.vy);
        if (speed > 9) {
          velRef.current.vx = (velRef.current.vx / speed) * 9;
          velRef.current.vy = (velRef.current.vy / speed) * 9;
        }
      }

      // Apply drag / friction
      velRef.current.vx *= 0.94;
      velRef.current.vy *= 0.94;

      // Boundary repulsion
      if (posRef.current.x < padding) {
        velRef.current.vx += 1.2;
        targetFacingRef.current = 1;
      } else if (posRef.current.x > width - padding) {
        velRef.current.vx -= 1.2;
        targetFacingRef.current = -1;
      }

      if (posRef.current.y < padding + 20) {
        velRef.current.vy += 1.0;
      } else if (posRef.current.y > height - padding - 90) {
        velRef.current.vy -= 1.0;
      }

      // Update positions
      posRef.current.x += velRef.current.vx;
      posRef.current.y += velRef.current.vy;

      // Orientation follows velocity
      if (Math.abs(velRef.current.vx) > 0.4) {
        targetFacingRef.current = velRef.current.vx > 0 ? 1 : -1;
      }

      setFishPos({ x: posRef.current.x, y: posRef.current.y });
      setFishFacing(targetFacingRef.current);
      setIsStartled(inStartledState);

      animId = requestAnimationFrame(updatePhysics);
    };

    animId = requestAnimationFrame(updatePhysics);
    return () => cancelAnimationFrame(animId);
  }, []);

  const handlePointerMove = (e: React.PointerEvent) => {
    lastPointerRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    lastPointerRef.current = { x: e.clientX, y: e.clientY };
    // Instant fright
    startledUntilRef.current = Date.now() + 1100;
  };

  const handlePointerLeave = () => {
    lastPointerRef.current = null;
  };

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerDown={handlePointerDown}
      onPointerLeave={handlePointerLeave}
      className="relative flex-1 w-full h-full min-h-[420px] rounded-[28px] overflow-hidden select-none bg-radial from-[#041728] via-[#020b17] to-[#010610] border border-[#0d2f45] flex flex-col justify-between p-5 touch-none cursor-pointer"
    >
      {/* Floating Ambient Bioluminescent Marine Snow / Plankton */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[
          { x: 12, y: 18, s: 2.5, d: 3 },
          { x: 78, y: 24, s: 3, d: 4.5 },
          { x: 34, y: 65, s: 2, d: 2 },
          { x: 88, y: 72, s: 3.5, d: 5 },
          { x: 22, y: 84, s: 2, d: 3.2 },
          { x: 60, y: 45, s: 1.5, d: 2.8 },
          { x: 45, y: 15, s: 2, d: 4 }
        ].map((p, idx) => (
          <div
            key={idx}
            className="absolute rounded-full bg-cyan-300 animate-pulse pointer-events-none"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.s}px`,
              height: `${p.s}px`,
              opacity: 0.45,
              animationDuration: `${p.d}s`,
              boxShadow: '0 0 8px rgba(6, 182, 212, 0.7)'
            }}
          />
        ))}
      </div>

      {/* Top Subtle Info Pill */}
      <div className="relative z-10 flex items-center justify-between text-xs text-cyan-200/80 pointer-events-none">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/40 backdrop-blur-xs text-[11px] font-semibold text-cyan-300">
          <Sparkles className="w-3 h-3 text-cyan-400 animate-pulse" />
          <span>Derin Deniz Abisi · 4.000m</span>
        </span>
        <span className="text-[10px] text-sky-300/60 italic">
          Dokunursan kaçar
        </span>
      </div>

      {/* The Bioluminescent Deep Sea Anglerfish (Fenerbalığı) */}
      <div
        className="absolute pointer-events-none transition-transform duration-75"
        style={{
          left: `${fishPos.x}px`,
          top: `${fishPos.y}px`,
          transform: `translate(-50%, -50%) scaleX(${fishFacing})`,
          transition: 'transform 0.18s cubic-bezier(0.2, 0.8, 0.2, 1)'
        }}
      >
        {/* Dynamic Bioluminescent Light Aura from the Esca bulb */}
        <div
          className="absolute -top-10 -left-6 w-36 h-36 rounded-full pointer-events-none mix-blend-screen"
          style={{
            background: 'radial-gradient(circle, rgba(6, 237, 212, 0.65) 0%, rgba(56, 189, 248, 0.35) 35%, rgba(2, 132, 199, 0.1) 60%, transparent 80%)',
            transform: isStartled ? 'scale(1.4)' : 'scale(1)',
            transition: 'transform 0.2s ease-out'
          }}
        />

        {/* Detailed Anglerfish Vector Illustration */}
        <svg
          viewBox="0 0 160 110"
          className="w-32 h-auto drop-shadow-[0_0_15px_rgba(6,182,212,0.6)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <radialGradient id="escaGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="35%" stopColor="#22d3ee" />
              <stop offset="70%" stopColor="#0891b2" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="fishBody" x1="20" y1="30" x2="140" y2="90" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#0f172a" />
              <stop offset="60%" stopColor="#031525" />
              <stop offset="100%" stopColor="#020814" />
            </linearGradient>
            <linearGradient id="finSkin" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.15" />
            </linearGradient>
          </defs>

          {/* Caudal Fin (Tail) - Gentle Oscillating Wave */}
          <path
            d="M115 55 Q 135 32, 150 25 Q 138 55, 155 75 Q 135 68, 115 58 Z"
            fill="url(#finSkin)"
            stroke="#38bdf8"
            strokeWidth="1.2"
            opacity="0.85"
            className={isStartled ? "animate-pulse" : ""}
          />

          {/* Dorsal Fin */}
          <path
            d="M80 32 Q 95 18, 105 22 Q 95 32, 88 36 Z"
            fill="url(#finSkin)"
            stroke="#38bdf8"
            strokeWidth="1"
            opacity="0.7"
          />

          {/* Ventral & Anal Fin */}
          <path
            d="M82 72 Q 95 86, 102 82 Q 94 74, 88 71 Z"
            fill="url(#finSkin)"
            stroke="#38bdf8"
            strokeWidth="1"
            opacity="0.7"
          />

          {/* Main Anglerfish Round Body */}
          <path
            d="M40 38 
               C65 30, 95 35, 115 55 
               C95 72, 65 80, 42 75 
               C30 72, 22 62, 25 50 
               C28 42, 33 39, 40 38 Z"
            fill="url(#fishBody)"
            stroke="#0ea5e9"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />

          {/* Big Deep-Sea Anglerfish Mouth with Needle Teeth */}
          {/* Mouth Cavity */}
          <path
            d="M26 48 Q 36 54, 46 54 L 38 68 Q 28 62, 26 48 Z"
            fill="#020617"
            stroke="#0284c7"
            strokeWidth="1"
          />
          {/* Upper Needle Teeth */}
          <path d="M28 49 L30 55 M33 50 L35 56 M38 52 L39 57 M43 53 L43 58" stroke="#ffffff" strokeWidth="1.4" strokeLinecap="round" />
          {/* Lower Needle Teeth (Protruding) */}
          <path d="M29 64 L30 57 M34 66 L34 59 M38 67 L38 61" stroke="#ffffff" strokeWidth="1.4" strokeLinecap="round" />

          {/* Eye - Illuminated by the lure */}
          <circle cx="42" cy="43" r="3.5" fill="#082f49" stroke="#38bdf8" strokeWidth="1" />
          <circle cx="43" cy="42" r="1.5" fill="#67e8f9" />

          {/* Pectoral Fin (Translucent with ribs) */}
          <path
            d="M58 55 Q 70 52, 75 60 Q 68 66, 56 62 Z"
            fill="url(#finSkin)"
            stroke="#38bdf8"
            strokeWidth="1"
            opacity="0.85"
          />

          {/* Lateral line photophores (glowing dots) */}
          <circle cx="58" cy="48" r="1" fill="#22d3ee" />
          <circle cx="68" cy="50" r="1" fill="#22d3ee" />
          <circle cx="78" cy="52" r="1" fill="#22d3ee" />
          <circle cx="88" cy="54" r="1" fill="#22d3ee" />
          <circle cx="98" cy="55" r="1" fill="#22d3ee" />

          {/* Illicium (The long arching fishing rod filament on head) */}
          <path
            d="M42 36 C42 22, 30 12, 18 16 C12 18, 10 24, 12 28"
            stroke="#38bdf8"
            strokeWidth="1.6"
            strokeLinecap="round"
            fill="none"
          />

          {/* The Esca (Bioluminescent Light Bulb) at the end of Illicium */}
          <circle cx="12" cy="28" r="5" fill="url(#escaGlow)" />
          <circle cx="12" cy="28" r="2.5" fill="#ffffff" className="animate-ping" style={{ animationDuration: '2s' }} />

          {/* Little glowing lure filaments */}
          <path d="M12 32 L11 36 M15 30 L18 33" stroke="#67e8f9" strokeWidth="1" strokeLinecap="round" />
        </svg>
      </div>

      {/* Bottom Message & Controls */}
      <div className="relative z-10 flex flex-col items-center text-center gap-3 pt-6 pointer-events-auto">
        <h4 className="font-serif text-base font-bold text-cyan-100 flex items-center gap-1.5 drop-shadow-md">
          <span>🏮</span>
          <span>Fenerbalığı Karanlığı Aydınlatıyor</span>
        </h4>
        <p className="text-xs text-sky-200/80 max-w-[280px] leading-relaxed">
          {message}
        </p>

        <div className="flex items-center gap-2.5 mt-2">
          {onOpenFilter && (
            <button
              type="button"
              onClick={onOpenFilter}
              className="px-4 py-2 rounded-full bg-cyan-600/30 hover:bg-cyan-600/50 border border-cyan-400/50 text-cyan-200 text-xs font-semibold backdrop-blur-md transition-all active:scale-95 flex items-center gap-1.5 shadow-md shadow-cyan-950/40"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filtreleri Değiştir</span>
            </button>
          )}

          {onReset && (
            <button
              type="button"
              onClick={onReset}
              className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/25 text-white text-xs font-semibold backdrop-blur-md transition-all active:scale-95 flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Tümünü Keşfet</span>
            </button>
          )}
        </div>

        {/* Mandatory Copyright text */}
        <p className="text-[11px] text-[#527993]/80 dark:text-[#7bb0cc]/80 pt-4 tracking-wide">
          © 2026 Binali. Her hakkı saklıdır.
        </p>
      </div>
    </div>
  );
};
