
import React, { useState, useEffect, useCallback } from 'react';
import { SocialLink } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import LinkForm from '../components/socialLinks/LinkForm';
import LinkList from '../components/socialLinks/LinkList';

export default function SocialLinks() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingLink, setEditingLink] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Initial check for dark mode
    const isDark = document.documentElement.classList.contains('dark');
    setDarkMode(isDark);

    // Observe changes to the 'class' attribute on the html element
    const observer = new MutationObserver(() => {
      setDarkMode(document.documentElement.classList.contains('dark'));
    });

    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    // Clean up the observer when the component unmounts
    return () => observer.disconnect();
  }, []); // Empty dependency array means this runs once on mount and cleans up on unmount

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await SocialLink.list('sort_order');
      setLinks(data);
    } catch (error) {
      toast.error('Erro ao carregar os links.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmit = async (formData) => {
    try {
      if (editingLink) {
        await SocialLink.update(editingLink.id, formData);
        toast.success('Link atualizado com sucesso!');
      } else {
        await SocialLink.create(formData);
        toast.success('Link criado com sucesso!');
      }
      setShowForm(false);
      setEditingLink(null);
      await loadData();
    } catch (error) {
      toast.error('Erro ao salvar o link.');
      console.error(error);
    }
  };

  const handleEdit = (link) => {
    setEditingLink(link);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este link?')) {
      try {
        await SocialLink.delete(id);
        toast.success('Link excluído com sucesso!');
        await loadData();
      } catch (error) {
        toast.error('Erro ao excluir o link.');
        console.error(error);
      }
    }
  };

  const handleToggleStatus = async (link) => {
    try {
      await SocialLink.update(link.id, { is_active: !link.is_active });
      toast.success(`Link ${link.is_active ? 'desativado' : 'ativado'}.`);
      await loadData();
    } catch (error) {
      toast.error('Erro ao alterar o status do link.');
      console.error(error);
    }
  };

  return (
    <div className={`p-6 space-y-6 min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-slate-50 to-blue-50'}`}>
      <Toaster richColors position="top-right" />
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Links de Divulgação</h1>
            <p className={`${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>Gerencie os links que aparecerão na sua página pública.</p>
          </div>
          <Button 
            onClick={() => {
              setEditingLink(null);
              setShowForm(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 shadow-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Novo Link
          </Button>
        </div>

        {showForm && (
          <LinkForm
            link={editingLink}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingLink(null);
            }}
            darkMode={darkMode}
          />
        )}

        <LinkList
          links={links}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
          darkMode={darkMode}
        />
      </div>
    </div>
  );
}
