
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { HardDrive, Loader2 } from 'lucide-react'; // Re-added HardDrive, added Loader2 for submit button
import { toast } from 'sonner'; // Added toast for notifications
import GoogleDriveSelector from './GoogleDriveSelector';
import UniversalVideoPlayer from './UniversalVideoPlayer'; // New component for video preview
import { UploadFile } from '@/api/integrations'; // Imported as per outline

// Helper function to initialize form data, ensuring no nulls and default values
const getInitialFormData = (initialData) => ({
  title: initialData?.title || '',
  description: initialData?.description || '',
  video_url: initialData?.video_url || '',
  duration_minutes: initialData?.duration_minutes || 0,
  is_preview: initialData?.is_preview || false,
  sort_order: initialData?.sort_order || 0,
});

export default function LessonForm({ isOpen, onClose, onSubmit, initialData, darkMode }) {
  const [formData, setFormData] = useState(() => getInitialFormData(initialData));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDriveSelectorOpen, setIsDriveSelectorOpen] = useState(false); // State to control Google Drive selector dialog
  const [isUploading, setIsUploading] = useState(false); // State to indicate if an upload is in progress (for submit button)

  // Effect to reset form data when the dialog opens or initialData changes
  useEffect(() => {
    if (isOpen) { // Only reset if the dialog is open
      setFormData(getInitialFormData(initialData));
    }
  }, [initialData, isOpen]); // Kept isOpen in dependencies for robust form reset on dialog open

  // Generic handler for input, textarea, and switch elements
  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // handleFileChange mentioned in outline is not present in original code and seems replaced by handleVideoSelect.
  // The original handleFileSelect is also replaced by the new GoogleDriveSelector integration.

  // Handler for when a video file is selected from Google Drive
  const handleVideoSelect = (video) => {
      if (video && video.id) {
          // Format the Google Drive URL for the UniversalVideoPlayer
          const formattedUrl = `https://drive.google.com/file/d/${video.id}/preview`;
          setFormData(prev => ({
              ...prev,
              video_url: formattedUrl,
              // Use filename without extension as title if title is not already set
              title: prev.title || video.name.replace(/\.(mp4|mov|avi|wmv|mkv|webm)$/i, '').trim(),
          }));
          setIsDriveSelectorOpen(false); // Close the selector after selection
      } else {
          toast.error("Vídeo inválido selecionado.");
      }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <> {/* Added React Fragment to allow rendering GoogleDriveSelector as a separate dialog */}
      <Dialog open={isOpen} onOpenChange={onClose}>
        {/* Apply dark mode classes to DialogContent and set max-width to 2xl as per outline */}
        <DialogContent className={`max-w-2xl ${darkMode ? "bg-gray-800 border-gray-700 text-white" : ""}`}>
          <DialogHeader>
            {/* Apply dark mode classes to DialogTitle */}
            <DialogTitle className={darkMode ? "text-white" : ""}>{initialData ? 'Editar Aula' : 'Nova Aula'}</DialogTitle>
            {/* DialogDescription component removed from header as per outline */}
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-4"> {/* Changed py-4 to mt-4 as per outline */}
            {/* Title Input */}
            <div className="space-y-2">
              {/* Apply dark mode classes to Label */}
              <Label htmlFor="title" className={darkMode ? 'text-gray-300' : ''}>Título da Aula</Label>
              {/* Apply dark mode classes to Input */}
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                required
                className={darkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}
              />
            </div>

            {/* Video URL Input with Google Drive Selector button */}
            <div className="space-y-2">
              {/* Apply dark mode classes to Label */}
              <Label htmlFor="video_url" className={darkMode ? 'text-gray-300' : ''}>URL do Vídeo ou ID do Google Drive</Label>
              <div className="flex items-center gap-2"> {/* Container for input and button */}
                {/* Apply dark mode classes to Input */}
                <Input
                  id="video_url"
                  value={formData.video_url || ''}
                  onChange={(e) => handleChange('video_url', e.target.value)}
                  required
                  placeholder="Cole a URL ou o ID do vídeo aqui" // Updated placeholder as per outline
                  className={darkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}
                />
                {/* Button to open Google Drive Selector */}
                <Button type="button" variant="secondary" onClick={() => setIsDriveSelectorOpen(true)} className="flex-shrink-0">
                  <HardDrive className="w-4 h-4" /> {/* HardDrive icon */}
                </Button>
              </div>
            </div>

            {/* Conditional rendering of UniversalVideoPlayer */}
            {formData.video_url && (
                <div className="rounded-lg overflow-hidden border dark:border-gray-600">
                    <UniversalVideoPlayer videoUrl={formData.video_url} />
                </div>
            )}

            {/* Description Textarea */}
            <div className="space-y-2">
              {/* Apply dark mode classes to Label */}
              <Label htmlFor="description" className={darkMode ? 'text-gray-300' : ''}>Descrição (opcional)</Label>
              {/* Apply dark mode classes to Textarea */}
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Descreva o conteúdo desta aula..."
                rows={3}
                className={darkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}
              />
            </div>

            {/* Duration Input & Sort Order Input (side-by-side using grid) */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                {/* Apply dark mode classes to Label */}
                <Label htmlFor="duration_minutes" className={darkMode ? 'text-gray-300' : ''}>Duração (minutos)</Label>
                {/* Apply dark mode classes to Input */}
                <Input
                  id="duration_minutes"
                  type="number"
                  value={formData.duration_minutes}
                  onChange={(e) => handleChange('duration_minutes', Number(e.target.value))} // Ensure number conversion
                  min="0"
                  className={darkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}
                />
              </div>

              {/* New field: Sort Order */}
              <div className="space-y-2">
                <Label htmlFor="sort_order" className={darkMode ? 'text-gray-300' : ''}>Ordem</Label>
                <Input
                  id="sort_order"
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => handleChange('sort_order', Number(e.target.value))} // Ensure number conversion
                  className={darkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}
                />
              </div>
            </div>

            {/* Is Preview Switch */}
            <div className="flex items-center space-x-2">
              <Switch
                id="is_preview"
                checked={formData.is_preview}
                onCheckedChange={(value) => handleChange('is_preview', value)}
              />
              {/* Apply dark mode classes to Label */}
              <Label htmlFor="is_preview" className={darkMode ? 'text-gray-300' : ''}>Permitir prévia gratuita</Label>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
              {/* Update submit button with isSubmitting and isUploading state */}
              <Button type="submit" disabled={isSubmitting || isUploading}>
                {(isSubmitting || isUploading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} {/* Loader2 icon */}
                Salvar Aula
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* GoogleDriveSelector rendered as a separate dialog, controlled by isDriveSelectorOpen */}
      <GoogleDriveSelector
          isOpen={isDriveSelectorOpen}
          onClose={() => setIsDriveSelectorOpen(false)}
          onSelectVideo={handleVideoSelect} // Pass the new video selection handler
          onSelectFolder={() => toast.info("Por favor, selecione um arquivo de vídeo individual para esta aula.")} // Handle folder selection (informational)
          darkMode={darkMode} // Pass dark mode prop
      />
    </>
  );
}
