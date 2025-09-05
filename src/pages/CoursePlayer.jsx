
import React, { useState, useEffect, useCallback } from "react";
import { Course } from "@/api/entities";
import { CourseModule } from "@/api/entities";
import { CourseLesson } from "@/api/entities";
import { CourseAccess } from "@/api/entities";
import { Settings } from "@/api/entities";
import { User } from "@/api/entities";
import { createPageUrl } from "@/utils";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Lock, Loader2, Menu, ChevronLeft, ArrowLeft, Download, CheckCircle, PlayCircle, BookOpen, Sun, Moon, Eye, EyeOff } from "lucide-react";
import { toast, Toaster } from 'sonner';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// UniversalVideoPlayer Component (defined within the same file for simplicity)
const UniversalVideoPlayer = ({ videoUrl, googleDriveId, title, onProgress, onComplete, settings, courseId, setLoadingVideo }) => {
  const [isLoadingVideo, setIsLoadingVideo] = useState(true);

  useEffect(() => {
    setIsLoadingVideo(true); // Reset loading state when video changes
    setLoadingVideo(true); // Propagate loading state up
  }, [videoUrl, googleDriveId, setLoadingVideo]);

  const getGoogleDriveEmbedUrl = (id) => {
    return id ? `https://drive.google.com/file/d/${id}/preview` : null;
  };

  // Prioritize googleDriveId if available, otherwise use videoUrl directly
  const embedUrl = googleDriveId ? getGoogleDriveEmbedUrl(googleDriveId) : videoUrl;

  const handleIframeLoad = () => {
    setIsLoadingVideo(false);
    setLoadingVideo(false); // Propagate loading state up
    // In a real application, you might start listening to video events here
    // if using a sophisticated player API (e.g., YouTube IFrame API)
  };

  // Placeholder functions for video events (Google Drive iframes don't offer direct API for this)
  const handlePlayerProgress = (event) => {
    // This would typically receive progress data (e.g., current time, duration)
    if (onProgress) onProgress(event);
  };

  const handlePlayerComplete = () => {
    // This would be triggered when the video reaches its end
    if (onComplete) onComplete();
  };

  return (
    <div className="aspect-video bg-black rounded-xl shadow-2xl overflow-hidden relative">
      {settings?.store_logo_url && (
        <img 
          src={settings.store_logo_url}
          alt="Logo da Loja"
          className="absolute top-4 right-4 z-20 h-8 md:h-10 w-auto opacity-80"
        />
      )}
      {isLoadingVideo && (
          <div className="w-full h-full flex items-center justify-center text-white">
              <Loader2 className="w-8 h-8 animate-spin" />
          </div>
      )}
      {embedUrl ? (
          <iframe
            key={embedUrl}
            src={embedUrl}
            frameBorder="0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
            title={title || 'Player de Vídeo'}
            onLoad={handleIframeLoad}
            // For actual progress/complete, a more advanced player integration is needed (e.g., YouTube API)
          ></iframe>
      ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-white p-8 text-center">
            <PlayCircle className="w-16 h-16 mb-4 opacity-50"/>
            <h3 className="text-xl font-semibold">Nenhum vídeo disponível</h3>
            <p className="text-gray-300">Selecione uma aula com vídeo ou verifique a URL do vídeo.</p>
          </div>
      )}
    </div>
  );
};


export default function CoursePlayer() {
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [lessons, setLessons] = useState([]); // New state for all lessons flat
  const [currentLesson, setCurrentLesson] = useState(null); // Renamed from activeLesson
  const [access, setAccess] = useState(null); // Renamed from courseAccess
  const [completedLessons, setCompletedLessons] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [loadingVideo, setLoadingVideo] = useState(false);
  const [totalLessonsCount, setTotalLessonsCount] = useState(0);
  const [settings, setSettings] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [showLessonList, setShowLessonList] = useState(true);
  const [error, setError] = useState(null); // New state for error messages
  const navigate = useNavigate();

  const courseId = new URLSearchParams(window.location.search).get('id');

  // Load user preferences on initialization
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('coursePlayer-darkMode');
    if (savedDarkMode) {
      setDarkMode(JSON.parse(savedDarkMode));
    }

    const savedShowLessonList = localStorage.getItem('coursePlayer-showLessonList');
    if (savedShowLessonList) {
      setShowLessonList(JSON.parse(savedShowLessonList));
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('coursePlayer-darkMode', JSON.stringify(newDarkMode));
  };

  const toggleLessonList = () => {
    const newShowLessonList = !showLessonList;
    setShowLessonList(newShowLessonList);
    localStorage.setItem('coursePlayer-showLessonList', JSON.stringify(newShowLessonList));
  };

  // Comprehensive data loading and access checking
  useEffect(() => {
    const loadCourseData = async () => {
      if (!courseId) {
        navigate(createPageUrl("Store"));
        return;
      }
      setLoading(true);
      setError(null); // Clear any previous errors

      try {
        const user = await User.me();
        if (!user) {
          await User.loginWithRedirect(window.location.href);
          return;
        }

        const [courseData, modulesData, lessonsData, accessRecords, settingsData] = await Promise.all([
          Course.filter({ id: courseId }),
          CourseModule.filter({ course_id: courseId }, 'sort_order'),
          CourseLesson.filter({ course_id: courseId }, 'sort_order'),
          CourseAccess.filter({ course_id: courseId, student_email: user.email, is_active: true }),
          Settings.list()
        ]);

        if (!courseData || courseData.length === 0) {
          setError('Curso não encontrado.');
          setHasAccess(false);
          setLoading(false);
          return;
        }

        if (!accessRecords || accessRecords.length === 0) {
          setError('Você não tem acesso a este curso. Verifique se já adquiriu o curso.');
          setHasAccess(false);
          setLoading(false);
          return;
        }

        const courseRecord = courseData[0];
        const accessRecord = accessRecords[0];
        const initialCompletedLessonsSet = new Set(accessRecord.completed_lessons || []);

        setCourse(courseRecord);
        setAccess(accessRecord);
        setCompletedLessons(initialCompletedLessonsSet);
        setHasAccess(true);
        setLessons(lessonsData); // Set flat list of all lessons

        setSettings(settingsData.length > 0 ? settingsData[0] : null); // Keep null if no settings
        setTotalLessonsCount(lessonsData.length);

        const processedModules = modulesData.map(mod => ({
          ...mod,
          lessons: lessonsData
            .filter(lesson => lesson.module_id === mod.id)
            .sort((a, b) => a.sort_order - b.sort_order)
        })).sort((a, b) => a.sort_order - b.sort_order);
        setModules(processedModules);

        let firstLesson = null;
        let nextUnwatchedLesson = null;

        for (const mod of processedModules) {
          if (mod.lessons.length > 0) {
            if (!firstLesson) {
              firstLesson = mod.lessons[0];
            }
            const unwatched = mod.lessons.find(lesson => !initialCompletedLessonsSet.has(lesson.id));
            if (unwatched) {
              nextUnwatchedLesson = unwatched;
              break;
            }
          }
        }
        
        const newCurrentLesson = nextUnwatchedLesson || firstLesson || null;
        setCurrentLesson(newCurrentLesson);
        if (newCurrentLesson) setLoadingVideo(true);

      } catch (err) {
        console.error("Erro ao carregar dados do curso:", err);
        toast.error("Erro ao carregar dados do curso.");
        setError('Não foi possível carregar o curso.');
        setHasAccess(false);
      } finally {
        setLoading(false);
      }
    };

    loadCourseData();
  }, [courseId, navigate]); // Removed checkAccess from dependencies

  const handleLessonClick = useCallback((lesson) => {
    setLoadingVideo(true);
    setCurrentLesson(lesson);
  }, []);

  const handleToggleProgress = useCallback(async (lessonId) => {
    if (!access) return; // Use 'access' state

    try {
      const updatedCompletedLessons = new Set(completedLessons);
      let message = "";

      if (updatedCompletedLessons.has(lessonId)) {
        updatedCompletedLessons.delete(lessonId);
        message = "Aula desmarcada.";
      } else {
        updatedCompletedLessons.add(lessonId);
        message = "Aula marcada como assistida! 🎉";
      }

      const completedLessonsArray = Array.from(updatedCompletedLessons);
      const progress = totalLessonsCount > 0 ? Math.round((completedLessonsArray.length / totalLessonsCount) * 100) : 0;

      await CourseAccess.update(access.id, { // Use 'access.id'
        completed_lessons: completedLessonsArray,
        progress: progress
      });

      setCompletedLessons(updatedCompletedLessons);
      toast.success(message);

      if (progress === 100 && updatedCompletedLessons.size === totalLessonsCount) {
        toast.success("Parabéns! Você concluiu o curso! 🎊");
      }

    } catch (err) {
      console.error("Erro ao salvar progresso:", err);
      toast.error("Erro ao salvar progresso.");
    }
  }, [access, completedLessons, totalLessonsCount]); // Dependencies updated

  const handleProgress = useCallback((progress) => {
    // This function can be used to track video progress (e.g., if using a YouTube API player)
    // console.log("Video progress:", progress);
  }, []);

  const handleLessonComplete = useCallback(() => {
    // This function can be triggered when the video finishes playing
    console.log("Video completed.");
    // Optionally, automatically mark the current lesson as complete
    // if (currentLesson && !completedLessons.has(currentLesson.id)) {
    //   handleToggleProgress(currentLesson.id);
    // }
  }, []); // Add dependencies if uncommenting auto-complete logic

  const renderVideoPlayer = () => {
    if (!currentLesson) {
      return (
        <div className="aspect-video bg-black rounded-xl shadow-2xl overflow-hidden relative">
            {settings?.store_logo_url && (
                <img 
                  src={settings.store_logo_url}
                  alt="Logo da Loja"
                  className="absolute top-4 right-4 z-20 h-8 md:h-10 w-auto opacity-80"
                />
            )}
            <div className="w-full h-full flex flex-col items-center justify-center text-white p-8 text-center">
              <PlayCircle className="w-16 h-16 mb-4 opacity-50"/>
              <h3 className="text-xl font-semibold">Bem-vindo ao curso!</h3>
              <p className="text-gray-300">Selecione uma aula na lista para começar a assistir.</p>
            </div>
        </div>
      );
    }

    return (
      <UniversalVideoPlayer
        videoUrl={currentLesson.video_url}
        googleDriveId={currentLesson.google_drive_video_id} // New field for Google Drive ID
        courseId={course?.id}
        title={currentLesson.title}
        settings={settings}
        onProgress={handleProgress}
        onComplete={handleLessonComplete}
        setLoadingVideo={setLoadingVideo} // Pass setState function to child
      />
    );
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-slate-100'}`}>
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center min-h-screen text-center p-4 ${darkMode ? 'bg-gray-900 text-white' : 'bg-slate-100 text-gray-800'}`}>
        <Lock className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-3xl font-bold">Erro de Acesso ou Carregamento</h1>
        <p className={`mt-2 ${darkMode ? 'text-gray-300' : 'text-slate-600'}`}>{error}</p>
        <Button onClick={() => navigate(createPageUrl("Store"))} className="mt-6">Voltar para a Loja</Button>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className={`flex flex-col items-center justify-center min-h-screen text-center p-4 ${darkMode ? 'bg-gray-900 text-white' : 'bg-slate-100 text-gray-800'}`}>
        <Lock className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-3xl font-bold">Acesso Negado</h1>
        <p className={`mt-2 ${darkMode ? 'text-gray-300' : 'text-slate-600'}`}>Você não tem permissão para acessar este curso.</p>
        <Button onClick={() => navigate(createPageUrl("Store"))} className="mt-6">Voltar para a Loja</Button>
      </div>
    );
  }
  
  const progressPercentage = totalLessonsCount > 0 ? Math.round((completedLessons.size / totalLessonsCount) * 100) : 0;

  return (
    <>
      <Toaster richColors position="top-right" />
      <div className={`min-h-screen transition-colors duration-300 ${
        darkMode 
          ? 'bg-gray-900 text-white' 
          : 'bg-gray-50 text-gray-800'
      }`}>

        {/* Header Fixo */}
        <header className={`shadow-md sticky top-0 z-20 transition-colors duration-300 ${
          darkMode 
            ? 'bg-gray-800 border-b border-gray-700' 
            : 'bg-white'
        }`}>
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => navigate(createPageUrl('Store'))} className="bg-transparent border-gray-300 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-700">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="hidden md:block">
                  <h1 className={`text-lg font-bold truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {course.title}
                  </h1>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    por {course.instructor_name}
                  </p>
                </div>
              </div>

              <div className="flex-1 mx-8 hidden sm:block">
                  <p className={`text-center text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {progressPercentage}% concluído
                  </p>
                  <div className={`w-full rounded-full h-2.5 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
                  </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Botão para alternar tema */}
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleDarkMode}
                  className="bg-transparent border-gray-300 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-700"
                  title={darkMode ? "Modo Claro" : "Modo Escuro"}
                >
                  {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </Button>

                {/* Botão para ocultar/mostrar lista de aulas */}
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleLessonList}
                  className="bg-transparent border-gray-300 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-700"
                  title={showLessonList ? "Ocultar Lista de Aulas" : "Mostrar Lista de Aulas"}
                >
                  {showLessonList ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>

                {currentLesson && (
                    <Button
                      onClick={() => handleToggleProgress(currentLesson.id)}
                      variant={completedLessons.has(currentLesson.id) ? "default" : "outline"}
                      className={`transition-all ${
                        completedLessons.has(currentLesson.id) 
                          ? "bg-green-600 hover:bg-green-700" 
                          : "text-green-600 border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20"
                      }`}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {completedLessons.has(currentLesson.id) ? "Concluída" : "Marcar"}
                    </Button>
                )}
              </div>
            </div>
          </div>
        </header>

        <div className={`flex flex-col max-w-screen-2xl mx-auto transition-all duration-300 ${
          showLessonList ? 'lg:flex-row' : 'flex-col'
        }`}>
          {/* Conteúdo Principal (Vídeo e Descrição) */}
          <main className={`p-4 lg:p-8 transition-all duration-300 ${
            showLessonList ? 'w-full lg:w-2/3 xl:w-3/4' : 'w-full'
          }`}>
            {renderVideoPlayer()}

            <div className="mt-8">
              <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {currentLesson?.title || " "}
              </h2>
              {currentLesson?.description && (
                  <p className={`mt-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {currentLesson.description}
                  </p>
              )}
               {currentLesson?.downloadable_resource_url && (
                    <Button asChild className="mt-4">
                        <a href={currentLesson.downloadable_resource_url} target="_blank" rel="noopener noreferrer">
                            <Download className="w-4 h-4 mr-2" />
                            Baixar Material da Aula
                        </a>
                    </Button>
                )}
            </div>
          </main>

          {/* Sidebar com Aulas (Condicional) */}
          {showLessonList && (
            <aside className={`p-4 lg:p-6 transition-all duration-300 ${
              darkMode 
                ? 'bg-gray-800 lg:border-l lg:border-gray-700' 
                : 'bg-white lg:bg-transparent lg:border-l lg:border-gray-200'
            } w-full lg:w-1/3 xl:w-1/4 lg:h-[calc(100vh-4rem)] lg:overflow-y-auto`}>
              <div className="block sm:hidden mb-4">
                   <p className={`text-center text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                     {progressPercentage}% concluído
                   </p>
                   <div className={`w-full rounded-full h-2.5 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                       <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
                   </div>
               </div>
               <h3 className={`text-xl font-bold mb-4 flex items-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                 <BookOpen className="w-5 h-5 mr-3 text-blue-600"/>
                 Aulas do Curso
               </h3>
              {modules.map(module => (
                <div key={module.id} className="mb-6">
                  <h4 className={`font-bold mb-3 pt-3 border-t ${
                    darkMode 
                      ? 'text-gray-200 border-gray-700' 
                      : 'text-gray-800 border-gray-200'
                  }`}>
                    {module.title}
                  </h4>
                  <div className="space-y-2">
                    {module.lessons.map(lesson => (
                      <button
                        key={lesson.id}
                        onClick={() => handleLessonClick(lesson)}
                        className={`w-full text-left p-3 rounded-lg flex items-center gap-4 transition-all duration-200 ${
                          currentLesson?.id === lesson.id 
                            ? darkMode
                              ? 'bg-blue-900/50 shadow-sm'
                              : 'bg-blue-100 shadow-sm'
                            : darkMode 
                              ? 'hover:bg-gray-700' 
                              : 'hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex-shrink-0">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                            completedLessons.has(lesson.id) 
                              ? 'bg-green-500 text-white' 
                              : darkMode 
                                ? 'bg-gray-600' 
                                : 'bg-gray-300'
                          }`}>
                             {completedLessons.has(lesson.id) ? 
                               <CheckCircle className="w-4 h-4"/> : 
                               <PlayCircle className={`w-4 h-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}/>
                             }
                          </div>
                        </div>
                        <span className={`flex-1 text-sm font-medium ${
                          currentLesson?.id === lesson.id 
                            ? darkMode 
                              ? 'text-blue-400' 
                              : 'text-blue-700'
                            : darkMode 
                              ? 'text-gray-300' 
                              : 'text-gray-700'
                        }`}>
                          {lesson.title}
                        </span>
                        {lesson.duration_minutes && (
                           <Badge variant="outline" className="text-xs">
                             {lesson.duration_minutes} min
                           </Badge>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </aside>
          )}
        </div>
      </div>
    </>
  );
}
