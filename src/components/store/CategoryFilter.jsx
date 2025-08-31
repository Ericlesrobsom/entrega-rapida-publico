import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, Grid } from "lucide-react";

export default function CategoryFilter({ 
  selectedCategory, 
  onCategoryChange, 
  availableCategories, 
  productCounts,
  language = 'pt',
  t
}) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Grid className="w-5 h-5 text-slate-600" />
        <h3 className="text-lg font-semibold text-slate-900">{t('categories')}</h3>
      </div>
      
      <div className="flex flex-wrap gap-3">
        <Button
          variant={selectedCategory === "all" ? "default" : "outline"}
          onClick={() => onCategoryChange("all")}
          className={`flex items-center gap-2 transition-all duration-200 ${
            selectedCategory === "all" 
              ? "shadow-lg" 
              : "hover:shadow-md"
          }`}
          style={selectedCategory === "all" ? { 
            backgroundColor: 'var(--store-primary)', 
            borderColor: 'var(--store-primary)' 
          } : {}}
        >
          <Package className="w-4 h-4" />
          {t('allCategories')}
          {selectedCategory === "all" && productCounts?.total && (
            <Badge variant="secondary" className="ml-1 bg-white/20 text-white">
              {productCounts.total}
            </Badge>
          )}
        </Button>

        {availableCategories.map(category => (
          <Button
            key={category.id}
            variant={selectedCategory === category.slug ? "default" : "outline"}
            onClick={() => onCategoryChange(category.slug)}
            className={`flex items-center gap-2 transition-all duration-200 ${
              selectedCategory === category.slug 
                ? "shadow-lg" 
                : "hover:shadow-md"
            }`}
            style={selectedCategory === category.slug ? { 
              backgroundColor: 'var(--store-primary)', 
              borderColor: 'var(--store-primary)' 
            } : {}}
          >
            {category.icon && <span className="text-lg">{category.icon}</span>}
            {category.name}
            {productCounts?.[category.slug] && (
              <Badge 
                variant="secondary" 
                className={`ml-1 ${
                  selectedCategory === category.slug 
                    ? "bg-white/20 text-white" 
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {productCounts[category.slug]}
              </Badge>
            )}
          </Button>
        ))}
      </div>
    </div>
  );
}