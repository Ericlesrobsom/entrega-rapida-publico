import React from 'react';
import { Card } from "@/components/ui/card";

export default function AdvertisementBanner({ advertisement, onAdClick }) {
  if (!advertisement || !advertisement.is_active) return null;

  const handleClick = () => {
    if (advertisement.link_url && onAdClick) {
      onAdClick(advertisement);
    }
  };

  return (
    <div className="my-8">
      <Card className="overflow-hidden bg-white shadow-lg hover:shadow-xl transition-all duration-300">
        <div 
          className={`relative ${advertisement.link_url ? 'cursor-pointer' : ''}`}
          onClick={handleClick}
        >
          <img
            src={advertisement.image_url}
            alt={advertisement.title}
            className="w-full h-48 md:h-64 object-cover"
          />
          
          {/* Overlay com informações do anúncio */}
          {(advertisement.title || advertisement.description) && (
            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
              <div className="text-center text-white p-4">
                {advertisement.title && (
                  <h3 className="text-xl md:text-3xl font-bold mb-2">
                    {advertisement.title}
                  </h3>
                )}
                {advertisement.description && (
                  <p className="text-sm md:text-lg">
                    {advertisement.description}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Indicador de link clicável */}
          {advertisement.link_url && (
            <div className="absolute bottom-4 right-4">
              <div className="bg-white/80 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-medium text-slate-800">
                Clique para ver mais
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}