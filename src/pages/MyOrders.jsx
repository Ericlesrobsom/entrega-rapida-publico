
import React, { useState, useEffect } from "react";
import { Order } from "@/api/entities";
import { User } from "@/api/entities";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ShoppingBag, Package, Truck, CheckCircle, Clock, XCircle } from "lucide-react";

const statusIcons = {
  pendente: <Clock className="w-4 h-4" />,
  confirmado: <Package className="w-4 h-4" />,
  preparando: <Package className="w-4 h-4" />,
  saiu_entrega: <Truck className="w-4 h-4" />,
  entregue: <CheckCircle className="w-4 h-4" />,
  cancelado: <XCircle className="w-4 h-4" />
};

const statusColors = {
  pendente: "bg-yellow-100 text-yellow-800",
  confirmado: "bg-blue-100 text-blue-800",
  preparando: "bg-purple-100 text-purple-800",
  saiu_entrega: "bg-orange-100 text-orange-800",
  entregue: "bg-green-100 text-green-800",
  cancelado: "bg-red-100 text-red-800"
};

const statusLabels = {
  pendente: "Pendente",
  confirmado: "Confirmado",
  preparando: "Preparando",
  saiu_entrega: "Saiu para Entrega",
  entregue: "Entregue",
  cancelado: "Cancelado"
};

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUserOrders = async () => {
      try {
        const currentUser = await User.me();
        setUser(currentUser);
        
        // Buscar pedidos do usuário atual
        const userOrders = await Order.filter({ created_by: currentUser.email }, '-created_date');
        setOrders(userOrders);
      } catch (error) {
        console.error("Erro ao carregar pedidos:", error);
        // Se não estiver logado, redirecionar para login
        await User.loginWithRedirect(window.location.href);
      } finally {
        setLoading(false);
      }
    };

    loadUserOrders();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Meus Pedidos</h1>
              <p className="text-gray-600 mt-1">Acompanhe seus pedidos e compras</p>
            </div>
            <a 
              href="/Store" 
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              ← Voltar à Loja
            </a>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {orders.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">Nenhum pedido encontrado</h3>
            <p className="text-gray-600 mb-6">Você ainda não fez nenhum pedido em nossa loja.</p>
            <a 
              href="/Store" 
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-block"
            >
              Começar a comprar
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map(order => (
              <Card key={order.id} className="overflow-hidden">
                <CardHeader className="bg-gray-50 border-b">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        Pedido #{order.id.slice(-8).toUpperCase()}
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        Feito em {format(new Date(order.created_date), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                    <Badge className={statusColors[order.status]}>
                      <div className="flex items-center gap-1">
                        {statusIcons[order.status]}
                        {statusLabels[order.status]}
                      </div>
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="p-6">
                  {/* Itens do pedido */}
                  <div className="space-y-3 mb-6">
                    <h4 className="font-semibold text-gray-900">Itens do pedido:</h4>
                    {order.items?.map((item, index) => (
                      <div key={index} className="py-2 border-b border-gray-100 last:border-0">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-4">
                            <img 
                              src={item.image_url || 'https://via.placeholder.com/64x64?text=Sem+Imagem'} 
                              alt={item.product_name}
                              className="w-16 h-16 object-cover rounded-md"
                            />
                            <div>
                              <span className="font-medium">{item.product_name}</span>
                              <span className="text-gray-600 ml-2">x{item.quantity}</span>
                            </div>
                          </div>
                          <span className="font-semibold">R$ {item.total?.toFixed(2)}</span>
                        </div>
                        
                        {/* NOVO: Bloco de conteúdo digital entregue */}
                        {order.status === 'entregue' && item.digital_content && (
                          <div className="mt-4 ml-20 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <h5 className="font-semibold text-green-800 mb-2">✅ Seu conteúdo digital:</h5>
                            <div 
                              className="prose prose-sm max-w-none text-green-900"
                              dangerouslySetInnerHTML={{ __html: item.digital_content.replace(/\n/g, '<br />') }} 
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Informações de entrega */}
                  <div className="grid md:grid-cols-2 gap-6 pt-4 border-t">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Endereço de entrega:</h4>
                      <p className="text-gray-600">{order.customer_address}</p>
                      <p className="text-gray-600">Tel: {order.customer_phone}</p>
                    </div>
                    <div className="text-right">
                      <div className="space-y-1">
                        {order.delivery_fee && (
                          <div className="flex justify-between">
                            <span>Taxa de entrega:</span>
                            <span>R$ {order.delivery_fee.toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-bold text-lg pt-2 border-t">
                          <span>Total:</span>
                          <span>R$ {order.total_amount?.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {order.notes && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-1">Observações:</h4>
                      <p className="text-gray-600">{order.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
