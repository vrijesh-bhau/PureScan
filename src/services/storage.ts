import { UserPreferences, MemoryItem } from '../types';

const PREFS_KEY = 'foodsafe_user_prefs';
const MEMORY_KEY = 'foodsafe_memory';

export const storage = {
  getPreferences: (): UserPreferences => {
    const saved = localStorage.getItem(PREFS_KEY);
    return saved ? JSON.parse(saved) : { language: 'en' };
  },

  savePreferences: (prefs: UserPreferences) => {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  },

  clearStylePreference: () => {
    const prefs = storage.getPreferences();
    delete prefs.style;
    storage.savePreferences(prefs);
  },

  saveMemory: (item: MemoryItem) => {
    const memory = storage.getMemory();
    memory.push(item);
    localStorage.setItem(MEMORY_KEY, JSON.stringify(memory));
  },

  getMemory: (): MemoryItem[] => {
    const saved = localStorage.getItem(MEMORY_KEY);
    return saved ? JSON.parse(saved) : [];
  }
};
