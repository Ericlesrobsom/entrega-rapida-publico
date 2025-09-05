import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Edit, Trash2, Megaphone, MoreVertical, ToggleLeft, ToggleRight, Users } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function OfferItem({ offer, onEdit, onDelete, onToggleStatus, darkMode }) {
  return (
    <Card className={`shadow-lg border-0 transition-all duration-300 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white'}`}>
      <CardContent className="p-4 flex flex-col md:flex-row items-start md:items-center gap-4">
        <div className={`flex items-center justify-center p-3 rounded-lg ${darkMode ? 'bg-blue-900/50' : 'bg-blue-50'}`}>
          <Megaphone className={`w-8 h-8 ${darkMode ? 'text-blue-300' : 'text-blue-600'}`} />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-lg">{offer.title}</h3>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>{offer.description || 'Oferta global para clientes'}</p>
        </div>
        <div className="grid grid-cols-2 md:flex md:items-center gap-4 text-center md:text-left w-full md:w-auto">
          <div className="px-2">
            <p className={`text-xs font-semibold uppercase ${darkMode ? 'text-gray-500' : 'text-slate-500'}`}>Desconto</p>
            <p className="font-bold text-lg">{offer.discount_percentage}%</p>
          </div>
           <div className="px-2">
            <p className={`text-xs font-semibold uppercase ${darkMode ? 'text-gray-500' : 'text-slate-500'}`}>Alvos</p>
            <p className="font-bold text-lg flex items-center justify-center gap-1"><Users className="w-4 h-4" />{offer.target_user_emails.length}</p>
          </div>
          <div className="px-2">
            <p className={`text-xs font-semibold uppercase ${darkMode ? 'text-gray-500' : 'text-slate-500'}`}>Status</p>
            <Badge variant={offer.is_active ? 'default' : 'secondary'} className={offer.is_active ? `${darkMode ? 'bg-green-800/80 text-green-200' : 'bg-green-100 text-green-800'}` : `${darkMode ? 'bg-red-800/80 text-red-200' : 'bg-red-100 text-red-800'}`}>
              {offer.is_active ? 'Ativa' : 'Inativa'}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2 self-start md:self-center">
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className={darkMode ? 'bg-gray-900 border-gray-700 text-white' : ''}>
              <DropdownMenuItem onClick={() => onEdit(offer)}><Edit className="w-4 h-4 mr-2" /> Editar</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onToggleStatus(offer)}>
                {offer.is_active ? <ToggleLeft className="w-4 h-4 mr-2" /> : <ToggleRight className="w-4 h-4 mr-2" />}
                {offer.is_active ? 'Desativar' : 'Ativar'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onDelete(offer)} className="text-red-500 focus:text-red-500 focus:bg-red-50 dark:focus:bg-red-900/50">
                <Trash2 className="w-4 h-4 mr-2" /> Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}

export default function GlobalOfferList({ offers, loading, onEdit, onDelete, onToggleStatus }) {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setDarkMode(isDark);
    const observer = new MutationObserver(() => {
      setDarkMode(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {Array(2).fill(0).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-lg" />)}
      </div>
    );
  }

  if (offers.length === 0) {
    return (
      <div className="text-center py-12">
        <Megaphone className="w-16 h-16 mx-auto mb-4 text-slate-400" />
        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Nenhuma oferta global encontrada</h3>
        <p className="text-slate-600 dark:text-gray-400">Crie sua primeira oferta para clientes específicos.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {offers.map((offer) => (
        <OfferItem key={offer.id} offer={offer} onEdit={onEdit} onDelete={onDelete} onToggleStatus={onToggleStatus} darkMode={darkMode} />
      ))}
    </div>
  );
}