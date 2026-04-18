"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Mail, Github, Chrome, Loader2 } from "lucide-react";
import Image from "next/image";

export function Login() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) {
      setMessage({ type: "error", text: error.message });
    } else {
      setMessage({ type: "success", text: "Check your email for the login link!" });
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) setMessage({ type: "error", text: error.message });
    setLoading(false);
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-[#020617] overflow-hidden p-4">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-150 contrast-150 mix-blend-overlay" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-md z-10"
      >
        <div className="bg-white/5 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.3)] p-10 space-y-10 border border-white/10 relative overflow-hidden group">
          {/* Subtle glow effect on hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          
          <div className="text-center space-y-4 relative">
            <div className="flex justify-center mb-6">
              <motion.div 
                whileHover={{ scale: 1.05, rotate: 2 }}
                className="w-24 h-24 relative drop-shadow-[0_0_20px_rgba(59,130,246,0.3)]"
              >
                <Image 
                  src="/logo.png" 
                  alt="TemporalWrite Logo" 
                  fill 
                  className="object-contain"
                  priority
                />
              </motion.div>
            </div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">
              TemporalWrite
            </h1>
            <p className="text-slate-400 font-medium">Master grammar across the timeline</p>
          </div>

          <div className="space-y-6 relative">
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-white/90 text-slate-900 font-bold py-4 px-6 rounded-2xl transition-all active:scale-[0.97] disabled:opacity-50 shadow-lg shadow-white/5"
            >
              <Chrome className="w-5 h-5 text-red-500" />
              Continue with Google
            </button>

            <div className="relative flex items-center py-2 px-1">
              <div className="flex-grow border-t border-white/5"></div>
              <span className="flex-shrink mx-4 text-slate-500 text-xs font-bold uppercase tracking-widest">or temporal mail</span>
              <div className="flex-grow border-t border-white/5"></div>
            </div>

            <form onSubmit={handleEmailLogin} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="email" className="block text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                  Chronicle Email
                </label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-blue-500/20 blur opacity-0 group-focus-within:opacity-100 transition-opacity rounded-2xl" />
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    id="email"
                    type="email"
                    placeholder="name@nexus.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-blue-500/50 transition-all text-white placeholder:text-slate-600 relative"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black py-4 px-6 rounded-2xl transition-all active:scale-[0.97] disabled:opacity-50 flex items-center justify-center gap-2 shadow-xl shadow-blue-900/20"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send Access Link"}
              </button>
            </form>

            {message && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`p-4 rounded-2xl text-sm font-bold text-center ${
                  message.type === "success" 
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                    : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                }`}
              >
                {message.text}
              </motion.div>
            )}
          </div>

          <p className="text-center text-[10px] text-slate-600 font-bold uppercase tracking-widest leading-relaxed">
            Protecting your timeline with<br/>premium encryption protocols
          </p>
        </div>
      </motion.div>
    </div>
  );
}
