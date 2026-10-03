import React from 'react';
import {
  CheckCircle,
  MessageCircle,
  Clock,
  MapPin,
  Phone,
  Flame,
  X,
  Share2,
  Copy,
  Check,
} from 'lucide-react';
import { OrderRecord } from '../types';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrderRecord | null;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  onClose,
  order,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !order) return null;

  // Short order code for easy display
  const shortOrderCode = order.id ? `GST-${order.id.slice(-6).toUpperCase()}` : 'GST-ORDER';

  // Format WhatsApp message
  const handleSendWhatsApp = () => {
    const itemsList = order.items
      .map(
        (it) =>
          `• ${it.name} (${it.sizeLabel}) × ${it.quantity} = ${it.price * it.quantity} ج.م`
      )
      .join('\n');

    const messageText = `🍗 *طلب جديد من مطعم GUSTO Fried Chicken* 🍗\n\n` +
      `*رقم الأوردر:* ${shortOrderCode}\n` +
      `*الاسم:* ${order.customerName}\n` +
      `*رقم الهاتف:* ${order.phone}\n` +
      `*طريقة الاستلام:* ${order.deliveryMethod === 'delivery' ? 'توصيل دليفري' : 'استلام من الفرع'}\n` +
      `*العنوان/الفرع:* ${order.address || 'استلام فرع'}\n` +
      `*طريقة الدفع:* ${order.paymentMethod === 'cash' ? 'كاش عند الاستلام' : 'فيزا / بطاقة'}\n` +
      (order.notes ? `*ملاحظات:* ${order.notes}\n` : '') +
      `\n*الأصناف المطلوبة:*\n${itemsList}\n\n` +
      `*الإجمالي الكلي:* ${order.totalAmount} ج.م\n\n` +
      `شكراً لاختياركم جوستو فرايد تشيكن! 🔥`;

    const encoded = encodeURIComponent(messageText);
    // Egyptian restaurant whatsapp hotline number
    const whatsappUrl = `https://wa.me/201100000000?text=${encoded}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleCopyOrderId = () => {
    if (order.id) {
      navigator.clipboard.writeText(order.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto text-right">
      <div className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity" />

      <div className="flex min-h-full items-center justify-center p-3 sm:p-4 relative">
        <div className="relative w-full max-w-lg bg-[#151518] text-white rounded-3xl shadow-2xl overflow-hidden border border-white/10 animate-in fade-in zoom-in-95 duration-200">
          {/* Top celebration banner */}
          <div className="bg-gradient-to-br from-[#121212] via-[#221013] to-[#D31027] text-white p-6 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl" />

            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 mx-auto flex items-center justify-center mb-3 shadow-lg shadow-emerald-950/40">
              <CheckCircle className="w-9 h-9 stroke-[2.5]" />
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white mb-1">
              تم استلام طلبك بنجاح! 🔥
            </h2>
            <p className="text-xs sm:text-sm text-gray-300">
              جاري تجهيز طلبك بأعلى جودة وقرمشة في مطبخ GUSTO
            </p>

            <div className="mt-4 inline-flex items-center gap-2 bg-black/60 backdrop-blur border border-amber-400/40 px-4 py-1.5 rounded-full">
              <span className="text-xs text-gray-400">رقم الأوردر:</span>
              <span className="text-sm font-black text-amber-300 tracking-wider">
                {shortOrderCode}
              </span>
              <button
                onClick={handleCopyOrderId}
                className="text-gray-400 hover:text-white transition-colors cursor-pointer p-0.5"
                title="نسخ رقم الأوردر"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Modal Content */}
          <div className="p-5 sm:p-6 space-y-4 max-h-[65vh] overflow-y-auto">
            {/* Status & ETA */}
            <div className="grid grid-cols-2 gap-2 bg-amber-950/30 border border-amber-500/30 rounded-2xl p-3">
              <div className="flex items-center gap-2 text-xs">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <div className="text-gray-400 text-[10px]">الوقت المتوقع:</div>
                  <div className="font-extrabold text-amber-300">30 - 45 دقيقة</div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <Flame className="w-4 h-4 text-red-500 shrink-0" />
                <div>
                  <div className="text-gray-400 text-[10px]">حالة الطلب:</div>
                  <div className="font-extrabold text-red-400">طلب جديد (مؤكد)</div>
                </div>
              </div>
            </div>

            {/* Customer Details Summary */}
            <div className="bg-[#0e0e11] rounded-2xl p-3.5 text-xs text-gray-300 space-y-1.5 border border-white/10">
              <div className="flex justify-between font-semibold">
                <span className="text-gray-400">العميل:</span>
                <span className="text-white font-bold">{order.customerName}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span className="text-gray-400">رقم الهاتف:</span>
                <span className="text-white font-bold" dir="ltr">{order.phone}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span className="text-gray-400">طريقة الاستلام:</span>
                <span className="text-white font-bold">
                  {order.deliveryMethod === 'delivery' ? 'توصيل دليفري' : 'استلام من الفرع'}
                </span>
              </div>
              {order.address && (
                <div className="text-gray-400 pt-1.5 border-t border-white/10 flex items-start gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#D31027] shrink-0 mt-0.5" />
                  <span className="line-clamp-2 text-gray-300">{order.address}</span>
                </div>
              )}
            </div>

            {/* Ordered Items breakdown */}
            <div>
              <h4 className="text-xs font-black text-white mb-2">
                تفاصيل الأصناف ({order.items.length}):
              </h4>
              <div className="divide-y divide-white/5 border border-white/10 rounded-2xl p-2.5 bg-[#18181b] space-y-1">
                {order.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs py-1.5">
                    <div>
                      <span className="font-bold text-white">{it.name}</span>
                      <span className="text-gray-400 text-[11px] mr-1.5 font-medium">
                        ({it.sizeLabel})
                      </span>
                      <span className="text-gray-500 text-[11px] mr-1">
                        × {it.quantity}
                      </span>
                    </div>
                    <span className="font-black text-amber-400">
                      {it.subtotal} ج.م
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-between items-center bg-[#08080a] text-white rounded-2xl p-3.5 border border-white/10">
              <span className="font-bold text-sm text-gray-300">المبلغ الإجمالي المستحق:</span>
              <span className="text-xl font-black text-amber-400">
                {order.totalAmount} ج.م
              </span>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-2">
              {/* WhatsApp Share Button */}
              <button
                onClick={handleSendWhatsApp}
                className="w-full bg-[#25D366] hover:bg-[#20ba59] text-white font-extrabold py-3.5 px-4 rounded-xl shadow-lg shadow-emerald-950/40 transition-all flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer active:scale-98"
              >
                <MessageCircle className="w-5 h-5 fill-white text-[#25D366]" />
                <span>إرسال الأوردر عبر الواتساب</span>
              </button>

              <button
                onClick={onClose}
                className="w-full bg-[#222228] hover:bg-[#2a2a32] text-gray-300 hover:text-white font-bold py-3 rounded-xl transition-all text-xs sm:text-sm cursor-pointer border border-white/5"
              >
                طلب وجبة جديدة / العودة للرئيسية
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
