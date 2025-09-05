
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, Edit, ToggleLeft, ToggleRight, Trash2, MoreVertical } from "lucide-react";
import { Switch } from "@/components/ui/switch"; // New import
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function CategoryListItem({ category, onEdit, onDelete, onToggleStatus, productCount }) {
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        const isDark = document.documentElement.classList.contains('dark');
        setDarkMode(isDark);
        // Observe changes to the 'class' attribute on the document's root element
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    setDarkMode(document.documentElement.classList.contains('dark'));
                }
            });
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    return (
        <Card className={`shadow-lg border-0 transition-all duration-300 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white'}`}>
            <CardContent className="p-4 flex items-center justify-between">
                <div className="flex-1">
                    <h3 className="font-semibold text-lg">{category.name}</h3>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>{category.description || 'Sem descrição'}</p>
                    <Badge variant="outline" className={`mt-2 ${darkMode ? 'border-gray-600 bg-gray-700 text-gray-200' : 'border-slate-200'}`}>
                        {productCount} {productCount === 1 ? 'produto' : 'produtos'}
                    </Badge>
                </div>
                <div className="flex items-center gap-2">
                    <Switch
                        checked={category.is_active}
                        onCheckedChange={() => onToggleStatus(category)}
                        aria-label={`Ativar/desativar ${category.name}`}
                    />
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className={`${darkMode ? 'text-gray-400 hover:bg-gray-700 hover:text-white' : 'text-slate-500 hover:bg-slate-100'}`}>
                                <MoreVertical className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className={darkMode ? 'bg-gray-900 border-gray-700 text-white' : ''}>
                            <DropdownMenuItem onClick={() => onEdit(category)} className={`${darkMode ? 'focus:bg-gray-700' : ''}`}>
                                <Edit className="w-4 h-4 mr-2" /> Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                                onClick={() => onDelete(category)} 
                                className={`text-red-500 focus:text-red-500 focus:bg-red-50 ${darkMode ? 'dark:focus:bg-red-900/50' : ''}`}
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
          <Card key={i} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg dark:bg-gray-800/80">
            <CardHeader className="p-4">
              <Skeleton className="h-6 w-3/4 dark:bg-gray-700" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <Skeleton className="h-4 w-full mb-2 dark:bg-gray-700" />
              <Skeleton className="h-4 w-1/2 mb-4 dark:bg-gray-700" />
              <Skeleton className="h-8 w-full dark:bg-gray-700" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-12 dark:text-gray-300">
        <Package className="w-16 h-16 mx-auto mb-4 text-slate-400 dark:text-gray-500" />
        <h3 className="text-xl font-semibold text-slate-900 mb-2 dark:text-gray-100">Nenhuma categoria encontrada</h3>
        <p className="text-slate-600 dark:text-gray-400">Crie sua primeira categoria para organizar seus produtos.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {categories.map((category) => {
        const productCount = getCategoryProductCount(category.slug);
        
        return (
          <CategoryListItem
            key={category.id}
            category={category}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleStatus={onToggleStatus}
            productCount={productCount}
          />
        );
      })}
    </div>
  );
}
