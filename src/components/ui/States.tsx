import { type ReactNode } from 'react';
import { Compass, SearchX, AlertCircle, Loader2 } from 'lucide-react';

export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-navy-400">
      <Loader2 size={32} className="animate-spin text-ocean-500" />
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}

export function EmptyState({
  title = 'Nothing here yet',
  message,
  icon,
  action,
}: {
  title?: string;
  message?: string;
  icon?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-navy-200 bg-white/60 py-16 text-center">
      <div className="grid h-16 w-16 place-items-center rounded-full bg-navy-100 text-navy-400">
        {icon ?? <SearchX size={28} />}
      </div>
      <div>
        <p className="text-lg font-semibold text-navy-800">{title}</p>
        {message && <p className="mt-1 max-w-sm text-sm text-navy-500">{message}</p>}
      </div>
      {action}
    </div>
  );
}

export function ErrorState({
  message = 'Something went wrong. Please try again.',
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-error-200 bg-error-50 py-16 text-center">
      <div className="grid h-16 w-16 place-items-center rounded-full bg-error-100 text-error-500">
        <AlertCircle size={28} />
      </div>
      <p className="max-w-sm text-sm text-error-700">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary text-sm">
          Try again
        </button>
      )}
    </div>
  );
}

export function SectionHeading({
  eyebrow, title, subtitle, action,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && <p className="section-eyebrow">{eyebrow}</p>}
        <h2 className="section-title mt-1">{title}</h2>
        {subtitle && <p className="mt-2 max-w-2xl text-navy-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function ComingSoonBadge() {
  return (
    <span className="chip bg-navy-100 text-navy-500">
      <Compass size={12} /> Coming soon
    </span>
  );
}
