'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Home, BookOpen, ClipboardList, Calendar, Timer, 
  Gamepad2, Swords, Gift, Scroll, Trophy, BarChart3, 
  FileEdit, Users, MessageSquare, User, ShoppingCart, 
  Settings, LogOut, Medal 
} from 'lucide-react';
import { useUserStore } from '@/store/userStore';

const navSections = [
  {
    title: 'STUDY',
    items: [
      { name: 'Home', icon: Home, id: 'home' },
      { name: 'Flashcards', icon: BookOpen, id: 'flashcards' },
      { name: 'Grammar Helper', icon: ClipboardList, id: 'homework' },
      { name: 'Temporal Focus', icon: Timer, id: 'timer' },
    ]
  },
  {
    title: 'PLAY',
    items: [
      { name: 'Games', icon: Gamepad2, id: 'games' },
      { name: 'Competition', icon: Swords, id: 'battles' },
      { name: 'Daily Reward', icon: Gift, id: 'reward' },
      { name: 'Quests', icon: Scroll, id: 'quests' },
    ]
  },
  {
    title: 'GROW',
    items: [
      { name: 'Achievements', icon: Medal, id: 'achievements' },
      { name: 'Temporal Analysis', icon: BarChart3, id: 'analytics' },
      { name: 'Mock Tests', icon: FileEdit, id: 'exam' },
    ]
  },
  {
    title: 'CONNECT',
    items: [
      { name: 'Friends', icon: Users, id: 'classmates' },
      { name: 'Chat', icon: MessageSquare, id: 'chat' },
    ]
  },
  {
    title: 'ACCOUNT',
    items: [
      { name: 'Profile', icon: User, id: 'profile' },
      { name: 'Store', icon: ShoppingCart, id: 'shop' },
      { name: 'Settings', icon: Settings, id: 'settings' },
      { name: 'Sign Out', icon: LogOut, id: 'signout', color: 'text-red-500' },
    ]
  }
];

export function NavigationDrawer() {
  const { isNavOpen, setIsNavOpen, setIsLeaderboardOpen, setIsCodexOpen } = useUserStore();

  const handleItemClick = (id: string) => {
    if (id === 'leaderboard') setIsLeaderboardOpen(true);
    if (id === 'flashcards') setIsCodexOpen(true);
    // Other IDs are mocks for now
    setIsNavOpen(false);
  };

  return (
    <AnimatePresence>
      {isNavOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsNavOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[110]"
          />

          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 bottom-0 w-80 bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl z-[111] shadow-2xl flex flex-col border-r border-black/5 dark:border-white/5"
          >
            {/* Header */}
            <div className="p-8 pb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                  <Swords size={20} />
                </div>
                <h2 className="text-xl font-black tracking-tight bg-gradient-to-r from-gray-900 to-gray-500 dark:from-white dark:to-gray-400 text-transparent bg-clip-text">
                  Temporal Menu
                </h2>
              </div>
              <button 
                onClick={() => setIsNavOpen(false)}
                className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pt-4 pb-8 px-4 custom-scrollbar">
              {navSections.map((section, sIdx) => (
                <div key={section.title} className="mb-8">
                  <h3 className="px-4 text-[10px] font-black uppercase tracking-[0.2em] opacity-30 mb-4">
                    {section.title}
                  </h3>
                  <div className="space-y-1">
                    {section.items.map((item) => (
                      <motion.button
                        key={item.id}
                        whileHover={{ x: 4 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleItemClick(item.id)}
                        className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all group ${item.color || 'text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'}`}
                      >
                        <div className={`p-2 rounded-xl transition-all ${item.color ? 'bg-red-500/10' : 'bg-black/5 dark:bg-white/5 group-hover:bg-blue-500 group-hover:text-white group-hover:shadow-lg group-hover:shadow-blue-500/20'}`}>
                          <item.icon size={18} />
                        </div>
                        <span className="font-bold text-sm">{item.name}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-black/5 dark:border-white/5">
              <div className="p-4 rounded-3xl bg-blue-500/5 border border-blue-500/20 dark:bg-blue-900/10">
                <p className="text-[10px] font-black uppercase tracking-widest text-blue-500 mb-1">Current Version</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black">v2.4.0 Codename: Chronos</span>
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.05);
          border-radius: 10px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.05);
        }
      `}</style>
    </AnimatePresence>
  );
}
