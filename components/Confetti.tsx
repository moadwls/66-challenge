'use client';

import { useEffect, useState } from 'react';

interface ConfettiProps {
  isActive: boolean;
  onComplete?: () => void;
}

const MOTIVATIONAL_MESSAGES = [
  "You're built different.",
  "Weakness leaving the body.",
  "Champions don't take days off.",
  "You just outworked 99% of people.",
  "This is what discipline looks like.",
  "Average people quit. You didn't.",
  "One day closer to greatness.",
  "Your future self is proud.",
  "Pain today, power tomorrow.",
  "You're becoming unstoppable.",
  "Winners win. That's you.",
  "Excuses? Don't know her.",
  "Hard work is your superpower.",
  "You chose hard. Respect.",
  "Consistency is your weapon.",
  "Another day, another W.",
  "The grind never lies.",
  "You're proving them wrong.",
  "Discipline beats motivation.",
  "Legend in the making.",
];

export default function Confetti({ isActive, onComplete }: ConfettiProps) {
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    color: string;
    delay: number;
    size: number;
  }>>([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (isActive) {
      // Pick random message
      const randomMessage = MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)];
      setMessage(randomMessage);

      // Generate confetti particles
      const newParticles = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        color: ['#FF4D00', '#FF6B35', '#FFD700', '#FF8C00', '#FFA500'][Math.floor(Math.random() * 5)],
        delay: Math.random() * 0.5,
        size: Math.random() * 8 + 4,
      }));
      setParticles(newParticles);

      // Auto-dismiss after animation
      const timer = setTimeout(() => {
        onComplete?.();
      }, 3500);

      return () => clearTimeout(timer);
    }
  }, [isActive, onComplete]);

  if (!isActive) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center pointer-events-auto"
      onClick={onComplete}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/80" />
      
      {/* Confetti particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute top-0 animate-confetti"
          style={{
            left: `${particle.x}%`,
            backgroundColor: particle.color,
            width: particle.size,
            height: particle.size,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}

      {/* Message */}
      <div className="relative z-10 text-center px-6 animate-scaleIn">
        <div className="text-6xl mb-6">
          <svg className="w-20 h-20 mx-auto text-[#FF4D00]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
          </svg>
        </div>
        <h2 className="text-3xl font-black text-white mb-4">DAY COMPLETE</h2>
        <p className="text-xl text-[#FF4D00] font-bold">{message}</p>
        <p className="text-sm text-gray-400 mt-6">Tap anywhere to continue</p>
      </div>

      <style jsx>{`
        @keyframes confetti {
          0% {
            transform: translateY(-10px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-confetti {
          animation: confetti 3s ease-out forwards;
        }
        @keyframes scaleIn {
          0% {
            transform: scale(0.5);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-scaleIn {
          animation: scaleIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
