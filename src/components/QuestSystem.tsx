'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sword, X, Send, Trophy, Scroll, Target, Crown, CheckCircle2 } from 'lucide-react';
import { useUserStore } from '@/store/userStore';

interface Quest {
  id: string;
  era: 1 | 2 | 3;
  title: string;
  description: string;
  character: string;
  targets: string[];
}

const QUESTS: Quest[] = [
  {
    id: 'q1',
    era: 1,
    title: 'The Knight’s Petition',
    description: 'Help the Knight write a letter to the King about the missing dragon.',
    character: 'Sir Barnaby (Medieval Knight)',
    targets: ['use 3 concrete nouns', 'properly used exclamation mark']
  },
  {
    id: 'q2',
    era: 2,
    title: 'The Factory Inspector',
    description: 'Convince the inspector that your steam engine is safe.',
    character: 'Inspector Sterling (Victorian Engineer)',
    targets: ['use a compound sentence', 'use 2 modal verbs (should/must)']
  },
  {
    id: 'q3',
    era: 3,
    title: 'The AI Overlord',
    description: 'Argue for human creativity before the Council of Processing.',
    character: 'Nexus-9 (Cybernetic Arbiter)',
    targets: ['use a semicolon correctly', 'use an abstract noun']
  }
];

export function QuestSystem() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeQuest, setActiveQuest] = useState<Quest | null>(null);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [targetsMet, setTargetsMet] = useState<string[]>([]);
  const [hasWon, setHasWon] = useState(false);
  
  const { currentGrade, addXP } = useUserStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const startQuest = (quest: Quest) => {
    setActiveQuest(quest);
    setMessages([{ 
      role: 'assistant' as const, 
      content: `Greetings, traveller. I am ${quest.character}. ${quest.description} Can you help me?` 
    }]);
    setTargetsMet([]);
    setHasWon(false);
  };

  const handleSend = async () => {
    if (!input.trim() || isTyping || !activeQuest) return;

    const userMsg = input.trim();
    setInput('');
    const newMessages = [...messages, { role: 'user' as const, content: userMsg }];
    setMessages(newMessages);
    setIsTyping(true);

    try {
      const res = await fetch('/api/quest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          era: activeQuest.era,
          questType: activeQuest.title,
          targets: activeQuest.targets
        })
      });
      const data = await res.json();
      
      setMessages([...newMessages, { role: 'assistant', content: data.content }]);
      setTargetsMet(data.targetsMet || []);
      
      if (data.hasWon && !hasWon) {
        setHasWon(true);
        addXP(250); // Massive reward
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-44 right-8 p-4 bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-2xl shadow-xl hover:scale-110 transition-all z-40 group"
      >
        <Sword size={24} />
         <span className="absolute right-full mr-3 bg-black/80 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Era Quests</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
          >
            <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[80vh]">
              {!activeQuest ? (
                <div className="p-8 flex flex-col items-center">
                  <h2 className="text-3xl font-black mb-6 text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600">Choose Your Quest</h2>
                  <div className="grid grid-cols-1 gap-4 w-full">
                    {QUESTS.map(q => (
                      <button 
                        key={q.id}
                        onClick={() => startQuest(q)}
                        className={`p-6 rounded-2xl border-2 transition-all text-left flex gap-4 ${q.era === (currentGrade < 6 ? 1 : currentGrade < 13 ? 2 : 3) ? 'border-amber-500 dark:bg-amber-500/10' : 'border-black/5 dark:border-white/5 opacity-60'}`}
                      >
                         <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center text-amber-600 shrink-0">
                           <Scroll />
                         </div>
                         <div>
                           <h3 className="font-bold text-lg">{q.title}</h3>
                           <p className="text-sm opacity-70">{q.description}</p>
                           <div className="mt-2 flex gap-2">
                             {q.targets.map(t => (
                               <span key={t} className="text-[10px] bg-black/5 dark:bg-white/10 px-2 py-0.5 rounded-full font-bold">🎯 {t}</span>
                             ))}
                           </div>
                         </div>
                      </button>
                    ))}
                  </div>
                  <button onClick={() => setIsOpen(false)} className="mt-8 text-sm font-bold opacity-50 hover:opacity-100 transition-opacity">Close Journey</button>
                </div>
              ) : (
                <div className="flex-1 flex flex-col">
                   <div className="p-4 border-b dark:border-white/10 flex justify-between items-center bg-amber-50 dark:bg-amber-900/10">
                    <div className="flex items-center gap-3">
                      <div className="bg-amber-600 text-white p-2 rounded-xl"><Crown size={18} /></div>
                      <div>
                        <h3 className="font-bold">{activeQuest.character}</h3>
                        <p className="text-[10px] font-black uppercase tracking-widest text-amber-600">Active Quest: {activeQuest.title}</p>
                      </div>
                    </div>
                    <button onClick={() => setActiveQuest(null)} className="p-2 hover:bg-black/5 rounded-full"><X /></button>
                  </div>

                  <div className="p-2 bg-black/5 dark:bg-white/5 flex gap-2 justify-center border-b dark:border-white/10 overflow-x-auto">
                    {activeQuest.targets.map(t => (
                      <div key={t} className={`px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 transition-all ${targetsMet.includes(t) ? 'bg-green-500 text-white' : 'bg-white dark:bg-gray-800 opacity-50'}`}>
                        {targetsMet.includes(t) ? <CheckCircle2 size={12} /> : <Target className="w-3 h-3" />}
                        {t}
                      </div>
                    ))}
                  </div>

                  <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/30 dark:bg-black/20">
                    {messages.map((m, i) => (
                      <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${m.role === 'user' ? 'bg-amber-600 text-white rounded-tr-none' : 'bg-white dark:bg-gray-800 rounded-tl-none shadow-sm'}`}>
                          {m.content}
                        </div>
                      </div>
                    ))}
                    {isTyping && <div className="text-xs opacity-50 italic animate-pulse">Character is thinking...</div>}
                    {hasWon && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex flex-col items-center p-8 bg-green-500/10 rounded-3xl border-2 border-green-500/50">
                        <Trophy size={48} className="text-green-500 mb-2" />
                        <h2 className="text-2xl font-black text-green-500">QUEST COMPLETE!</h2>
                        <p className="text-sm font-medium mb-4">+250 XP earned for linguistic mastery.</p>
                        <button onClick={() => setActiveQuest(null)} className="px-6 py-2 bg-green-500 text-white rounded-xl font-bold">Claim Reward</button>
                      </motion.div>
                    )}
                  </div>

                  <div className="p-4 border-t dark:border-white/10">
                    <div className="flex gap-2">
                       <input 
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSend()}
                        placeholder={`Talk to ${activeQuest.character}...`}
                        className="flex-1 bg-black/5 dark:bg-white/5 border dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                      <button 
                        onClick={handleSend}
                        className="p-3 bg-amber-600 text-white rounded-xl shadow-lg"
                      >
                        <Send size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

