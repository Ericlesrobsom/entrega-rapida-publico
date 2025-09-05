
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Edit, Trash2, Truck } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function DeliveryMethodList({ methods, loading, onEdit, onDelete, darkMode }) {
  if (loading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="space-y-4">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (methods.length === 0) {
    return (
      <div className="text-center py-12">
        <Truck className="w-16 h-16 mx-auto mb-4 text-slate-400" />
        <h3 className="text-xl font-semibold text-slate-900 mb-2">Nenhum método de entrega encontrado</h3>
        <p className="text-slate-600">Adicione métodos para definir como seus produtos serão entregues.</p>
      </div>
    );
  }

  return (
    <Card className={`border-0 shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white/80 backdrop-blur-sm'}`}>
      <CardHeader>
        <CardTitle className={darkMode ? 'text-white' : ''}>Métodos de Entrega</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className={darkMode ? 'border-gray-700' : ''}>
              <TableHead className="w-16"></TableHead>
              <TableHead className={darkMode ? 'text-gray-300' : ''}>Nome</TableHead>
              <TableHead className={darkMode ? 'text-gray-300' : ''}>Descrição</TableHead>
              <TableHead className={darkMode ? 'text-gray-300' : ''}>Status</TableHead>
              <TableHead className={`text-right ${darkMode ? 'text-gray-300' : ''}`}>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {methods.map((method) => (
              <TableRow key={method.id} className={darkMode ? 'border-gray-700' : ''}>
                <TableCell>
                  <span className="text-2xl">{method.icon || '❓'}</span>
                </TableCell>
                <TableCell className={`font-medium ${darkMode ? 'text-white' : 'text-slate-900'}`}>{method.name}</TableCell>
                <TableCell className={darkMode ? 'text-gray-400' : 'text-slate-600'}>{method.description}</TableCell>
                <TableCell>
                  <Badge
                    variant={method.is_active ? "default" : "secondary"}
                    className={method.is_active ? (darkMode ? 'bg-green-800/80 text-green-200' : 'bg-green-100 text-green-800') : (darkMode ? 'bg-red-800/80 text-red-200' : 'bg-red-100 text-red-800')}
                  >
                    {method.is_active ? "Ativo" : "Inativo"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => onEdit(method)}>
                    <Edit className={`w-4 h-4 ${darkMode ? 'text-gray-300' : ''}`} />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onDelete(method)}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
