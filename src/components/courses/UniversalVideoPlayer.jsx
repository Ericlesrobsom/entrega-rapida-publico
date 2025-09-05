import React, { useState } from 'react';
import { Play } from 'lucide-react';

export default function UniversalVideoPlayer({ videoUrl, title, className, thumbnail }) {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayClick = () => {
    setIsPlaying(true);
  };

  const getDriveVideoId = (url) => {
    if (!url) return null;
    const match = url.match(/drive\.google\.com.*\/d\/([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
  };

  const videoId = getDriveVideoId(videoUrl);

  // Se não for um vídeo válido, exibe uma mensagem
  if (!videoId) {
    return (
      <div className={`relative flex items-center justify-center bg-black text-white text-center p-4 rounded-lg aspect-video ${className}`}>
        <p>URL de vídeo inválida ou não suportada.</p>
      </div>
    );
  }

  const ClickBlocker = () => (
    <div 
      className="w-full h-full cursor-default"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }}
      onMouseDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }}
    />
  );

  return (
    <div className={`relative w-full aspect-video bg-black rounded-lg overflow-hidden group ${className}`}>
      {isPlaying ? (
        <div className="relative w-full h-full">
          {/* Iframe do vídeo */}
          <iframe
            src={`https://drive.google.com/file/d/${videoId}/preview?autoplay=1`}
            className="w-full h-full"
            frameBorder="0"
            allow="autoplay; encrypted-media"
            allowFullScreen
            title={title}
            sandbox="allow-same-origin allow-scripts allow-forms"
          />
          
          {/* Overlay para bloquear cliques na parte inferior (AGORA MAIOR) */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-transparent z-10 pointer-events-auto">
            <ClickBlocker />
          </div>
          
          {/* Overlay para bloquear o canto superior direito (AGORA MAIOR) */}
          <div className="absolute top-0 right-0 w-32 h-16 bg-transparent z-10 pointer-events-auto">
            <ClickBlocker />
          </div>

          {/* Overlay para bloquear o canto superior esquerdo (PREVENÇÃO) */}
          <div className="absolute top-0 left-0 w-32 h-16 bg-transparent z-10 pointer-events-auto">
            <ClickBlocker />
          </div>
        </div>
      ) : (
        <div
          className="w-full h-full flex items-center justify-center cursor-pointer bg-cover bg-center relative"
          style={{ 
            backgroundImage: thumbnail ? `url(${thumbnail})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
          onClick={handlePlayClick}
        >
          {/* Overlay escuro para melhor contraste */}
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all duration-300"></div>
          
          {/* Ícone de play */}
          <div className="relative z-10 flex items-center justify-center w-20 h-20 bg-white/20 rounded-full backdrop-blur-sm group-hover:bg-white/30 group-hover:scale-110 transition-all duration-300">
            <Play className="w-8 h-8 text-white ml-1" fill="currentColor" />
          </div>
          
          {/* Título do vídeo (se fornecido) */}
          {title && (
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
              <p className="text-white text-sm font-medium truncate">{title}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}