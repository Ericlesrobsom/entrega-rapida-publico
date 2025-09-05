
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Star, Loader2 } from "lucide-react";
import { User } from "@/api/entities";
import { Review } from "@/api/entities";
import { Order } from "@/api/entities";
import { toast } from "sonner";

export default function ProductReviewModal({ product, isOpen, onClose, onReviewSubmitted }) {
  const [darkMode, setDarkMode] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verification, setVerification] = useState({ loading: true, hasPurchased: false });
  const [user, setUser] = useState(null);

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
    const verifyPurchase = async () => {
      if (!isOpen || !product) return;
      
      setVerification({ loading: true, hasPurchased: false });
      setRating(0);
      setComment("");

      try {
        const currentUser = await User.me();
        setUser(currentUser);

        const orders = await Order.filter({
          customer_email: currentUser.email,
          status: 'entregue',
        });

        const hasPurchasedProduct = orders.some(order => 
          order.items.some(item => item.product_id === product.id)
        );

        setVerification({ loading: false, hasPurchased: hasPurchasedProduct });
      } catch (error) {
        // User not logged in
        setUser(null);
        setVerification({ loading: false, hasPurchased: false });
      }
    };

    verifyPurchase();
  }, [isOpen, product]);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Por favor, selecione uma nota (de 1 a 5 estrelas).");
      return;
    }
    if (!user) {
      toast.info("Você precisa estar logado para fazer uma avaliação.");
      return;
    }

    setIsSubmitting(true);
    try {
      await Review.create({
        product_id: product.id,
        customer_name: user.full_name,
        customer_email: user.email,
        rating: rating,
        comment: comment,
        is_approved: true, // Auto-approve for now
      });
      
      // Update product's average rating (simplified)
      const existingReviews = await Review.filter({ product_id: product.id, is_approved: true });
      const totalRating = existingReviews.reduce((sum, r) => sum + r.rating, 0) + rating;
      const newAverage = totalRating / (existingReviews.length + 1);
      
      await product.update({
        average_rating: newAverage,
        reviews_count: existingReviews.length + 1
      });

      toast.success("Avaliação enviada com sucesso!");
      onReviewSubmitted();
      onClose();
    } catch (error) {
      console.error("Erro ao enviar avaliação:", error);
      toast.error("Erro ao enviar sua avaliação. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`transition-colors duration-300 ${
        darkMode ? 'bg-gray-800 text-white' : 'bg-white text-slate-900'
      }`}>
        <DialogHeader>
          <DialogTitle>Avaliar Produto</DialogTitle>
          <DialogDescription className={darkMode ? 'text-gray-400' : 'text-slate-600'}>
            Deixe sua opinião sobre "{product?.name}"
          </DialogDescription>
        </DialogHeader>

        {verification.loading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-6 h-6 animate-spin text-[--store-primary]" />
          </div>
        ) : !user ? (
          <div className="p-4 text-center">
             <p className="mb-4">Você precisa fazer login para avaliar.</p>
             <Button onClick={async () => await User.loginWithRedirect(window.location.href)}>Fazer Login</Button>
          </div>
        ) : !verification.hasPurchased ? (
           <div className={`p-4 text-center rounded-md transition-colors duration-300 ${
             darkMode ? 'bg-yellow-900/20' : 'bg-yellow-50'
           }`}>
             <p className={`font-medium ${
               darkMode ? 'text-yellow-300' : 'text-yellow-800'
             }`}>Apenas clientes que compraram este produto podem avaliá-lo.</p>
           </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="flex justify-center items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  onClick={() => setRating(star)}
                  className={`w-8 h-8 cursor-pointer transition-colors ${
                    star <= rating
                      ? 'text-yellow-400'
                      : darkMode ? 'text-gray-600 hover:text-yellow-200' : 'text-slate-300 hover:text-yellow-200'
                  }`}
                  fill={star <= rating ? 'currentColor' : 'none'}
                />
              ))}
            </div>
            <Textarea
              placeholder="Escreva seu comentário (opcional)..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className={darkMode ? 'bg-gray-700 border-gray-600' : 'bg-slate-50 border-slate-300'}
              maxLength={200}
            />
          </div>
        )}
        
        {user && verification.hasPurchased && (
          <DialogFooter>
            <Button variant="ghost" onClick={onClose}>Cancelar</Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || rating === 0}
              className="bg-[--store-primary] text-white hover:opacity-90"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Enviar Avaliação"}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
