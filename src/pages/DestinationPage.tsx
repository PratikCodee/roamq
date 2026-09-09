import { useState } from 'react';
import {
  MapPin, Sparkles, ArrowRight, Calendar, Star, Quote, ChevronRight, CloudRain, Sun, Flame, Plus, Pencil, Trash2,
} from 'lucide-react';
import { useRouter } from '@/router/Router';
import { destinations, ratnagiriDestination, hotels, restaurants, activities, providers, reviews } from '@/data/sampleData';
import { PlaceCard } from '@/components/cards/PlaceCard';
import { SeasonalPlaceCard } from '@/components/cards/SeasonalPlaceCard';
import { VideoModal } from '@/components/ui/VideoModal';
import { HotelCard } from '@/components/cards/HotelCard';
import { RestaurantCard } from '@/components/cards/RestaurantCard';
import { ActivityCard } from '@/components/cards/ActivityCard';
import { ProviderCard } from '@/components/cards/ProviderCard';
import { SectionHeading } from '@/components/ui/States';
import { MapView } from '@/components/map/MapView';
import { getCurrentSeason } from '@/lib/itineraryEngine';
import { useAppData } from '@/context/AppDataContext';
import { useAuth } from '@/context/AuthContext';
import { PlaceEditor } from '@/components/admin/PlaceEditor';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { showToast } from '@/components/ui/Toast';
import type { AppPlace } from '@/store/types';
import type { Place } from '@/types';

type SeasonType = 'monsoon' | 'winter' | 'summer';

const SEASON_TABS: { id: SeasonType; label: string; emoji: string; desc: string; color: string }[] = [
  { id: 'monsoon', label: 'Monsoon', emoji: '🌧️', desc: 'Roaring Waterfalls & Misty Sahyadris', color: 'bg-blue-600 text-white' },
  { id: 'winter',  label: 'Winter',  emoji: '☀️', desc: 'Golden Beaches & Sunsets', color: 'bg-amber-600 text-white' },
  { id: 'summer',  label: 'Summer',  emoji: '🥭', desc: 'Alphonso Orchards & Coastal Breeze', color: 'bg-orange-600 text-white' },
];

export function DestinationPage({ destinationId }: { destinationId: string }) {
  const { navigate } = useRouter();
  const { places, editPlace, removePlace } = useAppData();
  const { isAdmin } = useAuth();

  const [activeSeason, setActiveSeason] = useState<SeasonType>(() => {
    const s = getCurrentSeason();
    return s === 'year-round' ? 'monsoon' : (s as SeasonType);
  });
  const [videoModalPlace, setVideoModalPlace] = useState<Place | null>(null);
  const [editingPlace, setEditingPlace] = useState<AppPlace | null | 'new'>(null);
  const [deletingPlaceId, setDeletingPlaceId] = useState<string | null>(null);

  const targetDestId = destinationId || 'dest-ratnagiri';
  const dest = destinations.find((destination) => destination.id === targetDestId) ?? ratnagiriDestination;
  const destPlaces = places.filter((p) => p.destinationId === targetDestId);
  const allAvailablePlaces = destPlaces.length > 0 ? destPlaces : places;
  
  const featured = allAvailablePlaces.filter((p) => !p.isHiddenGem).slice(0, 3);
  const hidden = allAvailablePlaces.filter((p) => p.isHiddenGem).slice(0, 2);

  // Filter seasonal places safely - prioritize places explicitly marked for featuredInSeasons by Admin
  const featuredForSeason = allAvailablePlaces.filter(
    (p) => p.featuredInSeasons && Array.isArray(p.featuredInSeasons) && p.featuredInSeasons.includes(activeSeason)
  );

  // Secondary seasonal places (matching activeSeason in seasons, excluding places explicitly featured for OTHER seasons)
  const secondarySeasonal = allAvailablePlaces.filter((p) => {
    if (featuredForSeason.some((fp) => fp.id === p.id)) return false;

    // If admin explicitly set featuredInSeasons for this place, and activeSeason is NOT in it, skip it
    if (p.featuredInSeasons && Array.isArray(p.featuredInSeasons) && p.featuredInSeasons.length > 0) {
      if (!p.featuredInSeasons.includes(activeSeason)) return false;
    }

    if (!p.seasons || !Array.isArray(p.seasons) || p.seasons.length === 0) return true;
    return p.seasons.includes(activeSeason);
  });

  // Remaining places pool (only if fewer than 3 items available)
  const remainingPlaces = allAvailablePlaces.filter((p) => {
    if (featuredForSeason.some((fp) => fp.id === p.id)) return false;
    if (secondarySeasonal.some((sp) => sp.id === p.id)) return false;
    if (p.featuredInSeasons && Array.isArray(p.featuredInSeasons) && p.featuredInSeasons.length > 0) {
      if (!p.featuredInSeasons.includes(activeSeason)) return false;
    }
    return true;
  });

  // Combine: Admin selections FIRST, followed by general seasonal places, then fallbacks
  const combinedSeasonal = [...featuredForSeason, ...secondarySeasonal, ...remainingPlaces];

  // If admin selected 4+ featured places, show all featured (up to 6), otherwise fill at least 3 cards
  const targetCount = Math.max(3, featuredForSeason.length);
  const seasonalPlaces = combinedSeasonal.slice(0, Math.min(targetCount, 6));

  const activeTabMeta = SEASON_TABS.find((t) => t.id === activeSeason) ?? SEASON_TABS[0];
  const destHotels = hotels.filter((h) => h.destinationId === destinationId).slice(0, 3);
  const destRestos = restaurants.filter((r) => r.destinationId === destinationId).slice(0, 3);
  const destActivities = activities.filter((a) => a.destinationId === destinationId).slice(0, 4);
  const destProviders = providers.filter((p) => p.destinationId === destinationId).slice(0, 3);
  const featuredReviews = reviews.slice(0, 3);

  const handleRemoveFromSeason = (placeId: string, season: SeasonType) => {
    const target = places.find((p) => p.id === placeId);
    if (!target) return;
    const updated = (target.featuredInSeasons ?? []).filter((s) => s !== season);
    editPlace(target.id, { featuredInSeasons: updated });
    showToast(`Removed "${target.name}" from ${season} recommendations.`, 'info');
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative">
        <div className="absolute inset-0 h-[70vh]">
          <img src={dest.heroImage} alt={dest.name} fetchpriority="high" decoding="sync" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-navy-900/60 via-navy-900/40 to-navy-50" />
        </div>
        <div className="container-page relative flex min-h-[70vh] flex-col justify-end pb-12 pt-28">
          <div className="max-w-2xl">
            <span className="chip bg-white/15 text-white backdrop-blur">
              <MapPin size={12} /> {dest.state}, {dest.country}
            </span>
            <h1 className="mt-4 font-display text-4xl font-extrabold text-white sm:text-6xl text-balance">
              {dest.name}
            </h1>
            <p className="mt-3 text-lg text-white/85">{dest.tagline}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button onClick={() => navigate({ name: 'planner', destinationId })} className="btn-accent">
                <Sparkles size={18} /> Plan My Trip with AI
              </button>
              <button onClick={() => navigate({ name: 'places', destinationId })} className="btn bg-white/90 px-5 py-3 text-navy-800 hover:bg-white">
                Explore places <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Overview */}
      <section className="container-page py-14">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <p className="section-eyebrow">About Ratnagiri</p>
            <h2 className="section-title mt-1">A coastal gem of the Konkan</h2>
            <p className="mt-4 text-lg leading-relaxed text-navy-600">{dest.overview}</p>
            <div className="mt-6 grid gap-2 sm:grid-cols-2">
              {dest.highlights.map((h) => (
                <div key={h} className="flex items-start gap-2 text-sm text-navy-700">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-ocean-500" /> {h}
                </div>
              ))}
            </div>
          </div>
          <div className="card p-6">
            <h3 className="text-sm font-bold uppercase tracking-wide text-navy-500">Quick facts</h3>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-navy-500">Best time to visit</dt>
                <dd className="flex items-center gap-1.5 font-semibold text-navy-800">
                  <Calendar size={14} className="text-ocean-500" /> Oct–Mar
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-navy-500">Average rating</dt>
                <dd className="flex items-center gap-1.5 font-semibold text-navy-800">
                  <Star size={14} className="fill-sand-400 text-sand-400" /> 4.6 / 5
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-navy-500">Places listed</dt>
                <dd className="font-semibold text-navy-800">{destPlaces.length}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-navy-500">Activity providers</dt>
                <dd className="font-semibold text-navy-800">{providers.length}</dd>
              </div>
            </dl>
            <div className="mt-5 rounded-2xl bg-sand-50 p-4 text-sm text-sand-800">
              <p className="font-semibold">Mango season: April–June</p>
              <p className="mt-1 text-sand-700">Visit orchards for fresh Alphonso mangoes straight from the tree.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── SEASONAL RECOMMENDATIONS SECTION ── */}
      <section className="container-page py-10 my-4 rounded-4xl bg-gradient-to-br from-navy-900 via-ocean-950 to-navy-950 p-6 sm:p-10 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 blur-2xl pointer-events-none w-96 h-96 bg-ocean-400 rounded-full" />
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
          <div>
            <span className="chip bg-ocean-500/20 text-ocean-300 border border-ocean-400/30 backdrop-blur text-xs uppercase tracking-wider font-bold">
              🌦️ Seasonal Smart Recommendations
            </span>
            <h2 className="mt-3 font-display text-2xl sm:text-4xl font-extrabold text-white">
              Must Experience This {activeTabMeta.label} {activeTabMeta.emoji}
            </h2>
            <p className="mt-2 text-sm sm:text-base text-white/70 max-w-xl">
              {activeTabMeta.desc}. Tailored live recommendations with video previews and instant trip planning.
            </p>
          </div>

          {/* Season Switcher Tabs */}
          <div className="flex bg-white/10 p-1.5 rounded-2xl backdrop-blur border border-white/10 shrink-0">
            {SEASON_TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveSeason(t.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeSeason === t.id
                    ? `${t.color} shadow-md scale-[1.02]`
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>{t.emoji}</span> {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Seasonal Cards Grid */}
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 relative z-10">
          {seasonalPlaces.map((p, i) => (
            <SeasonalPlaceCard
              key={p.id}
              place={p}
              seasonLabel={`${activeTabMeta.label} Highlight`}
              seasonEmoji={activeTabMeta.emoji}
              onOpenVideo={(placeToPreview) => setVideoModalPlace(placeToPreview)}
              onEditPlace={(placeToEdit) => {
                const full = places.find((fp) => fp.id === placeToEdit.id);
                if (full) setEditingPlace(full);
              }}
              onRemoveFromSeason={(placeToRemove) => handleRemoveFromSeason(placeToRemove.id, activeSeason)}
              onDeletePlace={(placeToDelete) => setDeletingPlaceId(placeToDelete.id)}
              index={i}
            />
          ))}
        </div>
      </section>

      {/* Featured places */}
      <section className="container-page py-8">
        <SectionHeading
          eyebrow="Must visit"
          title="Featured places"
          subtitle="The most-loved spots in Ratnagiri, from sea forts to golden beaches."
          action={<SeeAllButton onClick={() => navigate({ name: 'places', destinationId })} />}
        />
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((p, i) => <PlaceCard key={p.id} place={p} index={i} />)}
        </div>
      </section>

      {/* Hidden gems */}
      <section className="container-page py-8">
        <SectionHeading
          eyebrow="Off the beaten path"
          title="Hidden gems"
          subtitle="Secluded coves, jungle temples and quiet villages most tourists never reach."
          action={<SeeAllButton onClick={() => navigate({ name: 'places', destinationId })} />}
        />
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {hidden.map((p, i) => <PlaceCard key={p.id} place={p} index={i} />)}
        </div>
      </section>

      {/* Hotels */}
      <section className="container-page py-8">
        <SectionHeading
          eyebrow="Where to stay"
          title="Hotels & stays"
          subtitle="Beachfront resorts, mango-grove homestays and hill retreats."
          action={<SeeAllButton onClick={() => navigate({ name: 'hotels', destinationId })} />}
        />
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {destHotels.map((h, i) => <HotelCard key={h.id} hotel={h} index={i} />)}
        </div>
      </section>

      {/* Food */}
      <section className="container-page py-8">
        <SectionHeading
          eyebrow="Taste of Konkan"
          title="Local food & restaurants"
          subtitle="Fresh seafood, kombdi vade, solkadhi and the famous Alphonso mango."
          action={<SeeAllButton onClick={() => navigate({ name: 'food', destinationId })} />}
        />
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {destRestos.map((r, i) => <RestaurantCard key={r.id} restaurant={r} index={i} />)}
        </div>
      </section>

      {/* Activities */}
      <section className="container-page py-8">
        <SectionHeading
          eyebrow="Things to do"
          title="Activities & experiences"
          subtitle="Trekking, water sports, scuba, cooking classes and photography walks."
          action={<SeeAllButton onClick={() => navigate({ name: 'activities', destinationId })} />}
        />
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {destActivities.map((a, i) => <ActivityCard key={a.id} activity={a} index={i} />)}
        </div>
      </section>

      {/* Providers */}
      <section className="container-page py-8">
        <SectionHeading
          eyebrow="Meet the locals"
          title="Local experience providers"
          subtitle="Compare verified local operators for every activity — pick by rating, price and group size."
          action={<SeeAllButton onClick={() => navigate({ name: 'activities', destinationId })} />}
        />
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {destProviders.map((p, i) => <ProviderCard key={p.id} provider={p} index={i} />)}
        </div>
      </section>

      {/* Map */}
      <section className="container-page py-8">
        <SectionHeading
          eyebrow="Find your way"
          title="Interactive map"
          subtitle="All places, hotels, restaurants and activities plotted across Ratnagiri."
          action={<SeeAllButton onClick={() => navigate({ name: 'map', destinationId })} />}
        />
        <div className="mt-8">
          <MapView
            center={{ lat: dest.lat, lng: dest.lng }}
            places={destPlaces}
            hotels={hotels.filter((h) => h.destinationId === destinationId)}
            restaurants={restaurants.filter((r) => r.destinationId === destinationId)}
            activities={activities.filter((a) => a.destinationId === destinationId)}
            providers={providers.filter((p) => p.destinationId === destinationId)}
            destinationId={destinationId}
            onNavigate={navigate}
          />
        </div>
      </section>

      {/* Reviews */}
      <section className="container-page py-8">
        <SectionHeading eyebrow="What travellers say" title="Recent reviews" />
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featuredReviews.map((rev) => (
            <div key={rev.id} className="card p-6">
              <Quote size={24} className="text-ocean-200" />
              <p className="mt-3 text-sm leading-relaxed text-navy-700">{rev.body}</p>
              <div className="mt-4 flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-full bg-ocean-100 text-xs font-bold text-ocean-700">
                  {rev.author.split(' ').map((p) => p[0]).join('')}
                </div>
                <div>
                  <p className="text-sm font-semibold text-navy-800">{rev.author}</p>
                  <p className="text-xs text-navy-400">{rev.title}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container-page py-12">
        <div className="relative overflow-hidden rounded-4xl bg-gradient-to-br from-ocean-600 to-ocean-800 p-10 text-center text-white sm:p-16">
          <Sparkles size={28} className="mx-auto" />
          <h2 className="mt-3 text-3xl font-bold">Ready to plan your trip?</h2>
          <p className="mx-auto mt-2 max-w-lg text-white/85">
            Generate a personalized day-by-day itinerary for Ratnagiri in under a minute.
          </p>
          <button onClick={() => navigate({ name: 'planner', destinationId })} className="btn mt-6 bg-white px-6 py-3 text-ocean-700 hover:bg-navy-50">
            <Sparkles size={18} /> Plan My Trip with AI
          </button>
        </div>
      </section>

      {/* Video Preview Modal Lightbox */}
      <VideoModal place={videoModalPlace} onClose={() => setVideoModalPlace(null)} />

      {/* Admin Place Editor Modal */}
      {editingPlace && (
        <PlaceEditor
          place={editingPlace === 'new' ? undefined : editingPlace}
          onClose={() => setEditingPlace(null)}
        />
      )}

      {/* Admin Delete Place Confirm Dialog */}
      {deletingPlaceId && (
        <ConfirmDialog
          title="Delete Place?"
          message="This will permanently remove this place from the platform. This action cannot be undone."
          confirmLabel="Delete"
          danger
          onConfirm={() => {
            try {
              removePlace(deletingPlaceId);
              showToast('Place deleted successfully.', 'info');
            } catch (err) {
              showToast(err instanceof Error ? err.message : 'Delete failed', 'error');
            }
            setDeletingPlaceId(null);
          }}
          onCancel={() => setDeletingPlaceId(null)}
        />
      )}
    </div>
  );
}

function SeeAllButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex items-center gap-1 text-sm font-bold text-ocean-600 hover:text-ocean-700">
      See all <ChevronRight size={16} />
    </button>
  );
}
