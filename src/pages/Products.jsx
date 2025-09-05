
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
import { DeliveryMethod } from "@/api/entities";
import { toast } from "sonner";

import ProductForm from "../components/products/ProductForm";
import ProductGrid from "../components/products/ProductGrid";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [deliveryMethods, setDeliveryMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setDarkMode(isDark);
    const observer = new MutationObserver(() => {
      setDarkMode(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [productsData, categoriesData, deliveryMethodsData] = await Promise.all([
        Product.list('-created_date'),
        Category.filter({ is_active: true }),
        DeliveryMethod.filter({ is_active: true })
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
      setDeliveryMethods(deliveryMethodsData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const checkAdminAccess = useCallback(async () => {
    try {
      const user = await User.me();
      if (user.role !== 'admin') {
        navigate(createPageUrl("Store"));
        return;
      }
      await loadData();
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
        toast.success("Produto atualizado com sucesso!");
      } else {
        await Product.create(productData);
        toast.success("Produto criado com sucesso!");
      }
      setShowForm(false);
      setEditingProduct(null);
      await loadData();
    } catch (error) {
      console.error("Erro ao salvar produto:", error);
      toast.error("Erro ao salvar produto.");
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleToggleStatus = async (product) => {
    try {
      await Product.update(product.id, { is_active: !product.is_active });
      toast.success(`Produto ${product.is_active ? 'desativado' : 'ativado'} com sucesso!`);
      await loadData();
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      toast.error("Erro ao atualizar status do produto.");
    }
  };

  const handleDelete = async (product) => {
    const confirmed = window.confirm(
      `⚠️ ATENÇÃO: EXCLUSÃO PERMANENTE ⚠️\n\n` +
      `Tem certeza que deseja excluir PERMANENTEMENTE "${product.name}"?\n\n` +
      `Esta ação NÃO PODE SER DESFEITA!`
    );
    
    if (!confirmed) return;

    try {
      await Product.delete(product.id);
      toast.success(`"${product.name}" foi excluído permanentemente.`);
      loadData();
    } catch (error) {
      console.error("Erro ao excluir produto:", error);
      toast.error("Erro ao excluir produto.");
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
    <div className={`p-6 space-y-6 min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-slate-50 to-blue-50'}`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Produtos</h1>
            <p className={`${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>Gerencie o catálogo da sua loja</p>
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
        <div className={`flex flex-col md:flex-row gap-4 mb-6 p-4 rounded-lg shadow-sm ${darkMode ? 'bg-gray-800/50' : 'bg-white/70'}`}>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`pl-10 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white'}`}
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className={`w-full md:w-48 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white'}`}>
              <SelectValue placeholder="Filtrar categoria" />
            </SelectTrigger>
            <SelectContent className={`${darkMode ? 'bg-gray-800 border-gray-700 text-white' : ''}`}>
              <SelectItem value="all">Todas Categorias</SelectItem>
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
            deliveryMethods={deliveryMethods}
          />
        )}

        <ProductGrid
          products={filteredProducts}
          loading={loading}
          onEdit={handleEdit}
          onToggleStatus={handleToggleStatus}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}
