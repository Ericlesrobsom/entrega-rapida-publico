
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, Upload, Loader2 } from "lucide-react";
import { UploadFile } from "@/api/integrations";
import { toast } from "sonner";

export default function CourseDetailsForm({ initialData, onSave, isSaving, darkMode }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    full_description: "",
    thumbnail_url: "",
    price: 0,
    original_price: 0,
    instructor_name: "",
    duration_hours: 0,
    difficulty_level: "iniciante",
    category: "",
    is_active: true,
    is_featured: false,
    certificate_available: false,
  });
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePriceChange = (field, value) => {
    const numValue = parseFloat(value) || 0;
    handleChange(field, numValue);
  };
  
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { file_url } = await UploadFile({ file });
      handleChange("thumbnail_url", file_url);
      toast.success("Imagem enviada com sucesso!");
    } catch (error) {
      toast.error("Falha ao enviar a imagem.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card className={`border-0 shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white/80 backdrop-blur-sm'}`}>
        <CardHeader>
          <CardTitle className={darkMode ? 'text-white' : ''}>Informações do Curso</CardTitle>
          <CardDescription className={darkMode ? 'text-gray-400' : ''}>Preencha os detalhes principais do seu curso.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title" className={darkMode ? 'text-gray-300' : ''}>Título do Curso</Label>
            <Input id="title" value={formData.title} onChange={e => handleChange('title', e.target.value)} required className={darkMode ? 'bg-gray-700 border-gray-600 text-white' : ''} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description" className={darkMode ? 'text-gray-300' : ''}>Descrição Curta (para cards)</Label>
            <Textarea id="description" value={formData.description} onChange={e => handleChange('description', e.target.value)} className={darkMode ? 'bg-gray-700 border-gray-600 text-white' : ''} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="full_description" className={darkMode ? 'text-gray-300' : ''}>Descrição Completa</Label>
            <Textarea id="full_description" value={formData.full_description} onChange={e => handleChange('full_description', e.target.value)} rows={5} className={darkMode ? 'bg-gray-700 border-gray-600 text-white' : ''} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-2">
                <Label className={darkMode ? 'text-gray-300' : ''}>Thumbnail (Imagem de Capa)</Label>
                {formData.thumbnail_url && <img src={formData.thumbnail_url} alt="Thumbnail" className="w-full h-auto object-cover rounded-md mt-2" />}
                <Input id="thumbnail_upload" type="file" onChange={handleImageUpload} disabled={isUploading} className={`file:text-white ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-300' : ''}`} />
                {isUploading && <Loader2 className="w-4 h-4 animate-spin" />}
              </div>
            <div className="space-y-2">
              <Label htmlFor="instructor_name" className={darkMode ? 'text-gray-300' : ''}>Nome do Instrutor</Label>
              <Input id="instructor_name" value={formData.instructor_name} onChange={e => handleChange('instructor_name', e.target.value)} className={darkMode ? 'bg-gray-700 border-gray-600 text-white' : ''} />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="price" className={darkMode ? 'text-gray-300' : ''}>Preço (R$)</Label>
              <Input id="price" type="number" step="0.01" value={formData.price} onChange={e => handlePriceChange('price', e.target.value)} className={darkMode ? 'bg-gray-700 border-gray-600 text-white' : ''} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="original_price" className={darkMode ? 'text-gray-300' : ''}>Preço Original (de/por)</Label>
              <Input id="original_price" type="number" step="0.01" value={formData.original_price} onChange={e => handlePriceChange('original_price', e.target.value)} className={darkMode ? 'bg-gray-700 border-gray-600 text-white' : ''} />
            </div>
             <div className="space-y-2">
              <Label htmlFor="duration_hours" className={darkMode ? 'text-gray-300' : ''}>Duração (horas)</Label>
              <Input id="duration_hours" type="number" value={formData.duration_hours} onChange={e => handlePriceChange('duration_hours', e.target.value)} className={darkMode ? 'bg-gray-700 border-gray-600 text-white' : ''} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="difficulty_level" className={darkMode ? 'text-gray-300' : ''}>Nível de Dificuldade</Label>
              <Select value={formData.difficulty_level} onValueChange={value => handleChange('difficulty_level', value)}>
                <SelectTrigger className={darkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}><SelectValue /></SelectTrigger>
                <SelectContent className={darkMode ? 'bg-gray-800 border-gray-700 text-white' : ''}>
                  <SelectItem value="iniciante">Iniciante</SelectItem>
                  <SelectItem value="intermediario">Intermediário</SelectItem>
                  <SelectItem value="avancado">Avançado</SelectItem>
                </SelectContent>
              </Select>
            </div>
             <div className="space-y-2">
              <Label htmlFor="category" className={darkMode ? 'text-gray-300' : ''}>Categoria</Label>
              <Input id="category" value={formData.category} onChange={e => handleChange('category', e.target.value)} placeholder="Ex: Marketing Digital" className={darkMode ? 'bg-gray-700 border-gray-600 text-white' : ''} />
            </div>
          </div>

          <div className="flex flex-wrap gap-6 pt-4">
             <div className="flex items-center space-x-2">
                <Switch id="is_active" checked={formData.is_active} onCheckedChange={value => handleChange('is_active', value)} />
                <Label htmlFor="is_active" className={darkMode ? 'text-gray-300' : ''}>Curso Ativo</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="is_featured" checked={formData.is_featured} onCheckedChange={value => handleChange('is_featured', value)} />
                <Label htmlFor="is_featured" className={darkMode ? 'text-gray-300' : ''}>Curso em Destaque</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="certificate_available" checked={formData.certificate_available} onCheckedChange={value => handleChange('certificate_available', value)} />
                <Label htmlFor="certificate_available" className={darkMode ? 'text-gray-300' : ''}>Oferece Certificado</Label>
              </div>
          </div>

        </CardContent>
        <CardFooter className={darkMode ? 'border-t border-gray-700' : ''}>
          <Button type="submit" disabled={isSaving || isUploading} className="bg-blue-600 hover:bg-blue-700">
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Salvando..." : "Salvar Detalhes"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
