import React, { useState, useEffect, useCallback } from "react";
import { GlobalOffer } from "@/api/entities";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Toaster, toast } from 'sonner';

import GlobalOfferForm from "../components/globalOffers/GlobalOfferForm";
import GlobalOfferList from "../components/globalOffers/GlobalOfferList";

export default function GlobalOffers() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
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

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await GlobalOffer.list('-created_date');
      setOffers(data);
    } catch (error) {
      console.error("Erro ao carregar ofertas:", error);
      toast.error("Erro ao carregar ofertas.");
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
      await loadData();
    } catch (error) {
      await User.loginWithRedirect(window.location.href);
    } finally {
      setCheckingAuth(false);
    }
  }, [navigate, loadData]);

  useEffect(() => {
    checkAdminAccess();
  }, [checkAdminAccess]);

  const handleSubmit = async (offerData) => {
    try {
      if (editingOffer) {
        await GlobalOffer.update(editingOffer.id, offerData);
        toast.success("Oferta atualizada com sucesso!");
      } else {
        await GlobalOffer.create(offerData);
        toast.success("Oferta criada com sucesso!");
      }
      
      setShowForm(false);
      setEditingOffer(null);
      await loadData();
    } catch (error) {
      console.error("Erro ao salvar oferta:", error);
      toast.error("Erro ao salvar oferta.");
    }
  };

  const handleEdit = (offer) => {
    setEditingOffer(offer);
    setShowForm(true);
  };

  const handleDelete = async (offer) => {
    if (window.confirm(`Tem certeza que deseja excluir a oferta "${offer.title}"?`)) {
      try {
        await GlobalOffer.delete(offer.id);
        toast.success("Oferta excluída com sucesso!");
        await loadData();
      } catch (error) {
        console.error("Erro ao excluir oferta:", error);
        toast.error("Erro ao excluir oferta.");
      }
    }
  };

  const handleToggleStatus = async (offer) => {
    try {
      await GlobalOffer.update(offer.id, { is_active: !offer.is_active });
      toast.success(`Oferta ${offer.is_active ? 'desativada' : 'ativada'} com sucesso!`);
      await loadData();
    } catch (error) {
      console.error("Erro ao alterar status:", error);
      toast.error("Erro ao alterar status da oferta.");
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
    <div className={`p-6 space-y-6 min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-slate-50 to-blue-50'}`}>
      <Toaster richColors position="top-right" />
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Ofertas Globais</h1>
            <p className={`${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>Crie e gerencie ofertas direcionadas para clientes específicos.</p>
          </div>
          <Button 
            onClick={() => {
              setEditingOffer(null);
              setShowForm(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 shadow-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nova Oferta Global
          </Button>
        </div>

        {showForm && (
          <GlobalOfferForm
            offer={editingOffer}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingOffer(null);
            }}
          />
        )}

        <GlobalOfferList
          offers={offers}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
        />
      </div>
    </div>
  );
}