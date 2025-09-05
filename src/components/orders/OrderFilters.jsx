import React from 'react';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function OrderFilters({ filters, onFiltersChange, darkMode }) {
  const handleStatusChange = (value) => {
    onFiltersChange({ ...filters, status: value });
  };

  return (
    <Card className={`p-4 mb-6 shadow-sm ${darkMode ? 'bg-gray-800/50' : 'bg-white/70'}`}>
      <div className="flex items-center gap-4">
        <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-slate-700'}`}>Filtrar por status:</span>
        <Select value={filters.status} onValueChange={handleStatusChange}>
          <SelectTrigger className={`w-[180px] ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white'}`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className={darkMode ? 'bg-gray-800 border-gray-700 text-white' : ''}>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="confirmado">Confirmado</SelectItem>
            <SelectItem value="preparando">Preparando</SelectItem>
            <SelectItem value="saiu_entrega">Saiu para Entrega</SelectItem>
            <SelectItem value="entregue">Entregue</SelectItem>
            <SelectItem value="cancelado">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </Card>
  );
}