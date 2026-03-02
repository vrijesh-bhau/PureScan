import React, { useState, useEffect, useCallback } from 'react';
import { CameraScanner } from './components/CameraScanner';
import { ResultCard } from './components/ResultCard';
import { Controls } from './components/Controls';
import { analyzeFoodLabel, chatWithAI } from './services/ai';
import { storage } from './services/storage';
import { AnalysisResult, UserPreferences, Language, MemoryItem } from './types';
import { 
  Camera, 
  Upload, 
  Scan, 
  History, 
  MessageSquare, 
  Send,
  Loader2,
  AlertCircle,
  ChevronRight,
  X,
  Plus,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [isScanning, setIsScanning] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [prefs, setPrefs] = useState<UserPreferences>(storage.getPreferences());
  const [command, setCommand] = useState('');
  const [isMemorySaved, setIsMemorySaved] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleCapture = async (images: string[]) => {
    setIsScanning(false);
    setIsAnalyzing(true);
    setError(null);
    setIsMemorySaved(false);
    setChatMessages([]); // Clear chat for new product

    try {
      const analysis = await analyzeFoodLabel(images, prefs);
      setResult(analysis);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveToMemory = useCallback(() => {
    if (result) {
      const memory: MemoryItem = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
        result: result
      };
      storage.saveMemory(memory);
      setIsMemorySaved(true);
      showToast("Memory saved");
    }
  }, [result]);

  const handleCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim()) return;

    const cmd = command.toLowerCase().trim();

    if (cmd === 'reset style') {
      storage.clearStylePreference();
      setPrefs(storage.getPreferences());
      setCommand('');
      return;
    }

    if (cmd === 'remember this') {
      saveToMemory();
      setCommand('');
      return;
    }

    // If there's a result, treat it as a follow-up chat
    if (result) {
      const userMsg = command;
      setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
      setCommand('');
      setIsChatLoading(true);
      
      try {
        const aiResponse = await chatWithAI(result, userMsg, prefs.language);
        setChatMessages(prev => [...prev, { role: 'ai', text: aiResponse }]);
      } catch (err) {
        setChatMessages(prev => [...prev, { role: 'ai', text: "Sorry, I couldn't process that." }]);
      } finally {
        setIsChatLoading(false);
      }
      return;
    }

    // Save as style preference
    const newPrefs = { ...prefs, style: command };
    storage.savePreferences(newPrefs);
    setPrefs(newPrefs);
    setCommand('');
    showToast("Preference saved");
  };

  const updatePrefs = (newPrefs: UserPreferences) => {
    storage.savePreferences(newPrefs);
    setPrefs(newPrefs);
  };

  const resetStyle = () => {
    storage.clearStylePreference();
    setPrefs(storage.getPreferences());
  };

  const resetApp = () => {
    setResult(null);
    setIsScanning(false);
    setIsAnalyzing(false);
    setError(null);
    setChatMessages([]);
    setIsMemorySaved(false);
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
            <Scan className="text-white w-6 h-6" />
          </div>
          <h1 className="text-xl font-black tracking-tight text-slate-900">FoodSafe AI</h1>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={resetApp}
            className="p-2 bg-slate-100 rounded-xl text-slate-600 hover:bg-slate-200 transition-colors"
            title="New Chat"
          >
            <Plus className="w-6 h-6" />
          </button>
          <button 
            onClick={() => setShowHistory(!showHistory)}
            className="p-2 bg-slate-100 rounded-xl text-slate-600 hover:bg-slate-200 transition-colors"
            title="History"
          >
            <History className="w-6 h-6" />
          </button>
        </div>
      </header>

      <main className="max-w-md mx-auto px-6 py-8 space-y-8">
        {/* Hero / Action Section */}
        {!result && !isAnalyzing && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 text-center"
          >
            <div className="py-12">
              <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Camera className="w-12 h-12 text-indigo-600" />
              </div>
              <h2 className="text-3xl font-black text-slate-900 leading-tight">Scan any food label to know its safety.</h2>
              <p className="text-slate-500 font-medium mt-3">Instant AI analysis for Indian consumers.</p>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <button 
                onClick={() => setIsScanning(true)}
                className="btn-primary h-16 text-lg flex items-center justify-center gap-3"
              >
                <Camera className="w-6 h-6" /> Start Scanning
              </button>
              <button 
                onClick={() => setIsScanning(true)}
                className="btn-secondary h-16 text-lg flex items-center justify-center gap-3"
              >
                <Upload className="w-6 h-6" /> Upload from Gallery
              </button>
            </div>
          </motion.div>
        )}

        {/* Loading State */}
        {isAnalyzing && (
          <div className="flex flex-col items-center justify-center py-20 space-y-6">
            <div className="relative">
              <Loader2 className="w-16 h-16 text-indigo-600 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Scan className="w-6 h-6 text-indigo-400" />
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">AI Vision Analyzing</h3>
              <p className="text-slate-500 font-medium mt-1">Extracting ingredients & evaluating risks...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="card border-red-200 bg-red-50 flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-bold text-red-900">Analysis Failed</h4>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              <button 
                onClick={() => setIsScanning(true)}
                className="mt-4 text-sm font-black uppercase tracking-widest text-red-600 hover:text-red-700"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Result Section */}
        {result && !isAnalyzing && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <ResultCard 
              result={result} 
              language={prefs.language} 
              onSaveMemory={saveToMemory}
              isMemorySaved={isMemorySaved}
            />

            {/* Chat History for current product */}
            {chatMessages.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 px-2">Conversation</h4>
                {chatMessages.map((msg, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: msg.role === 'user' ? 10 : -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] p-4 rounded-2xl text-sm font-medium ${
                      msg.role === 'user' 
                      ? 'bg-indigo-600 text-white rounded-tr-none' 
                      : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none shadow-sm'
                    }`}>
                      {msg.text}
                    </div>
                  </motion.div>
                ))}
                {isChatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm">
                      <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <div className="flex justify-center">
              <button 
                onClick={() => { setResult(null); setIsScanning(true); setChatMessages([]); }}
                className="btn-secondary flex items-center gap-2"
              >
                <Camera className="w-5 h-5" /> Scan Another Product
              </button>
            </div>
          </div>
        )}

        {/* Controls */}
        {!isScanning && (
          <Controls 
            prefs={prefs} 
            onUpdatePrefs={updatePrefs} 
            onResetStyle={resetStyle} 
          />
        )}
      </main>

      {/* History Drawer (Simplified) */}
      <AnimatePresence>
        {showHistory && (
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="fixed inset-0 z-50 bg-white flex flex-col"
          >
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-black uppercase tracking-tight">Saved Memories</h3>
              <button onClick={() => setShowHistory(false)} className="p-2 bg-slate-100 rounded-xl">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {storage.getMemory().length === 0 ? (
                <div className="text-center py-20 text-slate-400">
                  <History className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p className="font-bold uppercase tracking-widest text-xs">No saved memories yet</p>
                </div>
              ) : (
                storage.getMemory().map(item => (
                  <div 
                    key={item.id} 
                    onClick={() => { setResult(item.result); setShowHistory(false); }}
                    className="card flex items-center justify-between hover:border-indigo-300 transition-colors cursor-pointer group"
                  >
                    <div>
                      <h4 className="font-bold text-slate-900">{item.result.product}</h4>
                      <p className="text-xs text-slate-400">{new Date(item.timestamp).toLocaleDateString()}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Follow-Command Input */}
      {!isScanning && (
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-md border-t border-slate-100 z-30">
          <form onSubmit={handleCommand} className="max-w-md mx-auto relative">
            <input 
              type="text" 
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              placeholder="Type 'Explain in detail' or 'Remember this'..."
              className="w-full bg-slate-100 border-none rounded-2xl py-4 pl-12 pr-16 font-medium text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 transition-all"
            />
            <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <button 
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-200 active:scale-90 transition-transform"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      )}

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-28 left-1/2 -translate-x-1/2 z-50 bg-slate-800 text-white px-6 py-3 rounded-full shadow-xl text-sm font-bold flex items-center gap-2"
          >
            <Zap className="w-4 h-4 text-emerald-400 fill-emerald-400" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Camera Overlay */}
      <AnimatePresence>
        {isScanning && (
          <CameraScanner 
            onCapture={handleCapture} 
            onClose={() => setIsScanning(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
