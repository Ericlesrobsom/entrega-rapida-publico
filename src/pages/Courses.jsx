
import React, { useState, useEffect, useCallback } from "react";
import { Course } from "@/api/entities";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Plus, Search, PlayCircle, Users, Clock, Edit, Trash2, ToggleRight, ToggleLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Toaster, toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// CoursesList component defined here to make the file self-contained and fully functional.
// In a real-world application, this would typically be in its own file (e.g., ../components/courses/CoursesList.jsx).
const CoursesList = ({ courses, loading, onEdit, onDelete, onToggleStatus, darkMode }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {loading ? (
        // Loading skeleton
        Array(6).fill(0).map((_, i) => (
          <Card key={i} className={`${darkMode ? 'bg-gray-800/80' : 'bg-white/80'} backdrop-blur-sm border-0 shadow-lg`}>
            <div className={`${darkMode ? 'bg-gray-700' : 'bg-slate-200'} h-48 animate-pulse rounded-t-lg`} />
            <CardHeader>
              <div className={`${darkMode ? 'bg-gray-700' : 'bg-slate-200'} h-6 animate-pulse rounded`} />
              <div className={`${darkMode ? 'bg-gray-700' : 'bg-slate-200'} h-4 animate-pulse rounded w-3/4`} />
            </CardHeader>
          </Card>
        ))
      ) : courses.length === 0 ? (
        <div className="col-span-full text-center py-12">
          <PlayCircle className={`w-16 h-16 mx-auto mb-4 ${darkMode ? 'text-gray-500' : 'text-slate-400'}`} />
          <h3 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            Nenhum curso criado ainda
          </h3>
          <p className={`${darkMode ? 'text-gray-400' : 'text-slate-600'} mb-4`}>
            Comece criando seu primeiro curso em vídeo
          </p>
          <Button onClick={() => onEdit()}
            className="bg-blue-600 hover:bg-blue-700 shadow-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Criar Primeiro Curso
          </Button>
        </div>
      ) : (
        courses.map((course) => (
          <Card key={course.id} className={`${darkMode ? 'bg-gray-800/80 text-gray-200' : 'bg-white/80'} backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 group`}>
            <div
              className="relative"
            >
              <img
                src={course.thumbnail_url || 'https://via.placeholder.com/400x225?text=Curso'}
                alt={course.title}
                className="w-full h-48 object-cover rounded-t-lg"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-all duration-300 rounded-t-lg flex items-center justify-center">
                <PlayCircle className="w-12 h-12 text-white opacity-80 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="absolute top-3 right-3 flex gap-2">
                {course.is_featured && (
                  <Badge className="bg-yellow-500 text-white">Destaque</Badge>
                )}
                <Badge variant={course.is_active ? "default" : "secondary"}>
                  {course.is_active ? "Ativo" : "Inativo"}
                </Badge>
              </div>
              <div className="absolute bottom-3 right-3 flex gap-2">
                <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onToggleStatus(course); }} className={`${darkMode ? 'text-gray-200 hover:bg-gray-700/50' : 'text-slate-700 hover:bg-slate-200/50'}`}>
                  {course.is_active ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                </Button>
                <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onEdit(course.id); }} className={`${darkMode ? 'text-gray-200 hover:bg-gray-700/50' : 'text-slate-700 hover:bg-slate-200/50'}`}>
                  <Edit className="w-5 h-5" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()} className={`${darkMode ? 'text-red-400 hover:bg-gray-700/50' : 'text-red-500 hover:bg-red-100/50'}`}>
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className={`${darkMode ? 'bg-gray-800 text-gray-200 border-gray-700' : ''}`}>
                    <AlertDialogHeader>
                      <AlertDialogTitle className={`${darkMode ? 'text-white' : ''}`}>Tem certeza?</AlertDialogTitle>
                      <AlertDialogDescription className={`${darkMode ? 'text-gray-400' : ''}`}>
                        Esta ação não pode ser desfeita. Isso excluirá permanentemente o curso &quot;{course.title}&quot;
                        e removerá seus dados de nossos servidores.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className={`${darkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : ''}`}>Cancelar</AlertDialogCancel>
                      <AlertDialogAction className={`${darkMode ? 'bg-red-600 text-white hover:bg-red-700' : ''}`} onClick={() => onDelete(course)}>
                        Excluir
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>

            <CardHeader className="pb-3 cursor-pointer" onClick={() => onEdit(course.id)}>
              <CardTitle className={`text-lg line-clamp-2 ${darkMode ? 'group-hover:text-blue-400' : 'group-hover:text-blue-600'} transition-colors`}>
                {course.title}
              </CardTitle>
              <p className={`text-sm line-clamp-2 ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>{course.description}</p>
            </CardHeader>

            <CardContent className="pt-0">
              <div className={`flex items-center justify-between text-sm mb-3 ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{course.instructor_name || "Sem instrutor"}</span>
                </div>
                {course.duration_hours && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{course.duration_hours}h</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Badge variant="outline" className={`text-xs ${darkMode ? 'border-gray-600 text-gray-300' : ''}`}>
                    {course.difficulty_level || "iniciante"}
                  </Badge>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                    R$ {course.price?.toFixed(2).replace('.', ',') || "0,00"}
                  </p>
                  {course.original_price && course.original_price > course.price && (
                    <p className={`text-sm line-through ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>
                      R$ {course.original_price.toFixed(2).replace('.', ',')}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();

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

  const loadCourses = useCallback(async () => {
    setLoading(true);
    try {
      const data = await Course.list('-created_date');
      setCourses(data);
    } catch (error) {
      console.error("Erro ao carregar cursos:", error);
      toast.error("Erro ao carregar cursos.");
    } finally {
      setLoading(false);
    }
  }, []);

  const checkAdminAccess = useCallback(async () => {
    try {
      const user = await User.me();
      if (user.role !== 'admin') {
        navigate(createPageUrl("Store"));
        return;
      }
      await loadCourses();
    } catch (error) {
      // If user.me() fails, it likely means not authenticated, so redirect to login
      await User.loginWithRedirect(window.location.href);
    } finally {
      setCheckingAuth(false);
    }
  }, [navigate, loadCourses]);

  useEffect(() => {
    checkAdminAccess();
  }, [checkAdminAccess]);

  const handleEdit = useCallback((courseId) => {
    if (courseId) {
      navigate(createPageUrl(`CourseEditor?id=${courseId}`));
    } else {
      navigate(createPageUrl("CourseEditor"));
    }
  }, [navigate]);

  const handleToggleStatus = useCallback(async (course) => {
    try {
      const updatedCourse = await Course.update(course.id, { is_active: !course.is_active });
      setCourses(prevCourses =>
        prevCourses.map(c => (c.id === updatedCourse.id ? updatedCourse : c))
      );
      toast.success(`Curso "${updatedCourse.title}" ${updatedCourse.is_active ? "ativado" : "desativado"} com sucesso.`);
    } catch (error) {
      console.error("Erro ao alterar status do curso:", error);
      toast.error("Erro ao alterar status do curso.");
    }
  }, []);

  const handleDelete = useCallback(async (course) => {
    try {
      await Course.delete(course.id);
      setCourses(prevCourses => prevCourses.filter(c => c.id !== course.id));
      toast.success(`Curso "${course.title}" excluído com sucesso.`);
    } catch (error) {
      console.error("Erro ao excluir curso:", error);
      toast.error("Erro ao excluir curso.");
    }
  }, []);

  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <Toaster richColors position="top-right" />
      <div className={`p-6 space-y-6 min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-slate-50 to-blue-50'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Gerenciador de Cursos</h1>
              <p className={`${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>Crie e edite seus cursos online</p>
            </div>
            <Button
              onClick={() => navigate(createPageUrl("CourseEditor"))}
              className="bg-blue-600 hover:bg-blue-700 shadow-lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Novo Curso
            </Button>
          </div>

          <CoursesList
            courses={courses}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleStatus={handleToggleStatus}
            darkMode={darkMode}
          />
        </div>
      </div>
    </>
  );
}
