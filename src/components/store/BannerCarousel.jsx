import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function BannerCarousel({ banners }) {
  const [currentBanner, setCurrentBanner] = useState(0);

  // Auto-avançar banners a cada 5 segundos
  useEffect(() => {
    if (banners.length > 1) {
      const interval = setInterval(() => {
        setCurrentBanner((prev) => (prev + 1) % banners.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [banners.length]);

  const nextBanner = () => {
    setCurrentBanner((prev) => (prev + 1) % banners.length);
  };

  const prevBanner = () => {
    setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const goToBanner = (index) => {
    setCurrentBanner(index);
  };

  if (!banners || banners.length === 0) return null;

  const currentBannerData = banners[currentBanner];

  return (
    <section className="mb-8">
      <div className="relative h-48 md:h-64 bg-gray-300 rounded-lg overflow-hidden group">
        {/* Banner atual */}
        <div 
          className="w-full h-full bg-cover bg-center transition-all duration-500"
          style={{ backgroundImage: `url(${currentBannerData.image_url})` }}
        >
          {/* Overlay para melhorar legibilidade do texto */}
          {(currentBannerData.title || currentBannerData.subtitle) && (
            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
              <div className="text-center text-white p-4">
                {currentBannerData.title && (
                  <h2 className="text-2xl md:text-4xl font-bold mb-2">
                    {currentBannerData.title}
                  </h2>
                )}
                {currentBannerData.subtitle && (
                  <p className="text-lg md:text-xl">
                    {currentBannerData.subtitle}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Setas de navegação (só aparecem se houver mais de 1 banner) */}
        {banners.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={prevBanner}
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={nextBanner}
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          </>
        )}

        {/* Indicadores de posição (bolinhas) */}
        {banners.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => goToBanner(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentBanner
                    ? 'bg-white scale-110'
                    : 'bg-white/60 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        )}

        {/* Link clicável (se o banner tiver link_url) */}
        {currentBannerData.link_url && (
          <a
            href={currentBannerData.link_url}
            className="absolute inset-0 z-10"
            aria-label={`Link para ${currentBannerData.title || 'banner'}`}
          />
        )}
      </div>
    </section>
  );
}