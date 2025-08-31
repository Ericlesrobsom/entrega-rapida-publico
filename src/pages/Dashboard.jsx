import React, { useState, useEffect, useCallback } from "react";
import { Product } from "@/api/entities";
import { Order } from "@/api/entities";
import { Deliverer } from "@/api/entities";
import { User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Package, 
  ShoppingCart, 
  Truck, 
  DollarSign,
  Clock
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

import StatsCard from "../components/dashboard/StatsCard";
import RecentOrders from "../components/dashboard/RecentOrders";
import TopProducts from "../components/dashboard/TopProducts";
import DeliverersStatus from "../components/dashboard/DeliverersStatus";

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [deliverers, setDeliverers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const navigate = useNavigate();

  const loadData = useCallback(async () => {
    try {
      const [productsData, ordersData, deliverersData] = await Promise.all([
        Product.list(),
        Order.list('-created_date'),
        Deliverer.list()
      ]);
      
      setProducts(productsData);
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
      // Verifica se o usuário é o admin pelo email
      if (user.email !== 'ericlesrobsom03@gmail.com') {
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

  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const calculateStats = () => {
    const today = new Date();
    const todayOrders = orders.filter(order => {
      const orderDate = new Date(order.created_date);
      return orderDate.toDateString() === today.toDateString();
    });

    const totalSales = todayOrders.reduce((sum, order) => sum + order.total_amount, 0);
    const pendingOrders = orders.filter(order => order.status === 'pendente').length;
    const activeProducts = products.filter(product => product.is_active).length;
    const availableDeliverers = deliverers.filter(deliverer => deliverer.status === 'disponivel').length;

    return {
      totalSales,
      pendingOrders,
      activeProducts,
      availableDeliverers,
      todayOrdersCount: todayOrders.length
    };
  };

  const stats = calculateStats();

  return (
    <div className="p-6 space-y-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Dashboard</h1>
          <p className="text-slate-600">Acompanhe o desempenho da sua loja</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Vendas Hoje"
            value={`R$ ${stats.totalSales.toFixed(2)}`}
            icon={DollarSign}
            trend={`${stats.todayOrdersCount} pedidos`}
            color="green"
          />
          <StatsCard
            title="Pedidos Pendentes"
            value={stats.pendingOrders}
            icon={Clock}
            trend="Requer atenção"
            color="orange"
          />
          <StatsCard
            title="Produtos Ativos"
            value={stats.activeProducts}
            icon={Package}
            trend="No catálogo"
            color="blue"
          />
          <StatsCard
            title="Entregadores Disponíveis"
            value={stats.availableDeliverers}
            icon={Truck}
            trend={`de ${deliverers.length} total`}
            color="purple"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <RecentOrders orders={orders} loading={loading} />
            <TopProducts products={products} loading={loading} />
          </div>
          
          <div>
            <DeliverersStatus deliverers={deliverers} loading={loading} />
          </div>
        </div>
      </div>
    </div>
  );
}