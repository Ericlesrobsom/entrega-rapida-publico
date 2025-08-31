
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, Star } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function TopProducts({ products, loading }) {
  const activeProducts = products.filter((product) => product.is_active).slice(0, 5);

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-slate-900 font-semibold leading-none tracking-tight">Top Produtos</CardTitle>
          <Package className="w-5 h-5 text-slate-400" />
        </div>
        <p className="text-sm text-slate-500">Os 5 produtos mais recentes e ativos.</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {loading ?
          Array(5).fill(0).map((_, i) =>
          <div key={i} className="flex items-center gap-4 p-3 border border-slate-200 rounded-lg">
                <Skeleton className="w-16 h-16 rounded-lg" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-4 w-20 mb-1" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
          ) :
          activeProducts.length > 0 ?
          activeProducts.map((product) =>
          <div key={product.id} className="flex items-center gap-4 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden">
                  {product.image_url ?
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover" /> :


              <Package className="w-8 h-8 text-slate-400" />
              }
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-slate-900 mb-1">{product.name}</h4>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs dark:bg-transparent dark:text-slate-600 dark:border-slate-300">
                       {product.category}
                     </Badge>
                     <span className="text-sm text-slate-600">
                       ({product.stock_quantity || 0} em estoque)
                     </span>
                  </div>
                  <p className="font-semibold text-slate-900">
                    R$ {product.price?.toFixed(2)}
                  </p>
                </div>
              </div>
          ) :

          <div className="text-center py-8 text-slate-500">
              <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum produto encontrado</p>
            </div>
          }
        </div>
      </CardContent>
    </Card>);

}
