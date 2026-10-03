import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  ArrowLeft,
  Sparkles,
  Flame,
  History,
  Clock,
  Truck,
  Store,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Radio,
} from 'lucide-react';
import { CartItem, OrderRecord } from '../types';
import { getLocalOrderHistory, ORDER_HISTORY_STORAGE_KEY } from '../utils/orderHistory';
import { formatRelativeTimeArabic, formatOrderExactTime } from '../utils/time';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (cartItemId: string, delta: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onClearCart: () => void;
  onProceedToCheckout: () => void;
  onTrackOrder?: (orderId: string) => void;
  onReorder?: (items: any[]) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onProceedToCheckout,
  onTrackOrder,
  onReorder,
}) => {
  const [activeTab, setActiveTab] = useState<'cart' | 'history'>('cart');
  const [orderHistory, setOrderHistory] = useState<OrderRecord[]>([]);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // Refresh history whenever drawer opens
  useEffect(() => {
    if (isOpen) {
      setOrderHistory(getLocalOrderHistory());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const subtotal = items.reduce((acc, it) => acc + it.price * it.quantity, 0);
  const totalCount = items.reduce((acc, it) => acc + it.quantity, 0);
  const deliveryFee = items.length > 0 ? 20 : 0; // Standard 20 EGP delivery fee
  const grandTotal = subtotal + deliveryFee;

  const handleClearHistory = () => {
    if (window.confirm('هل تريد مسح سجل الطلبات المخزنة على هذا الجهاز؟')) {
      try {
        localStorage.removeItem(ORDER_HISTORY_STORAGE_KEY);
        setOrderHistory([]);
      } catch {}
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'new':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-red-950 text-red-300 border border-red-800 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            تم الاستلام
          </span>
        );
      case 'preparing':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-amber-950 text-amber-300 border border-amber-800 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            قيد التحضير
          </span>
        );
      case 'ready':
      case 'delivering':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-700 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            جاهز للتسليم
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-gray-800 text-gray-300 border border-gray-700 px-2 py-0.5 rounded-full">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            مكتمل
          </span>
        );
      default:
        return (
          <span className="text-[11px] font-bold text-gray-400">
            {status || 'طلب سابق'}
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden text-right font-['Cairo',sans-serif]">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300"
      />

      {/* Drawer Container (Sliding in from Right in RTL) */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-md bg-[#151518] text-white shadow-2xl flex flex-col justify-between border-l border-white/10">
          {/* Header */}
          <div className="bg-[#0e0e11] text-white p-4 sm:p-5 flex items-center justify-between border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#D31027] flex items-center justify-center shadow-md shadow-red-950/50">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-black text-lg text-white">سلة ومشتريات GUSTO</h2>
                <p className="text-xs text-gray-400">
                  {activeTab === 'cart'
                    ? `${totalCount} ${totalCount === 1 ? 'عنصر' : 'عناصر'} في السلة`
                    : `${orderHistory.length} طلبات سابقة على هذا الجهاز`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {activeTab === 'cart' && items.length > 0 && (
                <button
                  onClick={onClearCart}
                  className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded hover:bg-white/5 transition-colors cursor-pointer"
                  title="تفريغ السلة"
                >
                  مسح الكل
                </button>
              )}
              {activeTab === 'history' && orderHistory.length > 0 && (
                <button
                  onClick={handleClearHistory}
                  className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded hover:bg-white/5 transition-colors cursor-pointer"
                  title="مسح سجل الطلبات"
                >
                  مسح السجل
                </button>
              )}
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-300 hover:text-white transition-colors cursor-pointer"
                aria-label="إغلاق السلة"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs (Cart vs History) */}
          <div className="flex border-b border-white/10 bg-[#121215] px-4">
            <button
              type="button"
              onClick={() => setActiveTab('cart')}
              className={`flex-1 py-3 text-xs sm:text-sm font-black flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
                activeTab === 'cart'
                  ? 'border-[#D31027] text-white shadow-xs'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>السلة الحالية ({totalCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-3 text-xs sm:text-sm font-black flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
                activeTab === 'history'
                  ? 'border-[#D31027] text-white shadow-xs'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              <History className="w-4 h-4 text-amber-400" />
              <span>سجل طلباتي ({orderHistory.length})</span>
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5">
            {/* CART TAB */}
            {activeTab === 'cart' && (
              <>
                {items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-16 px-4">
                    <div className="w-20 h-20 rounded-full bg-red-950/60 border border-red-800/40 flex items-center justify-center mb-4 text-[#D31027] shadow-lg">
                      <ShoppingBag className="w-10 h-10 stroke-[1.5]" />
                    </div>
                    <h3 className="font-extrabold text-white text-lg mb-2">
                      سلة المشتريات فارغة
                    </h3>
                    <p className="text-gray-400 text-xs sm:text-sm max-w-xs mb-6 leading-relaxed">
                      لم تقم بإضافة أي وجبة حتى الآن. تصفح منيو GUSTO واطلب أقوى كرانش!
                    </p>
                    <button
                      onClick={onClose}
                      className="bg-[#D31027] hover:bg-[#b80d21] text-white text-xs sm:text-sm font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-red-950/60 cursor-pointer transition-all active:scale-95"
                    >
                      تصفح المنيو الآن
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4 divide-y divide-white/5">
                    {items.map((item) => (
                      <div
                        key={item.cartItemId}
                        className="flex gap-3 py-3 items-center justify-between"
                      >
                        {/* Item Image */}
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 rounded-xl object-cover border border-white/10 shrink-0"
                        />

                        {/* Details */}
                        <div className="flex-1 min-w-0 px-2 text-right">
                          <h4 className="font-extrabold text-sm text-white truncate">
                            {item.name}
                          </h4>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[11px] font-bold text-red-300 bg-red-950/80 border border-red-800/40 px-2 py-0.5 rounded">
                              {item.sizeLabel}
                            </span>
                            <span className="text-xs text-gray-400 font-semibold">
                              {item.price} ج.م
                            </span>
                          </div>
                          <div className="text-xs font-black text-amber-400 mt-1">
                            الإجمالي: {item.price * item.quantity} ج.م
                          </div>
                        </div>

                        {/* Quantity Controls & Remove */}
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <div className="flex items-center border border-white/10 rounded-lg bg-[#1f1f23] overflow-hidden shadow-xs">
                            <button
                              onClick={() => onUpdateQuantity(item.cartItemId, 1)}
                              className="w-7 h-7 flex items-center justify-center text-gray-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                              aria-label="زيادة الكمية"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-7 text-center text-xs font-black text-white">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => onUpdateQuantity(item.cartItemId, -1)}
                              className="w-7 h-7 flex items-center justify-center text-gray-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                              aria-label="تقليل الكمية"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <button
                            onClick={() => onRemoveItem(item.cartItemId)}
                            className="text-gray-400 hover:text-red-400 transition-colors p-1 cursor-pointer"
                            title="حذف من السلة"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* ORDER HISTORY TAB */}
            {activeTab === 'history' && (
              <>
                {orderHistory.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-16 px-4">
                    <div className="w-16 h-16 rounded-full bg-[#202026] border border-white/10 flex items-center justify-center mb-4 text-amber-400 shadow-inner">
                      <History className="w-8 h-8" />
                    </div>
                    <h3 className="font-extrabold text-white text-base mb-1">
                      لا توجد طلبات سابقة مسجلة
                    </h3>
                    <p className="text-gray-400 text-xs max-w-xs mb-4 leading-relaxed">
                      عند إتمام أي طلب على هذا الجهاز، سيتم حفظه تلقائياً هنا في سجل المشتريات للرجوع إليه وتتبع حالته في أي وقت.
                    </p>
                    <button
                      onClick={() => setActiveTab('cart')}
                      className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer"
                    >
                      العودة للسلة
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-gray-400 pb-1">
                      <span>الطلبات السابقة على هذا الجهاز:</span>
                      <span className="text-[11px] text-amber-400">محفوظة محلياً</span>
                    </div>

                    {orderHistory.map((order, idx) => {
                      const isExpanded = expandedOrderId === order.id;
                      const timeInfo = formatRelativeTimeArabic(order.createdAt);
                      const exactTime = formatOrderExactTime(order.createdAt);
                      const orderTotal = order.total ?? order.totalAmount ?? 0;

                      return (
                        <div
                          key={order.id || idx}
                          className="bg-[#1a1a20] rounded-2xl border border-white/10 p-3.5 hover:border-white/20 transition-all shadow-md"
                        >
                          {/* Order Header */}
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-black text-xs text-white bg-black/50 px-2 py-0.5 rounded-lg border border-white/10">
                                #{order.id?.slice(-6) || '---'}
                              </span>
                              {getStatusBadge(order.status)}
                            </div>

                            <span className="text-[11px] text-gray-400">
                              {timeInfo.text} ({exactTime})
                            </span>
                          </div>

                          {/* Fulfillment and total */}
                          <div className="flex items-center justify-between text-xs text-gray-300 py-1 border-t border-white/5">
                            <div className="flex items-center gap-1.5">
                              {order.deliveryMethod === 'delivery' ? (
                                <Truck className="w-3.5 h-3.5 text-blue-400" />
                              ) : (
                                <Store className="w-3.5 h-3.5 text-purple-400" />
                              )}
                              <span>{order.deliveryMethod === 'delivery' ? 'دليفري' : 'استلام فرع'}</span>
                              <span className="text-gray-500">•</span>
                              <span className="text-gray-400">{order.items?.length || 0} أصناف</span>
                            </div>

                            <span className="font-black text-amber-400 text-sm">
                              {orderTotal} ج.م
                            </span>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2 pt-2 mt-1 border-t border-white/5">
                            {/* Track live status */}
                            {order.id && onTrackOrder && (
                              <button
                                type="button"
                                onClick={() => {
                                  onTrackOrder(order.id!);
                                  onClose();
                                }}
                                className="flex-1 bg-gradient-to-r from-red-600 to-[#D31027] hover:from-red-500 hover:to-red-600 text-white font-bold text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow-sm shadow-red-950/50 cursor-pointer active:scale-98 transition-all"
                              >
                                <Radio className="w-3.5 h-3.5 animate-pulse text-amber-300" />
                                <span>تتبع حالة هذا الطلب</span>
                              </button>
                            )}

                            {/* View details toggle */}
                            <button
                              type="button"
                              onClick={() => setExpandedOrderId(isExpanded ? null : (order.id || null))}
                              className="bg-[#24242c] hover:bg-[#30303a] text-gray-300 text-xs px-2.5 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1"
                              title="عرض تفاصيل الأصناف"
                            >
                              <span>{isExpanded ? 'إخفاء' : 'الأصناف'}</span>
                              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>
                          </div>

                          {/* Expanded Items */}
                          {isExpanded && order.items && (
                            <div className="mt-2.5 pt-2 border-t border-white/5 space-y-1.5 text-xs text-gray-300 bg-black/30 p-2.5 rounded-xl">
                              {order.items.map((it, itemIdx) => (
                                <div key={itemIdx} className="flex justify-between items-center">
                                  <span>
                                    <strong className="text-amber-400">{it.quantity}×</strong> {it.name} ({it.sizeLabel})
                                  </span>
                                  <span className="text-gray-400">
                                    {it.subtotal || it.price * it.quantity} ج.م
                                  </span>
                                </div>
                              ))}
                              {order.address && (
                                <div className="text-[11px] text-gray-400 pt-1 border-t border-white/5">
                                  <strong>العنوان: </strong> {order.address}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer Bill & Checkout Action (Visible only on Cart tab) */}
          {activeTab === 'cart' && items.length > 0 && (
            <div className="bg-[#0e0e11] border-t border-white/10 p-4 sm:p-5">
              <div className="space-y-2 mb-4 text-xs sm:text-sm">
                <div className="flex justify-between text-gray-400">
                  <span>المجموع الفرعي:</span>
                  <span className="font-bold text-white">{subtotal} ج.م</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>رسوم التوصيل التقديرية:</span>
                  <span className="font-bold text-white">{deliveryFee} ج.م</span>
                </div>
                <div className="border-t border-white/10 pt-2 flex justify-between items-center text-sm sm:text-base font-black text-white">
                  <span>المبلغ الإجمالي:</span>
                  <span className="text-xl font-black text-amber-400">
                    {grandTotal} ج.م
                  </span>
                </div>
              </div>

              <button
                onClick={onProceedToCheckout}
                className="w-full bg-[#D31027] hover:bg-[#b80d21] text-white py-3.5 px-4 rounded-xl font-extrabold text-sm sm:text-base shadow-lg shadow-red-950/60 hover:shadow-red-600/40 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <span>متابعة إتمام الطلب</span>
                <ArrowLeft className="w-4 h-4" />
              </button>

              <div className="mt-2.5 text-center text-[11px] text-gray-400 flex items-center justify-center gap-1">
                <Flame className="w-3 h-3 text-[#D31027]" />
                <span>يتم تحضير جميع الوجبات طازجة فور تأكيد الأوردر</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
