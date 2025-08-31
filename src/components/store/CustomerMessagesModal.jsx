
import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, X, Package } from "lucide-react";
import { Question } from "@/api/entities";
import { User } from "@/api/entities";
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function CustomerMessagesModal({ isOpen, onClose, onUpdateCount }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const loadUserQuestions = useCallback(async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      
      // Buscar perguntas do usuário atual que foram respondidas
      const userQuestions = await Question.filter({ 
        customer_email: currentUser.email,
        is_answered: true 
      }, '-created_date');
      
      setQuestions(userQuestions);
      
      // Marcar todas as perguntas como lidas
      const unreadQuestions = userQuestions.filter(q => !q.is_read_by_customer);
      if (unreadQuestions.length > 0) {
        // Marcar como lidas em paralelo
        await Promise.all(
          unreadQuestions.map(q => 
            Question.update(q.id, { is_read_by_customer: true })
          )
        );
        // Atualizar contador na interface
        if (onUpdateCount) {
          onUpdateCount(0);
        }
      }
      
    } catch (error) {
      console.error("Erro ao carregar mensagens:", error);
    } finally {
      setLoading(false);
    }
  }, [onUpdateCount]);

  useEffect(() => {
    if (isOpen) {
      loadUserQuestions();
    }
  }, [isOpen, loadUserQuestions]);

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-2xl">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] p-0 flex flex-col">
        {/* Header fixo */}
        <DialogHeader className="p-6 pb-4 border-b flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <DialogTitle className="text-xl">Suas Mensagens</DialogTitle>
              <p className="text-sm text-slate-500">Respostas às suas dúvidas</p>
            </div>
          </div>
        </DialogHeader>

        {/* Conteúdo rolável */}
        <div className="flex-grow overflow-y-auto p-6">
          {questions.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-600 mb-2">Nenhuma mensagem ainda</h3>
              <p className="text-slate-500">
                Quando você fizer perguntas sobre produtos e recebermos respostas, elas aparecerão aqui.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map(question => (
                <Card key={question.id} className="border border-slate-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-slate-500" />
                        <CardTitle className="text-base">{question.product_name}</CardTitle>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary" className="mb-1">Respondida</Badge>
                        <p className="text-xs text-slate-500">
                          {formatDistanceToNow(new Date(question.created_date), { addSuffix: true, locale: ptBR })}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Sua pergunta */}
                    <div className="bg-slate-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-slate-600 mb-2">Sua pergunta:</p>
                      <p className="text-slate-800">{question.question}</p>
                    </div>
                    
                    {/* Resposta da loja */}
                    {question.answer && (
                      <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                        <p className="text-sm font-medium text-blue-800 mb-2">Resposta da loja:</p>
                        <p className="text-blue-900">{question.answer}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
