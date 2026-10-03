export type CategoryId =
  | 'all'
  | 'sandwiches'
  | 'burgers'
  | 'chicken_meals'
  | 'strips_meals'
  | 'mix_meals'
  | 'fries'
  | 'kids_meals';

export interface SizeOption {
  label: string; // e.g., 'Single', 'Double', 'Super', 'Medium', 'Large', 'عادي'
  price: number;
}

export interface MenuItem {
  id: string;
  name: string;
  arabicName: string;
  category: CategoryId;
  description: string;
  sizes: SizeOption[];
  defaultSizeIndex?: number;
  image: string;
  badge?: 'الأكثر مبيعاً' | 'جديد' | 'عرض خاص' | 'سبايسي' | 'توفير';
  isSpicy?: boolean;
}

export interface CartItem {
  cartItemId: string; // unique combo of itemId + size
  menuItemId: string;
  name: string;
  sizeLabel: string;
  price: number;
  quantity: number;
  image: string;
}

export type DeliveryMethod = 'delivery' | 'pickup';
export type PaymentMethod = 'cash' | 'card';

export interface CustomerDetails {
  customerName: string;
  phone: string;
  deliveryMethod: DeliveryMethod;
  address: string;
  paymentMethod: PaymentMethod;
  notes: string;
}

export interface OrderItemRecord {
  menuItemId: string;
  name: string;
  sizeLabel: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface OrderRecord {
  id?: string;
  customerName: string;
  phone: string;
  deliveryMethod?: DeliveryMethod;
  address?: string;
  paymentMethod?: PaymentMethod;
  notes?: string;
  items: OrderItemRecord[];
  total?: number;
  totalAmount: number;
  status: 'new' | 'preparing' | 'ready' | 'completed' | 'cancelled' | 'delivering';
  createdAt: any; // Timestamp or number or ServerTimestamp
}
