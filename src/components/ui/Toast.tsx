import { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

// Singleton event emitter for toasts
const listeners: Array<(t: ToastMessage) => void> = [];

export function showToast(message: string, type: ToastType = 'success') {
  const id = `${Date.now()}-${Math.random()}`;
  listeners.forEach((fn) => fn({ id, message, type }));
}

const icons: Record<ToastType, typeof CheckCircle2> = {
  success: CheckCircle2,
  error:   AlertCircle,
  info:    Info,
};

const colors: Record<ToastType, string> = {
  success: 'border-success-200 bg-success-50 text-success-800',
  error:   'border-error-200 bg-error-50 text-error-800',
  info:    'border-ocean-200 bg-ocean-50 text-ocean-800',
};

const iconColors: Record<ToastType, string> = {
  success: 'text-success-500',
  error:   'text-error-500',
  info:    'text-ocean-500',
};

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const handler = (t: ToastMessage) => {
      setToasts((prev) => [...prev, t]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((x) => x.id !== t.id));
      }, 3500);
    };
    listeners.push(handler);
    return () => {
      const idx = listeners.indexOf(handler);
      if (idx > -1) listeners.splice(idx, 1);
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
      {toasts.map((t) => {
        const Icon = icons[t.type];
        return (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-lg text-sm font-medium animate-fade-up ${colors[t.type]}`}
          >
            <Icon size={16} className={`shrink-0 ${iconColors[t.type]}`} />
            <span>{t.message}</span>
            <button
              onClick={() => setToasts((p) => p.filter((x) => x.id !== t.id))}
              className="ml-2 opacity-60 hover:opacity-100 transition"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
