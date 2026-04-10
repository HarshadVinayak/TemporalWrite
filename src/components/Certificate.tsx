'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Download, Share2, Award, Zap, Shield, Sparkles, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import html2canvas from 'html2canvas';
import { useUserStore } from '@/store/userStore';

interface CertificateProps {
  topic: string;
  score: number;
  onClose: () => void;
}

export function Certificate({ topic, score, onClose }: CertificateProps) {
  const { userName, currentGrade } = useUserStore();
  const [comment, setComment] = useState('An exceptional display of linguistic prowess!');
  const certRef = useRef<HTMLDivElement>(null);

  const era = currentGrade < 6 ? 1 : currentGrade < 13 ? 2 : 3;

  // 3D Tilt Effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  useEffect(() => {
    // Confetti explosion
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: era === 1 ? ['#B5884A', '#EADEB8'] : era === 2 ? ['#3B82F6', '#1E40AF'] : ['#A855F7', '#EC4899']
    });

    // Fetch AI Commendation
    const fetchCommendation = async () => {
      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [{ role: 'user', content: `Write a 1-sentence formal commendation for a student who just mastered ${topic}. Keep it high-level and inspiring.` }],
            engine: 'openrouter',
            era: era
          })
        });
        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        let text = '';
        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');
            for (const line of lines) {
               if (line.startsWith('data: ')) {
                 const data = line.slice(6).trim();
                 if (data === '[DONE]') break;
                 try {
                   const parsed = JSON.parse(data);
                   if (parsed.content) text += parsed.content;
                 } catch {}
               }
            }
          }
          setComment(text || comment);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchCommendation();
  }, []);

  const downloadCert = async () => {
    if (!certRef.current) return;
    const canvas = await html2canvas(certRef.current, {
      scale: 2,
      backgroundColor: null,
      useCORS: true
    });
    const link = document.createElement('a');
    link.download = `Chronos_Mastery_${topic.replace(/\s/g, '_')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const shareAchievement = () => {
    // Mock social share
    alert("Achievement broadcasted to the Chronos Guild!");
  };

  const eraStyles = {
    1: "bg-[#FDF6E3] border-[16px] border-[#B5884A] shadow-[inset_0_0_50px_rgba(181,136,74,0.3)]",
    2: "bg-blue-50 border-[12px] border-blue-900 shadow-xl relative after:absolute after:inset-0 after:bg-[url('https://www.transparenttextures.com/patterns/blueprint.png')] after:opacity-10",
    3: "bg-black border-4 border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.5)] text-white"
  };

  const title = era === 1 ? "CHRONOS SCHOLAR" : era === 2 ? "TIME-WARP PIONEER" : "SYNTAX ARCHITECT";

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative max-w-2xl w-full"
      >
        <button 
          onClick={onClose}
          className="absolute -top-12 right-0 text-white/50 hover:text-white transition-colors"
        >
          <X size={32} />
        </button>

        <motion.div
          ref={certRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
          className={`p-12 md:p-16 text-center shadow-2xl overflow-hidden rounded-[2rem] ${eraStyles[era as 1|2|3]}`}
        >
          <div style={{ transform: "translateZ(50px)" }} className="relative z-10 space-y-8">
            <div className="flex justify-center">
              <div className={`p-4 rounded-full ${era === 1 ? 'bg-amber-100 text-amber-600' : era === 2 ? 'bg-blue-900 text-white' : 'bg-purple-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.8)]'}`}>
                {era === 1 ? <Award size={64} /> : era === 2 ? <Zap size={64} /> : <Shield size={64} />}
              </div>
            </div>

            <div className="space-y-2">
              <h1 className={`text-sm font-black tracking-[0.3em] uppercase ${era === 1 ? 'text-amber-800' : era === 2 ? 'text-blue-900' : 'text-purple-400'}`}>
                Certificate of Mastery
              </h1>
              <p className={`text-4xl md:text-5xl font-black ${era === 1 ? 'text-amber-900 font-serif' : era === 2 ? 'text-blue-950 font-mono' : 'text-white font-sans tracking-tighter'}`}>
                {title}
              </p>
            </div>

            <div className={`h-px w-32 mx-auto ${era === 1 ? 'bg-amber-800/20' : era === 2 ? 'bg-blue-900/20' : 'bg-purple-500/30'}`} />

            <div className="space-y-4">
              <p className="text-lg opacity-60">This certifies that</p>
              <h2 className={`text-3xl font-black ${era === 1 ? 'text-amber-950' : era === 2 ? 'text-blue-900' : 'text-white'}`}>
                {userName}
              </h2>
              <p className="text-lg opacity-60 underline decoration-current decoration-2 underline-offset-8">
                has mastered {topic}
              </p>
            </div>

            <div className="pt-8">
              <p className={`text-sm italic p-4 rounded-xl border-2 border-dashed ${era === 1 ? 'bg-amber-50 border-amber-200 text-amber-900' : era === 2 ? 'bg-blue-100/50 border-blue-900/20 text-blue-900' : 'bg-purple-900/20 border-purple-500/30 text-purple-200'}`}>
                "{comment}"
              </p>
            </div>

            <div className="flex justify-between items-end pt-12">
              <div className="text-left">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Registry ID</p>
                <p className="text-xs font-mono font-bold opacity-60">
                   {era === 3 ? `HASH_TX_${Math.random().toString(36).substring(7).toUpperCase()}` : `Chronos-${Date.now().toString().slice(-6)}`}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Awarded Date</p>
                <p className="text-xs font-bold opacity-60">
                  {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>
          </div>

          {/* Era-Specific Background Elements */}
          {era === 1 && (
            <div className="absolute inset-4 border-2 border-amber-800/10 pointer-events-none rounded-[1.5rem]" />
          )}
          {era === 3 && (
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-pink-500/10 pointer-events-none" />
          )}
        </motion.div>

        <div className="flex justify-center gap-4 mt-8">
          <button 
             onClick={downloadCert}
             className="flex items-center gap-2 px-6 py-3 bg-white text-black font-black rounded-xl hover:scale-105 active:scale-95 transition-all shadow-xl"
          >
            <Download size={20} /> Download PNG
          </button>
          <button 
            onClick={shareAchievement}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-black rounded-xl hover:scale-105 active:scale-95 transition-all shadow-xl"
          >
            <Share2 size={20} /> Broadcast to Guild
          </button>
        </div>
      </motion.div>
    </div>
  );
}
