
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Gift, Zap, Clock, Star, Sparkles } from "lucide-react";

export default function NewCustomerOfferModal({ isOpen, onClose, onActivate, timeLeft }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatTimeLeft = (seconds) => {
    if (!seconds || seconds <= 0) return "24:00 HORAS restantes";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // FUNÇÃO PARA FECHAR SEM ATIVAR - MARCA COMO JÁ MOSTRADO
  const handleClose = () => {
    // Marcar que já foi mostrado para este usuário
    if (typeof window !== 'undefined') {
      localStorage.setItem('newCustomerOfferShown', 'true');
    }
    onClose();
  };

  if (!mounted) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg border-0 overflow-hidden p-0 bg-transparent">
        <div className="relative bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 text-white overflow-hidden rounded-2xl shadow-2xl">
          {/* Efeitos de fundo animados */}
          <div className="absolute inset-0">
            {/* Gradiente animado */}
            <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 via-transparent to-pink-400/20 animate-pulse"></div>
            
            {/* Círculos decorativos */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-yellow-300/20 rounded-full blur-xl animate-bounce"></div>
            <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-orange-300/20 rounded-full blur-lg animate-pulse"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>

            {/* Estrelas brilhantes */}
            <Sparkles className="absolute top-8 right-8 w-6 h-6 text-yellow-300 animate-pulse" />
            <Star className="absolute top-16 left-8 w-4 h-4 text-yellow-200 animate-bounce" />
            <Sparkles className="absolute bottom-12 right-16 w-5 h-5 text-orange-200 animate-pulse" />
          </div>
          
          <div className="relative z-10 p-8 text-center space-y-6">
            {/* Ícone principal animado */}
            <div className="relative">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                <Gift className="w-10 h-10 text-orange-800" />
              </div>
              {/* Círculo de brilho */}
              <div className="absolute inset-0 w-20 h-20 mx-auto border-4 border-yellow-300/50 rounded-full animate-ping"></div>
            </div>

            {/* Título principal */}
            <div className="space-y-2">
              <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-yellow-200 to-white bg-clip-text text-transparent">
                🎉 Oferta Exclusiva!
              </h2>
              <p className="text-orange-100 font-medium">
                Parabéns por se cadastrar! Ganhe um desconto especial:
              </p>
            </div>

            {/* Oferta principal */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-inner">
              <div className="space-y-2">
                <p className="text-6xl font-black text-yellow-300 drop-shadow-lg">
                  20% OFF
                </p>
                <p className="text-lg font-bold text-white">
                  em qualquer produto da loja!
                </p>
                <p className="text-sm text-orange-100 font-medium">
                  ⚡ Válido para apenas 1 produto
                </p>
              </div>
            </div>

            {/* Timer de urgência */}
            <div className="bg-red-600/20 backdrop-blur-sm rounded-xl p-4 border border-red-400/30">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-yellow-300 animate-pulse" />
                <span className="text-yellow-300 font-semibold">Tempo restante:</span>
              </div>
              <div className="text-2xl font-mono font-bold text-white bg-black/30 rounded-lg px-4 py-2 inline-block">
                {formatTimeLeft(timeLeft)}
              </div>
            </div>
            
            {/* Botões de ação */}
            <div className="space-y-3">
              <Button
                onClick={onActivate}
                size="lg"
                className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-black text-lg shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-200 border-2 border-yellow-300"
              >
                <Zap className="w-6 h-6 mr-2" />
                🚀 ATIVAR DESCONTO AGORA!
              </Button>

              <Button
                onClick={handleClose}
                variant="ghost"
                className="w-full text-orange-200 hover:text-white hover:bg-white/10 transition-colors"
              >
                Não, talvez depois
              </Button>
            </div>

            {/* Aviso de urgência */}
            <p className="text-xs text-orange-200 font-medium">
              ⏰ Esta oferta expira automaticamente em 24 horas!
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
