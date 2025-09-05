
import React, { useState, useEffect, useCallback } from "react";
import { Banner } from "@/api/entities";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Plus, Edit, MoreVertical, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import BannerForm from "../components/banners/BannerForm";
import { Toaster, toast } from 'sonner';
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


function BannerList({ banners, onEdit, onToggleStatus, loading, onDelete }) {
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
    return <p>Carregando banners...</p>;
  }

  if (banners.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold text-slate-900 mb-2">Nenhum banner encontrado</h3>
        <p className="text-slate-600">Clique em "Novo Banner" para adicionar seu primeiro banner.</p>
      </div>);
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {banners.map((banner) =>
        <Card key={banner.id} className={`border-0 shadow-lg relative group ${darkMode ? 'bg-gray-800/90 text-white' : 'bg-white/80 backdrop-blur-sm'}`}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className={`absolute top-2 right-2 z-10 h-8 w-8 rounded-full ${darkMode ? 'bg-gray-700/80 hover:bg-gray-600/90' : 'bg-white/70 hover:bg-white'}`}>
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className={darkMode ? 'bg-gray-900 border-gray-700 text-white' : ''}>
              <DropdownMenuItem onClick={() => onEdit(banner)}>
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onToggleStatus(banner, !banner.is_active)}>
                 {banner.is_active ? (
                    <>
                      <ToggleLeft className="w-4 h-4 mr-2" /> Desativar
                    </>
                  ) : (
                    <>
                      <ToggleRight className="w-4 h-4 mr-2" /> Ativar
                    </>
                  )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onDelete(banner)} className="text-red-500 focus:text-red-500 focus:bg-red-50 dark:focus:bg-red-900/50">
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <CardContent className="p-4">
            <img src={banner.image_url} alt={banner.title || "Banner"} className="w-full h-40 object-cover rounded-lg mb-4" />
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">{banner.title || "Banner sem título"}</h3>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>{banner.subtitle}</p>
                {banner.link_url && <p className="text-xs text-blue-500 hover:text-blue-400">{banner.link_url}</p>}
              </div>
               <div className="flex items-center space-x-2 mt-2">
                  <Switch
                  id={`active-${banner.id}`}
                  checked={banner.is_active}
                  onCheckedChange={(checked) => onToggleStatus(banner, checked)} />
                  <Label htmlFor={`active-${banner.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    {banner.is_active ? 'Ativo' : 'Inativo'}
                  </Label>
                </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>);
}


export default function Banners() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setDarkMode(isDark);
    const observer = new MutationObserver(() => {
      setDarkMode(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const loadBanners = useCallback(async () => {
    setLoading(true);
    try {
      const data = await Banner.list('-created_date');
      setBanners(data);
    } catch (error) {
      toast.error("Erro ao carregar banners.");
    } finally {
      setLoading(false);
    }
  }, []);

  const checkAdminAccess = useCallback(async () => {
    try {
      const user = await User.me();
      if (user.role !== 'admin') {
        navigate(createPageUrl("Store"));
        return;
      }
      await loadBanners();
    } catch (error) {
      await User.loginWithRedirect(window.location.href);
    } finally {
      setCheckingAuth(false);
    }
  }, [navigate, loadBanners]);

  useEffect(() => {
    checkAdminAccess();
  }, [checkAdminAccess]);

  const handleSubmit = async (bannerData) => {
    try {
      if (editingBanner) {
        await Banner.update(editingBanner.id, bannerData);
        toast.success("Banner atualizado com sucesso!");
      } else {
        await Banner.create(bannerData);
        toast.success("Banner criado com sucesso!");
      }
      setShowForm(false);
      setEditingBanner(null);
      await loadBanners();
    } catch (error) {
      toast.error("Erro ao salvar o banner.");
    }
  };
  
  const handleDelete = async (banner) => {
    if (window.confirm(`Tem certeza que deseja excluir permanentemente o banner "${banner.title || 'sem título'}"?`)) {
        try {
            await Banner.delete(banner.id);
            toast.success("Banner excluído com sucesso!");
            await loadBanners();
        } catch (error) {
            console.error("Erro ao excluir banner", error);
            toast.error("Erro ao excluir o banner.");
        }
    }
  };

  const handleEdit = (banner) => {
    setEditingBanner(banner);
    setShowForm(true);
  };

  const handleToggleStatus = async (banner, isActive) => {
    try {
      await Banner.update(banner.id, { is_active: isActive });
      toast.success(`Banner ${isActive ? 'ativado' : 'desativado'}.`);
      await loadBanners();
    } catch (error) {
      toast.error("Erro ao alterar o status do banner.");
    }
  };

  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>);

  }

  return (
    <>
      <Toaster richColors position="top-right" />
      <div className={`p-6 space-y-6 min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-slate-50 to-blue-50'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Gerenciar Banners</h1>
              <p className={`${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>Adicione e edite os banners da página inicial.</p>
            </div>
            <Button onClick={() => {setEditingBanner(null);setShowForm(true);}} className="bg-blue-600 hover:bg-blue-700 shadow-lg">
              <Plus className="w-5 h-5 mr-2" /> Novo Banner
            </Button>
          </div>

          {showForm &&
          <BannerForm
            banner={editingBanner}
            onSubmit={handleSubmit}
            onCancel={() => {setShowForm(false);setEditingBanner(null);}} />

          }

          <BannerList banners={banners} onEdit={handleEdit} onToggleStatus={handleToggleStatus} loading={loading} onDelete={handleDelete} />
        </div>
      </div>
    </>);

}
