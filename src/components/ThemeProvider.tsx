'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useUserStore } from '@/store/userStore';
import { motion, AnimatePresence } from 'framer-motion';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const currentGrade = useUserStore((state) => state.currentGrade);
  const { fontSelection, darkMode } = useUserStore((state) => state.settings);
  const [mounted, setMounted] = useState(false);
  const [prevGrade, setPrevGrade] = useState(currentGrade);
  const [showTimeWarp, setShowTimeWarp] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Restore dark mode preference from localStorage on initial load
    const savedDark = localStorage.getItem('tw_dark_mode');
    if (savedDark !== null) {
      useUserStore.getState().updateSettings({ darkMode: savedDark === 'true' });
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      // Persist dark mode preference
      localStorage.setItem('tw_dark_mode', String(darkMode));
    }
  }, [darkMode, mounted]);

  useEffect(() => {
    if (mounted) {
      const eraChange = 
        (prevGrade < 6 && currentGrade >= 6) || 
        (prevGrade < 13 && currentGrade >= 13);
      
      if (eraChange) {
        setShowTimeWarp(true);
        setTimeout(() => setShowTimeWarp(false), 2800);
      }
      setPrevGrade(currentGrade);
    }
  }, [currentGrade, mounted]);

  if (!mounted) {
    return <div className="min-h-screen opacity-0" />;
  }

  const eraClass = currentGrade < 6 ? 'era-1' : currentGrade < 13 ? 'era-2' : 'era-3';
  
  const fontClass = 
    fontSelection === 'Dyslexic' ? 'font-dyslexic' :
    fontSelection === 'Serif' ? 'font-serif-classic' :
    fontSelection === 'Mono' ? 'font-mono-tech' : '';

  return (
    <>
      <AnimatePresence>
        {showTimeWarp && (
          <motion.div
            key="time-warp-tunnel"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="time-warp-tunnel bg-black z-[9999] pointer-events-all"
          >
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="tunnel-ring"
                initial={{ width: 0, height: 0, opacity: 1, borderColor: i % 2 === 0 ? '#3b82f6' : '#a855f7' }}
                animate={{ 
                  width: ['0vw', '300vw'], 
                  height: ['0vh', '300vh'],
                  opacity: [1, 0],
                  borderWidth: ['2px', '40px']
                }}
                transition={{ 
                  duration: 2.2, 
                  ease: "easeOut", 
                  delay: i * 0.15,
                }}
              />
            ))}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: [0.5, 1.2, 1], opacity: [0, 1, 0] }}
              transition={{ duration: 2.5, times: [0, 0.5, 1] }}
              className="text-white text-6xl font-black italic z-10 text-center"
            >
              <div>TIME WARP</div>
              <div className="text-base font-normal opacity-60 tracking-[0.3em] mt-2">
                {currentGrade >= 13 ? 'ENTERING ERA III' : 'ENTERING ERA II'}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className={`min-h-screen transition-all duration-700 ease-in-out ${eraClass} ${fontClass} ${darkMode || currentGrade >= 13 ? 'dark' : ''}`}>
        {children}
      </div>
    </>
  );
}
