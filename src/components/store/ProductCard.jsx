
import React from 'react';
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Package, Star, Truck, Mail, Eye } from "lucide-react";

const translations = {
  pt: {
    addToCart: "Adicionar ao carrinho",
    outOfStock: "Esgotado",
    reviews: "avaliações",
    inStock: "em estoque",
    units: "unidades",
    viewDetails: "Ver detalhes"
  },
  en: {
    addToCart: "Add to cart",
    outOfStock: "Out of stock",
    reviews: "reviews",
    inStock: "in stock",
    units: "units",
    viewDetails: "View details"
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

export default function ProductCard({ product, onAddToCart, onViewDetails, language = 'pt', deliveryMethod }) {
  const t = (key) => translations[language][key] || key;
  const isOutOfStock = product.stock_quantity !== null && product.stock_quantity <= 0;
  const hasStock = product.stock_quantity !== null && product.stock_quantity !== undefined;
  
  // Calcular se tem desconto
  const hasDiscount = product.original_price && product.original_price > product.price;
  const discountPercentage = hasDiscount ? 
    Math.round(((product.original_price - product.price) / product.original_price) * 100) : 
    (product.discount_percentage || 0);

  return (
    <Card className="flex flex-col h-full overflow-hidden transition-all duration-300 rounded-lg shadow-md hover:shadow-xl bg-white border border-slate-100">
      <div className="relative">
        <img
          src={product.image_url || 'https://via.placeholder.com/300x300?text=Sem+Imagem'}
          alt={product.name}
          className="w-full h-48 object-cover"
        />
        
        {/* Badges no topo da imagem */}
        <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
          <div className="flex flex-col gap-1">
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
          </div>
          
          {/* Badge de Destaque (à direita) */}
          {product.is_featured && (
            <Badge className="bg-yellow-400 text-yellow-900 font-bold">Destaque</Badge>
          )}
        </div>
      </div>
      
      <CardContent className="bg-slate-50 p-4 flex-grow">
        {/* Categoria em destaque */}
        <div className="mb-3">
          <Badge 
            variant="outline" 
            className="bg-blue-50 text-blue-700 border-blue-200 font-medium text-xs px-3 py-1"
          >
            📦 {product.category?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Categoria'}
          </Badge>
        </div>

        <CardTitle className="text-lg font-semibold text-slate-800 mb-2 line-clamp-2">
          {product.name}
        </CardTitle>

        <DeliveryInfo method={deliveryMethod} language={language} />
        
        <StarRating 
          rating={product.average_rating || 0} 
          reviewsCount={product.reviews_count || 0}
          language={language}
        />
        
        <p className="text-sm text-slate-600 line-clamp-3 mb-3">
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
      
      <CardFooter className="p-4 bg-white border-t border-slate-100">
        <div className="w-full space-y-3">
          {/* Preços */}
          <div className="text-center">
            {hasDiscount ? (
              <div className="space-y-1">
                <p className="text-sm text-slate-500 line-through">
                  R$ {product.original_price.toFixed(2).replace('.', ',')}
                </p>
                <p className="text-xl font-bold text-red-600">
                  R$ {product.price.toFixed(2).replace('.', ',')}
                </p>
              </div>
            ) : (
              <p className="text-xl font-bold text-slate-900" style={{ color: 'var(--store-primary)' }}>
                R$ {product.price.toFixed(2).replace('.', ',')}
              </p>
            )}
          </div>
          
          {/* Botões */}
          <div className="flex gap-2">
            <Button
              onClick={onAddToCart}
              disabled={isOutOfStock}
              className="text-white flex-1"
              style={{ backgroundColor: isOutOfStock ? '' : 'var(--store-primary)' }}
            >
              {isOutOfStock ? (
                t('outOfStock')
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  {t('addToCart')}
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onViewDetails && onViewDetails(product)}
              title={t('viewDetails')}
            >
              <Eye className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
