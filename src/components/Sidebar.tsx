'use client';

import { Map, BookOpen, Clock, Settings, Mic, Trophy, Menu, Cpu, GraduationCap, Scan } from 'lucide-react';
import { motion } from 'framer-motion';
import { useUserStore } from '@/store/userStore';
import Link from 'next/link';
import Image from 'next/image';

export function Sidebar() {
  const { 
    setIsCodexOpen, 
    isVoiceLabOpen, 
    setIsVoiceLabOpen, 
    isChronoLogOpen, 
    setIsChronoLogOpen, 
    isLeaderboardOpen, 
    setIsLeaderboardOpen, 
    isChatOpen,
    setIsChatOpen,
    isLensOpen,
    setIsLensOpen,
    setIsNavOpen, 
    setIsSettingsOpen 
  } = useUserStore();

  return (
    <motion.aside 
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      className="fixed left-0 top-0 bottom-0 w-24 flex flex-col items-center py-8 bg-white/40 dark:bg-black/40 backdrop-blur-3xl border-r border-white/10 z-[100] hidden md:flex"
    >
      <div className="relative w-14 h-14 mb-10 group cursor-pointer">
        <div className="absolute inset-0 bg-blue-500/20 blur-xl group-hover:bg-blue-500/40 transition-all rounded-full" />
        <Link href="/" className="relative block w-full h-full rounded-2xl overflow-hidden border border-white/20 shadow-2xl transition-transform hover:scale-110 active:scale-95">
          <Image 
            src="/mascot.png" 
            alt="TemporalWrite" 
            fill 
            className="object-cover"
          />
        </Link>
      </div>

      <nav className="flex flex-col space-y-5 px-3">
        <button 
          onClick={() => setIsNavOpen(true)}
          className="p-3 text-gray-500 hover:text-black dark:hover:text-white transition-colors hover:bg-black/5 dark:hover:bg-white/10 rounded-2xl" 
          title="Menu"
        >
          <Menu size={24} />
        </button>
        <button className="p-3 bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400 rounded-2xl transition-all shadow-[0_4px_0_0_rgba(59,130,246,0.3)] hover:translate-y-1 hover:shadow-[0_2px_0_0_rgba(59,130,246,0.3)] active:translate-y-2 active:shadow-none" title="Path">
          <Map size={24} />
        </button>
        <button 
          onClick={() => setIsCodexOpen(true)}
          className="p-3 text-gray-500 hover:text-black dark:hover:text-white transition-colors hover:bg-black/5 dark:hover:bg-white/10 rounded-2xl" 
          title="Library"
        >
          <BookOpen size={24} />
        </button>
        <button 
          onClick={() => setIsChronoLogOpen(!isChronoLogOpen)}
          className={`p-3 transition-all rounded-2xl ${isChronoLogOpen ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400' : 'text-gray-500 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10'}`} 
          title="Time Warp Stats"
        >
          <Clock size={24} />
        </button>
        <button 
          onClick={() => setIsVoiceLabOpen(!isVoiceLabOpen)}
          className={`p-3 transition-all rounded-2xl relative ${isVoiceLabOpen ? 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400' : 'text-gray-500 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10'}`} 
          title="Voice Lab"
        >
          {isVoiceLabOpen && (
            <motion.div
              layoutId="mic-pulse"
              className="absolute inset-0 bg-red-400/20 rounded-2xl"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            />
          )}
          <Mic size={24} className="relative z-10" />
        </button>

        <button 
          onClick={() => setIsChatOpen(!isChatOpen)}
          className={`p-3 transition-all rounded-2xl relative ${isChatOpen ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400' : 'text-gray-500 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10'}`} 
          title="AI Cortex"
        >
          <Cpu size={24} />
          {isChatOpen && (
             <motion.div
             layoutId="chat-glow"
             className="absolute -inset-1 bg-purple-500/10 blur-md rounded-2xl"
             animate={{ opacity: [0.3, 0.6, 0.3] }}
             transition={{ repeat: Infinity, duration: 2 }}
           />
          )}
        </button>

        <Link 
          href="/exam-practice"
          className="p-3 text-gray-500 hover:text-black dark:hover:text-white transition-colors hover:bg-black/5 dark:hover:bg-white/10 rounded-2xl" 
          title="Exam Hall"
        >
          <GraduationCap size={24} />
        </Link>

        <button 
          onClick={() => setIsLensOpen(!isLensOpen)}
          className={`p-3 transition-all rounded-2xl relative ${isLensOpen ? 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/40 dark:text-cyan-400' : 'text-gray-500 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10'}`} 
          title="Chronos Lens"
        >
          <Scan size={24} />
        </button>

        <button 
          onClick={() => setIsLeaderboardOpen(!isLeaderboardOpen)}
          className={`p-3 transition-all rounded-2xl ${isLeaderboardOpen ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400' : 'text-gray-500 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10'}`} 
          title="The Pantheon"
        >
          <Trophy size={24} />
        </button>
        <div className="flex-1" />
        <button 
          onClick={() => setIsSettingsOpen(true)}
          className={`p-3 transition-all rounded-2xl absolute bottom-8 left-1/2 -translate-x-1/2 border-none outline-none ${useUserStore.getState().isSettingsOpen ? 'bg-gray-100 text-black dark:bg-gray-800 dark:text-white' : 'text-gray-500 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10'}`}
          title="Chronos Settings"
        >
          <Settings size={24} />
        </button>
      </nav>
    </motion.aside>
  );
}
