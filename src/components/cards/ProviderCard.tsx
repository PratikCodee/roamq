import { useState } from 'react';
import { MapPin, Clock, Users, Phone, Star, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import type { Provider } from '@/types';
import { Rating } from '@/components/ui/Rating';
import { SaveButton } from '@/components/ui/SaveButton';
import { Reviews } from '@/components/ui/Reviews';
import { ContactModal } from '@/components/ui/ContactModal';

const availStyles: Record<Provider['availability'], { chip: string; icon: typeof CheckCircle2; label: string }> = {
  Available: { chip: 'bg-success-100 text-success-700', icon: CheckCircle2, label: 'Available' },
  Limited: { chip: 'bg-warning-100 text-warning-700', icon: AlertCircle, label: 'Limited slots' },
  Full: { chip: 'bg-error-100 text-error-700', icon: XCircle, label: 'Fully booked' },
};

export function ProviderCard({ provider, index = 0 }: { provider: Provider; index?: number }) {
  const [contactOpen, setContactOpen] = useState(false);
  const avail = availStyles[provider.availability];
  const AvailIcon = avail.icon;

  return (
    <article
      className="card group flex flex-col animate-fade-up"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="relative h-40 overflow-hidden">
        <img
          src={provider.profileImage}
          alt={provider.businessName}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-900/70 via-navy-900/10 to-transparent" />
        <div className="absolute left-3 top-3 flex gap-2">
          <span className="chip bg-white/90 text-navy-700 backdrop-blur">{provider.activityCategory}</span>
        </div>
        <div className="absolute right-3 top-3">
          <SaveButton
            item={{
              itemType: 'provider', itemId: provider.id, name: provider.businessName,
              image: provider.profileImage, category: provider.activityCategory, location: provider.location,
            }}
          />
        </div>
        <div className="absolute bottom-3 left-4 right-4">
          <h3 className="text-lg font-bold text-white drop-shadow">{provider.businessName}</h3>
          <p className="flex items-center gap-1.5 text-xs text-white/90">
            <MapPin size={13} /> {provider.location}
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between">
          <Rating value={provider.rating} count={provider.reviewsCount} />
          <span className={`chip ${avail.chip}`}>
            <AvailIcon size={12} /> {avail.label}
          </span>
        </div>

        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-navy-600">{provider.description}</p>

        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-navy-400">Activities offered</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {provider.activitiesOffered.map((a) => (
              <span key={a} className="rounded-lg bg-ocean-50 px-2 py-1 text-[11px] font-semibold text-ocean-700">
                {a}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 text-xs text-navy-600">
          <div className="rounded-xl bg-navy-50 px-2.5 py-2 text-center">
            <p className="text-[11px] text-navy-400">from</p>
            <p className="font-bold text-navy-900">₹{provider.priceFrom}</p>
          </div>
          <div className="flex items-center justify-center gap-1.5 rounded-xl bg-navy-50 px-2.5 py-2">
            <Users size={13} className="text-ocean-500" /> {provider.groupCapacity} max
          </div>
          <div className="flex items-center justify-center gap-1 rounded-xl bg-sand-50 px-2.5 py-2 text-sand-700">
            <Star size={12} className="fill-sand-400 text-sand-400" /> {provider.rating}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-2">
          <p className="text-xs text-navy-400">
            <Clock size={12} className="mr-1 inline" /> Sample availability
          </p>
          <button onClick={() => setContactOpen(true)} className="btn-primary text-sm">
            <Phone size={15} /> Contact
          </button>
        </div>

        <Reviews
          targetType="provider"
          targetId={provider.id}
          baseRating={provider.rating}
          reviewsCount={provider.reviewsCount}
        />
      </div>

      <ContactModal
        open={contactOpen}
        onClose={() => setContactOpen(false)}
        title={provider.businessName}
        subtitle={`${provider.activityCategory} · from ₹${provider.priceFrom}`}
        contact={provider.contact}
        image={provider.profileImage}
      >
        <div className="space-y-2">
          <p><strong>Activities:</strong> {provider.activitiesOffered.join(', ')}</p>
          <p><strong>Group capacity:</strong> up to {provider.groupCapacity} people</p>
          <p><strong>Location:</strong> {provider.location}</p>
        </div>
      </ContactModal>
    </article>
  );
}
