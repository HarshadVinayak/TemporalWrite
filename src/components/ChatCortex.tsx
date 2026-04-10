'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Send, 
  Cpu, 
  Trash2, 
  Sparkles, 
  Zap, 
  Brain,
  MessageSquare,
  ChevronRight
} from 'lucide-react';
import { useUserStore } from '@/store/userStore';

export function ChatCortex() {
  const { 
    isChatOpen, 
    setIsChatOpen, 
    chatHistory, 
    addChatMessage, 
    clearChatHistory, 
    chatEngine, 
    setChatEngine, 
    currentGrade,
    history 
  } = useUserStore();

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, isTyping]);

  const lastFailed = history.find(h => h.result === 'Needs Review')?.topic || null;

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg = input.trim();
    setInput('');
    addChatMessage({ role: 'user', content: userMsg });
    setIsTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...chatHistory, { role: 'user', content: userMsg }],
          engine: chatEngine,
          era: currentGrade < 6 ? 1 : currentGrade < 13 ? 2 : 3,
          lastFailed: lastFailed
        }),
      });

      if (!response.ok) throw new Error('Failed to reach the Librarian.');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6).trim();
              if (data === '[DONE]') break;

              try {
                const parsed = JSON.parse(data);
                if (parsed.content) {
                  assistantContent += parsed.content;
                  // We update UI state immediately but only add to store at the end to avoid redundant renders
                  setStreamingText(assistantContent);
                }
              } catch (e) {
                // Ignore parse errors for chunks
              }
            }
          }
        }
      }

      addChatMessage({ role: 'assistant', content: assistantContent });
      setStreamingText('');
    } catch (error) {
      console.error(error);
      addChatMessage({ 
        role: 'assistant', 
        content: "I'm sorry, the Chronos network is having trouble. Please try again in a moment." 
      });
    } finally {
      setIsTyping(false);
    }
  };

  const [streamingText, setStreamingText] = useState('');

  if (!isChatOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl z-[100] flex flex-col border-l border-black/5 dark:border-white/5"
      >
        {/* Header */}
        <div className="p-4 border-b border-black/5 dark:border-white/5 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 text-white rounded-xl shadow-lg">
              <Cpu size={20} />
            </div>
            <div>
              <h3 className="font-bold text-lg">ChatCortex</h3>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-50">Experimental Librarian AI</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="bg-black/5 dark:bg-white/10 p-1 rounded-lg flex gap-1">
              <button 
                onClick={() => setChatEngine('groq')}
                className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all flex items-center gap-1 ${chatEngine === 'groq' ? 'bg-white dark:bg-gray-800 shadow-sm text-blue-600' : 'opacity-50'}`}
              >
                <Zap size={10} /> SPEED
              </button>
              <button 
                onClick={() => setChatEngine('openrouter')}
                className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all flex items-center gap-1 ${chatEngine === 'openrouter' ? 'bg-white dark:bg-gray-800 shadow-sm text-purple-600' : 'opacity-50'}`}
              >
                <Brain size={10} /> DEPTH
              </button>
            </div>
            <button 
              onClick={() => setIsChatOpen(false)}
              className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {chatHistory.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-40">
              <Sparkles size={48} className="mb-4 text-blue-500" />
              <p className="text-sm font-medium">Hello! I am the Chronos Librarian. Ask me anything about grammar or your progress.</p>
              <div className="mt-6 grid grid-cols-1 gap-2 w-full">
                {['/analyze recent mistakes', '/translate into Era 3', '/quiz me on verbs'].map(cmd => (
                  <button 
                    key={cmd}
                    onClick={() => setInput(cmd)}
                    className="text-[10px] font-bold border border-black/10 dark:border-white/10 py-2 rounded-lg hover:bg-black/5 transition-all text-left px-3 flex items-center justify-between"
                  >
                    {cmd} <ChevronRight size={10} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {chatHistory.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-none' 
                  : 'bg-black/5 dark:bg-white/5 dark:text-gray-200 rounded-tl-none border border-black/5 dark:border-white/5'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="max-w-[85%] p-3 rounded-2xl text-sm bg-black/5 dark:bg-white/5 dark:text-gray-200 rounded-tl-none border border-black/5 dark:border-white/5">
                <div className="flex gap-1 mb-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                </div>
                {streamingText && <p className="animate-in fade-in duration-300">{streamingText}</p>}
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-black/5 dark:border-white/5">
          <div className="flex gap-2">
            <button 
              onClick={clearChatHistory}
              title="Clear History"
              className="p-3 text-gray-400 hover:text-red-500 transition-colors"
            >
              <Trash2 size={20} />
            </button>
            <div className="flex-1 relative">
              <input 
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Talk to the Librarian..."
                className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12"
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="absolute right-2 top-1.5 p-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 transition-all hover:bg-blue-700"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
