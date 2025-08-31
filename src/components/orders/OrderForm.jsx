import React, { useState, useEffect } from "react";
import { Product } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, X, Plus, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function OrderForm({ order, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    customer_name: order?.customer_name || "",
    customer_phone: order?.customer_phone || "",
    customer_address: order?.customer_address || "",
    delivery_fee: order?.delivery_fee || 0,
    notes: order?.notes || "",
    items: order?.items || []
  });

  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await Product.filter({ is_active: true });
      setProducts(data);
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const totalAmount = formData.items.reduce((sum, item) => sum + item.total, 0) + formData.delivery_fee;
    onSubmit({
      ...formData,
      total_amount: totalAmount,
      delivery_fee: parseFloat(formData.delivery_fee)
    });
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addItem = () => {
    if (!selectedProduct) return;
    
    const product = products.find(p => p.id === selectedProduct);
    if (!product) return;

    const newItem = {
      product_id: product.id,
      product_name: product.name,
      quantity: quantity,
      unit_price: product.price,
      total: quantity * product.price
    };

    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));

    setSelectedProduct("");
    setQuantity(1);
  };

  const removeItem = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const updateItemQuantity = (index, newQuantity) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index 
          ? { ...item, quantity: newQuantity, total: newQuantity * item.unit_price }
          : item
      )
    }));
  };

  const calculateTotal = () => {
    const itemsTotal = formData.items.reduce((sum, item) => sum + item.total, 0);
    return itemsTotal + (parseFloat(formData.delivery_fee) || 0);
  };

  return (
    <Card className="mb-6 bg-white/90 backdrop-blur-sm border-0 shadow-xl">
      <CardHeader className="pb-4">
        <CardTitle className="text-slate-900">
          {order ? "Editar Pedido" : "Novo Pedido"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Information */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="customer_name">Nome do Cliente *</Label>
              <Input
                id="customer_name"
                value={formData.customer_name}
                onChange={(e) => handleChange("customer_name", e.target.value)}
                placeholder="Digite o nome do cliente"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer_phone">Telefone *</Label>
              <Input
                id="customer_phone"
                value={formData.customer_phone}
                onChange={(e) => handleChange("customer_phone", e.target.value)}
                placeholder="(11) 99999-9999"
                required
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="customer_address">Endereço de Entrega *</Label>
              <Input
                id="customer_address"
                value={formData.customer_address}
                onChange={(e) => handleChange("customer_address", e.target.value)}
                placeholder="Rua, número, bairro, cidade"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="delivery_fee">Taxa de Entrega</Label>
              <Input
                id="delivery_fee"
                type="number"
                step="0.01"
                min="0"
                value={formData.delivery_fee}
                onChange={(e) => handleChange("delivery_fee", e.target.value)}
                placeholder="0,00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                placeholder="Observações do pedido..."
                rows={3}
              />
            </div>
          </div>

          {/* Add Items */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Itens do Pedido</h3>
            
            <div className="flex gap-3 p-4 bg-slate-50 rounded-lg">
              <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Selecione um produto" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} - R$ {product.price?.toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
                placeholder="Qtd"
                className="w-20"
              />
              
              <Button
                type="button"
                onClick={addItem}
                disabled={!selectedProduct}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {/* Items Table */}
            {formData.items.length > 0 && (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produto</TableHead>
                      <TableHead>Quantidade</TableHead>
                      <TableHead>Preço Unit.</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {formData.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.product_name}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateItemQuantity(index, parseInt(e.target.value))}
                            className="w-16"
                          />
                        </TableCell>
                        <TableCell>R$ {item.unit_price?.toFixed(2)}</TableCell>
                        <TableCell className="font-semibold">R$ {item.total?.toFixed(2)}</TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem(index)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                <div className="p-4 bg-slate-50 border-t">
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span>Total do Pedido:</span>
                    <span>R$ {calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700"
              disabled={formData.items.length === 0}
            >
              <Save className="w-4 h-4 mr-2" />
              {order ? "Atualizar" : "Criar Pedido"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}