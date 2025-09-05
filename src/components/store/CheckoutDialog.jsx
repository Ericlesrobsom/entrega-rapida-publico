
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Loader2, ShoppingCart, CreditCard, Ticket } from "lucide-react"; // Added Ticket icon
import { Coupon } from "@/api/entities";
import { toast } from "sonner";

export default function CheckoutDialog({ isOpen, onClose, onSubmit, isSubmitting, user, cartItems, total, paymentMethods = [], t }) {
  const [darkMode, setDarkMode] = useState(false);
  const [customerData, setCustomerData] = useState({
    name: user?.full_name || "",
    phone: "",
    address: "",
    notes: "",
    payment_method: "", // Will store the name of the selected payment method
    coupon_code: "",
    discount_amount: 0,
    final_total: total
  });
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setDarkMode(isDark);

    const observer = new MutationObserver(() => {
      const newIsDark = document.documentElement.classList.contains('dark');
      setDarkMode(newIsDark);
    });

    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    // Initialize customer name from user data and final_total
    setCustomerData(prev => ({
      ...prev,
      name: user?.full_name || prev.name,
      final_total: total,
      discount_amount: 0, // Reset discount if total changes or dialog reopens
      coupon_code: '', // Clear coupon on dialog open
    }));
    setAppliedCoupon(null); // Clear applied coupon on dialog open
  }, [user, total, isOpen]); // Rerun when user or total changes, or dialog opens/closes

  const handleCouponApply = async () => {
    if (!customerData.coupon_code.trim()) {
      toast.error("Digite um código de cupom.");
      return;
    }

    setIsValidatingCoupon(true);
    try {
      const coupons = await Coupon.filter({
        code: customerData.coupon_code.trim().toUpperCase(),
        is_active: true
      });

      if (coupons.length === 0) {
        toast.error("Cupom não encontrado ou inativo.");
        setAppliedCoupon(null);
        setCustomerData(prev => ({
          ...prev,
          discount_amount: 0,
          final_total: total // Reset total
        }));
        setIsValidatingCoupon(false);
        return;
      }

      const coupon = coupons[0];

      if (coupon.current_uses >= coupon.max_uses) {
        toast.error("Este cupom já atingiu o número máximo de utilizações.");
        setAppliedCoupon(null);
        setCustomerData(prev => ({
          ...prev,
          discount_amount: 0,
          final_total: total // Reset total
        }));
        setIsValidatingCoupon(false);
        return;
      }

      if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
        toast.error("Este cupom já expirou.");
        setAppliedCoupon(null);
        setCustomerData(prev => ({
          ...prev,
          discount_amount: 0,
          final_total: total // Reset total
        }));
        setIsValidatingCoupon(false);
        return;
      }

      const discount = (total * coupon.discount_percentage) / 100;
      const final = total - discount;

      setAppliedCoupon(coupon);
      setCustomerData(prev => ({
        ...prev,
        discount_amount: discount,
        final_total: final
      }));
      toast.success(`Cupom aplicado! Desconto de ${coupon.discount_percentage}%`);
    } catch (error) {
      console.error("Erro ao aplicar cupom:", error);
      toast.error("Erro ao verificar cupom.");
      setAppliedCoupon(null);
      setCustomerData(prev => ({
        ...prev,
        discount_amount: 0,
        final_total: total // Reset total
      }));
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCustomerData(prev => ({
      ...prev,
      coupon_code: '',
      discount_amount: 0,
      final_total: total
    }));
    toast.info("Cupom removido.");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customerData.name || !customerData.phone || !customerData.address || !customerData.payment_method) {
      toast.error("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    // If a coupon was applied and is valid, increment its usage before submitting the order
    if (appliedCoupon) {
      try {
        await Coupon.update(appliedCoupon.id, {
          current_uses: appliedCoupon.current_uses + 1
        });
        // Optionally, update local state or re-fetch coupon if needed,
        // but for checkout, incrementing and proceeding is usually enough.
      } catch (error) {
        console.error("Erro ao atualizar uso do cupom:", error);
        toast.error("Erro ao processar cupom. Tente novamente.");
        return; // Prevent submission if coupon update fails
      }
    }

    onSubmit(customerData);
  };

  const formatPrice = (value) => {
    return parseFloat(value).toFixed(2).replace('.', ',');
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`sm:max-w-2xl max-h-[90vh] overflow-hidden transition-colors duration-300 ${
        darkMode ? 'bg-gray-800 text-white' : 'bg-white text-slate-900'
      }`}>
        <DialogHeader>
          <DialogTitle className="text-xl text-[--store-primary] flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Finalizar Pedido
          </DialogTitle>
          <DialogDescription className={darkMode ? 'text-gray-400' : 'text-slate-600'}>
            Preencha seus dados para concluir a compra
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh]">
          <form onSubmit={handleSubmit} className="space-y-6 p-1">
            {/* Dados do Cliente */}
            <div className="space-y-4">
              <h3 className={`font-semibold text-lg ${darkMode ? 'text-gray-200' : 'text-slate-800'}`}>Dados do Cliente</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo *</Label>
                  <Input
                    id="name"
                    value={customerData.name}
                    onChange={(e) => setCustomerData({...customerData, name: e.target.value})}
                    placeholder="Seu nome completo"
                    required
                    className={darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone/WhatsApp *</Label>
                  <Input
                    id="phone"
                    value={customerData.phone}
                    onChange={(e) => setCustomerData({...customerData, phone: e.target.value})}
                    placeholder="(11) 99999-9999"
                    required
                    className={darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Endereço de Entrega *</Label>
                <Textarea
                  id="address"
                  value={customerData.address}
                  onChange={(e) => setCustomerData({...customerData, address: e.target.value})}
                  placeholder="Rua, número, complemento, bairro, cidade - CEP"
                  required
                  className={darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}
                />
              </div>
            </div>

            <Separator className={darkMode ? 'border-gray-700' : 'border-slate-200'} />

            {/* Resumo do Pedido */}
            <div className="space-y-4">
              <h3 className={`font-semibold text-lg ${darkMode ? 'text-gray-200' : 'text-slate-800'}`}>Resumo do Pedido</h3>
              
              {cartItems.map((item, index) => (
                <div key={item.product.id || index} className={`flex justify-between items-center p-2 rounded transition-colors duration-300 ${
                  darkMode ? 'bg-gray-700/50' : 'bg-slate-50'
                }`}>
                  <div>
                    <p className={`font-medium ${darkMode ? 'text-gray-200' : 'text-slate-800'}`}>{item.product.name}</p>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>
                      {item.quantity}x R$ {formatPrice(item.product.price)}
                    </p>
                  </div>
                  <p className="font-semibold text-[--store-primary]">R$ {formatPrice(item.product.price * item.quantity)}</p>
                </div>
              ))}

              {/* Cupom */}
              <div className="space-y-2">
                <Label htmlFor="coupon" className="flex items-center gap-2 text-orange-500 font-semibold">
                  <Ticket className="w-5 h-5"/>
                  Cupom de Desconto (opcional)
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="coupon"
                    value={customerData.coupon_code}
                    onChange={(e) => setCustomerData({...customerData, coupon_code: e.target.value.toUpperCase()})}
                    placeholder="Digite o código do cupom"
                    disabled={appliedCoupon || isValidatingCoupon}
                    className={darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCouponApply}
                    disabled={!customerData.coupon_code || isValidatingCoupon || appliedCoupon}
                    className="bg-orange-500 hover:bg-orange-600 text-white border border-orange-500"
                    style={{
                      borderColor: '#f97316',
                      backgroundColor: '#f97316'
                    }}
                  >
                    {isValidatingCoupon ? <Loader2 className="w-4 h-4 animate-spin" /> : "Aplicar"}
                  </Button>
                </div>
                {appliedCoupon && (
                  <div className="flex items-center justify-between bg-green-100 p-3 rounded-lg dark:bg-green-800 dark:text-green-50">
                    <div className="flex items-center gap-2">
                      <span className="text-green-800 font-semibold dark:text-green-50">{appliedCoupon.code}</span>
                      <span className="text-green-600 dark:text-green-200">(-{appliedCoupon.discount_percentage}%)</span>
                    </div>
                    <Button
                      type="button"
                      onClick={handleRemoveCoupon}
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:bg-red-100 dark:text-red-300 dark:hover:bg-red-900"
                    >
                      Remover
                    </Button>
                  </div>
                )}
              </div>

              {/* Total */}
              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-gray-700">
                <div className={`flex justify-between ${darkMode ? 'text-gray-300' : 'text-slate-700'}`}>
                  <span>Subtotal:</span>
                  <span>R$ {formatPrice(total)}</span>
                </div>
                {customerData.discount_amount > 0 && (
                  <div className="flex justify-between text-green-600 dark:text-green-400">
                    <span>Desconto ({appliedCoupon?.code}):</span>
                    <span>-R$ {formatPrice(customerData.discount_amount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xl font-bold text-[--store-primary]">
                  <span>Total:</span>
                  <span>R$ {formatPrice(customerData.final_total)}</span>
                </div>
              </div>
            </div>

            <Separator className={darkMode ? 'border-gray-700' : 'border-slate-200'} />

            {/* Forma de Pagamento */}
            <div className="space-y-4">
              <h3 className={`font-semibold text-lg ${darkMode ? 'text-gray-200' : 'text-slate-800'} flex items-center gap-2`}>
                <CreditCard className="w-5 h-5" />
                Forma de Pagamento *
              </h3>
              
              <Select value={customerData.payment_method} onValueChange={(value) => setCustomerData({...customerData, payment_method: value})}>
                <SelectTrigger className={darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}>
                  <SelectValue placeholder="Escolha a forma de pagamento" />
                </SelectTrigger>
                <SelectContent className={darkMode ? 'bg-gray-800 text-white' : 'bg-white text-slate-900'}>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method.id} value={method.name}>
                      <div className="flex items-center gap-2">
                        <span>{method.icon || '💳'}</span>
                        <span>{method.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Observações */}
            <div className="space-y-2">
              <Label htmlFor="notes">Observações (opcional)</Label>
              <Textarea
                id="notes"
                value={customerData.notes}
                onChange={(e) => setCustomerData({...customerData, notes: e.target.value})}
                placeholder="Alguma observação sobre o pedido?"
                className={darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}
              />
            </div>

            {/* Botões */}
            <div className="flex gap-4 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || !customerData.payment_method}
                className="flex-1 bg-[--store-primary] text-white hover:opacity-90 transition-opacity"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : (
                  `Finalizar Pedido - R$ ${formatPrice(customerData.final_total)}`
                )}
              </Button>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
