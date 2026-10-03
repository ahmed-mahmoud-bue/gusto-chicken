import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
} from 'firebase/firestore';
import {
  Flame,
  Volume2,
  VolumeX,
  Lock,
  RefreshCw,
  Search,
  ChefHat,
  Bell,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Wifi,
  Filter,
  Store,
} from 'lucide-react';
import { db } from '../../firebase';
import { OrderRecord } from '../../types';
import { KitchenOrderCard } from './KitchenOrderCard';
import { kitchenAudio } from '../../utils/audio';

interface KitchenDisplayProps {
  onLock: () => void;
}

type TabType = 'active' | 'completed';
type ActiveSubFilter = 'all' | 'new' | 'preparing' | 'ready';

export const KitchenDisplay: React.FC<KitchenDisplayProps> = ({ onLock }) => {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('active');
  const [subFilter, setSubFilter] = useState<ActiveSubFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMuted, setIsMuted] = useState(() => kitchenAudio.getMuted());
  const [currentTime, setCurrentTime] = useState('');
  const [newArrivalAlert, setNewArrivalAlert] = useState<{ id: string; customerName: string } | null>(null);

  const initialLoadRef = useRef(true);
  const knownOrderIdsRef = useRef<Set<string>>(new Set());

  // Clock updates every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('ar-EG', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Real-time Firestore Listener directly on 'orders' collection without compound index requirement
  useEffect(() => {
    setLoading(true);
    const ordersCol = collection(db, 'orders');

    const unsubscribe = onSnapshot(
      ordersCol,
      (snapshot) => {
        console.log('Orders received:', snapshot.docs.length);
        const orderList: OrderRecord[] = [];
        let newlyArrived: { id: string; customerName: string } | null = null;

        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added' && !initialLoadRef.current) {
            const data = change.doc.data() as OrderRecord;
            const docId = change.doc.id;
            if (!knownOrderIdsRef.current.has(docId) && data.status === 'new') {
              newlyArrived = {
                id: docId,
                customerName: data.customerName || 'عميل جديد',
              };
            }
          }
        });

        const getTimeMs = (createdAt: any): number => {
          if (!createdAt) return 0;
          if (typeof createdAt === 'number') return createdAt;
          if (typeof createdAt.toMillis === 'function') return createdAt.toMillis();
          if (typeof createdAt.toDate === 'function') return createdAt.toDate().getTime();
          if (createdAt.seconds) return createdAt.seconds * 1000;
          if (typeof createdAt === 'string') {
            const t = new Date(createdAt).getTime();
            return isNaN(t) ? 0 : t;
          }
          return 0;
        };

        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as OrderRecord;
          const orderRecord: OrderRecord = {
            ...data,
            id: docSnap.id,
            totalAmount: data.totalAmount ?? (data as any).total ?? 0,
            items: data.items || [],
          };
          orderList.push(orderRecord);
          knownOrderIdsRef.current.add(docSnap.id);
        });

        // Sort descending by creation time inside JavaScript
        orderList.sort((a, b) => getTimeMs(b.createdAt) - getTimeMs(a.createdAt));

        setOrders(orderList);
        setLoading(false);

        // If a new order arrived after initial load, play chime and trigger visual banner!
        if (newlyArrived) {
          kitchenAudio.playOrderChime();
          setNewArrivalAlert(newlyArrived);
          setTimeout(() => {
            setNewArrivalAlert(null);
          }, 6000);
        }

        initialLoadRef.current = false;
      },
      (error) => {
        console.error('Firestore kitchen orders onSnapshot error:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Update order status in Firestore
  const handleUpdateStatus = async (
    orderId: string,
    newStatus: 'new' | 'preparing' | 'ready' | 'completed' | 'cancelled'
  ) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      // Strictly update status only to satisfy firestore.rules
      await updateDoc(orderRef, {
        status: newStatus,
      });
    } catch (error) {
      console.error('Error updating order status in Firestore:', error);
      alert('حدث خطأ أثناء تحديث حالة الطلب في قاعدة البيانات.');
    }
  };

  // Toggle Sound Mute
  const handleToggleSound = () => {
    const next = !isMuted;
    setIsMuted(next);
    kitchenAudio.setMuted(next);
  };

  // Test Sound
  const handleTestSound = () => {
    kitchenAudio.playOrderChime();
  };

  // Summary counts
  const counts = useMemo(() => {
    const active = orders.filter((o) => ['new', 'preparing', 'ready'].includes(o.status));
    const newOrders = orders.filter((o) => o.status === 'new');
    const preparing = orders.filter((o) => o.status === 'preparing');
    const ready = orders.filter((o) => o.status === 'ready');
    const completed = orders.filter((o) => ['completed', 'cancelled'].includes(o.status));

    return {
      active: active.length,
      new: newOrders.length,
      preparing: preparing.length,
      ready: ready.length,
      completed: completed.length,
    };
  }, [orders]);

  // Filtered orders list
  const displayedOrders = useMemo(() => {
    let list = orders;

    // Filter by Active vs Completed
    if (activeTab === 'active') {
      list = list.filter((o) => ['new', 'preparing', 'ready'].includes(o.status));

      if (subFilter !== 'all') {
        list = list.filter((o) => o.status === subFilter);
      }
    } else {
      list = list.filter((o) => ['completed', 'cancelled'].includes(o.status));
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (o) =>
          o.id?.toLowerCase().includes(q) ||
          o.customerName?.toLowerCase().includes(q) ||
          o.phone?.includes(q) ||
          o.items?.some((it) => it.name.toLowerCase().includes(q))
      );
    }

    return list;
  }, [orders, activeTab, subFilter, searchQuery]);

  return (
    <div className="min-h-screen bg-[#0c0c0e] text-white flex flex-col font-['Cairo',sans-serif]" dir="rtl">
      {/* Background ambient lighting */}
      <div className="fixed top-0 right-1/4 w-96 h-96 bg-red-950/20 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 left-1/4 w-96 h-96 bg-amber-950/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top KDS Command Bar */}
      <header className="sticky top-0 z-40 bg-[#121215]/95 backdrop-blur-md border-b border-white/10 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Logo and System Title */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#990000] to-[#D31027] flex items-center justify-center shadow-lg shadow-red-950/80">
                <Flame className="w-6 h-6 text-amber-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg sm:text-xl font-black text-white tracking-tight">
                    شاشة المطبخ (KDS)
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/80 border border-emerald-600/40 text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Firestore لحظي
                  </span>
                </div>
                <p className="text-[11px] text-gray-400">
                  GUSTO Fried Chicken & Burgers - شاشة تحضير الطلبات للشيف
                </p>
              </div>
            </div>

            {/* Live Digital Clock */}
            <div className="hidden md:flex items-center gap-2 bg-[#1a1a20] px-4 py-1.5 rounded-2xl border border-white/10 font-mono text-sm font-bold text-amber-300 shadow-inner">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>{currentTime || '00:00:00'}</span>
            </div>

            {/* Audio & Control Buttons */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Sound Toggle */}
              <button
                type="button"
                onClick={handleToggleSound}
                className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl border transition-all cursor-pointer shadow-sm ${
                  isMuted
                    ? 'bg-red-950/40 border-red-800/50 text-red-300 hover:bg-red-950/70'
                    : 'bg-emerald-950/40 border-emerald-800/50 text-emerald-300 hover:bg-emerald-950/70'
                }`}
                title={isMuted ? 'تفعيل صوت التنبيه' : 'كتم صوت التنبيه'}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                <span className="hidden sm:inline">{isMuted ? 'الصوت مكتوم' : 'الصوت مفعّل'}</span>
              </button>

              {/* Sound Test Button */}
              <button
                type="button"
                onClick={handleTestSound}
                className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl bg-[#202026] hover:bg-[#2c2c34] text-gray-200 border border-white/10 transition-all cursor-pointer shadow-sm"
                title="تجربة صوت جرس المطبخ"
              >
                <Bell className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">تجربة الصوت</span>
              </button>

              {/* Return to Customer Store */}
              <button
                type="button"
                onClick={() => {
                  window.history.pushState(null, '', '/');
                  window.dispatchEvent(new PopStateEvent('popstate'));
                }}
                className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl bg-[#202026] hover:bg-[#2c2c34] text-gray-300 hover:text-white border border-white/10 transition-all cursor-pointer shadow-sm"
                title="الرجوع إلى صفحة منيو المطعم الرئيسية"
              >
                <Store className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">صفحة المتجر</span>
              </button>

              {/* Lock Screen */}
              <button
                type="button"
                onClick={onLock}
                className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl bg-red-950/60 hover:bg-red-900 border border-red-800/60 text-white transition-all cursor-pointer shadow-sm shadow-red-950/50"
                title="قفل شاشة المطبخ برمز PIN"
              >
                <Lock className="w-4 h-4 text-red-400" />
                <span>قفل الشاشة</span>
              </button>
            </div>
          </div>

          {/* New Arrival Floating Banner */}
          {newArrivalAlert && (
            <div className="mt-3 bg-gradient-to-r from-red-600 via-amber-600 to-red-600 text-white px-4 py-2 rounded-2xl flex items-center justify-between shadow-xl shadow-red-950/80 animate-bounce">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-black">
                <Bell className="w-5 h-5 text-amber-200 animate-spin" />
                <span>🔔 أوردر جديد وصل الآن! #{newArrivalAlert.id.slice(-6)} - العميل: {newArrivalAlert.customerName}</span>
              </div>
              <button
                type="button"
                onClick={() => setNewArrivalAlert(null)}
                className="text-xs bg-black/30 hover:bg-black/50 px-2 py-0.5 rounded-lg cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          )}

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-3 mt-2 border-t border-white/5">
            <div className="bg-[#18181d] rounded-2xl p-2.5 border border-white/5 flex items-center justify-between">
              <div className="text-[11px] text-gray-400 font-bold">الطلبات النشطة</div>
              <div className="text-lg font-black text-white">{counts.active}</div>
            </div>

            <div className="bg-red-950/30 rounded-2xl p-2.5 border border-red-900/30 flex items-center justify-between">
              <div className="text-[11px] text-red-300 font-bold">جديد (لم يبدأ)</div>
              <div className="text-lg font-black text-red-400">{counts.new}</div>
            </div>

            <div className="bg-amber-950/30 rounded-2xl p-2.5 border border-amber-900/30 flex items-center justify-between">
              <div className="text-[11px] text-amber-300 font-bold">قيد التحضير</div>
              <div className="text-lg font-black text-amber-400">{counts.preparing}</div>
            </div>

            <div className="bg-emerald-950/30 rounded-2xl p-2.5 border border-emerald-900/30 flex items-center justify-between">
              <div className="text-[11px] text-emerald-300 font-bold">جاهز للتسليم</div>
              <div className="text-lg font-black text-emerald-400">{counts.ready}</div>
            </div>

            <div className="bg-[#18181d] rounded-2xl p-2.5 border border-white/5 flex items-center justify-between col-span-2 sm:col-span-1">
              <div className="text-[11px] text-gray-400 font-bold">المكتملة اليوم</div>
              <div className="text-lg font-black text-gray-400">{counts.completed}</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Filter & Navigation Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 w-full">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#151518] p-3 rounded-3xl border border-white/10 shadow-lg">
          {/* Main Tabs (Active vs Completed) */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => {
                setActiveTab('active');
                setSubFilter('all');
              }}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
                activeTab === 'active'
                  ? 'bg-gradient-to-r from-[#990000] to-[#D31027] text-white shadow-lg shadow-red-950/60'
                  : 'bg-[#202026] text-gray-400 hover:text-white border border-white/5'
              }`}
            >
              <ChefHat className="w-4 h-4" />
              <span>الطلبات النشطة</span>
              <span className="bg-black/40 text-amber-300 px-2 py-0.5 rounded-full text-xs">
                {counts.active}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('completed')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
                activeTab === 'completed'
                  ? 'bg-[#2b2b34] text-white border border-white/20 shadow-lg'
                  : 'bg-[#202026] text-gray-400 hover:text-white border border-white/5'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>الطلبات المكتملة</span>
              <span className="bg-black/40 text-gray-400 px-2 py-0.5 rounded-full text-xs">
                {counts.completed}
              </span>
            </button>
          </div>

          {/* Sub Filters for Active orders */}
          {activeTab === 'active' && (
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto no-scrollbar py-1">
              <button
                type="button"
                onClick={() => setSubFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  subFilter === 'all'
                    ? 'bg-white text-black font-black'
                    : 'bg-[#202026] text-gray-400 hover:text-white'
                }`}
              >
                الكل ({counts.active})
              </button>
              <button
                type="button"
                onClick={() => setSubFilter('new')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  subFilter === 'new'
                    ? 'bg-red-600 text-white font-black'
                    : 'bg-[#202026] text-red-400 hover:text-red-300'
                }`}
              >
                جديد ({counts.new})
              </button>
              <button
                type="button"
                onClick={() => setSubFilter('preparing')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  subFilter === 'preparing'
                    ? 'bg-amber-500 text-black font-black'
                    : 'bg-[#202026] text-amber-400 hover:text-amber-300'
                }`}
              >
                قيد التحضير ({counts.preparing})
              </button>
              <button
                type="button"
                onClick={() => setSubFilter('ready')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  subFilter === 'ready'
                    ? 'bg-emerald-500 text-black font-black'
                    : 'bg-[#202026] text-emerald-400 hover:text-emerald-300'
                }`}
              >
                جاهز للتسليم ({counts.ready})
              </button>
            </div>
          )}

          {/* Quick Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث برقم الطلب أو العميل..."
              className="w-full bg-[#202026] border border-white/10 rounded-2xl pr-9 pl-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#D31027]"
            />
          </div>
        </div>
      </div>

      {/* Orders Grid Display Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 pb-16 flex-1 w-full">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-12 h-12 rounded-full border-4 border-[#D31027] border-t-transparent animate-spin mb-4" />
            <h3 className="font-extrabold text-base text-white">جاري الاتصال المباشر بقاعدة البيانات...</h3>
            <p className="text-xs text-gray-400 mt-1">يتم جلب وتحديث الأوردرات تلقائياً عبر Firestore</p>
          </div>
        ) : displayedOrders.length === 0 ? (
          <div className="bg-[#151518] rounded-3xl p-12 text-center border border-white/10 max-w-lg mx-auto my-12 shadow-2xl">
            <div className="w-16 h-16 rounded-3xl bg-red-950/40 border border-red-800/40 text-amber-400 mx-auto flex items-center justify-center mb-4">
              <ChefHat className="w-8 h-8" />
            </div>
            <h3 className="font-black text-xl text-white mb-2">
              {activeTab === 'active' ? 'لا توجد طلبات نشطة في المطبخ حالياً' : 'لا توجد طلبات مكتملة'}
            </h3>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed max-w-md mx-auto">
              {activeTab === 'active'
                ? 'المطبخ جاهز بالكامل! فور قيام أي عميل بإرسال طلب جديد، سيظهر هنا فوراً مع تنبيه صوتي تلقائي دون الحاجة لتحديث الصفحة.'
                : 'الطلبات المكتملة أو الملغاة ستظهر هنا في الأرشيف.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayedOrders.map((order) => (
              <KitchenOrderCard
                key={order.id}
                order={order}
                onUpdateStatus={handleUpdateStatus}
                isNewArrival={newArrivalAlert?.id === order.id}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
