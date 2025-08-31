
import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Trash2, ShoppingCart, Minus, Plus } from "lucide-react";

const translations = {
  pt: {
    title: "Seu Carrinho",
    emptyTitle: "Seu carrinho está vazio",
    emptySubtitle: "Adicione produtos para começar.",
    subtotal: "Subtotal",
    checkout: "Finalizar Compra"
  },
  en: {
    title: "Your Cart",
    emptyTitle: "Your cart is empty",
    emptySubtitle: "Add products to get started.",
    subtotal: "Subtotal",
    checkout: "Checkout"
  }
};

export default function ShoppingCartSheet({ 
  isOpen, 
  onClose, 
  cartItems = [], 
  onUpdateItem, 
  onRemoveItem, 
  onClearCart, 
  onCheckout, 
  calculateTotal, 
  language = 'pt', 
  t 
}) {
  // Função simples de tradução
  const getTranslation = (key) => {
    if (t && typeof t === 'object' && t[key]) {
      return t[key];
    }
    return translations[language][key] || key;
  };

  // Calcular subtotal
  const subtotal = calculateTotal ? calculateTotal() : 
    cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle className="text-2xl font-bold">{getTranslation('title')}</SheetTitle>
        </SheetHeader>
        
        {!cartItems || cartItems.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <ShoppingCart className="w-24 h-24 text-slate-300 mb-4" />
            <h3 className="text-xl font-semibold text-slate-800">{getTranslation('emptyTitle')}</h3>
            <p className="text-slate-500 mt-2">{getTranslation('emptySubtitle')}</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto -mx-6 px-6 py-4">
            <div className="space-y-4">
              {cartItems.map(item => (
                <div key={item.product?.id || item.id} className="flex gap-4">
                  <img 
                    src={item.product?.image_url || item.image_url || 'https://via.placeholder.com/80x80?text=Produto'} 
                    alt={item.product?.name || item.name} 
                    className="w-20 h-20 object-cover rounded-lg" 
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold">{item.product?.name || item.name}</h4>
                    <p className="text-slate-500">R$ {(item.product?.price || item.price || 0).toFixed(2)}</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border rounded-md">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8" 
                          onClick={() => onUpdateItem && onUpdateItem(item.product?.id || item.id, item.quantity - 1)}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="px-2">{item.quantity}</span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8" 
                          onClick={() => onUpdateItem && onUpdateItem(item.product?.id || item.id, item.quantity + 1)}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => onRemoveItem && onRemoveItem(item.product?.id || item.id)}
                        className="hover:bg-red-50 p-2 rounded-full shadow-md hover:shadow-lg transition-all duration-200"
                      >
                        <Trash2 className="w-4 h-4 text-red-500 hover:text-red-600" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {cartItems && cartItems.length > 0 && (
          <SheetFooter className="border-t pt-6">
            <div className="w-full space-y-4">
              <div className="flex justify-between font-semibold text-lg">
                <span>{getTranslation('subtotal')}</span>
                <span>R$ {subtotal.toFixed(2)}</span>
              </div>
              <Button 
                size="lg" 
                className="w-full text-white" 
                style={{ backgroundColor: 'var(--store-primary)' }}
                onClick={onCheckout}
              >
                {getTranslation('checkout')}
              </Button>
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
