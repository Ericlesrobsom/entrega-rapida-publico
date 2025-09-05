
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch"; // Added Switch import
import { Save, X, Ticket } from "lucide-react";

export default function CouponForm({ coupon, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    code: coupon?.code || "",
    discount_percentage: coupon?.discount_percentage || "",
    max_uses: coupon?.max_uses || "",
    expires_at: coupon?.expires_at || "",
    description: coupon?.description || "",
    is_active: coupon?.is_active ?? true,
  });

  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Initialize form data when coupon prop changes
    setFormData({
      code: coupon?.code || "",
      discount_percentage: coupon?.discount_percentage || "",
      max_uses: coupon?.max_uses || "",
      expires_at: coupon?.expires_at || "",
      description: coupon?.description || "",
      is_active: coupon?.is_active ?? true,
    });
  }, [coupon]);

  useEffect(() => {
    // Detect initial dark mode state
    const isDark = document.documentElement.classList.contains('dark');
    setDarkMode(isDark);

    // Observe changes to the 'class' attribute of the html element
    const observer = new MutationObserver(() => {
      setDarkMode(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    // Cleanup observer on component unmount
    return () => observer.disconnect();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validações
    if (!formData.code.trim()) {
      alert("Por favor, digite o código do cupom.");
      return;
    }
    
    // Ensure discount_percentage is a valid number between 1 and 100
    const discountPercentage = parseInt(formData.discount_percentage, 10);
    if (isNaN(discountPercentage) || discountPercentage < 1 || discountPercentage > 100) {
      alert("O desconto deve ser um número entre 1% e 100%.");
      return;
    }
    
    // Ensure max_uses is a valid number at least 1
    const maxUses = parseInt(formData.max_uses, 10);
    if (isNaN(maxUses) || maxUses < 1) {
      alert("O número máximo de usos deve ser pelo menos 1.");
      return;
    }

    onSubmit({
      ...formData,
      code: formData.code.trim().toUpperCase(), // Sempre em maiúsculo
      discount_percentage: discountPercentage,
      max_uses: maxUses,
    });
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className={`mb-8 shadow-xl border-0 ${darkMode ? 'bg-gray-800/90 text-white' : 'bg-white/90'}`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Ticket className="w-5 h-5" />
          {coupon ? "Editar Cupom" : "Novo Cupom"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="code">Código do Cupom *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => handleChange("code", e.target.value.toUpperCase())}
                required
                className={darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white'}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="discount_percentage">Desconto (%) *</Label>
              <Input
                id="discount_percentage"
                type="number"
                min="1"
                max="100"
                value={formData.discount_percentage}
                onChange={(e) => handleChange("discount_percentage", parseInt(e.target.value, 10))}
                required
                className={darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white'}
              />
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="max_uses">Usos Máximos *</Label>
              <Input
                id="max_uses"
                type="number"
                min="1"
                value={formData.max_uses}
                onChange={(e) => handleChange("max_uses", parseInt(e.target.value, 10))}
                required
                className={darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white'}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expires_at">Data de Expiração (opcional)</Label>
              <Input
                id="expires_at"
                type="date"
                value={formData.expires_at}
                onChange={(e) => handleChange("expires_at", e.target.value)}
                className={darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white'}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição (para seu controle)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              rows={2}
              className={darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white'}
            />
          </div>

          <div className="flex items-center space-x-2 pt-4">
            <Switch 
              id="is_active" 
              checked={formData.is_active} 
              onCheckedChange={(checked) => handleChange('is_active', checked)} 
            />
            <Label htmlFor="is_active">Cupom Ativo</Label>
          </div>

          <div className={`flex justify-end gap-3 pt-4 border-t ${darkMode ? 'border-gray-700' : 'border-slate-200'}`}>
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              <Save className="w-4 h-4 mr-2" />
              {coupon ? "Atualizar Cupom" : "Criar Cupom"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
