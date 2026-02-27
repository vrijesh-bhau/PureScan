import React, { useState, useRef, useCallback } from 'react';
import { Camera, CheckCircle2, AlertCircle } from 'lucide-react';

interface CameraScannerProps {
  onCaptureComplete: (images: { front: string; ingredients: string; nutrition: string }) => void;
}

const ZONES = [
  { id: 'front', label: '1. Front Pack', desc: 'Capture the main product label' },
  { id: 'ingredients', label: '2. Ingredients', desc: 'Capture the ingredients list clearly' },
  { id: 'nutrition', label: '3. Nutrition Table', desc: 'Capture the nutritional information' }
];

export const CameraScanner: React.FC<CameraScannerProps> = ({ onCaptureComplete }) => {
  const [currentZoneIndex, setCurrentZoneIndex] = useState(0);
  const [capturedImages, setCapturedImages] = useState<{ [key: string]: string }>({});
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      // Fallback for demo if camera fails
    }
  }, []);

  React.useEffect(() => {
    startCamera();
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [startCamera]);

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const base64Image = canvas.toDataURL('image/jpeg', 0.8);
        
        const currentZone = ZONES[currentZoneIndex].id;
        const newImages = { ...capturedImages, [currentZone]: base64Image };
        setCapturedImages(newImages);

        if (currentZoneIndex < ZONES.length - 1) {
          setCurrentZoneIndex(currentZoneIndex + 1);
        } else {
          // All captured
          onCaptureComplete({
            front: newImages.front,
            ingredients: newImages.ingredients,
            nutrition: newImages.nutrition
          });
        }
      }
    } else {
        // Fallback for demo if camera is not available
        const currentZone = ZONES[currentZoneIndex].id;
        const newImages = { ...capturedImages, [currentZone]: 'data:image/jpeg;base64,dummy' };
        setCapturedImages(newImages);
        if (currentZoneIndex < ZONES.length - 1) {
          setCurrentZoneIndex(currentZoneIndex + 1);
        } else {
          onCaptureComplete({
            front: newImages.front,
            ingredients: newImages.ingredients,
            nutrition: newImages.nutrition
          });
        }
    }
  };

  return (
    <div className="flex flex-col h-full bg-black text-white relative">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 z-10 bg-gradient-to-b from-black/80 to-transparent">
        <h2 className="text-xl font-semibold text-center tracking-tight">PureScan</h2>
        <p className="text-sm text-center opacity-80 mt-1">
          {ZONES[currentZoneIndex].label}
        </p>
      </div>

      {/* Camera Viewfinder */}
      <div className="flex-1 relative overflow-hidden flex items-center justify-center">
        {isCameraActive ? (
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <p className="text-gray-400">Camera initializing...</p>
          </div>
        )}
        
        {/* Framing Guide */}
        <div className="absolute inset-8 border-2 border-white/50 rounded-2xl flex flex-col items-center justify-center pointer-events-none">
            <div className="w-16 h-16 border-t-4 border-l-4 border-white absolute top-0 left-0 rounded-tl-xl"></div>
            <div className="w-16 h-16 border-t-4 border-r-4 border-white absolute top-0 right-0 rounded-tr-xl"></div>
            <div className="w-16 h-16 border-b-4 border-l-4 border-white absolute bottom-0 left-0 rounded-bl-xl"></div>
            <div className="w-16 h-16 border-b-4 border-r-4 border-white absolute bottom-0 right-0 rounded-br-xl"></div>
            <p className="text-white/80 font-medium bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm">
                {ZONES[currentZoneIndex].desc}
            </p>
        </div>
      </div>

      {/* Controls */}
      <div className="h-48 bg-black p-6 flex flex-col justify-between z-10">
        {/* Progress Indicators */}
        <div className="flex justify-center gap-3 mb-6">
          {ZONES.map((zone, idx) => (
            <div 
              key={zone.id} 
              className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                idx < currentZoneIndex ? 'bg-emerald-500' : 
                idx === currentZoneIndex ? 'bg-white' : 'bg-white/20'
              }`}
            />
          ))}
        </div>

        {/* Capture Button */}
        <div className="flex justify-center items-center">
          <button 
            onClick={captureImage}
            className="w-20 h-20 rounded-full border-4 border-white/30 flex items-center justify-center active:scale-95 transition-transform"
          >
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
              <Camera className="text-black w-8 h-8" />
            </div>
          </button>
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};
