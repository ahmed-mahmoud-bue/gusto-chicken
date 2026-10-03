import React from 'react';
import { Flame, Sparkles, ShieldCheck, Truck, Clock } from 'lucide-react';

interface HeroBannerProps {
  onScrollToMenu: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onScrollToMenu }) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-[#121212] via-[#160d10] to-[#0c0c0e] pt-6 pb-10 px-4 sm:px-6 lg:px-8">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-10 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-7 text-right">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-red-950/80 to-red-900/60 border border-red-500/40 text-red-300 text-xs sm:text-sm font-bold px-3.5 py-1.5 rounded-full mb-4">
              <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>أقوى كرانش وألذ صوصات في مصر 🔥</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-4">
              طعم الكرانش الأصلي <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D31027] via-red-500 to-amber-400">
                GUSTO Fried Chicken
              </span>
            </h1>

            <p className="text-gray-300 text-sm sm:text-base leading-relaxed max-w-xl mb-6">
              استمتع بأشهى قطع الفرايد تشيكن الذهبية المقرمشة، وسندوتشات السماش برجر باللحم البقري الطازج والخلطة السرية، وصوص الشيدر الذائب الساخن.
            </p>

            <div className="flex flex-wrap items-center gap-3 mb-8">
              <button
                onClick={onScrollToMenu}
                className="bg-[#D31027] hover:bg-[#b80d21] text-white font-extrabold px-6 py-3.5 rounded-xl shadow-lg shadow-red-900/40 hover:shadow-red-600/40 transition-all cursor-pointer flex items-center gap-2 text-sm sm:text-base active:scale-95"
              >
                <span>تصفح المنيو واطلب الآن</span>
                <Sparkles className="w-4 h-4 text-amber-300" />
              </button>

              <div className="flex items-center gap-2 bg-[#222222]/80 backdrop-blur border border-gray-800 text-gray-300 px-4 py-3 rounded-xl text-xs sm:text-sm">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>متوسط وقت التوصيل 35 دقيقة</span>
              </div>
            </div>

            {/* Badges strip */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-lg border-t border-gray-800/80 pt-5">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-semibold">دجاج طازج 100%</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-300">
                <Truck className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="font-semibold">توصيل ساخن وسريع</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-300">
                <Flame className="w-4 h-4 text-red-500 shrink-0" />
                <span className="font-semibold">صوصات جوستو السرية</span>
              </div>
            </div>
          </div>

          {/* Right Image Feature Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md">
              <div className="absolute -inset-1.5 bg-gradient-to-r from-red-600 to-amber-500 rounded-3xl blur opacity-30"></div>
              <div className="relative bg-[#1c1c1c] border border-gray-800 rounded-3xl overflow-hidden shadow-2xl p-4">
                <div className="relative h-64 sm:h-72 rounded-2xl overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=800&q=80"
                    alt="GUSTO Crispy Fried Chicken"
                    className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-500"
                    loading="eager"
                  />
                  <div className="absolute top-3 right-3 bg-red-600 text-white font-extrabold text-xs px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-amber-300" />
                    <span>كرانشي حقيقي</span>
                  </div>
                  <div className="absolute bottom-3 left-3 bg-black/75 backdrop-blur-md text-amber-300 font-black text-sm px-3 py-1.5 rounded-xl border border-amber-400/30">
                    تبدأ الوجبات من 85 ج.م
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between px-2 text-right">
                  <div>
                    <h3 className="font-extrabold text-white text-base">وجبات الكرانش الذهبية</h3>
                    <p className="text-xs text-gray-400">متبلة بـ 11 بهار سري وتقدم ساخنة ومقرمشة</p>
                  </div>
                  <span className="text-amber-400 text-xs font-bold bg-amber-400/10 border border-amber-400/20 px-2.5 py-1 rounded-lg">
                    ⭐️ 4.9 (2,400+ تقييم)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
