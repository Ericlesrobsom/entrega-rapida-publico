
import React, { useState, useEffect, useCallback } from "react";
import { Deliverer } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/api/entities";

import DelivererForm from "../components/deliverers/DelivererForm";
import DeliverersList from "../components/deliverers/DeliverersList";

export default function Deliverers() {
  const [deliverers, setDeliverers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingDeliverer, setEditingDeliverer] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
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

  // loadDeliverers is now memoized using useCallback
  const loadDeliverers = useCallback(async () => {
    setLoading(true); // Ensure loading state is true when fetching data
    try {
      const data = await Deliverer.list('-created_date');
      setDeliverers(data);
    } catch (error) {
      console.error("Erro ao carregar entregadores:", error);
    } finally {
      setLoading(false);
    }
  }, []); // Dependencies for loadDeliverers

  // checkAdminAccess is now memoized using useCallback
  const checkAdminAccess = useCallback(async () => {
    try {
      const user = await User.me();
      // Verifica se o usuário é admin pela função (role)
      if (user.role !== 'admin') {
        navigate(createPageUrl("Store"));
        return;
      }
      // Only load deliverers if user is admin
      await loadDeliverers();
    } catch (error) {
      // If there's an error (e.g., not logged in or session expired), redirect to login
      await User.loginWithRedirect(window.location.href);
    } finally {
      setCheckingAuth(false); // Auth check completed
    }
  }, [navigate, loadDeliverers]); // Dependencies for checkAdminAccess

  useEffect(() => {
    checkAdminAccess(); // Call auth check on mount
  }, [checkAdminAccess]); // Now depends on the memoized checkAdminAccess

  const handleSubmit = async (delivererData) => {
    try {
      if (editingDeliverer) {
        await Deliverer.update(editingDeliverer.id, delivererData);
      } else {
        await Deliverer.create(delivererData);
      }
      setShowForm(false);
      setEditingDeliverer(null);
      loadDeliverers();
    } catch (error) {
      console.error("Erro ao salvar entregador:", error);
    }
  };

  const handleEdit = (deliverer) => {
    setEditingDeliverer(deliverer);
    setShowForm(true);
  };

  const handleStatusChange = async (delivererId, newStatus) => {
    try {
      await Deliverer.update(delivererId, { status: newStatus });
      loadDeliverers();
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
    }
  };

  const filteredDeliverers = deliverers.filter(deliverer => {
    const matchesSearch = deliverer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deliverer.phone.includes(searchTerm);
    const matchesStatus = statusFilter === "all" || deliverer.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Display loading spinner while checking authentication
  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`p-6 space-y-6 min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-slate-50 to-blue-50'}`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Entregadores</h1>
            <p className={`${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>Gerencie sua equipe de entrega</p>
          </div>
          <Button
            onClick={() => {
              setEditingDeliverer(null);
              setShowForm(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 shadow-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Novo Entregador
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Buscar entregadores..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`pl-10 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white'}`}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className={`w-full md:w-48 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white'}`}>
              <SelectValue placeholder="Filtrar status" />
            </SelectTrigger>
            <SelectContent className={`${darkMode ? 'bg-gray-800 border-gray-700 text-white' : ''}`}>
              <SelectItem value="all">Todos Status</SelectItem>
              <SelectItem value="disponivel">Disponível</SelectItem>
              <SelectItem value="ocupado">Ocupado</SelectItem>
              <SelectItem value="inativo">Inativo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {showForm && (
          <DelivererForm
            deliverer={editingDeliverer}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingDeliverer(null);
            }}
            darkMode={darkMode}
          />
        )}

        <DeliverersList
          deliverers={filteredDeliverers}
          loading={loading}
          onEdit={handleEdit}
          onStatusChange={handleStatusChange}
          darkMode={darkMode}
        />
      </div>
    </div>
  );
}
