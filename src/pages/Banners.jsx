
import React, { useState, useEffect, useCallback } from "react";
import { Banner } from "@/api/entities";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import BannerForm from "../components/banners/BannerForm";
import { Toaster, toast } from 'sonner';
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Edit } from "lucide-react";

function BannerList({ banners, onEdit, onToggleStatus, loading }) {
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
      <Card key={banner.id} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-4">
            <img src={banner.image_url} alt={banner.title || "Banner"} className="w-full h-40 object-cover rounded-lg mb-4" />
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-slate-950 text-lg font-semibold">{banner.title || "Banner sem título"}</h3>
                <p className="text-sm text-slate-600">{banner.subtitle}</p>
                {banner.link_url && <p className="text-xs text-blue-600">Link: {banner.link_url}</p>}
              </div>
              <div className="flex flex-col items-end gap-3">
                <div className="flex items-center space-x-2">
                  <Switch
                  id={`active-${banner.id}`}
                  checked={banner.is_active}
                  onCheckedChange={(checked) => onToggleStatus(banner, checked)} />

                  <Label htmlFor={`active-${banner.id}`} className="text-slate-950 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 dark:text-slate-200">Ativo</Label>
                </div>
                <Button variant="outline" size="sm" onClick={() => onEdit(banner)} className="dark:bg-transparent dark:hover:bg-slate-100 dark:text-slate-800 dark:border-slate-300">
                  <Edit className="w-4 h-4 mr-2" /> Editar
                </Button>
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
  const navigate = useNavigate();

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
      if (user.email !== 'ericlesrobsom03@gmail.com') {
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
      <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Gerenciar Banners</h1>
              <p className="text-slate-600">Adicione e edite os banners da página inicial.</p>
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

          <BannerList banners={banners} onEdit={handleEdit} onToggleStatus={handleToggleStatus} loading={loading} />
        </div>
      </div>
    </>);

}
