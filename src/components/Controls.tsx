import React from 'react';
import { Language, UserPreferences } from '../types';
import { Languages, MessageSquare, RotateCcw } from 'lucide-react';

interface ControlsProps {
  prefs: UserPreferences;
  onUpdatePrefs: (prefs: UserPreferences) => void;
  onResetStyle: () => void;
}

export const Controls: React.FC<ControlsProps> = ({ prefs, onUpdatePrefs, onResetStyle }) => {
  const languages: { id: Language; label: string }[] = [
    { id: 'en', label: 'English' },
    { id: 'hi', label: 'हिन्दी' },
    { id: 'hinglish', label: 'Hinglish' },
    { id: 'bn', label: 'বাংলা' },
    { id: 'te', label: 'తెలుగు' },
    { id: 'mr', label: 'मराठी' },
    { id: 'ta', label: 'தமிழ்' },
    { id: 'gu', label: 'ગુજરાતી' },
    { id: 'ur', label: 'اردو' },
    { id: 'kn', label: 'ಕನ್ನಡ' },
    { id: 'or', label: 'ଓଡ଼ିଆ' },
    { id: 'ml', label: 'മലയാളം' },
    { id: 'pa', label: 'ਪੰਜਾਬੀ' }
  ];

  return (
    <div className="space-y-4">
      {/* Language Switcher */}
      <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-hide">
        <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
          <Languages className="w-5 h-5" />
        </div>
        <div className="flex gap-2">
          {languages.map(lang => (
            <button
              key={lang.id}
              onClick={() => onUpdatePrefs({ ...prefs, language: lang.id })}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                prefs.language === lang.id
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>

      {/* Style Preference Indicator */}
      {prefs.style && (
        <div className="flex items-center justify-between bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-4 h-4 text-indigo-600" />
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">Active Style</h4>
              <p className="text-sm font-bold text-indigo-900">{prefs.style}</p>
            </div>
          </div>
          <button 
            onClick={onResetStyle}
            className="p-2 bg-white rounded-lg shadow-sm text-indigo-600 hover:text-indigo-700 active:scale-90 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
