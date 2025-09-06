
import React, { useState, useEffect, useCallback } from "react";
import { Settings as SettingsEntity } from "@/api/entities";
import { PaymentMethod } from "@/api/entities";
import { User } from "@/api/entities";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import MercadoPagoForm from "../components/settings/MercadoPagoForm";
import StoreCustomizationForm from "../components/settings/StoreCustomizationForm";
import AdvancedCustomization from "../components/settings/AdvancedCustomization";
import PaymentMethodList from "../components/settings/PaymentMethodList";
import PaymentMethodForm from "../components/settings/PaymentMethodForm";
import { Toaster, toast } from 'sonner';
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Settings() {
  const [settings, setSettings] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [editingPaymentMethod, setEditingPaymentMethod] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const navigate = useNavigate();

  const loadSettings = useCallback(async () => {
    try {
      const [settingsList, paymentMethodsData] = await Promise.all([
        SettingsEntity.list(),
        PaymentMethod.list('-created_date')
      ]);

      if (settingsList.length > 0) {
        setSettings(settingsList[0]);
      } else {
        setSettings(null);
      }
      setPaymentMethods(paymentMethodsData);
    } catch (error) {
      console.error("Erro ao carregar configurações:", error);
      toast.error("Não foi possível carregar as configurações.");
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
      await loadSettings();
    } catch (error) {
      await User.loginWithRedirect(window.location.href);
    } finally {
      setCheckingAuth(false);
    }
  }, [navigate, loadSettings]);

  useEffect(() => {
    checkAdminAccess();
  }, [checkAdminAccess]);
  
  const handleSaveSettings = async (data) => {
    setIsSaving(true);
    try {
      if (settings && settings.id) {
        await SettingsEntity.update(settings.id, { ...settings, ...data });
      } else {
        await SettingsEntity.create(data);
      }
      toast.success("Configurações salvas com sucesso!");
      await loadSettings();
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      toast.error("Falha ao salvar as configurações.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePaymentMethod = async (data) => {
    setIsSaving(true);
    try {
        if(editingPaymentMethod) {
            await PaymentMethod.update(editingPaymentMethod.id, data);
            toast.success("Forma de pagamento atualizada!");
        } else {
            await PaymentMethod.create(data);
            toast.success("Nova forma de pagamento adicionada!");
        }
        setShowPaymentForm(false);
        setEditingPaymentMethod(null);
        await loadSettings();
    } catch (error) {
        console.error("Erro ao salvar forma de pagamento:", error);
        toast.error("Falha ao salvar a forma de pagamento.");
    } finally {
        setIsSaving(false);
    }
  };
  
  const handleDeletePaymentMethod = async (id) => {
      if(window.confirm("Tem certeza que deseja excluir esta forma de pagamento?")) {
          try {
              await PaymentMethod.delete(id);
              toast.success("Forma de pagamento excluída.");
              await loadSettings();
          } catch(error) {
              console.error("Erro ao excluir:", error);
              toast.error("Falha ao excluir.");
          }
      }
  };

  const handleEditPaymentMethod = (method) => {
      setEditingPaymentMethod(method);
      setShowPaymentForm(true);
  };

  if (checkingAuth || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <Toaster richColors position="top-right" />
      <div className="p-6 space-y-8 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">Configurações</h1>
            <p className="text-slate-600 dark:text-slate-400">Gerencie as integrações e a aparência da sua loja.</p>
          </div>

          <div className="space-y-8">
            <StoreCustomizationForm
              initialSettings={settings}
              onSave={handleSaveSettings}
              isSaving={isSaving}
            />
            
            <MercadoPagoForm
              initialSettings={settings}
              onSave={handleSaveSettings}
              isSaving={isSaving}
            />
            
            <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mt-8 mb-4">Formas de Pagamento Adicionais</h2>
                <PaymentMethodList 
                    methods={paymentMethods}
                    onEdit={handleEditPaymentMethod}
                    onDelete={handleDeletePaymentMethod}
                />

                {showPaymentForm ? (
                    <PaymentMethodForm 
                        method={editingPaymentMethod}
                        onSubmit={handleSavePaymentMethod}
                        onCancel={() => { setShowPaymentForm(false); setEditingPaymentMethod(null); }}
                        isSaving={isSaving}
                    />
                ) : (
                    <Button onClick={() => setShowPaymentForm(true)} variant="outline" className="w-full">
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar Outra Forma de Pagamento
                    </Button>
                )}
            </div>

            <AdvancedCustomization
              initialSettings={settings}
              onSave={handleSaveSettings}
              isSaving={isSaving}
            />
          </div>
        </div>
      </div>
    </>
  );
}
