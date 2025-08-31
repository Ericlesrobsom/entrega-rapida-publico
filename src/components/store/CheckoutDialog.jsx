
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, CreditCard } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from 'react-hot-toast'; // Assuming react-hot-toast for direct toast.error usage

export default function CheckoutDialog({ isOpen, onClose, onSubmit, isSubmitting, user, cartItems, total, paymentMethods = [], t }) {
  const [customerData, setCustomerData] = useState({
    name: '',
    phone: '',
    address: '',
    notes: ''
  });
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);

  useEffect(() => {
    if (user) {
      setCustomerData(prev => ({
        ...prev,
        name: user.full_name || '',
      }));
    }
    // Seleciona a primeira forma de pagamento como padrão
    if (paymentMethods.length > 0) {
      setSelectedPaymentMethod(paymentMethods[0].id);
    }
  }, [user, paymentMethods]);

  const handleChange = (field, value) => {
    setCustomerData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedPaymentMethod) {
      toast.error("Por favor, selecione uma forma de pagamento.");
      return;
    }
    const paymentMethodDetails = paymentMethods.find(p => p.id === selectedPaymentMethod);
    onSubmit({
        ...customerData,
        payment_method: paymentMethodDetails?.name || "Não especificado"
    });
  };
  
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0">
        <form onSubmit={handleSubmit} className="flex flex-col max-h-[90vh]">
          <DialogHeader className="p-6 pb-4 border-b flex-shrink-0">
            <DialogTitle className="text-2xl">{t.checkout}</DialogTitle>
            <DialogDescription>
              Confirme seus dados e escolha a forma de pagamento.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-grow overflow-y-auto p-6 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input id="name" value={customerData.name} onChange={(e) => handleChange('name', e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone (WhatsApp)</Label>
                <Input id="phone" value={customerData.phone} onChange={(e) => handleChange('phone', e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Endereço Completo para Entrega</Label>
                <Textarea id="address" value={customerData.address} onChange={(e) => handleChange('address', e.target.value)} required />
              </div>
               <div className="space-y-2">
                <Label htmlFor="notes">Observações (opcional)</Label>
                <Textarea id="notes" value={customerData.notes} onChange={(e) => handleChange('notes', e.target.value)} placeholder="Ex: Ponto de referência, tirar a cebola, etc." />
              </div>
            </div>

            {/* Resumo do Pedido */}
            <div className="p-4 bg-slate-50 rounded-lg space-y-2">
              <h4 className="font-semibold">Resumo do Pedido</h4>
              {cartItems.map(item => (
                <div key={item.product.id} className="flex justify-between text-sm">
                  <span>{item.quantity}x {item.product.name}</span>
                  <span>R$ {(item.product.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total</span>
                <span>R$ {total.toFixed(2)}</span>
              </div>
            </div>

             {/* Formas de Pagamento */}
            <div className="space-y-4">
                <Label className="font-semibold text-base">Forma de Pagamento</Label>
                <RadioGroup value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod} className="space-y-2">
                    {paymentMethods.map(method => (
                        <Label key={method.id} htmlFor={method.id} className="flex items-start gap-4 p-4 border rounded-lg cursor-pointer hover:bg-slate-50 has-[:checked]:bg-blue-50 has-[:checked]:border-blue-400">
                             <RadioGroupItem value={method.id} id={method.id} />
                            <div className="flex-1">
                                <div className="flex items-center gap-2 font-medium">
                                    <span>{method.icon}</span>
                                    <span>{method.name}</span>
                                </div>
                                {method.instructions && <p className="text-sm text-slate-600 mt-1">{method.instructions}</p>}
                            </div>
                        </Label>
                    ))}
                </RadioGroup>
            </div>
          </div>

          <DialogFooter className="p-6 border-t flex-shrink-0">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || !selectedPaymentMethod}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isSubmitting ? "Finalizando..." : "Confirmar Pedido"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
