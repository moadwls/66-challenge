'use client';

import { useState, useRef, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';

interface ShareCardProps {
  onClose: () => void;
}

export default function ShareCard({ onClose }: ShareCardProps) {
  const { data } = useApp();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<'idle' | 'ready' | 'shared'>('idle');
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);

  // Generate image on mount
  useEffect(() => {
    generateImage();
  }, []);

  const generateImage = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High resolution (3x for retina)
    const scale = 3;
    const size = 400;
    canvas.width = size * scale;
    canvas.height = size * scale;
    ctx.scale(scale, scale);

    // Clear - fully transparent
    ctx.clearRect(0, 0, size, size);

    // Load logo
    const logo = new Image();
    logo.crossOrigin = 'anonymous';
    logo.src = '/logo.png';
    
    await new Promise((resolve) => {
      logo.onload = resolve;
      logo.onerror = resolve;
    });

    const centerX = size / 2;
    const centerY = size / 2 - 20; // Move ring up to make room for quote
    const radius = 140;
    const lineWidth = 28; // Thicker ring

    // === CIRCULAR PROGRESS RING ===
    
    // Background ring (dark gray)
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Progress ring (orange gradient)
    const progress = data.currentDay / 66;
    const startAngle = -Math.PI / 2; // Start from top
    const endAngle = startAngle + (progress * Math.PI * 2);

    // Create gradient for the arc
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, '#FF6B35');
    gradient.addColorStop(0.5, '#FF4D00');
    gradient.addColorStop(1, '#E34400');

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.strokeStyle = gradient;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.stroke();

    // === CENTER CONTENT ===

    // Logo at top center - maintain aspect ratio
    const logoSize = 36;
    ctx.drawImage(logo, centerX - logoSize/2, centerY - 55, logoSize, logoSize);

    // "DAY X" - white text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '700 42px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`DAY ${data.currentDay}`, centerX, centerY + 20);

    // "66 CHALLENGE" - white text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '600 14px system-ui, -apple-system, sans-serif';
    ctx.fillText('66 CHALLENGE', centerX, centerY + 45);

    // "Build Unbreakable Discipline" - UNDER the ring, white
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'italic 14px system-ui, -apple-system, sans-serif';
    ctx.fillText('Build Unbreakable Discipline', centerX, size - 30);

    // Create blob for sharing
    canvas.toBlob((blob) => {
      if (blob) {
        setImageBlob(blob);
        setStatus('ready');
      }
    }, 'image/png', 1.0);
  };

  const handleShare = async () => {
    if (!imageBlob) return;

    const file = new File([imageBlob], `day-${data.currentDay}.png`, { type: 'image/png' });

    // Try Web Share API (works great on iOS!)
    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
        });
        setStatus('shared');
        setTimeout(() => onClose(), 1500);
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: download
      const url = URL.createObjectURL(imageBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `day-${data.currentDay}.png`;
      link.click();
      URL.revokeObjectURL(url);
      setStatus('shared');
    }
  };

  const progress = (data.currentDay / 66) * 100;

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center p-6 z-50">
      <div className="w-full max-w-sm">
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 w-10 h-10 rounded-full flex items-center justify-center text-white/50 hover:text-white"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Preview */}
        <div className="mb-8 flex flex-col items-center">
          <div className="relative w-64 h-64">
            {/* Background ring */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="128"
                cy="128"
                r="100"
                stroke="rgba(255,255,255,0.15)"
                strokeWidth="22"
                fill="none"
              />
              <circle
                cx="128"
                cy="128"
                r="100"
                stroke="url(#orangeGradient)"
                strokeWidth="22"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${progress * 6.28} 628`}
              />
              <defs>
                <linearGradient id="orangeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FF6B35" />
                  <stop offset="50%" stopColor="#FF4D00" />
                  <stop offset="100%" stopColor="#E34400" />
                </linearGradient>
              </defs>
            </svg>
            
            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <img src="/logo.png" alt="Logo" className="h-9 w-auto mb-2" />
              <div className="text-white text-3xl font-bold">DAY {data.currentDay}</div>
              <div className="text-white text-xs font-semibold mt-1">66 CHALLENGE</div>
            </div>
          </div>
          
          {/* Quote under the ring */}
          <p className="text-white text-sm italic mt-4">Build Unbreakable Discipline</p>
        </div>

        {/* Hidden canvas */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Share Button */}
        <button
          onClick={handleShare}
          disabled={status === 'idle'}
          className="w-full py-4 bg-gradient-to-r from-[#FF6B35] to-[#FF4D00] text-white text-lg font-bold rounded-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {status === 'shared' ? (
            <>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              Done!
            </>
          ) : (
            <>
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              Share to Stories
            </>
          )}
        </button>
        
        <p className="text-center text-white/30 text-sm mt-4">
          Transparent PNG • Ready for Instagram
        </p>
      </div>
    </div>
  );
}
