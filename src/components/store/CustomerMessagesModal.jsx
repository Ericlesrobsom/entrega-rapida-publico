
import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageCircle, Send, Package, Loader2, ChevronDown, ChevronUp } from "lucide-react"; // Added ChevronDown, ChevronUp
import { Question } from "@/api/entities";
import { User } from "@/api/entities";
import { Product } from "@/api/entities";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function CustomerMessagesModal({ isOpen, onClose, onUpdateCount }) {
  const [darkMode, setDarkMode] = useState(false);
  const [messages, setMessages] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [newMessage, setNewMessage] = useState({ question: "", product_name: "" });
  const [isSending, setIsSending] = useState(false);
  const [showMessageForm, setShowMessageForm] = useState(false); // New state for form visibility

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setDarkMode(isDark);

    const observer = new MutationObserver(() => {
      const newIsDark = document.documentElement.classList.contains('dark');
      setDarkMode(newIsDark);
    });

    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const calculateUnreadAnsweredCount = useCallback((currentMessages) => {
    return currentMessages.filter(q => q.is_answered && !q.is_read_by_customer).length;
  }, []);

  const loadMessages = useCallback(async () => {
    setLoading(true);
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      
      // Carregar produtos e mensagens em paralelo
      const [allUserQuestions, productsData] = await Promise.all([
        Question.filter({ customer_email: currentUser.email }, '-created_date'),
        Product.filter({ is_active: true }, 'name')
      ]);
      
      setMessages(allUserQuestions);
      setProducts(productsData);
      
      const unreadAnsweredQuestions = allUserQuestions.filter(q => q.is_answered && !q.is_read_by_customer);

      if (unreadAnsweredQuestions.length > 0) {
        const updatedQuestionsPromises = unreadAnsweredQuestions.map(q => 
          Question.update(q.id, { is_read_by_customer: true })
            .then(updatedQ => ({ ...q, is_read_by_customer: true }))
        );
        
        await Promise.all(updatedQuestionsPromises);

        const updatedAllUserQuestions = allUserQuestions.map(q => 
          unreadAnsweredQuestions.some(uq => uq.id === q.id) ? { ...q, is_read_by_customer: true } : q
        );
        setMessages(updatedAllUserQuestions);
        onUpdateCount(0);
      } else {
        onUpdateCount(0);
      }
      
    } catch (error) {
      console.error("Erro ao carregar mensagens:", error);
      toast.error("Erro ao carregar mensagens.");
    } finally {
      setLoading(false);
    }
  }, [onUpdateCount]);

  const handleSendMessage = async () => {
    if (!newMessage.question.trim()) {
      toast.error("A mensagem não pode estar vazia.");
      return;
    }
    setIsSending(true);
    try {
      const createdQuestion = await Question.create({
        customer_email: user.email,
        customer_name: user.full_name,
        product_name: newMessage.product_name || null,
        question: newMessage.question,
        is_answered: false,
        is_read_by_customer: true,
      });
      setMessages(prevMessages => [createdQuestion, ...prevMessages]);
      setNewMessage({ question: "", product_name: "" });
      toast.success("Mensagem enviada com sucesso!");
      setShowMessageForm(false); // Hide form after sending
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      toast.error("Erro ao enviar mensagem.");
    } finally {
      setIsSending(false);
    }
  };

  const handleMarkAsRead = async (messageToMark) => {
    try {
      await Question.update(messageToMark.id, { is_read_by_customer: true });
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === messageToMark.id ? { ...msg, is_read_by_customer: true } : msg
        )
      );
      toast.success("Mensagem marcada como lida.");
      const newUnreadCount = calculateUnreadAnsweredCount(messages.map(msg => 
        msg.id === messageToMark.id ? { ...msg, is_read_by_customer: true } : msg
      ));
      onUpdateCount(newUnreadCount);
    } catch (error) {
      console.error("Erro ao marcar mensagem como lida:", error);
      toast.error("Erro ao marcar mensagem como lida.");
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadMessages();
      setShowMessageForm(false); // Ensure form is hidden when modal opens
    }
  }, [isOpen, loadMessages]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`sm:max-w-3xl max-h-[85vh] transition-colors duration-300 ${
        darkMode ? 'bg-gray-900 text-white' : 'bg-white text-slate-900'
      }`}>
        <DialogHeader>
          <DialogTitle className="text-xl text-[--store-primary] flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Suas Mensagens
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Botão para Mostrar/Esconder Nova Mensagem */}
          <div className="flex justify-between items-center">
            <Button
              onClick={() => setShowMessageForm(!showMessageForm)}
              variant="outline"
              className={`border-[--store-primary] text-[--store-primary] hover:bg-[--store-primary]/10 ${
                darkMode ? 'border-[--store-primary] bg-transparent' : ''
              }`}
            >
              <Send className="w-4 h-4 mr-2" />
              {showMessageForm ? 'Ocultar Formulário' : 'Enviar Nova Mensagem'}
              {showMessageForm ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
            </Button>
          </div>

          {/* Formulário de Nova Mensagem (Colapsável) */}
          {showMessageForm && (
            <Card className={`border-[--store-primary] transition-colors duration-300 ${
              darkMode ? 'bg-gray-800' : 'bg-slate-50'
            }`}>
              <CardContent className="p-4">
                {/* Removed h3 as button now titles this section */}
                <div className="space-y-3">
                  {/* Seletor de Produto */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Produto (opcional)</label>
                    <Select 
                      value={newMessage.product_name} 
                      onValueChange={(value) => setNewMessage({...newMessage, product_name: value})}
                    >
                      <SelectTrigger className={darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}>
                        <SelectValue placeholder="Selecione um produto ou deixe em branco" />
                      </SelectTrigger>
                      <SelectContent className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
                        <SelectItem value={null}>Dúvida geral (sem produto específico)</SelectItem>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.name}>
                            {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Campo da Mensagem */}
                  <Textarea
                    placeholder="Digite sua pergunta ou mensagem..."
                    value={newMessage.question}
                    onChange={(e) => setNewMessage({...newMessage, question: e.target.value})}
                    rows={3}
                    className={darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}
                  />
                  
                  <div className="flex gap-2"> {/* Added flex container for buttons */}
                    <Button 
                      onClick={handleSendMessage}
                      disabled={!newMessage.question.trim() || isSending}
                      className="bg-[--store-primary] text-white hover:opacity-90 transition-opacity flex-1" // Added flex-1
                    >
                      {isSending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Enviar Mensagem
                        </>
                      )}
                    </Button>
                    <Button 
                      onClick={() => setShowMessageForm(false)} // New "Fechar" button
                      variant="outline"
                      className="px-4"
                    >
                      Fechar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Lista de Mensagens - SCROLL MAIOR */}
          <ScrollArea className={`pr-4 ${showMessageForm ? 'h-[400px]' : 'h-[600px]'}`}> {/* Dynamic height */}
            <div className="space-y-4">
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-[--store-primary]" />
                </div>
              ) : messages.length === 0 ? (
                <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma mensagem encontrada.</p>
                  <p className="text-sm mt-2">Clique em "Enviar Nova Mensagem" para começar.</p> {/* Updated message */}
                </div>
              ) : (
                messages.map((message) => (
                  <Card key={message.id} className={`transition-colors duration-300 ${
                    darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'
                  }`}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          {message.product_name && (
                            <Badge variant="outline" className={`border-[--store-primary] text-[--store-primary] ${
                              darkMode ? 'bg-gray-700' : 'bg-white'
                            }`}>
                              <Package className="w-3 h-3 mr-1" />
                              {message.product_name}
                            </Badge>
                          )}
                          <Badge 
                            variant={message.is_answered ? 'default' : 'secondary'}
                            className={message.is_answered 
                              ? 'bg-[--store-primary] text-white' 
                              : darkMode ? 'bg-gray-600 text-slate-300' : 'bg-slate-200 text-slate-700'
                            }
                          >
                            {message.is_answered ? 'Respondida' : 'Pendente'}
                          </Badge>
                          {message.is_answered && !message.is_read_by_customer && (
                            <Badge className="bg-red-500 text-white">Nova Resposta</Badge>
                          )}
                        </div>
                        <span className={`text-xs min-w-max ${
                          darkMode ? 'text-slate-400' : 'text-slate-500'
                        }`}>
                          {format(new Date(message.created_date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </span>
                      </div>
                      
                      <div className="space-y-3">
                        <div className={`p-3 rounded-lg transition-colors duration-300 ${
                          darkMode ? 'bg-gray-700' : 'bg-slate-100'
                        }`}>
                          <p className={`text-sm font-medium mb-1 ${
                            darkMode ? 'text-slate-300' : 'text-slate-600'
                          }`}>Sua pergunta:</p>
                          <p>{message.question}</p>
                        </div>
                        
                        {message.answer && (
                          <div className={`p-3 rounded-lg border-l-4 border-[--store-primary] ${
                            darkMode ? 'bg-[--store-primary]/20' : 'bg-[--store-primary]/10'
                          }`}>
                            <p className="text-sm font-medium text-[--store-primary] mb-1">Nossa resposta:</p>
                            <p>{message.answer}</p>
                            {message.is_answered && !message.is_read_by_customer && (
                              <Button
                                onClick={() => handleMarkAsRead(message)}
                                variant="ghost"
                                size="sm"
                                className="mt-2 text-[--store-primary] hover:bg-[--store-primary]/10"
                              >
                                Marcar como lida
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
