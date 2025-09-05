
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Package, Star, Truck, Mail, Eye, MessageCircle } from "lucide-react";

const translations = {
  pt: {
    addToCart: "Adicionar ao carrinho",
    outOfStock: "Esgotado",
    reviews: "avaliações",
    inStock: "em estoque",
    units: "unidades",
    viewDetails: "Ver detalhes",
    buy: "Comprar", // Added for responsive cart button text
    details: "Detalhes" // Added for responsive details button text
  },
  en: {
    addToCart: "Add to cart",
    outOfStock: "Out of stock",
    reviews: "reviews",
    inStock: "in stock",
    units: "units",
    viewDetails: "View details",
    buy: "Buy", // Added for responsive cart button text
    details: "Details" // Added for responsive details button text
  }
};

const StarRating = ({ rating, reviewsCount, language = 'pt' }) => {
  const t = (key) => translations[language][key] || key;
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 !== 0;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  if (rating === 0) {
    return <div className="h-5 mb-2"></div>;
  }

  return (
    <div className="flex items-center gap-2 mb-2">
      <div className="flex items-center text-yellow-500">
        {[...Array(fullStars)].map((_, i) => <Star key={`full-${i}`} className="w-4 h-4 fill-current" />)}
        {halfStar && <Star key="half" className="w-4 h-4" style={{ clipPath: 'polygon(0 0, 50% 0, 50% 100%, 0 100%)', fill: 'currentColor' }} />}
        {[...Array(emptyStars)].map((_, i) => <Star key={`empty-${i}`} className="w-4 h-4" />)}
      </div>
      <span className="text-xs text-slate-500">{reviewsCount} {t('reviews')}</span>
    </div>
  );
};

const DeliveryInfo = ({ method, language = 'pt' }) => {
  if (!method) return null;

  const iconMap = {
    "Entrega Rápida": <Truck className="w-4 h-4 text-green-600" />,
    "E-mail / Digital": <Mail className="w-4 h-4 text-blue-600" />,
  };

  return (
    <div className="flex items-center gap-2 text-xs text-slate-600 mb-2">
      {method.icon ? <span className="text-base">{method.icon}</span> : (iconMap[method.name] || <Package className="w-4 h-4" />)}
      <span>{method.name}</span>
    </div>
  );
};

export default function ProductCard({
  product,
  onAddToCart,
  onViewDetails,
  language = 'pt',
  deliveryMethod,
  isGridView,
  darkMode
}) {
  const t = (key) => translations[language][key] || key;

  const isOutOfStock = product.stock_quantity !== null && product.stock_quantity <= 0;
  const hasStock = product.stock_quantity !== null && product.stock_quantity !== undefined;

  const hasDiscount = product.original_price && product.original_price > product.price;
  const discountPercentage = hasDiscount ?
    Math.round(((product.original_price - product.price) / product.original_price) * 100) :
    (product.discount_percentage || 0);

  // Adiciona a classe de brilho se o produto for verificado
  const cardClasses = `
    relative flex flex-col h-full backdrop-blur-sm shadow-lg hover:shadow-2xl
    transition-all duration-300 group border-0 overflow-hidden rounded-lg
    ${darkMode ? 'bg-gray-800/90 text-white' : 'bg-white/90 text-gray-900'}
    ${product.is_verified ? 'verified-product-glow' : ''}
  `;

  return (
    <Card className={cardClasses.trim()}>
      {/* Animated orange line for verified products */}
      {product.is_verified && (
        <div className="absolute inset-x-0 bottom-0 h-1 bg-orange-500 origin-bottom-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 z-0"></div>
      )}

      {/* Wrapper for card content to ensure z-index and proper flex layout */}
      <div className="relative z-10 flex flex-col h-full">
        <div className="relative">
          <img
            src={product.image_url || 'https://via.placeholder.com/300x300?text=Sem+Imagem'}
            alt={product.name}
            className="w-full h-48 object-cover"
          />

          {/* Badges no topo da imagem */}
          <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
            {/* Badge de Desconto */}
            {discountPercentage > 0 && (
              <Badge className="bg-red-500 text-white font-bold text-xs px-2 py-1">
                -{discountPercentage}% OFF
              </Badge>
            )}

            {/* Badge de Vendas */}
            {product.sales_count && product.sales_count > 0 && (
              <Badge variant="secondary" className="bg-green-500 text-white font-bold text-xs px-2 py-1">
                {product.sales_count >= 100 ? '100+' : product.sales_count} vendidos
              </Badge>
            )}

            {/* Selo de Verificação */}
            {product.is_verified && (
              <Badge className="bg-blue-500 text-white font-bold text-xs px-2 py-1 flex items-center gap-1">
                ✓ Verificado
              </Badge>
            )}

            {/* Badge de Destaque */}
            {product.is_featured && (
              <Badge className="bg-yellow-400 text-yellow-900 font-bold text-xs">Destaque</Badge>
            )}
          </div>
        </div>

        <CardContent className="p-4 flex-grow">
          {/* Categoria em destaque */}
          <div className="mb-3">
            <Badge
              variant="outline"
              className={`font-medium text-xs px-3 py-1 ${
                darkMode
                  ? 'bg-blue-900/50 text-blue-200 border-blue-700'
                  : 'bg-blue-50 text-blue-700 border-blue-200'
              }`}
            >
              📦 {product.category?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Categoria'}
            </Badge>
          </div>

          <CardTitle className={`text-lg font-semibold mb-2 line-clamp-2 ${
            darkMode ? 'text-white' : 'text-slate-800'
          }`}>
            {product.name}
          </CardTitle>

          <DeliveryInfo method={deliveryMethod} language={language} />

          {/* Avaliações */}
          {product.average_rating > 0 && (
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-3 h-3 ${
                      star <= Math.floor(product.average_rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-600">
                ({product.reviews_count || 0})
              </span>
            </div>
          )}

          <p className={`text-sm line-clamp-3 mb-3 ${
            darkMode ? 'text-gray-300' : 'text-slate-600'
          }`}>
            {product.description}
          </p>

          {/* Garantia se produto verificado */}
          {product.is_verified && product.warranty_info && (
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                🛡️ {product.warranty_info} de garantia
              </span>
            </div>
          )}

          {/* Sempre mostrar estoque quando disponível */}
          {hasStock && (
            <div className="flex items-center gap-1 text-sm">
              <Package className="w-4 h-4 text-slate-500" />
              <span className={`font-medium ${
                isOutOfStock ? 'text-red-600' :
                product.stock_quantity <= 5 ? 'text-orange-600' : 'text-green-600'
              }`}>
                {isOutOfStock ?
                  t('outOfStock') :
                  `${product.stock_quantity} ${t('inStock')}`
                }
              </span>
            </div>
          )}
        </CardContent>

        <CardFooter className={`p-4 border-t mt-auto ${
          darkMode
            ? 'bg-gray-800/50 border-gray-700'
            : 'bg-white/50 border-slate-100'
        }`}>
          <div className="w-full space-y-3">
            {/* Preços */}
            <div className="text-center">
              {hasDiscount ? (
                <div className="space-y-1">
                  <p className={`text-sm line-through ${
                    darkMode ? 'text-gray-400' : 'text-slate-500'
                  }`}>
                    R$ {product.original_price.toFixed(2).replace('.', ',')}
                  </p>
                  <p className="text-xl font-bold text-red-600">
                    R$ {product.price.toFixed(2).replace('.', ',')}
                  </p>
                </div>
              ) : (
                <p className={`text-xl font-bold ${
                  darkMode ? 'text-white' : 'text-slate-900'
                }`} style={{ color: darkMode ? '#fff' : 'var(--store-primary)' }}>
                  R$ {product.price.toFixed(2).replace('.', ',')}
                </p>
              )}
            </div>

            {/* Botões - LAYOUT RESPONSIVO */}
            <div className="flex flex-col sm:flex-row gap-2">
              {/* Botão Principal - Adicionar ao Carrinho - COR LARANJA FORÇADA! */}
              <Button
                onClick={() => onAddToCart(product)}
                disabled={isOutOfStock}
                className={`flex-1 text-white transition-colors duration-200 shadow-md hover:shadow-lg ${
                  isOutOfStock
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-orange-500 hover:bg-orange-600 !bg-orange-500 !hover:bg-orange-600'
                }`}
                style={!isOutOfStock ? {
                  backgroundColor: '#f97316',
                  borderColor: '#f97316'
                } : {}}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                {isOutOfStock ? t('outOfStock') : t('buy')}
              </Button>

              {/* Botão Secundário - Ver Detalhes */}
              <Button
                variant="outline"
                onClick={() => onViewDetails && onViewDetails(product)}
                className={`sm:w-auto transition-colors duration-200 ${
                  darkMode
                    ? 'border-gray-600 hover:bg-gray-700 text-gray-300 hover:text-white'
                    : 'border-slate-300 hover:bg-slate-100'
                }`}
                title={t('viewDetails')}
              >
                <Eye className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">{t('details')}</span>
              </Button>
            </div>
          </div>
        </CardFooter>
      </div>
    </Card>
  );
}
