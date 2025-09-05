
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { HardDrive, Loader2, FileText } from 'lucide-react'; // Added FileText
import { Textarea } from '@/components/ui/textarea';
import GoogleDriveSelector from './GoogleDriveSelector';
import { googleDrive } from '@/api/functions';
import { CourseModule } from '@/api/entities';
import { CourseLesson } from '@/api/entities';
import { toast } from 'sonner';

export default function ModuleForm({ isOpen, onClose, onSubmit, initialData, onContentUpdate, courseId, darkMode }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isDriveSelectorOpen, setIsDriveSelectorOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        if (initialData) {
            setTitle(initialData.title);
            setDescription(initialData.description || '');
        } else {
            setTitle('');
            setDescription('');
        }
    }, [initialData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await onSubmit({ title, description });
        } catch (error) {
            console.error("Erro ao salvar o módulo:", error);
            toast.error("Erro ao salvar o módulo.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFolderSelect = async (folder) => {
        setIsDriveSelectorOpen(false);
        const loadingToastId = toast.loading("Importando aulas da pasta selecionada...");

        try {
            const response = await googleDrive({ action: 'listVideosInFolder', folderId: folder.id });
            if (response.data?.error) {
                throw new Error(response.data.error);
            }

            const videos = response.data?.videos || [];
            if (videos.length === 0) {
                toast.dismiss(loadingToastId);
                toast.info("Nenhum vídeo encontrado na pasta selecionada.");
                return;
            }

            // If it's a new module and we're importing from drive, submit it first
            let currentModuleId = initialData?.id;
            let moduleTitle = title;
            if (!initialData) {
                const savedModule = await onSubmit({ title, description }, true);
                if (!savedModule) {
                    throw new Error("Não foi possível salvar o módulo antes de importar as aulas.");
                }
                currentModuleId = savedModule.id;
                moduleTitle = savedModule.title;
            } else {
                // If editing, just ensure the module is saved first, though onSubmit already handles saving on initial dialog submit
                // For drive import, we just use the current module's ID
            }


            const lessonsToCreate = videos.map((video, index) => {
                const lessonTitle = video.name.replace(/\.(mp4|mov|avi|wmv|mkv|webm)$/i, '').trim();
                return {
                    course_id: courseId,
                    module_id: currentModuleId, // Use the ID of the current or newly saved module
                    title: lessonTitle,
                    video_url: `https://drive.google.com/file/d/${video.id}/preview`,
                    sort_order: index,
                    is_active: true,
                };
            });

            await CourseLesson.bulkCreate(lessonsToCreate);

            toast.dismiss(loadingToastId);
            toast.success(`${lessonsToCreate.length} aula(s) foram importada(s) com sucesso para o módulo "${moduleTitle}"!`);
            onContentUpdate();
            onClose();
        } catch (err) {
            toast.dismiss(loadingToastId);
            console.error("Erro ao importar aulas:", err);
            toast.error(`Falha ao importar aulas: ${err.message}`);
        }
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setIsProcessing(true);
            
            const reader = new FileReader();
            reader.onload = (e) => {
                const csvText = e.target.result;
                const lines = csvText.split('\n');
                
                if (lines.length < 2) {
                    toast.error("Arquivo CSV deve ter pelo menos um cabeçalho e uma linha de dados.");
                    setIsProcessing(false);
                    return;
                }
                
                // Parse simples do CSV (assumindo que é bem formatado)
                const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
                const data = [];
                
                for (let i = 1; i < lines.length; i++) {
                    if (lines[i].trim()) {
                        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
                        const row = {};
                        headers.forEach((header, index) => {
                            row[header] = values[index] || '';
                        });
                        data.push(row);
                    }
                }
                
                processCsv(data);
                // setIsProcessing(false) is called inside processCsv finally block or after successful processing
            };
            
            reader.onerror = () => {
                toast.error("Erro ao ler o arquivo CSV.");
                setIsProcessing(false);
            };
            
            reader.readAsText(file);
        }
    };

    const processCsv = async (data) => {
        if (!title && !initialData) { // Check if module title exists for a new module
            toast.error("O título do módulo é obrigatório antes de importar aulas via CSV.");
            setIsProcessing(false);
            return;
        }

        const loadingToastId = toast.loading("Importando aulas via CSV...");
        try {
            // If it's a new module and we're importing via CSV, submit it first
            let currentModuleId = initialData?.id;
            let moduleTitle = title;
            if (!initialData) {
                const savedModule = await onSubmit({ title, description }, true);
                if (!savedModule) {
                    throw new Error("Não foi possível salvar o módulo antes de importar as aulas via CSV.");
                }
                currentModuleId = savedModule.id;
                moduleTitle = savedModule.title;
            } else {
                // If editing, just use the current module's ID
            }
            

            const lessonsToCreate = data.map((row, index) => {
                const videoUrl = row.video_url || '';
                let parsedVideoId = '';
                
                const driveIdMatch = videoUrl.match(/[-\w]{25,}/);
                if (driveIdMatch) {
                    parsedVideoId = driveIdMatch[0];
                } else {
                    parsedVideoId = videoUrl;
                }

                const lessonTitle = (row.title || '').replace(/\.(mp4|mov|avi|wmv|mkv|webm)$/i, '').trim();

                return {
                    course_id: courseId,
                    module_id: currentModuleId, // Use the ID of the current or newly saved module
                    title: lessonTitle,
                    description: row.description || '',
                    video_url: parsedVideoId ? `https://drive.google.com/file/d/${parsedVideoId}/preview` : '',
                    duration_minutes: parseInt(row.duration_minutes) || 0,
                    sort_order: index,
                    is_active: true,
                };
            }).filter(lesson => lesson.title && lesson.video_url);

            if (lessonsToCreate.length === 0) {
                toast.dismiss(loadingToastId);
                toast.info("Nenhuma aula válida encontrada no CSV após processamento.");
                return;
            }

            await CourseLesson.bulkCreate(lessonsToCreate);

            toast.dismiss(loadingToastId);
            toast.success(`${lessonsToCreate.length} aula(s) foram importada(s) com sucesso para o módulo "${moduleTitle}" via CSV!`);
            onContentUpdate();
            onClose();
        } catch (err) {
            toast.dismiss(loadingToastId);
            console.error("Erro ao importar aulas via CSV:", err);
            toast.error(`Falha ao importar aulas via CSV: ${err.message}`);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className={darkMode ? "bg-gray-800 border-gray-700 text-white" : ""}>
                    <DialogHeader>
                        <DialogTitle className={darkMode ? "text-white" : ""}>{initialData ? "Editar Módulo" : "Novo Módulo"}</DialogTitle>
                        <DialogDescription className={darkMode ? "text-gray-400" : ""}>
                            Preencha as informações do módulo.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title" className={darkMode ? 'text-gray-300' : ''}>Título do Módulo</Label>
                            <Input
                                id="title"
                                name="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                                placeholder="Ex: Introdução ao Marketing Digital"
                                className={darkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description" className={darkMode ? 'text-gray-300' : ''}>Descrição (opcional)</Label>
                            <Textarea
                                id="description"
                                name="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Uma breve descrição do conteúdo do módulo."
                                className={darkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}
                            />
                        </div>

                        {/* This import section is now always visible */}
                        <div className={`p-4 border rounded-lg ${darkMode ? 'border-gray-600 bg-gray-700/30' : 'border-dashed bg-slate-50'}`}>
                            <Label className={`font-semibold ${darkMode ? 'text-gray-200' : 'text-slate-700'}`}>Importar Aulas em Massa</Label>
                            <p className={`text-sm mt-1 mb-3 ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>
                                Adicione aulas rapidamente importando de uma pasta do Google Drive ou de um arquivo CSV.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-2">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => setIsDriveSelectorOpen(true)}
                                    className="flex-1"
                                >
                                    <HardDrive className="w-4 h-4 mr-2" />
                                    Importar do Google Drive
                                </Button>
                                <div className="relative flex-1">
                                    <Button type="button" variant="secondary" className="w-full" onClick={() => document.getElementById('csv-import').click()}>
                                        <FileText className="w-4 h-4 mr-2" />
                                        Importar via CSV
                                    </Button>
                                    <Input
                                        id="csv-import"
                                        type="file"
                                        accept=".csv"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                </div>
                            </div>
                             {isProcessing && <p className={`text-sm mt-2 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>Processando arquivo...</p>}
                        </div>

                        <DialogFooter className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                            <Button type="submit" disabled={isSubmitting || isProcessing}>
                                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                {initialData ? 'Salvar Alterações' : 'Criar Módulo'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <GoogleDriveSelector
                isOpen={isDriveSelectorOpen}
                onClose={() => setIsDriveSelectorOpen(false)}
                onSelectFolder={handleFolderSelect}
                onSelectVideo={(video) => {
                    toast.info("Para importar um vídeo único, adicione ou edite uma aula diretamente.");
                    setIsDriveSelectorOpen(false);
                }}
            />
        </>
    );
}
