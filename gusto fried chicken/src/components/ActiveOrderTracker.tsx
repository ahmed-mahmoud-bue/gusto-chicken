import React, { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import {
  ChefHat,
  Bell,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  Store,
  ChevronDown,
  ChevronUp,
  X,
  Sparkles,
  RefreshCw,
  ShoppingBag,
} from 'lucide-react';
import { db } from '../firebase';
import { OrderRecord } from '../types';
import { formatRelativeTimeArabic, formatOrderExactTime } from '../utils/time';

interface ActiveOrderTrackerProps {
  orderId: string | null;
  onDismiss: () => void;
  onOpenHistory?: () => void;
}

export const ActiveOrderTracker: React.FC<ActiveOrderTrackerProps> = ({
  orderId,
  onDismiss,
  onOpenHistory,
}) => {
  const [order, setOrder] = useState<OrderRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!orderId) {
      setOrder(null);
      return;
    }

    setLoading(true);
    setError(false);

    const orderRef = doc(db, 'orders', orderId);
    const unsubscribe = onSnapshot(
      orderRef,
      (docSnap) => {
        setLoading(false);
        if (docSnap.exists()) {
          const data = docSnap.data() as OrderRecord;
          setOrder({
            ...data,
            id: docSnap.id,
            totalAmount: data.totalAmount ?? (data as any).total ?? 0,
            items: data.items || [],
          });
        } else {
          setError(true);
        }
      },
      (err) => {
        console.warn('Error tracking order status from Firestore:', err);
        setLoading(false);
        setError(true);
      }
    );

    return () => unsubscribe();
  }, [orderId]);

  if (!orderId || (!order && !loading)) {
    return null;
  }

  // Calculate status progress (0 to 3)
  const getStatusStep = (status?: string) => {
    switch (status) {
      case 'new':
        return 0;
      case 'preparing':
        return 1;
      case 'ready':
      case 'delivering':
        return 2;
      case 'completed':
        return 3;
      default:
        return 0;
    }
  };

  const currentStep = getStatusStep(order?.status);

  // Status visual badge & descriptive text
  const getStatusConfig = () => {
    switch (order?.status) {
      case 'new':
        return {
          title: 'تم استلام طلبك',
          subtitle: 'طلبك مسجل في النظام وبانتظار بدء تحضيره في المطبخ',
          badgeClass: 'bg-red-600/30 text-red-300 border-red-500/50',
          dotClass: 'bg-red-500 animate-ping',
          icon: <Clock className="w-5 h-5 text-red-400 animate-pulse" />,
        };
      case 'preparing':
        return {
          title: 'قيد التحضير في المطبخ',
          subtitle: 'الشيف يقوم الآن بقلي وتحضير وجبتك المقرمشة والساخنة',
          badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-amber-950/40',
          dotClass: 'bg-amber-400 animate-pulse',
          icon: <ChefHat className="w-5 h-5 text-amber-400 animate-bounce" />,
        };
      case 'ready':
        return {
          title: order.deliveryMethod === 'pickup' ? 'جاهز للاستلام من الفرع!' : 'جاهز للتسليم / في الطريق إليك!',
          subtitle: order.deliveryMethod === 'pickup'
            ? 'وجبتك جاهزة ومعبأة حرارياً في الفرع بانتظارك'
            : 'خرجت الوجبة من المطبخ وهي مع مندوب التوصيل الآن',
          badgeClass: 'bg-emerald-500/25 text-emerald-300 border-emerald-500/60 shadow-emerald-950/40',
          dotClass: 'bg-emerald-400 animate-ping',
          icon: <Bell className="w-5 h-5 text-emerald-400 animate-pulse" />,
        };
      case 'completed':
        return {
          title: 'تم التسليم بنجاح',
          subtitle: 'بالهناء والشفاء! نتمنى لك تجربة كرانش شهية ولا تقاوم',
          badgeClass: 'bg-emerald-950/80 text-emerald-400 border-emerald-700/60',
          dotClass: 'bg-emerald-400',
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
        };
      case 'cancelled':
        return {
          title: 'تم إلغاء الطلب',
          subtitle: 'تم إلغاء هذا الطلب من قبل إدارة المطعم',
          badgeClass: 'bg-red-950/80 text-red-400 border-red-800',
          dotClass: 'bg-red-500',
          icon: <AlertCircle className="w-5 h-5 text-red-400" />,
        };
      default:
        return {
          title: 'جاري فحص حالة الطلب...',
          subtitle: 'يتم الاتصال اللحظي بقاعدة بيانات المطبخ',
          badgeClass: 'bg-gray-800 text-gray-300 border-gray-700',
          dotClass: 'bg-gray-400',
          icon: <RefreshCw className="w-5 h-5 text-gray-400 animate-spin" />,
        };
    }
  };

  const statusConfig = getStatusConfig();
  const timeInfo = order ? formatRelativeTimeArabic(order.createdAt) : null;
  const exactTime = order ? formatOrderExactTime(order.createdAt) : '';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2 w-full text-right font-['Cairo',sans-serif]">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#18181d] via-[#1c1c22] to-[#18181d] border border-red-900/40 shadow-2xl backdrop-blur-xl">
        {/* Ambient Top Glow Line */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-red-600 via-amber-500 to-red-600" />

        {/* Tracker Header */}
        <div className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-black/50 border border-white/10 flex items-center justify-center shadow-inner">
              {statusConfig.icon}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono font-black text-amber-400 bg-amber-950/50 border border-amber-800/40 px-2.5 py-0.5 rounded-lg">
                  #{orderId.slice(-6)}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border ${statusConfig.badgeClass}`}
                >
                  <span className={`w-2 h-2 rounded-full ${statusConfig.dotClass}`} />
                  {statusConfig.title}
                </span>
                {timeInfo && (
                  <span className="text-[11px] text-gray-400 hidden sm:inline">
                    (أُرسل {timeInfo.text} - {exactTime})
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-gray-300 mt-1 font-medium">
                {statusConfig.subtitle}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1 text-xs font-bold bg-[#26262d] hover:bg-[#32323a] text-gray-200 px-3 py-2 rounded-xl border border-white/10 transition-colors cursor-pointer"
            >
              <span>{isExpanded ? 'إخفاء التفاصيل' : 'تفاصيل الطلب'}</span>
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {onOpenHistory && (
              <button
                type="button"
                onClick={onOpenHistory}
                className="hidden sm:flex items-center gap-1 text-xs font-bold bg-white/5 hover:bg-white/10 text-gray-300 px-3 py-2 rounded-xl border border-white/5 transition-colors cursor-pointer"
                title="عرض سجل جميع الطلبات"
              >
                <ShoppingBag className="w-4 h-4 text-amber-400" />
                <span>سجل الطلبات</span>
              </button>
            )}

            <button
              type="button"
              onClick={onDismiss}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center text-gray-400 hover:text-white transition-colors cursor-pointer"
              title="إخفاء شريط التتبع"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Visual Progress Steps Bar */}
        {order?.status !== 'cancelled' && (
          <div className="px-4 sm:px-6 pb-4">
            <div className="grid grid-cols-4 gap-2 pt-2 border-t border-white/5">
              {[
                { title: 'تم الاستلام', step: 0 },
                { title: 'قيد التحضير', step: 1 },
                { title: 'جاهز للتسليم', step: 2 },
                { title: 'تم التسليم', step: 3 },
              ].map((s) => {
                const isPassed = currentStep >= s.step;
                const isCurrent = currentStep === s.step;

                return (
                  <div key={s.step} className="flex flex-col items-center text-center">
                    <div
                      className={`h-2 w-full rounded-full transition-all duration-500 mb-1.5 ${
                        isCurrent
                          ? 'bg-gradient-to-r from-amber-500 to-[#D31027] shadow-sm shadow-red-500'
                          : isPassed
                          ? 'bg-[#D31027]'
                          : 'bg-white/10'
                      }`}
                    />
                    <span
                      className={`text-[11px] font-bold ${
                        isCurrent
                          ? 'text-amber-300 font-extrabold'
                          : isPassed
                          ? 'text-gray-200'
                          : 'text-gray-500'
                      }`}
                    >
                      {s.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Collapsible Order Details */}
        {isExpanded && order && (
          <div className="p-4 sm:p-5 border-t border-white/10 bg-[#121215]/90 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-gray-300">
              <div className="space-y-1.5 bg-[#18181d] p-3 rounded-2xl border border-white/5">
                <div className="font-bold text-white flex items-center gap-1.5 mb-1">
                  {order.deliveryMethod === 'delivery' ? (
                    <Truck className="w-4 h-4 text-blue-400" />
                  ) : (
                    <Store className="w-4 h-4 text-purple-400" />
                  )}
                  <span>بيانات التوصيل والاستلام:</span>
                </div>
                <p>
                  <strong className="text-gray-400">العميل: </strong>
                  {order.customerName} ({order.phone})
                </p>
                {order.address && (
                  <p>
                    <strong className="text-gray-400">العنوان: </strong>
                    {order.address}
                  </p>
                )}
                {order.notes && (
                  <p className="text-amber-300">
                    <strong>ملاحظات: </strong>
                    {order.notes}
                  </p>
                )}
              </div>

              <div className="space-y-1.5 bg-[#18181d] p-3 rounded-2xl border border-white/5">
                <div className="font-bold text-white mb-1">الأصناف المطلوبة ({order.items.length}):</div>
                <div className="space-y-1 max-h-28 overflow-y-auto pr-1">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-gray-300">
                      <span>
                        <strong className="text-amber-400">{item.quantity}×</strong> {item.name}{' '}
                        <span className="text-[10px] text-gray-400">({item.sizeLabel})</span>
                      </span>
                      <span className="text-gray-200 font-bold">
                        {item.subtotal || item.price * item.quantity} ج.م
                      </span>
                    </div>
                  ))}
                </div>
                <div className="pt-2 border-t border-white/5 flex justify-between font-black text-amber-400">
                  <span>الإجمالي:</span>
                  <span>{order.totalAmount} ج.م</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
