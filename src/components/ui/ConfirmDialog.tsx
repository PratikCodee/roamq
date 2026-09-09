import { AlertTriangle, X } from 'lucide-react';

interface Props {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}

export function ConfirmDialog({
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  danger = false,
}: Props) {
  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-navy-900/50 backdrop-blur-sm"
        onClick={onCancel}
      />
      {/* Dialog */}
      <div className="relative z-10 w-full max-w-sm rounded-3xl bg-white shadow-2xl border border-navy-100 p-6 animate-scale-in">
        <button
          onClick={onCancel}
          className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full text-navy-400 hover:bg-navy-50 hover:text-navy-700 transition"
        >
          <X size={16} />
        </button>

        <div className={`mb-4 grid h-12 w-12 place-items-center rounded-2xl ${danger ? 'bg-error-50 text-error-500' : 'bg-ocean-50 text-ocean-500'}`}>
          <AlertTriangle size={22} />
        </div>

        <h3 className="text-lg font-bold text-navy-900 mb-2">{title}</h3>
        <p className="text-sm text-navy-500 leading-relaxed">{message}</p>

        <div className="mt-6 flex gap-3">
          <button
            onClick={onCancel}
            className="btn-secondary flex-1 py-2.5"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-2.5 rounded-full font-semibold transition-all ${
              danger
                ? 'bg-error-500 text-white hover:bg-error-600 shadow-soft'
                : 'btn-primary'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
