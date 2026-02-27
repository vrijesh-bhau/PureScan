import React from 'react';
import { motion } from 'motion/react';

interface SafetyMeterProps {
  level: 'Minimal' | 'Moderate' | 'High' | 'Severe';
  score: number;
}

const LEVEL_CONFIG = {
  Minimal: { color: 'bg-emerald-500', text: 'MINIMAL RISK', desc: 'Safe for daily consumption', index: 0 },
  Moderate: { color: 'bg-yellow-500', text: 'MODERATE RISK', desc: 'Consume in moderation', index: 1 },
  High: { color: 'bg-orange-500', text: 'HIGH RISK PRODUCT', desc: 'Fails EU safety preference thresholds', index: 2 },
  Severe: { color: 'bg-red-600', text: 'SEVERE RISK', desc: 'Contains banned or highly dangerous substances', index: 3 }
};

export const SafetyMeter: React.FC<SafetyMeterProps> = ({ level, score }) => {
  const config = LEVEL_CONFIG[level];
  
  return (
    <div className="flex flex-col items-center justify-center py-8 px-4 bg-white rounded-3xl shadow-sm border border-gray-100">
      {/* Meter Visual */}
      <div className="relative w-full max-w-xs h-4 bg-gray-100 rounded-full overflow-hidden mb-6">
        <motion.div 
          className={`absolute top-0 left-0 h-full ${config.color} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, Math.max(5, (score / 12) * 100))}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
        {/* Markers */}
        <div className="absolute top-0 left-1/4 w-px h-full bg-white/50" />
        <div className="absolute top-0 left-2/4 w-px h-full bg-white/50" />
        <div className="absolute top-0 left-3/4 w-px h-full bg-white/50" />
      </div>

      {/* Verdict Text */}
      <motion.h2 
        className={`text-3xl font-bold tracking-tight text-center mb-2 ${config.color.replace('bg-', 'text-')}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        {config.text}
      </motion.h2>
      
      <motion.p 
        className="text-gray-500 text-sm font-medium text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        {config.desc}
      </motion.p>
    </div>
  );
};
