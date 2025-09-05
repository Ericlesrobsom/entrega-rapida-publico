
import React, { useState, useEffect, useCallback } from "react";
import { Coupon } from "@/api/entities";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Toaster, toast } from 'sonner';

import CouponForm from "../components/coupons/CouponForm";
import CouponList from "../components/coupons/CouponList";

export default function Coupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
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
      const data = await Coupon.list('-created_date');
      setCoupons(data);
    } catch (error) {
      console.error("Erro ao carregar cupons:", error);
      toast.error("Erro ao carregar cupons.");
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

  const handleSubmit = async (couponData) => {
    try {
      // Verificar se o código já existe
      const existingCoupons = coupons.filter(c => 
        c.code.toLowerCase() === couponData.code.toLowerCase() && 
        (!editingCoupon || c.id !== editingCoupon.id)
      );
      
      if (existingCoupons.length > 0) {
        toast.error("Já existe um cupom com este código!");
        return;
      }

      if (editingCoupon) {
        await Coupon.update(editingCoupon.id, couponData);
        toast.success("Cupom atualizado com sucesso!");
      } else {
        await Coupon.create({
          ...couponData,
          current_uses: 0 // Sempre inicia com 0 usos
        });
        toast.success("Cupom criado com sucesso!");
      }
      
      setShowForm(false);
      setEditingCoupon(null);
      await loadData();
    } catch (error) {
      console.error("Erro ao salvar cupom:", error);
      toast.error("Erro ao salvar cupom.");
    }
  };

  const handleEdit = (coupon) => {
    setEditingCoupon(coupon);
    setShowForm(true);
  };

  const handleDelete = async (coupon) => {
    const usedCount = coupon.current_uses || 0;
    const confirmMessage = usedCount > 0 
      ? `Este cupom já foi usado ${usedCount} vez(es). Tem certeza que deseja excluí-lo?`
      : `Tem certeza que deseja excluir o cupom "${coupon.code}"?`;
      
    if (window.confirm(confirmMessage)) {
      try {
        await Coupon.delete(coupon.id);
        toast.success("Cupom excluído com sucesso!");
        await loadData();
      } catch (error) {
        console.error("Erro ao excluir cupom:", error);
        toast.error("Erro ao excluir cupom.");
      }
    }
  };

  const handleToggleStatus = async (coupon) => {
    try {
      await Coupon.update(coupon.id, { is_active: !coupon.is_active });
      toast.success(`Cupom ${coupon.is_active ? 'desativado' : 'ativado'} com sucesso!`);
      await loadData();
    } catch (error) {
      console.error("Erro ao alterar status:", error);
      toast.error("Erro ao alterar status do cupom.");
    }
  };

  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`p-6 space-y-6 min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-slate-50 to-blue-50'}`}>
      <Toaster richColors position="top-right" />
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Cupons de Desconto</h1>
            <p className={`${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>Crie e gerencie cupons promocionais para sua loja</p>
          </div>
          <Button 
            onClick={() => {
              setEditingCoupon(null);
              setShowForm(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 shadow-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Novo Cupom
          </Button>
        </div>

        {showForm && (
          <CouponForm
            coupon={editingCoupon}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingCoupon(null);
            }}
          />
        )}

        <CouponList
          coupons={coupons}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
        />
      </div>
    </div>
  );
}
