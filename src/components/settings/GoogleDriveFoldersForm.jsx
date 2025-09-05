import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Save, FolderKanban } from "lucide-react";

export default function GoogleDriveFoldersForm({ initialSettings, onSave, isSaving }) {
  const [rootFolders, setRootFolders] = useState("");

  useEffect(() => {
    if (initialSettings && initialSettings.google_drive_root_folders) {
      setRootFolders(initialSettings.google_drive_root_folders);
    }
  }, [initialSettings]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ google_drive_root_folders: rootFolders });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg dark:bg-slate-800/80 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
            <FolderKanban className="w-6 h-6 text-indigo-500" />
            Pastas Principais do Google Drive
          </CardTitle>
          <CardDescription className="dark:text-slate-400">
            Defina quais pastas devem aparecer como ponto de partida no seletor de vídeos.
            Isso resolve problemas de permissão e facilita a navegação.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="root_folders" className="dark:text-slate-300">IDs das Pastas Raiz</Label>
            <Textarea
              id="root_folders"
              value={rootFolders}
              onChange={e => setRootFolders(e.target.value)}
              placeholder="Cole os IDs das pastas aqui, um por linha ou separados por vírgula."
              rows={5}
              className="dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Exemplo: 1GKeBBe37fzImbhJdM9YZgXKZyNh6opS3
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isSaving}>
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Salvando..." : "Salvar Pastas"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}