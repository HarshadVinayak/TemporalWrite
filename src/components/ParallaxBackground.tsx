'use client';

import { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Feather, BookOpen, PenTool, Lightbulb, Cog, Wrench, Cpu, Database, Wifi, Globe, Zap, Satellite } from 'lucide-react';
import { useUserStore } from '@/store/userStore';

const MOCK_ITEMS_ERA1 = [
  { id: 1, Icon: Feather, top: '5%', left: '15%', size: 40, delay: 0 },
  { id: 2, Icon: BookOpen, top: '15%', left: '80%', size: 60, delay: 1 },
  { id: 3, Icon: PenTool, top: '25%', left: '20%', size: 50, delay: 2 },
];

const MOCK_ITEMS_ERA2 = [
  { id: 4, Icon: Cog, top: '40%', left: '20%', size: 55, delay: 0 },
  { id: 5, Icon: Lightbulb, top: '55%', left: '80%', size: 45, delay: 1 },
  { id: 6, Icon: Zap, top: '65%', left: '15%', size: 50, delay: 2 },
];

const MOCK_ITEMS_ERA3 = [
  { id: 7, Icon: Cpu, top: '75%', left: '25%', size: 55, delay: 0 },
  { id: 8, Icon: Satellite, top: '85%', left: '75%', size: 60, delay: 1 },
  { id: 9, Icon: Database, top: '95%', left: '15%', size: 50, delay: 2 },
];

const ALL_ITEMS = [...MOCK_ITEMS_ERA1, ...MOCK_ITEMS_ERA2, ...MOCK_ITEMS_ERA3];

export function ParallaxBackground() {
  const { isVoiceLabOpen } = useUserStore();
  const [mounted, setMounted] = useState(false);
  const { scrollY, scrollYProgress } = useScroll();
  
  // Parallax effect: items move up half as fast as you scroll
  const y = useTransform(scrollY, [0, 5000], [0, -1000]);

  // Background gradient shift based on scroll progress
  // Parchment -> Blueprint Blue -> Midnight Neon
  const background = useTransform(
    scrollYProgress,
    [0, 0.4, 0.6, 1],
    [
      'linear-gradient(to bottom, #fdf6e3, #fdf6e3)', // Era 1
      'linear-gradient(to bottom, #fdf6e3, #0f172a)', // Transition
      'linear-gradient(to bottom, #0f172a, #020617)', // Era 2 -> 3
      'linear-gradient(to bottom, #020617, #020617)'  // Era 3
    ]
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <motion.div style={{ background }} className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {ALL_ITEMS.map((item) => {
        const { Icon, size, top, left, delay, id } = item;
        return (
          <motion.div
            key={id}
            style={{ top, left, position: 'absolute', y }}
            animate={{
              y: [0, -15, 0],
              rotate: [0, 5, -5, 0],
              scale: isVoiceLabOpen ? [1, 1.1, 1] : 1,
              filter: isVoiceLabOpen ? ["drop-shadow(0 0 5px #22d3ee)", "drop-shadow(0 0 15px #22d3ee)", "drop-shadow(0 0 5px #22d3ee)"] : "none"
            }}
            transition={{
              duration: isVoiceLabOpen ? 0.5 : 6,
              repeat: Infinity,
              ease: "easeInOut",
              delay,
            }}
            className="opacity-10 dark:opacity-20 text-black dark:text-white"
          >
            <Icon size={size} strokeWidth={1} />
          </motion.div>
        );
      })}
    </motion.div>
  );
}
