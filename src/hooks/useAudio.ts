'use client';

export function useAudio() {
  const playSound = (type: 'click' | 'correct' | 'wrong' | 'levelup') => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      if (type === 'click') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.1);
      } else if (type === 'correct') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.setValueAtTime(554.37, ctx.currentTime + 0.1);
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.2); 
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.4);
      } else if (type === 'wrong') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.3);
      } else if (type === 'levelup') {
        const frequencies = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5 major chord
        frequencies.forEach((freq, i) => {
          const chordOsc = ctx.createOscillator();
          const chordGain = ctx.createGain();
          chordOsc.connect(chordGain);
          chordGain.connect(ctx.destination);
          
          chordOsc.type = 'sine';
          chordOsc.frequency.value = freq;
          
          // Swell up, then fade out
          chordGain.gain.setValueAtTime(0, ctx.currentTime);
          chordGain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.4 + (i * 0.1));
          chordGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 2.0);
          
          chordOsc.start(ctx.currentTime);
          chordOsc.stop(ctx.currentTime + 2.0);
        });
      } else if (type === 'timeshift') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(100, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 1.2);
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.4);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.2);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 1.2);
      } else if (type === 'magic') {
        const frequencies = [880, 1108.73, 1318.51, 1760]; // A5 major chord
        frequencies.forEach((freq, i) => {
          const chordOsc = ctx.createOscillator();
          const chordGain = ctx.createGain();
          chordOsc.connect(chordGain);
          chordGain.connect(ctx.destination);
          chordOsc.type = 'triangle';
          chordOsc.frequency.value = freq;
          chordGain.gain.setValueAtTime(0, ctx.currentTime);
          chordGain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + (i * 0.05));
          chordGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.0);
          chordOsc.start(ctx.currentTime);
          chordOsc.stop(ctx.currentTime + 1.0);
        });
      }
    } catch (e) {
      console.error("Audio playback error", e);
    }
  };

  return { playSound };
}
