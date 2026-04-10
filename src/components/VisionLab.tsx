'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, X, Upload, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useUserStore } from '@/store/userStore';

interface VisionError {
  rect: { x: number; y: number; w: number; h: number };
  error: string;
  correction: string;
  explanation: string;
}

export function VisionLab() {
  const [isOpen, setIsOpen] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errors, setErrors] = useState<VisionError[]>([]);
  const [hoveredError, setHoveredError] = useState<VisionError | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result as string);
        setErrors([]);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async () => {
    if (!image) return;
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/vision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image })
      });
      const data = await res.json();
      if (data.errors) {
        setErrors(data.errors);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-8 p-4 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl shadow-xl hover:scale-110 transition-all z-40 group"
        title="Vision Lab (Scan Homework)"
      >
        <Camera size={24} />
        <span className="absolute right-full mr-3 bg-black/80 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Vision Lab</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm"
          >
            <div className="bg-white dark:bg-gray-900 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-4 border-b dark:border-white/10 flex justify-between items-center bg-gray-50 dark:bg-black/20">
                <div className="flex items-center gap-2">
                  <Camera className="text-indigo-500" />
                  <h2 className="font-bold text-xl">Vision Lab</h2>
                  <span className="text-[10px] bg-indigo-500/10 text-indigo-500 px-2 py-0.5 rounded-full font-black uppercase">Multimodal Scan</span>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full">
                  <X />
                </button>
              </div>

              <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                {/* Left: Image Canvas */}
                <div className="flex-1 bg-black/5 dark:bg-black/40 relative overflow-hidden flex items-center justify-center p-4">
                  {!image ? (
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="flex flex-col items-center gap-4 p-12 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-3xl hover:border-indigo-500 transition-colors"
                    >
                      <Upload size={48} className="text-gray-400" />
                      <p className="font-medium opacity-50">Upload a photo of your writing</p>
                    </button>
                  ) : (
                    <div className="relative inline-block max-w-full max-h-full">
                      <img src={image} alt="Target" className="max-w-full max-h-[60vh] rounded-lg shadow-lg" />
                      
                      {/* SVG Overlay */}
                      <svg className="absolute inset-0 w-full h-full pointer-events-none">
                        {errors.map((err, i) => (
                          <rect 
                            key={i}
                            x={`${err.rect.x}%`}
                            y={`${err.rect.y}%`}
                            width={`${err.rect.w}%`}
                            height={`${err.rect.h}%`}
                            fill="rgba(239, 68, 68, 0.2)"
                            stroke="#ef4444"
                            strokeWidth="2"
                            className="pointer-events-auto cursor-pointer"
                            onMouseEnter={() => setHoveredError(err)}
                            onMouseLeave={() => setHoveredError(null)}
                          />
                        ))}
                      </svg>

                      {/* Tooltip Popup */}
                      {hoveredError && (
                        <div 
                          className="absolute bg-white dark:bg-gray-800 p-3 rounded-xl shadow-2xl border border-red-500/20 z-10 w-64 pointer-events-none"
                          style={{ 
                            left: `${hoveredError.rect.x}%`, 
                            top: `${hoveredError.rect.y + hoveredError.rect.h + 2}%`,
                            transform: 'translateX(-50%)'
                          }}
                        >
                          <div className="flex items-center gap-2 text-red-500 mb-1">
                            <AlertCircle size={14} />
                            <span className="font-bold text-[10px] uppercase">Error Found</span>
                          </div>
                          <p className="text-xs line-through opacity-50">{hoveredError.error}</p>
                          <div className="flex items-center gap-2 text-green-500 mt-1">
                            <CheckCircle2 size={14} />
                            <span className="font-bold text-sm">{hoveredError.correction}</span>
                          </div>
                          <p className="text-[10px] mt-2 opacity-80 italic">{hoveredError.explanation}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Right: Results List */}
                <div className="w-full md:w-80 border-l dark:border-white/10 p-4 space-y-4 overflow-y-auto bg-gray-50/50 dark:bg-black/20">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm uppercase tracking-wider opacity-50">Corrections</h3>
                    <span className="text-xs font-bold text-indigo-500">{errors.length} detected</span>
                  </div>

                  {isAnalyzing ? (
                    <div className="py-20 flex flex-col items-center gap-4">
                      <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                      >
                        <Sparkles className="text-indigo-500" />
                      </motion.div>
                      <p className="text-xs font-black uppercase animate-pulse">Scanning with AI...</p>
                    </div>
                  ) : errors.length > 0 ? (
                    <div className="space-y-3">
                      {errors.map((err, i) => (
                        <div key={i} className="p-3 bg-white dark:bg-gray-800 rounded-xl border dark:border-white/5 shadow-sm">
                          <div className="flex items-center gap-2 text-red-500 text-xs font-bold mb-1">
                            <span>"{err.error}"</span>
                          </div>
                          <div className="flex items-center gap-2 text-green-500 text-sm font-black">
                            <span>{err.correction}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-20 text-center opacity-30 italic text-sm">
                      Upload an image then click analyze to see corrections.
                    </div>
                  )}

                  <input 
                    type="file" 
                    hidden 
                    ref={fileInputRef} 
                    onChange={handleFileUpload}
                    accept="image/*"
                  />
                  
                  <div className="pt-4 mt-auto">
                    {!image ? (
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-3 bg-gray-200 dark:bg-white/10 rounded-xl font-bold hover:bg-gray-300 dark:hover:bg-white/20 transition-all flex items-center justify-center gap-2"
                      >
                         Choose Photo
                      </button>
                    ) : (
                      <div className="flex gap-2">
                         <button 
                          onClick={() => setImage(null)}
                          className="flex-1 py-3 bg-gray-100 dark:bg-white/5 rounded-xl font-bold text-xs"
                        >
                          Clear
                        </button>
                        <button 
                          onClick={analyzeImage}
                          disabled={isAnalyzing}
                          className="flex-[2] py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          <Sparkles size={16} /> Analyze
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
