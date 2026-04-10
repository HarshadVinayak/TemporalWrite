'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Users, Calendar, Crown, UserPlus, ArrowUp, Hash } from 'lucide-react';
import { useUserStore } from '@/store/userStore';
import leaderboardData from '@/content/leaderboard.json';

type Tab = 'Global' | 'Social' | 'Temporal';

export function Leaderboard() {
  const { isLeaderboardOpen, setIsLeaderboardOpen, currentGrade, userName, userXP } = useUserStore();
  const [activeTab, setActiveTab] = useState<Tab>('Global');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isLeaderboardOpen) return null;

  const currentEra = currentGrade < 6 ? 1 : currentGrade < 13 ? 2 : 3;
  const isEra3 = currentEra === 3;
  const isEra1 = currentEra === 1;

  const top3 = leaderboardData.users.slice(0, 3);
  const others = leaderboardData.users.slice(3);

  // User Spotlight Data
  const currentUserRank = 42; // Mock rank for current user

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setIsLeaderboardOpen(false)}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
      />

      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={`fixed right-0 top-0 bottom-0 w-full max-w-md z-[101] shadow-2xl flex flex-col overflow-hidden
          ${isEra1 ? 'bg-[#FDF6E3] border-l-8 border-[#8B4513]/20 shadow-[inset_0_0_100px_rgba(139,69,19,0.1)]' : 
            isEra3 ? 'bg-black text-cyan-400 font-mono border-l border-cyan-500/30' : 
            'bg-white dark:bg-gray-900'}`}
      >
        {/* Header */}
        <div className={`p-6 border-b flex items-center justify-between
          ${isEra1 ? 'border-[#8B4513]/10 bg-[#EADEB8]/30' : 
            isEra3 ? 'border-cyan-500/20 bg-cyan-950/20' : 
            'border-black/5 dark:border-white/5'}`}>
          <div className="flex items-center gap-3">
            <Trophy className={isEra3 ? 'text-cyan-400' : 'text-amber-500'} size={28} />
            <div>
              <h2 className={`text-2xl font-black uppercase tracking-tighter ${isEra3 ? 'text-cyan-400 animate-pulse' : 'text-gray-800 dark:text-gray-100'}`}>
                The Pantheon
              </h2>
              <p className={`text-[10px] font-bold uppercase tracking-widest opacity-50 ${isEra1 ? 'text-[#8B4513]' : ''}`}>
                Grammar Rankings
              </p>
            </div>
          </div>
          <button onClick={() => setIsLeaderboardOpen(false)} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full">
            <X size={24} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="p-4 flex gap-2">
          {(['Global', 'Social', 'Temporal'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2
                ${activeTab === tab ? 
                  (isEra3 ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.5)]' : 'bg-gray-800 text-white dark:bg-white dark:text-black') : 
                  (isEra3 ? 'border border-cyan-500/30 text-cyan-500/50 hover:bg-cyan-500/10' : 'bg-black/5 dark:bg-white/5 opacity-50 hover:opacity-100')}`}
            >
              {tab === 'Global' && <Hash size={14} />}
              {tab === 'Social' && <Users size={14} />}
              {tab === 'Temporal' && <Calendar size={14} />}
              {tab}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {activeTab === 'Temporal' && (
            <div className={`mx-4 mb-4 p-2 text-center text-[10px] font-bold uppercase rounded-lg border border-dashed
              ${isEra3 ? 'border-cyan-500/30 text-cyan-400 bg-cyan-950/20' : 'border-black/10 text-gray-400 bg-black/5'}`}>
              Season ends in: <span className={isEra3 ? 'text-cyan-300' : 'text-orange-500'}>2d 14h 32m</span>
            </div>
          )}

          {/* Podium */}
          <div className="flex justify-center items-end gap-2 px-4 py-8 mb-8 relative">
            {/* Rank 2 */}
            <div className="flex flex-col items-center gap-2 mb-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 border-4 border-slate-400 shadow-lg overflow-hidden flex items-center justify-center">
                  <span className="text-xl font-bold opacity-30">🥈</span>
                </div>
              </div>
              <div className="text-center">
                <p className="text-[10px] font-bold truncate w-20">{top3[1].name}</p>
                <div className="text-[10px] font-black p-1 bg-slate-400/20 rounded text-slate-500">{top3[1].xp} XP</div>
              </div>
            </div>

            {/* Rank 1 */}
            <div className="flex flex-col items-center gap-2 scale-110 z-10">
              <div className="relative">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0], y: [-2, 2, -2] }}
                  transition={{ repeat: Infinity, duration: 4 }}
                  className="absolute -top-6 left-1/2 -translate-x-1/2 text-amber-500 drop-shadow-lg"
                >
                  <Crown size={32} fill="currentColor" />
                </motion.div>
                <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 border-4 border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.3)] overflow-hidden flex items-center justify-center">
                   <span className="text-2xl font-bold opacity-30">🥇</span>
                </div>
              </div>
              <div className="text-center">
                <p className="text-xs font-black truncate w-24 text-amber-600 dark:text-amber-400">{top3[0].name}</p>
                <div className="text-xs font-black p-1.5 bg-amber-400/20 rounded-lg text-amber-600">{top3[0].xp} XP</div>
              </div>
            </div>

            {/* Rank 3 */}
            <div className="flex flex-col items-center gap-2 mb-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 border-4 border-orange-600/40 shadow-lg overflow-hidden flex items-center justify-center">
                  <span className="text-xl font-bold opacity-30">🥉</span>
                </div>
              </div>
              <div className="text-center">
                <p className="text-[10px] font-bold truncate w-20">{top3[2].name}</p>
                <div className="text-[10px] font-black p-1 bg-orange-600/10 rounded text-orange-600">{top3[2].xp} XP</div>
              </div>
            </div>
          </div>

          {/* List */}
          <div className="px-4 space-y-2 pb-32">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-2"
              >
                {others.map((user, idx) => (
                  <div 
                    key={user.id} 
                    className={`flex items-center gap-4 p-3 rounded-2xl border transition-all hover:scale-[1.02]
                      ${isEra3 ? 'border-cyan-500/20 bg-cyan-950/10 hover:bg-cyan-950/30' : 
                        isEra1 ? 'border-[#8B4513]/10 bg-[#EADEB8]/20 shadow-sm' : 
                        'border-black/5 bg-black/5 dark:bg-white/5 dark:border-white/5 hover:bg-black/10'}`}
                  >
                    <div className={`w-8 text-center font-black italic ${isEra3 ? 'text-cyan-400' : 'opacity-40'}`}>
                      {user.rank}
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 border-2 border-current opacity-20 flex items-center justify-center">
                      <Users size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate">{user.name}</p>
                      <p className={`text-[9px] font-bold uppercase tracking-widest opacity-50 ${isEra3 ? 'text-cyan-300' : ''}`}>
                        {user.era} Scholar
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-black ${isEra3 ? 'text-cyan-400' : 'text-blue-600 dark:text-blue-400'}`}>
                        {user.xp}
                      </p>
                      <p className="text-[8px] font-bold uppercase opacity-30">XP</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* User Spotlight Pin */}
        <div className={`absolute bottom-0 left-0 right-0 p-6 border-t shadow-[0_-10px_30px_rgba(0,0,0,0.1)]
          ${isEra3 ? 'bg-cyan-950/90 border-cyan-500/30 backdrop-blur-md' : 
            isEra1 ? 'bg-[#EADEB8] border-[#8B4513]/20' : 
            'bg-white dark:bg-gray-900 border-black/10 dark:border-white/10'}`}>
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg relative">
                <div className="absolute -top-1 -left-1 bg-gray-800 dark:bg-white text-white dark:text-black text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white dark:border-black">
                  {currentUserRank}
                </div>
                <Users size={24} />
             </div>
             <div className="flex-1">
                <p className="font-black tracking-tight">{userName || "You"}</p>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 flex-1 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '40%' }}
                      className={`h-full ${isEra3 ? 'bg-cyan-500 shadow-[0_0_10px_cyan]' : 'bg-blue-500'}`} 
                    />
                  </div>
                  <span className="text-[10px] font-bold opacity-50">140 XP to next rank</span>
                </div>
             </div>
             {activeTab === 'Social' ? (
               <button className="p-3 bg-purple-600 text-white rounded-xl shadow-lg flex items-center gap-2 hover:bg-purple-700 transition-colors">
                 <UserPlus size={18} />
               </button>
             ) : (
               <div className="text-right">
                <div className="flex items-center gap-1 text-green-500 font-bold text-xs">
                  <ArrowUp size={12} />
                  <span>3 Ranks</span>
                </div>
                <p className="text-[8px] font-black uppercase opacity-30">This Week</p>
               </div>
             )}
          </div>
        </div>
      </motion.div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.1);
          border-radius: 10px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1);
        }
      `}</style>
    </AnimatePresence>
  );
}
