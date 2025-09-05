import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { googleDrive } from '@/api/functions';
import { Folder, FileVideo, HardDrive, Loader2, ChevronRight, Home } from 'lucide-react';
import { toast } from 'sonner';

export default function GoogleDriveSelector({ isOpen, onClose, onSelectFolder, onSelectVideo }) {
    const [folders, setFolders] = useState([]);
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [breadcrumbs, setBreadcrumbs] = useState([{ id: 'root', name: 'Início' }]);

    const currentFolderId = breadcrumbs[breadcrumbs.length - 1].id;

    const loadFiles = useCallback(async (folderId) => {
        setLoading(true);
        try {
            const action = folderId === 'root' ? 'getFolderDetails' : 'list';
            const response = await googleDrive({ action, folderId });

            if (response.data?.error) throw new Error(response.data.error);

            const allFiles = response.data?.files || [];
            const fetchedFolders = allFiles.filter(f => f.mimeType === 'application/vnd.google-apps.folder' && !f.hasError);
            const fetchedVideos = allFiles.filter(f => f.mimeType?.startsWith('video/'));

            setFolders(fetchedFolders);
            setVideos(fetchedVideos);
        } catch (error) {
            toast.error(`Erro ao buscar arquivos: ${error.message}`);
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isOpen) {
            // Reset to root when opened
            setBreadcrumbs([{ id: 'root', name: 'Início' }]);
            loadFiles('root');
        }
    }, [isOpen, loadFiles]);

    const handleFolderClick = (folder) => {
        setBreadcrumbs(prev => [...prev, { id: folder.id, name: folder.name }]);
        loadFiles(folder.id);
    };

    const handleBreadcrumbClick = (index) => {
        const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
        setBreadcrumbs(newBreadcrumbs);
        loadFiles(newBreadcrumbs[newBreadcrumbs.length - 1].id);
    };

    const handleSelectFolder = (folder) => {
        onSelectFolder(folder);
        onClose();
    };

    const handleSelectVideo = (video) => {
        onSelectVideo(video);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl h-[70vh] flex flex-col bg-white dark:bg-gray-800">
                <DialogHeader>
                    <DialogTitle className="dark:text-white">Selecionar do Google Drive</DialogTitle>
                    <DialogDescription className="dark:text-gray-400">
                        Navegue pelas pastas e selecione uma pasta inteira para importar em massa ou um único vídeo.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex items-center gap-1 text-sm p-2 bg-gray-100 dark:bg-gray-700 rounded-md">
                    {breadcrumbs.map((crumb, index) => (
                        <div key={crumb.id} className="flex items-center gap-1">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleBreadcrumbClick(index)}
                                disabled={loading}
                                className="flex items-center gap-1"
                            >
                                {index === 0 && <Home className="w-4 h-4" />}
                                <span>{crumb.name}</span>
                            </Button>
                            {index < breadcrumbs.length - 1 && <ChevronRight className="w-4 h-4 text-gray-400" />}
                        </div>
                    ))}
                </div>

                <div className="flex-grow overflow-y-auto space-y-4 pr-2">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                        </div>
                    ) : (
                        <>
                            {folders.length > 0 && (
                                <div>
                                    <h3 className="font-semibold mb-2 dark:text-gray-300">Pastas</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                        {folders.map(folder => (
                                            <div key={folder.id} className="group relative">
                                                <Button
                                                    variant="outline"
                                                    className="w-full h-auto p-3 flex flex-col items-center justify-center text-center gap-2 dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600"
                                                    onClick={() => handleFolderClick(folder)}
                                                >
                                                    <Folder className="w-10 h-10 text-blue-500" />
                                                    <span className="text-sm truncate w-full">{folder.name}</span>
                                                </Button>
                                                <Button size="sm" className="absolute top-1 right-1 h-7 text-xs" onClick={() => handleSelectFolder(folder)}>
                                                    Importar
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {videos.length > 0 && (
                                <div>
                                    <h3 className="font-semibold mb-2 dark:text-gray-300">Vídeos</h3>
                                    <div className="space-y-1">
                                        {videos.map(video => (
                                            <Button
                                                key={video.id}
                                                variant="ghost"
                                                className="w-full justify-start gap-3 dark:hover:bg-gray-700"
                                                onClick={() => handleSelectVideo(video)}
                                            >
                                                <FileVideo className="w-5 h-5 text-green-500" />
                                                <span>{video.name}</span>
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {folders.length === 0 && videos.length === 0 && (
                                <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                                    <p>Nenhum item encontrado nesta pasta.</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}