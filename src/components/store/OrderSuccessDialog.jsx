import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';

export default function OrderSuccessDialog({ isOpen, onClose, orderId }) {
    
    const handleClose = () => {
        // Tenta chamar a função global para recarregar o acesso do usuário
        if (typeof window !== 'undefined' && window.refreshUserAccess) {
            window.refreshUserAccess();
        }
        onClose();
    };
    
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader className="text-center items-center">
          <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
          <DialogTitle className="text-2xl font-bold">Pedido Realizado com Sucesso!</DialogTitle>
          <DialogDescription className="text-slate-600">
            Seu pedido #{orderId?.slice(-6).toUpperCase()} foi confirmado. Você pode acompanhar o status na seção "Meus Pedidos".
          </DialogDescription>
        </DialogHeader>
        <div className="mt-6 flex flex-col gap-3">
            <Button asChild className="w-full" onClick={handleClose}>
              <Link to="/MyOrders">
                Ver Meus Pedidos
              </Link>
            </Button>
            <Button variant="outline" className="w-full" onClick={handleClose}>
                Continuar Comprando
            </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}