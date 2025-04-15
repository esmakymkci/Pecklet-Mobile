export interface Word {
  id: string;
  term: string;
  definition: string;
  example?: string;
  pronunciation?: string;
  imageUrl?: string;
  learned: boolean;
  createdAt: Date;
  lastReviewed?: Date;
}

export interface WordList {
  id: string;
  title: string;
  description?: string;
  language: string;
  targetLanguage: string;
  category?: string;
  tags?: string[];
  words: Word[];
  progress: number;
  totalWords: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Quiz {
  id: string;
  title: string;
  description?: string;
  wordListId?: string;
  questions: QuizQuestion[];
  score?: number;
  totalQuestions: number;
  timeLimit?: number;
  createdAt: Date;
  completedAt?: Date;
}

export interface QuizQuestion {
  id: string;
  type: 'multiple-choice' | 'true-false' | 'matching' | 'fill-blank' | 'term';
  question: string;
  options: string[];
  correctAnswer: string;
  userAnswer?: string;
  isCorrect?: boolean;
  points: number;
  timeTaken: number;
}

export interface UserStats {
  listsCreated: number;
  wordsAdded: number;
  wordsLearned: number;
  quizzesTaken: number;
  averageScore: number;
  streak: number;
  lastActive: Date;
  totalXp: number;
  level: number;
}

export interface UserSettings {
  theme: 'light' | 'dark';
  notifications: boolean;
  soundEffects: boolean;
  defaultSourceLanguage: string;
  defaultTargetLanguage: string;
  dailyGoal: number;
}

export interface LearningLevel {
  id: number;
  title: string;
  description: string;
  wordCount: number;
  isUnlocked: boolean;
  isCompleted: boolean;
  progress: number;
}

export interface Story {
  id: string;
  title: string;
  description: string;
  content: string;
  imageUrl: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  language: string;
  duration: number;
  isPremium: boolean;
}

export interface Competition {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  participants: number;
  duration: number;
  startDate: Date;
  endDate: Date;
  wordCount: number;
  isActive: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  profilePicture?: string;
  createdAt?: Date;
  lastLogin?: Date;
  isPremium?: boolean;
  preferences?: {
    nativeLanguage?: string;
    learningLanguages?: string[];
  };
}