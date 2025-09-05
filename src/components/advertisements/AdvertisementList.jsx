
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch"; // Retained if needed elsewhere, but removed from AdvertisementItem
import { Label } from "@/components/ui/label"; // Retained if needed elsewhere, but removed from AdvertisementItem
import { Button } from "@/components/ui/button";
import { Edit, Eye, BarChart, MoreVertical, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge"; // New import for Badge

function AdvertisementItem({ ad, onEdit, onDelete, onToggleStatus }) {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Initial check for dark mode
    const isDark = document.documentElement.classList.contains('dark');
    setDarkMode(isDark);

    // Observe changes to the 'class' attribute of the html element
    const observer = new MutationObserver(() => {
      setDarkMode(document.documentElement.classList.contains('dark'));
    });

    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    // Cleanup observer on component unmount
    return () => observer.disconnect();
  }, []);

  const positionLabel = {
    'header': 'Cabeçalho',
    'sidebar': 'Barra Lateral',
    'footer': 'Rodapé',
    'content': 'Conteúdo Principal',
    'popup': 'Pop-up',
    'banner': 'Banner',
    'homepage': 'Página Inicial',
    'search': 'Página de Busca',
    'default': 'Posição Desconhecida' // Fallback for undefined positions
  };

  return (
    <Card className={`overflow-hidden shadow-lg border-0 transition-all duration-300 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white'}`}>
      <CardContent className="p-4 flex flex-col md:flex-row items-center gap-4">
        <img
          src={ad.image_url}
          alt={ad.title}
          className="w-full md:w-40 h-24 object-cover rounded-lg"
        />
        <div className="flex-1">
          <h3 className="font-semibold text-lg">{ad.title}</h3>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>
            {positionLabel[ad.position] || positionLabel.default}
          </p>
          {ad.link_url && (
            <p className={`text-xs truncate ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>{ad.link_url}</p>
          )}
        </div>
        <div className="flex items-center gap-4">
          <Badge 
            variant={ad.is_active ? 'default' : 'secondary'} 
            className={ad.is_active ? 
              `${darkMode ? 'bg-green-800/80 text-green-200' : 'bg-green-100 text-green-800'}` : 
              `${darkMode ? 'bg-red-800/80 text-red-200' : 'bg-red-100 text-red-800'}`
            }
          >
            {ad.is_active ? "Ativo" : "Inativo"}
          </Badge>
          {ad.priority !== undefined && ( // Only show priority if it exists
            <Badge variant="outline" className={darkMode ? 'border-gray-600 text-gray-300' : 'border-gray-200 text-slate-700'}>
              Prioridade: {ad.priority}
            </Badge>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className={darkMode ? 'bg-gray-900 border-gray-700 text-white' : ''}>
              <DropdownMenuItem onClick={() => onEdit(ad)}>
                <Edit className="w-4 h-4 mr-2" /> Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onToggleStatus(ad)}>
                {ad.is_active ? (
                  <>
                    <ToggleLeft className="w-4 h-4 mr-2" /> Desativar
                  </>
                ) : (
                  <>
                    <ToggleRight className="w-4 h-4 mr-2" /> Ativar
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onDelete(ad)} 
                className="text-red-500 focus:text-red-500 focus:bg-red-50 dark:focus:bg-red-900/50"
              >
                <Trash2 className="w-4 h-4 mr-2" /> Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdvertisementList({ advertisements, loading, onEdit, onDelete, onToggleStatus }) {
  if (loading) {
    return <p>Carregando anúncios...</p>;
  }

  if (advertisements.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold text-slate-900 mb-2">Nenhum anúncio encontrado</h3>
        <p className="text-slate-600">Clique em "Novo Anúncio" para criar o seu primeiro.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {advertisements.map((ad) => (
        <AdvertisementItem 
          key={ad.id} 
          ad={ad} 
          onEdit={onEdit} 
          onDelete={onDelete} 
          onToggleStatus={onToggleStatus} 
        />
      ))}
    </div>
  );
}
