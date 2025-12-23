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
  code: string; // e.g., "R", "I"
  name: string; // e.g., "实用型 (R)"
  left?: string; // Not used in category mode
  right?: string; // Not used in category mode
}

export interface Option {
  content: string;
  value: string; // The dimension key (e.g., 'R')
  score: number; // 1 for Yes, 0 for No
}

export interface Question {
  id: number;
  text: string;
  options: Option[];
}

export interface ResultRule {
  resultId: string; 
  minScore?: number; 
  maxScore?: number; 
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
export type Scores = Record<string, number>; // { "R": 10, "I": 5, "A": 12 ... }