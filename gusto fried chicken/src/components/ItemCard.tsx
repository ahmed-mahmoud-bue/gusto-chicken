import React, { useState } from 'react';
import { Plus, Check, Flame } from 'lucide-react';
import { MenuItem, SizeOption } from '../types';

interface ItemCardProps {
  item: MenuItem;
  onAddToCart: (item: MenuItem, selectedSize: SizeOption) => void;
  itemQuantityInCart: number;
}

export const ItemCard: React.FC<ItemCardProps> = ({
  item,
  onAddToCart,
  itemQuantityInCart,
}) => {
  const [selectedSizeIndex, setSelectedSizeIndex] = useState<number>(
    item.defaultSizeIndex ?? 0
  );
  const [justAdded, setJustAdded] = useState(false);

  const selectedSize = item.sizes[selectedSizeIndex] || item.sizes[0];

  const handleAdd = () => {
    onAddToCart(item, selectedSize);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 900);
  };

  return (
    <div className="group bg-[#18181b] rounded-2xl border border-white/10 shadow-xl shadow-black/60 hover:border-red-600/50 hover:shadow-2xl hover:shadow-red-950/40 transition-all duration-300 flex flex-col overflow-hidden relative">
      {/* Top Image Container */}
      <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-[#121214]">
        <img
          src={item.image}
          alt={item.arabicName}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {/* Subtle image dark gradient bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#18181b] via-transparent to-black/20 pointer-events-none" />

        {/* Badges Overlay */}
        <div className="absolute top-2.5 right-2.5 flex flex-col gap-1 items-end z-10">
          {item.badge && (
            <span
              className={`text-[11px] font-black px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1 ${
                item.badge === 'الأكثر مبيعاً'
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-black shadow-amber-950/40'
                  : item.badge === 'توفير'
                  ? 'bg-emerald-600 text-white shadow-emerald-950/40'
                  : 'bg-[#D31027] text-white shadow-red-950/40'
              }`}
            >
              {item.badge === 'الأكثر مبيعاً' && <span>⭐</span>}
              {item.badge}
            </span>
          )}

          {item.isSpicy && (
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-950/90 border border-red-500/40 text-amber-300 shadow-md flex items-center gap-1">
              <Flame className="w-3 h-3 fill-amber-300 text-amber-300" />
              <span>سبايسي</span>
            </span>
          )}
        </div>

        {/* Cart Count Badge if already in cart */}
        {itemQuantityInCart > 0 && (
          <div className="absolute bottom-2.5 right-2.5 bg-black/85 backdrop-blur text-amber-300 font-black text-xs px-2.5 py-1 rounded-lg border border-amber-400/40 flex items-center gap-1 shadow-lg">
            <span>في السلة:</span>
            <span className="text-white font-extrabold">{itemQuantityInCart}</span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between text-right">
        <div>
          {/* Title & English Subtitle */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-extrabold text-white text-base sm:text-lg group-hover:text-red-400 transition-colors leading-snug">
              {item.arabicName}
            </h3>
          </div>

          <p className="text-[11px] text-gray-400 font-medium -mt-0.5 mb-2.5 font-['Montserrat',sans-serif]">
            {item.name}
          </p>

          {/* Description & Ingredients */}
          <p className="text-xs text-gray-300 leading-relaxed line-clamp-3 mb-3.5">
            {item.description}
          </p>
        </div>

        <div>
          {/* Size Options Selector (if more than 1 size) */}
          {item.sizes.length > 1 ? (
            <div className="mb-3">
              <div className="text-[11px] font-semibold text-gray-400 mb-1.5 flex items-center justify-between">
                <span>اختر الحجم:</span>
                <span className="text-[10px] text-amber-400 font-bold">
                  {selectedSize.label}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 bg-[#121214] p-1 rounded-xl border border-white/10">
                {item.sizes.map((size, idx) => {
                  const isSelected = selectedSizeIndex === idx;
                  return (
                    <button
                      key={size.label}
                      type="button"
                      onClick={() => setSelectedSizeIndex(idx)}
                      className={`text-xs py-1.5 px-2 rounded-lg font-bold transition-all cursor-pointer text-center ${
                        isSelected
                          ? 'bg-gradient-to-r from-[#D31027] to-[#a30b1c] text-white shadow-md border border-red-500/40 scale-[1.02]'
                          : 'bg-[#1f1f24] text-gray-300 hover:bg-[#28282f] hover:text-white border border-white/5'
                      }`}
                    >
                      <div className="truncate">{size.label}</div>
                      <div
                        className={`text-[10px] font-extrabold mt-0.5 ${
                          isSelected ? 'text-amber-300' : 'text-amber-400/90'
                        }`}
                      >
                        {size.price} ج.م
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="mb-2 text-[11px] text-gray-400 font-medium">
              حجم قياسي مميز
            </div>
          )}

          {/* Price & Add to Cart action bar */}
          <div className="flex items-center justify-between pt-3 border-t border-white/10 mt-2">
            <div className="flex flex-col text-right">
              <span className="text-[10px] text-gray-400 font-semibold">السعر</span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl sm:text-2xl font-black text-amber-400 tracking-tight">
                  {selectedSize.price}
                </span>
                <span className="text-xs font-bold text-gray-300">جنيه</span>
              </div>
            </div>

            <button
              onClick={handleAdd}
              type="button"
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm shadow-md transition-all duration-200 cursor-pointer active:scale-95 ${
                justAdded
                  ? 'bg-emerald-600 text-white shadow-emerald-900/50'
                  : 'bg-[#D31027] hover:bg-[#b80d21] text-white shadow-red-950/60 hover:shadow-red-600/40'
              }`}
              aria-label={`إضافة ${item.arabicName} إلى السلة`}
            >
              {justAdded ? (
                <>
                  <Check className="w-4 h-4 text-white stroke-[3]" />
                  <span>تمت الإضافة!</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>أضف للسلة</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
