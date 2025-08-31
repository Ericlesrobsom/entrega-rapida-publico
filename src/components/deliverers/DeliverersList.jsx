import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Truck, User, Phone, Mail, MapPin, Edit, Star } from "lucide-react";

const statusColors = {
  disponivel: "bg-green-100 text-green-800",
  ocupado: "bg-orange-100 text-orange-800", 
  inativo: "bg-red-100 text-red-800"
};

const statusLabels = {
  disponivel: "Disponível",
  ocupado: "Ocupado",
  inativo: "Inativo"
};

const vehicleIcons = {
  moto: "🏍️",
  carro: "🚗", 
  bicicleta: "🚲",
  pe: "🚶"
};

export default function DeliverersList({ deliverers, loading, onEdit, onStatusChange }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array(6).fill(0).map((_, i) => (
          <Card key={i} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              <Skeleton className="h-9 w-full mt-4" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (deliverers.length === 0) {
    return (
      <div className="text-center py-12">
        <Truck className="w-16 h-16 mx-auto mb-4 text-slate-400" />
        <h3 className="text-xl font-semibold text-slate-900 mb-2">Nenhum entregador encontrado</h3>
        <p className="text-slate-600">Cadastre entregadores para gerenciar suas entregas.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {deliverers.map((deliverer) => (
        <Card key={deliverer.id} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-slate-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">{deliverer.name}</h3>
                  <div className="flex items-center gap-1 text-sm text-slate-600">
                    <span>{vehicleIcons[deliverer.vehicle_type]}</span>
                    <span className="capitalize">{deliverer.vehicle_type}</span>
                  </div>
                </div>
              </div>
              
              <Badge className={statusColors[deliverer.status]}>
                {statusLabels[deliverer.status]}
              </Badge>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Phone className="w-4 h-4" />
                {deliverer.phone}
              </div>
              
              {deliverer.email && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Mail className="w-4 h-4" />
                  {deliverer.email}
                </div>
              )}
              
              {deliverer.current_location && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <MapPin className="w-4 h-4" />
                  {deliverer.current_location}
                </div>
              )}
              
              {deliverer.rating && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Star className="w-4 h-4" />
                  {deliverer.rating.toFixed(1)} estrelas
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(deliverer)}
                className="w-full"
              >
                <Edit className="w-4 h-4 mr-1" />
                Editar
              </Button>
              
              <Select
                value={deliverer.status}
                onValueChange={(value) => onStatusChange(deliverer.id, value)}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="disponivel">Disponível</SelectItem>
                  <SelectItem value="ocupado">Ocupado</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}