
export type ExerciseType = 'TRANSLATE' | 'MULTIPLE_CHOICE' | 'SPEAKING' | 'LISTENING' | 'ROLEPLAY';
export type UserGoal = 'TRAVEL' | 'WORK' | 'EXAMS' | 'CONVERSATION' | 'PERSONAL';
export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
export type SupportedLanguage = 
  | 'es' | 'fr' | 'pt' | 'de' | 'it' | 'zh' | 'ja' 
  | 'hi' | 'ar' | 'ru' | 'bn' | 'ur' | 'id' | 'ko' 
  | 'vi' | 'tr' | 'te' | 'mr' | 'ta' | 'tl'
  | 'pl' | 'nl' | 'sv' | 'el' | 'he' | 'th';

export interface User {
  username: string;
  stats: UserStats;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  isUnlocked: boolean;
  progress: number;
  target: number;
}

export interface ActivityDay {
  date: string; // YYYY-MM-DD
  xp: number;
}

export interface Outfit {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: 'gems' | 'gcd';
  imagePrompt: string;
  unlocked: boolean;
}

export interface Exercise {
  id: string;
  type: ExerciseType;
  question: string;
  options?: string[];
  correctAnswer: string;
  audioText?: string;
  explanation?: string;
}

export interface Mission {
  id: string;
  title: string;
  reward: number;
  target: number;
  current: number;
  completed: boolean;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  exercises: Exercise[];
  status: 'locked' | 'available' | 'completed';
  type?: 'regular' | 'boss' | 'story';
}

export interface SavedPhrase {
  id: string;
  original: string;
  translation: string;
  timestamp: number;
  masteryLevel: number;
}

export interface UserStats {
  hearts: number;
  streak: number;
  streakFreezes: number;
  gems: number;
  xp: number;
  dailyXP: number;
  dailyGoal: number;
  completedLessons: string[];
  savedPhrases: SavedPhrase[];
  goal?: UserGoal;
  level?: CEFRLevel;
  nativeLanguage: SupportedLanguage;
  missions: Mission[];
  walletAddress?: string;
  gcdBalance: number;
  achievements: Achievement[];
  activityHistory: ActivityDay[];
  currentOutfit: string;
  unlockedOutfits: string[];
}

export interface PronunciationFeedback {
  score: number;
  accuracy: 'poor' | 'fair' | 'good' | 'excellent';
  generalFeedback: string;
  wordAnalysis: {
    word: string;
    isCorrect: boolean;
    feedback?: string;
  }[];
}
