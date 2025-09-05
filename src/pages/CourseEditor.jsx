
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Course } from "@/api/entities";
import { CourseModule } from "@/api/entities";
import { CourseLesson } from "@/api/entities";
import { User } from "@/api/entities";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Toaster, toast } from 'sonner';
import { ArrowLeft } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CourseDetailsForm from "../components/courses/CourseDetailsForm";
import CourseContentManager from "../components/courses/CourseContentManager";

export default function CourseEditor() {
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState("details"); // Novo estado para controlar a aba ativa
  const navigate = useNavigate();

  const courseId = new URLSearchParams(window.location.search).get('id');

  // Effect to detect and react to dark mode changes
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setDarkMode(isDark);
    const observer = new MutationObserver(() => {
      setDarkMode(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const loadData = useCallback(async () => {
    if (!courseId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [courseData, modulesData, lessonsData] = await Promise.all([
        Course.filter({ id: courseId }),
        CourseModule.filter({ course_id: courseId }, 'sort_order'),
        CourseLesson.filter({ course_id: courseId }, 'sort_order'),
      ]);
      setCourse(courseData[0] || null);
      setModules(modulesData || []);
      setLessons(lessonsData || []);
    } catch (error) {
      toast.error("Erro ao carregar dados do curso.");
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  const checkAdminAccess = useCallback(async () => {
    try {
      const user = await User.me();
      if (user.role !== 'admin') {
        navigate(createPageUrl("Store"));
        return;
      }
      await loadData();
    } catch (error) {
      await User.loginWithRedirect(window.location.href);
    } finally {
      setCheckingAuth(false);
    }
  }, [navigate, loadData]);

  useEffect(() => {
    checkAdminAccess();
  }, [checkAdminAccess]);

  const handleSaveCourseDetails = async (details) => {
    setIsSaving(true);
    try {
      if (courseId) {
        await Course.update(courseId, details);
        toast.success("Detalhes do curso salvos!");
        loadData();
      } else {
        const newCourse = await Course.create(details);
        toast.success("Curso criado com sucesso!");
        navigate(createPageUrl(`CourseEditor?id=${newCourse.id}`));
      }
    } catch (error) {
      toast.error("Erro ao salvar o curso.");
    } finally {
      setIsSaving(false);
    }
  };

  // Função para recarregar dados mantendo a aba ativa
  const handleContentUpdate = async () => {
    await loadData();
    // Manter na aba de conteúdo após operações
    // This condition means: if we are currently on 'details' tab AND a course ID exists (likely just created), switch to 'content'
    // Otherwise, (if already on 'content' tab), stay there.
    if (activeTab === "details" && courseId) {
      setActiveTab("content");
    }
  };

  if (checkingAuth || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <Toaster richColors position="top-right" />
      <div className={`p-6 min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-slate-50 to-blue-50'}`}>
        <div className="max-w-7xl mx-auto">
          <Button variant="outline" onClick={() => navigate(createPageUrl("Courses"))} className={`mb-4 ${darkMode ? 'text-white border-gray-600 hover:bg-gray-700' : ''}`}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Cursos
          </Button>

          <h1 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            {courseId ? 'Editar Curso' : 'Novo Curso'}
          </h1>
          <p className={`${darkMode ? 'text-gray-400' : 'text-slate-600'} mb-8`}>
            {courseId ? course?.title || 'Carregando...' : 'Preencha os detalhes para criar seu curso.'}
          </p>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className={darkMode ? 'bg-gray-800' : ''}>
              <TabsTrigger value="details" className={darkMode ? 'data-[state=active]:bg-gray-700 data-[state=active]:text-white text-gray-300' : ''}>Detalhes do Curso</TabsTrigger>
              <TabsTrigger value="content" disabled={!courseId} className={darkMode ? 'data-[state=active]:bg-gray-700 data-[state=active]:text-white text-gray-300' : ''}>Conteúdo (Módulos e Aulas)</TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="mt-6">
              <CourseDetailsForm 
                initialData={course}
                onSave={handleSaveCourseDetails}
                isSaving={isSaving}
                darkMode={darkMode}
              />
            </TabsContent>
            <TabsContent value="content" className="mt-6">
              {courseId && (
                 <CourseContentManager
                    courseId={courseId}
                    initialModules={modules}
                    initialLessons={lessons}
                    onContentUpdate={handleContentUpdate}
                    darkMode={darkMode}
                 />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
