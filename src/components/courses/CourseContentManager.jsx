import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, GripVertical } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CourseModule } from '@/api/entities';
import { CourseLesson } from '@/api/entities';
import ModuleForm from './ModuleForm';
import LessonForm from './LessonForm';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function CourseContentManager({ courseId, initialModules, initialLessons, onContentUpdate, darkMode }) {
  const [modules, setModules] = useState(initialModules);
  const [lessons, setLessons] = useState(initialLessons);
  
  const [isModuleFormOpen, setIsModuleFormOpen] = useState(false);
  const [editingModule, setEditingModule] = useState(null);

  const [isLessonFormOpen, setIsLessonFormOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [currentModuleId, setCurrentModuleId] = useState(null);

  // Estados para modais de confirmação
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, type: '', item: null });

  const handleAddModule = () => {
    setEditingModule(null);
    setIsModuleFormOpen(true);
  };
  
  const handleEditModule = (module) => {
    setEditingModule(module);
    setIsModuleFormOpen(true);
  };
  
  const handleDeleteModule = (module) => {
    setDeleteConfirm({
      isOpen: true,
      type: 'module',
      item: module
    });
  };

  const confirmDeleteModule = async () => {
    const moduleToDelete = deleteConfirm.item;
    setDeleteConfirm({ isOpen: false, type: '', item: null });
    
    try {
      // Excluir aulas do módulo primeiro (importante para integridade)
      const lessonsInModule = lessons.filter(l => l.module_id === moduleToDelete.id);
      for (const lesson of lessonsInModule) {
        await CourseLesson.delete(lesson.id);
      }
      await CourseModule.delete(moduleToDelete.id);
      toast.success("Módulo excluído com sucesso!");
      onContentUpdate(); // Atualiza a lista na página principal
    } catch (error) {
      toast.error("Erro ao excluir módulo.");
    }
  };

  const handleModuleFormSubmit = async (data, keepOpen = false) => {
    try {
      let savedModule;
      if (editingModule) {
        savedModule = await CourseModule.update(editingModule.id, data);
        toast.success("Módulo atualizado!");
      } else {
        savedModule = await CourseModule.create({ ...data, course_id: courseId });
        toast.success("Módulo criado!");
      }
      
      if (!keepOpen) {
          setIsModuleFormOpen(false);
      }
      onContentUpdate();
      return savedModule; // Retorna o módulo salvo para ser usado na importação
    } catch (error) {
      toast.error("Erro ao salvar módulo.");
      return null;
    }
  };

  const handleAddLesson = (moduleId) => {
    setCurrentModuleId(moduleId);
    setEditingLesson(null);
    setIsLessonFormOpen(true);
  };
  
  const handleEditLesson = (lesson) => {
    setCurrentModuleId(lesson.module_id);
    setEditingLesson(lesson);
    setIsLessonFormOpen(true);
  };

  const handleDeleteLesson = (lesson) => {
    setDeleteConfirm({
      isOpen: true,
      type: 'lesson',
      item: lesson
    });
  };

  const confirmDeleteLesson = async () => {
    const lessonToDelete = deleteConfirm.item;
    setDeleteConfirm({ isOpen: false, type: '', item: null });
    
    try {
      await CourseLesson.delete(lessonToDelete.id);
      toast.success("Aula excluída!");
      onContentUpdate();
    } catch (error) {
      toast.error("Erro ao excluir aula.");
    }
  };
  
  const handleLessonFormSubmit = async (data) => {
     try {
      if (editingLesson) {
        await CourseLesson.update(editingLesson.id, data);
        toast.success("Aula atualizada!");
      } else {
        await CourseLesson.create({ ...data, course_id: courseId, module_id: currentModuleId });
        toast.success("Aula criada!");
      }
      setIsLessonFormOpen(false);
      onContentUpdate();
    } catch (error) {
      toast.error("Erro ao salvar aula.");
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm({ isOpen: false, type: '', item: null });
  };

  return (
    <>
      <div className="space-y-6">
        <Card className={darkMode ? 'bg-gray-800' : ''}>
          <CardHeader className="flex flex-row items-center justify-between">
              <div>
                  <CardTitle className={darkMode ? 'text-white' : ''}>Conteúdo do Curso</CardTitle>
                  <CardDescription className={darkMode ? 'text-gray-400' : ''}>Organize os módulos e aulas do seu curso.</CardDescription>
              </div>
            <Button onClick={handleAddModule} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" /> Adicionar Módulo
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
              {initialModules.length === 0 && <p className={`text-center py-4 ${darkMode ? 'text-gray-500' : 'text-slate-500'}`}>Nenhum módulo criado ainda.</p>}
              {initialModules.map(module => (
                  <div key={module.id} className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-slate-100'}`}>
                      <div className="flex items-center justify-between">
                          <h3 className={`font-semibold text-lg ${darkMode ? 'text-white' : ''}`}>{module.title}</h3>
                          <div className="space-x-2">
                              <Button variant="outline" size="sm" onClick={() => handleEditModule(module)}>Editar Módulo</Button>
                              <Button variant="destructive" size="sm" onClick={() => handleDeleteModule(module)}>Excluir</Button>
                          </div>
                      </div>
                      <div className="pl-4 mt-4 space-y-2">
                         {initialLessons.filter(l => l.module_id === module.id).map(lesson => (
                             <div key={lesson.id} className={`flex items-center justify-between p-2 rounded ${darkMode ? 'bg-gray-600' : 'bg-white'}`}>
                                 <p className={darkMode ? 'text-gray-200' : ''}>{lesson.title}</p>
                                 <div className="space-x-2">
                                      <Button variant="ghost" size="sm" onClick={() => handleEditLesson(lesson)} className={darkMode ? 'text-gray-300 hover:text-white' : ''}>Editar Aula</Button>
                                      <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-400" onClick={() => handleDeleteLesson(lesson)}>Excluir</Button>
                                 </div>
                             </div>
                         ))}
                          <Button variant="secondary" className="w-full" onClick={() => handleAddLesson(module.id)}>
                              <Plus className="w-4 h-4 mr-2" /> Adicionar Aula
                          </Button>
                      </div>
                  </div>
              ))}
          </CardContent>
        </Card>
        
        {isModuleFormOpen && (
          <ModuleForm
            isOpen={isModuleFormOpen}
            onClose={() => setIsModuleFormOpen(false)}
            onSubmit={handleModuleFormSubmit}
            initialData={editingModule}
            onContentUpdate={onContentUpdate}
            courseId={courseId}
            darkMode={darkMode}
          />
        )}

        {isLessonFormOpen && (
          <LessonForm
            isOpen={isLessonFormOpen}
            onClose={() => setIsLessonFormOpen(false)}
            onSubmit={handleLessonFormSubmit}
            initialData={editingLesson}
            darkMode={darkMode}
          />
        )}
      </div>

      {/* Modal de Confirmação Bonito */}
      <AlertDialog open={deleteConfirm.isOpen} onOpenChange={cancelDelete}>
        <AlertDialogContent className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
          <AlertDialogHeader>
            <AlertDialogTitle className={darkMode ? 'text-white' : ''}>
              {deleteConfirm.type === 'module' ? 'Excluir Módulo?' : 'Excluir Aula?'}
            </AlertDialogTitle>
            <AlertDialogDescription className={darkMode ? 'text-gray-400' : ''}>
              {deleteConfirm.type === 'module' 
                ? `Tem certeza que deseja excluir o módulo "${deleteConfirm.item?.title}"? Todas as aulas dentro dele serão perdidas. Esta ação não pode ser desfeita.`
                : `Tem certeza que deseja excluir a aula "${deleteConfirm.item?.title}"? Esta ação não pode ser desfeita.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDelete} className={darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : ''}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={deleteConfirm.type === 'module' ? confirmDeleteModule : confirmDeleteLesson}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Sim, Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}