
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoreVertical, Edit, Trash2, ToggleLeft, ToggleRight, Link as LinkIcon, Send, Instagram, Facebook, Youtube, Twitter, Linkedin, Twitch, Github, Gitlab } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const iconMap = {
  Send: Send,
  Instagram: Instagram,
  Facebook: Facebook,
  Youtube: Youtube,
  Link: LinkIcon,
  Twitter: Twitter,
  Linkedin: Linkedin,
  Twitch: Twitch,
  Github: Github,
  Gitlab: Gitlab,
  default: LinkIcon,
};

const getIconByName = (iconName) => {
  return iconMap[iconName] || iconMap.default;
};

export default function LinkList({ links, loading, onEdit, onDelete, onToggleStatus, darkMode }) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  if (links.length === 0) {
    return (
      <div className={`text-center py-12 border-2 border-dashed rounded-lg ${darkMode ? 'border-gray-700 bg-gray-800' : ''}`}>
        <LinkIcon className={`w-12 h-12 mx-auto mb-4 ${darkMode ? 'text-gray-400' : 'text-slate-400'}`} />
        <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-slate-700'}`}>Nenhum link cadastrado</h3>
        <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>Clique em "Novo Link" para começar a adicionar.</p>
      </div>
    );
  }

  return (
    <Card className={`border-0 shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white/80 backdrop-blur-sm'}`}>
      <CardHeader>
        <CardTitle className={darkMode ? 'text-white' : ''}>Links Criados</CardTitle>
        <CardDescription className={darkMode ? 'text-gray-400' : ''}>
          Arraste para reordenar os links. O primeiro da lista aparecerá no topo.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className={darkMode ? 'border-gray-700' : ''}>
              <TableHead className={`w-16 ${darkMode ? 'text-gray-300' : ''}`}></TableHead>
              <TableHead className={darkMode ? 'text-gray-300' : ''}>Título</TableHead>
              <TableHead className={darkMode ? 'text-gray-300' : ''}>URL</TableHead>
              <TableHead className={darkMode ? 'text-gray-300' : ''}>Status</TableHead>
              <TableHead className={`text-right ${darkMode ? 'text-gray-300' : ''}`}>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {links.map((link) => {
              const Icon = getIconByName(link.icon);
              return (
                <TableRow key={link.id} className={darkMode ? 'border-gray-700' : ''}>
                  <TableCell>
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${darkMode ? 'bg-gray-700' : 'bg-slate-100'}`}>
                      <Icon className={`w-5 h-5 ${darkMode ? 'text-gray-300' : 'text-slate-600'}`} />
                    </div>
                  </TableCell>
                  <TableCell className={`font-medium ${darkMode ? 'text-white' : 'text-slate-900'}`}>{link.title}</TableCell>
                  <TableCell className="max-w-sm truncate">
                    <a href={link.url} target="_blank" rel="noopener noreferrer" className={darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}>
                      {link.url}
                    </a>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={link.is_active ? 'default' : 'secondary'}
                      className={link.is_active ? (darkMode ? 'bg-green-800/80 text-green-200' : 'bg-green-100 text-green-800') : (darkMode ? 'bg-red-800/80 text-red-200' : 'bg-red-100 text-red-800')}
                    >
                      {link.is_active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => onToggleStatus(link)} title={link.is_active ? 'Desativar' : 'Ativar'}>
                      {link.is_active ? <ToggleLeft className={`w-5 h-5 ${darkMode ? 'text-gray-300' : ''}`}/> : <ToggleRight className={`w-5 h-5 ${darkMode ? 'text-gray-300' : ''}`}/>}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onEdit(link)} title="Editar">
                      <Edit className={`w-4 h-4 ${darkMode ? 'text-gray-300' : ''}`} />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(link.id)} title="Excluir">
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
