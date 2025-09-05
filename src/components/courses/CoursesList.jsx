import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Edit, Trash2, MoreVertical, ToggleLeft, ToggleRight, PlayCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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


function CourseItem({ course, onEdit, onDelete, onToggleStatus }) {
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

  return (
    <Card className={`overflow-hidden shadow-lg border-0 transition-all duration-300 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white'}`}>
      <CardContent className="p-0 flex flex-col md:flex-row">
        <img
          src={course.thumbnail_url || 'https://via.placeholder.com/200x150?text=Curso'}
          alt={course.title}
          className="w-full md:w-48 h-32 md:h-auto object-cover"
        />
        <div className="p-4 flex flex-col flex-1">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-lg mb-1">{course.title}</h3>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className={darkMode ? 'bg-gray-900 border-gray-700 text-white' : ''}>
                <DropdownMenuItem onClick={() => onEdit(course.id)}>
                  <Edit className="w-4 h-4 mr-2" /> Editar Conteúdo
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onToggleStatus(course)}>
                  {course.is_active ? <ToggleLeft className="w-4 h-4 mr-2" /> : <ToggleRight className="w-4 h-4 mr-2" />}
                  {course.is_active ? 'Desativar' : 'Ativar'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onDelete(course)} className="text-red-500 focus:text-red-500 focus:bg-red-50 dark:focus:bg-red-900/50">
                  <Trash2 className="w-4 h-4 mr-2" /> Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <p className={`text-sm line-clamp-2 mb-2 ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>{course.description}</p>
          <div className="flex items-center justify-between mt-auto">
            <div className="flex items-center gap-4">
              <p className={`font-bold text-lg ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>R$ {(course.price || 0).toFixed(2)}</p>
              <Badge variant={course.is_active ? 'default' : 'secondary'} className={course.is_active ? `${darkMode ? 'bg-green-800/80 text-green-200' : 'bg-green-100 text-green-800'}` : `${darkMode ? 'bg-red-800/80 text-red-200' : 'bg-red-100 text-red-800'}`}>
                {course.is_active ? "Ativo" : "Inativo"}
              </Badge>
            </div>
            <span className={`text-sm ${darkMode ? 'text-gray-500' : 'text-slate-500'}`}>{course.category}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


export default function CoursesList({ courses, loading, onEdit, onDelete, onToggleStatus }) {
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
  
  if (loading) {
    return (
      <div className="space-y-6">
        {Array(3).fill(0).map((_, i) => (
          <Card key={i} className={`shadow-lg border-0 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
             <CardContent className="p-0 flex">
                <Skeleton className={`w-48 h-32 ${darkMode ? 'bg-gray-700' : 'bg-slate-200'}`} />
                <div className="p-4 flex-1 space-y-3">
                    <Skeleton className={`h-5 w-3/4 ${darkMode ? 'bg-gray-700' : 'bg-slate-200'}`} />
                    <Skeleton className={`h-4 w-full ${darkMode ? 'bg-gray-700' : 'bg-slate-200'}`} />
                    <Skeleton className={`h-4 w-1/2 ${darkMode ? 'bg-gray-700' : 'bg-slate-200'}`} />
                </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className={`text-center py-12 ${darkMode ? 'text-gray-300' : ''}`}>
        <PlayCircle className={`w-16 h-16 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-slate-400'}`} />
        <h3 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Nenhum curso encontrado</h3>
        <p className={`${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>Comece a criar seus cursos para vê-los aqui.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {courses.map(course => (
        <CourseItem 
          key={course.id}
          course={course}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleStatus={onToggleStatus}
        />
      ))}
    </div>
  );
}