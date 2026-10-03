import React from 'react';
import { ShoppingBag, ArrowLeft } from 'lucide-react';

interface FloatingCartBarProps {
  totalCount: number;
  totalPrice: number;
  onOpenCart: () => void;
}

export const FloatingCartBar: React.FC<FloatingCartBarProps> = ({
  totalCount,
  totalPrice,
  onOpenCart,
}) => {
  if (totalCount === 0) return null;

  return (
    <div className="fixed bottom-4 inset-x-4 z-40 sm:hidden">
      <button
        onClick={onOpenCart}
        className="w-full bg-[#D31027] hover:bg-[#b80d21] text-white p-3.5 rounded-2xl shadow-2xl shadow-red-950/80 border border-red-500/40 flex items-center justify-between cursor-pointer active:scale-98 transition-transform"
      >
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
            <ShoppingBag className="w-5 h-5 text-white" />
            <span className="absolute -top-1.5 -right-1.5 bg-amber-400 text-black font-black text-[11px] min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1">
              {totalCount}
            </span>
          </div>
          <div className="text-right">
            <div className="text-xs text-red-100 font-medium">سلة الطلبات</div>
            <div className="text-sm font-black">
              {totalPrice} <span className="text-xs font-bold text-amber-300">ج.م</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-xl">
          <span>عرض السلة</span>
          <ArrowLeft className="w-3.5 h-3.5" />
        </div>
      </button>
    </div>
  );
};
