import React, { useRef } from 'react';
import {
  Flame,
  Sandwich,
  Beef,
  Drumstick,
  Utensils,
  Sparkles,
  Smile,
  Heart,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { CategoryId } from '../types';
import { CATEGORIES } from '../data/menu';

interface CategoryNavProps {
  selectedCategory: CategoryId;
  onSelectCategory: (category: CategoryId) => void;
  categoryCounts: Record<CategoryId, number>;
}

export const CategoryNav: React.FC<CategoryNavProps> = ({
  selectedCategory,
  onSelectCategory,
  categoryCounts,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const getIcon = (iconName: string, isSelected: boolean) => {
    const className = `w-4 h-4 shrink-0 transition-colors ${
      isSelected ? 'text-white' : 'text-gray-500 group-hover:text-red-600'
    }`;
    switch (iconName) {
      case 'Flame':
        return <Flame className={className} />;
      case 'Sandwich':
        return <Sandwich className={className} />;
      case 'Beef':
        return <Beef className={className} />;
      case 'Drumstick':
        return <Drumstick className={className} />;
      case 'Utensils':
        return <Utensils className={className} />;
      case 'Sparkles':
        return <Sparkles className={className} />;
      case 'Smile':
        return <Smile className={className} />;
      case 'Heart':
        return <Heart className={className} />;
      default:
        return <Flame className={className} />;
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 250;
      scrollContainerRef.current.scrollBy({
        left: direction === 'right' ? scrollAmount : -scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="sticky top-[73px] z-30 bg-[#0c0c0e]/95 backdrop-blur-md shadow-lg shadow-black/40 border-b border-white/10 py-3">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Scroll Buttons for desktop */}
        <div className="hidden sm:flex absolute right-1 top-1/2 -translate-y-1/2 z-10">
          <button
            onClick={() => scroll('right')}
            className="w-8 h-8 rounded-full bg-[#18181b] shadow-md border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:border-red-500/40 hover:bg-[#222226] transition-colors cursor-pointer"
            aria-label="تمرير لليمين"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="hidden sm:flex absolute left-1 top-1/2 -translate-y-1/2 z-10">
          <button
            onClick={() => scroll('left')}
            className="w-8 h-8 rounded-full bg-[#18181b] shadow-md border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:border-red-500/40 hover:bg-[#222226] transition-colors cursor-pointer"
            aria-label="تمرير لليسار"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable category list */}
        <div
          ref={scrollContainerRef}
          className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth px-1 sm:px-8 py-0.5"
        >
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            const count = categoryCounts[cat.id] ?? 0;

            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`group flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 cursor-pointer shrink-0 border ${
                  isSelected
                    ? 'bg-gradient-to-r from-[#D31027] to-[#990a1b] text-white border-red-500/50 shadow-md shadow-red-950/60 scale-[1.02]'
                    : 'bg-[#18181b] text-gray-300 border-white/10 hover:border-red-500/40 hover:text-white hover:bg-[#202026]'
                }`}
              >
                {getIcon(cat.iconName, isSelected)}
                <span>{cat.name}</span>
                <span
                  className={`text-[11px] px-1.5 py-0.2 rounded-full font-semibold ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-black/40 text-gray-400 group-hover:text-red-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
