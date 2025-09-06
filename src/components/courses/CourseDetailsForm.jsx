import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { UploadFile } from '@/api/integrations';
import { Save, Upload, Loader2, DollarSign, BookOpen, UserCircle, Tag } from 'lucide-react';
import { toast } from 'sonner';

export default function CourseDetailsForm({ course, onSave, isSaving }) {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        full_description: "",
        thumbnail_url: "",
        price: 0,
        original_price: 0,
        instructor_name: "",
        instructor_bio: "",
        instructor_photo: "",
        category: "",
        is_active: true,
        is_featured: false,
        certificate_available: false
    });
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        if (course) {
            setFormData({
                title: course.title || "",
                description: course.description || "",
                full_description: course.full_description || "",
                thumbnail_url: course.thumbnail_url || "",
                price: course.price || 0,
                original_price: course.original_price || 0,
                instructor_name: course.instructor_name || "",
                instructor_bio: course.instructor_bio || "",
                instructor_photo: course.instructor_photo || "",
                category: course.category || "",
                is_active: course.is_active !== undefined ? course.is_active : true,
                is_featured: course.is_featured || false,
                certificate_available: course.certificate_available || false
            });
        }
    }, [course]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        toast.info("Enviando imagem...");
        try {
            const { file_url } = await UploadFile({ file });
            handleChange(e.target.name, file_url);
            toast.success("Imagem enviada com sucesso!");
        } catch (error) {
            console.error("Erro ao enviar imagem:", error);
            toast.error("Falha ao enviar imagem.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <Card className="bg-white/80 backdrop-blur-sm dark:bg-slate-800/80 border-0 shadow-lg">
            <form onSubmit={handleSubmit}>
                <CardHeader>
                    <CardTitle>{course ? "Editar Detalhes do Curso" : "Criar Novo Curso"}</CardTitle>
                    <CardDescription>Preencha as informações principais do seu curso.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    {/* Informações Básicas */}
                    <div className="space-y-4 p-4 border rounded-lg dark:border-slate-700">
                        <h3 className="font-semibold text-lg flex items-center gap-2"><BookOpen className="w-5 h-5 text-blue-500"/>Informações Básicas</h3>
                        <div className="space-y-2">
                            <Label htmlFor="title">Título do Curso *</Label>
                            <Input id="title" value={formData.title} onChange={(e) => handleChange('title', e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Descrição Curta (para cards)</Label>
                            <Textarea id="description" value={formData.description} onChange={(e) => handleChange('description', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="full_description">Descrição Completa</Label>
                            <Textarea id="full_description" value={formData.full_description} onChange={(e) => handleChange('full_description', e.target.value)} rows={5} />
                        </div>
                         <div className="space-y-2">
                            <Label>Imagem de Capa (Thumbnail)</Label>
                            <div className="flex items-center gap-4">
                                {formData.thumbnail_url && <img src={formData.thumbnail_url} alt="Thumbnail" className="w-32 h-20 object-cover rounded-md" />}
                                <Input id="thumbnail_url_upload" name="thumbnail_url" type="file" accept="image/*" onChange={handleFileChange} className="hidden" disabled={isUploading}/>
                                <Button asChild variant="outline" disabled={isUploading}>
                                    <Label htmlFor="thumbnail_url_upload" className="cursor-pointer">
                                        {isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <Upload className="w-4 h-4 mr-2" />}
                                        {isUploading ? "Enviando..." : "Trocar Imagem"}
                                    </Label>
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Preços */}
                    <div className="space-y-4 p-4 border rounded-lg dark:border-slate-700">
                         <h3 className="font-semibold text-lg flex items-center gap-2"><DollarSign className="w-5 h-5 text-green-500"/>Preços</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="price">Preço de Venda *</Label>
                                <Input id="price" type="number" value={formData.price} onChange={(e) => handleChange('price', parseFloat(e.target.value))} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="original_price">Preço Original (de/por)</Label>
                                <Input id="original_price" type="number" value={formData.original_price} onChange={(e) => handleChange('original_price', parseFloat(e.target.value))} />
                            </div>
                        </div>
                    </div>

                     {/* Detalhes Adicionais */}
                    <div className="space-y-4 p-4 border rounded-lg dark:border-slate-700">
                        <h3 className="font-semibold text-lg flex items-center gap-2"><Tag className="w-5 h-5 text-orange-500"/>Detalhes Adicionais</h3>
                        <div className="space-y-2">
                            <Label htmlFor="category">Categoria</Label>
                            <Input id="category" value={formData.category} onChange={(e) => handleChange('category', e.target.value)} placeholder="Ex: Marketing Digital" />
                        </div>
                        <div className="flex items-center space-x-4 pt-2">
                            <div className="flex items-center space-x-2">
                                <Switch id="is_active" checked={formData.is_active} onCheckedChange={(checked) => handleChange('is_active', checked)} />
                                <Label htmlFor="is_active">Curso Ativo</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Switch id="is_featured" checked={formData.is_featured} onCheckedChange={(checked) => handleChange('is_featured', checked)} />
                                <Label htmlFor="is_featured">Curso em Destaque</Label>
                            </div>
                             <div className="flex items-center space-x-2">
                                <Switch id="certificate_available" checked={formData.certificate_available} onCheckedChange={(checked) => handleChange('certificate_available', checked)} />
                                <Label htmlFor="certificate_available">Oferece Certificado</Label>
                            </div>
                        </div>
                    </div>
                    
                </CardContent>
                <CardFooter>
                    <Button type="submit" disabled={isSaving || isUploading}>
                        <Save className="w-4 h-4 mr-2" />
                        {isSaving ? "Salvando..." : "Salvar Detalhes"}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}