
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Save, X, UploadCloud, Loader2, BarChart } from "lucide-react"; // Adicionado BarChart
import { UploadFile } from "@/api/integrations";
import { Category } from "@/api/entities";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

const positionOptions = [
  { value: "after_featured", label: "Depois dos Produtos em Destaque" },
  { value: "after_categories", label: "Depois das Categorias" },
  { value: "middle_products", label: "No Meio dos Produtos" },
  { value: "before_footer", label: "Antes do Rodapé" }
];

export default function AdvertisementForm({ advertisement, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image_url: "",
    link_url: "",
    position: "middle_products",
    target_categories: [],
    is_active: true,
    priority: 1
  });
  const [isUploading, setIsUploading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [darkMode, setDarkMode] = useState(false); // Novo estado para tema escuro

  // Efeito para detectar o tema escuro
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setDarkMode(isDark);
    const observer = new MutationObserver(() => {
      setDarkMode(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Carregar categorias quando o componente montar
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

  // Carregar dados do anúncio existente
  useEffect(() => {
    if (advertisement) {
      setFormData({
        title: advertisement.title || "",
        description: advertisement.description || "",
        image_url: advertisement.image_url || "",
        link_url: advertisement.link_url || "",
        position: advertisement.position || "middle_products",
        target_categories: advertisement.target_categories || [],
        is_active: advertisement.is_active !== undefined ? advertisement.is_active : true,
        priority: advertisement.priority || 1
      });
    }
  }, [advertisement]);

  // Renomeado para handleImageUpload
  const handleImageUpload = async (e) => {
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

  // Função para gerenciar seleção de categorias
  const handleCategoryToggle = (categorySlug, isChecked) => {
    setFormData(prev => ({
      ...prev,
      target_categories: isChecked
        ? [...prev.target_categories, categorySlug]
        : prev.target_categories.filter(slug => slug !== categorySlug)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.image_url) {
      toast.error("Por favor, faça o upload de uma imagem para o anúncio.");
      return;
    }
    onSubmit({
      ...formData,
      priority: parseInt(formData.priority) || 1
    });
  };

  return (
    <Card className={`mb-8 shadow-xl border-0 ${darkMode ? 'bg-gray-800/90 text-white' : 'bg-white/90'}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart className="w-5 h-5" />
          {advertisement ? 'Editar Anúncio' : 'Novo Anúncio'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="image_url">Imagem do Anúncio *</Label>
            <div className="flex items-center gap-4">
              <Input
                id="image_upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className={`flex-1 ${darkMode ? 'bg-gray-700 border-gray-600 file:text-gray-300' : 'bg-white'}`}
                disabled={isUploading}
              />
              {isUploading && <Loader2 className="animate-spin w-5 h-5" />}
            </div>
            {formData.image_url && <img src={formData.image_url} alt="Preview" className="mt-2 w-full h-auto max-h-48 object-contain rounded-lg" />}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Ex: Promoção Imperdível"
                required
                className={darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white'}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="link_url">Link de Destino</Label>
              <Input
                id="link_url"
                type="url"
                value={formData.link_url}
                onChange={(e) => handleChange('link_url', e.target.value)}
                placeholder="https://exemplo.com ou /produtos/categoria"
                className={darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white'}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Descrição do anúncio..."
              rows={2}
              className={darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white'}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="position">Posição na Loja</Label>
              <Select value={formData.position} onValueChange={(value) => handleChange('position', value)}>
                <SelectTrigger className={darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white'}>
                  <SelectValue placeholder="Selecione a posição" />
                </SelectTrigger>
                <SelectContent className={darkMode ? 'bg-gray-800 border-gray-700 text-white' : ''}>
                  {positionOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Prioridade</Label>
              <Input
                id="priority"
                type="number"
                min="1"
                max="100"
                value={formData.priority}
                onChange={(e) => handleChange('priority', e.target.value)}
                placeholder="1"
                className={darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white'}
              />
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>Maior número = maior prioridade</p>
            </div>
          </div>

          {/* Seleção de Categorias */}
          <div className="space-y-3">
            <Label>Mostrar Anúncio Apenas Nas Categorias:</Label>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>
              Se nenhuma categoria for selecionada, o anúncio aparecerá em todas as categorias.
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
                      id={`ad-category-${category.slug}`}
                      checked={formData.target_categories.includes(category.slug)}
                      onCheckedChange={(checked) => handleCategoryToggle(category.slug, checked)}
                    />
                    <Label htmlFor={`ad-category-${category.slug}`} className="text-sm cursor-pointer">
                      {category.icon ? `${category.icon} ` : ''}{category.name}
                    </Label>
                  </div>
                ))}
              </div>
            )}

            {/* Mostrar categorias selecionadas */}
            {formData.target_categories.length > 0 && (
              <div className="text-sm text-blue-600 mt-2">
                <strong>Aparecerá em:</strong> {
                  categories
                    .filter(cat => formData.target_categories.includes(cat.slug))
                    .map(cat => cat.name)
                    .join(', ')
                }
              </div>
            )}
            {formData.target_categories.length === 0 && !loadingCategories && categories.length > 0 && (
              <div className="text-sm text-blue-600 mt-2">
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
            <Label htmlFor="is_active">Anúncio Ativo</Label>
          </div>

          <div className={`flex justify-end gap-3 pt-4 border-t ${darkMode ? 'border-gray-700' : 'border-slate-200'}`}>
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isUploading}>
              <Save className="w-4 h-4 mr-2" />
              {isUploading ? 'Enviando...' : (advertisement ? 'Atualizar Anúncio' : 'Criar Anúncio')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
