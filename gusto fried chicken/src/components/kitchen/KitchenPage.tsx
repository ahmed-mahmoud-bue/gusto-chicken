import React, { useState } from 'react';
import { KitchenLockScreen } from './KitchenLockScreen';
import { KitchenDisplay } from './KitchenDisplay';

const KITCHEN_SESSION_KEY = 'gusto_kitchen_pin_verified';

export const KitchenPage: React.FC = () => {
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(KITCHEN_SESSION_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const handleUnlock = () => {
    setIsUnlocked(true);
    try {
      sessionStorage.setItem(KITCHEN_SESSION_KEY, 'true');
    } catch {}
  };

  const handleLock = () => {
    setIsUnlocked(false);
    try {
      sessionStorage.removeItem(KITCHEN_SESSION_KEY);
    } catch {}
  };

  if (!isUnlocked) {
    return <KitchenLockScreen onUnlock={handleUnlock} />;
  }

  return <KitchenDisplay onLock={handleLock} />;
};
