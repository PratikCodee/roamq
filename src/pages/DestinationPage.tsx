import {
  MapPin, Sparkles, ArrowRight, Calendar, Star, Quote, ChevronRight,
} from 'lucide-react';
import { useRouter } from '@/router/Router';
import { destinations, ratnagiriDestination, places, hotels, restaurants, activities, providers, reviews } from '@/data/sampleData';
import { PlaceCard } from '@/components/cards/PlaceCard';
import { HotelCard } from '@/components/cards/HotelCard';
import { RestaurantCard } from '@/components/cards/RestaurantCard';
import { ActivityCard } from '@/components/cards/ActivityCard';
import { ProviderCard } from '@/components/cards/ProviderCard';
import { SectionHeading } from '@/components/ui/States';
import { MapView } from '@/components/map/MapView';

export function DestinationPage({ destinationId }: { destinationId: string }) {
  const { navigate } = useRouter();
  const dest = destinations.find((destination) => destination.id === destinationId) ?? ratnagiriDestination;
  const destPlaces = places.filter((p) => p.destinationId === destinationId);
  const featured = destPlaces.filter((p) => !p.isHiddenGem).slice(0, 3);
  const hidden = destPlaces.filter((p) => p.isHiddenGem).slice(0, 2);
  const destHotels = hotels.filter((h) => h.destinationId === destinationId).slice(0, 3);
  const destRestos = restaurants.filter((r) => r.destinationId === destinationId).slice(0, 3);
  const destActivities = activities.filter((a) => a.destinationId === destinationId).slice(0, 4);
  const destProviders = providers.filter((p) => p.destinationId === destinationId).slice(0, 3);
  const featuredReviews = reviews.slice(0, 3);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative">
        <div className="absolute inset-0 h-[70vh]">
          <img src={dest.heroImage} alt={dest.name} className="h-full w-full object-cover" />
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
