
import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Trash2, Minus, Plus, Gift } from "lucide-react";

export default function ShoppingCartSheet({ 
  isOpen, 
  onClose, 
  cartItems, 
  onUpdateItem, 
  onRemoveItem, 
  onClearCart, 
  onCheckout, 
  calculateTotal, 
  originalTotal, 
  discountAmount, 
  isNewCustomerOfferActive, 
  language, 
  t 
}) {
  const [darkMode, setDarkMode] = useState(false);

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

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className={`flex flex-col p-0 transition-colors duration-300 ${
        darkMode ? 'bg-gray-900 text-white' : 'bg-white text-slate-900'
      }`}>
        <SheetHeader className={`p-6 border-b transition-colors duration-300 ${
          darkMode ? 'border-gray-700' : 'border-slate-200'
        }`}>
          <SheetTitle className="text-xl font-bold">{t.cart}</SheetTitle>
        </SheetHeader>

        {cartItems.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-4 ${
              darkMode ? 'bg-gray-800' : 'bg-slate-100'
            }`}>
              <span className="text-5xl">🛒</span>
            </div>
            <p className={darkMode ? 'text-gray-400' : 'text-slate-600'}>{t.emptyCart}</p>
          </div>
        ) : (
          <ScrollArea className="flex-1">
            <div className="p-6 space-y-4">
              {cartItems.map((item, index) => (
                <div key={item.product.id || index} className={`flex gap-4 items-center p-3 rounded-lg shadow-sm border transition-colors duration-300 ${
                  darkMode 
                    ? 'bg-gray-800 border-gray-700' 
                    : 'bg-slate-50 border-slate-100'
                }`}>
                  <img src={item.product.image_url} alt={item.product.name} className="w-20 h-20 object-cover rounded-md" />
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <p className={`font-semibold line-clamp-2 ${
                        darkMode ? 'text-gray-200' : 'text-slate-800'
                      }`}>{item.product.name}</p>
                      {/* INDICADOR DE DESCONTO NO PRIMEIRO ITEM */}
                      {index === 0 && isNewCustomerOfferActive && (
                        <Badge className="bg-green-500 text-white text-xs ml-2">
                          -20% OFF
                        </Badge>
                      )}
                    </div>
                    <p className={`text-sm ${
                      darkMode ? 'text-gray-400' : 'text-slate-500'
                    }`}>R$ {(item.product.price || 0).toFixed(2).replace('.', ',')}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => onUpdateItem(item.product.id, item.quantity - 1)}>
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => onUpdateItem(item.product.id, item.quantity + 1)}>
                        <Plus className="h-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className={`hover:text-red-500 ${
                    darkMode ? 'text-slate-400 hover:bg-red-900/50' : 'text-slate-500 hover:bg-red-50'
                  }`} onClick={() => onRemoveItem(item.product.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        {cartItems.length > 0 && (
          <SheetFooter className={`p-6 border-t backdrop-blur-sm transition-colors duration-300 ${
            darkMode 
              ? 'border-gray-700 bg-gray-900/80' 
              : 'border-slate-200 bg-slate-50/80'
          }`}>
            <div className="w-full space-y-4">
              <div className="space-y-2">
                {isNewCustomerOfferActive && discountAmount > 0 && (
                  <>
                    <div className="flex justify-between items-center text-sm">
                      <span className={darkMode ? 'text-gray-300' : 'text-slate-600'}>Subtotal:</span>
                      <span className={`line-through ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>
                        R$ {(originalTotal || 0).toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-green-500 font-medium">
                      <span><Gift className="w-4 h-4 inline mr-1" /> Desconto no 1º produto:</span>
                      <span>-R$ {(discountAmount || 0).toFixed(2).replace('.', ',')}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between items-center">
                  <span className={darkMode ? 'text-gray-300' : 'text-slate-600'}>
                    {isNewCustomerOfferActive && discountAmount > 0 ? "Total com Desconto:" : `${t.total}:`}
                  </span>
                  <span className="font-semibold text-xl text-[--store-primary]">
                    R$ {(calculateTotal || 0).toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>

              <Button 
                onClick={onCheckout} 
                className="w-full text-white bg-[--store-primary] hover:opacity-90 transition-opacity shadow-lg"
                size="lg"
              >
                {t.checkout}
              </Button>
              <Button onClick={onClearCart} variant="ghost" className={`w-full hover:text-red-500 ${
                darkMode ? 'text-gray-400' : 'text-slate-500'
              }`}>
                <Trash2 className="h-4 w-4 mr-2" /> Limpar Carrinho
              </Button>
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
