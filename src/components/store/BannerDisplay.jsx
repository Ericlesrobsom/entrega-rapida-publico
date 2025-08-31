import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function BannerDisplay({ banners }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Efeito para o carrossel automático
  useEffect(() => {
    if (!banners || banners.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex(prevIndex => (prevIndex + 1) % banners.length);
    }, 5000); // Muda de banner a cada 5 segundos

    return () => clearInterval(timer); // Limpa o intervalo ao desmontar o componente
  }, [banners]);

  if (!banners || banners.length === 0) {
    return null; // Não renderiza nada se não houver banners
  }

  const goToPrevious = () => {
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? banners.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const goToNext = () => {
    const isLastSlide = currentIndex === banners.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

  const goToSlide = (slideIndex) => {
    setCurrentIndex(slideIndex);
  };

  const currentBanner = banners[currentIndex];

  const BannerContent = ({ banner }) => (
    <>
      <img src={banner.image_url} alt={banner.title || "Banner"} className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
      <div className="absolute bottom-0 left-0 p-6 md:p-10 text-white w-full">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
          {banner.title && <h2 className="text-2xl md:text-4xl font-bold drop-shadow-lg">{banner.title}</h2>}
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}>
          {banner.subtitle && <p className="text-md md:text-lg mt-2 drop-shadow-md max-w-2xl">{banner.subtitle}</p>}
        </motion.div>
      </div>
    </>
  );

  return (
    <div className="mb-12">
      <div className="relative w-full h-64 md:h-96 rounded-2xl overflow-hidden shadow-2xl bg-slate-200">
        <AnimatePresence>
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.0 }}
            className="absolute inset-0"
          >
            {currentBanner.link_url ? (
              <Link to={currentBanner.link_url} className="w-full h-full block">
                <BannerContent banner={currentBanner} />
              </Link>
            ) : (
              <BannerContent banner={currentBanner} />
            )}
          </motion.div>
        </AnimatePresence>
        
        {banners.length > 1 && (
          <>
            {/* Botão Anterior */}
            <Button
              variant="ghost"
              size="icon"
              onClick={goToPrevious}
              className="absolute top-1/2 left-4 -translate-y-1/2 rounded-full h-10 w-10 bg-black/30 hover:bg-black/50 text-white"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
            {/* Botão Próximo */}
            <Button
              variant="ghost"
              size="icon"
              onClick={goToNext}
              className="absolute top-1/2 right-4 -translate-y-1/2 rounded-full h-10 w-10 bg-black/30 hover:bg-black/50 text-white"
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
            
            {/* Pontos de Navegação */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {banners.map((_, slideIndex) => (
                <button
                  key={slideIndex}
                  onClick={() => goToSlide(slideIndex)}
                  className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${
                    currentIndex === slideIndex ? 'bg-white w-6' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}