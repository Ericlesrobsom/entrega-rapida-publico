import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Save, X } from 'lucide-react';

export default function LessonForm({ lesson, onSubmit, onCancel }) {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        google_drive_video_id: "",
        duration_minutes: 0,
        is_preview: false,
    });

    useEffect(() => {
        if (lesson) {
            setFormData({
                title: lesson.title || "",
                description: lesson.description || "",
                google_drive_video_id: lesson.google_drive_video_id || "",
                duration_minutes: lesson.duration_minutes || 0,
                is_preview: lesson.is_preview || false,
            });
        }
    }, [lesson]);

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
            <Card className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl z-50 shadow-2xl bg-white dark:bg-slate-900">
                <form onSubmit={handleSubmit}>
                    <CardHeader>
                        <CardTitle>{lesson ? "Editar Aula" : "Nova Aula"}</CardTitle>
                        <CardDescription>Preencha os detalhes da aula.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 max-h-[70vh] overflow-y-auto p-6">
                        <div className="space-y-2">
                            <Label htmlFor="title">Título da Aula *</Label>
                            <Input id="title" value={formData.title} onChange={e => handleChange('title', e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Descrição</Label>
                            <Textarea id="description" value={formData.description} onChange={e => handleChange('description', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="google_drive_video_id">ID do Vídeo (da sua API)</Label>
                            <Input 
                                id="google_drive_video_id" 
                                value={formData.google_drive_video_id} 
                                onChange={e => handleChange('google_drive_video_id', e.target.value)}
                                placeholder="Cole aqui o ID do vídeo fornecido pela sua API"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="duration_minutes">Duração (minutos)</Label>
                                <Input id="duration_minutes" type="number" value={formData.duration_minutes} onChange={e => handleChange('duration_minutes', parseInt(e.target.value) || 0)} />
                            </div>
                            <div className="flex items-center space-x-2 pt-6">
                                <Switch id="is_preview" checked={formData.is_preview} onCheckedChange={checked => handleChange('is_preview', checked)} />
                                <Label htmlFor="is_preview">Aula Gratuita (Preview)</Label>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-3 bg-slate-50 dark:bg-slate-800/50 py-4">
                        <Button type="button" variant="outline" onClick={onCancel}>
                            <X className="w-4 h-4 mr-2" /> Cancelar
                        </Button>
                        <Button type="submit">
                            <Save className="w-4 h-4 mr-2" /> Salvar Aula
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </>
    );
}