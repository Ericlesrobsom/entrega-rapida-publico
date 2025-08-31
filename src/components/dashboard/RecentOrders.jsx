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

export default function RecentOrders({ orders, loading }) {
  const recentOrders = orders.slice(0, 5);

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-slate-900">
          <ShoppingCart className="w-5 h-5" />
          Pedidos Recentes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {loading ? (
            Array(5).fill(0).map((_, i) => (
              <div key={i} className="p-4 border border-slate-200 rounded-lg">
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
              <div key={order.id} className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-400" />
                    <span className="font-medium text-slate-900">{order.customer_name}</span>
                  </div>
                  <Badge className={statusColors[order.status]}>
                    {statusLabels[order.status]}
                  </Badge>
                </div>
                
                <div className="space-y-1 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3 h-3" />
                    {order.customer_phone}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3 h-3" />
                    {order.customer_address}
                  </div>
                </div>
                
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-200">
                  <span className="font-semibold text-slate-900">
                    R$ {order.total_amount?.toFixed(2)}
                  </span>
                  <span className="text-xs text-slate-500">
                    {format(new Date(order.created_date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-slate-500">
              <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum pedido encontrado</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}