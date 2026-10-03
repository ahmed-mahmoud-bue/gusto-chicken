import { OrderRecord } from '../types';

export const ORDER_HISTORY_STORAGE_KEY = 'gusto_placed_orders_history';
export const LAST_ORDER_ID_KEY = 'gusto_last_order_id';

export function getLocalOrderHistory(): OrderRecord[] {
  try {
    const raw = localStorage.getItem(ORDER_HISTORY_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as OrderRecord[];
  } catch (e) {
    console.warn('Error reading order history from localStorage', e);
    return [];
  }
}

export function saveOrderToLocalHistory(order: OrderRecord): void {
  try {
    const history = getLocalOrderHistory();
    // Prevent duplicate entries by ID
    const filtered = history.filter((o) => o.id !== order.id);
    filtered.unshift(order);
    localStorage.setItem(ORDER_HISTORY_STORAGE_KEY, JSON.stringify(filtered.slice(0, 30)));
    if (order.id) {
      localStorage.setItem(LAST_ORDER_ID_KEY, order.id);
    }
  } catch (e) {
    console.warn('Error saving order to local history', e);
  }
}

export function getLastOrderId(): string | null {
  try {
    return localStorage.getItem(LAST_ORDER_ID_KEY);
  } catch {
    return null;
  }
}

export function setLastOrderId(id: string | null): void {
  try {
    if (id) {
      localStorage.setItem(LAST_ORDER_ID_KEY, id);
    } else {
      localStorage.removeItem(LAST_ORDER_ID_KEY);
    }
  } catch {}
}
