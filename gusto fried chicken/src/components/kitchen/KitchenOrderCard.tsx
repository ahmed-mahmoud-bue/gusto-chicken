import React, { useState } from 'react';
import {
  Clock,
  User,
  Phone,
  MapPin,
  Store,
  FileText,
  CheckCircle2,
  ChefHat,
  Bell,
  ArrowRight,
  RotateCcw,
  Ban,
  Check,
  CreditCard,
  Banknote,
  AlertTriangle,
} from 'lucide-react';
import { OrderRecord } from '../../types';
import { formatRelativeTimeArabic, formatOrderExactTime } from '../../utils/time';

interface KitchenOrderCardProps {
  order: OrderRecord;
  onUpdateStatus: (orderId: string, newStatus: 'new' | 'preparing' | 'ready' | 'completed' | 'cancelled') => Promise<void>;
  isNewArrival?: boolean;
}

export const KitchenOrderCard: React.FC<KitchenOrderCardProps> = ({
  order,
  onUpdateStatus,
  isNewArrival = false,
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);

  const timeInfo = formatRelativeTimeArabic(order.createdAt);
  const exactTime = formatOrderExactTime(order.createdAt);

  const handleStatusChange = async (newStatus: 'new' | 'preparing' | 'ready' | 'completed' | 'cancelled') => {
    if (!order.id || isUpdating) return;
    try {
      setIsUpdating(true);
      await onUpdateStatus(order.id, newStatus);
    } finally {
      setIsUpdating(false);
      setConfirmCancel(false);
    }
  };

  // Status visual themes
  const getStatusBadge = () => {
    switch (order.status) {
      case 'new':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-red-600/30 border border-red-500 text-red-300 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-red-500 shadow-sm shadow-red-500" />
            جديد - لم يبدأ
          </span>
        );
      case 'preparing':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-500/20 border border-amber-500/50 text-amber-300">
            <ChefHat className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
            قيد التحضير
          </span>
        );
      case 'ready':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 border border-emerald-500/50 text-emerald-300">
            <Bell className="w-3.5 h-3.5 text-emerald-400" />
            جاهز للتسليم
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-gray-800 border border-gray-700 text-gray-400">
            <CheckCircle2 className="w-3.5 h-3.5 text-gray-400" />
            مكتمل
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-red-950/60 border border-red-900 text-red-400">
            <Ban className="w-3.5 h-3.5 text-red-400" />
            ملغي
          </span>
        );
      default:
        return null;
    }
  };

  // Border and glow highlights depending on status and delay
  const getCardBorderClass = () => {
    if (order.status === 'new') {
      return 'border-red-600/70 shadow-lg shadow-red-950/50 ring-1 ring-red-500/40';
    }
    if (order.status === 'preparing') {
      return 'border-amber-500/60 shadow-lg shadow-amber-950/30';
    }
    if (order.status === 'ready') {
      return 'border-emerald-500/60 shadow-lg shadow-emerald-950/30';
    }
    if (order.status === 'cancelled') {
      return 'border-red-900/30 opacity-70';
    }
    return 'border-white/10 opacity-75';
  };

  return (
    <div
      className={`bg-[#151518] rounded-3xl border transition-all flex flex-col justify-between overflow-hidden ${getCardBorderClass()} ${
        isNewArrival ? 'scale-[1.02] ring-2 ring-red-500' : ''
      }`}
    >
      {/* Top Header Section */}
      <div className="p-4 sm:p-5 border-b border-white/10 bg-[#1a1a1e]">
        <div className="flex items-center justify-between gap-2 mb-2">
          {/* Order ID Tag */}
          <div className="flex items-center gap-2">
            <span className="bg-[#26262c] text-white font-mono font-black text-sm sm:text-base px-3 py-1 rounded-xl border border-white/10 shadow-sm">
              #{order.id?.slice(-6) || '---'}
            </span>
            {getStatusBadge()}
          </div>

          {/* Time Elapsed Counter */}
          <div
            className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg ${
              timeInfo.isUrgent
                ? 'bg-red-950 text-red-300 border border-red-800 animate-pulse'
                : timeInfo.isWarning
                ? 'bg-amber-950/80 text-amber-300 border border-amber-800'
                : 'bg-black/40 text-gray-300 border border-white/5'
            }`}
            title={`وقت الطلب الدقيق: ${exactTime}`}
          >
            <Clock className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{timeInfo.text}</span>
            <span className="text-[10px] text-gray-500">({exactTime})</span>
          </div>
        </div>

        {/* Customer & Fulfillment Info */}
        <div className="flex flex-wrap items-center justify-between gap-y-2 text-xs text-gray-300 pt-2 border-t border-white/5">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-white font-bold text-sm">
              <User className="w-3.5 h-3.5 text-amber-400" />
              <span>{order.customerName}</span>
            </div>
            <a
              href={`tel:${order.phone}`}
              className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors bg-black/30 px-2 py-0.5 rounded-md"
              dir="ltr"
            >
              <Phone className="w-3 h-3 text-emerald-400" />
              <span>{order.phone}</span>
            </a>
          </div>

          {/* Delivery or Pickup Badge */}
          <div className="flex items-center gap-2">
            {order.deliveryMethod === 'delivery' ? (
              <span className="inline-flex items-center gap-1 bg-blue-950/60 border border-blue-800/60 text-blue-300 px-2.5 py-0.5 rounded-lg text-xs font-bold">
                <MapPin className="w-3 h-3 text-blue-400" />
                توصيل دليفري
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 bg-purple-950/60 border border-purple-800/60 text-purple-300 px-2.5 py-0.5 rounded-lg text-xs font-bold">
                <Store className="w-3 h-3 text-purple-400" />
                استلام من الفرع
              </span>
            )}

            {order.paymentMethod === 'cash' ? (
              <span className="inline-flex items-center gap-1 text-[11px] text-amber-300 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-900/40">
                <Banknote className="w-3 h-3 text-amber-400" />
                كاش
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-300 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900/40">
                <CreditCard className="w-3 h-3 text-emerald-400" />
                فيزا
              </span>
            )}
          </div>
        </div>

        {/* Address notes if delivery */}
        {order.address && (
          <div className="mt-2.5 bg-black/40 rounded-xl p-2 border border-white/5 text-xs text-gray-300 flex items-start gap-2">
            <MapPin className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
            <span className="line-clamp-2 leading-relaxed">
              <strong className="text-white">العنوان: </strong>
              {order.address}
            </span>
          </div>
        )}

        {/* Customer Special Notes Alert */}
        {order.notes && (
          <div className="mt-2 bg-amber-950/40 border border-amber-600/40 rounded-xl p-2 text-xs text-amber-200 flex items-start gap-2 shadow-inner">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-300">ملاحظات العميل: </span>
              <span className="text-amber-100">{order.notes}</span>
            </div>
          </div>
        )}
      </div>

      {/* Food Items List - Chef Optimized */}
      <div className="p-4 sm:p-5 space-y-3 flex-1 overflow-y-auto max-h-80">
        <div className="flex items-center justify-between text-xs text-gray-400 font-bold border-b border-white/5 pb-1">
          <span>قائمة الأصناف المطلوبة ({order.items.length})</span>
          <span>الحجم / السعر</span>
        </div>

        {order.items.map((item, idx) => (
          <div
            key={idx}
            className="flex items-start justify-between gap-3 bg-[#1e1e24] p-3 rounded-2xl border border-white/5 hover:border-white/15 transition-colors"
          >
            <div className="flex items-start gap-3">
              {/* Large Quantity Badge */}
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#990000] to-[#D31027] text-white flex items-center justify-center font-black text-base shadow-md shadow-red-950/60 flex-shrink-0">
                {item.quantity}×
              </div>
              <div>
                <h4 className="font-extrabold text-sm sm:text-base text-white leading-tight">
                  {item.name}
                </h4>
                <div className="inline-block mt-1 bg-black/50 text-amber-400 border border-amber-500/20 text-xs font-semibold px-2 py-0.5 rounded-lg">
                  {item.sizeLabel}
                </div>
              </div>
            </div>

            <div className="text-left flex-shrink-0">
              <span className="text-xs font-bold text-gray-300">
                {item.subtotal || item.price * item.quantity} ج.م
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Card Footer: Total & Status Advance Buttons */}
      <div className="p-4 sm:p-5 border-t border-white/10 bg-[#1a1a1e] space-y-3">
        {/* Total Summary */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400 font-bold">إجمالي الحساب:</span>
          <span className="text-lg font-black text-amber-400">
            {order.total ?? order.totalAmount} <span className="text-xs font-normal text-gray-300">ج.م</span>
          </span>
        </div>

        {/* Action Buttons depending on current status */}
        <div className="flex items-center gap-2">
          {order.status === 'new' && (
            <button
              type="button"
              disabled={isUpdating}
              onClick={() => handleStatusChange('preparing')}
              className="flex-1 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black font-black text-sm py-3 px-4 rounded-2xl cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-amber-950/50 transition-all active:scale-98 disabled:opacity-50"
            >
              <ChefHat className="w-5 h-5 text-black" />
              <span>{isUpdating ? 'جاري التحديث...' : 'بدء التحضير (Preparing)'}</span>
            </button>
          )}

          {order.status === 'preparing' && (
            <button
              type="button"
              disabled={isUpdating}
              onClick={() => handleStatusChange('ready')}
              className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-black text-sm py-3 px-4 rounded-2xl cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 transition-all active:scale-98 disabled:opacity-50"
            >
              <Bell className="w-5 h-5 text-white" />
              <span>{isUpdating ? 'جاري التحديث...' : 'جاهز للتسليم (Ready)'}</span>
            </button>
          )}

          {order.status === 'ready' && (
            <div className="flex items-center gap-2 w-full">
              <button
                type="button"
                disabled={isUpdating}
                onClick={() => handleStatusChange('completed')}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-black text-sm py-3 px-4 rounded-2xl cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-blue-950/50 transition-all active:scale-98 disabled:opacity-50"
              >
                <Check className="w-5 h-5 text-white" />
                <span>{isUpdating ? 'جاري التحديث...' : 'تم التسليم بنجاح (Complete)'}</span>
              </button>

              <button
                type="button"
                disabled={isUpdating}
                onClick={() => handleStatusChange('preparing')}
                className="p-3 rounded-2xl bg-[#26262c] hover:bg-[#32323a] text-gray-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
                title="إعادة إلى قيد التحضير"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          )}

          {order.status === 'completed' && (
            <div className="w-full flex items-center justify-between bg-black/40 p-2.5 rounded-xl border border-white/5 text-xs text-gray-400">
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                تم تسليم الطلب للعميل بنجاح
              </span>
              <button
                type="button"
                disabled={isUpdating}
                onClick={() => handleStatusChange('ready')}
                className="text-[11px] text-gray-400 hover:text-white underline cursor-pointer"
              >
                تراجع
              </button>
            </div>
          )}

          {order.status === 'cancelled' && (
            <div className="w-full flex items-center justify-between bg-red-950/30 p-2.5 rounded-xl border border-red-900/30 text-xs text-red-300">
              <span className="flex items-center gap-1.5 font-bold">
                <Ban className="w-4 h-4" />
                تم إلغاء هذا الطلب
              </span>
              <button
                type="button"
                disabled={isUpdating}
                onClick={() => handleStatusChange('new')}
                className="text-[11px] text-gray-400 hover:text-white underline cursor-pointer"
              >
                استعادة
              </button>
            </div>
          )}

          {/* Quick Cancel button for active orders */}
          {(order.status === 'new' || order.status === 'preparing') && (
            <div className="relative">
              {confirmCancel ? (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={() => handleStatusChange('cancelled')}
                    className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-2.5 py-3 rounded-2xl transition-all cursor-pointer shadow-md"
                  >
                    تأكيد الإلغاء
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmCancel(false)}
                    className="bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs px-2 py-3 rounded-2xl transition-all cursor-pointer"
                  >
                    تراجع
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmCancel(true)}
                  className="p-3 rounded-2xl bg-[#26262c] hover:bg-red-950/60 hover:text-red-400 text-gray-400 border border-white/10 transition-colors cursor-pointer"
                  title="إلغاء الطلب"
                >
                  <Ban className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
