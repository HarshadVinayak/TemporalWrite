'use client';

import { Fragment, useState } from 'react';
import { Dialog, Transition, Switch } from '@headlessui/react';
import { useUserStore } from '@/store/userStore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Settings, Cpu, Mic, Type, 
  Trash2, Download, Zap, Volume2, 
  Sliders, BookOpen, Clock, Info
} from 'lucide-react';
import { StudyArchitect } from '@/components/StudyArchitect';

export function SettingsModal() {
  const { 
    isSettingsOpen, setIsSettingsOpen, currentGrade, 
    settings, updateSettings, resetProgress, addXP 
  } = useUserStore();
  
  const [activeTab, setActiveTab] = useState<'general' | 'study'>('general');

  const currentEra = currentGrade < 6 ? 1 : currentGrade < 13 ? 2 : 3;
  
  const themeColors = {
    1: { border: 'border-amber-500/30', glow: 'shadow-amber-500/20', accent: 'bg-amber-600', text: 'text-amber-600' },
    2: { border: 'border-blue-500/30', glow: 'shadow-blue-500/20', accent: 'bg-blue-600', text: 'text-blue-600' },
    3: { border: 'border-cyan-500/30', glow: 'shadow-cyan-500/20', accent: 'bg-cyan-500', text: 'text-cyan-400' },
  };
  
  const currentTheme = themeColors[currentEra as keyof typeof themeColors];
 
  const handleDifficultyChange = (val: 1 | 2 | 3) => {
    updateSettings({ difficulty: val });
    if (val === 1) useUserStore.getState().setGrade(1);
    else if (val === 2) useUserStore.getState().addXP(500 - useUserStore.getState().userXP);
    else if (val === 3) useUserStore.getState().addXP(1500 - useUserStore.getState().userXP);
  };

  const fonts = ['Standard', 'Dyslexic', 'Serif', 'Mono'];

  if (!isSettingsOpen) return null;

  return (
    <Transition.Root show={isSettingsOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[100]" onClose={() => setIsSettingsOpen(false)}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className={`relative transform overflow-hidden rounded-[2rem] bg-white dark:bg-[#050505] p-8 text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-3xl border-4 ${currentTheme.border} ${currentTheme.glow}`}>
                
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${currentTheme.accent} text-white`}>
                      <Settings size={24} />
                    </div>
                    <div>
                      <Dialog.Title as="h3" className="text-2xl font-black tracking-tight dark:text-white">
                        The Chronos Settings
                      </Dialog.Title>
                      <p className="text-sm opacity-60">Calibrate your temporal journey</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsSettingsOpen(false)}
                    className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* Tab Switcher */}
                <div className="flex gap-4 mb-8 border-b dark:border-white/5 pb-4">
                  <button 
                    onClick={() => setActiveTab('general')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all ${activeTab === 'general' ? `${currentTheme.accent} text-white shadow-lg` : 'opacity-40 hover:opacity-100 dark:text-white'}`}
                  >
                    <Sliders size={18} /> General
                  </button>
                  <button 
                    onClick={() => setActiveTab('study')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all ${activeTab === 'study' ? `${currentTheme.accent} text-white shadow-lg` : 'opacity-40 hover:opacity-100 dark:text-white'}`}
                  >
                    <BookOpen size={18} /> Scholar's Sync
                  </button>
                </div>

                <div className="min-h-[400px]">
                  <AnimatePresence mode="wait">
                    {activeTab === 'general' ? (
                      <motion.div 
                        key="general"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-8"
                      >
                        {/* Section A: Calibration */}
                        <div className="space-y-6">
                          <h4 className="flex items-center gap-2 font-bold text-sm uppercase tracking-widest opacity-50 dark:text-white">
                            <Cpu size={16} /> Calibration
                          </h4>
                          <div className="space-y-4">
                            <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
                              <label className="text-sm font-bold block mb-3 dark:text-white">Difficulty Level</label>
                              <div className="flex gap-2">
                                {[1, 2, 3].map((d) => (
                                  <button
                                    key={d}
                                    onClick={() => handleDifficultyChange(d as 1 | 2 | 3)}
                                    className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${settings.difficulty === d ? `${currentTheme.accent} text-white shadow-lg` : 'bg-black/5 dark:bg-white/10 dark:text-white opacity-50 hover:opacity-100'}`}
                                  >
                                    ERA {d}
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
                              <div>
                                <p className="text-sm font-bold dark:text-white">Auto-Adaptive AI</p>
                                <p className="text-[10px] opacity-60 dark:text-white">Difficulty shifts with performance</p>
                              </div>
                              <Switch
                                checked={settings.autoAdaptive}
                                onChange={(val) => updateSettings({ autoAdaptive: val })}
                                className={`${settings.autoAdaptive ? currentTheme.accent : 'bg-gray-300 dark:bg-gray-700'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                              >
                                <span className={`${settings.autoAdaptive ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
                              </Switch>
                            </div>
                          </div>
                        </div>

                        {/* Section B: Voice Lab */}
                        <div className="space-y-6">
                          <h4 className="flex items-center gap-2 font-bold text-sm uppercase tracking-widest opacity-50 dark:text-white">
                            <Mic size={16} /> Voice Lab
                          </h4>
                          <div className="space-y-4">
                            <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
                              <div className="flex justify-between mb-2">
                                <label className="text-sm font-bold dark:text-white">Mic Strictness</label>
                                <span className={`text-xs font-bold ${currentTheme.text}`}>{settings.voiceStrictness}%</span>
                              </div>
                              <input
                                type="range" min="0" max="100" value={settings.voiceStrictness}
                                onChange={(e) => updateSettings({ voiceStrictness: parseInt(e.target.value) })}
                                className="w-full h-2 rounded-lg bg-gray-200 dark:bg-gray-700 appearance-none cursor-pointer accent-blue-500"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Section C: Appearance */}
                        <div className="space-y-6">
                          <h4 className="flex items-center gap-2 font-bold text-sm uppercase tracking-widest opacity-50 dark:text-white">
                            <Type size={16} /> Appearance
                          </h4>
                          <div className="space-y-4">
                            <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
                              <label className="text-sm font-bold block mb-3 dark:text-white">Font Identity</label>
                              <select
                                value={settings.fontSelection}
                                onChange={(e) => updateSettings({ fontSelection: e.target.value as any })}
                                className="w-full bg-white dark:bg-[#111] border-2 border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none dark:text-white"
                              >
                                {fonts.map(f => (
                                  <option key={f} value={f}>{f}</option>
                                ))}
                              </select>
                            </div>
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
                              <p className="text-sm font-bold dark:text-white">Dark Mode</p>
                              <Switch
                                checked={settings.darkMode}
                                onChange={(val) => updateSettings({ darkMode: val })}
                                className={`${settings.darkMode ? currentTheme.accent : 'bg-gray-300 dark:bg-gray-700'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                              >
                                <span className={`${settings.darkMode ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
                              </Switch>
                            </div>
                          </div>
                        </div>

                        {/* Section D: Operations */}
                        <div className="space-y-6">
                          <h4 className="flex items-center gap-2 font-bold text-sm uppercase tracking-widest opacity-50 text-red-500">
                            <Zap size={16} /> Operations
                          </h4>
                          <div className="space-y-4">
                            <button 
                              onClick={() => { resetProgress(); setIsSettingsOpen(false); }}
                              className="w-full p-4 rounded-2xl bg-red-500 text-white font-bold transition-transform hover:scale-[1.02] active:scale-[0.98]"
                            >
                              Reset All Progress
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div 
                        key="study"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                      >
                        <StudyArchitect />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="mt-10 pt-6 border-t border-black/5 dark:border-white/5 flex items-center justify-between opacity-40 italic text-[10px] dark:text-white">
                  <p>TemporalWrite v1.0.4 | Engine: Chronos AI</p>
                  <p>© 2026 Temporal Write Labs</p>
                </div>
                
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
