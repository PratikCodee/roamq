import { useState } from 'react';
import { MapPin, Clock, Phone, Flame, Leaf, Utensils } from 'lucide-react';
import type { Restaurant } from '@/types';
import { Rating } from '@/components/ui/Rating';
import { Reviews } from '@/components/ui/Reviews';
import { ContactModal } from '@/components/ui/ContactModal';

export function RestaurantCard({ restaurant, index = 0 }: { restaurant: Restaurant; index?: number }) {
  const [contactOpen, setContactOpen] = useState(false);
  return (
    <article
      className="card group flex flex-col animate-fade-up"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="relative h-44 overflow-hidden">
        <img
          src={restaurant.image}
          alt={restaurant.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-900/50 to-transparent" />
        <div className="absolute left-3 top-3 flex gap-2">
          <span className={`chip ${restaurant.isVeg ? 'bg-success-100 text-success-700' : 'bg-sand-100 text-sand-700'}`}>
            {restaurant.isVeg ? <Leaf size={12} /> : <Utensils size={12} />}
            {restaurant.isVeg ? 'Pure Veg' : 'Veg & Non-Veg'}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-bold text-navy-900">{restaurant.name}</h3>
        <p className="mt-1 flex items-center gap-1.5 text-xs text-navy-500">
          <MapPin size={14} className="text-ocean-500" /> {restaurant.location}
        </p>

        <div className="mt-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-navy-400">Famous for</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {restaurant.famousDishes.map((d) => (
              <span key={d} className="rounded-lg bg-sand-50 px-2 py-1 text-[11px] font-semibold text-sand-700">
                <Flame size={10} className="mr-1 inline" />{d}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-navy-600">
          <div className="flex items-center gap-1.5 rounded-xl bg-navy-50 px-2.5 py-1.5">
            <Clock size={13} className="text-ocean-500" /> {restaurant.openingHours}
          </div>
          <div className="flex items-center gap-1.5 rounded-xl bg-navy-50 px-2.5 py-1.5">
            <span className="font-semibold">₹{restaurant.priceForTwo}</span> for two
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <Rating value={restaurant.rating} count={restaurant.reviewsCount} />
          <button onClick={() => setContactOpen(true)} className="btn-primary text-sm">
            <Phone size={15} /> Contact
          </button>
        </div>

        <Reviews
          targetType="restaurant"
          targetId={restaurant.id}
          baseRating={restaurant.rating}
          reviewsCount={restaurant.reviewsCount}
        />
      </div>

      <ContactModal
        open={contactOpen}
        onClose={() => setContactOpen(false)}
        title={restaurant.name}
        subtitle={restaurant.priceRange}
        contact={restaurant.contact}
        image={restaurant.image}
      />
    </article>
  );
}
