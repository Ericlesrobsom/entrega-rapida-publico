
import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, Edit, ToggleLeft, ToggleRight, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ProductGrid({ products, loading, onEdit, onToggleStatus }) {
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <Card key={product.id} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 group relative">
          <div className="absolute top-4 right-4 z-10">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-slate-500 hover:bg-slate-100">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(product)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onToggleStatus(product)}>
                  {product.is_active ? (
                    <>
                      <ToggleLeft className="w-4 h-4 mr-2" /> Desativar
                    </>
                  ) : (
                    <>
                      <ToggleRight className="w-4 h-4 mr-2" /> Ativar
                    </>
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <CardHeader className="p-4">
            <div className="aspect-square bg-slate-100 rounded-lg overflow-hidden mb-3">
              {product.image_url ? (
                <img 
                  src={product.image_url} 
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-12 h-12 text-slate-400" />
                </div>
              )}
            </div>
            
            <div className="flex items-start justify-between">
              <Badge variant="outline" className="text-xs">
                {product.category}
              </Badge>
              <Badge 
                variant={product.is_active ? "default" : "secondary"}
                className={product.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
              >
                {product.is_active ? "Ativo" : "Inativo"}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="p-4 pt-0">
            <h3 className="font-semibold text-slate-900 mb-2 line-clamp-2">
              {product.name}
            </h3>
            
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl font-bold text-slate-900">
                R$ {product.price?.toFixed(2)}
              </span>
              <span className="text-sm text-slate-600">
                Est: {product.stock_quantity || 0}
              </span>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(product)}
                className="flex-1"
              >
                <Edit className="w-4 h-4 mr-1" />
                Editar
              </Button>
              
              <Button
                variant={product.is_active ? "outline" : "default"}
                size="sm"
                onClick={() => onToggleStatus(product)}
                className="px-3"
              >
                {product.is_active ? (
                  <ToggleRight className="w-4 h-4" />
                ) : (
                  <ToggleLeft className="w-4 h-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
