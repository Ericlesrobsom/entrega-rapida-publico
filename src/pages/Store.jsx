
import React, { useState, useEffect, useCallback } from "react";
import { Product } from "@/api/entities";
import { Order } from "@/api/entities";
import { User } from "@/api/entities";
import { Banner } from "@/api/entities";
import { Settings } from "@/api/entities";
import { Category } from "@/api/entities";
import { DeliveryMethod } from "@/api/entities";
import { PaymentMethod } from "@/api/entities"; // Novo
import { Advertisement } from "@/api/entities"; // New import for Advertisement entity
import { Question } from "@/api/entities"; // New import for Question entity
import { Search, X, MessageCircle } from "lucide-react"; // Add MessageCircle
import ProductCard from "../components/store/ProductCard";
import ShoppingCartSheet from "../components/store/ShoppingCartSheet";
import CheckoutDialog from "../components/store/CheckoutDialog";
import OrderSuccessDialog from "../components/store/OrderSuccessDialog";
import BannerCarousel from "../components/store/BannerCarousel";
import DynamicStyles from "../components/store/DynamicStyles";
import Footer from "../components/store/Footer";
import ProductDetailsModal from "../components/store/ProductDetailsModal";
import AdvertisementBanner from "../components/store/AdvertisementBanner"; // New import for AdvertisementBanner component
import CustomerMessagesModal from "../components/store/CustomerMessagesModal"; // New import
import { Toaster, toast } from 'sonner';

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
    searchResults: "Resultados da busca por"
  }
};

export default function Store() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [deliveryMethods, setDeliveryMethods] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]); // Novo
  const [banners, setBanners] = useState([]);
  const [settings, setSettings] = useState({});
  const [advertisements, setAdvertisements] = useState([]); // New state for advertisements
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
  const [showCustomerMessages, setShowCustomerMessages] = useState(false); // Novo estado
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0); // Contador de mensagens

  const t = translations[language];

  // Helper para salvar e atualizar o carrinho
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

  // Helper para calcular o total do carrinho
  const calculateCartTotal = () => {
    return cart.reduce((total, item) => total + item.product.price * item.quantity, 0);
  };

  // Funções para manipulação do carrinho (agora salvando em localStorage)
  const handleAddToCart = (product) => {
    const existingItem = cart.find((item) => item.product.id === product.id);
    let newCart;
    if (existingItem) {
      newCart = cart.map((item) =>
      item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      );
    } else {
      newCart = [...cart, { product, quantity: 1 }];
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
    try {
      const orderPayload = {
        customer_name: customerData.name,
        customer_phone: customerData.phone,
        customer_address: customerData.address,
        items: cart.map((item) => ({
          product_id: item.product.id,
          product_name: item.product.name,
          quantity: item.quantity,
          unit_price: item.product.price,
          total: item.product.price * item.quantity,
          image_url: item.product.image_url,
          digital_content: item.product.digital_content || null // Copia o conteúdo digital
        })),
        total_amount: calculateCartTotal(),
        status: 'pendente',
        delivery_fee: 0,
        notes: customerData.notes || '',
        payment_method: customerData.payment_method
      };

      const newOrder = await Order.create(orderPayload);
      setLastOrder(newOrder);
      clearCart();
      setShowCheckout(false);

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

  // Função de carregamento de dados da loja
  const loadStoreDataSafely = async () => {
    setLoading(true);
    setError(null);
    try {
      const [productsData, bannersData, settingsData, categoriesData, deliveryMethodsData, advertisementsData, paymentMethodsData] = await Promise.all([
      Product.filter({ is_active: true }).catch(() => []),
      Banner.filter({ is_active: true }, '-created_date').catch(() => []),
      Settings.list().catch(() => []),
      Category.filter({ is_active: true }).catch(() => []),
      DeliveryMethod.filter({ is_active: true }).catch(() => []),
      Advertisement.filter({ is_active: true }, '-priority').catch(() => []), // Carregar anúncios
      PaymentMethod.filter({ is_active: true }).catch(() => []) // Carregar formas de pagamento
      ]);

      setProducts(productsData || []);
      setBanners(bannersData || []);
      setCategories(categoriesData || []);
      setAdvertisements(advertisementsData || []); // Salvar anúncios
      setPaymentMethods(paymentMethodsData || []); // Salvar formas de pagamento
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
    }
  }, []);

  const checkUserSession = useCallback(async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      
      // Carregar contador de mensagens não lidas
      if (currentUser) {
        loadUnreadMessagesCount(currentUser.email);
      }
    } catch (error) {
      setUser(null);
    }
  }, [loadUnreadMessagesCount]);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const savedCart = localStorage.getItem('shoppingCart');
        if (savedCart) {
          setCart(JSON.parse(savedCart));
        }
      }
    } catch (e) {
      console.error("Não foi possível carregar o carrinho:", e);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('shoppingCart');
      }
    }
    loadStoreDataSafely();
    checkUserSession();
  }, [checkUserSession]);

  const featuredProducts = products.filter((product) => product.is_featured);

  // Atualizar lógica de filtros para incluir pesquisa
  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory ? product.category === selectedCategory.slug : true;
    const lowerCaseSearchTerm = searchTerm.toLowerCase().trim();
    const matchesSearch = lowerCaseSearchTerm === "" ||
    product.name.toLowerCase().includes(lowerCaseSearchTerm) ||
    product.description && product.description.toLowerCase().includes(lowerCaseSearchTerm);

    return matchesCategory && matchesSearch;
  });

  // Função para limpar pesquisa e filtros
  const clearSearch = () => {
    setSearchTerm("");
    setSelectedCategory(null);
  };

  // Função para determinar o título da seção
  const getSectionTitle = () => {
    if (searchTerm.trim()) {
      return `${t.searchResults} "${searchTerm}"`;
    }
    if (selectedCategory) {
      return selectedCategory.name;
    }
    return t.productsForYou;
  };

  // Função para lidar com cliques em anúncios
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
      // Still navigate to the link even if update fails
      if (advertisement.link_url.startsWith('http')) {
        window.open(advertisement.link_url, '_blank');
      } else {
        window.location.href = advertisement.link_url;
      }
    }
  };

  // Função para obter anúncios únicos por posição (evita repetição)
  const getUniqueAdvertisementsByPosition = (position) => {
    const ads = advertisements.filter((ad) => ad.position === position && ad.is_active);
    // Embaralhar e retornar apenas anúncios únicos
    return ads.sort(() => Math.random() - 0.5);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>{t.loading}</p>
      </div>);

  }

  if (error && !lastOrder) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        <p>{error}</p>
      </div>);

  }

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <Toaster richColors position="top-center" />
      <DynamicStyles settings={settings} />

      <header className="bg-white shadow p-4 flex justify-between items-center fixed top-0 left-0 right-0 z-10">
        <div className="flex items-center gap-4">
          {settings.store_logo_url &&
          <img src={settings.store_logo_url} alt="Logo" className="h-10 w-auto" />
          }
          <h1 className="text-2xl font-bold text-gray-800">
            {settings.store_name || "Minha Loja"}
          </h1>
        </div>

        <div className="flex items-center gap-4">
          {user && (
            <UserProfileMenu 
              user={user} 
              unreadMessagesCount={unreadMessagesCount}
              onOpenMessages={() => setShowCustomerMessages(true)}
            />
          )}

          <button
            onClick={() => setShowCart(true)} className="bg-slate-100 text-white p-3 hover:bg-orange-600 relative rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">


            🛒
            {cart.length > 0 &&
            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center shadow-md">
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            }
          </button>
        </div>
      </header>

      <main className="container mx-auto p-4 pt-20">
        <BannerCarousel banners={banners} />

        {/* Nova seção de pesquisa com melhor visibilidade */}
        <section className="mb-6">
          <div className="relative max-w-md mx-auto">
            <div className="flex items-center bg-white rounded-full shadow-md border border-gray-200">
              <Search className="w-5 h-5 text-gray-400 ml-4" />
              <input
                type="text"
                placeholder={t.searchProducts}
                value={searchTerm}
                onChange={(e) => {setSearchTerm(e.target.value);setSelectedCategory(null);}}
                className="flex-1 px-4 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500" />

              {searchTerm &&
              <button
                onClick={clearSearch}
                className="mr-3 p-2 hover:bg-gray-100 rounded-full transition-all duration-200 shadow-sm hover:shadow-md">

                  <X className="w-4 h-4 text-gray-500 hover:text-gray-700" />
                </button>
              }
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">{t.allCategories}</h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => {setSelectedCategory(null);setSearchTerm("");}}
              className={`px-4 py-2 rounded-full ${!selectedCategory && !searchTerm ? 'bg-orange-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-200'}`}>
              {t.allCategories}
            </button>
            {categories.map((category) =>
            <button
              key={category.id}
              onClick={() => {setSelectedCategory(category);setSearchTerm("");}}
              className={`px-4 py-2 rounded-full ${selectedCategory?.id === category.id && !searchTerm ? 'bg-orange-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-200'}`}>
                {category.name}
              </button>
            )}
          </div>
        </section>

        {/* Anúncios depois das categorias - APENAS UMA VEZ */}
        {getUniqueAdvertisementsByPosition('after_categories').slice(0, 1).map((ad) =>
        <AdvertisementBanner key={`after_categories_${ad.id}`} advertisement={ad} onAdClick={handleAdClick} />
        )}

        {selectedCategory === null && featuredProducts.length > 0 && !searchTerm &&
        <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">{t.featuredProducts}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {featuredProducts.slice(0, 4).map((product) => {
              const method = deliveryMethods.find((m) => m.id === product.delivery_method_id);
              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={() => handleAddToCart(product)}
                  onViewDetails={handleViewProductDetails}
                  language={language}
                  deliveryMethod={method} />);

            })}
            </div>
          </section>
        }

        {/* Anúncios depois dos produtos em destaque - APENAS UMA VEZ */}
        {getUniqueAdvertisementsByPosition('after_featured').slice(0, 1).map((ad) =>
        <AdvertisementBanner key={`after_featured_${ad.id}`} advertisement={ad} onAdClick={handleAdClick} />
        )}

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {getSectionTitle()}
          </h2>
          {filteredProducts.length === 0 ?
          <div className="text-center py-12">
              <p className="text-gray-600 text-lg">{t.noProducts}</p>
              {(searchTerm || selectedCategory) &&
            <button
              onClick={clearSearch}
              className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors">

                  {t.allCategories}
                </button>
            }
            </div> :

          <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {filteredProducts.map((product, index) => {
                const method = deliveryMethods.find((m) => m.id === product.delivery_method_id);

                // Inserir anúncios no meio dos produtos - melhor controle
                const shouldShowAd = index === 8; // Mostrar apenas após o 8º produto
                const middleAds = getUniqueAdvertisementsByPosition('middle_products');

                return (
                  <React.Fragment key={product.id}>
                      {shouldShowAd && middleAds.length > 0 &&
                    <div className="col-span-full">
                          <AdvertisementBanner
                        key={`middle_${middleAds[0].id}`}
                        advertisement={middleAds[0]} // Pegar apenas o primeiro
                        onAdClick={handleAdClick} />

                        </div>
                    }
                      <ProductCard
                      product={product}
                      onAddToCart={() => handleAddToCart(product)}
                      onViewDetails={handleViewProductDetails}
                      language={language}
                      deliveryMethod={method} />

                    </React.Fragment>);

              })}
              </div>
            </div>
          }
        </section>

        {/* Anúncios antes do rodapé - APENAS UMA VEZ */}
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
        calculateTotal={calculateCartTotal}
        language={language}
        t={t} />


      <CheckoutDialog
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        onSubmit={handleConfirmOrder}
        isSubmitting={isSubmittingOrder}
        user={user}
        cartItems={cart}
        total={calculateCartTotal()}
        paymentMethods={paymentMethods}
        t={t} />


      <OrderSuccessDialog
        isOpen={!!lastOrder}
        onClose={() => setLastOrder(null)}
        orderId={lastOrder?.id} />

      {/* Modal de detalhes do produto */}
      <ProductDetailsModal
        product={selectedProduct}
        isOpen={showProductDetails}
        onClose={() => {
          setShowProductDetails(false);
          setSelectedProduct(null);
        }}
        onAddToCart={handleAddToCart}
        language={language}
        deliveryMethod={selectedProduct ? deliveryMethods.find((m) => m.id === selectedProduct.delivery_method_id) : null} />

      {/* Modal de mensagens do cliente */}
      <CustomerMessagesModal
        isOpen={showCustomerMessages}
        onClose={() => setShowCustomerMessages(false)}
        onUpdateCount={setUnreadMessagesCount}
      />

      <Footer settings={settings} />
    </div>);

}

// Componente do menu do usuário - ATUALIZADO
function UserProfileMenu({ user, unreadMessagesCount, onOpenMessages }) {
  const [isOpen, setIsOpen] = React.useState(false);

  // Função para obter as iniciais do nome
  const getInitials = (name) => {
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-3">
        {/* Botão de mensagens */}
        <button
          onClick={onOpenMessages}
          className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
          title="Suas mensagens"
        >
          <MessageCircle className="w-5 h-5 text-gray-600" />
          {unreadMessagesCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-md">
              {unreadMessagesCount > 9 ? '9+' : unreadMessagesCount}
            </span>
          )}
        </button>

        {/* Menu do perfil */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
        >
          <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
            {getInitials(user.full_name)}
          </div>
        </button>
      </div>

      {isOpen &&
      <>
          {/* Backdrop para fechar o menu */}
          <div
          className="fixed inset-0 z-10"
          onClick={() => setIsOpen(false)} />


          {/* Menu dropdown */}
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border z-20">
            <div className="p-4 border-b">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold">
                  {getInitials(user.full_name)}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{user.full_name}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>
            </div>

            <div className="py-2">
              <a
              href="/MyOrders"
              className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
              onClick={() => setIsOpen(false)}>

                <span>📦</span>
                <span>Meus Pedidos</span>
              </a>

              {user.email === 'ericlesrobsom03@gmail.com' &&
            <>
                  <div className="border-t my-2"></div>
                  <a
                href="/Dashboard"
                className="flex items-center gap-3 px-4 py-2 text-blue-600 hover:bg-blue-50 transition-colors"
                onClick={() => setIsOpen(false)}>

                    <span>⚙️</span>
                    <span>Dashboard Admin</span>
                  </a>
                </>
            }

              <div className="border-t my-2"></div>
              <button
              onClick={() => {
                setIsOpen(false);
                // Adicionar logout se necessário
                // e.g., await User.logout();
                // window.location.reload(); // Or redirect to login page
              }}
              className="flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors w-full text-left">

                <span>🚪</span>
                <span>Sair</span>
              </button>
            </div>
          </div>
        </>
      }
    </div>);

}
