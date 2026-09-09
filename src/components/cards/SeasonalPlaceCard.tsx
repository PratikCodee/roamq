import { Play, MapPin, Sparkles, Clock, Video, Pencil, Trash2, XCircle } from 'lucide-react';
import type { Place } from '@/types';
import { Rating } from '@/components/ui/Rating';
import { SaveButton } from '@/components/ui/SaveButton';
import { useRouter } from '@/router/Router';
import { useAuth } from '@/context/AuthContext';

interface SeasonalPlaceCardProps {
  place: Place;
  seasonLabel?: string;
  seasonEmoji?: string;
  onOpenVideo: (place: Place) => void;
  onEditPlace?: (place: Place) => void;
  onRemoveFromSeason?: (place: Place) => void;
  onDeletePlace?: (place: Place) => void;
  index?: number;
}

export function SeasonalPlaceCard({
  place,
  seasonLabel = 'Monsoon Special',
  seasonEmoji = '🌧️',
  onOpenVideo,
  onEditPlace,
  onRemoveFromSeason,
  onDeletePlace,
  index = 0,
}: SeasonalPlaceCardProps) {
  const { navigate } = useRouter();
  const { isAdmin } = useAuth();

  return (
    <article
      className="card group flex flex-col overflow-hidden border-2 border-ocean-100/70 hover:border-ocean-300 transition-all duration-300 animate-fade-up shadow-card relative"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Media Preview Header */}
      <div className="relative h-56 w-full overflow-hidden bg-navy-900">
        <img
          src={place.image}
          alt={place.name}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-navy-900/20 to-transparent" />

        {/* Season & Category Chips */}
        <div className="absolute left-3 top-3 flex flex-wrap gap-2 z-10">
          <span className="chip bg-ocean-600 text-white font-bold text-xs shadow-md">
            {seasonEmoji} {seasonLabel}
          </span>
          <span className="chip bg-white/90 text-navy-800 backdrop-blur text-xs">
            {place.category}
          </span>
        </div>

        {/* Save Bookmark Button */}
        <div className="absolute right-3 top-3 z-10">
          <SaveButton
            item={{
              itemType: 'place',
              itemId: place.id,
              name: place.name,
              image: place.image,
              category: place.category,
              location: place.location,
            }}
          />
        </div>

        {/* Play Video Overlay Trigger */}
        <button
          onClick={() => onOpenVideo(place)}
          className="absolute inset-0 m-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/30 text-white backdrop-blur-md transition-all duration-300 group-hover:scale-110 group-hover:bg-ocean-600 shadow-xl"
          aria-label="Play video preview"
        >
          <Play size={24} className="ml-1 fill-white text-white" />
        </button>

        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white/90 text-xs font-semibold z-10">
          <button
            onClick={() => onOpenVideo(place)}
            className="flex items-center gap-1 bg-black/50 hover:bg-ocean-600 px-2.5 py-1 rounded-full backdrop-blur transition text-white"
          >
            <Video size={12} className="text-sand-400" /> Watch Video 🎥
          </button>
          <span className="flex items-center gap-1 bg-black/40 px-2.5 py-1 rounded-full backdrop-blur">
            <Clock size={12} /> {place.visitDuration}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-lg font-bold text-navy-900 group-hover:text-ocean-600 transition-colors">
              {place.name}
            </h3>
            <p className="mt-1 flex items-center gap-1 text-xs text-navy-500 font-medium">
              <MapPin size={13} className="text-ocean-500" /> {place.location}
            </p>
          </div>
        </div>

        {/* Seasonal Highlight Feature Box */}
        <div className="mt-3 rounded-2xl bg-ocean-50/80 border border-ocean-100 p-3 text-xs text-ocean-900">
          <p className="font-bold flex items-center gap-1 text-ocean-700">
            <Sparkles size={13} className="text-sand-500" /> Why Visit Now:
          </p>
          <p className="mt-0.5 text-navy-700 leading-snug line-clamp-2">
            {place.seasonalHighlight || `Featured ${seasonLabel.toLowerCase()} destination in ${place.location} — perfect for seasonal travel.`}
          </p>
        </div>

        <p className="mt-3 text-xs leading-relaxed text-navy-600 line-clamp-2">
          {place.description}
        </p>

        {/* Rating & User Actions Footer */}
        <div className="mt-5 pt-4 border-t border-navy-100 flex items-center justify-between">
          <Rating value={place.rating} count={place.reviewsCount} />
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate({ name: 'map', destinationId: place.destinationId })}
              className="text-xs font-bold text-navy-600 hover:text-ocean-600 px-2 py-1 rounded-lg hover:bg-navy-50 transition"
            >
              Map 📍
            </button>
            <button
              onClick={() => navigate({ name: 'planner', destinationId: place.destinationId })}
              className="btn-primary text-xs py-1.5 px-3"
            >
              <Sparkles size={12} /> Add to Trip
            </button>
          </div>
        </div>

        {/* ── ADMIN-ONLY CONTROLS (ONLY rendered for logged-in Admin) ── */}
        {isAdmin && (
          <div className="mt-4 pt-3 border-t border-navy-100 bg-navy-50/80 -mx-5 -mb-5 p-3 flex items-center justify-between gap-1 rounded-b-2xl">
            <span className="text-[10px] uppercase tracking-wider font-bold text-navy-400 px-1">
              Admin Actions
            </span>
            <div className="flex items-center gap-1">
              {onEditPlace && (
                <button
                  onClick={() => onEditPlace(place)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-navy-200 text-[11px] font-bold text-navy-700 hover:bg-navy-100 transition shadow-2xs"
                  title="Edit Place, Video & Seasonal Details"
                >
                  <Pencil size={11} className="text-ocean-600" /> Edit
                </button>
              )}
              {onRemoveFromSeason && (
                <button
                  onClick={() => onRemoveFromSeason(place)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-amber-200 text-[11px] font-bold text-amber-700 hover:bg-amber-50 transition shadow-2xs"
                  title="Remove from current season recommendations"
                >
                  <XCircle size={11} className="text-amber-600" /> Remove Season
                </button>
              )}
              {onDeletePlace && (
                <button
                  onClick={() => onDeletePlace(place)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-error-50 border border-error-200 text-[11px] font-bold text-error-600 hover:bg-error-100 transition shadow-2xs"
                  title="Delete Place permanently"
                >
                  <Trash2 size={11} /> Delete
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
