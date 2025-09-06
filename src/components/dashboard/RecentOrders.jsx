
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ShoppingCart, User, Phone, MapPin } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

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

export default function RecentOrders({ orders, loading, darkMode = false }) {
  const recentOrders = orders.slice(0, 5);

  return (
    <Card className={`border-0 shadow-lg transition-colors duration-300 ${
      darkMode
        ? 'bg-gray-800/90 backdrop-blur-sm'
        : 'bg-white/80 backdrop-blur-sm'
    }`}>
      <CardHeader className="pb-4">
        <CardTitle className={`flex items-center gap-2 transition-colors duration-300 ${
          darkMode ? 'text-white' : 'text-slate-900'
        }`}>
          <ShoppingCart className="w-5 h-5" />
          Pedidos Recentes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {loading ? (
            Array(5).fill(0).map((_, i) => (
              <div key={i} className={`p-4 border rounded-lg ${
                darkMode ? 'border-gray-700' : 'border-slate-200'
              }`}>
                <div className="flex justify-between items-start mb-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
                <Skeleton className="h-4 w-48 mb-2" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))
          ) : recentOrders.length > 0 ? (
            recentOrders.map((order) => (
              <div key={order.id} className={`p-4 border rounded-lg hover:bg-opacity-50 transition-colors ${
                darkMode
                  ? 'border-gray-700 hover:bg-gray-700'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <User className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-slate-400'}`} />
                    <span className={`font-medium ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                      {order.customer_name}
                    </span>
                  </div>
                  <Badge className={statusColors[order.status]}>
                    {statusLabels[order.status]}
                  </Badge>
                </div>

                <div className={`space-y-1 text-sm ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3 h-3" />
                    {order.customer_phone}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3 h-3" />
                    {order.customer_address}
                  </div>
                </div>

                <div className={`flex justify-between items-center mt-3 pt-3 border-t ${
                  darkMode ? 'border-gray-700' : 'border-slate-200'
                }`}>
                  <span className={`font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                    R$ {(order.total_amount || 0).toFixed(2)}
                  </span>
                  <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-slate-500'}`}>
                    {format(new Date(order.created_date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <ShoppingCart className={`w-12 h-12 mx-auto mb-4 opacity-50 ${
                darkMode ? 'text-gray-500' : 'text-slate-500'
              }`} />
              <p className={darkMode ? 'text-gray-500' : 'text-slate-500'}>
                Nenhum pedido encontrado
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
