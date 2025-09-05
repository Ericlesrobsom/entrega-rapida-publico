

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
  Grid3X3, 
  MessageCircle, 
  Trash2,
  PlayCircle, // Adicionado para Cursos
  Link as LinkIcon, // Adicionado para Links
  Moon,
  Sun
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
import { Badge } from "@/components/ui/badge"; 
import { Question } from "@/api/entities"; 
import { Order } from "@/api/entities"; 

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
  {
    title: "Cupons",
    url: createPageUrl("Coupons"),
    icon: "🎫",
  },
  {
    title: "Cursos",
    url: createPageUrl("Courses"),
    icon: PlayCircle,
  },
  {
    title: "Links de Divulgação",
    url: createPageUrl("SocialLinks"),
    icon: LinkIcon,
  },
  {
    title: "Pedidos",
    url: createPageUrl("Orders"),
    icon: ShoppingCart,
  },
  {
    title: "Dúvidas", 
    url: createPageUrl("Questions"),
    icon: MessageCircle,
  },
  {
    title: "Métodos de Entrega", 
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
  const [pendingQuestionsCount, setPendingQuestionsCount] = useState(0); 
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0); 
  const [darkMode, setDarkMode] = useState(false); // Novo estado para o tema

  // Carregar preferência de tema e aplicar
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('admin-darkMode');
    if (savedDarkMode) {
      const isDark = JSON.parse(savedDarkMode);
      setDarkMode(isDark);
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, []);

  // Função para alternar tema
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('admin-darkMode', JSON.stringify(newDarkMode));
    
    // Aplicar classe no documento
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  useEffect(() => {
    const checkAdminAccess = async () => {
      // Páginas públicas que não precisam de verificação - REMOVIDO SocialLinks daqui!
      if (['Store', 'MyOrders', 'Home', 'custom', 'CoursePlayer', 'Links'].includes(currentPageName)) {
        setIsCheckingAuth(false);
        return;
      }

      // Para páginas administrativas, verifica se é o admin
      try {
        const currentUser = await User.me();
        
        // CRÍTICO: Troca a verificação de email pela de função 'admin'
        if (currentUser.role !== 'admin') {
          // Se não for admin, redireciona IMEDIATAMENTE para a loja
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
  
  // Renderiza apenas o conteúdo para páginas públicas E sites personalizados - SocialLinks removido!
  if (['Store', 'MyOrders', 'Home', 'custom', 'CoursePlayer', 'Links'].includes(currentPageName)) {
    return children;
  }

  // CRÍTICO: Enquanto está verificando auth, NÃO mostra NADA
  // Isso evita o "flash" da interface administrativa
  if (isCheckingAuth) {
    // Tela em branco ou loading simples - SEM interface administrativa
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900 transition-colors duration-300">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Se chegou até aqui, é porque passou na verificação de admin
  // AGORA SIM pode mostrar a interface administrativa
  return (
    <SidebarProvider>
      <div className={`min-h-screen flex w-full transition-colors duration-300 ${
        darkMode ? 'bg-gray-900' : 'bg-slate-100'
      }`}>
        <Sidebar className={`border-r transition-colors duration-300 ${
          darkMode 
            ? 'border-gray-700 bg-gray-800/80 backdrop-blur-sm' 
            : 'border-slate-200 bg-white/80 backdrop-blur-sm'
        }`}>
          <SidebarHeader className={`border-b p-6 transition-colors duration-300 ${
            darkMode ? 'border-gray-700' : 'border-slate-200'
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                <Store className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className={`font-bold text-lg transition-colors duration-300 ${
                  darkMode ? 'text-white' : 'text-slate-900'
                }`}>Minha Loja</h2>
                <p className={`text-sm transition-colors duration-300 ${
                  darkMode ? 'text-gray-400' : 'text-slate-500'
                }`}>Sistema de E-commerce</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-3">
            <SidebarGroup>
              <SidebarGroupLabel className={`text-xs font-semibold uppercase tracking-wider px-3 py-2 transition-colors duration-300 ${
                darkMode ? 'text-gray-400' : 'text-slate-500'
              }`}>
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
                            ? darkMode 
                              ? 'bg-blue-600/20 text-blue-400 shadow-sm' 
                              : 'bg-blue-100 text-blue-700 shadow-sm'
                            : darkMode
                              ? 'hover:bg-gray-700 text-gray-200'
                              : 'hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <Link to={item.url} className="flex items-center gap-3">
                          {typeof item.icon === 'string' ? (
                            <span className="w-5 h-5 flex items-center justify-center text-xl">{item.icon}</span>
                          ) : (
                            <item.icon className="w-5 h-5" />
                          )}
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
              <SidebarGroupLabel className={`text-xs font-semibold uppercase tracking-wider px-3 py-2 transition-colors duration-300 ${
                darkMode ? 'text-gray-400' : 'text-slate-500'
              }`}>
                Resumo Rápido
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <div className="px-3 py-2 space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-300 ${
                      darkMode ? 'bg-green-600/20' : 'bg-green-100'
                    }`}>
                      <BarChart className={`w-4 h-4 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
                    </div>
                    <div>
                      <p className={`text-xs transition-colors duration-300 ${
                        darkMode ? 'text-gray-400' : 'text-slate-600'
                      }`}>Vendas Hoje</p>
                      <p className={`font-semibold transition-colors duration-300 ${
                        darkMode ? 'text-white' : 'text-slate-900'
                      }`}>R$ 0,00</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-300 ${
                      darkMode ? 'bg-purple-600/20' : 'bg-purple-100'
                    }`}>
                      <ShoppingCart className={`w-4 h-4 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                    </div>
                    <div>
                      <p className={`text-xs transition-colors duration-300 ${
                        darkMode ? 'text-gray-400' : 'text-slate-600'
                      }`}>Pedidos Pendentes</p>
                      <p className={`font-semibold transition-colors duration-300 ${
                        darkMode ? 'text-white' : 'text-slate-900'
                      }`}>{pendingOrdersCount}</p> 
                    </div>
                  </div>
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className={`border-t p-4 transition-colors duration-300 ${
            darkMode ? 'border-gray-700' : 'border-slate-200'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-slate-400 to-slate-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">{user?.full_name?.[0]?.toUpperCase() || 'A'}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-semibold text-sm truncate transition-colors duration-300 ${
                  darkMode ? 'text-white' : 'text-slate-900'
                }`}>{user?.full_name || 'Administrador'}</p>
                <p className={`text-xs truncate transition-colors duration-300 ${
                  darkMode ? 'text-gray-400' : 'text-slate-500'
                }`}>{user?.email || 'Gerenciar loja'}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={handleLogout} title="Sair">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>

            {/* Controle de Tema */}
            <div className="flex items-center justify-between">
              <span className={`text-sm font-medium transition-colors duration-300 ${
                darkMode ? 'text-gray-300' : 'text-slate-700'
              }`}>
                Tema Escuro
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleDarkMode}
                className={`h-8 w-8 rounded-full transition-all duration-200 ${
                  darkMode 
                    ? 'bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
                title={darkMode ? "Mudar para modo claro" : "Mudar para modo escuro"}
              >
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className={`flex-1 flex flex-col min-h-screen transition-colors duration-300 ${
          darkMode ? 'bg-gray-900' : 'bg-white'
        }`}>
          <header className={`backdrop-blur-sm border-b px-6 py-4 md:hidden transition-colors duration-300 ${
            darkMode 
              ? 'bg-gray-800/80 border-gray-700' 
              : 'bg-white/80 border-slate-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <SidebarTrigger className={`p-2 rounded-lg transition-colors duration-200 ${
                  darkMode ? 'hover:bg-gray-700' : 'hover:bg-slate-100'
                }`} />
                <h1 className={`text-xl font-bold transition-colors duration-300 ${
                  darkMode ? 'text-white' : 'text-slate-900'
                }`}>Minha Loja</h1>
              </div>
            </div>
          </header>

          <div className={`flex-1 overflow-auto transition-colors duration-300 ${
            darkMode 
              ? 'bg-gradient-to-br from-gray-900 to-gray-800' 
              : 'bg-gradient-to-br from-slate-50 to-blue-50'
          }`}>
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}

