import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserStore } from '@/store/userStore';
import { X, Check, Flame, Zap, Brain } from 'lucide-react';
import { GrammarChallenge } from '@/types/grammar';
import { useAudio } from '@/hooks/useAudio';
import era1Content from '../content/era1.json';
import era2Content from '../content/era2.json';
import era3Content from '../content/era3.json';

const allLessons = [
  ...era1Content.map(l => ({ ...l, era: 1 })),
  ...era2Content.map(l => ({ ...l, era: 2 })),
  ...era3Content.map(l => ({ ...l, era: 3 })),
] as (GrammarChallenge & { era: number })[];

// Typewriter effect component
function StreamingText({ text }: { text: string }) {
  const [displayedText, setDisplayedText] = useState('');
  
  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setDisplayedText(text.slice(0, index));
      index++;
      if (index > text.length) clearInterval(interval);
    }, 15);
    return () => clearInterval(interval);
  }, [text]);

  return <p className="leading-relaxed italic border-l-4 border-blue-500 pl-3 py-1">{displayedText}</p>;
}

export function Lesson() {
  const { currentLessonId, setCurrentLesson, addXP, incrementStreak, resetStreak, unlockLevel, setGrade, currentGrade, userXP, activeCodexChallenge, setActiveCodexChallenge } = useUserStore();
  const lesson = activeCodexChallenge || allLessons.find(l => l.id === currentLessonId);
  const { playSound } = useAudio();
  
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [textInput, setTextInput] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [startTime] = useState(Date.now());
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [isLoadingExplanation, setIsLoadingExplanation] = useState(false);
  
  if (!lesson) return null;

  const handleSubmit = () => {
    let correct = false;
    
    if (lesson.type === 'WordBank') {
      correct = selectedOption === lesson.correctAnswer;
    } else if (lesson.type === 'Transformer') {
      correct = textInput.trim().toLowerCase() === lesson.correctAnswer.toLowerCase();
    } else if (lesson.type === 'ErrorSpotter') {
      correct = textInput.trim().toLowerCase() === lesson.correctAnswer.toLowerCase();
    }

    setIsCorrect(correct);
    setIsSubmitted(true);
    setAiExplanation(null);
    
    if (correct) {
      const targetXP = currentGrade < 6 ? 100 : currentGrade < 13 ? 500 : 1000;
      if (userXP + 10 >= targetXP && userXP < targetXP) {
        playSound('levelup');
      } else {
        playSound('correct');
      }
      addXP(10);
      incrementStreak();
    } else {
      playSound('wrong');
      resetStreak();
    }

    const duration = Math.floor((Date.now() - startTime) / 1000);
    const timeStr = `${Math.floor(duration / 60)}m ${duration % 60}s`;
    
    if (!activeCodexChallenge) {
      useUserStore.getState().addHistory({
        id: lesson.id,
        topic: lesson.prompt,
        result: correct ? 'Perfect' : 'Needs Review',
        time: timeStr,
        timestamp: Date.now()
      });
    }
  };

  const handleConsultProfessor = async () => {
    if (isLoadingExplanation || aiExplanation) return;
    
    setIsLoadingExplanation(true);
    try {
      let userAnswerStr = selectedOption || textInput || '[No answer]';
      const response = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          era: currentGrade >= 13 ? 3 : (currentGrade < 6 ? 1 : 2),
          question: lesson.prompt,
          userAnswer: userAnswerStr,
          correctAnswer: lesson.correctAnswer
        }),
      });
      
      const data = await response.json();
      if (data.explanation) {
        setAiExplanation(data.explanation);
      } else {
        setAiExplanation("The archives are inaccessible. Error: " + (data.error || 'Unknown disturbance.'));
      }
    } catch (e) {
      console.error(e);
      setAiExplanation("A temporal rift has blocked the archives. Please try again.");
    } finally {
      setIsLoadingExplanation(false);
    }
  };

  const handleExit = () => {
    playSound('click');
    if (activeCodexChallenge) {
      setActiveCodexChallenge(null);
    } else {
      setCurrentLesson(null);
    }
  };

  const handleNext = () => {
    playSound('click');
    if (activeCodexChallenge) {
      setActiveCodexChallenge(null);
      return;
    }
    
    if (isCorrect) {
      const currentIndex = allLessons.findIndex(l => l.id === lesson.id);
      if (currentIndex !== -1 && currentIndex < allLessons.length - 1) {
        const nextLesson = allLessons[currentIndex + 1];
        unlockLevel(nextLesson.id);
        
        if (nextLesson.era > lesson.era) {
          if (nextLesson.era === 2) setGrade(6);
          if (nextLesson.era === 3) setGrade(13);
        }
      }
    }
    setCurrentLesson(null);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] max-w-2xl mx-auto p-4 w-full pt-10">
      <div className="w-full flex justify-between items-center mb-8">
        <button onClick={handleExit} className="p-2 hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition-colors">
          <X size={24} />
        </button>
        <div className="w-full bg-black/10 dark:bg-white/10 h-4 rounded-full mx-4 overflow-hidden relative">
          <motion.div 
            initial={{ width: '0%' }}
            animate={{ width: isCorrect ? '100%' : '50%' }}
            className="absolute top-0 left-0 bottom-0 bg-green-500 rounded-full transition-all"
          />
        </div>
      </div>

      <h2 className="text-3xl font-bold mb-8">{lesson.prompt}</h2>

      <div className="flex-1 overflow-y-auto">
        {lesson.type === 'WordBank' && (
          <div className="space-y-8">
            <div className="text-2xl font-medium p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-black/10 dark:border-white/10">
              {(lesson as any).sentence.split('___').map((part: string, i: number, arr: string[]) => (
                <span key={i}>
                  {part}
                  {i < arr.length - 1 && (
                    <span className="inline-block border-b-2 border-black dark:border-white w-20 mx-2 pb-1 text-center text-blue-500 min-h-[32px]">
                      {selectedOption}
                    </span>
                  )}
                </span>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4">
              {lesson.options.map((opt: string) => (
                <button
                  key={opt}
                  onClick={() => {
                    if (!isSubmitted) {
                      playSound('click');
                      setSelectedOption(opt);
                    }
                  }}
                  disabled={isSubmitted}
                  className={`
                    p-6 text-xl rounded-xl border-x-2 border-t-2 border-b-[6px] transition-all font-bold active:border-b-2 active:translate-y-1
                    ${selectedOption === opt ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/40 shadow-inner' : 'border-black/10 dark:border-white/10 hover:border-blue-300 hover:bg-black/5 dark:hover:bg-white/5'}
                    ${isSubmitted && selectedOption === opt && isCorrect ? 'bg-green-100 border-green-500 text-green-700 dark:bg-green-900/40 dark:text-green-300' : ''}
                    ${isSubmitted && selectedOption === opt && !isCorrect ? 'bg-red-100 border-red-500 text-red-700 dark:bg-red-900/40 dark:text-red-300' : ''}
                  `}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {lesson.type === 'Transformer' && (
          <div className="space-y-8">
            <div className="text-xl p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-black/10 dark:border-white/10">
              Original: <span className="font-semibold">{(lesson as any).originalSentence || (lesson as any).original || ''}</span>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Target: {(lesson as any).targetStructure || (lesson as any).target || ''}</p>
            </div>
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              disabled={isSubmitted}
              className="w-full p-4 h-32 text-xl rounded-2xl border-2 border-black/10 dark:border-white/10 bg-transparent focus:border-purple-500 focus:outline-none transition-all resize-none shadow-inner"
              placeholder="Type your answer here..."
            />
          </div>
        )}

        {lesson.type === 'ErrorSpotter' && (
          <div className="space-y-8">
            <div className="text-2xl p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-black/10 dark:border-white/10 font-semibold text-center">
              {(lesson as any).sentenceWithErrors || (lesson as any).sentence || ''}
            </div>
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              disabled={isSubmitted}
              className="w-full p-4 text-xl rounded-2xl border-2 border-black/10 dark:border-white/10 bg-transparent focus:border-green-500 focus:outline-none transition-all text-center"
              placeholder="Type the corrected word or missing punctuation..."
            />
          </div>
        )}
      </div>

      <div className="mt-8 border-t border-black/10 dark:border-white/10 pt-6">
        <AnimatePresence>
          {isSubmitted && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-6 p-4 rounded-xl ${isCorrect ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200'}`}
            >
              <h3 className="font-bold text-xl flex items-center justify-between mb-2">
                <span className="flex items-center gap-2">
                  {isCorrect ? <><Check className="w-6 h-6"/> Excellent! <Flame className="w-5 h-5 text-orange-500" /> +10 XP</> : <><X className="w-6 h-6"/> Incorrect</>}
                </span>
                {!isCorrect && (
                   <button 
                    onClick={handleConsultProfessor}
                    disabled={isLoadingExplanation || !!aiExplanation}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm px-4 py-2 rounded-xl flex items-center gap-2 font-bold transition-all disabled:opacity-50 shadow-md active:translate-y-0.5"
                  >
                    <Brain size={16} /> Consult Professor
                  </button>
                )}
              </h3>
              <p>{lesson.explanation}</p>
              {!isCorrect && <p className="mt-2 font-semibold">Correct answer: {lesson.correctAnswer}</p>}
              
              {/* AI Explanation Area */}
              {(isLoadingExplanation || aiExplanation) && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 p-4 rounded-lg bg-white/50 dark:bg-black/20 border border-indigo-200 dark:border-indigo-900 text-sm font-medium"
                >
                  {isLoadingExplanation ? (
                    <div className="flex items-center gap-3 text-indigo-700 dark:text-indigo-300">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                      >
                        <Brain className="w-6 h-6" />
                      </motion.div>
                      <span className="shimmer-text">OpenRouter (Claude) is analyzing the semantic structure...</span>
                    </div>
                  ) : (
                    aiExplanation && <StreamingText text={aiExplanation} />
                  )}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        
        <button
          onClick={isSubmitted ? handleNext : handleSubmit}
          disabled={!isSubmitted && ((lesson.type === 'WordBank' && !selectedOption) || (lesson.type !== 'WordBank' && !textInput))}
          className={`w-full py-4 text-xl font-extrabold uppercase tracking-widest rounded-2xl text-white transition-all 
            ${isSubmitted && isCorrect ? 'bg-green-500 hover:bg-green-600 shadow-[0_6px_0_0_#15803d] active:shadow-[0_0px_0_0_#15803d] active:translate-y-[6px]' : ''}
            ${isSubmitted && !isCorrect ? 'bg-red-500 hover:bg-red-600 shadow-[0_6px_0_0_#b91c1c] active:shadow-[0_0px_0_0_#b91c1c] active:translate-y-[6px]' : ''}
            ${!isSubmitted ? 'bg-blue-500 hover:bg-blue-600 shadow-[0_6px_0_0_#1d4ed8] active:shadow-[0_0px_0_0_#1d4ed8] active:translate-y-[6px] disabled:bg-gray-400 disabled:shadow-[0_6px_0_0_#9ca3af] disabled:active:translate-y-0 text-white' : ''}
          `}
        >
          {isSubmitted ? 'Continue' : 'Check'}
        </button>
      </div>
    </div>
  );
}
