
import React, { useState, useEffect, useCallback } from "react";
import { Product } from "@/api/entities";
import { Order } from "@/api/entities";
import { User } from "@/api/entities";
import { Banner } from "@/api/entities";
import { Settings } from "@/api/entities";
import { Category } from "@/api/entities";
import { DeliveryMethod } from "@/api/entities";
import { PaymentMethod } from "@/api/entities";
import { Advertisement } from "@/api/entities";
import { Question } from "@/api/entities";
import { Course } from "@/api/entities";
import { CourseAccess } from "@/api/entities";
import { Search, X, MessageCircle, PlayCircle, Users, Clock, Moon, Sun, LayoutGrid, List } from "lucide-react";
import ProductCard from "../components/store/ProductCard";
import ShoppingCartSheet from "../components/store/ShoppingCartSheet";
import CheckoutDialog from "../components/store/CheckoutDialog";
import OrderSuccessDialog from "../components/store/OrderSuccessDialog";
import BannerCarousel from "../components/store/BannerCarousel";
import DynamicStyles from "../components/store/DynamicStyles";
import Footer from "../components/store/Footer";
import ProductDetailsModal from "../components/store/ProductDetailsModal";
import AdvertisementBanner from "../components/store/AdvertisementBanner";
import CustomerMessagesModal from "../components/store/CustomerMessagesModal";
import { Toaster, toast } from 'sonner';

// IMPORTAR O NOVO MODAL
import NewCustomerOfferModal from "../components/store/NewCustomerOfferModal";
import OfferCountdownBar from "../components/store/OfferCountdownBar";

// Imports for CourseCard components
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Componente UserProfileMenu agora recebe darkMode como prop
function UserProfileMenu({ user, unreadMessagesCount, onOpenMessages, darkMode }) {
  const [isOpen, setIsOpen] = useState(false);

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const handleLogout = async () => {
    try {
      await User.logout();
      window.location.reload();
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  return (
    <div className="relative flex items-center gap-2">
      {/* Botão de mensagens */}
      {user && (
        <button
          onClick={onOpenMessages}
          className="relative bg-blue-500 text-white p-3 rounded-full hover:bg-blue-600 transition-colors"
        >
          <MessageCircle className="w-5 h-5" />
          {unreadMessagesCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
              {unreadMessagesCount}
            </span>
          )}
        </button>
      )}

      {/* Botão do perfil */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-slate-600 text-white p-3 rounded-full hover:bg-slate-700 transition-colors flex items-center justify-center"
      >
        <span className="font-medium">
          {user ? getInitials(user.full_name) : "U"}
        </span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          <div className={`absolute right-0 mt-2 w-64 rounded-lg shadow-lg border z-20 transition-colors duration-300 ${
            darkMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {user?.full_name || "Usuário"}
              </p>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {user?.email}
              </p>
            </div>

            <div className="py-2">
              <a
                href="/MyOrders"
                className={`flex items-center gap-3 px-4 py-2 transition-colors ${
                  darkMode 
                    ? 'text-gray-300 hover:bg-gray-700 hover:text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => setIsOpen(false)}
              >
                <span>📦</span>
                <span>Meus Pedidos</span>
              </a>

              {user?.role === 'admin' && (
                <>
                  <div className={`border-t my-2 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}></div>
                  <a
                    href="/Dashboard"
                    className={`flex items-center gap-3 px-4 py-2 transition-colors ${
                      darkMode 
                        ? 'text-blue-400 hover:bg-blue-900/30' 
                        : 'text-blue-600 hover:bg-blue-50'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <span>⚙️</span>
                    <span>Dashboard Admin</span>
                  </a>
                </>
              )}

              <div className={`border-t my-2 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}></div>
              <button
                onClick={handleLogout}
                className={`flex items-center gap-3 px-4 py-2 transition-colors w-full text-left ${
                  darkMode 
                    ? 'text-red-400 hover:bg-red-900/30' 
                    : 'text-red-600 hover:bg-red-50'
                }`}
              >
                <span>🚪</span>
                <span>Sair</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const translations = {
  en: {
    home: "Home",
    allCategories: "All Categories",
    productsForYou: "Products For You",
    featuredProducts: "Featured Products",
    cart: "Cart",
    total: "Total",
    checkout: "Checkout",
    emptyCart: "Your cart is empty.",
    loading: "Loading...",
    selectCategory: "Select a category",
    deliveryFee: "Delivery Fee",
    deliveryTime: "Delivery Time",
    delivery: "Delivery",
    price: "Price",
    minOrder: "Minimum Order",
    searchProducts: "Search products...",
    noProducts: "No products found",
    searchResults: "Search results for"
  },
  pt: {
    home: "Início",
    allCategories: "Todas as Categorias",
    productsForYou: "Produtos Para Você",
    featuredProducts: "Produtos em Destaque",
    cart: "Carrinho",
    total: "Total",
    checkout: "Finalizar Compra",
    emptyCart: "Seu carrinho está vazio.",
    loading: "Carregando...",
    selectCategory: "Selecione uma categoria",
    deliveryFee: "Taxa de Entrega",
    deliveryTime: "Tempo de Entrega",
    delivery: "Entrega",
    price: "Preço",
    minOrder: "Pedido Mínimo",
    searchProducts: "Pesquisar produtos...",
    noProducts: "Nenhum produto encontrado",
    searchResults: "Resultado da busca por"
  }
};

export default function Store() {
  const [products, setProducts] = useState([]);
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [deliveryMethods, setDeliveryMethods] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [banners, setBanners] = useState([]);
  const [settings, setSettings] = useState({});
  const [advertisements, setAdvertisements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);
  const [language, setLanguage] = useState("pt");
  const [user, setUser] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductDetails, setShowProductDetails] = useState(false);
  const [showCustomerMessages, setShowCustomerMessages] = useState(false);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [darkMode, setDarkMode] = useState(true);
  const [isGridView, setIsGridView] = useState(false);

  // NOVOS ESTADOS PARA A OFERTA REFORMULADA
  const [showNewCustomerOffer, setShowNewCustomerOffer] = useState(false);
  const [isNewCustomerOfferActive, setIsNewCustomerOfferActive] = useState(false);
  const [offerTimeLeft, setOfferTimeLeft] = useState(0);
  const [hasCheckedOffer, setHasCheckedOffer] = useState(false);
  const [showOfferCountdown, setShowOfferCountdown] = useState(false); // NOVA STATE - controla só a exibição do cronômetro


  const t = translations[language];

  const setCartAndSave = (newCart) => {
    setCart(newCart);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('shoppingCart', JSON.stringify(newCart));
      }
    } catch (e) {
      console.error("Falha ao salvar o carrinho:", e);
    }
  };

  const calculateCartTotal = () => {
    const originalTotal = cart.reduce((total, item) => total + item.product.price * item.quantity, 0);
    
    // NOVA LÓGICA: Desconto aplicado apenas ao PRIMEIRO produto no carrinho
    if (isNewCustomerOfferActive && cart.length > 0) {
      const firstItem = cart[0];
      const discountOnFirstItem = firstItem.product.price * firstItem.quantity * 0.2;
      return originalTotal - discountOnFirstItem;
    }
    
    return originalTotal;
  };

  const getDiscountAmount = () => {
    if (isNewCustomerOfferActive && cart.length > 0) {
      const firstItem = cart[0];
      return firstItem.product.price * firstItem.quantity * 0.2;
    }
    return 0;
  };

  const handleAddToCart = (productToAdd) => {
    const existingItem = cart.find((item) => item.product.id === productToAdd.id);
    let newCart;
    if (existingItem) {
      newCart = cart.map((item) =>
      item.product.id === productToAdd.id ? { ...item, quantity: item.quantity + 1 } : item
      );
    } else {
      newCart = [...cart, { product: productToAdd, quantity: 1 }];
    }
    setCartAndSave(newCart);
    setShowCart(true);
  };

  const handleUpdateCartItem = (productId, quantity) => {
    let newCart;
    if (quantity <= 0) {
      newCart = cart.filter((item) => item.product.id !== productId);
    } else {
      newCart = cart.map((item) =>
      item.product.id === productId ? { ...item, quantity: quantity } : item
      );
    }
    setCartAndSave(newCart);
  };

  const handleRemoveFromCart = (productId) => {
    const newCart = cart.filter((item) => item.product.id !== productId);
    setCartAndSave(newCart);
  };

  const clearCart = () => {
    setCart([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('shoppingCart');
    }
    setShowCart(false);
  };

  const handleInitiateCheckout = async () => {
    setShowCart(false);
    if (!user) {
      toast.info("Você precisa fazer login para finalizar a compra.", {
        description: "Redirecionando para a página de login..."
      });
      setTimeout(async () => {
        await User.loginWithRedirect(window.location.href);
      }, 2000);
    } else {
      setShowCheckout(true);
    }
  };

  const handleConfirmOrder = async (customerData) => {
    setIsSubmittingOrder(true);
    const originalTotal = cart.reduce((total, item) => total + item.product.price * item.quantity, 0);
    const discountAmount = getDiscountAmount();
    const finalTotal = originalTotal - discountAmount;
    
    let finalPayload = { 
      ...customerData, 
      total_amount: originalTotal,
      discount_amount: discountAmount,
      final_total: finalTotal
    };

    // Se a oferta de novo cliente estiver ativa, aplicar o desconto no payload
    if (isNewCustomerOfferActive && discountAmount > 0) {
      finalPayload = {
        ...finalPayload,
        coupon_code: "NOVO CLIENTE 20% - 1 PRODUTO",
      };
    }

    try {
      const orderPayload = {
        customer_name: finalPayload.name,
        customer_phone: finalPayload.phone,
        customer_address: finalPayload.address,
        customer_email: user.email,
        items: cart.map((item) => ({
          product_id: item.product.id,
          product_name: item.product.name,
          quantity: item.quantity,
          unit_price: item.product.price,
          total: item.product.price * item.quantity,
          image_url: item.product.image_url,
          digital_content: item.product.digital_content || null
        })),
        total_amount: originalTotal,
        coupon_code: finalPayload.coupon_code || null,
        discount_amount: finalPayload.discount_amount || 0,
        final_total: finalPayload.final_total,
        status: 'pendente',
        delivery_fee: 0,
        notes: finalPayload.notes || '',
        payment_method: finalPayload.payment_method
      };

      const newOrder = await Order.create(orderPayload);
      
      // CRÍTICO: Criar o acesso ao curso para o aluno
      for (const item of orderPayload.items) {
        if (item.digital_content && item.digital_content.startsWith('course_access:')) {
          const courseId = item.digital_content.split(':')[1];
          if (courseId && user) { // Ensure user is defined before accessing its properties
            await CourseAccess.create({
              course_id: courseId,
              student_email: user.email,
              student_name: user.full_name,
            });
            toast.info("Seu acesso ao curso foi liberado!");
          }
        }
      }

      setLastOrder(newOrder);
      clearCart();
      setShowCheckout(false);
      
      // Desativa a oferta permanentemente após a compra
      if (isNewCustomerOfferActive) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('newCustomerOfferUsed', 'true');
          localStorage.removeItem('newCustomerOfferActive');
          localStorage.removeItem('offerExpiresAt');
          localStorage.removeItem('offerCountdownDismissed'); // Clear dismissed state as well
        }
        setIsNewCustomerOfferActive(false);
        setOfferTimeLeft(0);
        setShowOfferCountdown(false); // Hide countdown
      }

    } catch (error) {
      console.error("Failed to create order:", error);
      setError("Failed to place order. Please try again.");
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  const handleViewProductDetails = (product) => {
    setSelectedProduct(product);
    setShowProductDetails(true);
  };

  const loadStoreDataSafely = async () => {
    setLoading(true);
    setError(null);
    try {
      const [productsData, coursesData, bannersData, settingsData, categoriesData, deliveryMethodsData, advertisementsData, paymentMethodsData] = await Promise.all([
      Product.filter({ is_active: true }).catch(() => []),
      Course.filter({ is_active: true }).catch(() => []), // Carregar cursos ativos
      Banner.filter({ is_active: true }, '-created_date').catch(() => []),
      Settings.list().catch(() => []),
      Category.filter({ is_active: true }).catch(() => []),
      DeliveryMethod.filter({ is_active: true }).catch(() => []),
      Advertisement.filter({ is_active: true }, '-priority').catch(() => []),
      PaymentMethod.filter({ is_active: true }).catch(() => [])
      ]);

      setProducts(productsData || []);
      setCourses(coursesData || []); // Definir cursos
      setBanners(bannersData || []);
      setCategories(categoriesData || []);
      setAdvertisements(advertisementsData || []);
      setPaymentMethods(paymentMethodsData || []);
      if (deliveryMethodsData && deliveryMethodsData.length > 0) {
        setDeliveryMethods(deliveryMethodsData);
      }
      if (settingsData && settingsData.length > 0) {
        setSettings(settingsData[0]);
      }
    } catch (error) {
      console.error("Failed to load store data:", error);
      setError("Failed to load store data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadMessagesCount = useCallback(async (userEmail) => {
    try {
      const unreadQuestions = await Question.filter({
        customer_email: userEmail,
        is_answered: true,
        is_read_by_customer: false
      });
      setUnreadMessagesCount(unreadQuestions.length);
    } catch (error) {
      console.error("Erro ao carregar contador de mensagens:", error);
      // Se der erro, não quebra a aplicação, só não mostra o contador
      setUnreadMessagesCount(0);
    }
  }, []);

  const checkUserSession = useCallback(async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);

      // LÓGICA CORRIGIDA: Verificar se já foi mostrado, se está ativo, ou se foi usado
      if (currentUser && !hasCheckedOffer) {
        const userOrders = await Order.filter({ customer_email: currentUser.email });
        const offerUsed = typeof window !== 'undefined' && localStorage.getItem('newCustomerOfferUsed') === 'true';
        const offerActive = typeof window !== 'undefined' && localStorage.getItem('newCustomerOfferActive') === 'true';
        const offerShown = typeof window !== 'undefined' && localStorage.getItem('newCustomerOfferShown') === 'true';

        // SÓ MOSTRA A OFERTA SE:
        // 1. Nunca comprou (userOrders.length === 0)
        // 2. Nunca usou o bônus (!offerUsed) 
        // 3. Não tem oferta ativa (!offerActive)
        // 4. Nunca foi mostrado antes (!offerShown)
        if (userOrders.length === 0 && !offerUsed && !offerActive && !offerShown) {
          // É um novo cliente, mostrar a oferta após 2 segundos
          setTimeout(() => setShowNewCustomerOffer(true), 2000);
        }
        setHasCheckedOffer(true); // Marca que a checagem foi feita
      }
      
      if (currentUser) {
        loadUnreadMessagesCount(currentUser.email);
      }
    } catch (error) {
      // Se não está logado, não mostra a oferta de novo cliente.
      setUser(null);
      setHasCheckedOffer(true); // Marca que a checagem foi feita
    }
  }, [loadUnreadMessagesCount, hasCheckedOffer]);

  // Timer para controlar a expiração da oferta
  useEffect(() => {
    let interval;
    
    if (isNewCustomerOfferActive && offerTimeLeft > 0) {
      interval = setInterval(() => {
        setOfferTimeLeft(prev => {
          if (prev <= 1) {
            // Oferta expirou
            handleOfferExpire(); // Call the new handler
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isNewCustomerOfferActive, offerTimeLeft]);

  const handleActivateOffer = () => {
    const now = Date.now();
    const expiresAt = now + (24 * 60 * 60 * 1000); // 24 horas
    const timeLeftInSeconds = Math.floor((expiresAt - now) / 1000);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('newCustomerOfferActive', 'true');
      localStorage.setItem('offerExpiresAt', expiresAt.toString());
      localStorage.setItem('newCustomerOfferShown', 'true'); // MARCAR COMO JÁ MOSTRADO
    }
    
    setIsNewCustomerOfferActive(true);
    setOfferTimeLeft(timeLeftInSeconds);
    setShowOfferCountdown(true); // Mostrar o cronômetro
    setShowNewCustomerOffer(false);
    
    toast.success("🎉 Desconto de 20% ativado! Válido por 24 horas no primeiro produto do carrinho.");
  };

  const handleOfferExpire = () => {
    setIsNewCustomerOfferActive(false);
    setOfferTimeLeft(0);
    setShowOfferCountdown(false); // Hide the countdown bar
    if (typeof window !== 'undefined') {
      localStorage.removeItem('newCustomerOfferActive');
      localStorage.removeItem('offerExpiresAt');
      localStorage.removeItem('offerCountdownDismissed'); // Limpar também o dismiss
      // NÃO remove o 'newCustomerOfferShown' - deixa lá para nunca mais mostrar
    }
    toast.info("Sua oferta de desconto expirou.");
  };

  const handleDismissCountdown = () => {
    // APENAS esconder o cronômetro, MAS manter o desconto nos produtos
    setShowOfferCountdown(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('offerCountdownDismissed', 'true');
    }
  };

  useEffect(() => {
    checkUserSession();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkUserSession();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [checkUserSession]);

  useEffect(() => {
    // Restaurar o estado da oferta ativa do localStorage
    if (typeof window !== 'undefined') {
      const offerActive = localStorage.getItem('newCustomerOfferActive') === 'true';
      const offerUsed = localStorage.getItem('newCustomerOfferUsed') === 'true';
      const countdownDismissed = localStorage.getItem('offerCountdownDismissed') === 'true';
      const expiresAt = parseInt(localStorage.getItem('offerExpiresAt') || '0');
      
      if (offerActive && !offerUsed && expiresAt > Date.now()) {
        setIsNewCustomerOfferActive(true);
        setOfferTimeLeft(Math.floor((expiresAt - Date.now()) / 1000));
        
        // SÓ MOSTRAR O CRONÔMETRO SE NÃO FOI DISMISSED
        if (!countdownDismissed) {
          setShowOfferCountdown(true);
        }
      } else if (offerActive && expiresAt <= Date.now()) {
        // Oferta expirou, limpar localStorage
        localStorage.removeItem('newCustomerOfferActive');
        localStorage.removeItem('offerExpiresAt');
        localStorage.removeItem('offerCountdownDismissed');
      }
      
      try {
        const savedCart = localStorage.getItem('shoppingCart');
        if (savedCart) {
          setCart(JSON.parse(savedCart));
        }
        // Carregar preferência de visualização
        const savedView = localStorage.getItem('store-view');
        if (savedView) {
          setIsGridView(JSON.parse(savedView));
        }
      } catch (e) {
        console.error("Não foi possível carregar o carrinho ou as preferências de visualização:", e);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('shoppingCart');
          localStorage.removeItem('store-view');
        }
      }
    }
    loadStoreDataSafely();
  }, []); 

  // Função para alternar visualização em grade
  const toggleGridView = () => {
    const newView = !isGridView;
    setIsGridView(newView);
    if (typeof window !== 'undefined') {
      localStorage.setItem('store-view', JSON.stringify(newView));
    }
  };

  // Função para alternar tema (agora a fonte da verdade)
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('darkMode', JSON.stringify(newDarkMode)); // Salva a preferência
    }
    
    // Aplica/remove a classe no documento para CSS global
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Carregar preferência de tema salva e ouvir mudanças
  useEffect(() => {
    const applyTheme = () => {
      if (typeof window === 'undefined') return; // Ensure window is defined for SSR
      const savedDarkMode = localStorage.getItem('darkMode');
      // CRÍTICO: Se não houver preferência salva (novo usuário), define como escuro.
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

    // Ouve por mudanças no localStorage para sincronizar tema entre abas
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
          if (e.key === 'darkMode') {
              applyTheme();
          }
      });
    }


    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', applyTheme);
      }
    };
  }, []);

  // Combinar produtos e cursos para a exibição
  const featuredProducts = products.filter((product) => product.is_featured);
  const featuredCourses = courses.filter((course) => course.is_featured);

  const filteredProducts = products.filter((product) => {
    // MUDANÇA: Se não há categoria selecionada E não há pesquisa, mostrar apenas produtos em destaque
    if (!selectedCategory && !searchTerm.trim()) {
      return product.is_featured; // Mostrar apenas produtos em destaque
    }
    
    // Se há categoria ou pesquisa, funciona normalmente
    const matchesCategory = selectedCategory ? product.category === selectedCategory.slug : true;
    const lowerCaseSearchTerm = searchTerm.toLowerCase().trim();
    const matchesSearch = lowerCaseSearchTerm === "" ||
    product.name.toLowerCase().includes(lowerCaseSearchTerm) ||
    (product.description && product.description.toLowerCase().includes(lowerCaseSearchTerm));

    return matchesCategory && matchesSearch;
  });

  const filteredCourses = courses.filter((course) => {
    // MUDANÇA: Se não há categoria selecionada E não há pesquisa, mostrar apenas cursos em destaque
    if (!selectedCategory && !searchTerm.trim()) {
      return course.is_featured; // Mostrar apenas cursos em destaque
    }
    
    // Se há pesquisa, funciona normalmente
    const lowerCaseSearchTerm = searchTerm.toLowerCase().trim();
    const matchesSearch = lowerCaseSearchTerm === "" ||
    course.title.toLowerCase().includes(lowerCaseSearchTerm) ||
    (course.description && course.description.toLowerCase().includes(lowerCaseSearchTerm));

    return matchesSearch;
  });

  const clearSearch = () => {
    setSearchTerm("");
    setSelectedCategory(null);
  };

  const getSectionTitle = () => {
    if (searchTerm.trim()) {
      return `${t.searchResults} "${searchTerm}"`;
    }
    if (selectedCategory) {
      return selectedCategory.name;
    }
    // MUDANÇA: Título para quando não há categoria selecionada
    return t.featuredProducts; // Vai mostrar "Produtos em Destaque"
  };

  const handleAdClick = async (advertisement) => {
    try {
      await Advertisement.update(advertisement.id, {
        click_count: (advertisement.click_count || 0) + 1
      });

      if (advertisement.link_url.startsWith('http')) {
        window.open(advertisement.link_url, '_blank');
      } else {
        window.location.href = advertisement.link_url;
      }
    } catch (error) {
      console.error("Erro ao registrar clique:", error);
      if (advertisement.link_url.startsWith('http')) {
        window.open(advertisement.link_url, '_blank');
      } else {
        window.location.href = advertisement.link_url;
      }
    }
  };

  const getUniqueAdvertisementsByPosition = (position) => {
    const ads = advertisements.filter((ad) => {
      if (!ad.is_active || ad.position !== position) return false;
      
      // Se não tem categorias específicas definidas, mostra em todas
      if (!ad.target_categories || ad.target_categories.length === 0) {
        return true;
      }
      
      // Se há uma categoria selecionada, verifica se o anúncio deve aparecer nela
      if (selectedCategory) {
        return ad.target_categories.includes(selectedCategory.slug);
      }
      
      // Se está na página inicial (sem categoria selecionada), mostra apenas anúncios sem restrição de categoria
      return ad.target_categories.length === 0;
    });
    
    return ads.sort(() => Math.random() - 0.5);
  };

  // Nova função para filtrar banners por categoria
  const getFilteredBanners = () => {
    return banners.filter(banner => {
      if (!banner.is_active) return false;
      
      // Se não tem categorias específicas definidas, mostra em todas
      if (!banner.target_categories || banner.target_categories.length === 0) {
        return true;
      }
      
      // Se há uma categoria selecionada, verifica se o banner deve aparecer nela
      if (selectedCategory) {
        return banner.target_categories.includes(selectedCategory.slug);
      }
      
      // Se está na página inicial (sem categoria selecionada), mostra apenas banners sem restrição de categoria
      // que tenham sido marcados para aparecer quando nenhuma categoria estiver selecionada
      return banner.target_categories.includes("all") || banner.target_categories.length === 0;
    });
  };

  if (loading) {
    return (
      <div className={`flex justify-center items-center h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
        <p>{t.loading}</p>
      </div>);

  }

  if (error && !lastOrder) {
    return (
      <div className={`flex justify-center items-center h-screen text-red-500 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
        <p>{error}</p>
      </div>);

  }

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${
      darkMode 
        ? 'bg-gray-900 text-white' 
        : 'bg-gray-100 text-gray-900'
    }`}>
      {/* Script para prevenir o flash de tela branca */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              try {
                var savedMode = localStorage.getItem('darkMode');
                if (savedMode === 'true' || savedMode === null) {
                  document.documentElement.classList.add('dark');
                }
              } catch (e) {}
            })();
          `,
        }}
      />
      
      <Toaster richColors position="top-center" />
      <DynamicStyles settings={settings} />

      {/* CRONÔMETRO FIXO NO TOPO */}
      {isNewCustomerOfferActive && showOfferCountdown && (
        <OfferCountdownBar 
          timeLeft={offerTimeLeft}
          onExpire={handleOfferExpire}
          onDismiss={handleDismissCountdown}
        />
      )}

      <header className={`shadow p-4 flex justify-between items-center fixed top-0 left-0 right-0 z-10 transition-all duration-300 ${
        darkMode 
          ? 'bg-gray-800 border-b border-gray-700' 
          : 'bg-white'
      } ${isNewCustomerOfferActive && showOfferCountdown ? 'mt-16' : ''}`}>
        <div className="flex items-center gap-4">
          {settings.store_logo_url &&
          <img src={settings.store_logo_url} alt="Logo" className="h-10 w-auto" />
          }
          <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            {settings.store_name || "Minha Loja"}
          </h1>
        </div>

        <div className="flex items-center gap-4">
          {/* Botão de Toggle de Tema */}
          <button
            onClick={toggleDarkMode}
            className={`p-3 rounded-full transition-all duration-200 ${
              darkMode 
                ? 'bg-yellow-500 text-gray-900 hover:bg-yellow-400' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            title={darkMode ? "Modo Claro" : "Modo Escuro"}
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          <div className="hidden md:flex items-center gap-2">
            {user && (
              <UserProfileMenu
                user={user}
                unreadMessagesCount={unreadMessagesCount}
                onOpenMessages={() => setShowCustomerMessages(true)}
                darkMode={darkMode}
              />
            )}
          </div>

          <button
            onClick={() => setShowCart(true)} 
            className={`p-3 relative rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 ${
              darkMode 
                ? 'bg-orange-600 hover:bg-orange-700 text-white' 
                : 'bg-orange-500 hover:bg-orange-600 text-white'
            }`}
          >
            🛒
            {cart.length > 0 &&
            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center shadow-md">
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            }
          </button>
          
          <div className="md:hidden">
             {user && (
              <UserProfileMenu
                user={user}
                unreadMessagesCount={unreadMessagesCount}
                onOpenMessages={() => setShowCustomerMessages(true)}
                darkMode={darkMode}
              />
            )}
          </div>
        </div>
      </header>

      <main className={`container mx-auto p-4 ${isNewCustomerOfferActive && showOfferCountdown ? 'pt-32' : 'pt-20'}`}>
        <BannerCarousel banners={getFilteredBanners()} />

        <section className="mb-6">
          <div className="relative max-w-md mx-auto">
            <div className={`flex items-center rounded-full shadow-md border transition-colors duration-300 ${
              darkMode 
                ? 'bg-gray-800 border-gray-600' 
                : 'bg-white border-gray-200'
            }`}>
              <Search className={`w-5 h-5 ml-4 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
              <input
                type="text"
                placeholder={t.searchProducts}
                value={searchTerm}
                onChange={(e) => {setSearchTerm(e.target.value);setSelectedCategory(null);}}
                className={`flex-1 px-4 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors duration-300 ${
                  darkMode 
                    ? 'bg-gray-800 text-white placeholder-gray-400' 
                    : 'bg-white text-gray-900 placeholder-gray-500'
                }`}
              />

              {searchTerm &&
              <button
                onClick={clearSearch}
                className={`mr-3 p-2 rounded-full transition-all duration-200 shadow-sm hover:shadow-md ${
                  darkMode 
                    ? 'hover:bg-gray-700' 
                    : 'hover:bg-gray-100'
                }`}
              >
                  <X className={`w-4 h-4 ${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`} />
                </button>
              }
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Categorias
          </h2>
          <div className="flex flex-wrap gap-4">
            {categories.map((category) =>
            <button
              key={category.id}
              onClick={() => {setSelectedCategory(category);setSearchTerm("");}}
              className={`px-4 py-2 rounded-full transition-colors duration-200 ${
                selectedCategory?.id === category.id && !searchTerm 
                  ? 'bg-orange-500 text-white' 
                  : darkMode 
                    ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
                    : 'bg-white text-gray-700 hover:bg-gray-200'
              }`}
            >
                {category.name}
              </button>
            )}
          </div>
        </section>

        {getUniqueAdvertisementsByPosition('after_categories').slice(0, 1).map((ad) =>
        <AdvertisementBanner key={`after_categories_${ad.id}`} advertisement={ad} onAdClick={handleAdClick} />
        )}

        {getUniqueAdvertisementsByPosition('after_featured').slice(0, 1).map((ad) =>
        <AdvertisementBanner key={`after_featured_${ad.id}`} advertisement={ad} onAdClick={handleAdClick} />
        )}

        <section className="mb-8">
          <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            {getSectionTitle()}
          </h2>
          {(filteredProducts.length === 0 && filteredCourses.length === 0) ? (
            <div className="text-center py-12">
              <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {selectedCategory || searchTerm ? t.noProducts : 'Nenhum produto em destaque no momento.'}
              </p>
              {(searchTerm || selectedCategory) &&
                <button
                  onClick={() => {setSelectedCategory(null);setSearchTerm("");}}
                  className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors"
                >
                  Voltar aos Produtos em Destaque
                </button>
              }
            </div>
          ) : (
            <div>
              <div className={`grid gap-6 ${isGridView ? 'grid-cols-2' : 'grid-cols-1'} sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4`}>
                {/* Produtos */}
                {filteredProducts.map((product, index) => {
                  const method = deliveryMethods.find((m) => m.id === product.delivery_method_id);
                  
                  const shouldShowAd = index === 8;
                  const middleAds = getUniqueAdvertisementsByPosition('middle_products');

                  return (
                    <React.Fragment key={`product-${product.id}`}>
                      {shouldShowAd && middleAds.length > 0 &&
                        <div className="col-span-full">
                          <AdvertisementBanner
                            key={`middle_${middleAds[0].id}`}
                            advertisement={middleAds[0]}
                            onAdClick={handleAdClick}
                          />
                        </div>
                      }
                      <ProductCard
                        product={product}
                        onAddToCart={() => handleAddToCart(product)}
                        onViewDetails={handleViewProductDetails}
                        language={language}
                        deliveryMethod={method}
                        isGridView={isGridView}
                        darkMode={darkMode}
                        isNewCustomerOfferActive={isNewCustomerOfferActive} // SEMPRE passa esta prop
                        isFirstInCart={cart.length === 0} // Nova prop para identificar se será o primeiro produto
                      />
                    </React.Fragment>
                  );
                })}

                {/* Cursos */}
                {filteredCourses.map((course) => (
                  <CourseCard
                    key={`course-${course.id}`}
                    course={course}
                    onEnroll={() => handleEnrollCourse(course)}
                    language={language}
                    darkMode={darkMode}
                  />
                ))}
              </div>
            </div>
          )}
        </section>

        {getUniqueAdvertisementsByPosition('before_footer').slice(0, 1).map((ad) =>
        <AdvertisementBanner key={`before_footer_${ad.id}`} advertisement={ad} onAdClick={handleAdClick} />
        )}
      </main>

      <ShoppingCartSheet
        isOpen={showCart}
        onClose={() => setShowCart(false)}
        cartItems={cart}
        onUpdateItem={handleUpdateCartItem}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={clearCart}
        onCheckout={handleInitiateCheckout}
        calculateTotal={calculateCartTotal()}
        originalTotal={cart.reduce((total, item) => total + item.product.price * item.quantity, 0)}
        discountAmount={getDiscountAmount()}
        isNewCustomerOfferActive={isNewCustomerOfferActive}
        language={language}
        t={t} />


      <CheckoutDialog
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        onSubmit={handleConfirmOrder}
        isSubmitting={isSubmittingOrder}
        user={user}
        cartItems={cart}
        total={cart.reduce((total, item) => total + item.product.price * item.quantity, 0)}
        discountAmount={getDiscountAmount()}
        paymentMethods={paymentMethods}
        isNewCustomerOfferActive={isNewCustomerOfferActive}
        t={t} />


      <OrderSuccessDialog
        isOpen={!!lastOrder}
        onClose={() => setLastOrder(null)}
        orderId={lastOrder?.id} />

      <ProductDetailsModal
        product={selectedProduct}
        isOpen={showProductDetails}
        onClose={() => {
          setShowProductDetails(false);
          setSelectedProduct(null);
        }}
        onAddToCart={handleAddToCart}
        language={language}
        deliveryMethod={selectedProduct ? deliveryMethods.find((m) => m.id === selectedProduct.delivery_method_id) : null}
        darkMode={darkMode}
        isNewCustomerOfferActive={isNewCustomerOfferActive}
        />

      <CustomerMessagesModal
        isOpen={showCustomerMessages}
        onClose={() => setShowCustomerMessages(false)}
        onUpdateCount={setUnreadMessagesCount}
      />

      {/* NOVO MODAL DE OFERTA */}
      <NewCustomerOfferModal
        isOpen={showNewCustomerOffer}
        onClose={() => {
          setShowNewCustomerOffer(false);
          if (typeof window !== 'undefined') {
            localStorage.setItem('newCustomerOfferShown', 'true');
          }
        }}
        onActivate={handleActivateOffer}
        timeLeft={offerTimeLeft}
      />

      <Footer settings={settings} />

      {/* Botão Flutuante para Alternar Visualização */}
      <div className="sm:hidden fixed bottom-6 right-6 z-20">
        <Button
          onClick={toggleGridView}
          size="icon"
          className="rounded-full w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
        >
          {isGridView ? <List className="w-6 h-6" /> : <LayoutGrid className="w-6 h-6" />}
        </Button>
      </div>
    </div>);

  // Função para inscrever no curso (similar ao adicionar ao carrinho)
  function handleEnrollCourse(course) {
    // Tratar cursos como produtos especiais no carrinho
    const courseAsProduct = {
      id: `course-${course.id}`, // Use a unique ID for courses in cart
      name: course.title,
      price: course.price,
      image_url: course.thumbnail_url,
      description: course.description,
      digital_content: `course_access:${course.id}`, // Identificador especial para cursos
      is_course: true // Flag para identificar que é um curso
    };

    handleAddToCart(courseAsProduct);
  }

}

// Componente CourseCard (similar ao ProductCard)
function CourseCard({ course, onEnroll, language = 'pt', darkMode }) {

  const hasDiscount = course.original_price && course.original_price > course.price;
  const discountPercentage = hasDiscount ?
    Math.round(((course.original_price - course.price) / course.original_price) * 100) : 0;

  return (
    <Card className={`flex flex-col h-full backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-300 group border-0 overflow-hidden ${
      darkMode 
        ? 'bg-gray-800/90 text-white' 
        : 'bg-white/90 text-gray-900'
    }`}>
      <div className="relative">
        <img
          src={course.thumbnail_url || 'https://via.placeholder.com/300x200?text=Curso'}
          alt={course.title}
          className="w-full h-48 object-cover"
        />

        {/* Play button overlay */}
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
          <PlayCircle className="w-16 h-16 text-white opacity-80 group-hover:opacity-100 transition-opacity" />
        </div>

        {/* Badges */}
        <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
          {discountPercentage > 0 && (
            <Badge className="bg-red-500 text-white font-bold text-xs px-2 py-1">
              -{discountPercentage}% OFF
            </Badge>
          )}

          {course.is_featured && (
            <Badge className="bg-yellow-400 text-yellow-900 font-bold text-xs">Destaque</Badge>
          )}

          <Badge className="bg-blue-500 text-white font-bold text-xs">
            📚 CURSO
          </Badge>
        </div>
      </div>

      <CardContent className="p-4 flex-grow">
        <div className="mb-3">
          <Badge 
            variant="outline" 
            className={`font-medium text-xs px-3 py-1 ${
              darkMode 
                ? 'bg-purple-900/50 text-purple-200 border-purple-700' 
                : 'bg-purple-50 text-purple-700 border-purple-200'
            }`}
          >
            🎓 {course.category || 'Educação'}
          </Badge>
        </div>

        <CardTitle className={`text-lg font-semibold mb-2 line-clamp-2 ${
          darkMode ? 'text-white' : 'text-slate-800'
        }`}>
          {course.title}
        </CardTitle>

        <p className={`text-sm line-clamp-3 mb-3 ${
          darkMode ? 'text-gray-300' : 'text-slate-600'
        }`}>
          {course.description}
        </p>

        {/* Informações do curso */}
        <div className={`flex items-center justify-between text-sm mb-3 ${
          darkMode ? 'text-gray-400' : 'text-slate-500'
        }`}>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{course.instructor_name || "Instrutor"}</span>
          </div>
          {course.duration_hours && (
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{course.duration_hours}h</span>
            </div>
          )}
        </div>

        <div className="text-center mb-3">
          <Badge 
            variant="outline" 
            className={`text-xs ${
              darkMode 
                ? 'bg-gray-700 text-gray-300 border-gray-600' 
                : 'bg-gray-50 text-gray-600 border-gray-200'
            }`}
          >
            {course.difficulty_level || "iniciante"}
          </Badge>
        </div>
      </CardContent>

      <CardFooter className={`p-4 border-t ${
        darkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-slate-100'
      }`}>
        <div className="w-full space-y-3">
          {/* Preços */}
          <div className="text-center">
            {hasDiscount ? (
              <div className="space-y-1">
                <p className={`text-sm line-through ${
                  darkMode ? 'text-gray-400' : 'text-slate-500'
                }`}>
                  R$ {(course.original_price || 0).toFixed(2).replace('.', ',')}
                </p>
                <p className="text-xl font-bold text-red-600">
                  R$ ${(course.price || 0).toFixed(2).replace('.', ',')}
                </p>
              </div>
            ) : (
              <p className={`text-xl font-bold ${
                darkMode ? 'text-purple-400' : 'text-purple-600'
              }`}>
                R$ ${(course.price || 0).toFixed(2).replace('.', ',')}
              </p>
            )}
          </div>

          {/* Botão */}
          <Button
            onClick={() => onEnroll(course)}
            className={`w-full text-white transition-colors duration-200 shadow-md hover:shadow-lg ${
              darkMode 
                ? 'bg-purple-600 hover:bg-purple-700' 
                : 'bg-purple-600 hover:bg-purple-700'
            }`}
          >
            🎓 Comprar Curso
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
