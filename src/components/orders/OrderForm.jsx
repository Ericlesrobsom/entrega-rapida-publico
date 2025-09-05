
import React, { useState, useEffect } from "react";
import { Product } from "@/api/entities";
import { Course } from "@/api/entities"; // Added Course import
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

export default function OrderForm({ order, onSubmit, onCancel, darkMode }) {
  const [formData, setFormData] = useState({
    customer_name: order?.customer_name || "",
    customer_phone: order?.customer_phone || "",
    customer_address: order?.customer_address || "",
    delivery_fee: order?.delivery_fee || 0,
    notes: order?.notes || "",
    items: order?.items || []
  });

  const [products, setProducts] = useState([]);
  const [courses, setCourses] = useState([]); // New state for courses
  const [selectableItems, setSelectableItems] = useState([]); // New state for combined items
  
  const [selectedItemId, setSelectedItemId] = useState(""); // Renamed from selectedProduct
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const loadItems = async () => {
      try {
        const [productsData, coursesData] = await Promise.all([
          Product.filter({ is_active: true }),
          Course.filter({ is_active: true })
        ]);
        
        setProducts(productsData);
        setCourses(coursesData);

        const productItems = productsData.map(p => ({
          id: p.id,
          name: `📦 Produto: ${p.name}`,
          type: 'product',
          price: p.price
        }));

        const courseItems = coursesData.map(c => ({
          id: `course_${c.id}`, // Prefix course IDs to distinguish them
          name: `🎓 Curso: ${c.title}`,
          type: 'course',
          price: c.price
        }));

        setSelectableItems([...productItems, ...courseItems].sort((a, b) => a.name.localeCompare(b.name)));
      } catch (error) {
        console.error("Erro ao carregar itens:", error);
      }
    };
    loadItems();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const totalAmount = formData.items.reduce((sum, item) => sum + (item.total || 0), 0); // Use || 0 for safety
    const finalTotal = totalAmount + (parseFloat(formData.delivery_fee) || 0); // Calculate final total

    onSubmit({
      ...formData,
      total_amount: totalAmount,
      final_total: finalTotal, // Added for consistency
      delivery_fee: parseFloat(formData.delivery_fee)
    });
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addItem = () => {
    if (!selectedItemId) return;

    let newItem = null;
    const isCourse = selectedItemId.startsWith('course_');
    
    if (isCourse) {
      const courseId = selectedItemId.replace('course_', '');
      const course = courses.find(c => c.id === courseId);
      if (!course) return;

      newItem = {
        product_id: course.id,
        product_name: `🎓 ${course.title}`,
        quantity: 1, // Cursos sempre têm quantidade 1
        unit_price: course.price,
        total: course.price,
        image_url: course.thumbnail_url, // Assuming courses have a thumbnail
        digital_content: `course_access:${course.id}` // Flag for digital course access
      };
    } else {
      const product = products.find(p => p.id === selectedItemId);
      if (!product) return;

      newItem = {
        product_id: product.id,
        product_name: `📦 ${product.name}`,
        quantity: quantity,
        unit_price: product.price,
        total: quantity * product.price,
        image_url: product.image_url, // Assuming products have an image
        digital_content: product.digital_content || null // Existing digital content for products
      };
    }

    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));

    setSelectedItemId("");
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
        i === index && !item.digital_content?.startsWith('course_access:') // Do not allow quantity change for courses
          ? { ...item, quantity: newQuantity, total: newQuantity * item.unit_price }
          : item
      )
    }));
  };

  const calculateTotal = () => {
    const itemsTotal = formData.items.reduce((sum, item) => sum + (item.total || 0), 0);
    return itemsTotal + (parseFloat(formData.delivery_fee) || 0);
  };

  return (
    <Card className={`mb-6 border-0 shadow-xl ${darkMode ? 'bg-gray-800' : 'bg-white/90 backdrop-blur-sm'}`}>
      <CardHeader className="pb-4">
        <CardTitle className={darkMode ? 'text-white' : 'text-slate-900'}>
          {order ? "Editar Pedido" : "Novo Pedido"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Information */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="customer_name" className={darkMode ? 'text-gray-300' : ''}>Nome do Cliente *</Label>
              <Input
                id="customer_name"
                value={formData.customer_name}
                onChange={(e) => handleChange("customer_name", e.target.value)}
                placeholder="Digite o nome do cliente"
                required
                className={darkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer_phone" className={darkMode ? 'text-gray-300' : ''}>Telefone *</Label>
              <Input
                id="customer_phone"
                value={formData.customer_phone}
                onChange={(e) => handleChange("customer_phone", e.target.value)}
                placeholder="(11) 99999-9999"
                required
                className={darkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="customer_address" className={darkMode ? 'text-gray-300' : ''}>Endereço de Entrega *</Label>
              <Input
                id="customer_address"
                value={formData.customer_address}
                onChange={(e) => handleChange("customer_address", e.target.value)}
                placeholder="Rua, número, bairro, cidade"
                required
                className={darkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="delivery_fee" className={darkMode ? 'text-gray-300' : ''}>Taxa de Entrega</Label>
              <Input
                id="delivery_fee"
                type="number"
                step="0.01"
                min="0"
                value={formData.delivery_fee}
                onChange={(e) => handleChange("delivery_fee", parseFloat(e.target.value) || 0)} // Ensure delivery_fee is a number
                placeholder="0,00"
                className={darkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="notes" className={darkMode ? 'text-gray-300' : ''}>Observações</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                placeholder="Observações do pedido..."
                rows={3}
                className={darkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}
              />
            </div>
          </div>

          {/* Add Items */}
          <div className="space-y-4">
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Itens do Pedido</h3>
            
            <div className={`flex gap-3 p-4 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-slate-50'}`}>
              <Select value={selectedItemId} onValueChange={setSelectedItemId}>
                <SelectTrigger className={`flex-1 ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : ''}`}>
                  <SelectValue placeholder="Selecione um item" />
                </SelectTrigger>
                <SelectContent className={darkMode ? 'bg-gray-800 border-gray-700 text-white' : ''}>
                  {selectableItems.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name} - R$ {item.price?.toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value, 10))}
                placeholder="Qtd"
                className={`w-20 ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : ''}`}
                disabled={selectedItemId.startsWith('course_')} // Disable quantity for courses
              />
              
              <Button
                type="button"
                onClick={addItem}
                disabled={!selectedItemId}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {/* Items Table */}
            {formData.items.length > 0 && (
              <div className={`border rounded-lg overflow-hidden ${darkMode ? 'border-gray-700' : ''}`}>
                <Table>
                  <TableHeader>
                    <TableRow className={darkMode ? 'border-gray-700 hover:bg-gray-700/50' : ''}>
                      <TableHead className={darkMode ? 'text-gray-300' : ''}>Item</TableHead> {/* Changed from Produto to Item */}
                      <TableHead className={darkMode ? 'text-gray-300' : ''}>Quantidade</TableHead>
                      <TableHead className={darkMode ? 'text-gray-300' : ''}>Preço Unit.</TableHead>
                      <TableHead className={darkMode ? 'text-gray-300' : ''}>Total</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {formData.items.map((item, index) => (
                      <TableRow key={index} className={darkMode ? 'border-gray-700 hover:bg-gray-700/50' : ''}>
                        <TableCell className={`font-medium ${darkMode ? 'text-white' : ''}`}>{item.product_name}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateItemQuantity(index, parseInt(e.target.value, 10))}
                            className={`w-16 ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : ''}`}
                            disabled={item.digital_content?.startsWith('course_access:')} // Disable quantity in table for courses
                          />
                        </TableCell>
                        <TableCell className={darkMode ? 'text-gray-300' : ''}>R$ {item.unit_price?.toFixed(2)}</TableCell>
                        <TableCell className={`font-semibold ${darkMode ? 'text-white' : ''}`}>R$ {item.total?.toFixed(2)}</TableCell>
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
                
                <div className={`p-4 border-t ${darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-slate-50'}`}>
                  <div className={`flex justify-between items-center text-lg font-semibold ${darkMode ? 'text-white' : ''}`}>
                    <span>Total do Pedido:</span>
                    <span>R$ {calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className={`flex justify-end gap-3 pt-4 ${darkMode ? 'border-t border-gray-700' : 'border-t'}`}>
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
