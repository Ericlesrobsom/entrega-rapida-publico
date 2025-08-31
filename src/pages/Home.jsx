import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redireciona imediatamente para a página da loja
    navigate(createPageUrl('Store'), { replace: true });
  }, [navigate]);

  // Exibe uma mensagem de carregamento enquanto o redirecionamento ocorre
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white text-center">
      <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
      <h1 className="text-xl font-semibold text-slate-800">Carregando a loja...</h1>
      <p className="text-slate-600">Você será redirecionado em breve.</p>
    </div>
  );
}