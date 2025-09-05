
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Save, X } from "lucide-react";

export default function DeliveryMethodForm({ method, onSubmit, onCancel, darkMode }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "",
    is_active: true,
  });

  useEffect(() => {
    if (method) {
      setFormData({
        name: method.name || "",
        description: method.description || "",
        icon: method.icon || "",
        is_active: method.is_active !== undefined ? method.is_active : true,
      });
    } else {
      setFormData({ name: "", description: "", icon: "", is_active: true });
    }
  }, [method]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className={`mb-6 border-0 shadow-xl ${darkMode ? 'bg-gray-800' : 'bg-white/90 backdrop-blur-sm'}`}>
      <CardHeader className="pb-4">
        <CardTitle className={darkMode ? 'text-white' : 'text-slate-900'}>
          {method ? "Editar Método de Entrega" : "Novo Método de Entrega"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name" className={darkMode ? 'text-gray-300' : ''}>Nome do Método *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Ex: Entrega Rápida"
                required
                className={darkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="icon" className={darkMode ? 'text-gray-300' : ''}>Ícone (Emoji)</Label>
              <Input
                id="icon"
                value={formData.icon}
                onChange={(e) => handleChange("icon", e.target.value)}
                placeholder="Ex: 🚚"
                className={darkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description" className={darkMode ? 'text-gray-300' : ''}>Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Ex: Entrega feita em até 2 horas."
              rows={3}
              className={darkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => handleChange("is_active", checked)}
            />
            <Label htmlFor="is_active" className={darkMode ? 'text-gray-300' : ''}>Ativo na loja</Label>
          </div>

          <div className={`flex justify-end gap-3 pt-4 ${darkMode ? 'border-t border-gray-700' : 'border-t'}`}>
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              <Save className="w-4 h-4 mr-2" />
              {method ? "Atualizar" : "Criar Método"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
