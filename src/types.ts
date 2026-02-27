export type RiskLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export interface Ingredient {
  id: string;
  name: string;
  baseRisk: RiskLevel;
  isUnknown?: boolean;
}

export interface ExtractedData {
  frontPackText: string;
  ingredientsText: string;
  nutritionText: string;
  parsedIngredients: string[];
  ocrConfidence: number;
}

export interface AnalysisResult {
  totalRiskScore: number;
  safetyMeterLevel: 'Minimal' | 'Moderate' | 'High' | 'Severe';
  topRisks: string[];
  confidenceScore: number;
  completeness: number;
  resolution: number;
  isRefused: boolean;
  refusalReason?: string;
  ingredients: Ingredient[];
  adiExposure: string;
  novaClassification: number;
  categoryTruth: string;
  populationWarnings: string[];
  regulatorySources: string[];
}

export interface UserProfile {
  bodyWeight: number;
  isChildMode: boolean;
  language: 'en' | 'hi';
}
