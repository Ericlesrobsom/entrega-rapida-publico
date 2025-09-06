import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Gift } from "lucide-react";

export default function OrderSuccessDialog({ isOpen, onClose, orderId }) {
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <DialogTitle className="text-2xl text-green-600">Pedido Realizado!</DialogTitle>
        </DialogHeader>
        
        <div className="text-center space-y-4">
          <p className="text-gray-600">
            Seu pedido <strong>#{orderId}</strong> foi realizado com sucesso!
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-blue-800 mb-2">
              <Gift className="w-5 h-5" />
              <span className="font-semibold">Acesso Liberado!</span>
            </div>
            <p className="text-blue-700 text-sm">
              Se você comprou um curso, o acesso já foi liberado automaticamente. 
              Vá para "Meu Perfil" para acessar seus cursos.
            </p>
          </div>
          
          <div className="flex flex-col gap-2">
            <Button 
              onClick={() => window.location.href = '/MyProfile'}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Ver Meus Cursos
            </Button>
            <Button variant="outline" onClick={onClose}>
              Continuar Navegando
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}