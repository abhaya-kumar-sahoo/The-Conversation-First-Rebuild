import { motion, AnimatePresence } from 'framer-motion';
import { useAppSelector, useAppDispatch } from '@/hooks/useStore';
import { removeToast } from '@/store/slices/uiSlice';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { useEffect } from 'react';

const TOAST_ICONS = {
  success: <CheckCircle size={16} className="text-emerald-400" />,
  error: <AlertCircle size={16} className="text-red-400" />,
  warning: <AlertCircle size={16} className="text-amber-400" />,
  info: <Info size={16} className="text-blue-400" />,
};

export function ToastContainer() {
  const { toasts } = useAppSelector(s => s.ui);
  const dispatch = useAppDispatch();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
      <AnimatePresence>
        {toasts.map(toast => (
          <ToastItem key={toast.id} toast={toast} onRemove={() => dispatch(removeToast(toast.id))} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastItem({ toast, onRemove }: { toast: any, onRemove: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onRemove, toast.duration || 3000);
    return () => clearTimeout(timer);
  }, [onRemove, toast.duration]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="pointer-events-auto flex items-start gap-3 p-3 bg-[#18181b] border border-[#27272a] shadow-xl rounded-lg w-full"
    >
      <div className="flex-shrink-0 mt-0.5">
        {TOAST_ICONS[toast.type as keyof typeof TOAST_ICONS]}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-white">{toast.title}</div>
        {toast.description && (
          <div className="text-xs text-[#a1a1aa] mt-0.5">{toast.description}</div>
        )}
      </div>
      <button
        onClick={onRemove}
        className="flex-shrink-0 text-[#71717a] hover:text-white transition-colors"
      >
        <X size={14} />
      </button>
    </motion.div>
  );
}
