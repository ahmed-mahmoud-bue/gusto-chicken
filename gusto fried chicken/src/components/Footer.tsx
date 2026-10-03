import React from 'react';
import { Flame, Phone, Clock, ShieldCheck, Heart, ChefHat } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="relative bg-[#0c0c0e] text-white border-t border-white/10 pt-12 pb-8 px-4 sm:px-6 lg:px-8 text-right overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-red-950/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10 items-start">
          {/* Brand Info */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#D31027] to-[#8E0B19] flex items-center justify-center shadow-lg border border-red-500/30">
                <Flame className="w-6 h-6 text-amber-300" />
              </div>
              <div>
                <span className="font-extrabold text-xl tracking-wider text-white">
                  GUSTO
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400 text-black mr-2">
                  Fried Chicken & Burgers
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed mb-4">
              مطعم جوستو فرايد تشيكن & برجر يقدم لكم التجربة الأكثر قرمشة ولذة، باستخدام دجاج طازج يومياً وخلطات توابل سرية لا تُقاوم.
            </p>

            <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-400/10 px-3.5 py-1.5 rounded-xl border border-amber-400/20 w-fit">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>دواجن ولحوم طازجة 100% متبلة بأشهى بهارات القرمشة</span>
            </div>
          </div>

          {/* Working hours & Hotline */}
          <div>
            <h4 className="font-extrabold text-sm sm:text-base text-white mb-4 border-r-4 border-[#D31027] pr-2">
              مواعيد العمل والطلبات
            </h4>
            <div className="space-y-3 text-xs text-gray-400">
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-gray-200">يومياً من 11:00 صباحاً</p>
                  <p>وحتى 02:00 بعد منتصف الليل</p>
                </div>
              </div>

              <div className="bg-[#18181b] p-3.5 rounded-2xl border border-white/10 shadow-md">
                <div className="text-[11px] text-gray-400 mb-1">الخط الساخن لخدمة العملاء:</div>
                <div className="flex items-center gap-2 text-amber-300 font-black text-lg">
                  <Phone className="w-4 h-4 text-[#D31027]" />
                  <span dir="ltr">19820</span>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Promise */}
          <div>
            <h4 className="font-extrabold text-sm sm:text-base text-white mb-4 border-r-4 border-[#D31027] pr-2">
              ضمان الجودة والكرانش
            </h4>
            <div className="space-y-3 text-xs text-gray-400">
              <p className="leading-relaxed">
                يصلكم الطلب مغلفاً حرارياً للحفاظ على القرمشة والحرارة القصوى كأنكم تأكلون داخل الصالة.
              </p>
              <div className="p-3 bg-red-950/40 border border-red-900/40 rounded-2xl text-red-200 text-xs">
                <span className="font-bold text-white block mb-0.5">توصيل سريع ومضمون:</span>
                متوسط زمن التوصيل من 30 إلى 45 دقيقة لجميع الأحياء والمناطق.
              </div>
            </div>
          </div>
        </div>

        {/* Centered Designer Signature Bar */}
        <div className="border-t border-white/10 pt-8 pb-4 text-center">
          <p className="text-gray-400 text-sm sm:text-base font-medium tracking-widest">
            made by ahmed mahmoud
          </p>
        </div>

        {/* Bottom copyright */}
        <div className="border-t border-white/5 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} GUSTO Fried Chicken. جميع الحقوق محفوظة.</p>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => {
                window.history.pushState(null, '', '/kitchen');
                window.dispatchEvent(new PopStateEvent('popstate'));
              }}
              className="inline-flex items-center gap-1.5 text-[11px] text-gray-400 hover:text-amber-400 transition-colors cursor-pointer bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-lg border border-white/5 shadow-xs"
              title="الدخول إلى شاشة تحضير الطلبات بالمطبخ"
            >
              <ChefHat className="w-3.5 h-3.5 text-amber-400" />
              <span>(شاشة المطبخ)</span>
            </button>
            <p className="flex items-center gap-1">
              <span>صُنع بشغف لعشاق الكرانش والبرجر</span>
              <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 inline" />
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
