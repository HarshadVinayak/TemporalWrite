'use client';

import { useUserStore } from '@/store/userStore';
import { Compass } from 'lucide-react';
import { motion } from 'framer-motion';

export function StatusDock() {
  const { userXP, currentGrade } = useUserStore();
  
  const eraInfo = currentGrade < 6 
    ? { name: 'The Past', target: 100, next: 'The Industrial Present' }
    : currentGrade < 13 
      ? { name: 'The Present', target: 500, next: 'The Future' }
      : { name: 'The Future', target: 1000, next: 'Infinity' };

  let progress = (userXP / eraInfo.target) * 100;
  if (progress > 100) progress = 100;

  return (
    <motion.aside 
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.2 }}
      className="fixed right-0 top-24 bottom-0 w-64 hidden lg:flex flex-col p-6 z-40"
    >
      <div className="bg-white/80 dark:bg-black/80 backdrop-blur-md border border-black/5 dark:border-white/5 rounded-2xl p-5 shadow-lg border-b-4 border-b-black/10 dark:border-b-white/10">
        <div className="flex items-center gap-2 text-xl font-bold mb-1">
          <Compass size={20} className="text-purple-500" />
          {eraInfo.name}
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 tracking-tight font-medium">
          {userXP}/{eraInfo.target} XP until {eraInfo.next}
        </p>

        <div className="w-full h-4 bg-black/10 dark:bg-gray-800 rounded-full overflow-hidden shadow-inner">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-1000 ease-out progress-bar-striped progress-bar-animated"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </motion.aside>
  );
}
