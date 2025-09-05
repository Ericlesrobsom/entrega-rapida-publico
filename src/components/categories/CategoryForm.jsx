
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Save, X, Grid3X3 } from "lucide-react"; // Added Grid3X3

// Helper function to generate slug, extracted as per outline
function generateSlug(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9\s]/g, '') // Remove caracteres especiais
    .replace(/\s+/g, '_') // Substitui espaços por underscores
    .trim();
}

export default function CategoryForm({ category, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: category?.name || "",
    slug: category?.slug || "",
    description: category?.description || "",
    is_active: category?.is_active !== undefined ? category.is_active : true
  });
  const [darkMode, setDarkMode] = useState(false);

  // Effect to detect and observe dark mode changes
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setDarkMode(isDark);
    const observer = new MutationObserver(() => {
      setDarkMode(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Effect to update form data when the category prop changes
  useEffect(() => {
    setFormData({
      name: category?.name || "",
      slug: category?.slug || "",
      description: category?.description || "",
      is_active: category?.is_active !== undefined ? category.is_active : true
    });
  }, [category]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNameChange = (e) => {
    const newName = e.target.value;
    setFormData(prev => {
      const newState = { ...prev, name: newName };
      // Generate slug automatically if the slug field is not manually set
      if (!prev.slug) { 
        newState.slug = generateSlug(newName);
      }
      return newState;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Fallback: Generate slug automatically if it's still empty and name is present (e.g., if user cleared slug)
    if (!formData.slug && formData.name) {
      formData.slug = generateSlug(formData.name);
    }
    
    onSubmit(formData);
  };

  return (
    <Card className={`mb-8 shadow-xl border-0 ${darkMode ? 'bg-gray-800/90 text-white' : 'bg-white/90'}`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
          <Grid3X3 className="w-5 h-5" />
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
                onChange={handleNameChange} // Use handleNameChange
                placeholder="Ex: Eletrônicos"
                required
                className={darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white'}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Identificador (slug) *</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => handleChange("slug", e.target.value)}
                placeholder="Ex: eletronicos"
                required
                className={`${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white'} font-mono text-sm`}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Descrição da categoria..."
              rows={3}
              className={darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white'}
            />
          </div>

          <div className="flex items-center space-x-2 pt-4">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => handleChange("is_active", checked)}
            />
            <Label htmlFor="is_active" className="text-sm">
              {formData.is_active ? "Categoria ativa" : "Categoria inativa"}
            </Label>
          </div>

          <div className={`flex justify-end gap-3 pt-4 border-t ${darkMode ? 'border-gray-700' : 'border-slate-200'}`}>
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              <Save className="w-4 h-4 mr-2" />
              {category ? "Atualizar Categoria" : "Criar Categoria"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
