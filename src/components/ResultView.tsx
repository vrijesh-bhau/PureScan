import React, { useState } from 'react';
import { AnalysisResult } from '../types';
import { SafetyMeter } from './SafetyMeter';
import { AlertTriangle, CheckCircle, Info, ShieldAlert, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { motion } from 'motion/react';

interface ResultViewProps {
  result: AnalysisResult;
  onRescan: () => void;
}

export const ResultView: React.FC<ResultViewProps> = ({ result, onRescan }) => {
  const [isDeepMode, setIsDeepMode] = useState(false);

  if (result.isRefused) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 bg-gray-50 text-center">
        <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Analysis Refused</h2>
        <p className="text-gray-600 mb-8 max-w-sm">{result.refusalReason}</p>
        
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 w-full max-w-sm mb-8">
          <h3 className="text-sm font-semibold text-gray-800 mb-3 text-left">Confidence Metrics</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Overall Confidence</span>
              <span className={`font-medium ${result.confidenceScore < 65 ? 'text-red-500' : 'text-emerald-500'}`}>
                {Math.round(result.confidenceScore)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Completeness</span>
              <span className={`font-medium ${result.completeness < 66 ? 'text-red-500' : 'text-emerald-500'}`}>
                {Math.round(result.completeness)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Resolution</span>
              <span className={`font-medium ${result.resolution < 50 ? 'text-red-500' : 'text-emerald-500'}`}>
                {Math.round(result.resolution)}%
              </span>
            </div>
          </div>
        </div>

        <button 
          onClick={onRescan}
          className="w-full max-w-sm py-4 bg-gray-900 text-white rounded-xl font-semibold active:scale-95 transition-transform"
        >
          Rescan Product
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-y-auto pb-24">
      {/* Header */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-md z-10 p-4 border-b border-gray-100 flex justify-between items-center">
        <h1 className="text-lg font-bold tracking-tight text-gray-900">PureScan Result</h1>
        <button onClick={onRescan} className="text-sm font-medium text-blue-600">New Scan</button>
      </div>

      <div className="p-4 space-y-6">
        {/* Mode 1: Instant Verdict */}
        <SafetyMeter level={result.safetyMeterLevel} score={result.totalRiskScore} />

        {/* Top Risks */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-500" />
            Top Detected Risks
          </h3>
          {result.topRisks.length > 0 ? (
            <ul className="space-y-3">
              {result.topRisks.map((risk, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2 flex-shrink-0" />
                  <span className="text-gray-700 text-sm leading-relaxed">{risk}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-sm">No significant risks detected based on current data.</p>
          )}
        </div>

        {/* Confidence Banner */}
        <div className="flex items-center justify-between bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-900">High Confidence Analysis</span>
          </div>
          <span className="text-sm font-bold text-emerald-700">{Math.round(result.confidenceScore)}%</span>
        </div>

        {/* Mode 2 Toggle */}
        <button 
          onClick={() => setIsDeepMode(!isDeepMode)}
          className="w-full flex items-center justify-center gap-2 py-4 bg-white border border-gray-200 rounded-2xl font-semibold text-gray-700 shadow-sm active:bg-gray-50 transition-colors"
        >
          {isDeepMode ? 'Hide Deep Analysis' : 'View Deep Analysis'}
          {isDeepMode ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>

        {/* Mode 2: Deep Analysis */}
        {isDeepMode && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-6"
          >
            {/* Ingredients Breakdown */}
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Ingredient Breakdown</h3>
              <div className="space-y-3">
                {result.ingredients.map((ing, idx) => (
                  <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                    <span className="text-sm text-gray-800 font-medium">{ing.name}</span>
                    <span className={`text-xs font-bold px-2 py-1 rounded-md ${
                      ing.baseRisk > 5 ? 'bg-red-100 text-red-700' :
                      ing.baseRisk > 2 ? 'bg-orange-100 text-orange-700' :
                      ing.baseRisk > 0 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-emerald-100 text-emerald-700'
                    }`}>
                      Risk: {ing.baseRisk}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* NOVA & ADI */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">NOVA Class</h4>
                <p className="text-2xl font-bold text-gray-900">{result.novaClassification}</p>
                <p className="text-xs text-gray-500 mt-1">Ultra-processed</p>
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">ADI Exposure</h4>
                <p className="text-sm font-medium text-gray-900 mt-2">{result.adiExposure}</p>
              </div>
            </div>

            {/* Regulatory Sources */}
            <div className="bg-gray-900 p-5 rounded-3xl text-white">
              <h3 className="text-sm font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-gray-400" />
                Regulatory Sources
              </h3>
              <div className="flex gap-2">
                {result.regulatorySources.map((src, idx) => (
                  <span key={idx} className="text-xs font-medium bg-white/10 px-3 py-1.5 rounded-lg border border-white/20">
                    {src}
                  </span>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-4 leading-relaxed">
                Analysis based on static datasets from EU EFSA and US FDA. Not medical advice.
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
