import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Save, X, Megaphone, Upload } from "lucide-react";
import { UploadFile } from "@/api/integrations";
import { toast } from "sonner";

import CustomerSelector from "./CustomerSelector";

export default function GlobalOfferForm({ offer, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    title: offer?.title || "",
    description: offer?.description || "",
    discount_percentage: offer?.discount_percentage || "",
    duration_hours: offer?.duration_hours || 24,
    banner_image_url: offer?.banner_image_url || "",
    is_active: offer?.is_active ?? true,
  });
  const [selectedEmails, setSelectedEmails] = useState(offer?.target_user_emails || []);
  const [isUploading, setIsUploading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    setFormData({
      title: offer?.title || "",
      description: offer?.description || "",
      discount_percentage: offer?.discount_percentage || "",
      duration_hours: offer?.duration_hours || 24,
      banner_image_url: offer?.banner_image_url || "",
      is_active: offer?.is_active ?? true,
    });
    setSelectedEmails(offer?.target_user_emails || []);
  }, [offer]);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setDarkMode(isDark);
    const observer = new MutationObserver(() => {
      setDarkMode(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);
  
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const response = await UploadFile({ file });
      if (response && response.file_url) {
        setFormData(prev => ({ ...prev, banner_image_url: response.file_url }));
        toast.success("Banner enviado com sucesso!");
      }
    } catch (error) {
      console.error("Erro no upload:", error);
      toast.error("Falha ao enviar o banner.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if(selectedEmails.length === 0) {
      toast.error("Você precisa selecionar pelo menos um cliente.");
      return;
    }
    
    onSubmit({
      ...formData,
      target_user_emails: selectedEmails,
    });
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <Card className={`shadow-xl border-0 ${darkMode ? 'bg-gray-800/90 text-white' : 'bg-white/90'}`}>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="w-5 h-5" />
            {offer ? "Editar Oferta Global" : "Nova Oferta Global"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">Título da Oferta *</Label>
                <Input id="title" value={formData.title} onChange={(e) => handleChange("title", e.target.value)} required className={darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white'} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discount_percentage">Desconto (%) *</Label>
                <Input id="discount_percentage" type="number" min="1" max="100" value={formData.discount_percentage} onChange={(e) => handleChange("discount_percentage", parseInt(e.target.value, 10))} required className={darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white'} />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Descrição no Popup</Label>
              <Textarea id="description" value={formData.description} onChange={(e) => handleChange("description", e.target.value)} rows={2} placeholder="Texto que aparecerá no popup da oferta para o cliente" className={darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white'} />
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="duration_hours">Duração da Oferta (horas) *</Label>
                <Input id="duration_hours" type="number" min="1" value={formData.duration_hours} onChange={(e) => handleChange("duration_hours", parseInt(e.target.value, 10))} required className={darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white'} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="banner-upload">Banner Personalizado (Opcional)</Label>
                <div className="flex items-center gap-2">
                  <Button asChild variant="outline" className="flex-1">
                    <label htmlFor="banner-upload" className="cursor-pointer">
                      <Upload className="w-4 h-4 mr-2"/>
                      {isUploading ? "Enviando..." : "Escolher Imagem"}
                    </label>
                  </Button>
                  <input id="banner-upload" type="file" className="hidden" onChange={handleFileChange} accept="image/*" disabled={isUploading} />
                </div>
                {formData.banner_image_url && <img src={formData.banner_image_url} alt="Preview" className="mt-2 h-20 w-auto rounded" />}
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-4">
              <Switch id="is_active" checked={formData.is_active} onCheckedChange={(checked) => handleChange('is_active', checked)} />
              <Label htmlFor="is_active">Oferta Ativa</Label>
            </div>

            <div className={`flex justify-end gap-3 pt-4 border-t ${darkMode ? 'border-gray-700' : 'border-slate-200'}`}>
              <Button type="button" variant="outline" onClick={onCancel}>
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                <Save className="w-4 h-4 mr-2" />
                {offer ? "Atualizar Oferta" : "Criar Oferta"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Seletor de Clientes */}
      <CustomerSelector
        selectedEmails={selectedEmails}
        onEmailsChange={setSelectedEmails}
        darkMode={darkMode}
      />
    </div>
  );
}