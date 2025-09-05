
import React, { useState, useEffect, useCallback } from "react";
import { Order } from "@/api/entities";
import { Deliverer } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/api/entities";

import OrderForm from "../components/orders/OrderForm";
import OrdersList from "../components/orders/OrdersList";
import OrderFilters from "../components/orders/OrderFilters";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [deliverers, setDeliverers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [filters, setFilters] = useState({ status: "all" });
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
    try {
      const [ordersData, deliverersData] = await Promise.all([
        Order.list('-created_date', 100), // Limita aos 100 pedidos mais recentes
        Deliverer.list()
      ]);
      setOrders(ordersData);
      setDeliverers(deliverersData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const checkAdminAccess = useCallback(async () => {
    try {
      const user = await User.me();
      // Verifica se o usuário é admin pela função (role)
      if (user.role !== 'admin') {
        navigate(createPageUrl("Store"));
        return;
      }
      await loadData();
    } catch (error) {
      console.error("Erro ao verificar acesso admin:", error);
      await User.loginWithRedirect(window.location.href);
    } finally {
      setCheckingAuth(false);
    }
  }, [navigate, loadData]);

  useEffect(() => {
    checkAdminAccess();
  }, [checkAdminAccess]);

  const handleSubmit = async (orderData) => {
    try {
      if (editingOrder) {
        await Order.update(editingOrder.id, orderData);
      } else {
        await Order.create(orderData);
      }
      setShowForm(false);
      setEditingOrder(null);
      loadData();
    } catch (error) {
      console.error("Erro ao salvar pedido:", error);
    }
  };

  const handleStatusChange = async (orderId, newStatus, delivererId = null) => {
    try {
      const updateData = { status: newStatus };
      if (delivererId) {
        updateData.deliverer_id = delivererId;
      }
      await Order.update(orderId, updateData);
      loadData();
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
    }
  };

  const filteredOrders = orders.filter(order => {
    return filters.status === "all" || order.status === filters.status;
  });

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
            <h1 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Pedidos</h1>
            <p className={`${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>Gerencie os pedidos da sua loja (exibindo os 100 mais recentes)</p>
          </div>
          <Button 
            onClick={() => {
              setEditingOrder(null);
              setShowForm(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 shadow-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Novo Pedido
          </Button>
        </div>

        <OrderFilters filters={filters} onFiltersChange={setFilters} darkMode={darkMode} />

        {showForm && (
          <OrderForm
            order={editingOrder}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingOrder(null);
            }}
            darkMode={darkMode}
          />
        )}

        <OrdersList
          orders={filteredOrders}
          deliverers={deliverers}
          loading={loading}
          onEdit={(order) => { setEditingOrder(order); setShowForm(true); }}
          onStatusChange={handleStatusChange}
          darkMode={darkMode}
        />
      </div>
    </div>
  );
}
