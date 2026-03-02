import React, { useState } from 'react';
import { AnalysisResult, Language, RiskLevel } from '../types';
import { 
  ShieldCheck, 
  AlertTriangle, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  ChevronDown, 
  ChevronUp,
  Info,
  Clock,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ResultCardProps {
  result: AnalysisResult;
  language: Language;
  onSaveMemory?: () => void;
  isMemorySaved?: boolean;
}

export const ResultCard: React.FC<ResultCardProps> = ({ 
  result, 
  language, 
  onSaveMemory,
  isMemorySaved 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getRiskLabel = (risk: RiskLevel, lang: Language) => {
    const labels: Record<RiskLevel, Record<Language, string>> = {
      Low: {
        en: 'Low Risk', hi: 'कम जोखिम', hinglish: 'Low Risk',
        bn: 'স্বল্প ঝুঁকি', te: 'తక్కువ ప్రమాదం', mr: 'कमी धोका',
        ta: 'குறைந்த ஆபத்து', gu: 'ઓછું જોખમ', ur: 'کم خطرہ',
        kn: 'ಕಡಿಮೆ ಅಪಾಯ', or: 'ସ୍ୱଳ୍ପ ବିପଦ', ml: 'കുറഞ്ഞ അപകടസാധ്യത', pa: 'ਘੱਟ ਜੋਖਮ'
      },
      Moderate: {
        en: 'Moderate Risk', hi: 'मध्यम जोखिम', hinglish: 'Moderate Risk',
        bn: 'মাঝারি ঝুঁকি', te: 'మితమైన ప్రమాదం', mr: 'मध्यम धोका',
        ta: 'மிதமான ஆபத்து', gu: 'મધ્યમ જોખમ', ur: 'معتدل خطرہ',
        kn: 'ಮಧ್ಯಮ ಅಪಾಯ', or: 'ମଧ୍ୟମ ବିପଦ', ml: 'മിതമായ അപകടസാധ്യത', pa: 'ਦਰਮਿਆਨਾ ਜੋਖਮ'
      },
      High: {
        en: 'High Risk', hi: 'उच्च जोखिम', hinglish: 'High Risk',
        bn: 'উচ্চ ঝুঁকি', te: 'ఎక్కువ ప్రమాదం', mr: 'जास्त धोका',
        ta: 'அதிக ஆபத்து', gu: 'વધારે જોખમ', ur: 'زیادہ خطرہ',
        kn: 'ಹೆಚ್ಚಿನ ಅಪಾಯ', or: 'ଉଚ୍ଚ ବିପଦ', ml: 'കൂടിയ അപകടസാധ്യത', pa: 'ਉੱਚ ਜੋਖਮ'
      }
    };
    return labels[risk][lang] || labels[risk]['en'];
  };

  const riskConfig = {
    Low: { 
      icon: <ShieldCheck className="w-6 h-6" />, 
      colorClass: 'risk-low',
      label: getRiskLabel('Low', language)
    },
    Moderate: { 
      icon: <AlertTriangle className="w-6 h-6" />, 
      colorClass: 'risk-moderate',
      label: getRiskLabel('Moderate', language)
    },
    High: { 
      icon: <AlertCircle className="w-6 h-6" />, 
      colorClass: 'risk-high',
      label: getRiskLabel('High', language)
    }
  };

  const config = riskConfig[result.overallRisk];

  if (!result.isFood) {
    return (
      <div className="card border-red-200 bg-red-50">
        <div className="flex items-center gap-3 text-red-600 mb-4">
          <XCircle className="w-8 h-8" />
          <h3 className="text-xl font-bold uppercase tracking-tight">Not a Food Product</h3>
        </div>
        <p className="text-red-800 font-medium">{result.notFoodMessage}</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-6"
    >
      {/* Main Result Card */}
      <div className="card overflow-hidden !p-0">
        {/* Risk Header */}
        <div className={`p-6 border-b ${config.colorClass} flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            {config.icon}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest opacity-70">Overall Risk</h3>
              <p className="text-xl font-black uppercase tracking-tight leading-none">{config.label}</p>
            </div>
          </div>
          <div className="text-right">
            <h3 className="text-xs font-bold uppercase tracking-widest opacity-70">Confidence</h3>
            <p className="text-xl font-black leading-none">{result.confidence}%</p>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Product Info */}
          <div>
            <h2 className="text-2xl font-bold text-slate-900 leading-tight">{result.product}</h2>
            {result.brand && <p className="text-slate-500 font-medium">{result.brand}</p>}
          </div>

          {/* Why This Rating */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Info className="w-3 h-3" /> Why this rating
            </h4>
            <ul className="space-y-2">
              {result.whyThisRating.map((point, i) => (
                <li key={i} className="flex gap-2 text-sm font-medium text-slate-700">
                  <span className="text-slate-300">•</span> {point}
                </li>
              ))}
            </ul>
          </div>

          {/* Good & Concerns Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100/50">
              <h4 className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-3 h-3" /> Good
              </h4>
              <ul className="space-y-1.5">
                {result.good.map((point, i) => (
                  <li key={i} className="text-xs font-semibold text-emerald-800 flex gap-2">
                    <span>+</span> {point}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-red-50/50 p-4 rounded-2xl border border-red-100/50">
              <h4 className="text-xs font-bold uppercase tracking-widest text-red-600 mb-3 flex items-center gap-2">
                <AlertCircle className="w-3 h-3" /> Concerns
              </h4>
              <ul className="space-y-1.5">
                {result.concerns.map((point, i) => (
                  <li key={i} className="text-xs font-semibold text-red-800 flex gap-2">
                    <span>-</span> {point}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Daily Use Recommendation */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-4">
            <div className="p-3 bg-white rounded-xl shadow-sm">
              <Clock className="w-5 h-5 text-slate-400" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">Daily Use</h4>
              <p className="font-bold text-slate-800">{result.forDailyUse}</p>
            </div>
          </div>

          {/* Memory Button */}
          {onSaveMemory && (
            <button 
              onClick={onSaveMemory}
              disabled={isMemorySaved}
              className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                isMemorySaved 
                ? 'bg-emerald-100 text-emerald-700 cursor-default' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 active:scale-95'
              }`}
            >
              <Zap className={`w-4 h-4 ${isMemorySaved ? 'fill-emerald-500' : ''}`} />
              {isMemorySaved ? 'Memory Saved' : 'Remember this'}
            </button>
          )}
        </div>
      </div>

      {/* Expandable Ingredients */}
      <div className="card !p-0 overflow-hidden">
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
        >
          <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">Ingredient Breakdown</h4>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        <AnimatePresence>
          {isExpanded && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-4 pb-4"
            >
              <div className="p-4 bg-slate-50 rounded-xl text-sm font-medium text-slate-600 leading-relaxed italic">
                {result.ingredients || "Ingredient list not clearly visible"}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Confidence Bar */}
      <div className="space-y-2 px-2">
        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
          <span>Analysis Confidence</span>
          <span>{result.confidence}%</span>
        </div>
        <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${result.confidence}%` }}
            className={`h-full rounded-full ${
              result.confidence > 80 ? 'bg-emerald-500' : 
              result.confidence > 50 ? 'bg-amber-500' : 'bg-red-500'
            }`}
          />
        </div>
      </div>
    </motion.div>
  );
};
