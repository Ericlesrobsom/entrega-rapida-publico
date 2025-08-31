
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea"; 
import { Save, X, UploadCloud, Loader2 } from "lucide-react";
import { UploadFile } from "@/api/integrations";
import { toast } from "sonner";

export default function BannerForm({ banner, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    image_url: "",
    link_url: "",
    is_active: true,
  });
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false); 

  useEffect(() => {
    if (banner) {
      setFormData({
        title: banner.title || "",
        subtitle: banner.subtitle || "",
        image_url: banner.image_url || "",
        link_url: banner.link_url || "",
        is_active: banner.is_active !== undefined ? banner.is_active : true,
      });
    }
  }, [banner]);

  const handleFileChange = async (e) => {
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
    <Card className="mb-6 bg-white/90 backdrop-blur-sm border-0 shadow-xl">
      <CardHeader>
        <CardTitle>{banner ? "Editar Banner" : "Novo Banner"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>Imagem do Banner *</Label>
            <div className="flex items-center gap-4">
              {formData.image_url && (
                <img src={formData.image_url} alt="Pré-visualização" className="w-48 h-24 object-cover rounded-lg" />
              )}
              <div className="flex-1">
                <Input id="image-upload" type="file" accept="image/*" onChange={handleFileChange} disabled={isUploading} className="hidden" />
                <Button asChild variant="outline" disabled={isUploading}>
                  <Label htmlFor="image-upload" className="cursor-pointer">
                    {isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <UploadCloud className="w-4 h-4 mr-2" />}
                    {isUploading ? "Enviando..." : "Escolher Imagem"}
                  </Label>
                </Button>
                <p className="text-xs text-slate-500 mt-2">Faça o upload da imagem para o banner. Recomendado: 1200x400 pixels.</p>
              </div>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title">Título do Banner</Label> 
              <Input 
                id="title" 
                value={formData.title} 
                onChange={(e) => handleChange("title", e.target.value)} 
                placeholder="Ex: Promoção de Verão" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subtitle">Subtítulo</Label>
              <Textarea 
                id="subtitle" 
                value={formData.subtitle} 
                onChange={(e) => handleChange("subtitle", e.target.value)} 
                placeholder="Ex: Descontos de até 50%!" 
                rows={2} 
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="link_url">URL de Destino (Opcional)</Label> 
              <Input 
                id="link_url" 
                value={formData.link_url} 
                onChange={(e) => handleChange("link_url", e.target.value)} 
                placeholder="Ex: /produtos/promocao" 
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Switch 
              id="is_active" 
              checked={formData.is_active} 
              onCheckedChange={(checked) => handleChange("is_active", checked)} 
            />
            <Label htmlFor="is_active">Banner ativo</Label>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t"> 
            <Button type="button" variant="outline" onClick={onCancel}> 
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button type="submit" disabled={isUploading || isSaving} className="bg-blue-600 hover:bg-blue-700"> 
              <Save className="w-4 h-4 mr-2" />
              {banner ? "Atualizar" : "Salvar"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
