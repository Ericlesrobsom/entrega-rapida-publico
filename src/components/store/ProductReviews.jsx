import React, { useState, useEffect } from "react";
import { Review } from "@/api/entities";
import { Star, MessageCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function ProductReviews({ productId }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const reviewsData = await Review.filter({ 
          product_id: productId, 
          is_approved: true 
        }, '-created_date');
        
        setReviews(reviewsData);
        
        // Calcular média das avaliações
        if (reviewsData.length > 0) {
          const sum = reviewsData.reduce((acc, review) => acc + review.rating, 0);
          setAverageRating(sum / reviewsData.length);
        }
      } catch (error) {
        console.error("Erro ao carregar avaliações:", error);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      loadReviews();
    }
  }, [productId]);

  const renderStars = (rating, showNumber = false) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= Math.floor(rating)
                ? "fill-yellow-400 text-yellow-400"
                : star <= rating
                ? "fill-yellow-200 text-yellow-400" 
                : "text-gray-300"
            }`}
          />
        ))}
        {showNumber && (
          <span className="text-sm text-gray-600 ml-1">
            ({rating.toFixed(1)})
          </span>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-gray-400" />
          <span className="text-sm text-gray-600">Carregando avaliações...</span>
        </div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-6 bg-gray-50 rounded-lg">
        <MessageCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-600">Seja o primeiro a avaliar este produto!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Resumo das avaliações */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {renderStars(averageRating, true)}
          </div>
          <p className="text-sm text-gray-600">
            {reviews.length} avaliação{reviews.length !== 1 ? 'ões' : ''}
          </p>
        </div>
      </div>

      {/* Lista de avaliações */}
      <div className="space-y-3">
        <h4 className="font-semibold text-gray-900">Avaliações dos clientes</h4>
        {reviews.slice(0, 5).map((review) => (
          <Card key={review.id} className="bg-white border">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-medium text-gray-900">{review.customer_name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {renderStars(review.rating)}
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(review.created_date), { 
                        addSuffix: true, 
                        locale: ptBR 
                      })}
                    </span>
                  </div>
                </div>
              </div>
              {review.comment && (
                <p className="text-gray-700 text-sm mt-2">"{review.comment}"</p>
              )}
            </CardContent>
          </Card>
        ))}
        
        {reviews.length > 5 && (
          <p className="text-center text-sm text-gray-500">
            + {reviews.length - 5} avaliação{reviews.length - 5 !== 1 ? 'ões' : ''} adicional{reviews.length - 5 !== 1 ? 'is' : ''}
          </p>
        )}
      </div>
    </div>
  );
}