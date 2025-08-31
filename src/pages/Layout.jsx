

import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/api/entities";
import { 
  Store, 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Truck,
  BarChart,
  Settings,
  Eye,
  LogOut,
  Image as ImageIcon,
  Grid3X3, // Novo ícone para categorias
  MessageCircle // Adicionado para a nova opção "Dúvidas"
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge"; // Importar Badge
import { Question } from "@/api/entities"; // Importar Question
import { Order } from "@/api/entities"; // Importar Order

const navigationItems = [
  {
    title: "Dashboard",
    url: createPageUrl("Dashboard"),
    icon: LayoutDashboard,
  },
  {
    title: "Produtos",
    url: createPageUrl("Products"),
    icon: Package,
  },
  {
    title: "Categorias",
    url: createPageUrl("Categories"),
    icon: Grid3X3,
  },
  {
    title: "Banners",
    url: createPageUrl("Banners"),
    icon: ImageIcon,
  },
  {
    title: "Anúncios",
    url: createPageUrl("Advertisements"),
    icon: BarChart,
  },
  // Removed "Sites Personalizados" navigation item
  {
    title: "Pedidos",
    url: createPageUrl("Orders"),
    icon: ShoppingCart,
  },
  {
    title: "Dúvidas", // Nova opção
    url: createPageUrl("Questions"),
    icon: MessageCircle,
  },
  {
    title: "Métodos de Entrega", // Novo item de navegação
    url: createPageUrl("DeliveryMethods"),
    icon: Truck,
  },
  {
    title: "Entregadores",
    url: createPageUrl("Deliverers"),
    icon: Truck,
  },
  {
    title: "Configurações",
    url: createPageUrl("Settings"),
    icon: Settings,
  },
  {
    title: "Ver Loja",
    url: createPageUrl("Store"),
    icon: Eye,
  }
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [pendingQuestionsCount, setPendingQuestionsCount] = useState(0); // Novo estado
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0); // Novo estado para pedidos

  useEffect(() => {
    const checkAdminAccess = async () => {
      // Páginas públicas que não precisam de verificação
      if (['Store', 'MyOrders', 'Home', 'custom'].includes(currentPageName)) {
        setIsCheckingAuth(false);
        return;
      }

      // Para páginas administrativas, verifica se é o admin
      try {
        const currentUser = await User.me();
        
        // CRÍTICO: Só permite acesso se o email for o do administrador principal
        if (currentUser.email !== 'ericlesrobsom03@gmail.com') {
          // Se não for o admin, redireciona IMEDIATAMENTE para a loja
          navigate(createPageUrl("Store"));
          return;
        }
        
        setUser(currentUser);
        // Carregar contagens de dúvidas e pedidos pendentes em paralelo
        const [pendingQuestions, pendingOrders] = await Promise.all([
          Question.filter({ status: 'pendente' }),
          Order.filter({ status: 'pendente' })
        ]);
        setPendingQuestionsCount(pendingQuestions.length);
        setPendingOrdersCount(pendingOrders.length);

      } catch (error) {
        // Se não estiver logado, redireciona para a página de login
        await User.loginWithRedirect(window.location.href);
        return;
      } finally {
        setIsCheckingAuth(false);
      }
    };
    
    checkAdminAccess();
  }, [location.pathname, currentPageName, navigate]);

  const handleLogout = async () => {
    await User.logout();
    navigate(createPageUrl("Store"));
  };
  
  // Renderiza apenas o conteúdo para páginas públicas E sites personalizados
  if (['Store', 'MyOrders', 'Home', 'custom'].includes(currentPageName)) {
    return children;
  }

  // CRÍTICO: Enquanto está verificando auth, NÃO mostra NADA
  // Isso evita o "flash" da interface administrativa
  if (isCheckingAuth) {
    // Tela em branco ou loading simples - SEM interface administrativa
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Se chegou até aqui, é porque passou na verificação de admin
  // AGORA SIM pode mostrar a interface administrativa
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-slate-100">
        <Sidebar className="border-r border-slate-200 bg-white/80 backdrop-blur-sm">
          <SidebarHeader className="border-b border-slate-200 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                <Store className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-lg">Minha Loja</h2>
                <p className="text-sm text-slate-500">Sistema de E-commerce</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-3">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-2">
                Navegação
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        className={`rounded-lg px-3 py-2.5 transition-all duration-200 ${
                          location.pathname === item.url 
                            ? 'bg-blue-100 text-blue-700 shadow-sm' 
                            : 'hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <Link to={item.url} className="flex items-center gap-3">
                          <item.icon className="w-5 h-5" />
                          <span className="font-medium flex-1">{item.title}</span>
                          {item.title === "Pedidos" && pendingOrdersCount > 0 && (
                            <Badge variant="destructive" className="h-5">{pendingOrdersCount}</Badge>
                          )}
                          {item.title === "Dúvidas" && pendingQuestionsCount > 0 && (
                            <Badge variant="destructive" className="h-5">{pendingQuestionsCount}</Badge>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup className="mt-6">
              <SidebarGroupLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-2">
                Resumo Rápido
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <div className="px-3 py-2 space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <BarChart className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-slate-600 text-xs">Vendas Hoje</p>
                      <p className="font-semibold text-slate-900">R$ 0,00</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <ShoppingCart className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-slate-600 text-xs">Pedidos Pendentes</p>
                      <p className="font-semibold text-slate-900">{pendingOrdersCount}</p> {/* Exibe a contagem de pedidos pendentes */}
                    </div>
                  </div>
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-slate-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-slate-400 to-slate-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">{user?.full_name?.[0]?.toUpperCase() || 'A'}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 text-sm truncate">{user?.full_name || 'Administrador'}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email || 'Gerenciar loja'}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={handleLogout} title="Sair">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col min-h-screen bg-white">
          <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 px-6 py-4 md:hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="hover:bg-slate-100 p-2 rounded-lg transition-colors duration-200" />
                <h1 className="text-xl font-bold text-slate-900">Minha Loja</h1>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-auto bg-gradient-to-br from-slate-50 to-blue-50">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}

