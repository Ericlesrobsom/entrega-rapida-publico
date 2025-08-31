import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Banknote } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function PaymentMethodList({ methods, onEdit, onDelete }) {

  if (methods.length === 0) {
    return null; // Não mostra nada se não houver métodos, o form de criação já é suficiente
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
       <CardHeader>
        <div className="flex items-center gap-3">
            <Banknote className="w-6 h-6 text-slate-600" />
            <div>
                <CardTitle>Formas de Pagamento Manuais</CardTitle>
                <CardDescription>Gerencie aqui suas formas de pagamento ativas.</CardDescription>
            </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16"></TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Instruções</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {methods.map((method) => (
              <TableRow key={method.id}>
                <TableCell>
                  <span className="text-2xl">{method.icon || '❓'}</span>
                </TableCell>
                <TableCell className="font-medium text-slate-900">{method.name}</TableCell>
                <TableCell className="text-slate-600 max-w-sm truncate">{method.instructions}</TableCell>
                <TableCell>
                  <Badge
                    variant={method.is_active ? "default" : "secondary"}
                    className={method.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                  >
                    {method.is_active ? "Ativo" : "Inativo"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => onEdit(method)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onDelete(method.id)}>
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