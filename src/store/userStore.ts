import { create } from 'zustand';

interface UserState {
  userXP: number;
  userLevel: number;
  currentStreak: number;
  unlockedLevels: string[];
  currentGrade: number; // 1-5 = Era 1, 6-12 = Era 2, 13+ = Era 3
  currentLessonId: string | null;
  setCurrentLesson: (lessonId: string | null) => void;
  addXP: (amount: number) => void;
  incrementStreak: () => void;
  resetStreak: () => void;
  unlockLevel: (levelId: string) => void;
  setGrade: (grade: number) => void;
  isCodexOpen: boolean;
  setIsCodexOpen: (open: boolean) => void;
  activeCodexChallenge: any | null;
  setActiveCodexChallenge: (challenge: any | null) => void;
  isVoiceLabOpen: boolean;
  setIsVoiceLabOpen: (open: boolean) => void;
  voiceHistory: { original: string; corrected: string; explanation: string }[];
  addVoiceHistory: (item: { original: string; corrected: string; explanation: string }) => void;
  isChronoLogOpen: boolean;
  setIsChronoLogOpen: (open: boolean) => void;
  history: { id: string; topic: string; result: 'Perfect' | 'Needs Review'; time: string; timestamp: number }[];
  addHistory: (item: { id: string; topic: string; result: 'Perfect' | 'Needs Review'; time: string; timestamp: number }) => void;
  certifications: { id: string; title: string; score: number; date: string; timestamp: number }[];
  addCertification: (cert: { id: string; title: string; score: number; date: string; timestamp: number }) => void;
  isLeaderboardOpen: boolean;
  setIsLeaderboardOpen: (open: boolean) => void;
  userName: string;
  userAvatar?: string;
  isNavOpen: boolean;
  setIsNavOpen: (open: boolean) => void;
  // Chat Cortex
  isChatOpen: boolean;
  setIsChatOpen: (open: boolean) => void;
  chatHistory: { role: 'user' | 'assistant'; content: string }[];
  addChatMessage: (msg: { role: 'user' | 'assistant'; content: string }) => void;
  clearChatHistory: () => void;
  chatEngine: 'groq' | 'openrouter';
  setChatEngine: (engine: 'groq' | 'openrouter') => void;
  // Settings
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
  settings: {
    difficulty: 1 | 2 | 3;
    autoAdaptive: boolean;
    voiceStrictness: number;
    autoSpeak: boolean;
    fontSelection: 'Standard' | 'Dyslexic' | 'Serif' | 'Mono';
    darkMode: boolean;
    sfxVolume: number;
    musicVolume: number;
  };
  updateSettings: (settings: Partial<UserState['settings']>) => void;
  isLensOpen: boolean;
  setIsLensOpen: (open: boolean) => void;
  resetProgress: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  userXP: 0,
  userLevel: 1,
  currentStreak: 0,
  unlockedLevels: ['e1_1'],
  currentGrade: 1, // Default to 1st grade
  currentLessonId: null,
  setCurrentLesson: (lessonId) => set({ currentLessonId: lessonId }),
  addXP: (amount) => set((state) => {
    const newXP = state.userXP + amount;
    const newLevel = Math.floor(newXP / 100) + 1;
    
    // Time Warp thresholds:
    // Era 1 (Grades 1-5): 0-499 XP
    // Era 2 (Grades 6-12): 500-1499 XP
    // Era 3 (College+): 1500+ XP
    
    let newGrade = state.currentGrade;
    if (newXP >= 1500 && state.currentGrade < 13) {
      newGrade = 13; // Jump to Era 3
    } else if (newXP >= 500 && state.currentGrade < 6) {
      newGrade = 6; // Jump to Era 2
    }

    return { 
      userXP: newXP, 
      userLevel: newLevel,
      currentGrade: newGrade 
    };
  }),
  incrementStreak: () => set((state) => ({ currentStreak: state.currentStreak + 1 })),
  resetStreak: () => set({ currentStreak: 0 }),
  unlockLevel: (levelId) => set((state) => ({
    unlockedLevels: state.unlockedLevels.includes(levelId) ? state.unlockedLevels : [...state.unlockedLevels, levelId]
  })),
  setGrade: (grade) => set({ currentGrade: grade    }),
  isCodexOpen: false,
  setIsCodexOpen: (open) => set({ isCodexOpen: open }),
  activeCodexChallenge: null,
  setActiveCodexChallenge: (challenge) => set({ activeCodexChallenge: challenge }),
  isVoiceLabOpen: false,
  setIsVoiceLabOpen: (open) => set({ isVoiceLabOpen: open }),
  voiceHistory: [],
  addVoiceHistory: (item) => set((state) => ({
    voiceHistory: [item, ...state.voiceHistory].slice(0, 3)
  })),
  isChronoLogOpen: false,
  setIsChronoLogOpen: (open) => set({ isChronoLogOpen: open }),
  history: [
    { id: 'h1', topic: 'Subject-Verb Agreement', result: 'Perfect', time: '0m 45s', timestamp: Date.now() - 1000 * 60 * 5 },
    { id: 'h2', topic: 'Irregular Verbs', result: 'Needs Review', time: '1m 20s', timestamp: Date.now() - 1000 * 60 * 15 },
    { id: 'h3', topic: 'Oxford Commas', result: 'Perfect', time: '0m 30s', timestamp: Date.now() - 1000 * 60 * 30 },
  ],
  addHistory: (item) => set((state) => ({
    history: [item, ...state.history].slice(0, 10)
  })),
  certifications: [],
  addCertification: (cert) => set((state) => ({
    certifications: [cert, ...state.certifications]
  })),
  isLeaderboardOpen: false,
  setIsLeaderboardOpen: (open) => set({ isLeaderboardOpen: open }),
  userName: 'You',
  isNavOpen: false,
  setIsNavOpen: (open) => set({ isNavOpen: open }),
  isChatOpen: false,
  setIsChatOpen: (open) => set({ isChatOpen: open }),
  chatHistory: [],
  addChatMessage: (msg) => set((state) => ({ chatHistory: [...state.chatHistory, msg] })),
  clearChatHistory: () => set({ chatHistory: [] }),
  chatEngine: 'openrouter', // Default to OpenRouter as requested
  setChatEngine: (chatEngine) => set({ chatEngine }),
  isSettingsOpen: false,
  setIsSettingsOpen: (open) => set({ isSettingsOpen: open }),
  settings: {
    difficulty: 1,
    autoAdaptive: true,
    voiceStrictness: 70,
    autoSpeak: true,
    fontSelection: 'Standard',
    darkMode: false,
    sfxVolume: 80,
    musicVolume: 50,
  },
  updateSettings: (newSettings) => set((state) => ({
    settings: { ...state.settings, ...newSettings }
  })),
  isLensOpen: false,
  setIsLensOpen: (open) => set({ isLensOpen: open }),
  resetProgress: () => set({
    userXP: 0,
    userLevel: 1,
    currentStreak: 0,
    unlockedLevels: ['e1_1'],
    currentGrade: 1,
    history: [],
    voiceHistory: [],
  }),
}));
