'use client';

import { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, X, Scan, Zap, Info, Loader2, History, Check } from 'lucide-react';
import { useUserStore } from '@/store/userStore';

interface SolvedQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  timestamp: number;
}

export function LiveLens() {
  const { isLensOpen: isOpen, setIsLensOpen: setIsOpen, currentGrade } = useUserStore();
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<SolvedQuestion | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<SolvedQuestion[]>([]);
  
  const webcamRef = useRef<Webcam>(null);
  const era = currentGrade < 6 ? 1 : currentGrade < 13 ? 2 : 3;

  const capture = useCallback(async () => {
    if (!webcamRef.current) return;
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;

    setIsScanning(true);
    setResult(null);

    try {
      const res = await fetch('/api/vision/solve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageSrc, era })
      });
      const data = await res.json();
      
      if (data.question) {
        const solved = { ...data, timestamp: Date.now() };
        setResult(solved);
        setHistory(prev => [solved, ...prev]);
        // Also save to localStorage or store if needed
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsScanning(false);
    }
  }, [webcamRef, era]);

  return (
    <AnimatePresence>
      {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] bg-black flex flex-col items-center justify-center"
          >
            <div className="relative w-full h-full flex flex-col">
              {/* Webcam Feed */}
              <div className="flex-1 relative overflow-hidden flex items-center justify-center bg-gray-900">
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  className="h-full w-full object-cover"
                  videoConstraints={{ facingMode: "environment" }}
                />

                {/* AR Scanning Frame */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                   <div className="w-[80%] h-[40%] border-2 border-cyan-500/50 rounded-3xl relative">
                      <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-cyan-500 rounded-tl-xl" />
                      <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-cyan-500 rounded-tr-xl" />
                      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-cyan-500 rounded-bl-xl" />
                      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-cyan-500 rounded-br-xl" />
                      
                      {isScanning && (
                        <motion.div 
                          animate={{ top: ['0%', '100%', '0%'] }}
                          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                          className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent shadow-[0_0_15px_rgba(6,182,212,0.8)]"
                        />
                      )}
                   </div>

                   {/* AR Result Overlay */}
                   {result && (
                     <motion.div 
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex flex-col items-center px-10 gap-4"
                     >
                        <div className="bg-green-500/90 backdrop-blur-md text-white px-4 py-2 rounded-full font-black text-xs flex items-center gap-2 shadow-2xl">
                           <Check size={16} /> {result.options[result.correctIndex]}
                        </div>
                        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md p-4 rounded-2xl shadow-2xl max-w-sm text-center border-2 border-cyan-500/30">
                           <p className="text-[10px] font-black uppercase text-cyan-600 mb-2">Knowledge Bubble</p>
                           <p className="text-sm font-medium leading-relaxed italic">"{result.explanation}"</p>
                        </div>
                     </motion.div>
                   )}
                </div>

                {/* Status Indicator */}
                <div className="absolute top-10 left-10 flex items-center gap-2 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-white">
                   <div className={`w-2 h-2 rounded-full ${isScanning ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
                   <span className="text-[10px] font-black uppercase tracking-widest leading-none">
                     {isScanning ? 'Analyzing Timeline...' : 'Lens Ready'}
                   </span>
                </div>
              </div>

              {/* Controls */}
              <div className="h-44 bg-black/90 backdrop-blur-2xl border-t border-white/10 flex items-center justify-around px-8">
                <button onClick={() => setShowHistory(true)} className="p-4 text-white/50 hover:text-white transition-colors relative">
                  <History size={28} />
                  {history.length > 0 && <span className="absolute top-2 right-2 w-4 h-4 bg-cyan-500 text-[10px] font-black rounded-full flex items-center justify-center text-white">{history.length}</span>}
                </button>

                <button 
                  onClick={capture}
                  disabled={isScanning}
                  className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.3)] disabled:opacity-50 active:scale-90 transition-all border-4 border-gray-300"
                >
                  {isScanning ? <Loader2 className="animate-spin text-black" size={32} /> : <div className="w-16 h-16 rounded-full border-2 border-black/10" />}
                </button>

                <button onClick={() => { setIsOpen(false); setResult(null); }} className="p-4 text-white/50 hover:text-white transition-colors">
                  <X size={28} />
                </button>
              </div>

              {/* History Sidebar */}
              <AnimatePresence>
                {showHistory && (
                   <motion.div 
                    initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                    className="absolute inset-y-0 right-0 w-full max-w-xs bg-gray-900 border-l border-white/10 z-10 flex flex-col"
                   >
                      <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/40">
                         <h3 className="text-white font-black uppercase text-sm tracking-widest">Lens Archive</h3>
                         <button onClick={() => setShowHistory(false)} className="text-white/50 hover:text-white"><X size={20} /></button>
                      </div>
                      <div className="flex-1 overflow-y-auto p-4 space-y-4">
                         {history.length === 0 ? (
                           <div className="text-center py-20 opacity-30 text-white">No solved questions archived yet.</div>
                         ) : history.map((h, i) => (
                           <div key={i} className="bg-white/5 p-4 rounded-xl space-y-2 border border-white/5">
                              <p className="text-white/40 text-[9px] font-bold">{new Date(h.timestamp).toLocaleTimeString()}</p>
                              <p className="text-white text-xs font-bold leading-tight">{h.question}</p>
                              <div className="text-[10px] font-black text-cyan-400">Ans: {h.options[h.correctIndex]}</div>
                           </div>
                         ))}
                      </div>
                   </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
}
