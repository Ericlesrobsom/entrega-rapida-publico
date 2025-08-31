import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Save, X } from "lucide-react";

export default function DeliveryMethodForm({ method, onSubmit, onCancel }) {
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
    <Card className="mb-6 bg-white/90 backdrop-blur-sm border-0 shadow-xl">
      <CardHeader className="pb-4">
        <CardTitle className="text-slate-900">
          {method ? "Editar Método de Entrega" : "Novo Método de Entrega"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Método *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Ex: Entrega Rápida"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="icon">Ícone (Emoji)</Label>
              <Input
                id="icon"
                value={formData.icon}
                onChange={(e) => handleChange("icon", e.target.value)}
                placeholder="Ex: 🚚"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Descreva como funciona este método de entrega."
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => handleChange("is_active", checked)}
            />
            <Label htmlFor="is_active">Método ativo</Label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              <Save className="w-4 h-4 mr-2" />
              {method ? "Atualizar" : "Salvar"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}