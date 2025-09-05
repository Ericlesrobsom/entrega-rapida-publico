
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, Star } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function TopProducts({ products, loading, darkMode = false }) {
  const activeProducts = products.filter((product) => product.is_active).slice(0, 5);

  return (
    <Card className={`border-0 shadow-lg transition-colors duration-300 ${
      darkMode 
        ? 'bg-gray-800/90 backdrop-blur-sm' 
        : 'bg-white/80 backdrop-blur-sm'
    }`}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className={`font-semibold leading-none tracking-tight transition-colors duration-300 ${
            darkMode ? 'text-white' : 'text-slate-900'
          }`}>Top Produtos</CardTitle>
          <Package className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-slate-400'}`} />
        </div>
        <p className={`text-sm transition-colors duration-300 ${
          darkMode ? 'text-gray-400' : 'text-slate-500'
        }`}>Os 5 produtos mais recentes e ativos.</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {loading ?
          Array(5).fill(0).map((_, i) =>
          <div key={i} className={`flex items-center gap-4 p-3 border rounded-lg ${
            darkMode ? 'border-gray-700' : 'border-slate-200'
          }`}>
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
          <div key={product.id} className={`flex items-center gap-4 p-3 border rounded-lg hover:bg-opacity-50 transition-colors ${
            darkMode 
              ? 'border-gray-700 hover:bg-gray-700' 
              : 'border-slate-200 hover:bg-slate-50'
          }`}>
                <div className={`w-16 h-16 rounded-lg flex items-center justify-center overflow-hidden ${
                  darkMode ? 'bg-gray-700' : 'bg-slate-100'
                }`}>
                  {product.image_url ?
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover" /> :
              <Package className={`w-8 h-8 ${darkMode ? 'text-gray-500' : 'text-slate-400'}`} />
              }
                </div>
                <div className="flex-1">
                  <h4 className={`font-medium mb-1 transition-colors duration-300 ${
                    darkMode ? 'text-white' : 'text-slate-900'
                  }`}>{product.name}</h4>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className={`text-xs ${
                      darkMode 
                        ? 'bg-transparent text-gray-400 border-gray-600' 
                        : 'bg-transparent text-slate-600 border-slate-300'
                    }`}>
                       {product.category}
                     </Badge>
                     <span className={`text-sm transition-colors duration-300 ${
                       darkMode ? 'text-gray-400' : 'text-slate-600'
                     }`}>
                       ({product.stock_quantity || 0} em estoque)
                     </span>
                  </div>
                  <p className={`font-semibold transition-colors duration-300 ${
                    darkMode ? 'text-white' : 'text-slate-900'
                  }`}>
                    R$ {product.price?.toFixed(2)}
                  </p>
                </div>
              </div>
          ) :
          <div className="text-center py-8">
              <Package className={`w-12 h-12 mx-auto mb-4 opacity-50 ${
                darkMode ? 'text-gray-500' : 'text-slate-500'
              }`} />
              <p className={darkMode ? 'text-gray-500' : 'text-slate-500'}>
                Nenhum produto encontrado
              </p>
            </div>
          }
        </div>
      </CardContent>
    </Card>
  );
}
