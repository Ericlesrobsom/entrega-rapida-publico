
import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { User } from '@/api/entities';
import { Course } from '@/api/entities';
import { CourseModule } from '@/api/entities';
import { CourseLesson } from '@/api/entities';
import { CourseAccess } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, Play, CheckCircle2, Clock, ChevronDown, ChevronRight, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
// REMOVIDO: UniversalVideoPlayer

export default function CoursePlayer() {
  const location = useLocation();
  const navigate = useNavigate();

  const urlParams = new URLSearchParams(window.location.search);
  const courseId = urlParams.get('courseId');
  const lessonIdParam = urlParams.get('lessonId');

  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [lessonsByModule, setLessonsByModule] = useState({});
  const [currentLesson, setCurrentLesson] = useState(null);
  const [completedLessons, setCompletedLessons] = useState(new Set());
  const [access, setAccess] = useState(null); // Renamed from courseAccess
  const [loading, setLoading] = useState(false); // Set to false initially, loadCourseData will set it to true then false.
  const [error, setError] = useState('');
  const [expandedModules, setExpandedModules] = useState({});
  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState(null);
  // videoUrl and videoError states are removed as UniversalVideoPlayer will handle video source directly from videoId prop

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setDarkMode(isDark);
    const observer = new MutationObserver(() => {
      const newIsDark = document.documentElement.classList.contains('dark');
      setDarkMode(newIsDark);
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // The useEffect block that previously set videoUrl and videoError is removed.
  // UniversalVideoPlayer will now use 'videoId' and 'lesson' props directly.

  const handleLessonCompleted = useCallback(async () => {
    if (!currentLesson || !user || !access) return;

    // Check if the lesson is already marked as completed
    if (completedLessons.has(currentLesson.id)) {
      return; // Already completed, no need to do anything
    }

    const updatedCompletedLessons = new Set(completedLessons);
    updatedCompletedLessons.add(currentLesson.id);
    setCompletedLessons(updatedCompletedLessons);

    // Update the course access in the backend
    try {
      await CourseAccess.update(access.id, {
        completed_lessons: Array.from(updatedCompletedLessons) // Convert Set to Array for storage
      });
      toast.success('Aula marcada como concluída!');
    } catch (err) {
      console.error('Failed to update lesson completion:', err);
      toast.error('Erro ao marcar aula como concluída.');
    }
  }, [currentLesson, user, access, completedLessons]);

  const loadCourseData = useCallback(async () => {
    setLoading(true); // Set loading to true at the start of data fetching
    setError(''); // Clear any previous errors

    if (!courseId) {
      setError('ID do curso não encontrado na URL.');
      setLoading(false);
      return;
    }

    try {
      // PEGAR USUÁRIO
      let currentUser = null;
      try {
        currentUser = await User.me();
        setUser(currentUser);
      } catch (authError) {
        setError('Você precisa estar logado para acessar este curso.');
        setLoading(false);
        return;
      }

      // PEGAR CURSO
      const courseData = await Course.filter({ id: courseId });
      if (courseData.length === 0) {
        setError('Curso não encontrado.');
        setLoading(false);
        return;
      }

      setCourse(courseData[0]);

      // Use a local variable to ensure the access status for the current execution is used
      // instead of relying on the 'access' state from the closure which might be stale.
      let currentAccessStatus = null;

      // VERIFICACAO DE ACESSO
      if (currentUser.role === 'admin') {
        // ADMIN PODE TUDO
        currentAccessStatus = { access_type: 'admin', progress: 0, completed_lessons: [] };
        setAccess(currentAccessStatus);
        setCompletedLessons(new Set());
      } else {
        // USUARIO NORMAL - VERIFICAR SE COMPROU
        const accessData = await CourseAccess.filter({
          course_id: courseId,
          student_email: currentUser.email
        });

        if (accessData.length === 0) {
          currentAccessStatus = null; // No access
          setAccess(null);
        } else {
          currentAccessStatus = accessData[0];
          setAccess(currentAccessStatus);
          setCompletedLessons(new Set(currentAccessStatus.completed_lessons || []));
        }
      }

      // CARREGAR CONTEÚDO
      const [modulesData, lessonsData] = await Promise.all([
        CourseModule.filter({ course_id: courseId, is_active: true }),
        CourseLesson.filter({ course_id: courseId, is_active: true })
      ]);

      const sortedModules = modulesData.sort((a, b) => a.sort_order - b.sort_order);
      setModules(sortedModules);

      // Group lessons by module for easier access
      const groupedLessons = lessonsData.reduce((acc, lesson) => {
        if (!acc[lesson.module_id]) {
          acc[lesson.module_id] = [];
        }
        acc[lesson.module_id].push(lesson);
        return acc;
      }, {});

      // Sort lessons within each module
      Object.keys(groupedLessons).forEach(moduleId => {
        groupedLessons[moduleId].sort((a, b) => a.sort_order - b.sort_order);
      });
      setLessonsByModule(groupedLessons);

      let initialLesson = null;
      let initialExpandedModuleId = null;

      if (lessonIdParam) {
        // Try to find the lesson by ID from the URL param
        for (const moduleId in groupedLessons) {
          const foundLesson = groupedLessons[moduleId].find(l => l.id === lessonIdParam);
          if (foundLesson) {
            initialLesson = foundLesson;
            initialExpandedModuleId = moduleId;
            break;
          }
        }
      }

      // If no specific lesson found or param was empty, set the first lesson of the first module
      if (!initialLesson && sortedModules.length > 0) {
        const firstModuleId = sortedModules[0].id;
        const firstModuleLessons = groupedLessons[firstModuleId];
        if (firstModuleLessons && firstModuleLessons.length > 0) {
          initialLesson = firstModuleLessons[0];
          initialExpandedModuleId = firstModuleId;
        }
      }

      setCurrentLesson(initialLesson);
      if (initialExpandedModuleId) {
        setExpandedModules({ [initialExpandedModuleId]: true });
      } else if (sortedModules.length > 0) {
        setExpandedModules({ [sortedModules[0].id]: true }); // Fallback to expanding first module
      }

      // Use currentAccessStatus for this check, which is determined within this function call.
      if (!currentAccessStatus && (!initialLesson || !initialLesson.is_preview) && currentUser.role !== 'admin') {
        setError('Você não tem acesso a este curso. Faça a compra para ter acesso ao conteúdo completo.');
      }

    } catch (error) {
      setError(`Erro ao carregar o curso: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [courseId, lessonIdParam]); // Removed setUser, setError, setLoading from dependencies as they are state setters

  useEffect(() => {
    loadCourseData();
  }, [loadCourseData]);

  const toggleModule = (moduleId) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  const handleLessonClick = useCallback((lesson) => {
    if (!lesson.is_preview && (!access || access.access_type === 'no_access')) { // Check explicitly for 'no_access' type or null access
      toast.error("Você precisa adquirir o curso para assistir esta aula.");
      return;
    }
    setCurrentLesson(lesson);
    // Update URL with lessonId
    const url = new URL(window.location.href);
    url.searchParams.set('lessonId', lesson.id);
    window.history.pushState({}, '', url);
  }, [access]);

  const goBack = () => {
    navigate(createPageUrl('Store'));
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-6 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}>
        <div className={`max-w-md text-center ${darkMode ? 'bg-gray-800' : 'bg-white'} p-8 rounded-lg shadow-lg`}>
          <h2 className="text-2xl font-bold mb-4 text-red-600">Erro de Acesso</h2>
          <p className={`mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{error}</p>
          <Button onClick={goBack} className="bg-blue-600 hover:bg-blue-700">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para a Loja
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <Button onClick={goBack} variant="ghost" className={`${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para a Loja
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content area: Player and Lesson Details */}
          <div className="lg:col-span-2">
            <div className={`bg-white dark:bg-slate-900 rounded-lg shadow-lg overflow-hidden`}>
              {currentLesson ? (
                <div className="flex flex-col">
                  <div className="aspect-video bg-black flex-shrink-0">
                    {currentLesson.google_drive_video_id ? (
                      <DirectVideoPlayer
                        fileId={currentLesson.google_drive_video_id}
                        lessonTitle={currentLesson.title}
                        onLessonCompleted={handleLessonCompleted}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center p-4">
                        <p className="text-white">Nenhum vídeo configurado para esta aula.</p>
                      </div>
                    )}
                  </div>
                  <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} border-none shadow-none rounded-none p-6`}>
                    <CardHeader className="p-0 mb-4">
                      <CardTitle className={`${darkMode ? 'text-white' : 'text-gray-900'} text-2xl font-bold`}>
                        {currentLesson.title}
                        {currentLesson.is_preview && (
                          <Badge variant="outline" className="ml-2 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                            Prévia
                          </Badge>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {currentLesson.description}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className={`p-8 text-center ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <p className="text-xl font-semibold">Bem-vindo ao curso!</p>
                  <p className="mt-2">Selecione uma aula no menu lateral para começar.</p>
                  <p className="mt-2">Se este é seu primeiro acesso e nenhuma aula foi carregada, verifique sua conexão ou se o curso possui conteúdo ativo.</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar: Modules and Lessons list */}
          <div className="lg:col-span-1">
            <Card className={`sticky top-4 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
              <CardHeader>
                <CardTitle className={`flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  <BookOpen className="w-5 h-5" />
                  {course?.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 max-h-[600px] overflow-y-auto">
                {modules.map((module) => {
                  const moduleLessons = lessonsByModule[module.id] || [];
                  const isExpanded = expandedModules[module.id];

                  return (
                    <div key={module.id} className={`border-b last:border-b-0 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <button
                        onClick={() => toggleModule(module.id)}
                        className={`w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                          darkMode ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        <span className="font-medium">{module.title}</span>
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>

                      {isExpanded && (
                        <div className={`${darkMode ? 'bg-gray-700/30' : 'bg-gray-50'}`}>
                          {moduleLessons.map((lesson) => (
                            <button
                              key={lesson.id}
                              onClick={() => handleLessonClick(lesson)}
                              className={`w-full p-3 text-left text-sm transition-colors border-l-2 ${
                                currentLesson?.id === lesson.id
                                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                  : 'border-transparent hover:bg-gray-100 dark:hover:bg-gray-600'
                              }`}
                            >
                              <div className="flex items-start gap-2">
                                <div className="mt-0.5">
                                  {completedLessons.has(lesson.id) ? (
                                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                                  ) : (
                                    <Play className="w-4 h-4 text-gray-400" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className={`font-medium truncate ${
                                    currentLesson?.id === lesson.id
                                      ? 'text-blue-600 dark:text-blue-400'
                                      : darkMode ? 'text-gray-200' : 'text-gray-900'
                                  }`}>
                                    {lesson.title}
                                    {lesson.is_preview && (
                                      <span className="text-xs text-blue-500 ml-1">(Prévia)</span>
                                    )}
                                  </p>
                                  {lesson.duration_minutes && (
                                    <p className={`flex items-center gap-1 mt-1 ${
                                      darkMode ? 'text-gray-400' : 'text-gray-500'
                                    }`}>
                                      <Clock className="w-3 h-3" />
                                      {lesson.duration_minutes} min
                                    </p>
                                  )}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// Novo componente que incorpora o player diretamente
function DirectVideoPlayer({ fileId, lessonTitle, onLessonCompleted }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [player, setPlayer] = useState(null);

  const loadVideoJSLibraries = () => {
    return new Promise((resolve, reject) => {
      // Check if CSS is already loaded
      const existingCssLink = document.querySelector('link[href="https://vjs.zencdn.net/8.3.0/video-js.css"]');
      if (!existingCssLink) {
        const cssLink = document.createElement('link');
        cssLink.rel = 'stylesheet';
        cssLink.href = 'https://vjs.zencdn.net/8.3.0/video-js.css';
        document.head.appendChild(cssLink);
      }

      // Check if JS is already loaded
      const existingJsScript = document.querySelector('script[src="https://vjs.zencdn.net/8.3.0/video.min.js"]');
      if (!existingJsScript) {
        const script = document.createElement('script');
        script.src = 'https://vjs.zencdn.net/8.3.0/video.min.js';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      } else {
        // If already loaded, resolve immediately
        resolve();
      }
    });
  };

  const initializePlayer = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fazer requisições diretamente para a API Snux
      const API_KEY = 'snuxdev89734'; // This key should ideally be fetched securely or from environment variables
      const API_BASE_URL = 'https://api-snux.kinggmusic.org/api/v1';

      console.log('🎥 Iniciando carregamento do vídeo:', fileId);

      // 1. Obter token de sessão
      const sessionResponse = await fetch(`${API_BASE_URL}/request-stream/${fileId}`, {
        headers: { Authorization: `Bearer ${API_KEY}` }
      });

      if (!sessionResponse.ok) {
        const errorText = await sessionResponse.text();
        throw new Error(`Falha ao obter token: ${sessionResponse.status} - ${errorText}`);
      }

      const { session_token } = await sessionResponse.json();
      console.log('✅ Token obtido');

      // 2. Obter informações do arquivo
      const fileInfoResponse = await fetch(`${API_BASE_URL}/files/${fileId}/info`, {
        headers: { Authorization: `Bearer ${API_KEY}` }
      });

      if (!fileInfoResponse.ok) {
        const errorText = await fileInfoResponse.text();
        throw new Error(`Erro ao obter info do arquivo: ${fileInfoResponse.status} - ${errorText}`);
      }

      const fileInfo = await fileInfoResponse.json();
      console.log('📄 Info do arquivo obtida:', fileInfo.name);

      if (!fileInfo.mimeType?.startsWith("video/")) {
        throw new Error("Arquivo não é um vídeo válido.");
      }

      // 3. Criar URL de streaming
      const streamUrl = `${API_BASE_URL}/files/${fileId}/stream?session_token=${session_token}`;

      // 4. Carregar Video.js se ainda não estiver carregado
      if (!window.videojs) {
        await loadVideoJSLibraries();
      }

      // 5. Inicializar player
      // Ensure the video element is always in the DOM for this to work
      const videoElement = document.getElementById('direct-video-player');
      if (!videoElement) {
        // This case should ideally not happen with the revised rendering logic,
        // but it's good for debugging if the DOM isn't ready.
        throw new Error("Elemento de vídeo não encontrado. Verifique o ID no DOM ou o ciclo de vida do componente.");
      }

      // If a player already exists for this element, dispose it first to avoid conflicts
      if (videoElement.player) {
        videoElement.player.dispose();
      }

      const playerInstance = window.videojs(videoElement, {
        controls: true,
        fluid: true,
        responsive: true,
        playbackRates: [0.5, 1, 1.25, 1.5, 2],
        sources: [{
          src: streamUrl,
          type: fileInfo.mimeType
        }]
      });

      playerInstance.ready(() => {
        console.log('✅ Player inicializado com sucesso');
        setLoading(false);
      });

      // Event listeners
      playerInstance.on('ended', () => {
        console.log('🏁 Vídeo finalizado');
        onLessonCompleted?.();
      });

      playerInstance.on('error', (e) => {
        console.error('❌ Erro no player:', e);
        // Accessing the actual error from Video.js
        const playerError = playerInstance.error();
        setError(`Erro ao reproduzir vídeo: ${playerError ? playerError.message : 'Desconhecido'}`);
        setLoading(false);
      });

      setPlayer(playerInstance);

    } catch (err) {
      console.error('❌ Erro ao inicializar player:', err);
      setError(err.message);
      setLoading(false);
    }
  }, [fileId, onLessonCompleted]); // Depend on fileId and onLessonCompleted

  // Effect to initialize player when fileId or initializePlayer function changes
  useEffect(() => {
    if (!fileId) {
      setError('ID do arquivo não fornecido');
      setLoading(false);
      return;
    }
    initializePlayer();
  }, [fileId, initializePlayer]); // Added initializePlayer to dependencies

  // Effect to dispose player when component unmounts or player instance changes
  useEffect(() => {
    return () => {
      if (player) {
        console.log('🗑️ Disposing Video.js player');
        player.dispose();
      }
    };
  }, [player]); // Dependency on player state to ensure correct cleanup

  return (
    <div className="w-full h-full relative bg-black">
      <video
        id="direct-video-player"
        className="video-js vjs-default-skin w-full h-full"
        controls
        preload="auto"
        data-setup="{}"
      >
        <p className="vjs-no-js text-white text-center">
          Para visualizar este vídeo, habilite o JavaScript e considere atualizar para um
          <a href="https://videojs.com/html5-video-support/" target="_blank" rel="noopener noreferrer">
            navegador web que suporte HTML5
          </a>
        </p>
      </video>

      {/* Conditional overlays for loading and error states */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 z-10">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
            <p>Carregando vídeo...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 z-10">
          <div className="text-white text-center">
            <p className="text-red-400 mb-2">❌ {error}</p>
            <button
              onClick={initializePlayer}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
