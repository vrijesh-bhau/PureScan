import { Ingredient } from '../types';

// PLACEHOLDER FOR DATA CONNECTION
// In production, these would be fetched from static JSON files (e.g., via fetch('/data/adi_registry.json'))
// or loaded directly from IndexedDB.

export const fetchStaticDatasets = async () => {
  // Simulate network fetch for static datasets
  return {
    adiRegistry: [],
    bannedSubstances: [],
    warningColours: [],
    interactionRules: [],
    sugarLimits: [],
    novaRules: [],
    ingredientAlias: [],
    allergenLists: [],
    populationWarnings: [],
    categoryLogic: [],
  };
};

export const resolveIngredient = (rawName: string): Ingredient => {
  // PLACEHOLDER: Alias resolution flow
  // 1. Exact Dictionary Match
  // 2. E-Number & Code Extraction
  // 3. Synonym & Translation Mapping
  // 4. Fuzzy Matching
  
  // For demo purposes, we simulate a successful resolution for common ingredients
  // to allow the UI to render without always triggering the refusal logic.
  const knownIngredients: Record<string, number> = {
    'Sugar': 2,
    'Water': 0,
    'Citric Acid': 1,
    'E211': 6 // Sodium Benzoate (High Risk)
  };

  const baseRisk = knownIngredients[rawName] !== undefined ? knownIngredients[rawName] : 0;
  const isUnknown = knownIngredients[rawName] === undefined;

  return {
    id: `ing-${rawName.toLowerCase().replace(/\s+/g, '-')}`,
    name: rawName,
    baseRisk: baseRisk as any,
    isUnknown,
  };
};
