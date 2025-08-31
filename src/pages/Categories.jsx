
import React, { useState, useEffect, useCallback } from "react";
import { Category } from "@/api/entities";
import { Product } from "@/api/entities";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Toaster, toast } from 'sonner';

import CategoryForm from "../components/categories/CategoryForm";
import CategoryList from "../components/categories/CategoryList";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const navigate = useNavigate();

  const loadData = useCallback(async () => {
    try {
      const [categoriesData, productsData] = await Promise.all([
        Category.list('-created_date'),
        Product.list()
      ]);
      
      setCategories(categoriesData);
      setProducts(productsData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar categorias.");
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

  const handleSubmit = async (categoryData) => {
    try {
      if (editingCategory) {
        await Category.update(editingCategory.id, categoryData);
        toast.success("Categoria atualizada com sucesso!");
      } else {
        // Verificar se o slug já existe
        const existingCategory = categories.find(cat => cat.slug === categoryData.slug);
        if (existingCategory) {
          toast.error("Já existe uma categoria com este identificador!");
          return;
        }
        
        await Category.create(categoryData);
        toast.success("Categoria criada com sucesso!");
      }
      
      setShowForm(false);
      setEditingCategory(null);
      await loadData();
    } catch (error) {
      console.error("Erro ao salvar categoria:", error);
      toast.error("Erro ao salvar categoria.");
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  const handleDelete = async (category) => {
    // Verificar se há produtos nesta categoria
    const productsInCategory = products.filter(product => product.category === category.slug);
    
    if (productsInCategory.length > 0) {
      const confirmed = window.confirm(
        `Esta categoria tem ${productsInCategory.length} produto(s). ` +
        `Se você excluir a categoria, os produtos ficarão sem categoria. ` +
        `Tem certeza que deseja continuar?`
      );
      
      if (!confirmed) {
        return;
      }
    }

    try {
      await Category.delete(category.id);
      
      // Se havia produtos na categoria, avisar que eles ficaram sem categoria
      if (productsInCategory.length > 0) {
        toast.warning(`Categoria excluída. ${productsInCategory.length} produto(s) ficaram sem categoria.`);
      } else {
        toast.success("Categoria excluída com sucesso!");
      }
      
      await loadData();
    } catch (error) {
      console.error("Erro ao excluir categoria:", error);
      toast.error("Erro ao excluir categoria.");
    }
  };

  const handleToggleStatus = async (category) => {
    try {
      await Category.update(category.id, { is_active: !category.is_active });
      toast.success(`Categoria ${category.is_active ? 'desativada' : 'ativada'} com sucesso!`);
      await loadData();
    } catch (error) {
      console.error("Erro ao alterar status:", error);
      toast.error("Erro ao alterar status da categoria.");
    }
  };

  // Calcular quantos produtos há em cada categoria
  const getCategoryProductCount = (categorySlug) => {
    return products.filter(product => product.category === categorySlug).length;
  };

  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <Toaster richColors position="top-right" />
      <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Categorias</h1>
              <p className="text-slate-600">Gerencie as categorias dos seus produtos</p>
            </div>
            <Button 
              onClick={() => {
                setEditingCategory(null);
                setShowForm(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 shadow-lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Nova Categoria
            </Button>
          </div>

          {showForm && (
            <CategoryForm
              category={editingCategory}
              onSubmit={handleSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingCategory(null);
              }}
            />
          )}

          <CategoryList
            categories={categories}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleStatus={handleToggleStatus}
            getCategoryProductCount={getCategoryProductCount}
          />
        </div>
      </div>
    </>
  );
}
