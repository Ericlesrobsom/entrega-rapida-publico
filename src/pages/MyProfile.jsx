
import React, { useState, useEffect, useCallback } from 'react';
import { User } from '@/api/entities';
import { Order } from '@/api/entities';
import { Commission } from '@/api/entities';
import { WithdrawalRequest } from '@/api/entities';
import { Course } from '@/api/entities';
import { CourseAccess } from '@/api/entities';
import { UploadFile } from '@/api/integrations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Toaster, toast } from 'sonner';
import { Loader2, Upload, ShoppingBag, Copy, Users, DollarSign, Gift, BookOpen, Play, User as UserIcon, Edit } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Tabs, TabsContent, TabsTrigger, TabsList } from "@/components/ui/tabs"; // Corrected import for TabsList
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

function AffiliateDashboard({ user, darkMode }) {
    const [referrals, setReferrals] = useState([]);
    const [commissions, setCommissions] = useState([]);
    const [withdrawalRequests, setWithdrawalRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showWithdrawalForm, setShowWithdrawalForm] = useState(false);
    const [withdrawalData, setWithdrawalData] = useState({
        pix_key: '',
        amount: 0
    });
    const [isSubmittingWithdrawal, setIsSubmittingWithdrawal] = useState(false);

    const affiliateLink = `${window.location.origin}${createPageUrl('Store')}?ref=${user.id}`;

    const loadAffiliateData = useCallback(async () => {
        setLoading(true);
        try {
            const [referralsData, commissionsData, withdrawalsData] = await Promise.all([
                User.filter({ referred_by: user.id }),
                Commission.filter({ affiliate_id: user.id }, '-created_date'),
                WithdrawalRequest.filter({ affiliate_id: user.id }, '-created_date')
            ]);
            setReferrals(referralsData);
            setCommissions(commissionsData);
            setWithdrawalRequests(withdrawalsData);
        } catch (error) {
            toast.error("Erro ao carregar dados de afiliado.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [user.id]);

    useEffect(() => {
        if (user.is_affiliate) {
            loadAffiliateData();
        }
    }, [user.is_affiliate, loadAffiliateData]);

    // Calcular comissões disponíveis para saque
    const getAvailableWithdrawal = () => {
        const now = new Date();
        
        const availableCommissions = commissions.filter(commission => {
            // Comissão deve estar confirmada
            if (commission.status !== 'confirmada') return false;
            
            // Verificar se já passou a data de liberação explícita
            if (commission.available_for_withdrawal_at) {
                const availableDate = new Date(commission.available_for_withdrawal_at);
                return now >= availableDate;
            }
            
            // Fallback para comissões antigas (usar data de criação + 7 dias)
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            const commissionDate = new Date(commission.created_date);
            return commissionDate <= sevenDaysAgo;
        });

        const availableAmount = availableCommissions.reduce((sum, c) => sum + c.commission_amount, 0);
        
        return {
            availableCommissions,
            availableAmount
        };
    };

    // Calcular total de comissões (pendente + confirmada)
    const totalCommission = commissions.reduce((sum, c) => {
        return (c.status === 'pendente' || c.status === 'confirmada') ? sum + c.commission_amount : sum;
    }, 0);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(affiliateLink);
        toast.success("Link copiado para a área de transferência!");
    };
    
    const formatDate = (dateString) => {
      if (!dateString) return '';
      return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    };

    const formatDateTime = (dateString) => {
      if (!dateString) return '';
      return new Date(dateString).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const getCommissionStatusDisplay = (commission) => {
        if (commission.status === 'pendente') {
            return {
                label: 'Aguardando Entrega',
                color: 'bg-orange-200 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
                description: 'Produto ainda não foi entregue'
            };
        }
        
        if (commission.status === 'confirmada') {
            const now = new Date();
            const effectiveAvailableDate = commission.available_for_withdrawal_at 
                ? new Date(commission.available_for_withdrawal_at)
                : new Date(new Date(commission.created_date).getTime() + 7 * 24 * 60 * 60 * 1000);
            
            const isAvailable = now >= effectiveAvailableDate;
            
            return {
                label: isAvailable ? 'Liberada para Saque' : 'Confirmada',
                color: isAvailable ? 'bg-green-200 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-blue-200 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
                description: isAvailable 
                    ? 'Disponível para saque'
                    : `Liberada em ${formatDateTime(effectiveAvailableDate)}`
            };
        }
        
        if (commission.status === 'paga') {
            return {
                label: 'Paga',
                color: 'bg-green-200 text-green-800 dark:bg-green-900 dark:text-green-300',
                description: 'Comissão já foi paga'
            };
        }
        
        return {
            label: commission.status,
            color: 'bg-gray-200 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
            description: ''
        };
    };

    const { availableCommissions, availableAmount } = getAvailableWithdrawal();
    const withdrawalInfo = { availableCommissions, availableAmount, canWithdraw: availableAmount >= 100 };

    const handleWithdrawalRequest = async () => {
        if (!withdrawalInfo.canWithdraw) {
            toast.error("Você precisa ter pelo menos R$ 100,00 disponíveis para solicitar saque.");
            return;
        }

        if (!withdrawalData.pix_key.trim()) {
            toast.error("Por favor, informe sua chave PIX.");
            return;
        }

        setIsSubmittingWithdrawal(true);
        try {
            await WithdrawalRequest.create({
                affiliate_id: user.id,
                amount: withdrawalInfo.availableAmount,
                commission_ids: withdrawalInfo.availableCommissions.map(c => c.id),
                pix_key: withdrawalData.pix_key.trim(),
                status: 'pendente'
            });

            toast.success("Solicitação de saque enviada com sucesso!");
            setShowWithdrawalForm(false);
            setWithdrawalData({ pix_key: '', amount: 0 });
            loadAffiliateData();
        } catch (error) {
            console.error("Erro ao solicitar saque:", error);
            toast.error("Erro ao enviar solicitação de saque.");
        } finally {
            setIsSubmittingWithdrawal(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Link de Afiliado */}
            <Card className={`${darkMode ? 'bg-gray-800/80 backdrop-blur-sm border-gray-700/50' : 'bg-white/80 backdrop-blur-sm border-gray-200/50'}`}>
                <CardHeader>
                    <CardTitle>Seu Link de Afiliado</CardTitle>
                    <CardDescription className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                        Compartilhe este link. Qualquer pessoa que se cadastrar e comprar através dele irá gerar comissões para você.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center space-x-2">
                        <Input value={affiliateLink} readOnly className={`${darkMode ? 'bg-gray-700 border-gray-600' : ''}`} />
                        <Button onClick={copyToClipboard} size="icon">
                            <Copy className="h-4 w-4" />
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Cards de Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className={`${darkMode ? 'bg-gray-800/80 backdrop-blur-sm border-gray-700/50' : 'bg-white/80 backdrop-blur-sm border-gray-200/50'}`}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Comissão Total</CardTitle>
                        <DollarSign className="w-4 h-4 text-gray-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">R$ {totalCommission.toFixed(2).replace('.', ',')}</div>
                        <p className="text-xs text-gray-500">Valor total de comissões pendentes + confirmadas.</p>
                    </CardContent>
                </Card>

                <Card className={`${darkMode ? 'bg-gray-800/80 backdrop-blur-sm border-gray-700/50' : 'bg-white/80 backdrop-blur-sm border-gray-200/50'}`}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Disponível para Saque</CardTitle>
                        <Gift className="w-4 h-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            R$ {withdrawalInfo.availableAmount.toFixed(2).replace('.', ',')}
                        </div>
                        <p className="text-xs text-gray-500">
                            {withdrawalInfo.canWithdraw 
                                ? 'Você pode solicitar saque!' 
                                : 'Mínimo R$ 100,00 para saque'}
                        </p>
                    </CardContent>
                </Card>

                <Card className={`${darkMode ? 'bg-gray-800/80 backdrop-blur-sm border-gray-700/50' : 'bg-white/80 backdrop-blur-sm border-gray-200/50'}`}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Clientes Indicados</CardTitle>
                        <Users className="w-4 h-4 text-gray-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{referrals.length}</div>
                        <p className="text-xs text-gray-500">Pessoas que se cadastraram pelo seu link.</p>
                    </CardContent>
                </Card>
            </div>

            {/* Botão de Saque */}
            {withdrawalInfo.canWithdraw && (
                <Card className={`${darkMode ? 'bg-gray-800/80 backdrop-blur-sm border-gray-700/50' : 'bg-white/80 backdrop-blur-sm border-gray-200/50'}`}>
                    <CardHeader>
                        <CardTitle className="text-green-600">💰 Saque Disponível!</CardTitle>
                        <CardDescription>
                            Você tem R$ {withdrawalInfo.availableAmount.toFixed(2).replace('.', ',')} disponíveis para saque.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {!showWithdrawalForm ? (
                            <Button 
                                onClick={() => setShowWithdrawalForm(true)}
                                className="bg-green-600 hover:bg-green-700"
                                disabled={loading}
                            >
                                Solicitar Saque de R$ {withdrawalInfo.availableAmount.toFixed(2).replace('.', ',')}
                            </Button>
                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Chave PIX para recebimento *
                                    </label>
                                    <Input
                                        placeholder="Informe sua chave PIX (CPF, e-mail, telefone ou chave aleatória)"
                                        value={withdrawalData.pix_key}
                                        onChange={(e) => setWithdrawalData({...withdrawalData, pix_key: e.target.value})}
                                        className={darkMode ? 'bg-gray-700 border-gray-600' : ''}
                                        disabled={isSubmittingWithdrawal}
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <Button 
                                        onClick={handleWithdrawalRequest}
                                        disabled={isSubmittingWithdrawal || !withdrawalData.pix_key.trim()}
                                        className="bg-green-600 hover:bg-green-700"
                                    >
                                        {isSubmittingWithdrawal ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Enviando...
                                            </>
                                        ) : (
                                            `Confirmar Saque de R$ ${withdrawalInfo.availableAmount.toFixed(2).replace('.', ',')}`
                                        )}
                                    </Button>
                                    <Button 
                                        variant="outline" 
                                        onClick={() => setShowWithdrawalForm(false)}
                                        disabled={isSubmittingWithdrawal}
                                    >
                                        Cancelar
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Histórico de Saques */}
            {withdrawalRequests.length > 0 && (
                <Card className={`${darkMode ? 'bg-gray-800/80 backdrop-blur-sm border-gray-700/50' : 'bg-white/80 backdrop-blur-sm border-gray-200/50'}`}>
                    <CardHeader>
                        <CardTitle>Histórico de Saques</CardTitle>
                        <CardDescription className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                            Acompanhe suas solicitações de saque.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {withdrawalRequests.map(request => {
                                const statusColors = {
                                    pendente: 'bg-yellow-200 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
                                    aprovado: 'bg-blue-200 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
                                    pago: 'bg-green-200 text-green-800 dark:bg-green-900 dark:text-green-300',
                                    rejeitado: 'bg-red-200 text-red-800 dark:bg-red-900 dark:text-red-300'
                                };

                                return (
                                    <div key={request.id} className={`p-4 rounded-md border ${darkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-semibold text-lg">
                                                    R$ {request.amount.toFixed(2).replace('.', ',')}
                                                </p>
                                                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                    Solicitado em {formatDate(request.created_date)}
                                                </p>
                                                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                    PIX: {request.pix_key}
                                                </p>
                                            </div>
                                            <Badge className={statusColors[request.status]}>
                                                {request.status.toUpperCase()}
                                            </Badge>
                                        </div>
                                        {request.notes && (
                                            <div className="mt-2">
                                                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                    Observações: {request.notes}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Histórico de Comissões */}
            <Card className={`${darkMode ? 'bg-gray-800/80 backdrop-blur-sm border-gray-700/50' : 'bg-white/80 backdrop-blur-sm border-gray-200/50'}`}>
                <CardHeader>
                    <CardTitle>Histórico de Comissões</CardTitle>
                    <CardDescription className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                        Veja aqui todas as comissões geradas pelas compras dos seus indicados.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-4">
                            <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                        </div>
                    ) : commissions.length > 0 ? (
                        <ul className="space-y-3">
                            {commissions.map(commission => {
                                const statusInfo = getCommissionStatusDisplay(commission);
                                
                                return (
                                    <li key={commission.id} className={`p-4 rounded-md border ${darkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <p className="font-semibold">
                                                    Venda para: <span className="font-normal">{commission.referred_user_email}</span>
                                                </p>
                                                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                    Pedido #{commission.order_id ? commission.order_id.slice(-6).toUpperCase() : 'N/A'} - {formatDate(commission.created_date)}
                                                </p>
                                                
                                                {/* Informações sobre disponibilidade para saque */}
                                                <div className="mt-2">
                                                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                        {statusInfo.description}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right ml-4">
                                                <p className="font-bold text-green-500 mb-2">
                                                    + R$ {commission.commission_amount.toFixed(2).replace('.', ',')}
                                                </p>
                                                <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusInfo.color}`}>
                                                    {statusInfo.label}
                                                </span>
                                            </div>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    ) : (
                        <p className={`text-center py-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Nenhuma comissão gerada ainda.
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

function MyCoursesSection({ user, darkMode }) {
  const [courseAccesses, setCourseAccesses] = useState([]);
  const [courses, setCourses] = useState({});
  const [loading, setLoading] = useState(true);

  const loadMyCourses = useCallback(async () => {
    if (!user?.email) {
      console.log('Sem email do usuário');
      setLoading(false);
      return;
    }
    
    setLoading(true);
    console.log('🔍 Buscando cursos para:', user.email);
    
    try {
      // Buscar acessos do usuário
      const accessData = await CourseAccess.filter({
        student_email: user.email,
        is_active: true
      });
      
      console.log('📚 Acessos encontrados:', accessData.length, accessData);
      setCourseAccesses(accessData);

      if (accessData.length > 0) {
        // Buscar detalhes de cada curso
        const coursesById = {};
        
        for (const access of accessData) {
          try {
            console.log('🎓 Carregando curso:', access.course_id);
            const courseResults = await Course.filter({ id: access.course_id });
            
            if (courseResults.length > 0) {
              coursesById[access.course_id] = courseResults[0];
              console.log('✅ Curso carregado:', courseResults[0].title);
            } else {
              console.log('❌ Curso não encontrado:', access.course_id);
            }
          } catch (error) {
            console.error(`❌ Erro ao carregar curso ${access.course_id}:`, error);
          }
        }
        
        console.log('📖 Cursos finais:', Object.keys(coursesById).length, coursesById);
        setCourses(coursesById);
      } else {
        setCourses({});
      }
    } catch (error) {
      console.error("❌ Erro ao carregar cursos do usuário:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.email]);

  useEffect(() => {
    loadMyCourses();
  }, [loadMyCourses]);

  const handleAccessCourse = (courseId) => {
    console.log('🎬 Acessando curso:', courseId);
    window.location.href = `/CoursePlayer?courseId=${courseId}`;
  };

  if (loading) {
    return (
      <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            <BookOpen className="w-5 h-5" /> Meus Cursos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className={`h-24 rounded-lg animate-pulse ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
            <div className={`h-24 rounded-lg animate-pulse ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (courseAccesses.length === 0) {
    return (
      <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            <BookOpen className="w-5 h-5" /> Meus Cursos
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-10">
          <BookOpen className={`w-12 h-12 mx-auto mb-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
          <p className={`mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Você ainda não possui nenhum curso.</p>
          <Button onClick={() => window.location.href = '/'}>Explorar Cursos</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
      <CardHeader>
        <CardTitle className={`flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          <BookOpen className="w-5 h-5" /> Meus Cursos ({courseAccesses.length})
        </CardTitle>
        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Acesse seus cursos comprados aqui.</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {courseAccesses.map((access) => {
          const course = courses[access.course_id];
          if (!course) {
            return (
              <div key={access.id} className={`border rounded-lg p-4 ${darkMode ? 'border-gray-600 bg-gray-700/50' : 'border-gray-200 bg-gray-50'}`}>
                <p>Carregando curso...</p>
              </div>
            );
          }

          return (
            <div key={access.id} className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${darkMode ? 'border-gray-600 bg-gray-700/50' : 'border-gray-200 bg-gray-50'}`}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <h4 className={`font-semibold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{course.title}</h4>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-full">
                      <div className={`flex justify-between text-xs mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        <span>Progresso</span>
                        <span>{access.progress || 0}%</span>
                      </div>
                      <Progress value={access.progress || 0} className="h-2" />
                    </div>
                  </div>
                </div>
                <Button onClick={() => handleAccessCourse(course.id)} className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
                  <Play className="w-4 h-4 mr-2" /> Assistir
                </Button>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

export default function MyProfile() {
    const [user, setUser] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [darkMode, setDarkMode] = useState(true); // PADRÃO ESCURO COMO A LOJA
    const [isBecomingAffiliate, setIsBecomingAffiliate] = useState(false);

    useEffect(() => {
        // Carrega preferência de tema e aplica
        const applyTheme = () => {
            if (typeof window === 'undefined') return;
            const savedDarkMode = localStorage.getItem('darkMode');
            // Se não houver preferência salva, usa escuro como padrão
            const isDark = savedDarkMode === null ? true : JSON.parse(savedDarkMode);
            
            setDarkMode(isDark);

            if (savedDarkMode === null) {
                localStorage.setItem('darkMode', JSON.stringify(true));
            }

            if (isDark) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        };
        
        applyTheme();

        // Ouve mudanças no localStorage para sincronizar tema entre abas
        const handleStorageChange = (e) => {
            if (e.key === 'darkMode') {
                applyTheme();
            }
        };

        if (typeof window !== 'undefined') {
            window.addEventListener('storage', handleStorageChange);
        }

        loadInitialData();

        return () => {
            if (typeof window !== 'undefined') {
                window.removeEventListener('storage', handleStorageChange);
            }
        };
    }, []);

    const loadInitialData = async () => {
        setLoading(true);
        try {
            const currentUser = await User.me();
            setUser(currentUser);
            const userOrders = await Order.filter({ customer_email: currentUser.email }, '-created_date');
            setOrders(userOrders);
        } catch (error) {
            console.error("Erro ao carregar dados do perfil:", error);
            await User.loginWithRedirect(window.location.href);
        } finally {
            setLoading(false);
        }
    };

    const handleBecomeAffiliate = async () => {
        setIsBecomingAffiliate(true);
        try {
            await User.updateMyUserData({ is_affiliate: true });
            toast.success("Parabéns! Você agora é um afiliado.", {
                description: "Seu painel de afiliado já está disponível.",
            });
            // Recarrega os dados do usuário
            const updatedUser = await User.me();
            setUser(updatedUser);
        } catch (error) {
            toast.error("Ocorreu um erro. Tente novamente.");
            console.error(error);
        } finally {
            setIsBecomingAffiliate(false);
        }
    };

    const handleAvatarUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const { file_url } = await UploadFile({ file });
            await User.updateMyUserData({ avatar_url: file_url });
            
            const updatedUser = await User.me();
            setUser(updatedUser);

            toast.success("Foto de perfil atualizada com sucesso!");
        } catch (error) {
            console.error("Erro ao fazer upload do avatar:", error);
            toast.error("Falha ao atualizar a foto de perfil. Tente novamente.");
        } finally {
            setIsUploading(false);
        }
    };
    
    const getInitials = (name) => {
        if (!name) return "U";
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };
    
    const formatDate = (dateString) => {
      if (!dateString) return '';
      return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    };

    if (loading) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
                <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
            </div>
        );
    }

    if (!user) {
        return null;
    }

    const cardClasses = darkMode ? 'bg-gray-800/80 backdrop-blur-sm border-gray-700/50' : 'bg-white/80 backdrop-blur-sm border-gray-200/50';

    return (
        <div className={`min-h-screen ${darkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800 text-white' : 'bg-gradient-to-br from-slate-50 to-blue-50 text-gray-900'}`}>
            <Toaster richColors position="top-center" />
            <header className={`p-4 shadow-md ${darkMode ? 'bg-gray-800/80 backdrop-blur-sm border-b border-gray-700/50' : 'bg-white/80 backdrop-blur-sm border-b border-gray-200/50'}`}>
                <div className="container mx-auto flex justify-between items-center">
                    <Link to={createPageUrl("Store")}>
                        <h1 className="text-2xl font-bold text-orange-500">Minha Loja</h1>
                    </Link>
                    <Button variant="outline" asChild className={`${darkMode ? 'border-gray-600 text-white hover:bg-gray-700' : ''}`}>
                      <Link to={createPageUrl("Store")}>
                        Voltar para a Loja
                      </Link>
                    </Button>
                </div>
            </header>

            <main className="container mx-auto p-4 md:p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                    {/* Coluna do Perfil (esquerda) */}
                    <div className="md:col-span-1 space-y-6">
                        <Card className={`${cardClasses} text-center`}>
                           <CardHeader className="items-center pt-8">
                                <Avatar className="w-32 h-32 text-4xl border-4 border-orange-500 shadow-lg">
                                    <AvatarImage src={user.avatar_url} alt={user.full_name} />
                                    <AvatarFallback className="bg-gray-600 text-white">
                                        {getInitials(user.full_name)}
                                    </AvatarFallback>
                                </Avatar>
                                <CardTitle className="mt-4 text-2xl">{user.full_name}</CardTitle>
                                <CardDescription className={darkMode ? 'text-gray-400' : 'text-gray-500'}>{user.email}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <label htmlFor="avatar-upload" className="w-full">
                                    <Button asChild className="w-full" variant="secondary">
                                        <div>
                                            {isUploading ? 
                                              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : 
                                              <Upload className="w-4 h-4 mr-2" />
                                            }
                                            Trocar Foto
                                        </div>
                                    </Button>
                                </label>
                                <Input
                                    id="avatar-upload"
                                    type="file"
                                    className="hidden"
                                    onChange={handleAvatarUpload}
                                    accept="image/png, image/jpeg"
                                    disabled={isUploading}
                                />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Coluna de Conteúdo (direita) */}
                    <div className="md:col-span-2">
                        <Tabs defaultValue="courses" className="w-full">
                            <TabsList className={`grid w-full grid-cols-3 ${darkMode ? 'bg-gray-800' : 'bg-gray-200'}`}>
                                <TabsTrigger value="courses">Meus Cursos</TabsTrigger>
                                <TabsTrigger value="orders">Meus Pedidos</TabsTrigger>
                                <TabsTrigger value="affiliate">Programa de Afiliados</TabsTrigger>
                            </TabsList>
                            <TabsContent value="courses" className="mt-4">
                                <MyCoursesSection user={user} darkMode={darkMode} />
                            </TabsContent>
                            <TabsContent value="orders" className="mt-4">
                                <Card className={cardClasses}>
                                    <CardHeader>
                                        <CardTitle>Histórico de Pedidos</CardTitle>
                                        <CardDescription className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Aqui está um resumo de todos os seus pedidos.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {orders.length > 0 ? (
                                            <ul className="space-y-4">
                                                {orders.map(order => (
                                                    <li key={order.id} className={`p-4 rounded-lg flex items-center justify-between ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-16 h-16 rounded-md hidden sm:flex items-center justify-center bg-gray-200 dark:bg-gray-700 overflow-hidden">
                                                              {order.items && order.items.length > 0 && order.items[0]?.image_url ? (
                                                                <img src={order.items[0]?.image_url} alt={order.items[0]?.product_name} className="w-full h-full object-cover" />
                                                              ) : (
                                                                <ShoppingBag className="w-8 h-8 text-gray-400" />
                                                              )}
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold">Pedido #{order.id.slice(-6).toUpperCase()}</p>
                                                                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                                  {order.items ? order.items.length : 0} item(ns) - {formatDate(order.created_date)}
                                                                </p>
                                                                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                                                                  order.status === 'entregue' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                                                                  order.status === 'cancelado' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                                                                  'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                                                                }`}>
                                                                  {order.status}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-bold">R$ {(order.final_total || order.total_amount || 0).toFixed(2).replace('.', ',')}</p>
                                                            <Link to={createPageUrl(`MyOrders?order_id=${order.id}`)} className="text-sm text-orange-500 hover:underline">
                                                                Ver detalhes
                                                            </Link>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <div className="text-center py-10">
                                                <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
                                                <h3 className="mt-2 text-sm font-medium">Nenhum pedido encontrado</h3>
                                                <p className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Você ainda não fez nenhum pedido.</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>
                            <TabsContent value="affiliate" className="mt-4">
                                {user.is_affiliate ? (
                                    <AffiliateDashboard user={user} darkMode={darkMode} />
                                ) : (
                                    <Card className={cardClasses}>
                                        <CardHeader>
                                            <CardTitle>Torne-se um Afiliado!</CardTitle>
                                        </CardHeader>
                                        <CardContent className="text-center space-y-4 py-8">
                                            <Gift className="w-16 h-16 mx-auto text-orange-500" />
                                            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                                Ganhe <strong>10% de comissão</strong> sobre todas as vendas de clientes que você indicar. 
                                                Basta compartilhar seu link exclusivo e começar a lucrar!
                                            </p>
                                            <Button 
                                                onClick={handleBecomeAffiliate} 
                                                disabled={isBecomingAffiliate}
                                                size="lg"
                                                className="bg-green-600 hover:bg-green-700 text-white"
                                            >
                                                {isBecomingAffiliate ? (
                                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                ) : (
                                                    <DollarSign className="w-5 h-5 mr-2" />
                                                )}
                                                Quero ser um Afiliado Agora!
                                            </Button>
                                        </CardContent>
                                    </Card>
                                )}
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </main>
        </div>
    );
}
