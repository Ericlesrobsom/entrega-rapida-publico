
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Save, X, UploadCloud, Loader2, Trash2 } from "lucide-react";
import { UploadFile } from "@/api/integrations";
import { toast } from "sonner";

export default function ProductForm({ product, onSubmit, onCancel, categories = [], deliveryMethods = [] }) {
  const [formData, setFormData] = useState({
    name: product?.name || "",
    description: product?.description || "",
    description_popup: product?.description_popup || "",
    price: product?.price || "",
    original_price: product?.original_price || "",
    discount_percentage: product?.discount_percentage || 0,
    sales_count: product?.sales_count || 0,
    category: product?.category || "",
    delivery_method_id: product?.delivery_method_id || "",
    stock_quantity: product?.stock_quantity || "",
    image_url: product?.image_url || "",
    additional_images: product?.additional_images || [],
    is_active: product?.is_active !== undefined ? product.is_active : true,
    is_featured: product?.is_featured || false,
    is_verified: product?.is_verified || false,
    warranty_info: product?.warranty_info || "",
    digital_content: product?.digital_content || "", // Adicionar novo estado
    average_rating: product?.average_rating || 0,
    reviews_count: product?.reviews_count || 0
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingAdditional, setUploadingAdditional] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.image_url && formData.category !== 'digital') { // Allow digital products to not have an image
        toast.error("Por favor, faça o upload de uma imagem para o produto.");
        return;
    }
    onSubmit({
      ...formData,
      price: parseFloat(formData.price) || 0,
      original_price: parseFloat(formData.original_price) || null,
      discount_percentage: parseInt(formData.discount_percentage) || 0,
      sales_count: parseInt(formData.sales_count) || 0,
      stock_quantity: parseInt(formData.stock_quantity) || 0,
      average_rating: parseFloat(formData.average_rating) || 0,
      reviews_count: parseInt(formData.reviews_count) || 0
    });
  };

  const handleMainImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const result = await UploadFile({ file });
      if (result && result.file_url) {
        handleChange("image_url", result.file_url);
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

  const handleAdditionalImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (formData.additional_images.length >= 6) {
      toast.error("Máximo de 6 imagens adicionais permitidas.");
      return;
    }

    setUploadingAdditional(true);
    try {
      const result = await UploadFile({ file });
      if (result && result.file_url) {
        const newImages = [...formData.additional_images, result.file_url];
        handleChange("additional_images", newImages);
        toast.success("Imagem adicional enviada com sucesso!");
      } else {
        throw new Error("URL da imagem não retornada.");
      }
    } catch (error) {
      console.error("Erro no upload:", error);
      toast.error("Falha no upload da imagem adicional. Tente novamente.");
    } finally {
      setUploadingAdditional(false);
    }
  };

  const removeAdditionalImage = (index) => {
    const newImages = formData.additional_images.filter((_, i) => i !== index);
    handleChange("additional_images", newImages);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl p-8 mb-8">
      <h2 className="text-2xl font-semibold text-slate-900 mb-6">
        {product ? "Editar Produto" : "Novo Produto"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="space-y-2">
          <Label htmlFor="name">Nome do Produto *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="Digite o nome do produto"
            required
          />
        </div>

        {/* Categoria, Entrega e Estoque */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="category">Categoria *</Label>
            <Select value={formData.category} onValueChange={(value) => handleChange("category", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.length > 0 ? (
                  categories.map(category => (
                    <SelectItem key={category.id} value={category.slug}>
                      {category.name}
                    </SelectItem>
                  ))
                ) : (
                  <div className="p-4 text-center text-sm text-slate-500">Nenhuma categoria ativa.</div>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="delivery_method">Método de Entrega *</Label>
            <Select value={formData.delivery_method_id} onValueChange={(value) => handleChange("delivery_method_id", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um método" />
              </SelectTrigger>
              <SelectContent>
                {deliveryMethods.length > 0 ? (
                  deliveryMethods.map(method => (
                    <SelectItem key={method.id} value={method.id}>
                      {method.icon} {method.name}
                    </SelectItem>
                  ))
                ) : (
                  <div className="p-4 text-center text-sm text-slate-500">Nenhum método ativo.</div>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="stock">Quantidade em Estoque</Label>
            <Input
              id="stock"
              type="number"
              min="0"
              value={formData.stock_quantity}
              onChange={(e) => handleChange("stock_quantity", e.target.value)}
              placeholder="0"
            />
          </div>
        </div>

        {/* Preços e Descontos */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="price">Preço de Venda (R$)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) => handleChange("price", e.target.value)}
              placeholder="0,00"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="original_price">Preço Original (Sem Desconto)</Label>
            <Input
              id="original_price"
              type="number"
              step="0.01"
              min="0"
              value={formData.original_price}
              onChange={(e) => handleChange("original_price", e.target.value)}
              placeholder="0,00"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="discount_percentage">Desconto (%)</Label>
            <Input
              id="discount_percentage"
              type="number"
              min="0"
              max="100"
              value={formData.discount_percentage}
              onChange={(e) => handleChange("discount_percentage", e.target.value)}
              placeholder="0"
            />
          </div>
        </div>

        {/* Selos e Garantia */}
        <div className="grid md:grid-cols-2 gap-6 items-center">
          <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-lg">
            <Switch id="is_verified" checked={formData.is_verified} onCheckedChange={(checked) => handleChange("is_verified", checked)} />
            <Label htmlFor="is_verified" className="cursor-pointer">
              <span className="font-semibold text-slate-800">Produto Verificado</span>
              <p className="text-sm text-slate-500">Adiciona um selo de verificação e garantia.</p>
            </Label>
          </div>
          <div className="space-y-2">
            <Label htmlFor="warranty_info">Informação de Garantia</Label>
            <Input
              id="warranty_info"
              value={formData.warranty_info}
              onChange={(e) => handleChange("warranty_info", e.target.value)}
              placeholder="Ex: 30 dias, 6 meses, 1 ano"
              disabled={!formData.is_verified}
            />
          </div>
        </div>

        {/* Sales and Reviews */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="sales_count">Quantidade Vendida</Label>
            <Input
              id="sales_count"
              type="number"
              min="0"
              value={formData.sales_count}
              onChange={(e) => handleChange("sales_count", e.target.value)}
              placeholder="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="average_rating">Avaliação Média (0-5)</Label>
            <Input
              id="average_rating"
              type="number"
              step="0.1"
              min="0"
              max="5"
              value={formData.average_rating}
              onChange={(e) => handleChange("average_rating", e.target.value)}
              placeholder="4.5"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reviews_count">Número de Avaliações</Label>
            <Input
              id="reviews_count"
              type="number"
              min="0"
              value={formData.reviews_count}
              onChange={(e) => handleChange("reviews_count", e.target.value)}
              placeholder="0"
            />
          </div>
        </div>

        {/* Descriptions */}
        <div className="space-y-2">
          <Label htmlFor="description">Descrição Resumida</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            placeholder="Descrição que aparece no card do produto..."
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description_popup">Descrição Detalhada (Pop-up)</Label>
          <Textarea
            id="description_popup"
            value={formData.description_popup}
            onChange={(e) => handleChange("description_popup", e.target.value)}
            placeholder="Descrição completa que aparece apenas quando o cliente clica no ícone do olho..."
            rows={5}
          />
        </div>

        {/* NOVO: Campo de Conteúdo Digital condicional */}
        {formData.category === 'digital' && (
          <div className="space-y-2 bg-blue-50 p-4 rounded-lg border border-blue-200">
            <Label htmlFor="digital_content" className="text-blue-800 font-semibold">Conteúdo Digital a ser Entregue</Label>
            <Textarea
              id="digital_content"
              value={formData.digital_content}
              onChange={(e) => handleChange("digital_content", e.target.value)}
              placeholder="Insira aqui o link, texto, código ou qualquer conteúdo que o cliente receberá após a confirmação da entrega."
              rows={5}
              className="bg-white"
            />
            <p className="text-xs text-blue-600">
              Este campo só aparece porque a categoria 'Digital' está selecionada. O conteúdo será entregue ao cliente automaticamente na área "Meus Pedidos" quando você marcar o pedido como 'Entregue'.
            </p>
          </div>
        )}

        {/* Image Uploads */}
        <div className="space-y-2">
          <Label>Imagem Principal *</Label>
          <div className="flex items-center gap-4">
            {formData.image_url && (
              <img src={formData.image_url} alt="Pré-visualização" className="w-32 h-32 object-cover rounded-lg bg-slate-100" />
            )}
            <div className="flex-1">
              <Input id="main-image-upload" type="file" accept="image/*" onChange={handleMainImageChange} disabled={isUploading} className="hidden" />
              <Button asChild variant="outline" disabled={isUploading}>
                <Label htmlFor="main-image-upload" className="cursor-pointer">
                  {isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <UploadCloud className="w-4 h-4 mr-2" />}
                  {isUploading ? "Enviando..." : "Escolher Imagem Principal"}
                </Label>
              </Button>
              <p className="text-xs text-slate-500 mt-2">Faça o upload da imagem principal do produto.</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Imagens Adicionais (Para Detalhes) - Máximo 6</Label>
          <div className="space-y-4">
            {/* Exibir imagens adicionais já carregadas */}
            {formData.additional_images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {formData.additional_images.map((imageUrl, index) => (
                  <div key={index} className="relative">
                    <img
                      src={imageUrl}
                      alt={`Adicional ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg bg-slate-100"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 w-6 h-6"
                      onClick={() => removeAdditionalImage(index)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            
            {/* Botão para adicionar nova imagem - só aparece se tiver menos de 6 */}
            {formData.additional_images.length < 6 && (
              <div>
                <Input id="additional-image-upload" type="file" accept="image/*" onChange={handleAdditionalImageChange} disabled={uploadingAdditional} className="hidden" />
                <Button asChild variant="outline" disabled={uploadingAdditional}>
                  <Label htmlFor="additional-image-upload" className="cursor-pointer">
                    {uploadingAdditional ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <UploadCloud className="w-4 h-4 mr-2" />}
                    {uploadingAdditional ? "Enviando..." : `Adicionar Imagem (${formData.additional_images.length}/6)`}
                  </Label>
                </Button>
                <p className="text-xs text-slate-500 mt-2">
                  Essas imagens aparecerão apenas quando o cliente clicar no ícone do olho. 
                  Máximo de 6 imagens adicionais (total de 7 com a principal).
                </p>
              </div>
            )}

            {/* Aviso quando atingir o limite */}
            {formData.additional_images.length >= 6 && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-blue-700 text-sm font-medium">
                  ✅ Limite máximo de imagens atingido (6/6 adicionais + 1 principal = 7 total)
                </p>
              </div>
            )}
          </div>
        </div>
      
        {/* Product Status Switches */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => handleChange("is_active", checked)}
            />
            <Label htmlFor="is_active">Produto ativo</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_featured"
              checked={formData.is_featured}
              onCheckedChange={(checked) => handleChange("is_featured", checked)}
            />
            <Label htmlFor="is_featured">Produto em destaque</Label>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onCancel}>
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
            <Save className="w-4 h-4 mr-2" />
            {product ? "Atualizar" : "Salvar"}
          </Button>
        </div>
      </form>
    </div>
  );
}
