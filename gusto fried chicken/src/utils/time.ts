/**
 * Time formatting helpers for Arabic Kitchen Display System
 */

export function getOrderTimestampMs(createdAt: any): number {
  if (!createdAt) return Date.now();
  if (typeof createdAt === 'number') return createdAt;
  if (typeof createdAt.toMillis === 'function') {
    return createdAt.toMillis();
  }
  if (typeof createdAt.toDate === 'function') {
    return createdAt.toDate().getTime();
  }
  if (createdAt.seconds) {
    return createdAt.seconds * 1000 + (createdAt.nanoseconds ? createdAt.nanoseconds / 1000000 : 0);
  }
  if (typeof createdAt === 'string') {
    const parsed = new Date(createdAt).getTime();
    if (!isNaN(parsed)) return parsed;
  }
  return Date.now();
}

export function formatRelativeTimeArabic(createdAt: any): { text: string; elapsedMinutes: number; isUrgent: boolean; isWarning: boolean } {
  const timeMs = getOrderTimestampMs(createdAt);
  const diffSec = Math.max(0, Math.floor((Date.now() - timeMs) / 1000));
  const diffMin = Math.floor(diffSec / 60);

  const isWarning = diffMin >= 15 && diffMin < 25;
  const isUrgent = diffMin >= 25;

  let text = '';
  if (diffMin < 1) {
    text = 'الآن';
  } else if (diffMin === 1) {
    text = 'منذ دقيقة';
  } else if (diffMin === 2) {
    text = 'منذ دقيقتين';
  } else if (diffMin >= 3 && diffMin <= 10) {
    text = `منذ ${diffMin} دقائق`;
  } else if (diffMin < 60) {
    text = `منذ ${diffMin} دقيقة`;
  } else {
    const hours = Math.floor(diffMin / 60);
    if (hours === 1) {
      text = 'منذ ساعة';
    } else if (hours === 2) {
      text = 'منذ ساعتين';
    } else if (hours <= 10) {
      text = `منذ ${hours} ساعات`;
    } else {
      text = `منذ ${hours} ساعة`;
    }
  }

  return { text, elapsedMinutes: diffMin, isUrgent, isWarning };
}

export function formatOrderExactTime(createdAt: any): string {
  const timeMs = getOrderTimestampMs(createdAt);
  const date = new Date(timeMs);
  return date.toLocaleTimeString('ar-EG', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}
