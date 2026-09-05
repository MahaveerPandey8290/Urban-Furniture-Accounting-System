import { useState, useCallback } from "react";
import { CheckCircle } from "lucide-react";

/**
 * Custom hook for managing toast notification state and auto-dismiss timer.
 */
export function useToast(defaultDuration = 3000) {
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = useCallback((msg, duration = defaultDuration) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, duration);
  }, [defaultDuration]);

  return { toastMessage, showToast };
}

/**
 * Reusable toast notification banner component.
 */
export function Toast({ message }) {
  if (!message) return null;

  return (
    <div className="fixed top-6 right-6 z-50 flex items-center gap-2 bg-[#241e18] text-white px-4 py-2.5 rounded-xl shadow-xl text-xs border border-white/10 animate-in fade-in duration-200">
      <CheckCircle size={16} className="text-emerald-400" />
      <span>{message}</span>
    </div>
  );
}

export default Toast;
