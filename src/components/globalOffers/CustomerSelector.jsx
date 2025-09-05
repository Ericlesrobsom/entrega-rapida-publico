import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Users, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CustomerSelector({ selectedEmails, onEmailsChange, darkMode }) {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    // Filtrar clientes baseado no termo de busca
    if (searchTerm.trim() === '') {
      setFilteredCustomers(customers);
    } else {
      const filtered = customers.filter(customer => 
        customer.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCustomers(filtered);
    }
  }, [searchTerm, customers]);

  const loadCustomers = async () => {
    try {
      const users = await User.list('-created_date');
      // Filtrar apenas usuários normais (não admins)
      const regularCustomers = users.filter(user => user.role !== 'admin');
      setCustomers(regularCustomers);
      setFilteredCustomers(regularCustomers);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerToggle = (email, isChecked) => {
    let newSelectedEmails;
    if (isChecked) {
      newSelectedEmails = [...selectedEmails, email];
    } else {
      newSelectedEmails = selectedEmails.filter(e => e !== email);
    }
    onEmailsChange(newSelectedEmails);
  };

  const handleSelectAll = () => {
    const allEmails = filteredCustomers.map(customer => customer.email);
    onEmailsChange(allEmails);
  };

  const handleSelectNone = () => {
    onEmailsChange([]);
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  if (loading) {
    return (
      <Card className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white'}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Carregando clientes...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${darkMode ? 'bg-gray-800 text-white border-gray-700' : 'bg-white border-gray-200'}`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Selecionar Clientes
            {selectedEmails.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {selectedEmails.length} selecionado{selectedEmails.length !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              disabled={filteredCustomers.length === 0}
            >
              Selecionar Todos
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSelectNone}
              disabled={selectedEmails.length === 0}
            >
              Limpar Seleção
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Barra de pesquisa */}
        <div className="relative">
          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
          <Input
            placeholder="Pesquisar por nome ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`pl-10 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white'}`}
          />
        </div>

        {/* Lista de clientes */}
        <ScrollArea className="h-64">
          <div className="space-y-2">
            {filteredCustomers.length === 0 ? (
              <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {searchTerm ? 'Nenhum cliente encontrado com esse termo.' : 'Nenhum cliente cadastrado ainda.'}
              </div>
            ) : (
              filteredCustomers.map((customer) => (
                <div
                  key={customer.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all hover:shadow-sm ${
                    selectedEmails.includes(customer.email)
                      ? darkMode
                        ? 'bg-blue-900/30 border-blue-700'
                        : 'bg-blue-50 border-blue-200'
                      : darkMode
                        ? 'bg-gray-700/50 border-gray-600 hover:bg-gray-700'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <Checkbox
                    id={customer.id}
                    checked={selectedEmails.includes(customer.email)}
                    onCheckedChange={(checked) => handleCustomerToggle(customer.email, checked)}
                  />
                  
                  {/* Avatar com iniciais */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                    selectedEmails.includes(customer.email)
                      ? 'bg-blue-600 text-white'
                      : darkMode
                        ? 'bg-gray-600 text-gray-200'
                        : 'bg-gray-300 text-gray-700'
                  }`}>
                    {getInitials(customer.full_name)}
                  </div>

                  {/* Informações do cliente */}
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium truncate ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {customer.full_name || 'Nome não informado'}
                    </p>
                    <p className={`text-sm truncate ${
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {customer.email}
                    </p>
                  </div>

                  {/* Indicador de seleção */}
                  {selectedEmails.includes(customer.email) && (
                    <CheckCircle2 className="w-5 h-5 text-blue-500" />
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Resumo da seleção */}
        {selectedEmails.length > 0 && (
          <div className={`p-3 rounded-lg border-t ${
            darkMode 
              ? 'bg-blue-900/20 border-blue-800' 
              : 'bg-blue-50 border-blue-200'
          }`}>
            <p className={`text-sm font-medium ${
              darkMode ? 'text-blue-300' : 'text-blue-700'
            }`}>
              ✅ {selectedEmails.length} cliente{selectedEmails.length !== 1 ? 's' : ''} selecionado{selectedEmails.length !== 1 ? 's' : ''} para receber esta oferta
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}