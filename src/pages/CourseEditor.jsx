import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Course } from '@/api/entities';
import { Toaster, toast } from 'sonner';
import { ArrowLeft, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '@/utils';

import CourseDetailsForm from '../components/courses/CourseDetailsForm';
import CourseContentManager from '../components/courses/CourseContentManager';

export default function CourseEditor() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('details');
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        const isDark = document.documentElement.classList.contains('dark');
        setDarkMode(isDark);
        const observer = new MutationObserver(() => {
            setDarkMode(document.documentElement.classList.contains('dark'));
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    const loadCourse = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        try {
            const courseData = await Course.get(id);
            setCourse(courseData);
        } catch (error) {
            console.error("Erro ao carregar curso:", error);
            toast.error("Curso não encontrado. Redirecionando...");
            navigate(createPageUrl('Courses'));
        } finally {
            setLoading(false);
        }
    }, [id, navigate]);

    useEffect(() => {
        if (id) {
            loadCourse();
        } else {
            setCourse(null);
            setLoading(false);
            // Se é um curso novo, força a aba de detalhes
            setActiveTab('details');
        }
    }, [id, loadCourse]);

    const handleSaveDetails = async (data) => {
        setIsSaving(true);
        try {
            if (course && course.id) {
                const updatedCourse = await Course.update(course.id, data);
                setCourse(updatedCourse);
                toast.success("Detalhes do curso atualizados com sucesso!");
            } else {
                const newCourse = await Course.create(data);
                toast.success("Curso criado com sucesso! Agora você pode adicionar o conteúdo.");
                navigate(createPageUrl(`CourseEditor?id=${newCourse.id}`), { replace: true });
            }
        } catch (error) {
            console.error("Erro ao salvar detalhes:", error);
            toast.error("Falha ao salvar os detalhes do curso.");
        } finally {
            setIsSaving(false);
        }
    };
    
    if (loading && id) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <>
            <Toaster richColors position="top-right" />
            <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-slate-50 text-slate-900'}`}>
                <header className={`p-4 border-b ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-slate-200 bg-white'}`}>
                    {/* ... O header continua o mesmo ... */}
                </header>

                <main className="max-w-7xl mx-auto p-6">
                    <div className="mb-6 border-b border-slate-200 dark:border-slate-700">
                        <nav className="flex space-x-4">
                            {/* CORREÇÃO: Botão "Conteúdo" é desabilitado se não houver ID */}
                            <button
                                onClick={() => setActiveTab('content')}
                                disabled={!id}
                                className={`px-4 py-2 font-medium text-sm rounded-t-lg ${activeTab === 'content' ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'} ${!id ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                Conteúdo do Curso
                            </button>
                            <button
                                onClick={() => setActiveTab('details')}
                                className={`px-4 py-2 font-medium text-sm rounded-t-lg ${activeTab === 'details' ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                            >
                                Detalhes e Configurações
                            </button>
                        </nav>
                    </div>

                    {/* CORREÇÃO: Mostra o conteúdo apenas se a aba estiver ativa E o ID existir */}
                    {activeTab === 'content' && id ? (
                        <CourseContentManager 
                            courseId={id} 
                            courseRootFolderId={course?.custom_api_root_folder_id}
                            courseRootFolderName={course?.custom_api_root_folder_name}
                        />
                    ) : (
                        <CourseDetailsForm course={course} onSave={handleSaveDetails} isSaving={isSaving} />
                    )}
                </main>
            </div>
        </>
    );
}