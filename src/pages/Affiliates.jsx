import React, { useState, useEffect, useCallback } from "react";
import { User } from "@/api/entities";
import { Commission } from "@/api/entities";
import { WithdrawalRequest } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Toaster, toast } from 'sonner';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Search
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Affiliates() {
  const [affiliates, setAffiliates] = useState([]);
  const [commissions, setCommissions] = useState([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
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
      const [affiliatesData, commissionsData, withdrawalsData] = await Promise.all([
        User.filter({ is_affiliate: true }),
        Commission.list('-created_date'),
        WithdrawalRequest.list('-created_date')
      ]);
      
      setAffiliates(affiliatesData);
      setCommissions(commissionsData);
      setWithdrawalRequests(withdrawalsData);
    } catch (error) {
      console.error("Erro ao carregar dados de afiliados:", error);
      toast.error("Erro ao carregar dados de afiliados.");
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

  const getAffiliateStats = (affiliateId) => {
    const affiliateCommissions = commissions.filter(c => c.affiliate_id === affiliateId);
    const totalCommissions = affiliateCommissions.reduce((sum, c) => sum + c.commission_amount, 0);
    const pendingCommissions = affiliateCommissions.filter(c => c.status === 'pendente');
    const pendingAmount = pendingCommissions.reduce((sum, c) => sum + c.commission_amount, 0);
    const confirmedCommissions = affiliateCommissions.filter(c => c.status === 'confirmada');
    const confirmedAmount = confirmedCommissions.reduce((sum, c) => sum + c.commission_amount, 0);
    const referralsCount = affiliateCommissions.length;

    return {
      totalCommissions,
      pendingAmount,
      confirmedAmount,
      totalToPay: pendingAmount + confirmedAmount,
      referralsCount,
      pendingCommissions,
      confirmedCommissions
    };
  };

  const handlePayCommission = async (affiliateId) => {
    const stats = getAffiliateStats(affiliateId);
    
    if (stats.pendingCommissions.length === 0 && stats.confirmedCommissions.length === 0) {
      toast.error("Não há comissões para pagar para este afiliado.");
      return;
    }

    const confirmed = window.confirm(
      `Confirmar pagamento de R$ ${stats.totalToPay.toFixed(2)} para este afiliado?\n\n` +
      `Isso marcará ${stats.pendingCommissions.length + stats.confirmedCommissions.length} comissão(ões) como pagas.`
    );

    if (!confirmed) return;

    try {
      // Marcar todas as comissões pendentes e confirmadas como pagas
      const commissionsToUpdate = [...stats.pendingCommissions, ...stats.confirmedCommissions];
      
      for (const commission of commissionsToUpdate) {
        await Commission.update(commission.id, { status: 'paga' });
      }

      toast.success(`Pagamento de R$ ${stats.totalToPay.toFixed(2)} confirmado!`);
      await loadData();
    } catch (error) {
      console.error("Erro ao processar pagamento:", error);
      toast.error("Erro ao processar pagamento.");
    }
  };

  const handleWithdrawalAction = async (withdrawalId, action, notes = '') => {
    try {
      const updateData = { 
        status: action,
        processed_at: new Date().toISOString()
      };
      
      if (notes) {
        updateData.notes = notes;
      }

      // Se aprovando, também marcar comissões como pagas
      if (action === 'pago') {
        const withdrawal = withdrawalRequests.find(w => w.id === withdrawalId);
        if (withdrawal) {
          for (const commissionId of withdrawal.commission_ids) {
            await Commission.update(commissionId, { status: 'paga' });
          }
        }
      }

      await WithdrawalRequest.update(withdrawalId, updateData);
      
      const actionText = action === 'pago' ? 'aprovada e paga' : 
                        action === 'rejeitado' ? 'rejeitada' : action;
      toast.success(`Solicitação ${actionText} com sucesso!`);
      await loadData();
    } catch (error) {
      console.error("Erro ao processar solicitação:", error);
      toast.error("Erro ao processar solicitação.");
    }
  };

  const filteredAffiliates = affiliates.filter(affiliate =>
    affiliate.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    affiliate.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPendingCommissions = commissions
    .filter(c => c.status === 'pendente' || c.status === 'confirmada')
    .reduce((sum, c) => sum + c.commission_amount, 0);

  const totalPaidCommissions = commissions
    .filter(c => c.status === 'paga')
    .reduce((sum, c) => sum + c.commission_amount, 0);

  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`p-6 space-y-6 min-h-screen transition-colors duration-300 ${
      darkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-slate-50 to-blue-50'
    }`}>
      <Toaster richColors position="top-right" />
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            Gestão de Afiliados
          </h1>
          <p className={`${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>
            Gerencie afiliados, comissões e solicitações de saque
          </p>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className={`${darkMode ? 'bg-gray-800/80 backdrop-blur-sm' : 'bg-white/80 backdrop-blur-sm'}`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total de Afiliados</CardTitle>
              <Users className="w-4 h-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{affiliates.length}</div>
            </CardContent>
          </Card>

          <Card className={`${darkMode ? 'bg-gray-800/80 backdrop-blur-sm' : 'bg-white/80 backdrop-blur-sm'}`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Comissões a Pagar</CardTitle>
              <Clock className="w-4 h-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                R$ {totalPendingCommissions.toFixed(2).replace('.', ',')}
              </div>
            </CardContent>
          </Card>

          <Card className={`${darkMode ? 'bg-gray-800/80 backdrop-blur-sm' : 'bg-white/80 backdrop-blur-sm'}`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Comissões Pagas</CardTitle>
              <CheckCircle className="w-4 h-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                R$ {totalPaidCommissions.toFixed(2).replace('.', ',')}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="affiliates" className="w-full">
          <TabsList className={`grid w-full grid-cols-2 ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
            <TabsTrigger value="affiliates">Afiliados</TabsTrigger>
            <TabsTrigger value="withdrawals">Solicitações de Saque</TabsTrigger>
          </TabsList>

          <TabsContent value="affiliates" className="mt-6">
            {/* Busca */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar afiliados..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`pl-10 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white'}`}
                />
              </div>
            </div>

            {/* Lista de Afiliados */}
            <div className="grid gap-6">
              {filteredAffiliates.map(affiliate => {
                const stats = getAffiliateStats(affiliate.id);
                return (
                  <Card key={affiliate.id} className={`${darkMode ? 'bg-gray-800/80 backdrop-blur-sm' : 'bg-white/80 backdrop-blur-sm'}`}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                              {affiliate.full_name?.[0]?.toUpperCase() || 'A'}
                            </div>
                            <div>
                              <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                {affiliate.full_name}
                              </h3>
                              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                {affiliate.email}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Clientes Indicados</p>
                              <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                {stats.referralsCount} vendas
                              </p>
                            </div>
                            <div>
                              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Gerado</p>
                              <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                R$ {stats.totalCommissions.toFixed(2).replace('.', ',')}
                              </p>
                            </div>
                            <div>
                              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Pendente</p>
                              <p className="font-semibold text-orange-600">
                                R$ {stats.pendingAmount.toFixed(2).replace('.', ',')}
                              </p>
                            </div>
                            <div>
                              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Confirmado</p>
                              <p className="font-semibold text-blue-600">
                                R$ {stats.confirmedAmount.toFixed(2).replace('.', ',')}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          {stats.totalToPay > 0 && (
                            <Button
                              onClick={() => handlePayCommission(affiliate.id)}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Pagar R$ {stats.totalToPay.toFixed(2)}
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="withdrawals" className="mt-6">
            <div className="space-y-4">
              {withdrawalRequests.map(withdrawal => {
                const affiliate = affiliates.find(a => a.id === withdrawal.affiliate_id);
                const statusColors = {
                  pendente: 'bg-yellow-100 text-yellow-800',
                  aprovado: 'bg-blue-100 text-blue-800', 
                  pago: 'bg-green-100 text-green-800',
                  rejeitado: 'bg-red-100 text-red-800'
                };

                return (
                  <Card key={withdrawal.id} className={`${darkMode ? 'bg-gray-800/80 backdrop-blur-sm' : 'bg-white/80 backdrop-blur-sm'}`}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <Badge className={statusColors[withdrawal.status]}>
                              {withdrawal.status.toUpperCase()}
                            </Badge>
                            <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              {affiliate?.full_name || 'Afiliado não encontrado'}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                            <div>
                              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Valor</p>
                              <p className={`font-semibold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                R$ {withdrawal.amount.toFixed(2).replace('.', ',')}
                              </p>
                            </div>
                            <div>
                              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Chave PIX</p>
                              <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                {withdrawal.pix_key}
                              </p>
                            </div>
                            <div>
                              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Solicitado em</p>
                              <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                {format(new Date(withdrawal.created_date), 'dd/MM/yyyy', { locale: ptBR })}
                              </p>
                            </div>
                            <div>
                              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Comissões</p>
                              <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                {withdrawal.commission_ids.length} itens
                              </p>
                            </div>
                          </div>

                          {withdrawal.notes && (
                            <div className="mt-3">
                              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Observações:</p>
                              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{withdrawal.notes}</p>
                            </div>
                          )}
                        </div>

                        {withdrawal.status === 'pendente' && (
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleWithdrawalAction(withdrawal.id, 'pago')}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Aprovar e Pagar
                            </Button>
                            <Button
                              onClick={() => {
                                const notes = prompt("Motivo da rejeição (opcional):");
                                handleWithdrawalAction(withdrawal.id, 'rejeitado', notes || '');
                              }}
                              size="sm"
                              variant="destructive"
                            >
                              Rejeitar
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              {withdrawalRequests.length === 0 && (
                <div className="text-center py-12">
                  <DollarSign className={`w-16 h-16 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                  <h3 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Nenhuma solicitação de saque
                  </h3>
                  <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    As solicitações de saque dos afiliados aparecerão aqui.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}