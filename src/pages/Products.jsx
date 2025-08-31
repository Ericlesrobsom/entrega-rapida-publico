import React, { useState, useEffect, useCallback } from "react";
import { Product } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/api/entities";
import { Category } from "@/api/entities";
import { DeliveryMethod } from "@/api/entities"; // Importar

import ProductForm from "../components/products/ProductForm";
import ProductGrid from "../components/products/ProductGrid";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [deliveryMethods, setDeliveryMethods] = useState([]); // Adicionar estado
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [checkingAuth, setCheckingAuth] = useState(true);
  const navigate = useNavigate();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Carregar produtos, categorias e métodos de entrega em paralelo
      const [productsData, categoriesData, deliveryMethodsData] = await Promise.all([
        Product.list('-created_date'),
        Category.filter({ is_active: true }),
        DeliveryMethod.filter({ is_active: true }) // Carregar métodos de entrega
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
      setDeliveryMethods(deliveryMethodsData); // Salvar métodos de entrega
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const checkAdminAccess = useCallback(async () => {
    try {
      const user = await User.me();
      if (user.email !== 'ericlesrobsom03@gmail.com') {
        navigate(createPageUrl("Store"));
        return;
      }
      await loadData(); // Usar a nova função loadData
    } catch (error) {
      await User.loginWithRedirect(window.location.href);
    } finally {
      setCheckingAuth(false);
    }
  }, [navigate, loadData]);

  useEffect(() => {
    checkAdminAccess();
  }, [checkAdminAccess]);

  const handleSubmit = async (productData) => {
    try {
      if (editingProduct) {
        await Product.update(editingProduct.id, productData);
      } else {
        await Product.create(productData);
      }
      setShowForm(false);
      setEditingProduct(null);
      await loadData(); // Recarregar dados
    } catch (error) {
      console.error("Erro ao salvar produto:", error);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleToggleStatus = async (product) => {
    try {
      await Product.update(product.id, { is_active: !product.is_active });
      await loadData(); // Recarregar dados
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Produtos</h1>
            <p className="text-slate-600">Gerencie o catálogo da sua loja</p>
          </div>
          <Button 
            onClick={() => {
              setEditingProduct(null);
              setShowForm(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 shadow-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Novo Produto
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Filtrar categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas Categorias</SelectItem>
              {/* Mapear categorias dinâmicas */}
              {categories.map(category => (
                <SelectItem key={category.id} value={category.slug}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {showForm && (
          <ProductForm
            product={editingProduct}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingProduct(null);
            }}
            categories={categories}
            deliveryMethods={deliveryMethods} // Passar para o formulário
          />
        )}

        <ProductGrid
          products={filteredProducts}
          loading={loading}
          onEdit={handleEdit}
          onToggleStatus={handleToggleStatus}
        />
      </div>
    </div>
  );
}