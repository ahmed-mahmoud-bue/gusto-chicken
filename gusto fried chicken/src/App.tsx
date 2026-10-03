import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Flame,
  Search,
  Sparkles,
  ShoppingBag,
  SlidersHorizontal,
  X,
  AlertCircle,
} from 'lucide-react';
import { CategoryId, MenuItem, SizeOption, CartItem, OrderRecord } from './types';
import { CATEGORIES, MENU_ITEMS } from './data/menu';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { CategoryNav } from './components/CategoryNav';
import { ItemCard } from './components/ItemCard';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { SuccessModal } from './components/SuccessModal';
import { FloatingCartBar } from './components/FloatingCartBar';
import { Footer } from './components/Footer';
import { KitchenPage } from './components/kitchen/KitchenPage';
import { ActiveOrderTracker } from './components/ActiveOrderTracker';
import { getLastOrderId, setLastOrderId } from './utils/orderHistory';
import { validateFirestoreConnection } from './firebase';

const CART_STORAGE_KEY = 'gusto_cart_items_v1';

function checkIsKitchenRoute(): boolean {
  if (typeof window === 'undefined') return false;
  const path = window.location.pathname.toLowerCase().replace(/\/+$/, '');
  const hash = window.location.hash.toLowerCase().replace(/\/+$/, '');
  return (
    path === '/kitchen' ||
    path.startsWith('/kitchen/') ||
    hash === '#kitchen' ||
    hash === '#/kitchen'
  );
}

export default function App() {
  const [isKitchen, setIsKitchen] = useState<boolean>(() => checkIsKitchenRoute());
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Handle route change for /kitchen path and hash
  useEffect(() => {
    const onRouteChanged = () => {
      setIsKitchen(checkIsKitchenRoute());
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Secret staff shortcut: Alt+K or Ctrl+Shift+K to toggle kitchen screen
      if (
        (e.altKey && (e.key === 'k' || e.key === 'K' || e.key === 'ك')) ||
        (e.ctrlKey && e.shiftKey && (e.key === 'k' || e.key === 'K' || e.key === 'ك'))
      ) {
        e.preventDefault();
        const next = !checkIsKitchenRoute();
        if (next) {
          window.history.pushState(null, '', '/kitchen');
        } else {
          window.history.pushState(null, '', '/');
        }
        setIsKitchen(next);
      }
    };

    window.addEventListener('popstate', onRouteChanged);
    window.addEventListener('hashchange', onRouteChanged);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('popstate', onRouteChanged);
      window.removeEventListener('hashchange', onRouteChanged);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [lastPlacedOrder, setLastPlacedOrder] = useState<OrderRecord | null>(null);
  const [trackedOrderId, setTrackedOrderId] = useState<string | null>(() => getLastOrderId());

  const menuSectionRef = useRef<HTMLDivElement>(null);

  // Validate Firestore connection on boot
  useEffect(() => {
    validateFirestoreConnection().then((ok) => {
      if (ok) {
        console.log('Firebase Firestore connection verified.');
      }
    });
  }, []);

  // Save cart to local storage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch (e) {
      console.warn('Could not persist cart to localStorage', e);
    }
  }, [cartItems]);

  // Cart summary calculations
  const totalCartCount = useMemo(
    () => cartItems.reduce((acc, it) => acc + it.quantity, 0),
    [cartItems]
  );

  const totalCartPrice = useMemo(
    () => cartItems.reduce((acc, it) => acc + it.price * it.quantity, 0),
    [cartItems]
  );

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<CategoryId, number> = {
      all: MENU_ITEMS.length,
      sandwiches: 0,
      burgers: 0,
      chicken_meals: 0,
      strips_meals: 0,
      mix_meals: 0,
      fries: 0,
      kids_meals: 0,
    };

    MENU_ITEMS.forEach((it) => {
      if (counts[it.category] !== undefined) {
        counts[it.category]++;
      }
    });

    return counts;
  }, []);

  // Filtered menu items
  const filteredItems = useMemo(() => {
    let list = MENU_ITEMS;

    // Filter by category
    if (selectedCategory !== 'all') {
      list = list.filter((it) => it.category === selectedCategory);
    }

    // Filter by search query
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (it) =>
          it.arabicName.toLowerCase().includes(q) ||
          it.name.toLowerCase().includes(q) ||
          it.description.toLowerCase().includes(q)
      );
    }

    return list;
  }, [selectedCategory, searchQuery]);

  // Cart Handlers
  const handleAddToCart = (item: MenuItem, selectedSize: SizeOption) => {
    const cartItemId = `${item.id}-${selectedSize.label}`;

    setCartItems((prev) => {
      const existingIndex = prev.findIndex((ci) => ci.cartItemId === cartItemId);
      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + 1,
        };
        return next;
      } else {
        return [
          ...prev,
          {
            cartItemId,
            menuItemId: item.id,
            name: item.arabicName,
            sizeLabel: selectedSize.label,
            price: selectedSize.price,
            quantity: 1,
            image: item.image,
          },
        ];
      }
    });
  };

  const handleUpdateQuantity = (cartItemId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((it) => {
          if (it.cartItemId === cartItemId) {
            const nextQty = it.quantity + delta;
            return nextQty > 0 ? { ...it, quantity: nextQty } : null;
          }
          return it;
        })
        .filter((it): it is CartItem => it !== null)
    );
  };

  const handleRemoveItem = (cartItemId: string) => {
    setCartItems((prev) => prev.filter((it) => it.cartItemId !== cartItemId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const handleOpenCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleOrderSuccess = (orderId: string, orderData: any) => {
    setLastPlacedOrder(orderData);
    setTrackedOrderId(orderId);
    setLastOrderId(orderId);
    setIsCheckoutOpen(false);
    setIsSuccessOpen(true);
    // Clear cart after placing order
    setCartItems([]);
  };

  const scrollToMenu = () => {
    menuSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Get current quantity in cart for an item (sum of all sizes)
  const getItemQuantityInCart = (menuItemId: string) => {
    return cartItems
      .filter((ci) => ci.menuItemId === menuItemId)
      .reduce((sum, ci) => sum + ci.quantity, 0);
  };

  const currentCategoryTitle =
    CATEGORIES.find((c) => c.id === selectedCategory)?.name || 'جميع الوجبات';

  if (isKitchen) {
    return <KitchenPage />;
  }

  return (
    <div className="min-h-screen bg-[#0c0c0e] text-white flex flex-col font-['Cairo',sans-serif] relative overflow-x-hidden selection:bg-[#D31027] selection:text-white">
      {/* Ambient glowing blobs in background */}
      <div className="fixed top-1/4 -right-28 w-96 h-96 bg-red-700/15 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed top-2/3 -left-28 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-10 right-1/3 w-[30rem] h-[30rem] bg-red-950/20 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Header */}
      <Header
        cartCount={totalCartCount}
        cartTotal={totalCartPrice}
        onOpenCart={() => setIsCartOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSecretKitchenAccess={() => {
          window.history.pushState(null, '', '/kitchen');
          setIsKitchen(true);
        }}
      />

      {/* Customer's Last Order Live Status Tracker from Firestore */}
      <ActiveOrderTracker
        orderId={trackedOrderId}
        onDismiss={() => {
          setTrackedOrderId(null);
          setLastOrderId(null);
        }}
        onOpenHistory={() => setIsCartOpen(true)}
      />

      {/* Hero Banner */}
      <HeroBanner onScrollToMenu={scrollToMenu} />

      {/* Category Navigation Bar (Sticky) */}
      <CategoryNav
        selectedCategory={selectedCategory}
        onSelectCategory={(catId) => {
          setSelectedCategory(catId);
          scrollToMenu();
        }}
        categoryCounts={categoryCounts}
      />

      {/* Main Content / Menu Section */}
      <main ref={menuSectionRef} className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full relative z-10">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10 text-right">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
                {searchQuery ? `نتائج البحث عن: "${searchQuery}"` : currentCategoryTitle}
              </h2>
              <span className="bg-red-950/80 border border-red-700/50 text-amber-300 font-black text-xs px-3 py-1 rounded-full shadow-xs">
                {filteredItems.length} وجبة
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-400 mt-1.5">
              اختر وجبتك المفضلة بالحجم المناسب وأضفها للسلة بلمسة واحدة
            </p>
          </div>

          {/* Quick Filters / Search reset */}
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="inline-flex items-center gap-1.5 text-xs text-red-300 hover:text-white bg-red-950/60 hover:bg-red-900/60 border border-red-800/40 px-3.5 py-1.5 rounded-xl font-bold transition-colors w-fit cursor-pointer shadow-sm"
            >
              <X className="w-3.5 h-3.5" />
              <span>إلغاء البحث</span>
            </button>
          )}
        </div>

        {/* Menu Items Grid */}
        {filteredItems.length === 0 ? (
          <div className="bg-[#18181b] rounded-3xl p-12 text-center border border-white/10 max-w-md mx-auto my-8 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-red-950/60 border border-red-800/40 text-[#D31027] mx-auto flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h3 className="font-extrabold text-lg text-white mb-2">
              لم نعثر على أي وجبة مطابقة
            </h3>
            <p className="text-xs sm:text-sm text-gray-400 mb-6">
              جرب البحث بكلمات أخرى أو اختر تصنيفاً مختلفاً من القائمة أعلاه.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="bg-[#D31027] hover:bg-[#b80d21] text-white text-xs sm:text-sm font-bold px-6 py-2.5 rounded-xl cursor-pointer shadow-lg shadow-red-950/50 transition-all"
            >
              عرض جميع الأصناف
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredItems.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onAddToCart={handleAddToCart}
                itemQuantityInCart={getItemQuantityInCart(item.id)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        onProceedToCheckout={handleOpenCheckout}
        onTrackOrder={(orderId) => {
          setTrackedOrderId(orderId);
          setLastOrderId(orderId);
        }}
      />

      {/* Checkout Modal with Firestore Connection */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* Order Success Celebration Modal */}
      <SuccessModal
        isOpen={isSuccessOpen}
        onClose={() => setIsSuccessOpen(false)}
        order={lastPlacedOrder}
      />

      {/* Mobile Floating Cart Indicator */}
      <FloatingCartBar
        totalCount={totalCartCount}
        totalPrice={totalCartPrice}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* Luxury Matte Black Footer */}
      <Footer />
    </div>
  );
}
