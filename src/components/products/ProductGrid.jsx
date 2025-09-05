
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, Edit, ToggleLeft, ToggleRight, MoreVertical, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function ProductCardAdmin({ product, onEdit, onToggleStatus, onDelete }) {
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

  return (
    <Card className={`overflow-hidden shadow-lg border-0 transition-all duration-300 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white'}`}>
      <CardContent className="p-0">
        <div className="flex">
          <img 
            src={product.image_url || 'https://via.placeholder.com/150'} 
            alt={product.name} 
            className="w-28 h-full object-cover"
          />
          <div className="p-4 flex flex-col flex-1">
            <div className="flex justify-between items-start">
              <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className={darkMode ? 'bg-gray-900 border-gray-700 text-white' : ''}>
                  <DropdownMenuItem onClick={() => onEdit(product)}>
                    <Edit className="w-4 h-4 mr-2" /> Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onToggleStatus(product)}>
                    {product.is_active ? <ToggleLeft className="w-4 h-4 mr-2" /> : <ToggleRight className="w-4 h-4 mr-2" />}
                    {product.is_active ? 'Desativar' : 'Ativar'}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onDelete(product)} className="text-red-500 focus:text-red-500 focus:bg-red-50 dark:focus:bg-red-900/50">
                    <Trash2 className="w-4 h-4 mr-2" /> Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <p className={`text-sm mb-2 ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>{product.category}</p>
            <p className={`font-bold text-xl mb-4 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
              R$ {(product.price || 0).toFixed(2)}
            </p>

            <div className="flex items-center justify-between mt-auto">
              <Badge variant={product.is_active ? 'default' : 'secondary'} className={product.is_active ? `${darkMode ? 'bg-green-800/80 text-green-200' : 'bg-green-100 text-green-800'}` : `${darkMode ? 'bg-red-800/80 text-red-200' : 'bg-red-100 text-red-800'}`}>{product.is_active ? "Ativo" : "Inativo"}</Badge>
              <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>
                {product.stock_quantity === null ? 'Ilimitado' : `Estoque: ${product.stock_quantity}`}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


export default function ProductGrid({ products, loading, onEdit, onToggleStatus, onDelete }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array(8).fill(0).map((_, i) => (
          <Card key={i} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="p-4">
              <Skeleton className="w-full h-40 rounded-lg" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-4" />
              <Skeleton className="h-8 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="w-16 h-16 mx-auto mb-4 text-slate-400" />
        <h3 className="text-xl font-semibold text-slate-900 mb-2">Nenhum produto encontrado</h3>
        <p className="text-slate-600">Adicione produtos ao seu catálogo para começar a vender.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {products.map(product => (
        <ProductCardAdmin 
          key={product.id}
          product={product}
          onEdit={onEdit}
          onToggleStatus={onToggleStatus}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
