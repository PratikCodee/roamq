import { useEffect, type ReactNode } from 'react';
import { X, Phone } from 'lucide-react';

interface ContactModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  contact: string;
  image?: string;
  children?: ReactNode;
}

export function ContactModal({ open, onClose, title, subtitle, contact, image, children }: ContactModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-navy-900/50 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-t-4xl bg-white p-6 shadow-lift animate-scale-in sm:rounded-4xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-navy-50 text-navy-500 hover:bg-navy-100"
          aria-label="Close"
        >
          <X size={18} />
        </button>
        <div className="flex items-start gap-4">
          {image && (
            <img src={image} alt={title} className="h-16 w-16 rounded-2xl object-cover" />
          )}
          <div>
            <h3 className="text-lg font-bold text-navy-900">{title}</h3>
            {subtitle && <p className="text-sm text-navy-500">{subtitle}</p>}
          </div>
        </div>
        {children && <div className="mt-4 text-sm text-navy-600">{children}</div>}
        <div className="mt-6 rounded-2xl bg-ocean-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-ocean-700">Prototype contact</p>
          <p className="mt-1 flex items-center gap-2 text-lg font-bold text-navy-900">
            <Phone size={18} className="text-ocean-600" /> {contact}
          </p>
          <p className="mt-2 text-xs text-navy-500">
            This is sample contact information for the hackathon prototype — no real call or booking is placed.
          </p>
        </div>
        <button onClick={onClose} className="btn-secondary mt-4 w-full">Close</button>
      </div>
    </div>
  );
}
