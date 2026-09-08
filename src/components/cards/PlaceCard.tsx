import { Clock, IndianRupee, CalendarDays, Timer, MapPin, Sparkles } from 'lucide-react';
import type { Place } from '@/types';
import { Rating } from '@/components/ui/Rating';
import { SaveButton } from '@/components/ui/SaveButton';
import { Reviews } from '@/components/ui/Reviews';
import { useRouter } from '@/router/Router';

export function PlaceCard({ place, index = 0 }: { place: Place; index?: number }) {
  const { navigate } = useRouter();
  return (
    <article
      className="card group flex flex-col animate-fade-up"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="relative h-52 overflow-hidden">
        <img
          src={place.image}
          alt={place.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-900/60 via-transparent to-transparent" />
        <div className="absolute left-3 top-3 flex gap-2">
          <span className="chip bg-white/90 text-navy-700 backdrop-blur">
            {place.category}
          </span>
          {place.isHiddenGem && (
            <span className="chip bg-sand-500 text-white">
              <Sparkles size={12} /> Hidden Gem
            </span>
          )}
        </div>
        <div className="absolute right-3 top-3">
          <SaveButton
            item={{
              itemType: 'place', itemId: place.id, name: place.name,
              image: place.image, category: place.category, location: place.location,
            }}
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-bold text-navy-900">{place.name}</h3>
        <p className="mt-1 flex items-start gap-1.5 text-xs text-navy-500">
          <MapPin size={14} className="mt-0.5 shrink-0 text-ocean-500" /> {place.location}
        </p>
        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-navy-600">{place.description}</p>

        <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-navy-600">
          <Info icon={Clock} label={`${place.openingTime} – ${place.closingTime}`} />
          <Info icon={IndianRupee} label={place.entryFee} />
          <Info icon={CalendarDays} label={place.bestTimeToVisit} />
          <Info icon={Timer} label={place.visitDuration} />
        </div>

        <div className="mt-4 flex items-center justify-between">
          <Rating value={place.rating} count={place.reviewsCount} />
          <button
            onClick={() => navigate({ name: 'map', destinationId: place.destinationId })}
            className="text-xs font-bold text-ocean-600 hover:text-ocean-700"
          >
            View on map →
          </button>
        </div>

        <Reviews
          targetType="place"
          targetId={place.id}
          baseRating={place.rating}
          reviewsCount={place.reviewsCount}
        />
      </div>
    </article>
  );
}

function Info({ icon: Icon, label }: { icon: typeof Clock; label: string }) {
  return (
    <div className="flex items-center gap-1.5 rounded-xl bg-navy-50 px-2.5 py-1.5">
      <Icon size={13} className="shrink-0 text-ocean-500" />
      <span className="truncate font-medium">{label}</span>
    </div>
  );
}
