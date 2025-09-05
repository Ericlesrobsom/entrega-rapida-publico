
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Edit, Trash2, Ticket, MoreVertical, ToggleLeft, ToggleRight } from "lucide-react";
import { format } from "date-fns"; // This import is kept but might not be used if expiry date display is completely removed from new item structure.
import { ptBR } from "date-fns/locale"; // This import is kept but might not be used.
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function CouponItem({ coupon, onEdit, onDelete, onToggleStatus }) {
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

  const isExpired = coupon.expires_at && new Date(coupon.expires_at) < new Date();
  // const usesLeft = coupon.max_uses - (coupon.current_uses || 0); // Not used in the final outline, kept for reference

  return (
    <Card className={`shadow-lg border-0 transition-all duration-300 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white'}`}>
      <CardContent className="p-4 flex flex-col md:flex-row items-start md:items-center gap-4">
        <div className={`flex items-center justify-center p-3 rounded-lg ${darkMode ? 'bg-blue-900/50' : 'bg-blue-50'}`}>
          <Ticket className={`w-8 h-8 ${darkMode ? 'text-blue-300' : 'text-blue-600'}`} />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-lg">{coupon.code}</h3>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>{coupon.description || 'Cupom de desconto'}</p>
        </div>
        <div className="grid grid-cols-2 md:flex md:items-center gap-4 text-center md:text-left w-full md:w-auto">
          <div className="px-2">
            <p className={`text-xs font-semibold uppercase ${darkMode ? 'text-gray-500' : 'text-slate-500'}`}>Desconto</p>
            <p className="font-bold text-lg">{coupon.discount_percentage}%</p>
          </div>
          <div className="px-2">
            <p className={`text-xs font-semibold uppercase ${darkMode ? 'text-gray-500' : 'text-slate-500'}`}>Usos</p>
            <p className="font-bold text-lg">{coupon.current_uses || 0} / {coupon.max_uses}</p>
          </div>
          <div className="px-2">
            <p className={`text-xs font-semibold uppercase ${darkMode ? 'text-gray-500' : 'text-slate-500'}`}>Status</p>
            <Badge variant={coupon.is_active && !isExpired ? 'default' : 'secondary'} className={coupon.is_active && !isExpired ? `${darkMode ? 'bg-green-800/80 text-green-200' : 'bg-green-100 text-green-800'}` : `${darkMode ? 'bg-red-800/80 text-red-200' : 'bg-red-100 text-red-800'}`}>
              {isExpired ? 'Expirado' : (coupon.is_active ? 'Ativo' : 'Inativo')}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2 self-start md:self-center">
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className={darkMode ? 'bg-gray-900 border-gray-700 text-white' : ''}>
              <DropdownMenuItem onClick={() => onEdit(coupon)}>
                <Edit className="w-4 h-4 mr-2" /> Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onToggleStatus(coupon)}>
                {coupon.is_active ? <ToggleLeft className="w-4 h-4 mr-2" /> : <ToggleRight className="w-4 h-4 mr-2" />}
                {coupon.is_active ? 'Desativar' : 'Ativar'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onDelete(coupon)} className="text-red-500 focus:text-red-500 focus:bg-red-50 dark:focus:bg-red-900/50">
                <Trash2 className="w-4 h-4 mr-2" /> Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}

export default function CouponList({ coupons, loading, onEdit, onDelete, onToggleStatus }) {

  if (loading) {
    return (
      <div className="space-y-4">
        {Array(3).fill(0).map((_, i) => (
          <Card key={i} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-2">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-48" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (coupons.length === 0) {
    return (
      <div className="text-center py-12">
        <Ticket className="w-16 h-16 mx-auto mb-4 text-slate-400" />
        <h3 className="text-xl font-semibold text-slate-900 mb-2">Nenhum cupom encontrado</h3>
        <p className="text-slate-600">Clique em "Novo Cupom" para criar seu primeiro cupom promocional.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {coupons.map((coupon) => (
        <CouponItem
          key={coupon.id}
          coupon={coupon}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleStatus={onToggleStatus}
        />
      ))}
    </div>
  );
}
