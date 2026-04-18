'use client';

import { useUserStore } from '@/store/userStore';
import { LearningTree } from '@/components/LearningTree';
import { Lesson } from '@/components/Lesson';
import { Sidebar } from '@/components/Sidebar';
import { CodexDrawer } from '@/components/CodexDrawer';
import { VoiceLab } from '@/components/VoiceLab';
import { ChronoLog } from '@/components/ChronoLog';
import { Leaderboard } from '@/components/Leaderboard';
import { NavigationDrawer } from '@/components/NavigationDrawer';
import { ParallaxBackground } from '@/components/ParallaxBackground';
import { SettingsModal } from '@/components/SettingsModal';
import { ChatCortex } from '@/components/ChatCortex';
import { VisionLab } from '@/components/VisionLab';
import { QuestSystem } from '@/components/QuestSystem';
import { LiveLens } from '@/components/LiveLens';
import { DailyGoalWidget } from '@/components/StudyArchitect';
import { Flame, Star } from 'lucide-react';
import { motion } from 'framer-motion';

import { Login } from '@/components/Auth/Login';
import { useAuth } from '@/components/AuthProvider';
import Image from 'next/image';

export default function Home() {
  const { currentLessonId, userXP, userLevel, currentStreak, currentGrade, activeCodexChallenge } = useUserStore();
  const { user, loading, signOut } = useAuth();

  const eraName = currentGrade < 6 ? 'The Past' : currentGrade < 13 ? 'The Present' : 'The Future';
  const targetXP = currentGrade < 6 ? 500 : currentGrade < 13 ? 1500 : 3000;
  const progress = Math.min((userXP / targetXP) * 100, 100);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  if (currentLessonId || activeCodexChallenge) {
    return <Lesson />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-gray-950/90 backdrop-blur-xl border-b border-black/5 dark:border-white/5 flex flex-col relative w-full">
        <div className="px-6 py-4 flex flex-row items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 relative">
              <Image 
                src="/logo.png" 
                alt="Logo" 
                fill 
                className="object-contain"
              />
            </div>
            <div className="hidden sm:block">
              <div className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">TemporalWrite</div>
              <div className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 dark:text-white/80 uppercase tracking-widest w-fit">{eraName}</div>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <div className="hidden md:flex items-center space-x-6 font-bold text-lg">
              <div className="flex items-center text-orange-500 gap-1 relative">
                <motion.div
                  animate={currentStreak >= 2 ? {
                    scale: [1, 1.2, 1],
                    opacity: [0.8, 1, 0.8],
                  } : {}}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  <Flame size={24} className={currentStreak > 0 ? 'fill-orange-500' : ''} />
                </motion.div>
                <span className="dark:text-orange-400">{currentStreak}</span>
              </div>
              <div className="flex items-center text-blue-500 dark:text-blue-400 gap-1">
                <Star size={24} className="fill-blue-500 dark:fill-blue-400" />
                {userXP} XP
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end hidden sm:flex">
                <span className="text-xs font-semibold text-slate-500">Level {userLevel}</span>
                <span className="text-[10px] text-slate-400 truncate max-w-[120px]">{user?.email}</span>
              </div>
              <button 
                onClick={() => signOut()}
                className="bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-white/70 px-4 py-2 rounded-xl text-sm font-bold transition-all active:scale-95"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-1.5 bg-black/5 dark:bg-white/5">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-1000 ease-out progress-bar-striped progress-bar-animated"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>
      
      {/* Sidebars and main content wrapper */}
      <div className="relative flex-1 flex">
        <ParallaxBackground />
        <Sidebar />
        
        {/* Scrollable Path Wrapper */}
        <main className="flex-1 overflow-x-hidden pt-10 pb-0 flex flex-col items-center md:pl-20 relative z-10 w-full">
          <div className="text-center mb-10 z-10 relative">
            <h1 className="text-4xl font-extrabold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-black to-gray-500 dark:from-white dark:to-gray-400">Your Journey</h1>
            <p className="text-lg opacity-80">Master time and language</p>
          </div>
          
          <LearningTree />
        </main>
      </div>
      <CodexDrawer />
      <VoiceLab />
      <ChronoLog />
      <Leaderboard />
      <NavigationDrawer />
      <ChatCortex />
      <VisionLab />
      <QuestSystem />
      <SettingsModal />
      <LiveLens />
      <DailyGoalWidget />
    </div>
  );
}
