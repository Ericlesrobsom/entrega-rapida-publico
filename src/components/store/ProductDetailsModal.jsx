
import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Package, Star, Truck, Mail, X, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import ProductQuestions from "./ProductQuestions";
import ProductReviews from "./ProductReviews";
import ProductReviewModal from "./ProductReviewModal";

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

export default function ProductDetailsModal({ product, isOpen, onClose, onAddToCart, language = 'pt', deliveryMethod, darkMode }) { // Recebe darkMode como prop
  const t = (key) => translations[language][key] || key;
  const [selectedImage, setSelectedImage] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  
  // The darkMode state and its useEffect are removed, as it's now passed as a prop.

  useEffect(() => {
    if (product && isOpen) {
      setSelectedImage(product.image_url);
    }
  }, [product, isOpen]);

  if (!product) return null;

  const currentImage = selectedImage || product.image_url || 'https://via.placeholder.com/500x400?text=Sem+Imagem';
  const totalImages = (product.image_url ? 1 : 0) + (product.additional_images ? product.additional_images.length : 0);

  const handleClose = () => {
    setSelectedImage(null);
    onClose();
  };

  const handleReviewSubmitted = () => {
    setShowReviewModal(false);
    // Potentially add a mechanism to refresh product data or review list if needed
    // For now, closing the modal is sufficient. ProductReviews component can manage its own state.
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className={`max-w-4xl max-h-[90vh] overflow-y-auto transition-colors duration-300 ${
          darkMode 
            ? 'bg-gray-800 border-gray-700 text-white' 
            : 'bg-white border-gray-200 text-gray-900'
        }`}>
          <button
            onClick={handleClose}
            className={`absolute top-4 right-4 z-10 p-2 rounded-full shadow-lg transition-all duration-200 ${
              darkMode 
                ? 'bg-gray-700/80 hover:bg-gray-600/90 text-gray-300 hover:text-white' 
                : 'bg-white/80 hover:bg-white/90 text-slate-600 hover:text-slate-800'
            } backdrop-blur-sm hover:shadow-xl`}
          >
            <X className="w-5 h-5" />
          </button>

          <DialogHeader className="p-4 sm:p-6 pb-0">
            <div className="flex items-start justify-between">
              <DialogTitle className={`text-xl md:text-2xl font-bold pr-12 ${
                darkMode ? 'text-white' : 'text-slate-800'
              }`}>
                {product.name}
              </DialogTitle>
            </div>
          </DialogHeader>

          {/* Main content area, now directly in DialogContent and scrollable with it */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 p-4 sm:p-6">
            {/* Coluna Esquerda - Galeria de Imagens */}
            <div className="space-y-4">
              <div className={`rounded-lg overflow-hidden ${
                darkMode ? 'bg-gray-700' : 'bg-slate-100'
              }`}>
                <img
                  src={currentImage}
                  alt={product.name}
                  className="w-full h-60 md:h-80 object-cover"
                />
              </div>

              {/* Miniaturas das imagens adicionais */}
              {totalImages > 1 && (
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                      {product.image_url && (
                          <button
                              onClick={() => setSelectedImage(product.image_url)}
                              className={`relative rounded-lg overflow-hidden border-2 transition-all ${
                                  selectedImage === product.image_url
                                      ? 'border-blue-500 ring-2 ring-blue-200'
                                      : darkMode 
                                        ? 'border-gray-600 hover:border-gray-500'
                                        : 'border-slate-200 hover:border-slate-300'
                              } ${darkMode ? 'bg-gray-700' : 'bg-slate-100'}`}
                          >
                              <img
                                  src={product.image_url}
                                  alt="Principal"
                                  className="w-full h-16 md:h-20 object-cover"
                              />
                          </button>
                      )}

                      {product.additional_images && product.additional_images.map((image, index) => (
                          <button
                              key={index}
                              onClick={() => setSelectedImage(image)}
                              className={`rounded-lg overflow-hidden border-2 transition-all ${
                                  selectedImage === image
                                      ? 'border-blue-500 ring-2 ring-blue-200'
                                      : darkMode 
                                        ? 'border-gray-600 hover:border-gray-500'
                                        : 'border-slate-200 hover:border-slate-300'
                              } ${darkMode ? 'bg-gray-700' : 'bg-slate-100'}`}
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
              <div className={`text-xs text-center ${
                darkMode ? 'text-gray-400' : 'text-slate-500'
              }`}>
                  {totalImages} imagem(s) disponível(is)
              </div>
            </div>

            {/* Coluna Direita - Detalhes do Produto */}
            <div className="flex flex-col space-y-4">
              <StarRating rating={product.average_rating || 0} reviewsCount={product.reviews_count || 0} language={language} />

              <div className="space-y-4">
                  {/* Descrição Resumida */}
                  {product.description && (
                      <p className={`text-sm italic ${
                        darkMode ? 'text-gray-300' : 'text-slate-600'
                      }`}>
                          "{product.description}"
                      </p>
                  )}

                  {/* Selo de verificação e garantia */}
                  {product.is_verified && (
                    <div className={`border rounded-lg p-3 ${
                      darkMode 
                        ? 'bg-blue-900/20 border-blue-700' 
                        : 'bg-blue-50 border-blue-200'
                    }`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-blue-600">✓</span>
                        <span className={`font-medium text-sm ${
                          darkMode ? 'text-blue-300' : 'text-blue-800'
                        }`}>Produto Verificado</span>
                      </div>
                      {product.warranty_info && (
                        <p className={`text-xs ${
                          darkMode ? 'text-blue-400' : 'text-blue-700'
                        }`}>
                          🛡️ {product.warranty_info} de garantia oficial
                        </p>
                      )}
                    </div>
                  )}

                  {/* Descrição Detalhada */}
                  {product.description_popup && (
                      <div>
                          <h3 className={`font-semibold mb-2 border-b pb-1 ${
                            darkMode 
                              ? 'text-white border-gray-600' 
                              : 'text-slate-800 border-gray-200'
                          }`}>Descrição Detalhada</h3>
                          <div className={`prose prose-sm max-w-none ${
                            darkMode ? 'text-gray-300' : 'text-slate-600'
                          }`}>
                              <div dangerouslySetInnerHTML={{ __html: product.description_popup.replace(/\n/g, '<br />') }} />
                          </div>
                      </div>
                  )}
              </div>

              {/* Stock Quantity */}
              {product.stock_quantity !== null && (
                <div className="flex items-center gap-2">
                  <Package className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-slate-500'}`} />
                  <span className={`font-semibold ${
                    product.stock_quantity <= 0 ? 'text-red-500' :
                    product.stock_quantity <= 5 ? 'text-orange-500' : 'text-green-600'
                  }`}>
                    {product.stock_quantity > 0 ? `${product.stock_quantity} ${t('inStock')}` : t('outOfStock')}
                  </span>
                </div>
              )}

              {/* Botões de ação */}
              <div className={`space-y-3 pt-4 border-t ${
                darkMode ? 'border-gray-600' : 'border-gray-200'
              }`}>
                <Button
                  onClick={() => {
                    onAddToCart(product);
                    onClose();
                  }}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3"
                  disabled={product.stock_quantity <= 0}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {product.stock_quantity > 0 ? `Adicionar ao Carrinho - R$ ${product.price?.toFixed(2).replace('.', ',')}` : t('outOfStock')}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setShowReviewModal(true)}
                  className={`w-full border-blue-500 text-blue-600 hover:bg-blue-50 ${
                    darkMode ? 'hover:bg-blue-900/20 hover:text-blue-400' : ''
                  }`}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  ⭐ Avaliar este Produto
                </Button>
              </div>

              {/* Informações de entrega */}
              {deliveryMethod && (
                <div className={`p-4 rounded-lg space-y-2 ${
                  darkMode ? 'bg-gray-700' : 'bg-slate-50'
                }`}>
                  <h4 className={`font-semibold ${
                    darkMode ? 'text-white' : 'text-slate-900'
                  }`}>Informações de Entrega</h4>
                  <div className="flex items-center gap-2">
                    {deliveryMethod.icon ? (
                      <span className="text-lg">{deliveryMethod.icon}</span>
                    ) : (
                      <Truck className="w-5 h-5" />
                    )}
                    <div>
                      <p className={`font-medium ${
                        darkMode ? 'text-white' : 'text-slate-800'
                      }`}>{deliveryMethod.name}</p>
                      <p className={`text-sm ${
                        darkMode ? 'text-gray-300' : 'text-slate-600'
                      }`}>{deliveryMethod.description}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Seção de Avaliações */}
              <div className={`pt-4 border-t ${
                darkMode ? 'border-gray-600' : 'border-gray-200'
              }`}>
                <ProductReviews productId={product.id} />
              </div>
            </div>
          </div>

          {/* Seção de Perguntas e Respostas */}
          <div className="px-4 sm:px-6 pb-4">
            <ProductQuestions productId={product.id} productName={product.name} />
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Avaliação */}
      <ProductReviewModal
        product={product}
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        onReviewSubmitted={handleReviewSubmitted}
      />
    </>
  );
}
