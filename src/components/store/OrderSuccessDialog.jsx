import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from 'lucide-react';
import { createPageUrl } from '@/utils';

export default function OrderSuccessDialog({ isOpen, onClose, orderId }) {
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md text-center">
        <DialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mb-4">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
          </div>
          <DialogTitle className="text-2xl">Pedido realizado com sucesso!</DialogTitle>
          <DialogDescription className="pt-2">
            Seu pedido #{orderId?.slice(-6).toUpperCase()} foi criado. <br />
            Você pode acompanhar o status na seção "Meus Pedidos".
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center gap-4 mt-4">
          <Button variant="outline" onClick={onClose}>
            Continuar Comprando
          </Button>
          <Button asChild>
            <a href={createPageUrl('MyOrders')}>Ver Meus Pedidos</a>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}