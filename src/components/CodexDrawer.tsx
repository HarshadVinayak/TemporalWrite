'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Book, ChevronRight, Play, CheckCircle2, FileQuestion, PenTool, RefreshCcw } from 'lucide-react';
import { useUserStore } from '@/store/userStore';
import { useState } from 'react';
import codexData from '../content/codex_bank.json';
import { EraTranslator } from './EraTranslator';

export function CodexDrawer() {
  const { isCodexOpen, setIsCodexOpen, currentGrade, setActiveCodexChallenge } = useUserStore();
  const [selectedCategory, setSelectedCategory] = useState<any | null>(null);

  const eraClass = currentGrade < 6 ? 'era-1' : currentGrade < 13 ? 'era-2' : 'era-3 dark';

  const handleClose = () => {
    setIsCodexOpen(false);
    setSelectedCategory(null);
  };

  const startChallenge = (type: string) => {
    if (!selectedCategory) return;
    
    // Pick a random question from the category that matches the type
    // In a real app we'd filter, but for now just pick one to demonstrate
    const challenge = selectedCategory.questions.find((q: any) => q.type === type) || selectedCategory.questions[0];
    setActiveCodexChallenge(challenge);
    setIsCodexOpen(false);
  };

  return (
    <AnimatePresence>
      {isCodexOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`fixed left-0 top-0 bottom-0 w-full max-w-2xl bg-white dark:bg-gray-900 z-[101] shadow-2xl flex flex-col ${eraClass}`}
          >
            {/* Header */}
            <div className="p-6 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 rounded-xl">
                  <Book size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Grammar Codex</h2>
                  <p className="text-sm opacity-60">The Master Library</p>
                </div>
              </div>
              <button 
                onClick={handleClose}
                className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors"
                aria-label="Close"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {!selectedCategory ? (
                <>
                  <EraTranslator />
                  
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-widest opacity-50 mb-4 px-2">Library Categories</h3>
                    <div className="grid grid-cols-1 gap-4">
                      {codexData.categories.map((cat) => (
                        <motion.button
                          key={cat.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setSelectedCategory(cat)}
                          className="flex items-center p-5 rounded-2xl bg-white/50 dark:bg-black/20 border-2 border-black/5 dark:border-white/5 hover:border-purple-300 dark:hover:border-purple-900 transition-all text-left group"
                        >
                          <div className="flex-1">
                            <h3 className="text-lg font-bold mb-1">{cat.name}</h3>
                            <p className="text-sm opacity-60 line-clamp-2">{cat.description}</p>
                          </div>
                          <ChevronRight className="opacity-0 group-hover:opacity-100 transition-opacity text-purple-500" />
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col h-full">
                  <button 
                    onClick={() => setSelectedCategory(null)}
                    className="flex items-center gap-2 text-sm font-bold text-purple-600 dark:text-purple-400 mb-6 hover:underline"
                  >
                    ← Back to Categories
                  </button>

                  <h2 className="text-3xl font-bold mb-2">{selectedCategory.name}</h2>
                  <p className="opacity-70 mb-8">{selectedCategory.description}</p>

                  <div className="grid grid-cols-1 gap-4">
                    <h3 className="text-sm font-bold uppercase tracking-widest opacity-50 mb-2">Practice Modes</h3>
                    
                    <button 
                      onClick={() => startChallenge('WordBank')}
                      className="flex items-center p-5 rounded-2xl bg-blue-500 text-white shadow-[0_6px_0_0_#1d4ed8] active:translate-y-1 active:shadow-[0_2px_0_0_#1d4ed8] transition-all"
                    >
                      <FileQuestion size={24} className="mr-4" />
                      <div className="text-left">
                        <div className="font-bold text-lg">📝 Quiz</div>
                        <div className="text-xs opacity-80">Multiple choice questions</div>
                      </div>
                    </button>

                    <button 
                      onClick={() => startChallenge('FillInBlank')}
                      className="flex items-center p-5 rounded-2xl bg-green-500 text-white shadow-[0_6px_0_0_#15803d] active:translate-y-1 active:shadow-[0_2px_0_0_#15803d] transition-all opacity-80"
                    >
                      <PenTool size={24} className="mr-4" />
                      <div className="text-left">
                        <div className="font-bold text-lg">🔲 Fill in the Blanks</div>
                        <div className="text-xs opacity-80">Text-input challenges</div>
                      </div>
                    </button>

                    <button 
                      onClick={() => startChallenge('Transformer')}
                      className="flex items-center p-5 rounded-2xl bg-purple-500 text-white shadow-[0_6px_0_0_#7e22ce] active:translate-y-1 active:shadow-[0_2px_0_0_#7e22ce] transition-all"
                    >
                      <RefreshCcw size={24} className="mr-4" />
                      <div className="text-left">
                        <div className="font-bold text-lg">🔄 Rewrite</div>
                        <div className="text-xs opacity-80">Sentence transformation</div>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 bg-black/5 dark:bg-white/5 text-center text-xs opacity-40">
              Grammar Codex V2.0 - Non-linear study module
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
