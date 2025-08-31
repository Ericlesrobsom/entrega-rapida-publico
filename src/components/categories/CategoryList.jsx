import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, Edit, ToggleLeft, ToggleRight, Trash2, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function CategoryList({ 
  categories, 
  loading, 
  onEdit, 
  onDelete, 
  onToggleStatus, 
  getCategoryProductCount 
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array(6).fill(0).map((_, i) => (
          <Card key={i} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="p-4">
              <Skeleton className="h-6 w-3/4" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-1/2 mb-4" />
              <Skeleton className="h-8 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="w-16 h-16 mx-auto mb-4 text-slate-400" />
        <h3 className="text-xl font-semibold text-slate-900 mb-2">Nenhuma categoria encontrada</h3>
        <p className="text-slate-600">Crie sua primeira categoria para organizar seus produtos.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {categories.map((category) => {
        const productCount = getCategoryProductCount(category.slug);
        
        return (
          <Card key={category.id} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 group relative">
            <div className="absolute top-4 right-4 z-10">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-slate-500 hover:bg-slate-100">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(category)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onToggleStatus(category)}>
                    {category.is_active ? (
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
                    onClick={() => onDelete(category)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <CardHeader className="p-6">
              <div className="flex items-start gap-3">
                <div className="text-3xl">
                  {category.icon || "📦"}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-semibold text-slate-900">
                      {category.name}
                    </h3>
                    <Badge 
                      variant={category.is_active ? "default" : "secondary"}
                      className={category.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                    >
                      {category.is_active ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                  
                  <code className="text-sm bg-slate-100 px-2 py-1 rounded text-slate-600">
                    {category.slug}
                  </code>
                  
                  {category.description && (
                    <p className="text-sm text-slate-600 mt-2 line-clamp-2">
                      {category.description}
                    </p>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-6 pt-0">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-600">
                    {productCount} produto{productCount !== 1 ? 's' : ''}
                  </span>
                </div>
                
                {productCount > 0 && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    Com produtos
                  </Badge>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(category)}
                  className="flex-1"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Editar
                </Button>
                
                <Button
                  variant={category.is_active ? "outline" : "default"}
                  size="sm"
                  onClick={() => onToggleStatus(category)}
                  className="px-3"
                >
                  {category.is_active ? (
                    <ToggleRight className="w-4 h-4" />
                  ) : (
                    <ToggleLeft className="w-4 h-4" />
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(category)}
                  className="px-3 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}