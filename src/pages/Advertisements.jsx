
import React, { useState, useEffect, useCallback } from "react";
import { Advertisement } from "@/api/entities";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Toaster, toast } from 'sonner';

import AdvertisementForm from "../components/advertisements/AdvertisementForm";
import AdvertisementList from "../components/advertisements/AdvertisementList";

export default function Advertisements() {
  const [advertisements, setAdvertisements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAd, setEditingAd] = useState(null);
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

  const loadAdvertisements = useCallback(async () => {
    try {
      const data = await Advertisement.list('-priority', 50);
      setAdvertisements(data);
    } catch (error) {
      console.error("Erro ao carregar anúncios:", error);
      toast.error("Erro ao carregar anúncios.");
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
      await loadAdvertisements();
    } catch (error) {
      await User.loginWithRedirect(window.location.href);
    } finally {
      setCheckingAuth(false);
    }
  }, [navigate, loadAdvertisements]);

  useEffect(() => {
    checkAdminAccess();
  }, [checkAdminAccess]);

  const handleSubmit = async (adData) => {
    try {
      if (editingAd) {
        await Advertisement.update(editingAd.id, adData);
        toast.success("Anúncio atualizado com sucesso!");
      } else {
        await Advertisement.create(adData);
        toast.success("Anúncio criado com sucesso!");
      }
      
      setShowForm(false);
      setEditingAd(null);
      await loadAdvertisements();
    } catch (error) {
      console.error("Erro ao salvar anúncio:", error);
      toast.error("Erro ao salvar anúncio.");
    }
  };

  const handleEdit = (ad) => {
    setEditingAd(ad);
    setShowForm(true);
  };

  const handleDelete = async (ad) => {
    const confirmed = window.confirm("Tem certeza que deseja excluir este anúncio?");
    if (!confirmed) return;

    try {
      await Advertisement.delete(ad.id);
      toast.success("Anúncio excluído com sucesso!");
      await loadAdvertisements();
    } catch (error) {
      console.error("Erro ao excluir anúncio:", error);
      toast.error("Erro ao excluir anúncio.");
    }
  };

  const handleToggleStatus = async (ad) => {
    try {
      await Advertisement.update(ad.id, { is_active: !ad.is_active });
      toast.success(`Anúncio ${ad.is_active ? 'desativado' : 'ativado'} com sucesso!`);
      await loadAdvertisements();
    } catch (error) {
      console.error("Erro ao alterar status:", error);
      toast.error("Erro ao alterar status do anúncio.");
    }
  };

  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <Toaster richColors position="top-right" />
      <div className={`p-6 space-y-6 min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-slate-50 to-blue-50'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Anúncios e Promoções</h1>
              <p className={`${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>Gerencie banners promocionais que aparecem na loja</p>
            </div>
            <Button 
              onClick={() => {
                setEditingAd(null);
                setShowForm(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 shadow-lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Novo Anúncio
            </Button>
          </div>

          {showForm && (
            <AdvertisementForm
              advertisement={editingAd}
              onSubmit={handleSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingAd(null);
              }}
            />
          )}

          <AdvertisementList
            advertisements={advertisements}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleStatus={handleToggleStatus}
          />
        </div>
      </div>
    </>
  );
}
