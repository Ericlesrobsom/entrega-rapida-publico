import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Save, X, PlusCircle } from "lucide-react";

export default function PaymentMethodForm({ method, onSubmit, onCancel, isSaving }) {
  const [formData, setFormData] = useState({
    name: "",
    instructions: "",
    icon: "",
    is_active: true,
  });

  useEffect(() => {
    if (method) {
      setFormData({
        name: method.name || "",
        instructions: method.instructions || "",
        icon: method.icon || "",
        is_active: method.is_active !== undefined ? method.is_active : true,
      });
    } else {
      setFormData({ name: "", instructions: "", icon: "", is_active: true });
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
      <CardHeader>
        <div className="flex items-center gap-3">
            <PlusCircle className="w-6 h-6 text-slate-600" />
            <div>
                <CardTitle className="text-slate-900">
                    {method ? "Editar Forma de Pagamento" : "Nova Forma de Pagamento"}
                </CardTitle>
                <CardDescription>Adicione opções como Pix, Dinheiro, Cartão na Entrega, etc.</CardDescription>
            </div>
        </div>
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
                placeholder="Ex: Pix"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="icon">Ícone (Emoji)</Label>
              <Input
                id="icon"
                value={formData.icon}
                onChange={(e) => handleChange("icon", e.target.value)}
                placeholder="Ex: 💰"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="instructions">Instruções para o Cliente</Label>
            <Textarea
              id="instructions"
              value={formData.instructions}
              onChange={(e) => handleChange("instructions", e.target.value)}
              placeholder="Ex: Chave Pix Celular: (11) 99999-9999. Envie o comprovante no WhatsApp."
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => handleChange("is_active", checked)}
            />
            <Label htmlFor="is_active">Ativo na loja</Label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isSaving}>
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Salvando..." : (method ? "Atualizar" : "Salvar")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}