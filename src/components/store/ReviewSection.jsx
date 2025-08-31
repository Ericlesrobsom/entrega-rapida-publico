
import React, { useState, useEffect } from 'react';
import { Review } from "@/api/entities";
import { User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Star, MessageCircle } from "lucide-react";

const StarRating = ({ rating, onRatingChange, readonly = false }) => {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-5 h-5 cursor-pointer transition-colors ${
            star <= rating
              ? 'text-yellow-400 fill-yellow-400'
              : 'text-slate-300 hover:text-yellow-200'
          }`}
          onClick={() => !readonly && onRatingChange && onRatingChange(star)}
        />
      ))}
    </div>
  );
};

export default function ReviewSection({ productId, onReviewSubmitted }) {
  const [reviews, setReviews] = useState([]);
  const [user, setUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: '',
    customer_name: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const data = await Review.filter({ product_id: productId, is_approved: true }, '-created_date');
        setReviews(data);
      } catch (error) {
        console.error("Erro ao carregar avaliações:", error);
      } finally {
        setLoading(false);
      }
    };

    const checkUser = async () => {
      try {
        const currentUser = await User.me();
        setUser(currentUser);
        setNewReview(prev => ({ ...prev, customer_name: currentUser.full_name || '' }));
      } catch (error) {
        setUser(null);
      }
    };

    loadReviews();
    checkUser();
  }, [productId]); // productId is the only external dependency for these functions

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newReview.rating || !newReview.comment.trim()) return;
    
    setSubmitting(true);
    try {
      const reviewData = {
        product_id: productId,
        customer_name: newReview.customer_name,
        customer_email: user?.email || '',
        rating: newReview.rating,
        comment: newReview.comment.trim(),
        is_approved: true
      };

      await Review.create(reviewData);
      setNewReview({ rating: 5, comment: '', customer_name: user?.full_name || '' });
      setShowForm(false);
      
      // Recarregar avaliações após criar uma nova
      try {
        const data = await Review.filter({ product_id: productId, is_approved: true }, '-created_date');
        setReviews(data);
      } catch (error) {
        console.error("Erro ao recarregar avaliações:", error);
      }
      
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
    } catch (error) {
      console.error("Erro ao enviar avaliação:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-slate-900">
          Avaliações ({reviews.length})
        </h3>
        {user && (
          <Button 
            onClick={() => setShowForm(!showForm)}
            variant="outline"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Avaliar Produto
          </Button>
        )}
      </div>

      {/* Form de Nova Avaliação */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Deixe sua Avaliação</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Sua nota:
                </label>
                <StarRating 
                  rating={newReview.rating} 
                  onRatingChange={(rating) => setNewReview(prev => ({ ...prev, rating }))}
                />
              </div>
              
              {!user && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Seu nome:
                  </label>
                  <Input
                    value={newReview.customer_name}
                    onChange={(e) => setNewReview(prev => ({ ...prev, customer_name: e.target.value }))}
                    placeholder="Digite seu nome"
                    required
                  />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Seu comentário:
                </label>
                <Textarea
                  value={newReview.comment}
                  onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                  placeholder="Conte sua experiência com o produto..."
                  rows={4}
                  required
                />
              </div>
              
              <div className="flex gap-3">
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Enviando...' : 'Enviar Avaliação'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Lista de Avaliações */}
      <div className="space-y-4">
        {loading ? (
          <p>Carregando avaliações...</p>
        ) : reviews.length === 0 ? (
          <p className="text-slate-600">Seja o primeiro a avaliar este produto!</p>
        ) : (
          reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium text-slate-900">{review.customer_name}</p>
                    <StarRating rating={review.rating} readonly />
                  </div>
                  <span className="text-sm text-slate-500">
                    {formatDate(review.created_date)}
                  </span>
                </div>
                <p className="text-slate-700">{review.comment}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
