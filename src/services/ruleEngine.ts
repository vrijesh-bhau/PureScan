import { ExtractedData, AnalysisResult, UserProfile, Ingredient } from '../types';
import { resolveIngredient } from './dataService';

// Deterministic Rule Engine
// Zero hallucination. Analysis only.

export const calculateRiskScore = (ingredients: Ingredient[], userProfile: UserProfile): number => {
  // Total Risk Score = Max(Base Risk) + Interaction Penalty + Macro Penalty + NOVA Penalty + ADI Exceed Penalty
  
  // 1. Max Base Risk
  const maxBaseRisk = ingredients.reduce((max, ing) => Math.max(max, ing.baseRisk), 0);
  
  // PLACEHOLDERS FOR PENALTIES (derived from static datasets)
  const interactionPenalty = 0; // e.g., Ascorbic Acid + Sodium Benzoate
  const macroPenalty = 0; // e.g., Sugar > WHO limits
  const novaPenalty = 0; // e.g., NOVA 4 presence
  const adiExceedPenalty = 0; // e.g., ADI > limit based on bodyWeight
  
  return maxBaseRisk + interactionPenalty + macroPenalty + novaPenalty + adiExceedPenalty;
};

export const evaluateSafetyMeter = (score: number): 'Minimal' | 'Moderate' | 'High' | 'Severe' => {
  if (score <= 1) return 'Minimal';
  if (score <= 4) return 'Moderate';
  if (score <= 9) return 'High';
  return 'Severe';
};

export const calculateConfidence = (extractedData: ExtractedData, resolvedCount: number): {
  confidence: number;
  completeness: number;
  resolution: number;
} => {
  // OCR clarity 30%
  const ocrClarity = extractedData.ocrConfidence; // 0-100
  
  // Ingredient resolution 50%
  const totalParsed = extractedData.parsedIngredients.length;
  const resolution = totalParsed > 0 ? (resolvedCount / totalParsed) * 100 : 0;
  
  // Data completeness 20%
  let zonesDetected = 0;
  if (extractedData.frontPackText) zonesDetected++;
  if (extractedData.ingredientsText) zonesDetected++;
  if (extractedData.nutritionText) zonesDetected++;
  const completeness = (zonesDetected / 3) * 100;
  
  const confidence = (ocrClarity * 0.30) + (resolution * 0.50) + (completeness * 0.20);
  
  return { confidence, completeness, resolution };
};

export const runAnalysis = (extractedData: ExtractedData, userProfile: UserProfile): AnalysisResult => {
  // 1. Resolve ingredients
  const resolvedIngredients = extractedData.parsedIngredients.map(resolveIngredient);
  const unknownCount = resolvedIngredients.filter(i => i.isUnknown).length;
  const resolvedCount = resolvedIngredients.length - unknownCount;
  
  // 2. Calculate Confidence
  const { confidence, completeness, resolution } = calculateConfidence(extractedData, resolvedCount);
  
  // 3. Refusal Logic
  // Block result if: Confidence < 65%, Completeness < 66%, Resolution < 50%
  if (confidence < 65 || completeness < 66 || resolution < 50) {
    return {
      totalRiskScore: 0,
      safetyMeterLevel: 'Minimal',
      topRisks: [],
      confidenceScore: confidence,
      completeness,
      resolution,
      isRefused: true,
      refusalReason: 'Data incomplete or unreadable. Please rescan in better lighting.',
      ingredients: [],
      adiExposure: '',
      novaClassification: 0,
      categoryTruth: '',
      populationWarnings: [],
      regulatorySources: []
    };
  }
  
  // 4. Unknown Ingredient Policy
  // Allow result if unknown <= 2 and resolution >= 70%. Otherwise force rescan.
  if (unknownCount > 2 || resolution < 70) {
     return {
      totalRiskScore: 0,
      safetyMeterLevel: 'Minimal',
      topRisks: [],
      confidenceScore: confidence,
      completeness,
      resolution,
      isRefused: true,
      refusalReason: 'Too many unknown ingredients. Please ensure the ingredient list is clear.',
      ingredients: [],
      adiExposure: '',
      novaClassification: 0,
      categoryTruth: '',
      populationWarnings: [],
      regulatorySources: []
    };
  }
  
  // 5. Calculate Risk
  const totalRiskScore = calculateRiskScore(resolvedIngredients, userProfile);
  const safetyMeterLevel = evaluateSafetyMeter(totalRiskScore);
  
  // PLACEHOLDERS for Deep Mode data
  const topRisks = ['Placeholder Risk 1', 'Placeholder Risk 2'];
  const adiExposure = 'Placeholder ADI Exposure';
  const novaClassification = 3; // Placeholder
  const categoryTruth = 'Placeholder Category Truth';
  const populationWarnings = ['Placeholder Warning 1'];
  const regulatorySources = ['EU EFSA', 'US FDA'];
  
  return {
    totalRiskScore,
    safetyMeterLevel,
    topRisks,
    confidenceScore: confidence,
    completeness,
    resolution,
    isRefused: false,
    ingredients: resolvedIngredients,
    adiExposure,
    novaClassification,
    categoryTruth,
    populationWarnings,
    regulatorySources
  };
};
