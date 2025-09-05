
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Question } from "@/api/entities";
import { Product } from "@/api/entities";
import { User } from "@/api/entities";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Search, MessageCircle, Check, Trash2, Inbox, User as UserIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Helper para gerar iniciais do nome
const getInitials = (name) => {
  return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
};

export default function Questions() {
  const [questions, setQuestions] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pendente"); // Começar com pendentes
  const [searchTerm, setSearchTerm] = useState("");
  const [answeringQuestion, setAnsweringQuestion] = useState(null);
  const [answer, setAnswer] = useState("");
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState(null); // Estado para cliente selecionado
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
    try {
      const [questionsData, productsData] = await Promise.all([
        Question.list('-created_date'),
        Product.list()
      ]);
      setQuestions(questionsData);
      setProducts(productsData);
    } catch (error) {
      console.error("Erro ao carregar dúvidas:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const checkAdminAccess = useCallback(async () => {
    try {
      const user = await User.me();
      if (user.role !== 'admin') { // Changed from user.email to user.role
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

  const handleAnswer = async (questionId) => {
    if (!answer.trim()) {
      toast.error("Por favor, digite uma resposta.");
      return;
    }

    try {
      // Atualizar a pergunta com a resposta
      await Question.update(questionId, {
        answer: answer,
        is_answered: true,
        status: "respondida",
        is_read_by_customer: false // Marca como não lida pelo cliente para que ele seja notificado
      });
      
      setAnswer("");
      setAnsweringQuestion(null);
      toast.success("Resposta enviada com sucesso!");
      loadData(); // Recarregar dados para mostrar a mudança
    } catch (error) {
      console.error("Erro ao enviar resposta:", error);
      toast.error("Erro ao enviar resposta. Tente novamente.");
    }
  };

  const handleDelete = async (questionId) => {
    if (window.confirm("Tem certeza que deseja excluir esta pergunta permanentemente?")) {
      try {
        await Question.delete(questionId);
        toast.success("Pergunta excluída!");
        loadData();
      } catch (error) {
        console.error("Erro ao excluir:", error);
        toast.error("Erro ao excluir pergunta.");
      }
    }
  };

  const getProductName = (productId) => {
    const product = products.find(p => p.id === productId);
    return product ? product.name : "Produto não encontrado";
  };

  // Agrupar perguntas por cliente usando useMemo para performance
  const groupedByCustomer = useMemo(() => {
    return questions.reduce((acc, q) => {
      if (!acc[q.customer_email]) {
        acc[q.customer_email] = {
          name: q.customer_name,
          email: q.customer_email,
          questions: [],
          pendingCount: 0,
          lastQuestionDate: new Date(0),
        };
      }
      acc[q.customer_email].questions.push(q);
      if (q.status === 'pendente') {
        acc[q.customer_email].pendingCount++;
      }
      if (new Date(q.created_date) > acc[q.customer_email].lastQuestionDate) {
        acc[q.customer_email].lastQuestionDate = new Date(q.created_date);
      }
      return acc;
    }, {});
  }, [questions]);

  // Filtrar clientes
  const filteredCustomers = useMemo(() => {
    return Object.values(groupedByCustomer).filter(customer => {
      const hasMatchingStatus = filter === "all" || customer.questions.some(q => q.status === filter);
      const matchesSearch = searchTerm === "" || 
                            customer.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            customer.email.toLowerCase().includes(searchTerm.toLowerCase());
      return hasMatchingStatus && matchesSearch;
    }).sort((a, b) => b.lastQuestionDate - a.lastQuestionDate);
  }, [groupedByCustomer, filter, searchTerm]);

  // Ao selecionar um cliente, mostra apenas as perguntas dele que batem com o filtro
  const questionsOfSelectedCustomer = selectedCustomer 
    ? selectedCustomer.questions.filter(q => filter === 'all' || q.status === filter)
    : [];
    
  if (checkingAuth || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`p-6 space-y-6 min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-slate-50 to-blue-50'}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Caixa de Entrada de Dúvidas</h1>
            <p className={`${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>Responda as perguntas agrupadas por cliente</p>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Buscar por nome ou email do cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`pl-10 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white'}`}
            />
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className={`w-full md:w-48 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white'}`}>
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent className={`${darkMode ? 'bg-gray-800 border-gray-700 text-white' : ''}`}>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="pendente">Pendentes</SelectItem>
              <SelectItem value="respondida">Respondidas</SelectItem>
              <SelectItem value="arquivada">Arquivadas</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Layout de duas colunas */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Coluna da Esquerda: Lista de Clientes */}
          <div className={`lg:col-span-1 rounded-xl p-4 h-[75vh] overflow-y-auto ${darkMode ? 'bg-gray-800/50' : 'bg-white/80 backdrop-blur-sm shadow-lg'}`}>
            <h2 className={`text-lg font-semibold mb-4 px-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>Clientes com Dúvidas</h2>
            <div className="space-y-2">
              {filteredCustomers.length === 0 ? (
                 <div className={`text-center py-10 ${darkMode ? 'text-gray-500' : 'text-slate-500'}`}>
                    <Inbox className="w-10 h-10 mx-auto mb-2"/>
                    <p>Nenhum cliente encontrado</p>
                </div>
              ) : (
                filteredCustomers.map(customer => (
                  <button
                    key={customer.email}
                    onClick={() => setSelectedCustomer(customer)}
                    className={`w-full text-left p-3 rounded-lg transition-all duration-200 flex items-center gap-3 ${
                      selectedCustomer?.email === customer.email 
                        ? (darkMode ? 'bg-blue-900/50' : 'bg-blue-100 shadow-sm') 
                        : (darkMode ? 'hover:bg-gray-700/80' : 'hover:bg-slate-100')
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${darkMode ? 'bg-gray-600 text-gray-200' : 'bg-slate-200 text-slate-600'}`}>
                      {getInitials(customer.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold truncate ${darkMode ? 'text-white' : 'text-slate-900'}`}>{customer.name}</p>
                      <p className={`text-xs truncate ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>{customer.email}</p>
                    </div>
                    {customer.pendingCount > 0 && (
                      <Badge variant="destructive" className="flex-shrink-0">{customer.pendingCount}</Badge>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Coluna da Direita: Dúvidas do Cliente Selecionado */}
          <div className="lg:col-span-3 h-[75vh] overflow-y-auto pr-2">
            {!selectedCustomer ? (
              <div className={`flex flex-col items-center justify-center h-full text-center rounded-xl ${darkMode ? 'text-gray-500 bg-gray-800/50' : 'text-slate-500 bg-white/50 backdrop-blur-sm'}`}>
                <UserIcon className="w-16 h-16 mb-4"/>
                <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : ''}`}>Selecione um cliente</h3>
                <p>Clique em um cliente na lista à esquerda para ver suas dúvidas.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {questionsOfSelectedCustomer.length === 0 ? (
                   <div className={`text-center py-12 rounded-xl ${darkMode ? 'text-gray-500 bg-gray-800/50' : 'text-slate-500 bg-white/50 backdrop-blur-sm'}`}>
                        <Inbox className="w-16 h-16 mx-auto mb-4"/>
                        <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : ''}`}>Nenhuma dúvida encontrada</h3>
                        <p>Não há dúvidas com o filtro de status selecionado para este cliente.</p>
                    </div>
                ) : (
                  questionsOfSelectedCustomer.map(question => (
                    <Card key={question.id} className={`border-0 shadow-lg ${darkMode ? 'bg-gray-800 text-white' : 'bg-white/80 backdrop-blur-sm'}`}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className={`text-lg mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                              {getProductName(question.product_id)}
                            </CardTitle>
                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>
                              {formatDistanceToNow(new Date(question.created_date), { addSuffix: true, locale: ptBR })}
                            </p>
                          </div>
                          <Badge 
                            variant={question.status === 'pendente' ? 'destructive' : 
                                    question.status === 'respondida' ? 'default' : 'secondary'}
                            className={darkMode ? (question.status === 'pendente' ? 'bg-red-900/70 text-red-200' : 'bg-green-900/70 text-green-200') : ''}
                          >
                            {question.status.charAt(0).toUpperCase() + question.status.slice(1)}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className={`p-4 rounded-lg mb-4 ${darkMode ? 'bg-gray-700/50' : 'bg-slate-50'}`}>
                          <p className={`font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-slate-800'}`}>Pergunta do cliente:</p>
                          <p className={`${darkMode ? 'text-gray-300' : 'text-slate-700'}`}>{question.question}</p>
                        </div>

                        {question.answer && (
                          <div className={`p-4 rounded-lg mb-4 ${darkMode ? 'bg-blue-900/40' : 'bg-blue-50'}`}>
                            <p className={`font-medium mb-2 ${darkMode ? 'text-blue-300' : 'text-blue-800'}`}>Sua resposta:</p>
                            <p className={`${darkMode ? 'text-blue-200' : 'text-blue-700'}`}>{question.answer}</p>
                          </div>
                        )}
                        
                        <div className="flex gap-2">
                          {question.status === 'pendente' && (
                              answeringQuestion === question.id ? (
                                <div className="space-y-3 w-full">
                                  <Textarea
                                    placeholder="Digite sua resposta..."
                                    value={answer}
                                    onChange={(e) => setAnswer(e.target.value)}
                                    rows={3}
                                    className={darkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}
                                  />
                                  <div className="flex gap-2">
                                    <Button onClick={() => handleAnswer(question.id)}>
                                      <Check className="w-4 h-4 mr-2" />
                                      Enviar Resposta
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      onClick={() => {
                                        setAnsweringQuestion(null);
                                        setAnswer("");
                                      }}
                                    >
                                      Cancelar
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <Button 
                                  onClick={() => setAnsweringQuestion(question.id)}
                                  className="bg-blue-600 hover:bg-blue-700"
                                >
                                  <MessageCircle className="w-4 h-4 mr-2" />
                                  Responder
                                </Button>
                              )
                          )}
                          
                          <Button 
                            variant="destructive"
                            size="icon"
                            title="Excluir Pergunta"
                            onClick={() => handleDelete(question.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
