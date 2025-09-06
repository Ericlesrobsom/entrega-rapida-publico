
import React, { useState, useEffect, useCallback } from 'react';
import { CourseModule } from '@/api/entities';
import { CourseLesson } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Plus, GripVertical, Trash2, Edit, FolderOpen } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { toast } from 'sonner';

import ModuleForm from './ModuleForm';
import LessonForm from './LessonForm';
import FolderNavigator from './FolderNavigator';

export default function CourseContentManager({ courseId, courseRootFolderId, courseRootFolderName }) {
    const [modules, setModules] = useState([]);
    const [lessonsByModule, setLessonsByModule] = useState({});
    const [loading, setLoading] = useState(true);
    
    // Estados para os modais de formulário
    const [showModuleForm, setShowModuleForm] = useState(false);
    const [editingModule, setEditingModule] = useState(null);
    const [showLessonForm, setShowLessonForm] = useState(false);
    const [editingLesson, setEditingLesson] = useState(null);
    const [currentModuleId, setCurrentModuleId] = useState(null);
    const [showFolderNavigator, setShowFolderNavigator] = useState(false);

    const loadContent = useCallback(async () => {
        setLoading(true);
        try {
            if (courseId) {
                const allModules = await CourseModule.filter({ course_id: courseId }, 'sort_order');
                const allLessons = await CourseLesson.filter({ course_id: courseId }, 'sort_order');
                
                setModules(allModules);
                
                const lessonsGrouped = allLessons.reduce((acc, lesson) => {
                    const moduleId = lesson.module_id;
                    if (!acc[moduleId]) {
                        acc[moduleId] = [];
                    }
                    acc[moduleId].push(lesson);
                    return acc;
                }, {});
                
                setLessonsByModule(lessonsGrouped);
            } else {
                setModules([]);
                setLessonsByModule({});
            }

        } catch (error) {
            console.error("Erro ao carregar conteúdo:", error);
            toast.error("Falha ao carregar o conteúdo do curso.");
        } finally {
            setLoading(false);
        }
    }, [courseId]);

    useEffect(() => {
        loadContent();
    }, [loadContent]);

    // Funções de CRUD para Módulos
    const handleModuleSubmit = async (data) => {
        try {
            if (editingModule) {
                await CourseModule.update(editingModule.id, data);
                toast.success("Módulo atualizado!");
            } else {
                await CourseModule.create({ ...data, course_id: courseId });
                toast.success("Módulo criado!");
            }
            setShowModuleForm(false);
            setEditingModule(null);
            loadContent();
        } catch (error) {
            console.error("Erro ao salvar módulo:", error);
            toast.error("Erro ao salvar módulo.");
        }
    };
    
    const handleDeleteModule = async (moduleId) => {
        if(window.confirm("Tem certeza que quer excluir este módulo e todas as suas aulas?")) {
            try {
                // Excluir todas as aulas do módulo primeiro
                const lessonsToDelete = lessonsByModule[moduleId] || [];
                for (const lesson of lessonsToDelete) {
                    await CourseLesson.delete(lesson.id);
                }
                // Excluir o módulo
                await CourseModule.delete(moduleId);
                toast.success("Módulo excluído com sucesso!");
                loadContent();
            } catch (error) {
                toast.error("Erro ao excluir módulo.");
            }
        }
    };

    // Funções de CRUD para Aulas
    const handleLessonSubmit = async (data) => {
        try {
            if (editingLesson) {
                await CourseLesson.update(editingLesson.id, data);
                toast.success("Aula atualizada!");
            } else {
                await CourseLesson.create({ 
                    ...data, 
                    course_id: courseId,
                    module_id: currentModuleId 
                });
                toast.success("Aula criada!");
            }
            setShowLessonForm(false);
            setEditingLesson(null);
            setCurrentModuleId(null);
            loadContent();
        } catch (error) {
            console.error("Erro ao salvar aula:", error);
            toast.error("Erro ao salvar aula: " + (error.message || "Erro desconhecido"));
        }
    };

    const handleDeleteLesson = async (lessonId) => {
        if(window.confirm("Tem certeza que quer excluir esta aula?")) {
            try {
                await CourseLesson.delete(lessonId);
                toast.success("Aula excluída!");
                loadContent();
            } catch (error) {
                toast.error("Erro ao excluir aula.");
            }
        }
    };
    
    const onDragEnd = async (result) => {
        const { destination, source, type } = result;

        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;
        
        // Lógica para reordenar módulos
        if (type === 'module') {
            const newModules = Array.from(modules);
            const [reorderedItem] = newModules.splice(source.index, 1);
            newModules.splice(destination.index, 0, reorderedItem);
            
            setModules(newModules);

            // Atualizar a ordem no banco
            const updatePromises = newModules.map((module, index) => 
                CourseModule.update(module.id, { sort_order: index })
            );
            await Promise.all(updatePromises);
            toast.success("Ordem dos módulos atualizada.");
            return;
        }

        // Lógica para reordenar aulas dentro do mesmo módulo
        if (type === 'lesson' && source.droppableId === destination.droppableId) {
            const moduleId = source.droppableId;
            const newLessons = Array.from(lessonsByModule[moduleId]);
            const [reorderedItem] = newLessons.splice(source.index, 1);
            newLessons.splice(destination.index, 0, reorderedItem);

            setLessonsByModule(prev => ({ ...prev, [moduleId]: newLessons }));

            const updatePromises = newLessons.map((lesson, index) =>
                CourseLesson.update(lesson.id, { sort_order: index })
            );
            await Promise.all(updatePromises);
            toast.success("Ordem das aulas atualizada.");
        }
    };

    return (
        <div>
            {showModuleForm && (
                <ModuleForm
                    module={editingModule}
                    onSubmit={handleModuleSubmit}
                    onCancel={() => {
                        setShowModuleForm(false);
                        setEditingModule(null);
                    }}
                />
            )}

            {showLessonForm && (
                <LessonForm
                    lesson={editingLesson}
                    onSubmit={handleLessonSubmit}
                    onCancel={() => {
                        setShowLessonForm(false);
                        setEditingLesson(null);
                        setCurrentModuleId(null);
                    }}
                    moduleId={currentModuleId}
                    courseRootFolderId={courseRootFolderId}
                    courseRootFolderName={courseRootFolderName}
                />
            )}

            {showFolderNavigator && (
                <FolderNavigator
                    courseId={courseId}
                    onImportComplete={() => {
                        setShowFolderNavigator(false);
                        loadContent(); // Recarregar o conteúdo após importação
                    }}
                    onCancel={() => setShowFolderNavigator(false)}
                />
            )}

            <div className="flex justify-end mb-6 gap-3">
                <Button 
                    variant="outline"
                    onClick={() => setShowFolderNavigator(true)}
                    className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                >
                    <FolderOpen className="w-4 h-4 mr-2" /> 
                    Importar da API
                </Button>
                <Button onClick={() => { setEditingModule(null); setShowModuleForm(true); }}>
                    <Plus className="w-4 h-4 mr-2" /> Novo Módulo
                </Button>
            </div>

            {loading ? (
                <p>Carregando...</p>
            ) : (
                <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="all-modules" direction="vertical" type="module">
                        {(provided) => (
                            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-6">
                                {modules.map((module, index) => (
                                    <Draggable key={module.id} draggableId={module.id} index={index}>
                                        {(provided) => (
                                            <div ref={provided.innerRef} {...provided.draggableProps} className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <span {...provided.dragHandleProps} className="cursor-grab text-slate-400"><GripVertical /></span>
                                                        <h2 className="text-xl font-bold">{module.title}</h2>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Button variant="outline" size="sm" onClick={() => { setEditingModule(module); setShowModuleForm(true); }}>
                                                            <Edit className="w-4 h-4 mr-2"/> Editar Módulo
                                                        </Button>
                                                        <Button variant="destructive" size="sm" onClick={() => handleDeleteModule(module.id)}>
                                                            <Trash2 className="w-4 h-4 mr-2"/> Excluir Módulo
                                                        </Button>
                                                    </div>
                                                </div>

                                                <Droppable droppableId={module.id} type="lesson">
                                                    {(provided) => (
                                                        <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2 ml-8">
                                                            {(lessonsByModule[module.id] || []).map((lesson, index) => (
                                                                <Draggable key={lesson.id} draggableId={lesson.id} index={index}>
                                                                    {(provided) => (
                                                                        <div ref={provided.innerRef} {...provided.draggableProps} className="flex items-center justify-between bg-slate-50 dark:bg-slate-700 p-3 rounded-md">
                                                                            <div className="flex items-center gap-3">
                                                                                <span {...provided.dragHandleProps} className="cursor-grab text-slate-400"><GripVertical /></span>
                                                                                <span>{lesson.title}</span>
                                                                            </div>
                                                                            <div className="flex items-center gap-2">
                                                                                <Button variant="ghost" size="icon" onClick={() => { setEditingLesson(lesson); setShowLessonForm(true); setCurrentModuleId(module.id); }}>
                                                                                    <Edit className="w-4 h-4" />
                                                                                </Button>
                                                                                <Button variant="ghost" size="icon" onClick={() => handleDeleteLesson(lesson.id)}>
                                                                                    <Trash2 className="w-4 h-4 text-red-500" />
                                                                                </Button>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </Draggable>
                                                            ))}
                                                            {provided.placeholder}
                                                        </div>
                                                    )}
                                                </Droppable>

                                                <div className="mt-4 ml-8">
                                                    <Button variant="link" size="sm" onClick={() => { setEditingLesson(null); setShowLessonForm(true); setCurrentModuleId(module.id); }}>
                                                        <Plus className="w-4 h-4 mr-2" /> Adicionar Aula
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
            )}
        </div>
    );
}
