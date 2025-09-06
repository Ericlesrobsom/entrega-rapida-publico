import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Folder, FileVideo, ArrowLeft, Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { snuxApi } from '@/api/functions';

export default function FolderNavigator({ courseId, onImportComplete, onCancel }) {
    const [folders, setFolders] = useState([]);
    const [currentFolder, setCurrentFolder] = useState(null);
    const [folderContent, setFolderContent] = useState({ folders: [], files: [] });
    const [loading, setLoading] = useState(false);
    const [importing, setImporting] = useState(false);
    const [breadcrumb, setBreadcrumb] = useState([{ id: null, name: 'Início' }]);

    useEffect(() => {
        loadRootFolders();
    }, []);

    const loadRootFolders = async () => {
        setLoading(true);
        try {
            const { data } = await snuxApi({ action: 'getRootFolders' });
            setFolders(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Erro ao carregar pastas:', error);
            toast.error('Erro ao carregar pastas da API');
        } finally {
            setLoading(false);
        }
    };

    const loadFolderContent = async (folderId, folderName) => {
        setLoading(true);
        try {
            const { data } = await snuxApi({ 
                action: 'getFolderContent',
                folderId: folderId 
            });
            
            setCurrentFolder({ id: folderId, name: folderName });
            setFolderContent(data);
            setBreadcrumb(prev => [...prev, { id: folderId, name: folderName }]);
        } catch (error) {
            console.error('Erro ao carregar conteúdo:', error);
            toast.error('Erro ao carregar conteúdo da pasta');
        } finally {
            setLoading(false);
        }
    };

    const goBack = () => {
        if (breadcrumb.length > 1) {
            const newBreadcrumb = breadcrumb.slice(0, -1);
            setBreadcrumb(newBreadcrumb);
            
            const parent = newBreadcrumb[newBreadcrumb.length - 1];
            if (parent.id === null) {
                // Voltar para a raiz
                setCurrentFolder(null);
                setFolderContent({ folders: [], files: [] });
            } else {
                // Carregar pasta pai
                loadFolderContent(parent.id, parent.name);
            }
        }
    };

    const importFolder = async (folderId, folderName) => {
        setImporting(true);
        try {
            const { data } = await snuxApi({
                action: 'importFolderAsModule',
                method: 'POST',
                body: JSON.stringify({
                    courseId,
                    folderId,
                    folderName
                })
            });

            toast.success(data.message);
            onImportComplete();
        } catch (error) {
            console.error('Erro na importação:', error);
            toast.error('Erro ao importar pasta como módulo');
        } finally {
            setImporting(false);
        }
    };

    return (
        <>
            {/* Overlay */}
            <div className="fixed inset-0 bg-black/60 z-40" onClick={onCancel}></div>
            
            {/* Modal */}
            <Card className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl z-50 shadow-2xl bg-white dark:bg-slate-900 max-h-[80vh] overflow-hidden">
                <CardHeader className="border-b">
                    <div className="flex items-center justify-between">
                        <CardTitle>Navegar e Importar Conteúdo</CardTitle>
                        <Button variant="ghost" onClick={onCancel}>×</Button>
                    </div>
                    
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        {breadcrumb.map((item, index) => (
                            <React.Fragment key={item.id || 'root'}>
                                {index > 0 && <span>/</span>}
                                <button
                                    onClick={() => {
                                        if (index < breadcrumb.length - 1) {
                                            // Navegar de volta para este nível
                                            const newBreadcrumb = breadcrumb.slice(0, index + 1);
                                            setBreadcrumb(newBreadcrumb);
                                            if (item.id === null) {
                                                setCurrentFolder(null);
                                                setFolderContent({ folders: [], files: [] });
                                            } else {
                                                loadFolderContent(item.id, item.name);
                                            }
                                        }
                                    }}
                                    className={`hover:text-blue-600 ${
                                        index === breadcrumb.length - 1 ? 'font-semibold' : ''
                                    }`}
                                >
                                    {item.name}
                                </button>
                            </React.Fragment>
                        ))}
                    </div>
                </CardHeader>

                <CardContent className="p-6 overflow-y-auto max-h-[60vh]">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin" />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Botão Voltar */}
                            {breadcrumb.length > 1 && (
                                <Button variant="outline" onClick={goBack} className="mb-4">
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Voltar
                                </Button>
                            )}

                            {/* Lista de pastas na raiz */}
                            {!currentFolder && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {folders.map((folder) => (
                                        <Card key={folder.id} className="hover:shadow-md transition-shadow cursor-pointer">
                                            <CardContent className="p-4">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <Folder className="w-8 h-8 text-blue-500" />
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-medium truncate">{folder.name}</h3>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button 
                                                        size="sm" 
                                                        variant="outline"
                                                        onClick={() => loadFolderContent(folder.id, folder.name)}
                                                    >
                                                        Explorar
                                                    </Button>
                                                    <Button 
                                                        size="sm"
                                                        onClick={() => importFolder(folder.id, folder.name)}
                                                        disabled={importing}
                                                    >
                                                        {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                                                        Importar
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}

                            {/* Conteúdo da pasta atual */}
                            {currentFolder && (
                                <div className="space-y-6">
                                    {/* Subpastas */}
                                    {folderContent.folders && folderContent.folders.length > 0 && (
                                        <div>
                                            <h3 className="font-semibold mb-3">📁 Pastas</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {folderContent.folders.map((folder) => (
                                                    <Card key={folder.id} className="hover:shadow-md transition-shadow">
                                                        <CardContent className="p-4">
                                                            <div className="flex items-center gap-3 mb-3">
                                                                <Folder className="w-6 h-6 text-blue-500" />
                                                                <h4 className="font-medium flex-1 truncate">{folder.name}</h4>
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <Button 
                                                                    size="sm" 
                                                                    variant="outline"
                                                                    onClick={() => loadFolderContent(folder.id, folder.name)}
                                                                >
                                                                    Explorar
                                                                </Button>
                                                                <Button 
                                                                    size="sm"
                                                                    onClick={() => importFolder(folder.id, folder.name)}
                                                                    disabled={importing}
                                                                >
                                                                    {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                                                                    Importar
                                                                </Button>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Arquivos de vídeo */}
                                    {folderContent.files && folderContent.files.length > 0 && (
                                        <div>
                                            <div className="flex items-center justify-between mb-3">
                                                <h3 className="font-semibold">🎬 Vídeos ({folderContent.files.length} arquivos)</h3>
                                                <Button 
                                                    onClick={() => importFolder(currentFolder.id, currentFolder.name)}
                                                    disabled={importing}
                                                >
                                                    {importing ? (
                                                        <>
                                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                            Importando...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Download className="w-4 h-4 mr-2" />
                                                            Importar Todos os Vídeos
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {folderContent.files.map((file) => (
                                                    <div key={file.id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                                        <FileVideo className="w-5 h-5 text-green-600" />
                                                        <span className="flex-1 truncate text-sm">{file.name}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Pasta vazia */}
                                    {(!folderContent.folders || folderContent.folders.length === 0) && 
                                     (!folderContent.files || folderContent.files.length === 0) && (
                                        <div className="text-center py-12 text-slate-500">
                                            <Folder className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                            <p>Esta pasta está vazia</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Nenhuma pasta na raiz */}
                            {!currentFolder && folders.length === 0 && !loading && (
                                <div className="text-center py-12 text-slate-500">
                                    <Folder className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                    <p>Nenhuma pasta encontrada na sua API</p>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </>
    );
}