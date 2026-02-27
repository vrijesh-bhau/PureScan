import React, { useState, useEffect } from 'react';
import { CameraScanner } from './components/CameraScanner';
import { ResultView } from './components/ResultView';
import { extractLabelData } from './services/ai';
import { runAnalysis } from './services/ruleEngine';
import { AnalysisResult, UserProfile } from './types';
import { Settings, Baby, User } from 'lucide-react';

export default function App() {
  const [isScanning, setIsScanning] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    bodyWeight: 60,
    isChildMode: false,
    language: 'en'
  });

  const handleCaptureComplete = async (images: { front: string; ingredients: string; nutrition: string }) => {
    setIsScanning(false);
    setIsAnalyzing(true);
    
    try {
      // 1. Extract data using AI (OCR & Entity Extraction)
      const extractedData = await extractLabelData(images.front, images.ingredients, images.nutrition);
      
      // 2. Run deterministic rule engine
      const analysisResult = runAnalysis(extractedData, userProfile);
      
      setResult(analysisResult);
    } catch (error) {
      console.error("Analysis failed:", error);
      // Handle error state
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRescan = () => {
    setResult(null);
    setIsScanning(true);
  };

  const toggleChildMode = () => {
    setUserProfile(prev => ({
      ...prev,
      isChildMode: !prev.isChildMode,
      bodyWeight: !prev.isChildMode ? 20 : 60
    }));
  };

  return (
    <div className="h-screen w-full max-w-md mx-auto bg-black overflow-hidden relative font-sans">
      {/* Top Navigation / Status Bar */}
      {!isScanning && !isAnalyzing && (
        <div className="absolute top-0 left-0 right-0 p-4 z-20 flex justify-between items-center pointer-events-none">
          <div className="pointer-events-auto">
            <button 
              onClick={toggleChildMode}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                userProfile.isChildMode ? 'bg-blue-500 text-white' : 'bg-white/20 text-white backdrop-blur-md'
              }`}
            >
              {userProfile.isChildMode ? <Baby className="w-4 h-4" /> : <User className="w-4 h-4" />}
              {userProfile.isChildMode ? 'Child Mode (20kg)' : 'Adult (60kg)'}
            </button>
          </div>
          <div className="pointer-events-auto">
             <button className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
               <Settings className="w-4 h-4" />
             </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      {isScanning ? (
        <CameraScanner onCaptureComplete={handleCaptureComplete} />
      ) : isAnalyzing ? (
        <div className="flex flex-col items-center justify-center h-full bg-gray-50">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-6" />
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Analyzing Label...</h2>
          <p className="text-sm text-gray-500 mt-2">Cross-referencing EU EFSA & US FDA datasets</p>
        </div>
      ) : result ? (
        <ResultView result={result} onRescan={handleRescan} />
      ) : null}
    </div>
  );
}
