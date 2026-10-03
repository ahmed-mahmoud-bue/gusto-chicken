import React from 'react';
import { ShoppingBag, Flame, Clock, Phone, Search } from 'lucide-react';

interface HeaderProps {
  cartCount: number;
  cartTotal: number;
  onOpenCart: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSecretKitchenAccess?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  cartCount,
  cartTotal,
  onOpenCart,
  searchQuery,
  onSearchChange,
  onSecretKitchenAccess,
}) => {
  const [clickCount, setClickCount] = React.useState(0);
  const clickTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleLogoClick = () => {
    setClickCount((prev) => {
      const next = prev + 1;
      if (next >= 3) {
        if (onSecretKitchenAccess) {
          onSecretKitchenAccess();
        } else {
          window.location.hash = '#/kitchen';
        }
        return 0;
      }
      return next;
    });

    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }
    clickTimeoutRef.current = setTimeout(() => {
      setClickCount(0);
    }, 1500);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0c0c0e]/95 backdrop-blur-md text-white shadow-2xl border-b border-white/10">
      {/* Top mini banner */}
      <div className="bg-[#D31027] text-white text-xs font-semibold py-1.5 px-4 text-center flex items-center justify-center gap-2">
        <Flame className="w-3.5 h-3.5 animate-pulse" />
        <span>توصيل ساخن وسريع لجميع المناطق | اتصل على 19820 أو اطلب أونلاين الآن</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex items-center justify-between gap-3">
          {/* Logo & Brand (Secret 3-clicks allows staff access) */}
          <div
            onClick={handleLogoClick}
            className="flex items-center gap-3 cursor-pointer select-none"
            title="GUSTO Fried Chicken"
          >
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-[#D31027] to-[#8E0B19] flex items-center justify-center shadow-lg shadow-red-950/60 border border-red-500/40">
              <Flame className="w-6 h-6 sm:w-7 sm:h-7 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl sm:text-2xl tracking-wider text-white">
                  GUSTO
                </span>
                <span className="text-[11px] sm:text-xs font-bold px-2 py-0.5 rounded-full bg-amber-400 text-black">
                  CRUNCH
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-gray-400 font-medium">
                Fried Chicken & Burgers
              </p>
            </div>
          </div>

          {/* Search bar on desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-6">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="ابحث عن وجبتك المفضلة (زنجر، سماش، استربس...)"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full bg-[#18181b] text-sm text-gray-200 placeholder-gray-500 rounded-full pl-4 pr-10 py-2 border border-white/10 focus:outline-none focus:border-[#D31027] transition-colors"
              />
              <Search className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Right Action: Status & Cart Button */}
          <div className="flex items-center gap-2.5 sm:gap-4">
            <div className="hidden lg:flex items-center gap-2 text-xs text-gray-300 bg-[#18181b] px-3 py-1.5 rounded-full border border-white/10">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="font-semibold text-emerald-400">مفتوح الآن</span>
              <Clock className="w-3.5 h-3.5 text-gray-400 mr-1" />
              <span>30 - 45 دقيقة</span>
            </div>

            {/* Cart Trigger Badge */}
            <button
              onClick={onOpenCart}
              className="relative flex items-center gap-2.5 bg-[#D31027] hover:bg-[#b80d21] text-white px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full shadow-lg shadow-red-950/60 hover:shadow-red-600/40 transition-all duration-200 active:scale-95 group cursor-pointer"
              aria-label="سلة المشتريات"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-amber-400 text-black font-black text-xs min-w-[20px] h-[20px] rounded-full flex items-center justify-center px-1 shadow">
                    {cartCount}
                  </span>
                )}
              </div>
              <div className="flex flex-col text-right leading-tight">
                <span className="text-[11px] sm:text-xs text-red-100 font-medium">السلة</span>
                <span className="text-xs sm:text-sm font-black text-white">
                  {cartTotal} <span className="text-[10px] font-semibold text-amber-300">ج.م</span>
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Search input */}
        <div className="mt-2.5 md:hidden">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="ابحث عن وجبتك المفضلة..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-[#18181b] text-xs text-gray-200 placeholder-gray-500 rounded-full pl-3 pr-9 py-2 border border-white/10 focus:outline-none focus:border-[#D31027]"
            />
            <Search className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>
      </div>
    </header>
  );
};
