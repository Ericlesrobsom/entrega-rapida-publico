
import React, { useState, useEffect } from 'react';
import { Order } from "@/api/entities";
import { User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Package, Clock, CheckCircle, Truck, X, PlayCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const getStatusBadge = (status, darkMode) => {
  const statusConfig = {
    'pendente': { color: 'bg-yellow-500', text: 'Pendente', icon: Clock },
    'confirmado': { color: 'bg-blue-500', text: 'Confirmado', icon: CheckCircle },
    'preparando': { color: 'bg-purple-500', text: 'Preparando', icon: Package },
    'saiu_entrega': { color: 'bg-orange-500', text: 'Saiu para Entrega', icon: Truck },
    'entregue': { color: 'bg-green-500', text: 'Entregue', icon: CheckCircle },
    'cancelado': { color: 'bg-red-500', text: 'Cancelado', icon: X }
  };

  const config = statusConfig[status] || statusConfig['pendente'];
  const Icon = config.icon;

  return (
    <Badge className={`${config.color} text-white font-medium px-3 py-1`}>
      <Icon className="w-3 h-3 mr-1" />
      {config.text}
    </Badge>
  );
};

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  // CRÍTICO: Usar a mesma chave do localStorage que a Store usa
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode'); // MESMA CHAVE que Store.jsx usa
    if (savedDarkMode) {
      const isDark = JSON.parse(savedDarkMode);
      setDarkMode(isDark);
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }

    // Ouvir mudanças no localStorage para sincronizar
    const handleStorageChange = (e) => {
      if (e.key === 'darkMode') {
        const isDark = JSON.parse(e.newValue || 'false');
        setDarkMode(isDark);
        if (isDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    const fetchUserAndOrders = async () => {
      try {
        const currentUser = await User.me();
        setUser(currentUser);
        
        const userOrders = await Order.filter({ 
          customer_email: currentUser.email 
        }, '-created_date');
        
        setOrders(userOrders);
      } catch (error) {
        console.error("Erro ao carregar pedidos:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndOrders();
  }, []);

  const handleLogin = async () => {
    try {
      await User.loginWithRedirect(window.location.href);
    } catch (error) {
      console.error("Erro ao fazer login:", error);
    }
  };

  const formatPrice = (price) => {
    return `R$ ${parseFloat(price).toFixed(2).replace('.', ',')}`;
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
        darkMode ? 'bg-gray-900' : 'bg-gray-100'
      }`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>Carregando pedidos...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
        darkMode ? 'bg-gray-900' : 'bg-gray-100'
      }`}>
        <Card className={`max-w-md w-full mx-4 ${
          darkMode ? 'bg-gray-800 text-white' : 'bg-white'
        }`}>
          <CardContent className="p-8 text-center">
            <Package className={`w-16 h-16 mx-auto mb-4 ${
              darkMode ? 'text-gray-400' : 'text-gray-400'
            }`} />
            <h2 className={`text-2xl font-bold mb-4 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>Faça Login</h2>
            <p className={`mb-6 ${
              darkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Para ver seus pedidos, você precisa fazer login na sua conta.
            </p>
            <div className="space-y-3">
              <Button onClick={handleLogin} className="w-full bg-blue-600 hover:bg-blue-700">
                Fazer Login
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link to={createPageUrl("Store")}>Voltar para a Loja</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode ? 'bg-gray-900' : 'bg-gray-100'
    }`}>
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="icon">
              <Link to={createPageUrl("Store")}>
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div>
              <h1 className={`text-3xl font-bold ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>Meus Pedidos</h1>
              <p className={`${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>Acompanhe seus pedidos aqui</p>
            </div>
          </div>
        </header>

        {orders.length === 0 ? (
          <Card className={`${
            darkMode ? 'bg-gray-800 text-white' : 'bg-white'
          }`}>
            <CardContent className="p-12 text-center">
              <Package className={`w-24 h-24 mx-auto mb-6 ${
                darkMode ? 'text-gray-400' : 'text-gray-400'
              }`} />
              <h3 className={`text-xl font-semibold mb-2 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>Nenhum pedido encontrado</h3>
              <p className={`mb-6 ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Você ainda não fez nenhum pedido. Que tal começar agora?
              </p>
              <Button asChild>
                <Link to={createPageUrl("Store")}>Ir às Compras</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <ScrollArea className="h-full">
            <div className="space-y-6">
              {orders.map((order) => (
                <Card key={order.id} className={`shadow-lg border-0 transition-all duration-300 ${
                  darkMode ? 'bg-gray-800' : 'bg-white/90 backdrop-blur-sm'
                }`}>
                  <CardHeader className={`border-b ${
                    darkMode ? 'border-gray-700' : 'border-gray-200'
                  }`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className={`text-lg ${
                          darkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          Pedido #{order.id.slice(-6).toUpperCase()}
                        </CardTitle>
                        <p className={`text-sm ${
                          darkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {format(new Date(order.created_date), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                        </p>
                      </div>
                      {getStatusBadge(order.status, darkMode)}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-6">
                    {/* Itens do Pedido */}
                    <div className="space-y-4">
                      <h4 className={`font-semibold ${
                        darkMode ? 'text-white' : 'text-gray-900'
                      }`}>Itens do Pedido:</h4>
                      <div className="space-y-3">
                        {order.items?.map((item, index) => (
                          <div key={index} className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-slate-50'}`}>
                            <div className="flex justify-between items-start">
                              <div>
                                <p className={`font-semibold ${darkMode ? 'text-white' : 'text-slate-800'}`}>{item.quantity}x {item.product_name}</p>
                                <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{formatPrice(item.unit_price)}</p>
                              </div>
                              <p className={`font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{formatPrice(item.total)}</p>
                            </div>
                            
                            {/* BOTÃO PARA ACESSAR O CURSO */}
                            {order.status === 'entregue' && item.digital_content?.startsWith('course_access:') && (
                              <div className="mt-3 pt-3 border-t border-dashed border-slate-200 dark:border-gray-600">
                                <Button asChild size="sm" className="bg-purple-600 hover:bg-purple-700 text-white w-full sm:w-auto">
                                  <Link to={createPageUrl(`CoursePlayer?id=${item.digital_content.split(':')[1]}`)}>
                                    <PlayCircle className="w-4 h-4 mr-2" />
                                    Acessar Curso
                                  </Link>
                                </Button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Resumo Financeiro */}
                      <div className={`mt-4 pt-4 border-t border-slate-200 dark:border-gray-700 text-right space-y-2`}>
                        <div className="flex justify-between items-center">
                          <span className={`${
                            darkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>Subtotal:</span>
                          <span className={`${
                            darkMode ? 'text-white' : 'text-gray-900'
                          }`}>{formatPrice(order.total_amount)}</span>
                        </div>
                        
                        {order.discount_amount > 0 && (
                          <div className="flex justify-between items-center">
                            <span className="text-green-600">Desconto:</span>
                            <span className="text-green-600">-{formatPrice(order.discount_amount)}</span>
                          </div>
                        )}
                        
                        <div className="flex justify-between items-center text-xl font-bold border-t pt-2">
                          <span>Total:</span>
                          <span className="text-[--store-primary]">{formatPrice(order.final_total || order.total_amount)}</span>
                        </div>
                      </div>

                      {/* Informações de Entrega */}
                      <div className={`border-t pt-4 ${
                        darkMode ? 'border-gray-700' : 'border-gray-200'
                      }`}>
                        <h4 className={`font-semibold mb-2 ${
                          darkMode ? 'text-white' : 'text-gray-900'
                        }`}>Informações de Entrega:</h4>
                        <p className={`text-sm ${
                          darkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          <strong>Endereço:</strong> {order.customer_address}
                        </p>
                        <p className={`text-sm ${
                          darkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          <strong>Telefone:</strong> {order.customer_phone}
                        </p>
                        {order.payment_method && (
                          <p className={`text-sm ${
                            darkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            <strong>Pagamento:</strong> {order.payment_method}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
}
