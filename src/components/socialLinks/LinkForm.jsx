
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Save, X, Link, Type, Hash, ArrowDownUp } from 'lucide-react'; // Updated Lucide imports

export default function LinkForm({ link, onSubmit, onCancel, darkMode }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: '',
    icon: 'Link', // Default icon value
    category: '',
    sort_order: 0,
    is_active: true,
  });

  useEffect(() => {
    if (link) {
      // If a link object is provided (for editing), populate the form
      setFormData({
        title: link.title || '',
        description: link.description || '',
        url: link.url || '',
        icon: link.icon || 'Link',
        category: link.category || '',
        sort_order: link.sort_order || 0,
        is_active: link.is_active ?? true,
      });
    } else {
      // If no link object is provided (for creating new), reset to defaults
      setFormData({
        title: '',
        description: '',
        url: '',
        icon: 'Link',
        category: '',
        sort_order: 0,
        is_active: true,
      });
    }
  }, [link]); // Re-run effect when the 'link' prop changes

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
        ...formData,
        sort_order: Number(formData.sort_order) // Ensure sort_order is a number
    });
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className={`mb-6 border-0 shadow-xl ${darkMode ? 'bg-gray-800' : 'bg-white/90 backdrop-blur-sm'}`}>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Link className={`w-6 h-6 ${darkMode ? 'text-blue-400' : 'text-slate-600'}`} />
          <div>
            <CardTitle className={darkMode ? 'text-white' : 'text-slate-900'}>
              {link ? 'Editar Link' : 'Novo Link'}
            </CardTitle>
            <CardDescription className={darkMode ? 'text-gray-400' : ''}>
              Configure os detalhes do seu link de divulgação.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title" className={darkMode ? 'text-gray-300' : ''}>Título *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Ex: Grupo VIP WhatsApp"
                required
                className={darkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="url" className={darkMode ? 'text-gray-300' : ''}>URL de Destino *</Label>
              <Input
                id="url"
                type="url"
                value={formData.url}
                onChange={(e) => handleChange('url', e.target.value)}
                placeholder="https://..."
                required
                className={darkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description" className={darkMode ? 'text-gray-300' : ''}>Descrição (opcional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Ex: Entre para receber ofertas exclusivas!"
              rows={2}
              className={darkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}
            />
          </div>

          <div className="grid md:grid-cols-3 gap-6">
             <div className="space-y-2">
              <Label htmlFor="icon" className={darkMode ? 'text-gray-300' : ''}>Ícone (Lucide)</Label>
              <Input
                id="icon"
                value={formData.icon}
                onChange={(e) => handleChange('icon', e.target.value)}
                placeholder="Ex: Send, Instagram"
                className={darkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category" className={darkMode ? 'text-gray-300' : ''}>Categoria</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                placeholder="Ex: Redes Sociais"
                className={darkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sort_order" className={darkMode ? 'text-gray-300' : ''}>Ordem</Label>
              <Input
                id="sort_order"
                type="number"
                value={formData.sort_order}
                onChange={(e) => handleChange('sort_order', Number(e.target.value))}
                className={darkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-4">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => handleChange('is_active', checked)}
            />
            <Label htmlFor="is_active" className={darkMode ? 'text-gray-300' : ''}>Ativo na página pública</Label>
          </div>

          <div className={`flex justify-end gap-3 pt-4 ${darkMode ? 'border-t border-gray-700' : 'border-t'}`}>
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              <Save className="w-4 h-4 mr-2" />
              {link ? 'Atualizar Link' : 'Salvar Link'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
