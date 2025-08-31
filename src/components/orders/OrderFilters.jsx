
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter } from "lucide-react";

export default function OrderFilters({ filters, onFiltersChange }) {
  return (
    <div className="flex gap-4 mb-6">
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-slate-500" />
        <Select 
          value={filters.status} 
          onValueChange={(value) => onFiltersChange({ ...filters, status: value })}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Status do Pedido" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos Status</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="confirmado">Confirmado</SelectItem>
            <SelectItem value="preparando">Preparando</SelectItem>
            <SelectItem value="saiu_entrega">Saiu para Entrega</SelectItem>
            <SelectItem value="entregue">Entregue</SelectItem>
            <SelectItem value="cancelado">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
