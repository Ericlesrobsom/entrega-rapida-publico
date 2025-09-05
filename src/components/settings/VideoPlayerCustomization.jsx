import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { UploadFile } from "@/api/integrations";
import { toast } from "sonner";
import { Upload, Play, Loader2, Eye } from "lucide-react";

export default function VideoPlayerCustomization({ initialSettings, onSave, isSaving }) {
  const [settings, setSettings] = useState({
    video_player_icon_url: initialSettings?.video_player_icon_url || "",
    video_player_icon_size: initialSettings?.video_player_icon_size || 80,
    video_player_icon_position: initialSettings?.video_player_icon_position || "center",
    video_player_icon_opacity: initialSettings?.video_player_icon_opacity || 0.8,
    video_player_icon_width: initialSettings?.video_player_icon_width || 80,
    video_player_icon_height: initialSettings?.video_player_icon_height || 80,
  });

  const [isUploading, setIsUploading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    if (initialSettings) {
      setSettings({
        video_player_icon_url: initialSettings.video_player_icon_url || "",
        video_player_icon_size: initialSettings.video_player_icon_size || 80,
        video_player_icon_position: initialSettings.video_player_icon_position || "center",
        video_player_icon_opacity: initialSettings.video_player_icon_opacity || 0.8,
        video_player_icon_width: initialSettings.video_player_icon_width || 80,
        video_player_icon_height: initialSettings.video_player_icon_height || 80,
      });
    }
  }, [initialSettings]);

  const handleIconUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { file_url } = await UploadFile({ file });
      setSettings(prev => ({ ...prev, video_player_icon_url: file_url }));
      toast.success("Ícone enviado com sucesso!");
    } catch (error) {
      toast.error("Falha ao enviar o ícone.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = () => {
    onSave(settings);
  };

  const positionOptions = [
    { value: "center", label: "Centro" },
    { value: "top-left", label: "Canto Superior Esquerdo" },
    { value: "top-right", label: "Canto Superior Direito" },
    { value: "bottom-left", label: "Canto Inferior Esquerdo" },
    { value: "bottom-right", label: "Canto Inferior Direito" },
    { value: "top-center", label: "Centro Superior" },
    { value: "bottom-center", label: "Centro Inferior" },
  ];

  const getPositionStyles = () => {
    const baseStyles = {
      position: 'absolute',
      width: `${settings.video_player_icon_width}px`,
      height: `${settings.video_player_icon_height}px`,
      opacity: settings.video_player_icon_opacity,
      pointerEvents: 'none',
      zIndex: 10,
    };

    switch (settings.video_player_icon_position) {
      case 'top-left':
        return { ...baseStyles, top: '20px', left: '20px' };
      case 'top-right':
        return { ...baseStyles, top: '20px', right: '20px' };
      case 'bottom-left':
        return { ...baseStyles, bottom: '20px', left: '20px' };
      case 'bottom-right':
        return { ...baseStyles, bottom: '20px', right: '20px' };
      case 'top-center':
        return { ...baseStyles, top: '20px', left: '50%', transform: 'translateX(-50%)' };
      case 'bottom-center':
        return { ...baseStyles, bottom: '20px', left: '50%', transform: 'translateX(-50%)' };
      case 'center':
      default:
        return { ...baseStyles, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    }
  };

  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="w-5 h-5 text-blue-600" />
          Customização do Player de Vídeo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Upload do Ícone */}
        <div className="space-y-3">
          <Label>Ícone Personalizado do Player</Label>
          <div className="flex items-center gap-4">
            {settings.video_player_icon_url && (
              <img 
                src={settings.video_player_icon_url} 
                alt="Ícone atual" 
                className="w-16 h-16 object-contain bg-gray-100 rounded border"
              />
            )}
            <div className="flex-1">
              <Input
                type="file"
                accept="image/*"
                onChange={handleIconUpload}
                disabled={isUploading}
                className="file:text-white"
              />
              {isUploading && <Loader2 className="w-4 h-4 animate-spin mt-2" />}
            </div>
          </div>
          <p className="text-sm text-gray-600">
            Recomendado: PNG com fundo transparente, 100x100px ou maior
          </p>
        </div>

        {/* Posição */}
        <div className="space-y-2">
          <Label>Posição do Ícone</Label>
          <Select 
            value={settings.video_player_icon_position} 
            onValueChange={(value) => setSettings(prev => ({ ...prev, video_player_icon_position: value }))}
          >
            <SelectTrigger>
              <SelectValue />
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

        {/* Tamanho Personalizado */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Largura: {settings.video_player_icon_width}px</Label>
            <Slider
              value={[settings.video_player_icon_width]}
              onValueChange={([value]) => setSettings(prev => ({ ...prev, video_player_icon_width: value }))}
              max={200}
              min={20}
              step={5}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label>Altura: {settings.video_player_icon_height}px</Label>
            <Slider
              value={[settings.video_player_icon_height]}
              onValueChange={([value]) => setSettings(prev => ({ ...prev, video_player_icon_height: value }))}
              max={200}
              min={20}
              step={5}
              className="w-full"
            />
          </div>
        </div>

        {/* Opacidade */}
        <div className="space-y-2">
          <Label>Opacidade: {Math.round(settings.video_player_icon_opacity * 100)}%</Label>
          <Slider
            value={[settings.video_player_icon_opacity]}
            onValueChange={([value]) => setSettings(prev => ({ ...prev, video_player_icon_opacity: value }))}
            max={1}
            min={0.1}
            step={0.1}
            className="w-full"
          />
        </div>

        {/* Preview */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Label>Prévia</Label>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setPreviewMode(!previewMode)}
            >
              <Eye className="w-4 h-4 mr-1" />
              {previewMode ? 'Ocultar' : 'Mostrar'} Prévia
            </Button>
          </div>

          {previewMode && (
            <div className="relative w-full h-48 bg-black rounded-lg overflow-hidden">
              {/* Simulação de um vídeo */}
              <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                <span className="text-white text-sm opacity-50">Simulação do Player de Vídeo</span>
              </div>

              {/* Ícone personalizado */}
              {settings.video_player_icon_url && (
                <img
                  src={settings.video_player_icon_url}
                  alt="Ícone Preview"
                  style={getPositionStyles()}
                />
              )}

              {/* Fallback para ícone padrão */}
              {!settings.video_player_icon_url && (
                <Play 
                  style={getPositionStyles()}
                  className="text-white"
                />
              )}
            </div>
          )}
        </div>

        {/* Botões */}
        <div className="flex gap-3">
          <Button onClick={handleSave} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700">
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Salvar Configurações
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => setSettings(prev => ({ 
              ...prev, 
              video_player_icon_url: "",
              video_player_icon_size: 80,
              video_player_icon_position: "center",
              video_player_icon_opacity: 0.8,
              video_player_icon_width: 80,
              video_player_icon_height: 80,
            }))}
          >
            Restaurar Padrão
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}