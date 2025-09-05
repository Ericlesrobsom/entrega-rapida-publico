
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Truck, MapPin, Phone } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

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

export default function DeliverersStatus({ deliverers, loading, darkMode = false }) {
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
          <Truck className="w-5 h-5" />
          Status dos Entregadores
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {loading ? (
            Array(4).fill(0).map((_, i) => (
              <div key={i} className={`p-3 border rounded-lg ${
                darkMode ? 'border-gray-700' : 'border-slate-200'
              }`}>
                <div className="flex justify-between items-start mb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
                <Skeleton className="h-3 w-32 mb-1" />
                <Skeleton className="h-3 w-40" />
              </div>
            ))
          ) : deliverers.length > 0 ? (
            deliverers.map((deliverer) => (
              <div key={deliverer.id} className={`p-3 border rounded-lg hover:bg-opacity-50 transition-colors ${
                darkMode 
                  ? 'border-gray-700 hover:bg-gray-700' 
                  : 'border-slate-200 hover:bg-slate-50'
              }`}>
                <div className="flex justify-between items-start mb-2">
                  <span className={`font-medium transition-colors duration-300 ${
                    darkMode ? 'text-white' : 'text-slate-900'
                  }`}>{deliverer.name}</span>
                  <Badge className={statusColors[deliverer.status]}>
                    {statusLabels[deliverer.status]}
                  </Badge>
                </div>
                
                <div className={`space-y-1 text-sm transition-colors duration-300 ${
                  darkMode ? 'text-gray-400' : 'text-slate-600'
                }`}>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3 h-3" />
                    {deliverer.phone}
                  </div>
                  {deliverer.current_location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3 h-3" />
                      {deliverer.current_location}
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="capitalize">{deliverer.vehicle_type}</span>
                    {deliverer.rating && (
                      <span className="text-yellow-600">
                        ⭐ {deliverer.rating.toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <Truck className={`w-12 h-12 mx-auto mb-4 opacity-50 ${
                darkMode ? 'text-gray-500' : 'text-slate-500'
              }`} />
              <p className={darkMode ? 'text-gray-500' : 'text-slate-500'}>
                Nenhum entregador cadastrado
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
