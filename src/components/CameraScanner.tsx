import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, Upload, X, AlertCircle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CameraScannerProps {
  onCapture: (images: string[]) => void;
  onClose: () => void;
}

export const CameraScanner: React.FC<CameraScannerProps> = ({ onCapture, onClose }) => {
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startCamera = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (err) {
      console.error("Camera Error:", err);
      setError("Unable to access camera. Please check permissions or use file upload.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraActive(false);
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImages(prev => [...prev.slice(-2), dataUrl]); // Keep up to 3
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileList = Array.from(files);
      fileList.forEach((file: File) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target?.result;
          if (typeof result === 'string') {
            setCapturedImages(prev => [...prev.slice(-2), result]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setCapturedImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 z-50 bg-slate-900 flex flex-col"
    >
      {/* Header */}
      <div className="p-4 flex justify-between items-center text-white bg-slate-900/50 backdrop-blur-md">
        <h3 className="font-semibold">Scan Food Label</h3>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Viewfinder */}
      <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
        {error ? (
          <div className="p-6 text-center text-white">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
            <p className="mb-6">{error}</p>
            <button onClick={() => fileInputRef.current?.click()} className="btn-primary w-full">
              Upload from Gallery
            </button>
          </div>
        ) : (
          <>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className="w-full h-full object-cover"
            />
            {/* Overlay */}
            <div className="absolute inset-0 border-[40px] border-black/40 pointer-events-none">
              <div className="w-full h-full border-2 border-white/30 rounded-2xl relative">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-lg" />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Controls */}
      <div className="p-6 bg-slate-900 text-white">
        {/* Thumbnails */}
        <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
          {capturedImages.map((img, i) => (
            <div key={i} className="relative flex-shrink-0">
              <img src={img} className="w-16 h-16 object-cover rounded-xl border-2 border-white/20" />
              <button 
                onClick={() => removeImage(i)}
                className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          {capturedImages.length < 3 && (
            <div className="w-16 h-16 rounded-xl border-2 border-dashed border-white/20 flex items-center justify-center text-white/40 text-xs text-center p-1">
              {3 - capturedImages.length} more slots
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-4">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-4 bg-white/10 rounded-2xl hover:bg-white/20 transition-colors"
          >
            <Upload className="w-6 h-6" />
          </button>
          
          <button 
            onClick={captureImage}
            disabled={!isCameraActive}
            className="w-20 h-20 bg-white rounded-full flex items-center justify-center active:scale-90 transition-transform disabled:opacity-50"
          >
            <div className="w-16 h-16 border-4 border-slate-900 rounded-full" />
          </button>

          <button 
            onClick={() => onCapture(capturedImages)}
            disabled={capturedImages.length === 0}
            className="btn-primary flex-1 h-14"
          >
            Analyze {capturedImages.length > 0 ? `(${capturedImages.length})` : ''}
          </button>
        </div>
      </div>

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        multiple 
        accept="image/*" 
        className="hidden" 
      />
      <canvas ref={canvasRef} className="hidden" />
    </motion.div>
  );
};
