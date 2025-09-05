import React, { useRef, useEffect, useState } from 'react';
import { googleDriveVideo } from "@/api/functions";

export default function UniversalVideoPlayer({ 
  videoUrl, 
  googleDriveId, 
  courseId,
  title = "Aula", 
  autoplay = false, 
  controls = true,
  settings = {},
  onProgress = () => {},
  onComplete = () => {}
}) {
  const videoRef = useRef(null);
  const [videoSrc, setVideoSrc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Se for ID do Google Drive, busca o stream
  useEffect(() => {
    if (googleDriveId && courseId) {
      setLoading(true);
      setError(null);

      const loadGoogleDriveVideo = async () => {
        try {
          const { data } = await googleDriveVideo({
            action: 'proxyVideo',
            videoId: googleDriveId,
            courseId: courseId
          });

          // Usar a função como proxy para o vídeo
          const proxyUrl = `/functions/googleDriveVideo?action=proxyVideo&videoId=${googleDriveId}&courseId=${courseId}`;
          setVideoSrc(proxyUrl);
        } catch (error) {
          console.error('Erro ao carregar vídeo do Google Drive:', error);
          setError('Não foi possível carregar o vídeo. Verifique se você tem acesso a este curso.');
        } finally {
          setLoading(false);
        }
      };

      loadGoogleDriveVideo();
    } else if (videoUrl) {
      // Usar URL direta
      setVideoSrc(videoUrl);
    }
  }, [googleDriveId, courseId, videoUrl]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const progress = (video.currentTime / video.duration) * 100;
      onProgress(progress, video.currentTime, video.duration);
    };

    const handleEnded = () => {
      onComplete();
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
    };
  }, [onProgress, onComplete]);

  // Configurações de estilo do player
  const iconSize = settings.video_player_icon_size || 80;
  const iconPosition = settings.video_player_icon_position || 'center';
  const iconOpacity = settings.video_player_icon_opacity || 0.8;

  const getPositionClasses = (position) => {
    const positions = {
      'center': 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2',
      'top-left': 'top-4 left-4',
      'top-right': 'top-4 right-4',
      'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
      'bottom-left': 'bottom-4 left-4',
      'bottom-right': 'bottom-4 right-4',
      'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
    };
    return positions[position] || positions['center'];
  };

  if (loading) {
    return (
      <div className="relative w-full h-64 bg-gray-900 rounded-lg flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Carregando vídeo...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative w-full h-64 bg-red-900 rounded-lg flex items-center justify-center">
        <div className="text-white text-center p-6">
          <p className="text-lg mb-2">⚠️ Erro ao Carregar</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!videoSrc) {
    return (
      <div className="relative w-full h-64 bg-gray-800 rounded-lg flex items-center justify-center">
        <p className="text-white">Nenhum vídeo configurado</p>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      <video
        ref={videoRef}
        className="w-full h-auto rounded-lg shadow-lg"
        controls={controls}
        autoPlay={autoplay}
        preload="metadata"
        style={{ backgroundColor: '#000' }}
      >
        <source src={videoSrc} type="video/mp4" />
        <p className="text-white p-4">
          Seu navegador não suporta o elemento de vídeo.
        </p>
      </video>

      {/* Ícone personalizado sobreposto */}
      {settings.video_player_icon_url && (
        <div className={`absolute ${getPositionClasses(iconPosition)} pointer-events-none z-10`}>
          <img
            src={settings.video_player_icon_url}
            alt="Player Icon"
            className="object-contain"
            style={{
              width: settings.video_player_icon_width || iconSize,
              height: settings.video_player_icon_height || iconSize,
              opacity: iconOpacity
            }}
          />
        </div>
      )}
    </div>
  );
}