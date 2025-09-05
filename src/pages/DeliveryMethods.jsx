
import React, { useState, useEffect, useCallback } from "react";
import { DeliveryMethod } from "@/api/entities";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Toaster, toast } from 'sonner';

import DeliveryMethodForm from "../components/deliveryMethods/DeliveryMethodForm";
import DeliveryMethodList from "../components/deliveryMethods/DeliveryMethodList";

export default function DeliveryMethods() {
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMethod, setEditingMethod] = useState(null);
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
      const data = await DeliveryMethod.list('-created_date');
      setMethods(data);
    } catch (error) {
      console.error("Erro ao carregar métodos de entrega:", error);
      toast.error("Erro ao carregar métodos de entrega.");
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

  const handleSubmit = async (methodData) => {
    try {
      if (editingMethod) {
        await DeliveryMethod.update(editingMethod.id, methodData);
        toast.success("Método de entrega atualizado com sucesso!");
      } else {
        await DeliveryMethod.create(methodData);
        toast.success("Método de entrega criado com sucesso!");
      }
      
      setShowForm(false);
      setEditingMethod(null);
      await loadData();
    } catch (error) {
      console.error("Erro ao salvar método:", error);
      toast.error("Erro ao salvar método de entrega.");
    }
  };

  const handleEdit = (method) => {
    setEditingMethod(method);
    setShowForm(true);
  };

  const handleDelete = async (method) => {
    // Adicionar verificação de produtos vinculados aqui se necessário
    if (window.confirm(`Tem certeza que deseja excluir o método "${method.name}"?`)) {
      try {
        await DeliveryMethod.delete(method.id);
        toast.success("Método de entrega excluído com sucesso!");
        await loadData();
      } catch (error) {
        console.error("Erro ao excluir método:", error);
        toast.error("Erro ao excluir método de entrega. Verifique se ele não está em uso.");
      }
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
            <h1 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Métodos de Entrega</h1>
            <p className={`${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>Gerencie como seus produtos serão entregues.</p>
          </div>
          <Button 
            onClick={() => {
              setEditingMethod(null);
              setShowForm(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 shadow-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Novo Método
          </Button>
        </div>

        {showForm && (
          <DeliveryMethodForm
            method={editingMethod}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingMethod(null);
            }}
            darkMode={darkMode}
          />
        )}

        <DeliveryMethodList
          methods={methods}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          darkMode={darkMode}
        />
      </div>
    </div>
  );
}
