export type RiskLevel = 'Low' | 'Moderate' | 'High';

export interface AnalysisResult {
  product: string;
  brand?: string;
  overallRisk: RiskLevel;
  whyThisRating: string[];
  good: string[];
  concerns: string[];
  forDailyUse: string;
  confidence: number;
  ingredients?: string;
  isFood: boolean;
  notFoodMessage?: string;
}

export type Language = 
  | 'en' | 'hi' | 'hinglish' 
  | 'bn' | 'te' | 'mr' | 'ta' 
  | 'gu' | 'ur' | 'kn' | 'or' 
  | 'ml' | 'pa';

export interface UserPreferences {
  style?: string; // "Answer in 1 line", "Explain in detail", etc.
  language: Language;
}

export interface MemoryItem {
  id: string;
  timestamp: number;
  result: AnalysisResult;
}
