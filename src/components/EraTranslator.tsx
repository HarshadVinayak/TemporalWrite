import { useState } from 'react';
import { Sparkles, ArrowRight, Loader2, Zap, Brain } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function EraTranslator() {
  const [inputUrl, setInputUrl] = useState('');
  const [translations, setTranslations] = useState<{ era1?: string; era2?: string; era3?: string; error?: string } | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);

  const handleTranslate = async () => {
    if (!inputUrl.trim() || isTranslating) return;

    setIsTranslating(true);
    setTranslations(null);

    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sentence: inputUrl }),
      });

      const data = await response.json();
      setTranslations(data);
    } catch (err: any) {
      console.error(err);
      setTranslations({ error: 'Chronos AI encountered a temporal disruption.' });
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl border border-black/5 dark:border-white/5 space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm">
          <Sparkles size={24} />
        </div>
        <div>
          <h3 className="text-xl font-black tracking-tight uppercase">Era Transformer</h3>
          <p className="text-xs font-bold opacity-50 uppercase tracking-widest">Linguistic Time-Travel Tool</p>
        </div>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={inputUrl}
          onChange={(e) => setInputUrl(e.target.value)}
          placeholder="Enter a modern sentence to evolve..."
          disabled={isTranslating}
          className="flex-1 bg-black/5 dark:bg-white/5 border-2 border-transparent focus:border-indigo-500 rounded-2xl px-5 py-4 focus:outline-none font-medium transition-all shadow-inner"
          onKeyDown={(e) => e.key === 'Enter' && handleTranslate()}
        />
        <button
          onClick={handleTranslate}
          disabled={!inputUrl.trim() || isTranslating}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[140px] shadow-lg active:translate-y-1"
        >
          {isTranslating ? (
            <div className="flex items-center gap-2">
               <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}>
                  <Loader2 size={18} />
               </motion.div>
            </div>
          ) : 'Transform'}
        </button>
      </div>

      {isTranslating && (
         <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="flex items-center justify-center gap-6 py-4 border-t border-black/5"
         >
            <div className="flex items-center gap-2 text-yellow-500 font-bold text-[10px] tracking-widest">
               <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }}>
                  <Zap size={14} fill="currentColor" />
               </motion.div>
               GROQ SPEED
            </div>
            <div className="flex items-center gap-2 text-indigo-500 font-bold text-[10px] tracking-widest">
               <motion.div animate={{ opacity: [1, 0.5, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                  <Brain size={14} fill="currentColor" />
               </motion.div>
               OPENROUTER DEPTH
            </div>
         </motion.div>
      )}

      <AnimatePresence>
        {translations && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 pt-4 border-t border-black/10 dark:border-white/10"
          >
            {translations.error ? (
              <div className="p-4 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-xl font-medium">
                {translations.error}
              </div>
            ) : (
              <>
                {/* Era 1 - Past */}
                <motion.div 
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="p-5 rounded-2xl bg-amber-50 text-amber-900 border-l-8 border-amber-400 shadow-sm"
                >
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 flex items-center gap-2 mb-2">
                    <ArrowRight size={12} /> THE PAST (1st Grade)
                  </div>
                  <p className="font-bold text-lg leading-relaxed">{translations.era1}</p>
                </motion.div>

                {/* Era 2 - Present */}
                <motion.div 
                   initial={{ x: -20, opacity: 0 }}
                   animate={{ x: 0, opacity: 1 }}
                   transition={{ delay: 0.2 }}
                   className="p-5 rounded-2xl bg-blue-50 text-blue-900 border-l-8 border-blue-400 shadow-sm"
                >
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 flex items-center gap-2 mb-2">
                    <ArrowRight size={12} /> THE PRESENT (Professional)
                  </div>
                  <p className="font-bold text-lg leading-relaxed">{translations.era2}</p>
                </motion.div>

                {/* Era 3 - Future */}
                <motion.div 
                   initial={{ x: -20, opacity: 0 }}
                   animate={{ x: 0, opacity: 1 }}
                   transition={{ delay: 0.3 }}
                   className="p-5 rounded-2xl bg-indigo-900 text-indigo-100 border-l-8 border-indigo-400 shadow-xl relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-2 opacity-10">
                    <Brain size={80} />
                  </div>
                  <div className="relative z-10">
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300 flex items-center gap-2 mb-2">
                      <ArrowRight size={12} /> THE FUTURE (Academic)
                    </div>
                    <p className="font-bold text-lg leading-relaxed italic">{translations.era3}</p>
                  </div>
                </motion.div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
