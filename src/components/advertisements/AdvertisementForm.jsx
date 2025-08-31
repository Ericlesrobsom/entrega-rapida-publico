import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Save, X, UploadCloud, Loader2 } from "lucide-react";
import { UploadFile } from "@/api/integrations";
import { toast } from "sonner";

export default function AdvertisementForm({ advertisement, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image_url: "",
    link_url: "",
    position: "middle_products",
    is_active: true,
    priority: 1
  });
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (advertisement) {
      setFormData({
        title: advertisement.title || "",
        description: advertisement.description || "",
        image_url: advertisement.image_url || "",
        link_url: advertisement.link_url || "",
        position: advertisement.position || "middle_products",
        is_active: advertisement.is_active !== undefined ? advertisement.is_active : true,
        priority: advertisement.priority || 1
      });
    }
  }, [advertisement]);

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

  const positionOptions = [
    { value: "after_featured", label: "Depois dos Produtos em Destaque" },
    { value: "after_categories", label: "Depois das Categorias" },
    { value: "middle_products", label: "No Meio dos Produtos" },
    { value: "before_footer", label: "Antes do Rodapé" }
  ];

  return (
    <Card className="mb-6 bg-white/90 backdrop-blur-sm border-0 shadow-xl">
      <CardHeader>
        <CardTitle>{advertisement ? "Editar Anúncio" : "Novo Anúncio"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>Imagem do Anúncio *</Label>
            <div className="flex items-center gap-4">
              {formData.image_url && (
                <img src={formData.image_url} alt="Pré-visualização" className="w-64 h-32 object-cover rounded-lg bg-slate-100" />
              )}
              <div className="flex-1">
                <Input id="image-upload" type="file" accept="image/*" onChange={handleFileChange} disabled={isUploading} className="hidden" />
                <Button asChild variant="outline" disabled={isUploading}>
                  <Label htmlFor="image-upload" className="cursor-pointer">
                    {isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <UploadCloud className="w-4 h-4 mr-2" />}
                    {isUploading ? "Enviando..." : "Escolher Imagem"}
                  </Label>
                </Button>
                <p className="text-xs text-slate-500 mt-2">Recomendado: 800x300 pixels para melhor visualização.</p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title">Título do Anúncio *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                placeholder="Ex: Promoção Imperdível"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Prioridade</Label>
              <Input
                id="priority"
                type="number"
                min="1"
                max="100"
                value={formData.priority}
                onChange={(e) => handleChange("priority", e.target.value)}
                placeholder="1"
              />
              <p className="text-xs text-slate-500">Maior número = maior prioridade</p>
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Descrição do anúncio..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="link_url">Link de Destino</Label>
              <Input
                id="link_url"
                value={formData.link_url}
                onChange={(e) => handleChange("link_url", e.target.value)}
                placeholder="https://exemplo.com ou /produtos/categoria"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="position">Posição na Loja</Label>
              <Select value={formData.position} onValueChange={(value) => handleChange("position", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Escolha a posição" />
                </SelectTrigger>
                <SelectContent>
                  {positionOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2 flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => handleChange("is_active", checked)}
              />
              <Label htmlFor="is_active">Anúncio ativo</Label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button type="submit" disabled={isUploading} className="bg-blue-600 hover:bg-blue-700">
              <Save className="w-4 h-4 mr-2" />
              {advertisement ? "Atualizar" : "Salvar"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}