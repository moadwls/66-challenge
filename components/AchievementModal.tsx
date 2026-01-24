'use client';

import { Achievement } from '@/lib/achievements';

type AchievementModalProps = {
  achievement: Achievement;
  onClose: () => void;
};

// Badge icon renderer
const renderBadgeIcon = (iconName: string) => {
  const className = "w-16 h-16 text-white";
  
  switch (iconName) {
    case 'spark':
      return (
        <svg className={className} fill="currentColor" viewBox="0 0 24 24">
          <path d="M13 3L4 14h7v7l9-11h-7V3z"/>
        </svg>
      );
    case 'shield':
      return (
        <svg className={className} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
      );
    case 'bolt':
      return (
        <svg className={className} fill="currentColor" viewBox="0 0 24 24">
          <path d="M11 21h-1l1-7H7.5c-.58 0-.57-.32-.38-.66l5.38-9.84c.1-.18.34-.5.84-.5h1l-1 7h3.5c.49 0 .56.33.38.66l-5.38 9.84c-.1.18-.34.5-.84.5z"/>
        </svg>
      );
    case 'target':
      return (
        <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10"/>
          <circle cx="12" cy="12" r="6"/>
          <circle cx="12" cy="12" r="2"/>
        </svg>
      );
    case 'medal':
      return (
        <svg className={className} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2L9 6.5l-5 1 3.5 3.5L7 16l5-2.5L17 16l-.5-5 3.5-3.5-5-1L12 2zM12 18.5l-4 2.5.8-4.5L5 13l4.5-.5L12 8l2.5 4.5 4.5.5-3.8 3.5.8 4.5-4-2.5z"/>
        </svg>
      );
    case 'star':
      return (
        <svg className={className} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      );
    case 'flame':
      return (
        <svg className={className} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 23c-4.97 0-9-3.58-9-8 0-2.52 1.17-4.83 3-6.36V4a1 1 0 011.97-.24L9 7c.83-.64 1.87-1 3-1s2.17.36 3 1l1.03-3.24A1 1 0 0118 4v4.64c1.83 1.53 3 3.84 3 6.36 0 4.42-4.03 8-9 8zm0-14c-1.1 0-2 .9-2 2v3c0 1.1.9 2 2 2s2-.9 2-2v-3c0-1.1-.9-2-2-2z"/>
        </svg>
      );
    case 'crown':
      return (
        <svg className={className} fill="currentColor" viewBox="0 0 24 24">
          <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm0 2h14v2H5v-2z"/>
        </svg>
      );
    default:
      return (
        <svg className={className} fill="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10"/>
        </svg>
      );
  }
};

export default function AchievementModal({ achievement, onClose }: AchievementModalProps) {
  return (
    <div className="fixed inset-0 bg-black/95 flex items-center justify-center p-6 z-50 animate-fadeIn">
      <div className="max-w-md w-full space-y-6 text-center animate-scaleIn">
        {/* Header */}
        <div className="text-2xl font-black text-[#FF4D00]">
          ACHIEVEMENT UNLOCKED
        </div>

        {/* Badge Display */}
        <div className={`w-32 h-32 mx-auto bg-gradient-to-br ${achievement.color} rounded-full flex items-center justify-center shadow-2xl`}>
          {renderBadgeIcon(achievement.icon)}
        </div>

        {/* Achievement Info */}
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-white">{achievement.name}</h2>
          <p className="text-lg text-gray-400 font-light">{achievement.description}</p>
        </div>

        {/* Celebration Message */}
        <div className="bg-black rounded-2xl p-6 border-2 border-[#FF4D00]/30">
          <p className="text-base text-gray-300 font-light">
            You've unlocked a new achievement! Keep pushing forward!
          </p>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full py-4 bg-gradient-to-r from-[#FF6B35] via-[#FF4D00] to-[#E34400] text-black text-lg font-black rounded-xl active:scale-95 transition-transform shadow-lg"
        >
          CONTINUE
        </button>
      </div>
    </div>
  );
}
