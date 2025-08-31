import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Edit, Trash2, ExternalLink, BarChart3 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdvertisementList({ advertisements, loading, onEdit, onDelete, onToggleStatus }) {
  const getPositionLabel = (position) => {
    const labels = {
      "after_featured": "Depois dos Destaques",
      "after_categories": "Depois das Categorias", 
      "middle_products": "Meio dos Produtos",
      "before_footer": "Antes do Rodapé"
    };
    return labels[position] || position;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array(6).fill(0).map((_, i) => (
          <Card key={i} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4">
              <Skeleton className="w-full h-32 rounded-lg mb-4" />
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (advertisements.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
          <BarChart3 className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-xl font-semibold text-slate-900 mb-2">Nenhum anúncio encontrado</h3>
        <p className="text-slate-600">Clique em "Novo Anúncio" para criar seu primeiro banner promocional.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {advertisements.map((ad) => (
        <Card key={ad.id} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-4">
            <div className="relative mb-4">
              <img 
                src={ad.image_url} 
                alt={ad.title || "Anúncio"} 
                className="w-full h-32 object-cover rounded-lg"
              />
              {ad.link_url && (
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Link
                  </Badge>
                </div>
              )}
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 line-clamp-1">{ad.title}</h3>
                  {ad.description && (
                    <p className="text-sm text-slate-600 line-clamp-2 mt-1">{ad.description}</p>
                  )}
                </div>
                <Badge variant="outline" className="ml-2 text-xs">
                  Prioridade {ad.priority}
                </Badge>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-xs">
                  📍 {getPositionLabel(ad.position)}
                </Badge>
                {ad.click_count > 0 && (
                  <Badge variant="outline" className="text-xs">
                    👁️ {ad.click_count} cliques
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t">
                <div className="flex items-center space-x-2">
                  <Switch
                    id={`active-${ad.id}`}
                    checked={ad.is_active}
                    onCheckedChange={() => onToggleStatus(ad)}
                    size="sm"
                  />
                  <Label htmlFor={`active-${ad.id}`} className="text-sm">
                    {ad.is_active ? "Ativo" : "Inativo"}
                  </Label>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => onEdit(ad)}>
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => onDelete(ad)} className="text-red-600 hover:text-red-700">
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}