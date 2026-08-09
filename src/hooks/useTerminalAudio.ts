import { useEffect, useRef } from 'react';

export function useTerminalAudio(play: boolean) {
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (!play) return;

    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioCtxRef.current;
    
    // Create a data-stream / typing sound effect
    let time = ctx.currentTime;
    
    // Play a sequence of very short high-pitched beeps to simulate data stream
    for (let i = 0; i < 15; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = i % 3 === 0 ? 'sine' : 'square';
      osc.frequency.setValueAtTime(800 + Math.random() * 1200, time);
      
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(0.02, time + 0.01);
      gain.gain.linearRampToValueAtTime(0, time + 0.05);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(time);
      osc.stop(time + 0.05);
      
      time += 0.05 + Math.random() * 0.05;
    }
    
    // Play a final "boot up" chord
    const finalTime = time + 0.2;
    [440, 554.37, 659.25].forEach((freq) => { // A major chord
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, finalTime);
      
      gain.gain.setValueAtTime(0, finalTime);
      gain.gain.linearRampToValueAtTime(0.05, finalTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, finalTime + 1.5);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(finalTime);
      osc.stop(finalTime + 1.5);
    });

  }, [play]);
}
