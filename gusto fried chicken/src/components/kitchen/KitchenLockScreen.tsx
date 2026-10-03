import React, { useState, useEffect } from 'react';
import { Lock, ShieldCheck, Flame, Delete, AlertCircle, KeyRound } from 'lucide-react';

interface KitchenLockScreenProps {
  onUnlock: () => void;
}

const CORRECT_PIN = '1234';

export const KitchenLockScreen: React.FC<KitchenLockScreenProps> = ({ onUnlock }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  // Allow physical keyboard entry
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handleDigit(e.key);
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Enter') {
        handleCheckPin(pin);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pin]);

  const handleDigit = (digit: string) => {
    if (pin.length < 6) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setError(false);
      if (nextPin.length === 4) {
        handleCheckPin(nextPin);
      }
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(false);
  };

  const handleClear = () => {
    setPin('');
    setError(false);
  };

  const handleCheckPin = (currentPin: string) => {
    if (currentPin === CORRECT_PIN) {
      onUnlock();
    } else {
      setError(true);
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      setTimeout(() => {
        setPin('');
      }, 700);
    }
  };

  return (
    <div className="min-h-screen bg-[#0c0c0e] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden font-['Cairo',sans-serif]" dir="rtl">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 -right-20 w-96 h-96 bg-red-900/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Branding header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center gap-2 bg-red-950/60 border border-red-800/40 text-red-500 px-4 py-1.5 rounded-full text-xs font-bold mb-4 shadow-lg shadow-red-950/40">
            <ShieldCheck className="w-4 h-4 text-red-400" />
            <span>نظام شاشة المطبخ وإدارة الطلبات (KDS)</span>
          </div>

          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#990000] to-[#D31027] flex items-center justify-center shadow-lg shadow-red-950/80">
              <Flame className="w-6 h-6 text-amber-300" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              GUSTO <span className="text-[#D31027]">KITCHEN</span>
            </h1>
          </div>
          <p className="text-gray-400 text-xs sm:text-sm">
            شاشة خاصة بطاقم المطبخ والشيفات لمتابعة وتنفيذ الطلبات فورياً
          </p>
        </div>

        {/* Lock Screen Card */}
        <div
          className={`bg-[#151518] rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl backdrop-blur-xl transition-all ${
            isShaking ? 'translate-x-[-10px] sm:translate-x-[-15px] duration-75 border-red-600/80 shadow-red-950/50' : ''
          }`}
        >
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-[#202025] border border-white/10 flex items-center justify-center text-amber-400 mb-3 shadow-inner">
              <Lock className="w-7 h-7" />
            </div>
            <h2 className="text-lg font-extrabold text-white">أدخل رمز دخول المطبخ</h2>
            <p className="text-xs text-gray-400 mt-1">
              أدخل الرمز السري المخصص للشيف (الرمز الافتراضي: 1234)
            </p>
          </div>

          {/* PIN Dots Display */}
          <div className="flex justify-center items-center gap-4 mb-6">
            {[0, 1, 2, 3].map((index) => {
              const isFilled = pin.length > index;
              return (
                <div
                  key={index}
                  className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 transition-all duration-200 ${
                    error
                      ? 'border-red-500 bg-red-600 shadow-md shadow-red-600/50'
                      : isFilled
                      ? 'border-[#D31027] bg-[#D31027] scale-110 shadow-md shadow-red-600/50'
                      : 'border-white/20 bg-black/40'
                  }`}
                />
              );
            })}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 bg-red-950/60 border border-red-800/50 text-red-300 text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
              <span>رمز الدخول غير صحيح! جرب 1234</span>
            </div>
          )}

          {/* Touch / Click Numeric Keypad */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                type="button"
                onClick={() => handleDigit(digit)}
                className="h-14 sm:h-16 rounded-2xl bg-[#202025] hover:bg-[#2b2b32] active:bg-[#D31027] active:text-white border border-white/5 text-xl font-bold text-white transition-all cursor-pointer flex items-center justify-center shadow-md active:scale-95 select-none"
              >
                {digit}
              </button>
            ))}

            <button
              type="button"
              onClick={handleClear}
              className="h-14 sm:h-16 rounded-2xl bg-red-950/30 hover:bg-red-950/60 border border-red-900/30 text-xs font-bold text-red-400 transition-all cursor-pointer flex items-center justify-center shadow-md active:scale-95 select-none"
            >
              مسح
            </button>

            <button
              type="button"
              onClick={() => handleDigit('0')}
              className="h-14 sm:h-16 rounded-2xl bg-[#202025] hover:bg-[#2b2b32] active:bg-[#D31027] border border-white/5 text-xl font-bold text-white transition-all cursor-pointer flex items-center justify-center shadow-md active:scale-95 select-none"
            >
              0
            </button>

            <button
              type="button"
              onClick={handleBackspace}
              className="h-14 sm:h-16 rounded-2xl bg-[#202025] hover:bg-[#2b2b32] border border-white/5 text-gray-300 hover:text-white transition-all cursor-pointer flex items-center justify-center shadow-md active:scale-95 select-none"
              title="حذف رقم"
            >
              <Delete className="w-5 h-5" />
            </button>
          </div>

          {/* Helper info & return link */}
          <div className="text-center pt-3 border-t border-white/10 flex flex-col items-center gap-2">
            <div className="inline-flex items-center gap-1.5 text-xs text-gray-400">
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <span>رمز الدخول المعتمد للوصول: <strong className="text-amber-400">1234</strong></span>
            </div>
            <button
              type="button"
              onClick={() => {
                window.history.pushState(null, '', '/');
                window.dispatchEvent(new PopStateEvent('popstate'));
              }}
              className="text-xs text-gray-400 hover:text-white transition-colors underline cursor-pointer mt-1"
            >
              العودة إلى صفحة منيو المطعم الرئيسية
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
