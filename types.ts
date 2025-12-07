
export type ViewState = 'dashboard' | 'syllabus' | 'study' | 'quiz' | 'mentor' | 'flashcards';

export interface SyllabusNode {
  id: string;
  title: string;
  children?: SyllabusNode[];
  isTopic?: boolean;
}

export interface StoredFlashcard {
  id: string;
  term: string;
  definition: string;
  nextReviewDate: number; // timestamp
  interval: number; // in days
  easeFactor: number;
  reps: number;
}

export interface UserProgress {
  completedTopics: string[]; // array of topic IDs
  streak: number;
  lastLoginDate: string; // ISO date string
  totalStudyMinutes: number;
  dailyGoalMinutes: number;
  dailyStudyMinutes: number;
  studyHistory: Record<string, number>; // date (YYYY-MM-DD) -> minutes studied
  lastStudiedTopic?: string;
  quizzesTaken: number;
  averageScore: number;
  name: string;
  targetYear: number;
  flashcards: Record<string, StoredFlashcard[]>; // Key is Topic Title
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface QuizResult {
  score: number;
  total: number;
  date: string;
  topicId: string;
}

export interface Flashcard {
  term: string;
  definition: string;
}

export enum Difficulty {
  EASY = 'Easy',
  MEDIUM = 'Medium',
  HARD = 'Hard'
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}
