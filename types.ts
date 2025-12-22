// Data Models matching the user's JSON structure

export type TestMode = 'dimension' | 'score' | 'category';

export interface TestConfig {
  testId: string;
  title: string;
  description: string;
  coverImage: string;
  mode: TestMode;
  totalQuestions: number;
}

export interface Dimension {
  code: string; // e.g., "EI"
  name: string; // e.g., "Extrovert vs Introvert"
  left: string; // e.g., "E"
  right: string; // e.g., "I"
}

export interface Option {
  content: string;
  value: string; // The dimension key (e.g., 'E') or simply a value
  score: number; // The weight
}

export interface Question {
  id: number;
  text: string;
  options: Option[];
}

export interface ResultRule {
  resultId: string; // e.g., "INTJ" or "score_high"
  minScore?: number; // Only for 'score' mode
  maxScore?: number; // Only for 'score' mode
  title: string;
  summary: string;
  details?: string;
  imageUrl?: string;
}

export interface AssessmentData {
  testConfig: TestConfig;
  dimensions?: Dimension[];
  questions: Question[];
  resultRules: ResultRule[];
}

// Internal State Types
export type Scores = Record<string, number>; // { "E": 5, "I": 2 }
