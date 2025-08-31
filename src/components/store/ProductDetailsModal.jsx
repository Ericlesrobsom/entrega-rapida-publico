
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Package, Star, Truck, Mail, X } from "lucide-react";
import ProductQuestions from "./ProductQuestions";

const translations = {
  pt: {
    addToCart: "Adicionar ao carrinho",
    outOfStock: "Esgotado",
    reviews: "avaliações",
    inStock: "em estoque",
    units: "unidades"
  },
  en: {
    addToCart: "Add to cart",
    outOfStock: "Out of stock",
    reviews: "reviews",
    inStock: "in stock",
    units: "units"
  }
};

const StarRating = ({ rating, reviewsCount, language = 'pt' }) => {
  // Local t function for StarRating to access translations
  const t = (key) => translations[language][key] || key;

  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 !== 0;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  if (rating === 0) return null;

  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="flex items-center text-yellow-500">
        {[...Array(fullStars)].map((_, i) => <Star key={`full-${i}`} className="w-5 h-5 fill-current" />)}
        {halfStar && <Star key="half" className="w-5 h-5" style={{ clipPath: 'polygon(0 0, 50% 0, 50% 100%, 0 100%)', fill: 'currentColor' }} />}
        {[...Array(emptyStars)].map((_, i) => <Star key={`empty-${i}`} className="w-5 h-5" />)}
      </div>
      <span className="text-sm text-slate-600">{reviewsCount} {t('reviews')}</span>
    </div>
  );
};

export default function ProductDetailsModal({ product, isOpen, onClose, onAddToCart, language = 'pt', deliveryMethod }) {
  const t = (key) => translations[language][key] || key;
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    if (product) {
      // Set the initial selected image to the main product image
      setSelectedImage(product.image_url);
    }
  }, [product]);

  if (!product) return null;

  // Default to product.image_url if no image is selected yet, or a placeholder
  const currentImage = selectedImage || product.image_url || 'https://via.placeholder.com/500x400?text=Sem+Imagem';

  // Handle closing the modal and resetting selected image
  const handleClose = () => {
    setSelectedImage(null); // Reset selected image when closing
    onClose();
  };

  const totalImages = (product.image_url ? 1 : 0) + (product.additional_images ? product.additional_images.length : 0);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg lg:max-w-4xl p-0 max-h-[90vh] flex flex-col">
        {/* Botão fechar com sombra melhorada */}
        <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-10 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl hover:bg-white/90 transition-all duration-200"
        >
            <X className="w-5 h-5 text-slate-600 hover:text-slate-800" />
        </button>

        <DialogHeader className="p-4 sm:p-6 pb-0 flex-shrink-0">
          <DialogTitle className="text-xl md:text-2xl font-bold text-slate-800 pr-12">{product.name}</DialogTitle>
        </DialogHeader>

        <div className="flex-grow overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 p-4 sm:p-6">
            {/* Galeria de Imagens - Responsiva */}
            <div className="space-y-4">
                <div className="bg-slate-100 rounded-lg overflow-hidden">
                    <img
                        src={currentImage}
                        alt={product.name}
                        className="w-full h-60 md:h-80 object-cover"
                    />
                </div>
                
                {/* Miniaturas das imagens adicionais - Mais espaço para até 7 */}
                {totalImages > 1 && (
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                        {product.image_url && (
                            <button
                                onClick={() => setSelectedImage(product.image_url)}
                                className={`relative bg-slate-100 rounded-lg overflow-hidden border-2 transition-all ${
                                    selectedImage === product.image_url 
                                        ? 'border-blue-500 ring-2 ring-blue-200' 
                                        : 'border-slate-200 hover:border-slate-300'
                                }`}
                            >
                                <img
                                    src={product.image_url}
                                    alt="Principal"
                                    className="w-full h-16 md:h-20 object-cover"
                                />
                                <div className="absolute bottom-0 left-0 right-0 bg-blue-500 text-white text-xs text-center py-1">
                                    Principal
                                </div>
                            </button>
                        )}
                        
                        {product.additional_images && product.additional_images.map((image, index) => (
                            <button
                                key={index}
                                onClick={() => setSelectedImage(image)}
                                className={`bg-slate-100 rounded-lg overflow-hidden border-2 transition-all ${
                                    selectedImage === image 
                                        ? 'border-blue-500 ring-2 ring-blue-200' 
                                        : 'border-slate-200 hover:border-slate-300'
                                }`}
                            >
                                <img
                                    src={image}
                                    alt={`Imagem ${index + 2}`}
                                    className="w-full h-16 md:h-20 object-cover"
                                />
                            </button>
                        ))}
                    </div>
                )}
                
                <div className="text-xs text-slate-500 text-center">
                    {totalImages} imagem(s) disponível(is)
                </div>
            </div>

            {/* Detalhes do Produto */}
            <div className="flex flex-col space-y-4">
              <StarRating rating={product.average_rating || 0} reviewsCount={product.reviews_count || 0} language={language} />

              <div className="space-y-4">
                  {/* Descrição Resumida */}
                  {product.description && (
                      <p className="text-slate-600 text-sm italic">
                          "{product.description}"
                      </p>
                  )}

                  {/* Selo de verificação e garantia */}
                  {product.is_verified && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-blue-600">✓</span>
                        <span className="text-blue-800 font-medium text-sm">Produto Verificado</span>
                      </div>
                      {product.warranty_info && (
                        <p className="text-blue-700 text-xs">
                          🛡️ {product.warranty_info} de garantia oficial
                        </p>
                      )}
                    </div>
                  )}

                  {/* Descrição Detalhada */}
                  {product.description_popup && (
                      <div>
                          <h3 className="font-semibold text-slate-800 mb-2 border-b pb-1">Descrição Detalhada</h3>
                          <div className="prose prose-sm max-w-none text-slate-600">
                              <div dangerouslySetInnerHTML={{ __html: product.description_popup.replace(/\n/g, '<br />') }} />
                          </div>
                      </div>
                  )}
              </div>
              
              {deliveryMethod && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  {deliveryMethod.icon ? (
                    <span>{deliveryMethod.icon}</span>
                  ) : (
                    <Truck className="w-4 h-4" />
                  )}
                  <span>{deliveryMethod.name}</span>
                </div>
              )}

              {product.stock_quantity !== null && (
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-slate-500" />
                  <span className={`font-semibold ${
                    product.stock_quantity <= 0 ? 'text-red-500' :
                    product.stock_quantity <= 5 ? 'text-orange-500' : 'text-green-600'
                  }`}>
                    {product.stock_quantity > 0 ? `${product.stock_quantity} ${t('inStock')}` : t('outOfStock')}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Seção de Perguntas e Respostas */}
          <div className="px-4 sm:px-6 pb-4">
            <ProductQuestions productId={product.id} productName={product.name} />
          </div>
        </div>

        {/* Footer fixo */}
        <div className="p-4 sm:p-6 border-t bg-white flex-shrink-0">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-2xl sm:text-3xl font-bold text-slate-800">
              R$ {product.price.toFixed(2).replace('.', ',')}
            </p>

            <Button
              size="lg"
              className="w-full sm:w-auto text-white"
              style={{ backgroundColor: 'var(--store-primary)' }}
              disabled={product.stock_quantity <= 0}
              onClick={() => {
                onAddToCart(product);
                handleClose();
              }}
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              {product.stock_quantity > 0 ? t('addToCart') : t('outOfStock')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
