
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea"; // Keep Textarea for subtitle if desired, or change to Input
import { Save, X, Loader2, ImageIcon } from "lucide-react"; // Added ImageIcon, removed UploadCloud as per outline's implicit change
import { UploadFile } from "@/api/integrations";
import { Category } from "@/api/entities";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";

export default function BannerForm({ banner, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    image_url: "",
    link_url: "",
    target_categories: [],
    is_active: true,
  });
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [darkMode, setDarkMode] = useState(false); // Added darkMode state

  // Effect to detect and observe dark mode
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setDarkMode(isDark);
    const observer = new MutationObserver(() => {
      setDarkMode(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Load categories when the component mounts
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesData = await Category.filter({ is_active: true });
        setCategories(categoriesData);
      } catch (error) {
        console.error("Erro ao carregar categorias:", error);
        toast.error("Erro ao carregar categorias.");
      } finally {
        setLoadingCategories(false);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    if (banner) {
      setFormData({
        title: banner.title || "",
        subtitle: banner.subtitle || "",
        image_url: banner.image_url || "",
        link_url: banner.link_url || "",
        target_categories: banner.target_categories || [],
        is_active: banner.is_active !== undefined ? banner.is_active : true,
      });
    }
  }, [banner]);

  const handleImageUpload = async (e) => { // Renamed from handleFileChange
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const result = await UploadFile({ file });
      if (result && result.file_url) {
        setFormData(prev => ({ ...prev, image_url: result.file_url }));
        toast.success("Upload da imagem concluído!");
      } else {
        throw new Error("URL da imagem não retornada.");
      }
    } catch (error) {
      console.error("Erro no upload:", error);
      toast.error("Falha no upload da imagem. Tente novamente.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Function to manage category selection
  const handleCategoryToggle = (categorySlug, isChecked) => {
    setFormData(prev => ({
      ...prev,
      target_categories: isChecked
        ? [...prev.target_categories, categorySlug]
        : prev.target_categories.filter(slug => slug !== categorySlug)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.image_url) {
      toast.error("Por favor, faça o upload de uma imagem para o banner.");
      return;
    }

    setIsSaving(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Erro ao salvar o banner.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className={`mb-6 shadow-xl border-0 ${darkMode ? 'bg-gray-800/90 text-white' : 'bg-white/90 backdrop-blur-sm'}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5" /> {/* Added ImageIcon */}
          {banner ? "Editar Banner" : "Novo Banner"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="image_upload">Imagem do Banner *</Label> {/* Updated htmlFor */}
            <div className="flex items-center gap-4">
              <Input
                id="image_upload" // Updated id
                type="file"
                accept="image/*"
                onChange={handleImageUpload} // Renamed function
                className={`flex-1 ${darkMode ? 'bg-gray-700 border-gray-600 file:text-gray-300' : 'bg-white'}`}
                disabled={isUploading}
              />
              {isUploading && <Loader2 className="w-5 h-5 animate-spin" />}
            </div>
            {formData.image_url && (
              <img src={formData.image_url} alt="Pré-visualização" className="mt-2 w-full h-auto max-h-48 object-contain rounded-lg" />
            )}
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-slate-500'} mt-2`}>Faça o upload da imagem para o banner. Recomendado: 1200x400 pixels.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title">Título do Banner</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                placeholder="Ex: Promoção de Verão"
                className={darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white'}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subtitle">Subtítulo</Label>
              {/* Changed from Textarea to Input as per outline, assuming this was intentional */}
              <Input
                id="subtitle"
                value={formData.subtitle}
                onChange={(e) => handleChange("subtitle", e.target.value)}
                placeholder="Ex: Descontos de até 50%!"
                className={darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white'}
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="link_url">URL de Destino (Opcional)</Label>
              <Input
                id="link_url"
                type="url" // Changed type to url
                value={formData.link_url}
                onChange={(e) => handleChange("link_url", e.target.value)}
                placeholder="https://..." // Changed placeholder
                className={darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white'}
              />
            </div>
          </div>

          {/* Category Selection */}
          <div className="space-y-3">
            <Label>Mostrar Banner Apenas Nas Categorias:</Label>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>
              Se nenhuma categoria for selecionada, o banner aparecerá em todas as categorias.
            </p>

            {loadingCategories ? (
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>Carregando categorias...</p>
            ) : categories.length === 0 ? (
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>Nenhuma categoria encontrada</p>
            ) : (
              <div className={`grid grid-cols-2 md:grid-cols-3 gap-3 max-h-48 overflow-y-auto p-3 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-slate-50'}`}>
                {categories.map(category => (
                  <div key={category.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category.slug}`}
                      checked={formData.target_categories.includes(category.slug)}
                      onCheckedChange={(checked) => handleCategoryToggle(category.slug, checked)}
                      className={darkMode ? 'border-gray-500' : ''} // Added dark mode border for checkbox
                    />
                    <Label htmlFor={`category-${category.slug}`} className="text-sm cursor-pointer">
                      {category.icon ? `${category.icon} ` : ''}{category.name}
                    </Label>
                  </div>
                ))}
              </div>
            )}

            {/* Show selected categories */}
            {formData.target_categories.length > 0 && (
              <div className={`text-sm mt-2 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                <strong>Aparecerá em:</strong> {
                  categories
                    .filter(cat => formData.target_categories.includes(cat.slug))
                    .map(cat => cat.name)
                    .join(', ')
                }
              </div>
            )}
            {formData.target_categories.length === 0 && !loadingCategories && categories.length > 0 && (
              <div className={`text-sm mt-2 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                <strong>Aparecerá em:</strong> Todas as categorias
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => handleChange("is_active", checked)}
            />
            <Label htmlFor="is_active">Banner ativo</Label>
          </div>
          <div className={`flex justify-end gap-3 pt-4 border-t ${darkMode ? 'border-gray-700' : 'border-slate-200'}`}>
            <Button type="button" variant="outline" onClick={onCancel} className={darkMode ? 'text-white border-gray-600 hover:bg-gray-700' : ''}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving || isUploading} className="bg-blue-600 hover:bg-blue-700">
              {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              {isSaving ? (banner ? "Atualizando..." : "Salvando...") : (banner ? "Atualizar Banner" : "Criar Banner")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
