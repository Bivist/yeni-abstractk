import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LogoMark } from './Logo';

interface IntroSplashProps {
  onComplete: () => void;
  lang?: 'tr' | 'en';
  onStartAudio?: () => void;
}

export const IntroSplash: React.FC<IntroSplashProps> = ({ onComplete, lang = 'tr', onStartAudio }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 2600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {visible && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={() => { onStartAudio?.(); setVisible(false); }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-paper cursor-pointer select-none"
        >
          <motion.div
            initial={{ rotate: -24, scale: 0.4, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 220, damping: 14 }}
          >
            <LogoMark size={112} />
          </motion.div>
          <motion.p
            initial={{ y: 14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.35, duration: 0.45 }}
            className="font-serif text-5xl tracking-tight text-ink"
          >
            Abstract
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="text-base text-mute"
          >
            {lang === 'en' ? 'Discover science with a swipe' : 'Bilimi kaydırarak keşfet'}
          </motion.p>

          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onStartAudio?.(); setVisible(false); }}
            className="btn btn-ghost absolute bottom-10 right-6"
          >
            {lang === 'en' ? 'Skip' : 'Geç'}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
