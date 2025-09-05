
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Save, X, Loader2, Package } from "lucide-react"; // Removed UploadCloud, Trash2 as they are no longer used in the updated JSX
import { UploadFile } from "@/api/integrations";
import { toast } from "sonner";
// CardDescription is removed as it's not used in the updated JSX

export default function ProductForm({ product, onSubmit, onCancel, categories, deliveryMethods }) { // Removed default empty array assignments as per outline
  const [formData, setFormData] = useState({
    name: product?.name || "",
    description: product?.description || "",
    description_popup: product?.description_popup || "",
    price: product?.price || "",
    original_price: product?.original_price || "",
    // Fields like discount_percentage, sales_count, additional_images, is_verified, warranty_info, average_rating, reviews_count
    // are removed from formData initialization as per the provided outline's JSX structure.
    category: product?.category || "",
    delivery_method_id: product?.delivery_method_id || "",
    stock_quantity: product?.stock_quantity || "",
    image_url: product?.image_url || "",
    is_active: product?.is_active !== undefined ? product.is_active : true,
    is_featured: product?.is_featured || false,
    digital_content: product?.digital_content || "",
  });
  const [isUploading, setIsUploading] = useState(false);
  // uploadingAdditional state is removed as additional_images functionality is no longer present in the outline
  const [darkMode, setDarkMode] = useState(false); // Added for dark mode detection

  useEffect(() => {
    // Detect initial dark mode setting from the document element's class
    const isDark = document.documentElement.classList.contains('dark');
    setDarkMode(isDark);

    // Set up a MutationObserver to react to changes in the document element's class (e.g., theme toggle)
    const observer = new MutationObserver(() => {
      setDarkMode(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    // Clean up the observer when the component unmounts
    return () => observer.disconnect();
  }, []);

  // The outline indicated a placeholder for an useEffect to set formData based on product.
  // However, the original code initializes state directly from `product` props.
  // If `product` itself can change during the component's lifecycle *after* initial render,
  // a useEffect would be needed. Assuming initial render covers `product` state.

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.image_url) {
        toast.error("Por favor, faça o upload de uma imagem para o produto.");
        return;
    }
    onSubmit({
      ...formData,
      // Parse numeric fields, excluding those removed from the form by the outline
      price: parseFloat(formData.price) || 0,
      original_price: parseFloat(formData.original_price) || null,
      stock_quantity: parseInt(formData.stock_quantity) || 0,
    });
  };

  const handleImageUpload = async (e) => { // Consolidated image upload function for the main image
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const result = await UploadFile({ file });
      if (result && result.file_url) {
        handleChange("image_url", result.file_url); // Updates only the main image_url
        toast.success("Upload da imagem principal concluído!");
      } else {
        throw new Error("URL da imagem não retornada.");
      }
    } catch (error) {
      console.error("Erro no upload:", error);
      toast.error("Falha no upload da imagem. Tente novamente.");
    } finally {
      setIsUploading(false);
    }
  };

  // handleAdditionalImageChange and removeAdditionalImage functions are removed as per the outline's changes

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className={`mb-8 shadow-xl border-0 ${darkMode ? 'bg-gray-800/90 text-white' : 'bg-white/90'}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="w-5 h-5" /> {/* Added Package icon as per outline */}
          {product ? 'Editar Produto' : 'Novo Produto'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Produto *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Digite o nome do produto" // Restored original placeholder
                required
                className={darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white'} // Apply dark mode styles
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Categoria *</Label>
              <Select value={formData.category} onValueChange={(value) => handleChange('category', value)} required>
                <SelectTrigger className={darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white'}> {/* Apply dark mode styles */}
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent className={darkMode ? 'bg-gray-800 border-gray-700 text-white' : ''}> {/* Apply dark mode styles */}
                  {categories && categories.length > 0 ? ( // Ensure categories array exists and is not empty
                    categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.slug}>{cat.name}</SelectItem>
                    ))
                  ) : (
                    <div className="p-4 text-center text-sm text-slate-500">Nenhuma categoria ativa.</div> // Message for no categories
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição Curta (para o card)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Descrição que aparece no card do produto..." // Restored original placeholder
              rows={2}
              className={darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white'} // Apply dark mode styles
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description_popup">Descrição Detalhada (para o popup)</Label>
            <Textarea
              id="description_popup"
              value={formData.description_popup}
              onChange={(e) => handleChange('description_popup', e.target.value)}
              placeholder="Descrição completa que aparece apenas quando o cliente clica no ícone do olho..." // Restored original placeholder
              rows={4}
              className={darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white'} // Apply dark mode styles
            />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <Label htmlFor="price">Preço (R$) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => handleChange('price', parseFloat(e.target.value))}
                placeholder="0,00" // Restored original placeholder
                required
                className={darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white'} // Apply dark mode styles
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="original_price">Preço Original (opcional)</Label>
              <Input
                id="original_price"
                type="number"
                step="0.01"
                value={formData.original_price}
                onChange={(e) => handleChange('original_price', parseFloat(e.target.value))}
                placeholder="0,00" // Restored original placeholder
                className={darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white'} // Apply dark mode styles
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock_quantity">Estoque</Label>
              <Input
                id="stock_quantity"
                type="number"
                min="0" // Added back min attribute
                value={formData.stock_quantity}
                onChange={(e) => handleChange('stock_quantity', parseInt(e.target.value))}
                placeholder="0" // Restored original placeholder
                className={darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white'} // Apply dark mode styles
              />
            </div>
             <div className="space-y-2">
              <Label htmlFor="delivery_method_id">Método de Entrega</Label>
              <Select value={formData.delivery_method_id} onValueChange={(value) => handleChange('delivery_method_id', value)}>
                <SelectTrigger className={darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white'}> {/* Apply dark mode styles */}
                  <SelectValue placeholder="Selecione um método" />
                </SelectTrigger>
                <SelectContent className={darkMode ? 'bg-gray-800 border-gray-700 text-white' : ''}> {/* Apply dark mode styles */}
                  {deliveryMethods && deliveryMethods.length > 0 ? ( // Ensure deliveryMethods array exists and is not empty
                    deliveryMethods.map((method) => (
                      <SelectItem key={method.id} value={method.id}>{method.name}</SelectItem> // Outline simplified to name only
                    ))
                  ) : (
                    <div className="p-4 text-center text-sm text-slate-500">Nenhum método ativo.</div> // Message for no methods
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="image_url">Imagem Principal</Label>
            <div className="flex items-center gap-4">
              {/* Note: The outline changed the main image input to be visible directly */}
              <Input
                id="image_upload" // ID changed as per outline
                type="file"
                accept="image/*" // Added accept attribute for file types
                onChange={handleImageUpload} // Using the new consolidated handler
                className={`flex-1 ${darkMode ? 'bg-gray-700 border-gray-600 file:text-gray-300' : 'bg-white'}`} // Apply dark mode styles to file input
                disabled={isUploading}
              />
              {isUploading && <Loader2 className="animate-spin w-5 h-5" />}
            </div>
            {formData.image_url && (
              <img src={formData.image_url} alt="Pré-visualização" className="mt-2 w-24 h-24 object-cover rounded-lg" />
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="digital_content">Conteúdo Digital (se aplicável)</Label>
            <Textarea
              id="digital_content"
              value={formData.digital_content}
              onChange={(e) => handleChange('digital_content', e.target.value)}
              placeholder="Insira aqui links, texto ou códigos que serão entregues ao cliente." // Restored original placeholder
              rows={2} // Outline had rows=2, original had rows=4 in Card, but here it's simplified. Keeping 2 for consistency with outline.
              className={darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white'} // Apply dark mode styles
            />
          </div>

          <div className="flex flex-wrap gap-6 pt-4">
            <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => handleChange('is_active', checked)}
                />
                <Label htmlFor="is_active">Produto Ativo</Label>
            </div>
            <div className="flex items-center space-x-2">
                <Switch
                  id="is_featured"
                  checked={formData.is_featured}
                  onCheckedChange={(checked) => handleChange('is_featured', checked)}
                />
                <Label htmlFor="is_featured">Produto em Destaque</Label>
            </div>
          </div>

          <div className={`flex justify-end gap-3 pt-4 border-t ${darkMode ? 'border-gray-700' : 'border-slate-200'}`}> {/* Apply dark mode styles to border */}
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              <Save className="w-4 h-4 mr-2" />
              {product ? 'Atualizar Produto' : 'Criar Produto'} {/* Changed button text as per outline */}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
