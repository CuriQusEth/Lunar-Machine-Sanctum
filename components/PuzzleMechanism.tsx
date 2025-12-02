import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Settings, Zap, Lock, Unlock } from 'lucide-react';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
}

interface PuzzleMechanismProps {
  onComplete: () => void;
  stage: number;
}

export const PuzzleMechanism: React.FC<PuzzleMechanismProps> = ({ onComplete, stage }) => {
  const [rotationA, setRotationA] = useState(0);
  const [rotationB, setRotationB] = useState(0);
  const [rotationC, setRotationC] = useState(0);
  const [isLocked, setIsLocked] = useState(true);
  const [powerLevel, setPowerLevel] = useState(0);
  const [particles, setParticles] = useState<Particle[]>([]);
  const prevPowerLevel = useRef(0);

  // Target values change based on stage to increase difficulty
  const targetA = stage * 90;
  const targetB = stage * 180;
  const targetC = (stage * 45) + 180;

  // Particle System Loop
  useEffect(() => {
    if (particles.length === 0) return;

    let animationId: number;
    const animate = () => {
      setParticles(prev => 
        prev
          .map(p => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vx: p.vx * 0.96, // Friction
            vy: p.vy * 0.96,
            life: p.life - 0.02
          }))
          .filter(p => p.life > 0)
      );
      animationId = requestAnimationFrame(animate);
    };
    animationId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationId);
  }, [particles.length]);

  const spawnParticles = useCallback((count: number, color: string, speedMultiplier: number = 1) => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (Math.random() * 4 + 2) * speedMultiplier;
      newParticles.push({
        id: Math.random() + Date.now(),
        x: 0,
        y: 0,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1.0,
        color: color,
        size: Math.random() * 3 + 1
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
  }, []);

  // Tolerance for "solving"
  const checkAlignment = useCallback(() => {
    const normalize = (deg: number) => deg % 360;
    // Allow generous tolerance for gameplay feel
    const isAAligned = Math.abs(normalize(rotationA) - normalize(targetA)) < 20;
    const isBAligned = Math.abs(normalize(rotationB) - normalize(targetB)) < 20;
    const isCAligned = Math.abs(normalize(rotationC) - normalize(targetC)) < 20;

    let p = 0;
    if (isAAligned) p += 33;
    if (isBAligned) p += 33;
    if (isCAligned) p += 34;

    // Trigger effects on power increase
    if (p > prevPowerLevel.current) {
        spawnParticles(12, '#22d3ee', 0.8); // Cyan sparks
    }
    
    setPowerLevel(p);
    prevPowerLevel.current = p;

    if (p >= 100 && isLocked) {
      setIsLocked(false);
      spawnParticles(60, '#60a5fa', 1.5); // Blue burst
      spawnParticles(30, '#ffffff', 2.0); // White core burst
      setTimeout(onComplete, 1500);
    }
  }, [rotationA, rotationB, rotationC, targetA, targetB, targetC, isLocked, onComplete, spawnParticles]);

  useEffect(() => {
    checkAlignment();
  }, [rotationA, rotationB, rotationC, checkAlignment]);

  const rotate = (ring: 'A' | 'B' | 'C') => {
    if (!isLocked) return;
    if (ring === 'A') setRotationA(prev => prev + 45);
    if (ring === 'B') setRotationB(prev => prev - 45);
    if (ring === 'C') setRotationC(prev => prev + 90);
  };

  return (
    <div className="relative w-full max-w-[400px] aspect-square mx-auto my-8 group select-none">
      {/* Background Glow */}
      <div className={`absolute inset-0 bg-sanctum-glow/5 rounded-full blur-3xl transition-opacity duration-1000 ${powerLevel > 90 ? 'opacity-100' : 'opacity-20'}`}></div>

      {/* Particles Rendering */}
      {particles.map(p => (
        <div
            key={p.id}
            className="absolute rounded-full pointer-events-none z-30 mix-blend-screen"
            style={{
                left: '50%',
                top: '50%',
                width: `${p.size}px`,
                height: `${p.size}px`,
                backgroundColor: p.color,
                transform: `translate(${p.x}px, ${p.y}px)`,
                opacity: p.life,
                boxShadow: `0 0 ${p.size * 2}px ${p.color}`
            }}
        />
      ))}

      {/* Central Core */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
        <div className={`w-24 h-24 rounded-full border-4 flex items-center justify-center transition-all duration-1000 ${isLocked ? 'border-red-900 bg-black' : 'border-sanctum-glow bg-sanctum-glow/20 shadow-[0_0_50px_cyan]'}`}>
           {isLocked ? <Lock className="text-red-700" /> : <Unlock className="text-sanctum-glow animate-bounce" />}
        </div>
      </div>

      {/* Ring C (Outer) */}
      <div 
        onClick={() => rotate('C')}
        className="absolute inset-0 rounded-full border border-dashed border-sanctum-700/50 cursor-pointer hover:border-sanctum-glow/50 transition-all duration-700 ease-out flex items-center justify-center"
        style={{ transform: `rotate(${rotationC}deg)` }}
      >
        <div className="absolute top-0 w-4 h-8 bg-sanctum-800 border border-sanctum-500"></div>
        <div className="absolute bottom-0 w-4 h-8 bg-sanctum-800 border border-sanctum-500"></div>
        <div className="w-[90%] h-[90%] rounded-full border border-sanctum-800"></div>
      </div>

      {/* Ring B (Middle) */}
      <div 
        onClick={() => rotate('B')}
        className="absolute inset-[15%] rounded-full border-2 border-sanctum-600/30 cursor-pointer hover:border-sanctum-400 transition-all duration-500 ease-out flex items-center justify-center"
        style={{ transform: `rotate(${rotationB}deg)` }}
      >
        <div className="absolute right-0 w-6 h-6 bg-sanctum-900 border border-sanctum-accent rotate-45"></div>
         <div className="absolute left-0 w-6 h-6 bg-sanctum-900 border border-sanctum-accent rotate-45"></div>
      </div>

      {/* Ring A (Inner) */}
      <div 
        onClick={() => rotate('A')}
        className="absolute inset-[30%] rounded-full border-4 border-sanctum-800 cursor-pointer hover:border-sanctum-glow transition-all duration-300 ease-out"
        style={{ transform: `rotate(${rotationA}deg)` }}
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-sanctum-glow rounded-full shadow-[0_0_10px_cyan]"></div>
      </div>
      
      {/* Stats Overlay */}
      <div className="absolute -bottom-16 w-full text-center">
        <div className="flex items-center justify-center gap-2 text-sanctum-glow font-mono text-sm">
          <Zap size={16} />
          <span>OUTPUT: {powerLevel}%</span>
        </div>
        <div className="w-full h-1 bg-sanctum-900 mt-2 rounded overflow-hidden">
          <div 
            className="h-full bg-sanctum-glow transition-all duration-300"
            style={{ width: `${powerLevel}%` }}
          />
        </div>
      </div>
    </div>
  );
};