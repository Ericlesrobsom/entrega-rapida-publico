
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingCart, User, Phone, MapPin, Edit, Truck, MoreVertical, Check, X, ChevronRight, CreditCard } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

/**
 * AssignDelivererDialog component for assigning a deliverer to an order.
 * Replaces the previous conditional Select for deliverer assignment.
 */
function AssignDelivererDialog({ order, deliverers, onAssign }) {
  const [selectedDelivererId, setSelectedDelivererId] = useState("");

  const availableDeliverers = deliverers.filter(d => d.status === "disponivel");

  const handleAssign = () => {
    if (selectedDelivererId) {
      onAssign(order.id, selectedDelivererId);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="sm" variant="outline" className="w-full dark:bg-transparent dark:hover:bg-slate-100 dark:text-slate-800 dark:border-slate-300">
          <Truck className="w-4 h-4 mr-2" />
          Atribuir Entregador
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="light"> {/* Apply 'light' class for dark mode compatibility */}
        <AlertDialogHeader>
          <AlertDialogTitle>Atribuir Entregador para o Pedido #{order.id.slice(-6)}</AlertDialogTitle>
          <AlertDialogDescription>
            Selecione um entregador disponível para atribuir a este pedido.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="py-4">
          <Select onValueChange={setSelectedDelivererId} value={selectedDelivererId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione um entregador" />
            </SelectTrigger>
            <SelectContent>
              {availableDeliverers.length > 0 ? (
                availableDeliverers.map((deliverer) => (
                  <SelectItem key={deliverer.id} value={deliverer.id}>
                    {deliverer.name}
                  </SelectItem>
                ))
              ) : (
                <div className="p-4 text-center text-sm text-slate-500">Nenhum entregador disponível</div>
              )}
            </SelectContent>
          </Select>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleAssign} disabled={!selectedDelivererId || availableDeliverers.length === 0}>
            Atribuir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/**
 * OrderCard component for displaying individual order details.
 * Encapsulates the rendering of a single order card, including status updates and deliverer assignment.
 */
function OrderCard({ order, deliverers, onEdit, onStatusChange }) {
  const deliverer = deliverers.find(d => d.id === order.deliverer_id);

  return (
    <Card key={order.id} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-slate-400" />
                  <span className="font-semibold text-slate-900">{order.customer_name}</span>
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
                  {deliverer && (
                    <div className="flex items-center gap-2">
                      <Truck className="w-3 h-3" />
                      <span>Entregador: {deliverer.name}</span>
                    </div>
                  )}
                  {order.payment_method && (
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-3 h-3" />
                      <span>Pagamento: {order.payment_method}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="text-right">
                <Badge className={statusColors[order.status]}>
                  {statusLabels[order.status]}
                </Badge>
                <p className="text-sm text-slate-500 mt-1">
                  {format(new Date(order.created_date), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <h4 className="font-medium text-slate-900 mb-2">Itens do Pedido:</h4>
                <div className="space-y-1">
                  {order.items?.map((item, index) => (
                    <div key={index} className="text-sm text-slate-600">
                      {item.quantity}x {item.product_name} - R$ {item.total?.toFixed(2)}
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-right">
                <div className="text-2xl font-bold text-slate-900">
                  R$ {order.total_amount?.toFixed(2)}
                </div>
                {order.delivery_fee > 0 && (
                  <div className="text-sm text-slate-600">
                    + R$ {order.delivery_fee?.toFixed(2)} entrega
                  </div>
                )}
              </div>
            </div>

            {order.notes && (
              <div className="mb-4">
                <h4 className="font-medium text-slate-900 mb-1">Observações:</h4>
                <p className="text-sm text-slate-600">{order.notes}</p>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 lg:w-48">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(order)}
            >
              <Edit className="w-4 h-4 mr-1" />
              Editar
            </Button>

            {/* Replaced Select with DropdownMenu for status change */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-9 w-full justify-between pr-2">
                  <span>{statusLabels[order.status]}</span>
                  <ChevronRight className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="light"> {/* Apply 'light' class for dark mode compatibility */}
                {Object.keys(statusLabels).map((statusKey) => (
                  <DropdownMenuItem
                    key={statusKey}
                    onClick={() => onStatusChange(order.id, statusKey)}
                    className={order.status === statusKey ? "font-bold" : ""}
                  >
                    {statusKey === "confirmado" && <Check className="w-4 h-4 mr-2 text-green-500" />}
                    {statusKey === "cancelado" && <X className="w-4 h-4 mr-2 text-red-500" />}
                    {statusLabels[statusKey]}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {order.status === "saiu_entrega" && !order.deliverer_id && (
              <AssignDelivererDialog
                order={order}
                deliverers={deliverers}
                onAssign={(orderId, delivererId) => onStatusChange(orderId, order.status, delivererId)}
              />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * OrdersList component displays a list of order cards.
 * Manages loading states and renders individual OrderCard components.
 */
export default function OrdersList({ orders, deliverers, loading, onEdit, onStatusChange }) {
  if (loading) {
    return (
      <div className="space-y-4">
        {Array(5).fill(0).map((_, i) => (
          <Card key={i} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-48" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-slate-400" />
        <h3 className="text-xl font-semibold text-slate-900 mb-2">Nenhum pedido encontrado</h3>
        <p className="text-slate-600">Os pedidos aparecerão aqui quando forem criados.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <OrderCard
          key={order.id}
          order={order}
          deliverers={deliverers}
          onEdit={onEdit}
          onStatusChange={onStatusChange}
        />
      ))}
    </div>
  );
}
