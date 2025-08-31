import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MessageCircle, Send } from "lucide-react";
import { Question } from "@/api/entities";
import { User } from "@/api/entities";
import { toast } from "sonner";

export default function ProductQuestions({ productId, productName }) {
  const [questions, setQuestions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    question: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadQuestions = useCallback(async () => {
    try {
      const questionsData = await Question.filter({ 
        product_id: productId, 
        is_public: true,
        status: "respondida"
      });
      setQuestions(questionsData);
    } catch (error) {
      console.error("Erro ao carregar perguntas:", error);
    }
  }, [productId]);

  const checkUser = useCallback(async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      setFormData(prev => ({
        ...prev,
        name: currentUser.full_name || "",
        email: currentUser.email || ""
      }));
    } catch (error) {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    loadQuestions();
    checkUser();
  }, [loadQuestions, checkUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await Question.create({
        product_id: productId,
        product_name: productName,
        customer_name: formData.name,
        customer_email: formData.email,
        question: formData.question,
        status: "pendente"
      });

      toast.success("Sua pergunta foi enviada! Responderemos em breve.");
      setFormData(prev => ({ ...prev, question: "" }));
      setShowForm(false);
    } catch (error) {
      console.error("Erro ao enviar pergunta:", error);
      toast.error("Erro ao enviar pergunta. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Perguntas existentes */}
      {questions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Perguntas e Respostas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {questions.map(question => (
              <div key={question.id} className="border-l-4 border-blue-500 pl-4 space-y-2">
                <div>
                  <p className="font-medium text-slate-800">P: {question.question}</p>
                  <p className="text-sm text-slate-500">Por {question.customer_name}</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-blue-800"><strong>R:</strong> {question.answer}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Formulário para nova pergunta */}
      <Card>
        <CardHeader>
          <CardTitle>Tem alguma dúvida sobre este produto?</CardTitle>
        </CardHeader>
        <CardContent>
          {!showForm ? (
            <Button 
              onClick={() => setShowForm(true)} 
              className="w-full"
              variant="outline"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Fazer uma pergunta
            </Button>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Seu nome</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Seu email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="question">Sua pergunta</Label>
                <Textarea
                  id="question"
                  placeholder="Digite sua dúvida sobre este produto..."
                  value={formData.question}
                  onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
                  required
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={isSubmitting}>
                  <Send className="w-4 h-4 mr-2" />
                  {isSubmitting ? "Enviando..." : "Enviar pergunta"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowForm(false)}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}