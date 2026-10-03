import React, { useState } from 'react';
import {
  X,
  MapPin,
  Phone,
  User,
  CreditCard,
  Banknote,
  Truck,
  Store,
  FileText,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { CartItem, CustomerDetails, DeliveryMethod, PaymentMethod, OrderRecord } from '../types';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { saveOrderToLocalHistory } from '../utils/orderHistory';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onOrderSuccess: (orderId: string, orderData: any) => void;
}

const BRANCHES = [
  { id: 'branch-1', name: 'فرع المعادي (شارع النصر)' },
  { id: 'branch-2', name: 'فرع مدينة نصر (شارع عباس العقاد)' },
  { id: 'branch-3', name: 'فرع التجمع الخامس (شارع التسعين)' },
  { id: 'branch-4', name: 'فرع المهندسين (شارع جامعة الدول)' },
];

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  onOrderSuccess,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('delivery');
  const [address, setAddress] = useState('');
  const [selectedBranch, setSelectedBranch] = useState(BRANCHES[0].name);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, it) => acc + it.price * it.quantity, 0);
  const deliveryFee = deliveryMethod === 'delivery' ? 20 : 0;
  const grandTotal = subtotal + deliveryFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validation
    const cleanName = customerName.trim();
    if (cleanName.length < 2) {
      setErrorMsg('يرجى إدخال اسم العميل بشكل صحيح (حرفين على الأقل).');
      return;
    }

    const cleanPhone = phone.trim();
    // Egyptian phone pattern validation (01xxxxxxxxx or at least 9-11 digits)
    if (!/^[0-9+]{8,15}$/.test(cleanPhone)) {
      setErrorMsg('يرجى إدخال رقم هاتف صحيح للتواصل (مثال: 01012345678).');
      return;
    }

    const finalAddress =
      deliveryMethod === 'delivery'
        ? address.trim()
        : `استلام من الفرع: ${selectedBranch}`;

    if (deliveryMethod === 'delivery' && finalAddress.length < 5) {
      setErrorMsg('يرجى كتابة عنوان التوصيل بالتفصيل (المنطقة، الشارع، العمارة، الشقة).');
      return;
    }

    if (cartItems.length === 0) {
      setErrorMsg('سلة الطلبات فارغة!');
      return;
    }

    setLoading(true);

    try {
      const itemsPayload = cartItems.map((item) => ({
        menuItemId: item.menuItemId,
        name: item.name,
        sizeLabel: item.sizeLabel,
        price: item.price,
        quantity: item.quantity,
        subtotal: item.price * item.quantity,
      }));

      const orderPayload: any = {
        customerName: cleanName,
        phone: cleanPhone,
        deliveryMethod,
        paymentMethod,
        address: finalAddress || (deliveryMethod === 'pickup' ? 'استلام من الفرع' : ''),
        items: itemsPayload,
        total: grandTotal,
        totalAmount: grandTotal,
        status: 'new',
        createdAt: Date.now(),
      };

      if (notes.trim()) {
        orderPayload.notes = notes.trim();
      }

      const docRef = await addDoc(collection(db, 'orders'), orderPayload);
      console.log('Order sent successfully:', docRef.id);

      const placedRecord: OrderRecord = {
        id: docRef.id,
        ...orderPayload,
      };

      // Save to device local storage history
      saveOrderToLocalHistory(placedRecord);

      // Clean up & trigger success modal with generated order ID
      onOrderSuccess(docRef.id, placedRecord);
    } catch (err: unknown) {
      console.error('Error creating order in Firestore:', err);
      setErrorMsg(
        err instanceof Error
          ? `فشل إرسال الطلب: ${err.message}`
          : 'حدث خطأ أثناء حفظ الطلب في قاعدة البيانات. يرجى المحاولة مرة أخرى.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto text-right">
      {/* Backdrop */}
      <div
        onClick={() => !loading && onClose()}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
      />

      <div className="flex min-h-full items-center justify-center p-3 sm:p-4 relative">
        <div className="relative w-full max-w-lg bg-[#151518] text-white rounded-3xl shadow-2xl overflow-hidden border border-white/10 animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="bg-[#0e0e11] text-white p-5 flex items-center justify-between border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#D31027] flex items-center justify-center text-white shadow-md shadow-red-950/50">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-lg text-white">إتمام الطلب</h3>
                <p className="text-xs text-gray-400">أدخل بياناتك وسيصلك الأوردر ساخن وطازة</p>
              </div>
            </div>

            <button
              onClick={onClose}
              disabled={loading}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-300 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            {errorMsg && (
              <div className="p-3 bg-red-950/80 border border-red-800 text-red-200 text-xs sm:text-sm rounded-xl flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Customer Name */}
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">
                الاسم بالكامل <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="مثال: أحمد محمد علي"
                  className="w-full bg-[#1f1f24] border border-white/10 rounded-xl px-3.5 py-2.5 pl-10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#D31027] focus:bg-[#25252b] transition-all"
                />
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">
                رقم الموبايل <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  dir="ltr"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01xxxxxxxxx"
                  className="w-full bg-[#1f1f24] border border-white/10 rounded-xl px-3.5 py-2.5 pl-10 text-sm text-right text-white placeholder-gray-500 focus:outline-none focus:border-[#D31027] focus:bg-[#25252b] transition-all"
                />
                <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Delivery Method Toggle */}
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5">
                طريقة الاستلام <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDeliveryMethod('delivery')}
                  className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    deliveryMethod === 'delivery'
                      ? 'bg-red-950/70 border-[#D31027] text-red-300 shadow-sm'
                      : 'bg-[#1f1f24] border-white/10 text-gray-400 hover:bg-[#25252b]'
                  }`}
                >
                  <Truck className="w-4 h-4 text-[#D31027]" />
                  <span>توصيل دليفري (+20 ج.م)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDeliveryMethod('pickup')}
                  className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    deliveryMethod === 'pickup'
                      ? 'bg-red-950/70 border-[#D31027] text-red-300 shadow-sm'
                      : 'bg-[#1f1f24] border-white/10 text-gray-400 hover:bg-[#25252b]'
                  }`}
                >
                  <Store className="w-4 h-4 text-amber-400" />
                  <span>استلام من الفرع (مجاناً)</span>
                </button>
              </div>
            </div>

            {/* Address or Branch Selection */}
            {deliveryMethod === 'delivery' ? (
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">
                  عنوان التوصيل بالتفصيل <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <textarea
                    required
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="المنطقة، اسم الشارع، رقم العمارة، رقم الشقة أو علامة مميزة"
                    className="w-full bg-[#1f1f24] border border-white/10 rounded-xl p-3 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#D31027] focus:bg-[#25252b] transition-all resize-none"
                  />
                  <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">
                  اختر الفرع للاستلام منه <span className="text-red-400">*</span>
                </label>
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="w-full bg-[#1f1f24] border border-white/10 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-[#D31027] transition-all"
                >
                  {BRANCHES.map((b) => (
                    <option key={b.id} value={b.name} className="bg-[#1f1f24] text-white">
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Payment Method */}
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5">
                طريقة الدفع <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cash')}
                  className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    paymentMethod === 'cash'
                      ? 'bg-amber-950/60 border-amber-500 text-amber-300 shadow-sm'
                      : 'bg-[#1f1f24] border-white/10 text-gray-400 hover:bg-[#25252b]'
                  }`}
                >
                  <Banknote className="w-4 h-4 text-emerald-400" />
                  <span>كاش عند الاستلام</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    paymentMethod === 'card'
                      ? 'bg-amber-950/60 border-amber-500 text-amber-300 shadow-sm'
                      : 'bg-[#1f1f24] border-white/10 text-gray-400 hover:bg-[#25252b]'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-blue-400" />
                  <span>فيزا / كارت مع المندوب</span>
                </button>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">
                ملاحظات إضافية على الطلب (اختياري)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="بدون كاتشب، صوص إضافي، دجاج سبايسي زيادة..."
                className="w-full bg-[#1f1f24] border border-white/10 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#D31027] focus:bg-[#25252b] transition-all"
              />
            </div>

            {/* Order Summary Strip */}
            <div className="bg-[#0e0e11] rounded-2xl p-3.5 space-y-1.5 text-xs text-gray-400 border border-white/10">
              <div className="flex justify-between">
                <span>عدد الأصناف:</span>
                <span className="font-bold text-white">{cartItems.length} وجبة</span>
              </div>
              <div className="flex justify-between">
                <span>المجموع:</span>
                <span className="font-bold text-white">{subtotal} ج.م</span>
              </div>
              {deliveryMethod === 'delivery' && (
                <div className="flex justify-between">
                  <span>خدمة التوصيل:</span>
                  <span className="font-bold text-white">20 ج.م</span>
                </div>
              )}
              <div className="border-t border-white/10 pt-2 flex justify-between items-center text-sm font-black text-white">
                <span>الإجمالي النهائي:</span>
                <span className="text-lg text-amber-400 font-black">{grandTotal} ج.م</span>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#D31027] hover:bg-[#b80d21] disabled:opacity-60 text-white font-extrabold py-3.5 rounded-xl shadow-lg shadow-red-950/60 transition-all flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer active:scale-98"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>جاري تسجيل وحفظ الطلب في Firestore...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5 text-amber-300" />
                  <span>تأكيد الطلب الآن ({grandTotal} ج.م)</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
