import { useState } from 'react';
import { Users, MapPin, CheckCircle2, XCircle, AlertCircle, Phone } from 'lucide-react';
import type { Hotel } from '@/types';
import { Rating } from '@/components/ui/Rating';
import { SaveButton } from '@/components/ui/SaveButton';
import { Reviews } from '@/components/ui/Reviews';
import { ContactModal } from '@/components/ui/ContactModal';

const availabilityStyles: Record<Hotel['availability'], { chip: string; icon: typeof CheckCircle2; label: string }> = {
  Available: { chip: 'bg-success-100 text-success-700', icon: CheckCircle2, label: 'Available' },
  Limited: { chip: 'bg-warning-100 text-warning-700', icon: AlertCircle, label: 'Limited' },
  Full: { chip: 'bg-error-100 text-error-700', icon: XCircle, label: 'Fully booked' },
};

export function HotelCard({ hotel, index = 0 }: { hotel: Hotel; index?: number }) {
  const [contactOpen, setContactOpen] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const avail = availabilityStyles[hotel.availability];
  const AvailIcon = avail.icon;

  return (
    <article
      className="card group flex flex-col animate-fade-up"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="relative h-52 overflow-hidden">
        <img
          src={hotel.images[activeImg]}
          alt={hotel.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-900/50 via-transparent to-transparent" />
        <div className="absolute left-3 top-3">
          <span className={`chip ${avail.chip}`}>
            <AvailIcon size={12} /> {avail.label}
          </span>
        </div>
        <div className="absolute right-3 top-3">
          <SaveButton
            item={{
              itemType: 'hotel', itemId: hotel.id, name: hotel.name,
              image: hotel.images[0], category: hotel.roomType, location: hotel.location,
            }}
          />
        </div>
        {hotel.images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {hotel.images.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveImg(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === activeImg ? 'w-6 bg-white' : 'w-1.5 bg-white/60'
                }`}
                aria-label={`Image ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-navy-900">{hotel.name}</h3>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-navy-500">
              <MapPin size={14} className="text-ocean-500" /> {hotel.location}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-navy-400">from</p>
            <p className="text-lg font-extrabold text-navy-900">₹{hotel.priceFrom.toLocaleString('en-IN')}</p>
            <p className="text-[11px] text-navy-400">/ night</p>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <span className="chip bg-navy-50 text-navy-600">{hotel.roomType}</span>
          <span className="chip bg-navy-50 text-navy-600">
            <Users size={12} /> Up to {hotel.maxGuests}
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {hotel.facilities.slice(0, 5).map((f) => (
            <span key={f} className="rounded-lg bg-ocean-50 px-2 py-1 text-[11px] font-semibold text-ocean-700">
              {f}
            </span>
          ))}
          {hotel.facilities.length > 5 && (
            <span className="rounded-lg bg-navy-50 px-2 py-1 text-[11px] font-semibold text-navy-500">
              +{hotel.facilities.length - 5} more
            </span>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <Rating value={hotel.rating} count={hotel.reviewsCount} />
          <button
            onClick={() => setContactOpen(true)}
            className="btn-primary text-sm"
          >
            <Phone size={15} /> Contact
          </button>
        </div>

        <Reviews
          targetType="hotel"
          targetId={hotel.id}
          baseRating={hotel.rating}
          reviewsCount={hotel.reviewsCount}
        />
      </div>

      <ContactModal
        open={contactOpen}
        onClose={() => setContactOpen(false)}
        title={hotel.name}
        subtitle={`${hotel.roomType} · ${hotel.priceRange}`}
        contact={hotel.contact}
        image={hotel.images[0]}
      >
        <p>
          Availability status shown here is <strong>prototype sample data</strong>, not real-time.
          In the full RoamIQ product this would connect to the hotel\'s live booking system.
        </p>
      </ContactModal>
    </article>
  );
}
