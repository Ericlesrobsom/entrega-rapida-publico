import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Save, Palette, Upload, Loader2, Type, EyeOff } from "lucide-react";
import { UploadFile } from "@/api/integrations";
import { toast } from "sonner";

export default function StoreCustomizationForm({ initialSettings, onSave, isSaving }) {
  const [settingsData, setSettingsData] = useState({
    store_primary_color: "#2563eb",
    store_secondary_color: "#4f46e5",
    store_logo_url: "",
    store_header_text: "",
    store_subtitle_text: "",
    show_featured_products: true,
  });
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (initialSettings) {
      setSettingsData({
        store_primary_color: initialSettings.store_primary_color || "#2563eb",
        store_secondary_color: initialSettings.store_secondary_color || "#4f46e5",
        store_logo_url: initialSettings.store_logo_url || "",
        store_header_text: initialSettings.store_header_text || "",
        store_subtitle_text: initialSettings.store_subtitle_text || "",
        show_featured_products: initialSettings.show_featured_products !== undefined ? initialSettings.show_featured_products : true,
      });
    }
  }, [initialSettings]);

  const handleChange = (field, value) => {
    setSettingsData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const result = await UploadFile({ file });
      if (result?.file_url) {
        handleChange("store_logo_url", result.file_url);
        toast.success("Logo enviado com sucesso!");
      }
    } catch (error) {
      toast.error("Erro ao enviar logo.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(settingsData);
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
              <Palette className="w-6 h-6 text-slate-600" />
            </div>
            <div>
              <CardTitle>Personalizar Loja</CardTitle>
              <CardDescription>
                Altere a aparência e os textos da sua loja principal.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Logo */}
          <div className="space-y-2">
            <Label>Logo da Loja</Label>
            <div className="flex items-center gap-4">
              {settingsData.store_logo_url && (
                <img src={settingsData.store_logo_url} alt="Logo" className="w-20 h-20 object-contain rounded-lg bg-slate-100 p-2" />
              )}
              <Input id="logo-upload" type="file" accept="image/*" onChange={handleLogoUpload} disabled={isUploading} className="hidden" />
              <Button asChild variant="outline" disabled={isUploading}>
                <Label htmlFor="logo-upload" className="cursor-pointer">
                  {isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                  {isUploading ? "Enviando..." : "Trocar Logo"}
                </Label>
              </Button>
            </div>
          </div>
          
          {/* Textos */}
          <div className="space-y-4">
             <div className="flex items-center gap-2">
                <Type className="w-5 h-5 text-slate-500"/>
                <h3 className="font-semibold text-lg">Textos Principais</h3>
             </div>
            <div className="space-y-2">
              <Label htmlFor="header_text">Título Principal</Label>
              <Input id="header_text" value={settingsData.store_header_text} onChange={(e) => handleChange("store_header_text", e.target.value)} placeholder="Ex: Nossos Produtos" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subtitle_text">Subtítulo</Label>
              <Textarea id="subtitle_text" value={settingsData.store_subtitle_text} onChange={(e) => handleChange("store_subtitle_text", e.target.value)} placeholder="Ex: Explore nossa seleção de produtos..." />
            </div>
          </div>

          {/* Cores */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="primary_color">Cor Primária</Label>
              <div className="flex items-center gap-2">
                <Input id="primary_color" type="color" value={settingsData.store_primary_color} onChange={(e) => handleChange("store_primary_color", e.target.value)} className="w-12 h-10 p-1" />
                <Input type="text" value={settingsData.store_primary_color} onChange={(e) => handleChange("store_primary_color", e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="secondary_color">Cor Secundária</Label>
              <div className="flex items-center gap-2">
                <Input id="secondary_color" type="color" value={settingsData.store_secondary_color} onChange={(e) => handleChange("store_secondary_color", e.target.value)} className="w-12 h-10 p-1" />
                <Input type="text" value={settingsData.store_secondary_color} onChange={(e) => handleChange("store_secondary_color", e.target.value)} />
              </div>
            </div>
          </div>

          {/* Seções */}
          <div className="space-y-4">
             <div className="flex items-center gap-2">
                <EyeOff className="w-5 h-5 text-slate-500"/>
                <h3 className="font-semibold text-lg">Visibilidade de Seções</h3>
             </div>
            <div className="flex items-center space-x-2 p-4 bg-slate-50 rounded-lg">
              <Switch id="show_featured_products" checked={settingsData.show_featured_products} onCheckedChange={(checked) => handleChange("show_featured_products", checked)} />
              <Label htmlFor="show_featured_products">Mostrar seção "Produtos em Destaque"?</Label>
            </div>
          </div>

        </CardContent>
        <CardFooter className="flex justify-end">
          <Button type="submit" disabled={isSaving || isUploading}>
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}