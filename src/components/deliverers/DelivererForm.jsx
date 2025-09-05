
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, X } from "lucide-react";

export default function DelivererForm({ deliverer, onSubmit, onCancel, darkMode }) {
  const [formData, setFormData] = useState({
    name: deliverer?.name || "",
    phone: deliverer?.phone || "",
    email: deliverer?.email || "",
    vehicle_type: deliverer?.vehicle_type || "",
    status: deliverer?.status || "disponivel",
    current_location: deliverer?.current_location || "",
    rating: deliverer?.rating || ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      rating: formData.rating ? parseFloat(formData.rating) : null
    });
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className={`mb-6 border-0 shadow-xl ${darkMode ? 'bg-gray-800' : 'bg-white/90 backdrop-blur-sm'}`}>
      <CardHeader className="pb-4">
        <CardTitle className={darkMode ? 'text-white' : 'text-slate-900'}>
          {deliverer ? "Editar Entregador" : "Novo Entregador"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name" className={darkMode ? 'text-gray-300' : ''}>Nome Completo *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Digite o nome completo"
                required
                className={darkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className={darkMode ? 'text-gray-300' : ''}>Telefone *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="(11) 99999-9999"
                required
                className={darkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className={darkMode ? 'text-gray-300' : ''}>Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="email@exemplo.com"
                className={darkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vehicle_type" className={darkMode ? 'text-gray-300' : ''}>Tipo de Veículo *</Label>
              <Select value={formData.vehicle_type} onValueChange={(value) => handleChange("vehicle_type", value)}>
                <SelectTrigger className={darkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}>
                  <SelectValue placeholder="Selecione o veículo" />
                </SelectTrigger>
                <SelectContent className={darkMode ? 'bg-gray-800 border-gray-700 text-white' : ''}>
                  <SelectItem value="moto">Moto</SelectItem>
                  <SelectItem value="carro">Carro</SelectItem>
                  <SelectItem value="bicicleta">Bicicleta</SelectItem>
                  <SelectItem value="pe">A Pé</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status" className={darkMode ? 'text-gray-300' : ''}>Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleChange("status", value)}>
                <SelectTrigger className={darkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className={darkMode ? 'bg-gray-800 border-gray-700 text-white' : ''}>
                  <SelectItem value="disponivel">Disponível</SelectItem>
                  <SelectItem value="ocupado">Ocupado</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rating" className={darkMode ? 'text-gray-300' : ''}>Avaliação (0-5)</Label>
              <Input
                id="rating"
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={formData.rating}
                onChange={(e) => handleChange("rating", e.target.value)}
                placeholder="4.5"
                className={darkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="current_location" className={darkMode ? 'text-gray-300' : ''}>Localização Atual</Label>
              <Input
                id="current_location"
                value={formData.current_location}
                onChange={(e) => handleChange("current_location", e.target.value)}
                placeholder="Bairro ou região atual"
                className={darkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}
              />
            </div>
          </div>

          <div className={`flex justify-end gap-3 pt-4 ${darkMode ? 'border-t border-gray-700' : 'border-t'}`}>
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              <Save className="w-4 h-4 mr-2" />
              {deliverer ? "Atualizar" : "Salvar"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
