import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Save, X } from 'lucide-react';

export default function ModuleForm({ module, onSubmit, onCancel }) {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        sort_order: 0
    });

    useEffect(() => {
        if (module) {
            setFormData({
                title: module.title || "",
                description: module.description || "",
                sort_order: module.sort_order || 0
            });
        }
    }, [module]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <>
            <div className="fixed inset-0 bg-black/60 z-40" onClick={onCancel}></div>
            <Card className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-50 shadow-2xl bg-white dark:bg-slate-900">
                <form onSubmit={handleSubmit}>
                    <CardHeader>
                        <CardTitle>{module ? "Editar Módulo" : "Novo Módulo"}</CardTitle>
                        <CardDescription>Organize as aulas em módulos temáticos.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Título do Módulo *</Label>
                            <Input 
                                id="title" 
                                value={formData.title} 
                                onChange={e => handleChange('title', e.target.value)} 
                                placeholder="Ex: Introdução ao Marketing Digital"
                                required 
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Descrição</Label>
                            <Textarea 
                                id="description" 
                                value={formData.description} 
                                onChange={e => handleChange('description', e.target.value)} 
                                placeholder="Descreva o que será abordado neste módulo..."
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="sort_order">Ordem</Label>
                            <Input 
                                id="sort_order" 
                                type="number" 
                                value={formData.sort_order} 
                                onChange={e => handleChange('sort_order', parseInt(e.target.value) || 0)} 
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-3 bg-slate-50 dark:bg-slate-800/50">
                        <Button type="button" variant="outline" onClick={onCancel}>
                            <X className="w-4 h-4 mr-2" />
                            Cancelar
                        </Button>
                        <Button type="submit">
                            <Save className="w-4 h-4 mr-2" />
                            Salvar Módulo
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </>
    );
}