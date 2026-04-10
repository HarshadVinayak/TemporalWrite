'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, CheckCircle2, XCircle, GraduationCap, ArrowLeft, Loader2, Sparkles, Trophy } from 'lucide-react';
import Link from 'next/link';
import { useUserStore } from '@/store/userStore';

type ExamState = 'not_started' | 'loading' | 'in_progress' | 'results';

interface Question {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export function ExamPractice() {
  const { currentGrade, addXP, addCertification, setGrade } = useUserStore();
  
  const [gameState, setGameState] = useState<ExamState>('not_started');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [score, setScore] = useState(0);
  const [topic, setTopic] = useState('General Grammar');
  const [showCertificate, setShowCertificate] = useState(false);

  const startExam = async () => {
    setGameState('loading');
    try {
      const era = currentGrade < 6 ? 1 : currentGrade < 13 ? 2 : 3;
      const res = await fetch('/api/exam/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ era, topic })
      });
      const data = await res.json();
      if (data.questions) {
        setQuestions(data.questions);
        setGameState('in_progress');
        setCurrentIndex(0);
        setScore(0);
      }
    } catch (err) {
      console.error(err);
      setGameState('not_started');
    }
  };

  const handleSelect = (idx: number) => {
    if (isConfirmed) return;
    setSelectedOption(idx);
  };

  const handleConfirm = () => {
    if (selectedOption === null) return;
    setIsConfirmed(true);
    if (selectedOption === questions[currentIndex].correctIndex) {
      setScore(s => s + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(c => c + 1);
      setSelectedOption(null);
      setIsConfirmed(false);
    } else {
      finishExam();
    }
  };

  const finishExam = () => {
    setGameState('results');
    const finalScore = score + (selectedOption === questions[currentIndex].correctIndex ? 1 : 0);
    
    // XP Reward: Exam XP is double (usually 1 level is 100XP, let's say 1 correct = 10XP, but here double it)
    if (finalScore >= 8) {
      addXP(finalScore * 20); // Double XP
    } else {
      addXP(finalScore * 10); // Regular XP
    }

    addCertification({
      id: `cert-${Date.now()}`,
      title: `${topic} - Era ${currentGrade < 6 ? 1 : currentGrade < 13 ? 2 : 3} Mastery`,
      score: finalScore,
      date: new Date().toLocaleDateString(),
      timestamp: Date.now()
    });

    if (finalScore === questions.length) {
      setTimeout(() => setShowCertificate(true), 1500);
      
      // Graduation Logic: If it's the last exam or they reached threshold, warp
      if (currentGrade < 6) {
        // Mocking threshold for Era 1 -> 2
        // If they score 100% and have enough XP, the store handles it, 
        // but let's force a visual transition feel.
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black p-4 md:p-8 font-sans transition-all duration-1000">
      <AnimatePresence>
        {showCertificate && (
          <Certificate 
            topic={topic} 
            score={score} 
            onClose={() => setShowCertificate(false)} 
          />
        )}
      </AnimatePresence>

      <Link href="/" className="fixed top-8 left-8 p-3 bg-white dark:bg-gray-800 dark:text-white rounded-full shadow-lg hover:scale-110 transition-all z-50">
        <ArrowLeft />
      </Link>

      <div className="max-w-3xl mx-auto pt-16">
        <AnimatePresence mode="wait">
          {gameState === 'not_started' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="text-center space-y-8"
            >
              <div className="inline-block p-6 bg-blue-600 text-white rounded-[2rem] shadow-2xl">
                <GraduationCap size={64} />
              </div>
              <h1 className="text-5xl font-black tracking-tight">Chronos Exam Hall</h1>
              <p className="text-xl opacity-60">Generate a custom proficiency test for your current Era.</p>
              
              <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-xl border border-black/5 dark:border-white/5 space-y-6">
                 <div>
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Choose Subject</label>
                    <select 
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="w-full mt-2 p-4 bg-gray-50 dark:bg-black border border-black/10 dark:border-white/10 rounded-2xl font-bold"
                    >
                      <option>General Grammar</option>
                      <option>Verb Tenses</option>
                      <option>Conditionals</option>
                      <option>Punctuation</option>
                      <option>Rhetoric</option>
                    </select>
                 </div>
                 <button 
                  onClick={startExam}
                  className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-xl shadow-xl shadow-blue-500/30 hover:bg-blue-700 transition-all"
                 >
                   BEGIN CERTIFICATION
                 </button>
              </div>
            </motion.div>
          )}

          {gameState === 'loading' && (
             <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-32 space-y-6"
             >
                <Loader2 className="animate-spin text-blue-500" size={48} />
                <p className="font-black uppercase tracking-widest animate-pulse">Drafting Your Paper...</p>
             </motion.div>
          )}

          {gameState === 'in_progress' && questions[currentIndex] && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              key={currentIndex}
              className="space-y-8"
            >
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                   <h3 className="text-sm font-black uppercase tracking-widest opacity-40">Question {currentIndex + 1} of {questions.length}</h3>
                   <span className="text-xs font-bold text-blue-500">{Math.round(((currentIndex + 1) / questions.length) * 100)}% Complete</span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                   <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                    className="h-full bg-blue-600"
                   />
                </div>
              </div>

              {/* Question Card */}
              <div className="bg-white dark:bg-gray-900 p-8 md:p-12 rounded-[2.5rem] shadow-2xl border border-black/5 dark:border-white/5 space-y-10">
                 <h2 className="text-2xl md:text-3xl font-bold leading-tight">
                   {questions[currentIndex].question}
                 </h2>

                 <div className="grid grid-cols-1 gap-4">
                    {questions[currentIndex].options.map((option, idx) => {
                      const isCorrect = idx === questions[currentIndex].correctIndex;
                      const isSelected = selectedOption === idx;
                      
                      let variant = "bg-gray-50 dark:bg-black border-black/5";
                      if (isConfirmed) {
                        if (isCorrect) variant = "bg-green-100 dark:bg-green-900/30 border-green-500 text-green-700 dark:text-green-400";
                        else if (isSelected) variant = "bg-red-100 dark:bg-red-900/30 border-red-500 text-red-700 dark:text-red-400";
                        else variant = "opacity-40 grayscale";
                      } else if (isSelected) {
                        variant = "bg-blue-50 dark:bg-blue-900/20 border-blue-500 ring-2 ring-blue-500/20";
                      } else {
                        variant = "hover:bg-gray-100 dark:hover:bg-white/5";
                      }

                      return (
                        <button 
                          key={idx}
                          onClick={() => handleSelect(idx)}
                          disabled={isConfirmed}
                          className={`p-5 rounded-2xl border-2 transition-all flex items-center justify-between text-left group ${variant}`}
                        >
                          <span className="font-bold">{option}</span>
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected || (isConfirmed && isCorrect) ? 'bg-current border-transparent' : 'border-gray-300 dark:border-white/20'}`}>
                             {isConfirmed && isCorrect && <CheckCircle2 size={14} className="text-white" />}
                             {isConfirmed && isSelected && !isCorrect && <XCircle size={14} className="text-white" />}
                             {!isConfirmed && isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                          </div>
                        </button>
                      );
                    })}
                 </div>

                 {isConfirmed && (
                   <motion.div 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="p-6 rounded-2xl bg-black/5 dark:bg-white/5 border-l-4 border-blue-500"
                   >
                     <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">Librarian's Note</p>
                     <p className="text-sm font-medium leading-relaxed italic">{questions[currentIndex].explanation}</p>
                   </motion.div>
                 )}

                 <div className="flex justify-end pt-4">
                   {!isConfirmed ? (
                     <button 
                      onClick={handleConfirm}
                      disabled={selectedOption === null}
                      className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black disabled:opacity-50 shadow-lg shadow-blue-500/20"
                     >
                       CONFIRM CHOICE
                     </button>
                   ) : (
                     <button 
                      onClick={handleNext}
                      className="px-8 py-4 bg-black dark:bg-white dark:text-black text-white rounded-2xl font-black flex items-center gap-2 group"
                     >
                       {currentIndex < questions.length - 1 ? 'NEXT QUESTION' : 'FINISH EXAM'} <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                     </button>
                   )}
                 </div>
              </div>
            </motion.div>
          )}

          {gameState === 'results' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-8 py-12"
             >
                <div className="relative inline-block">
                   <div className="p-10 bg-indigo-600 text-white rounded-[3rem] shadow-2xl">
                     <Trophy size={80} />
                   </div>
                   <motion.div 
                    animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
                    className="absolute -inset-4 border-2 border-dashed border-indigo-500/30 rounded-full"
                   />
                </div>

                <div className="space-y-2">
                  <h1 className="text-5xl font-black dark:text-white">Examination Completed</h1>
                  <p className="text-xl opacity-60 dark:text-gray-400">Your results have been etched into the Chrono-Log.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="p-8 bg-white dark:bg-gray-900 rounded-[2rem] shadow-xl border border-black/5 dark:border-white/5">
                      <div className="text-5xl font-black text-indigo-600 dark:text-indigo-400">{score}/{questions.length}</div>
                      <div className="text-[10px] font-black uppercase tracking-widest opacity-40 dark:text-gray-400 mt-2">Accuracy Score</div>
                   </div>
                   <div className="p-8 bg-white dark:bg-gray-900 rounded-[2rem] shadow-xl border border-black/5 dark:border-white/5">
                      <div className="text-5xl font-black text-green-500 dark:text-green-400">+{score >= 8 ? score * 20 : score * 10}</div>
                      <div className="text-[10px] font-black uppercase tracking-widest opacity-40 dark:text-gray-400 mt-2">Exam XP Earned</div>
                   </div>
                </div>

                <div className="flex gap-4">
                   <button 
                    onClick={() => setGameState('not_started')}
                    className="flex-1 py-5 border-2 border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400 rounded-2xl font-black text-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                   >
                     RETAKE EXAM
                   </button>
                   <Link href="/" className="flex-1 py-5 bg-indigo-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-indigo-500/30 flex items-center justify-center gap-2">
                      EXIT HALL <ArrowLeft size={18} />
                   </Link>
                </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
