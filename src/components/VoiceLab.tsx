import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, X, Volume2, RefreshCw, CheckCircle2, AlertTriangle, ChevronRight, Zap } from 'lucide-react';
import { useUserStore } from '@/store/userStore';
import {
  analyzeSpeechQuality,
  getChallengesForEra,
  VoiceChallenge,
  SpeechAuditResult,
  WordAudit,
} from '@/lib/grammarAnalyzer';

// ─────────────────────────────────────────────── TTS ───

function speak(text: string, era: number) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);

  if (era === 1) {
    utterance.rate = 0.78;
    utterance.pitch = 1.1;
  } else if (era === 2) {
    utterance.rate = 0.92;
    utterance.pitch = 1.0;
  } else {
    utterance.rate = 1.05;
    utterance.pitch = 0.88;
  }

  window.speechSynthesis.speak(utterance);
}

// ─────────────────────────────────────── Word Diff Card ───

function ComparisonWord({ audit }: { audit: WordAudit }) {
  const colors: Record<string, string> = {
    none: 'text-green-600 dark:text-green-400',
    grammar: 'text-red-500 line-through',
    spelling: 'text-orange-500 underline decoration-wavy',
    pronunciation: 'text-yellow-500 underline',
  };
  return (
    <span className={`inline-block mx-0.5 font-semibold text-base leading-relaxed ${colors[audit.errorType]}`} title={audit.errorType !== 'none' ? `${audit.errorType} (${audit.closeness}% match)` : ''}>
      {audit.word || <span className="opacity-30 italic">___</span>}
    </span>
  );
}

// ─────────────────────────────────────────── Main Component ───

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

export function VoiceLab() {
  const { isVoiceLabOpen, setIsVoiceLabOpen, currentGrade, addVoiceHistory, addXP, settings } = useUserStore();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [currentChallenge, setCurrentChallenge] = useState<VoiceChallenge | null>(null);
  const [auditResult, setAuditResult] = useState<(SpeechAuditResult & { phoneticIssues?: string[]; prosodyScore?: number }) | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [bars, setBars] = useState<number[]>(Array(20).fill(4));
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const [isShadowingMode, setIsShadowingMode] = useState(false);

  const currentEra = currentGrade < 6 ? 1 : currentGrade < 13 ? 2 : 3;

  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // ... previous useEffect ...
  useEffect(() => {
    if (isVoiceLabOpen) {
      loadNewChallenge();
      setTranscript('');
      setAuditResult(null);
    }
  }, [isVoiceLabOpen]);

  function loadNewChallenge() {
    const challenges = getChallengesForEra(currentEra);
    const random = challenges[Math.floor(Math.random() * challenges.length)];
    setCurrentChallenge(random);
    setTranscript('');
    setAuditResult(null);
  }

  // ... animateBars and listen start/stop logic ...
  const animateBars = useCallback(() => {
    setBars(prev => prev.map(() => Math.random() * 40 + 4));
    animFrameRef.current = requestAnimationFrame(animateBars);
  }, []);

  useEffect(() => {
    if (isListening) {
      animateBars();
    } else {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      setBars(Array(20).fill(4));
    }
    return () => { if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current); };
  }, [isListening, animateBars]);

  function startListening() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const recognition = new SR();
    recognitionRef.current = recognition;
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    setTranscript('');
    setAuditResult(null);
    setIsListening(true);

    if (isShadowingMode && currentChallenge) {
      speak(currentChallenge.target, currentEra);
    }

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const text = Array.from({ length: event.results.length }, (_, i) =>
        event.results[i][0].transcript
      ).join('');
      setTranscript(text);
    };

    recognition.onend = () => {
      setIsListening(false);
      if (transcript || recognitionRef.current) {
        setTimeout(() => {
          setTranscript(prev => {
            if (prev && currentChallenge) {
              runAnalysis(prev, currentChallenge.target);
            }
            return prev;
          });
        }, 200);
      }
    };

    recognition.onerror = () => setIsListening(false);
    recognition.start();
  }

  function stopListening() {
    recognitionRef.current?.stop();
    setIsListening(false);
  }

  async function runAnalysis(spokenText: string, targetText: string) {
    if (!spokenText.trim()) return;
    const localResult = analyzeSpeechQuality(spokenText, targetText, currentEra);
    setAuditResult(localResult);

    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/analyze-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: spokenText,
          era: currentEra,
          strictness: settings.voiceStrictness,
          target: targetText,
          shadowing: isShadowingMode
        }),
      });
      const aiData = await response.json();

      setAuditResult(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          isCorrect: aiData.isCorrect,
          overallScore: aiData.score,
          explanation: aiData.explanation || prev.explanation,
          correctedSentence: aiData.corrected || prev.correctedSentence,
          phoneticIssues: aiData.phoneticIssues || [],
          prosodyScore: aiData.prosodyScore || null,
        };
      });

      if (aiData.isCorrect) addXP(isShadowingMode ? 40 : 20);
      else if (aiData.score >= 70) addXP(5);

      if (!aiData.isCorrect && !isShadowingMode) {
        setTimeout(() => speakCorrection(aiData.corrected || localResult.correctedSentence), 400);
      }

      addVoiceHistory({
        original: spokenText,
        corrected: aiData.corrected || localResult.correctedSentence,
        explanation: aiData.explanation || localResult.explanation,
      });
    } catch (e) {
      console.error('AI Analysis failed', e);
    } finally {
      setIsAnalyzing(false);
    }
  }

  function speakCorrection(text: string) {
    setIsSpeaking(true);
    speak(text, currentEra);
    const approxMs = text.split(' ').length * 400 + 500;
    setTimeout(() => setIsSpeaking(false), approxMs);
  }

  const eraLabel = currentEra === 1 ? 'Era I: Foundations' : currentEra === 2 ? 'Era II: Industrial' : 'Era III: Collegiate';
  const themeAccent = currentEra === 1 ? '#B5884A' : currentEra === 2 ? '#3B82F6' : '#A855F7';

  if (!isVoiceLabOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4"
        onClick={(e) => { if (e.target === e.currentTarget) setIsVoiceLabOpen(false); }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden border border-white/10"
        >
          {/* Header */}
          <div className="p-6 flex items-center justify-between border-b border-black/5 dark:border-white/5"
            style={{ background: `linear-gradient(135deg, ${themeAccent}20, transparent)` }}>
            <div>
              <h2 className="text-xl font-black tracking-tight">STRICT VOICE LAB</h2>
              <div className="flex items-center gap-2">
                <p className="text-xs font-bold uppercase tracking-widest opacity-50">{eraLabel}</p>
                <div className="w-1 h-1 bg-gray-400 rounded-full" />
                <button 
                  onClick={() => setIsShadowingMode(!isShadowingMode)}
                  className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md transition-all ${isShadowingMode ? 'bg-indigo-500 text-white' : 'bg-black/5 dark:bg-white/10 opacity-50'}`}
                >
                  Shadowing: {isShadowingMode ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>
            <button onClick={() => setIsVoiceLabOpen(false)} className="p-2 hover:bg-black/5 rounded-full"><X size={20} /></button>
          </div>

          <div className="p-6 space-y-6">
            {/* Target Sentence */}
            {currentChallenge && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-50">Target Sentence</p>
                  <div className="flex gap-2">
                    <button onClick={() => speak(currentChallenge.target, currentEra)} className="p-1 text-gray-400 hover:text-blue-500"><Volume2 size={16} /></button>
                    <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full" style={{ background: `${themeAccent}20`, color: themeAccent }}>{currentChallenge.category}</span>
                  </div>
                </div>
                <div className="p-5 rounded-2xl border-2 text-xl font-bold leading-relaxed shadow-inner bg-black/5 dark:bg-white/5" style={{ borderColor: `${themeAccent}30` }}>
                  {currentChallenge.target}
                </div>
              </div>
            )}

            {/* Prosody Result */}
            {isShadowingMode && auditResult?.prosodyScore && (
              <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="p-4 bg-indigo-500/10 border-2 border-indigo-500/30 rounded-2xl flex items-center justify-between">
                <div>
                   <p className="text-[10px] font-black uppercase text-indigo-500">Naturalness Bloom</p>
                   <p className="text-sm font-bold opacity-80">Synchronicity & Prosody</p>
                </div>
                <div className="text-2xl font-black text-indigo-600">{auditResult.prosodyScore}%</div>
              </motion.div>
            )}

            {/* Sound Wave Visualizer */}
            <div className="flex items-center justify-center gap-1 h-12">
              {bars.map((h, i) => (
                <motion.div key={i} animate={{ height: isListening ? h : 4 }} transition={{ duration: 0.05 }} className="w-1.5 rounded-full" style={{ backgroundColor: isListening ? (isShadowingMode ? '#6366F1' : themeAccent) : '#4B5563' }} />
              ))}
            </div>

            {/* Mic Button */}
            <div className="flex justify-center relative">
              <motion.button
                whileTap={{ scale: 0.9 }}
                animate={isListening ? { boxShadow: [`0 0 0 0px ${isShadowingMode ? '#6366F1' : themeAccent}40`, `0 0 0 20px ${isShadowingMode ? '#6366F1' : themeAccent}00`] } : {}}
                transition={isListening ? { duration: 1, repeat: Infinity } : {}}
                onClick={isListening ? stopListening : startListening}
                className="w-24 h-24 rounded-full flex items-center justify-center shadow-2xl z-10 text-white"
                style={{ background: isListening ? '#EF4444' : `linear-gradient(135deg, ${isShadowingMode ? '#6366F1' : themeAccent}, ${isShadowingMode ? '#4F46E5' : themeAccent}DD)` }}
              >
                {isListening ? <MicOff size={40} /> : <div className="relative"><Mic size={40} />{isShadowingMode && <MusicNote className="absolute -right-2 -top-2 w-6 h-6 animate-pulse" />}</div>}
              </motion.button>
            </div>

            {/* Live Transcript Bubble */}
            <AnimatePresence>
              {(isListening || transcript) && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="p-5 rounded-2xl bg-black/5 dark:bg-white/5 text-lg font-medium italic border-l-4" style={{ borderColor: isShadowingMode ? '#6366F1' : themeAccent }}>
                  {transcript || <span className="opacity-30">Phonetic capture active…</span>}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Audit Result */}
            <AnimatePresence>
              {auditResult && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`flex items-center gap-2 font-black text-sm ${auditResult.isCorrect ? 'text-green-500' : 'text-orange-500'}`}>
                      {auditResult.isCorrect ? <><CheckCircle2 size={20} /> MISSION ACCOMPLISHED</> : <><AlertTriangle size={20} /> STRICTURE ALERT: {auditResult.overallScore}%</>}
                    </div>
                  </div>

                  <div className="rounded-2xl border-2 border-black/5 dark:border-white/5 bg-white/50 dark:bg-black/50 overflow-hidden">
                    <div className="p-4 border-b border-black/5 dark:border-white/5">
                      <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-2">Spoken Record</p>
                      <div className="flex flex-wrap gap-y-1">
                        {auditResult.spokenWords.map((audit, i) => <ComparisonWord key={i} audit={audit} />)}
                      </div>
                    </div>
                  </div>

                  {!auditResult.isCorrect && (
                    <div className="p-4 bg-black/5 dark:bg-white/5 rounded-2xl text-sm italic opacity-80">"{auditResult.explanation}"</div>
                  )}

                  <div className="flex gap-3">
                    <button onClick={loadNewChallenge} className="flex-1 py-4 rounded-2xl border-2 font-black uppercase text-xs tracking-widest hover:bg-black/5">New Task</button>
                    {!auditResult.isCorrect && (
                      <button onClick={() => { setTranscript(''); setAuditResult(null); }} className="flex-1 py-4 rounded-2xl font-black uppercase text-xs tracking-widest text-white shadow-lg" style={{ backgroundColor: themeAccent }}>Retry Accuracy</button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function MusicNote({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>;
}
