import React, { useState, useEffect } from 'react';
import { Clock, Gift } from 'lucide-react';

export default function OfferCountdownBar({ timeLeft, onExpire }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatTime = (seconds) => {
    if (!seconds || seconds <= 0) {
      onExpire && onExpire();
      return "00:00:00";
    }
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!mounted || !timeLeft || timeLeft <= 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-red-600 via-orange-500 to-red-600 text-white shadow-lg animate-pulse">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Gift className="w-5 h-5 text-yellow-300 animate-bounce" />
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm md:text-base">🔥 DESCONTO ATIVO!</span>
              <span className="hidden md:inline text-sm">Aproveite sua oferta exclusiva!</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-black/30 rounded-lg px-3 py-1">
              <Clock className="w-4 h-4 text-yellow-300" />
              <span className="font-mono font-bold text-lg tracking-wider">
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Barra de progresso animada */}
      <div className="w-full bg-black/20 h-1">
        <div 
          className="h-full bg-yellow-400 transition-all duration-1000 ease-linear"
          style={{ width: `${Math.max(0, (timeLeft / (24 * 3600)) * 100)}%` }}
        ></div>
      </div>
    </div>
  );
}