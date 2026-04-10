import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserStore } from '@/store/userStore';
import { Star, Lock, CheckCircle2, Zap, Loader2 } from 'lucide-react';
import { GrammarChallenge } from '@/types/grammar';
import { useAudio } from '@/hooks/useAudio';
import era1Content from '../content/era1.json';
import era2Content from '../content/era2.json';
import era3Content from '../content/era3.json';

const initialLessons = [
  ...era1Content.map(l => ({ ...l, era: 1 })),
  ...era2Content.map(l => ({ ...l, era: 2 })),
  ...era3Content.map(l => ({ ...l, era: 3 })),
] as (GrammarChallenge & { era: number })[];

export function LearningTree() {
  const { unlockedLevels, setCurrentLesson, currentGrade, userXP, history, unlockLevel } = useUserStore();
  const { playSound } = useAudio();
  
  const [bonusNodes, setBonusNodes] = useState<(GrammarChallenge & { era: number })[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [newlyUnlocked, setNewlyUnlocked] = useState<string[]>([]);
  const prevUnlocked = useRef<string[]>(unlockedLevels);

  useEffect(() => {
    const fresh = unlockedLevels.filter(id => !prevUnlocked.current.includes(id));
    if (fresh.length > 0) {
      setNewlyUnlocked(prev => [...prev, ...fresh]);
      // Clear after animation completes
      setTimeout(() => setNewlyUnlocked(prev => prev.filter(id => !fresh.includes(id))), 1500);
    }
    prevUnlocked.current = unlockedLevels;
  }, [unlockedLevels]);

  const allLessons = [...initialLessons, ...bonusNodes];

  const handleGenerateBonus = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    playSound('click');

    try {
      const response = await fetch('/api/temporal-gen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history,
          currentEra: currentGrade < 6 ? 1 : currentGrade < 13 ? 2 : 3,
          currentGrade
        })
      });

      const newNodes = await response.json();
      if (Array.isArray(newNodes)) {
        setBonusNodes(prev => [...prev, ...newNodes]);
        // Unlock the first of the new bonus nodes
        if (newNodes.length > 0) {
          unlockLevel(newNodes[0].id);
        }
        playSound('levelup');
      }
    } catch (e) {
      console.error('Failed to generate bonus nodes:', e);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col items-center py-20 w-full relative">
      {/* Dynamic Path Line */}
      <div className="absolute top-0 bottom-0 w-2 left-1/2 transform -translate-x-1/2 z-0 opacity-20 bg-gradient-to-b from-era1-accent via-era2-accent to-era3-neon" />
      
      {allLessons.map((lesson, index) => {
        const isUnlocked = unlockedLevels.includes(lesson.id);
        const isCompleted = unlockedLevels.indexOf(lesson.id) < unlockedLevels.indexOf(unlockedLevels[unlockedLevels.length - 1]) && isUnlocked;
        
        const xOffset = Math.sin(index * 1.5) * 80;
        const isCurrentActiveNode = isUnlocked && !unlockedLevels.includes(allLessons[index + 1]?.id);

        let nodeClass = "";
        let iconColor = "text-white";
        
        if (lesson.era === 1) {
          nodeClass = "rounded-full shadow-[0_8px_0_0_rgba(0,0,0,0.2)]";
        } else if (lesson.era === 2) {
          nodeClass = "rounded-none border-2 border-white/20 shadow-[4px_4px_0_0_rgba(0,0,0,0.5)]";
        } else {
          nodeClass = "rounded-2xl glass-card neon-glow border-none";
        }

        const bgColor = !isUnlocked ? "bg-gray-400 dark:bg-gray-700 opacity-40 cursor-not-allowed" :
          lesson.era === 1 ? (lesson.type === 'WordBank' ? 'bg-amber-600' : 'bg-orange-500') :
          lesson.era === 2 ? (lesson.type === 'WordBank' ? 'bg-blue-700' : 'bg-slate-700') :
          (lesson.type === 'WordBank' ? 'bg-cyan-500/80' : 'bg-indigo-600/80');

        return (
          <motion.div
            key={lesson.id}
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', damping: 15, stiffness: 200 }}
            className="my-12 relative z-10"
            style={{ transform: `translateX(${xOffset}px)` }}
          >
            {/* Era Banner */}
            {(index === 0 || allLessons[index-1].era !== lesson.era) && (
              <div className="absolute -top-16 left-1/2 -translate-x-1/2 whitespace-nowrap px-4 py-1 rounded bg-black/80 text-white text-[10px] font-black uppercase tracking-[0.2em]">
                {lesson.era === 1 ? 'Ancient Scrolls' : lesson.era === 2 ? 'Industrial Blueprints' : 'Digital Frontier'}
              </div>
            )}

            {/* Unlock Success Burst */}
            <AnimatePresence>
              {newlyUnlocked.includes(lesson.id) && (
                <motion.div
                  initial={{ scale: 0.5, opacity: 1 }}
                  animate={{ scale: 2.5, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="absolute inset-0 rounded-full bg-yellow-400/60 z-20 pointer-events-none"
                />
              )}
            </AnimatePresence>

            <button
              onClick={() => {
                if (isUnlocked) {
                  playSound('click');
                  setCurrentLesson(lesson.id);
                }
              }}
              disabled={!isUnlocked}
              className={`
                w-24 h-24 flex flex-col items-center justify-center font-bold text-xl
                active:translate-y-2 transition-all duration-200
                ${nodeClass} ${bgColor} ${iconColor}
                ${isCurrentActiveNode ? 'active-node-glow scale-110' : ''}
              `}
            >
              {isCompleted ? <CheckCircle2 size={40} /> : 
               isCurrentActiveNode ? <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }}><Star size={40} /></motion.div> : 
               isUnlocked ? <Star size={40} /> : <Lock size={40} />}
            </button>

            {/* Node Label */}
            <div className={`absolute top-1/2 transform -translate-y-1/2 ml-10 whitespace-nowrap bg-white/90 dark:bg-black/90 px-5 py-4 rounded-2xl text-base font-bold shadow-xl backdrop-blur-md transition-all z-20 pointer-events-none border-2 border-black/5 dark:border-white/5 ${xOffset > 0 ? 'right-full mr-10 ml-0' : 'left-full'}`}>
              <div className="text-[10px] opacity-50 mb-1 uppercase tracking-tighter">Lesson {index + 1}</div>
              {lesson.topic || lesson.type}
              {lesson.id.startsWith('gen_') && <span className="ml-2 text-[8px] bg-purple-500 text-white px-1 rounded">AI GEN</span>}
            </div>
          </motion.div>
        );
      })}

      {/* Infinite Trigger */}
      <motion.div 
        initial={{ opacity: 0 }} 
        whileInView={{ opacity: 1 }}
        className="mt-20 flex flex-col items-center gap-6"
      >
        <div className="text-center">
            <h3 className="text-2xl font-black uppercase tracking-tighter">End of the Timeline</h3>
            <p className="text-sm opacity-50 font-bold uppercase tracking-widest">Generate bonus era nodes from your mistakes</p>
        </div>
        
        <button
          onClick={handleGenerateBonus}
          disabled={isGenerating}
          className="group relative px-10 py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-[0.2em] transition-all shadow-[0_10px_0_0_#4338ca] active:shadow-none active:translate-y-[10px] flex items-center gap-4 disabled:opacity-50"
        >
          {isGenerating ? (
             <>
                <Loader2 className="animate-spin" size={24} />
                Evolving Infinite Era...
             </>
          ) : (
             <>
                <Zap size={24} className="group-hover:text-yellow-400 transition-colors" />
                Infinite Generation
             </>
          )}
        </button>
      </motion.div>
    </div>
  );
}
