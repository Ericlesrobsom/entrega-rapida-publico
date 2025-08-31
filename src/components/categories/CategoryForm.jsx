import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Save, X } from "lucide-react";

export default function CategoryForm({ category, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: category?.name || "",
    slug: category?.slug || "",
    icon: category?.icon || "",
    description: category?.description || "",
    is_active: category?.is_active !== undefined ? category.is_active : true
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Gerar slug automaticamente se estiver vazio
    if (!formData.slug && formData.name) {
      const generatedSlug = formData.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove acentos
        .replace(/[^a-z0-9\s]/g, '') // Remove caracteres especiais
        .replace(/\s+/g, '_') // Substitui espaços por underscores
        .trim();
      
      formData.slug = generatedSlug;
    }
    
    onSubmit(formData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Sugestões de ícones populares
  const iconSuggestions = [
    "📱", "👕", "🏠", "⚽", "💄", "📚", "🧸", "📦", 
    "🎮", "🚗", "🍔", "🎵", "📷", "💻", "👟", "🎨"
  ];

  return (
    <Card className="mb-6 bg-white/90 backdrop-blur-sm border-0 shadow-xl">
      <CardHeader className="pb-4">
        <CardTitle className="text-slate-900">
          {category ? "Editar Categoria" : "Nova Categoria"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Categoria *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Ex: Eletrônicos"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Identificador (Slug)</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => handleChange("slug", e.target.value)}
                placeholder="Ex: eletronicos"
                className="font-mono text-sm"
              />
              <p className="text-xs text-slate-500">
                Será gerado automaticamente se deixar vazio
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="icon">Ícone/Emoji</Label>
              <div className="space-y-2">
                <Input
                  id="icon"
                  value={formData.icon}
                  onChange={(e) => handleChange("icon", e.target.value)}
                  placeholder="📱"
                  className="text-lg"
                  maxLength="10"
                />
                <div className="flex flex-wrap gap-1">
                  {iconSuggestions.map((emoji, index) => (
                    <Button
                      key={index}
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-lg p-1 h-8 w-8"
                      onClick={() => handleChange("icon", emoji)}
                    >
                      {emoji}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="is_active">Status</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => handleChange("is_active", checked)}
                />
                <Label htmlFor="is_active" className="text-sm">
                  {formData.is_active ? "Categoria ativa" : "Categoria inativa"}
                </Label>
              </div>
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Descrição da categoria..."
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              <Save className="w-4 h-4 mr-2" />
              {category ? "Atualizar" : "Salvar"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}