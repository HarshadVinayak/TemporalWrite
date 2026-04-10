import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Trophy, Target, History, Award, Zap, ChevronRight, Sparkles, AlertCircle } from 'lucide-react';
import { useUserStore } from '@/store/userStore';
import { useState } from 'react';

export function ChronoLog() {
  const { isChronoLogOpen, setIsChronoLogOpen, history, userXP, currentStreak, currentGrade } = useUserStore();
  const [warpedResult, setWarpedResult] = useState<{ original: string; warped: string } | null>(null);
  const [isWarping, setIsWarping] = useState(false);

  const eraClass = currentGrade < 6 ? 'era-1' : currentGrade < 13 ? 'era-2' : 'era-3 dark';
  
  const handleTimeWarp = async (topic: string) => {
    setIsWarping(true);
    try {
      const res = await fetch('/api/warp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sentence: topic, targetEra: 3 })
      });
      const data = await res.json();
      setWarpedResult({ original: topic, warped: data.warped });
    } catch (err) {
      console.error(err);
    } finally {
      setIsWarping(false);
    }
  };

  // ... rest of logic for accuracy and milestones ...
  const accuracy = history.length > 0 
    ? Math.round((history.filter(h => h.result === 'Perfect').length / history.length) * 100) 
    : 100;

  const milestones = [
    { id: 'm1', name: 'Golden Quill', label: 'Era 1 Mastery', icon: Award, unlocked: userXP >= 50 && currentGrade < 6, color: 'text-amber-500' },
    { id: 'm2', name: 'Brass Gear', label: 'Era 2 Pioneer', icon: Zap, unlocked: currentGrade >= 6, color: 'text-orange-600' },
    { id: 'm3', name: 'Chrono-Link', label: '10 Streak', icon: Trophy, unlocked: currentStreak >= 10, color: 'text-blue-500' },
  ];

  return (
    <AnimatePresence>
      {isChronoLogOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsChronoLogOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`fixed right-0 top-0 bottom-0 w-full max-w-md bg-white dark:bg-gray-900 z-[101] shadow-2xl flex flex-col ${eraClass}`}
          >
            {/* Header */}
            <div className={`p-8 border-b border-black/5 dark:border-white/5 flex items-center justify-between ${currentGrade < 6 ? 'bg-[#FDF6E3]' : 'bg-blue-50 dark:bg-blue-900/20'}`}>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500 text-white rounded-2xl shadow-lg">
                  <Clock size={28} />
                </div>
                <div>
                  <h2 className="text-2xl font-black tracking-tight underline decoration-blue-500/30">The Chrono-Log</h2>
                  <p className="text-xs font-bold uppercase tracking-widest opacity-50">Grammar Continuum Journal</p>
                </div>
              </div>
              <button 
                onClick={() => setIsChronoLogOpen(false)}
                className="p-2 hover:bg-black/5 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-10">
              {warpedResult && (
                <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="p-6 bg-indigo-600 text-white rounded-3xl shadow-xl relative overflow-hidden group">
                   <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform">
                     <Sparkles size={120} />
                   </div>
                   <h3 className="text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                     <Zap size={10} /> Time Warp Success
                   </h3>
                   <div className="space-y-3 relative z-10">
                     <div>
                       <div className="text-[8px] opacity-60 uppercase font-black">Original (Era 1)</div>
                       <p className="text-xs font-medium italic">"{warpedResult.original}"</p>
                     </div>
                     <div className="h-px bg-white/20" />
                     <div>
                       <div className="text-[8px] opacity-60 uppercase font-black">Aged (Era 3)</div>
                       <p className="text-sm font-black leading-relaxed">"{warpedResult.warped}"</p>
                     </div>
                   </div>
                   <button onClick={() => setWarpedResult(null)} className="mt-4 w-full py-2 bg-white/20 hover:bg-white/30 rounded-xl text-xs font-bold transition-all">Dismiss Paradox</button>
                </motion.div>
              )}

              {/* Stats Overview */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 bg-black/5 dark:bg-white/5 rounded-3xl border-2 border-black/5 flex flex-col items-center">
                  <div className="text-3xl font-black text-blue-500">{accuracy}%</div>
                  <div className="text-[10px] font-bold uppercase tracking-tighter opacity-50">Overall Accuracy</div>
                </div>
                <div className="p-6 bg-black/5 dark:bg-white/5 rounded-3xl border-2 border-black/5 flex flex-col items-center">
                  <div className="text-3xl font-black text-orange-500">{currentStreak}</div>
                  <div className="text-[10px] font-bold uppercase tracking-tighter opacity-50">Current Streak</div>
                </div>
              </div>

              {/* Reward Vault */}
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Trophy size={16} className="text-orange-500" /> Reward Vault
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {milestones.map(m => (
                    <div 
                      key={m.id} 
                      className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${m.unlocked ? 'border-amber-200 bg-amber-50 dark:bg-amber-900/20' : 'border-black/5 opacity-30 grayscale'}`}
                    >
                      <m.icon className={m.unlocked ? m.color : 'text-gray-400'} size={24} />
                      <span className="text-[8px] font-bold text-center leading-tight">{m.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* History List */}
              <div className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                  <History size={16} className="text-blue-500" /> Game History
                </h3>
                
                {history.length === 0 ? (
                  <div className="text-center py-12 px-6 border-2 border-dashed border-black/10 rounded-3xl text-sm opacity-40 italic">
                    Your timeline is currently empty. Start a lesson to begin your journey.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {history.map((item, idx) => (
                      <motion.div
                        key={item.timestamp}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className={`p-4 rounded-2xl border-2 flex items-center justify-between group hover:border-blue-500/50 transition-colors ${currentGrade < 6 ? 'bg-sepia-50 border-[#EADEB8]' : 'bg-white/50 dark:bg-black/20 border-black/5'}`}
                      >
                        <div className="flex-1">
                          <h4 className="font-bold text-sm truncate">{item.topic}</h4>
                          <div className="flex items-center gap-3 mt-1">
                            <span className={`text-[10px] font-bold uppercase ${item.result === 'Perfect' ? 'text-green-500' : 'text-red-500'}`}>
                              {item.result}
                            </span>
                            <span className="text-[10px] opacity-40 font-mono">{item.time} elapsed</span>
                          </div>
                        </div>
                        {item.result === 'Perfect' && currentGrade < 6 && (
                          <button 
                            onClick={() => handleTimeWarp(item.topic)}
                            disabled={isWarping}
                            className="p-2 bg-indigo-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110 disabled:opacity-50"
                            title="Time Warp Review"
                          >
                            <Sparkles size={14} className={isWarping ? 'animate-spin' : ''} />
                          </button>
                        )}
                        <ChevronRight size={16} className={`opacity-0 group-hover:opacity-100 transition-opacity text-blue-500 ${item.result === 'Perfect' && currentGrade < 6 ? 'hidden' : ''}`} />
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 text-center text-[10px] font-bold uppercase tracking-[0.2em] opacity-30 bg-black/5 border-t border-black/5">
              Chronon Version 1.0.4 - Timeline Secured
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
