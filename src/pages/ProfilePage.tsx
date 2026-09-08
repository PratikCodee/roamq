import { useState } from 'react';
import { Bookmark, MapPin, Hotel, Mountain, UtensilsCrossed, Sparkles, Trash2, Calendar, Users, IndianRupee, Compass } from 'lucide-react';
import { useRouter } from '@/router/Router';
import { useSavedItemsContext } from '@/hooks/useSavedItemsContext';
import { useSavedTrips } from '@/hooks/useSaved';
import { EmptyState, LoadingState } from '@/components/ui/States';
import type { SavedItem } from '@/types';

const typeIcon: Record<SavedItem['itemType'], typeof MapPin> = {
  place: MapPin, hotel: Hotel, activity: Mountain, provider: Sparkles, restaurant: UtensilsCrossed,
};
const typeColor: Record<SavedItem['itemType'], string> = {
  place: 'bg-ocean-100 text-ocean-700',
  hotel: 'bg-sand-100 text-sand-700',
  activity: 'bg-navy-100 text-navy-700',
  provider: 'bg-success-100 text-success-700',
  restaurant: 'bg-error-100 text-error-700',
};
const typeLabel: Record<SavedItem['itemType'], string> = {
  place: 'Place', hotel: 'Hotel', activity: 'Activity', provider: 'Provider', restaurant: 'Restaurant',
};

export function ProfilePage() {
  const { navigate } = useRouter();
  const { items, loading, removeByItemId } = useSavedItemsContext();
  const { trips, deleteTrip } = useSavedTrips();
  const [tab, setTab] = useState<'saved' | 'trips'>('saved');

  return (
    <div className="container-page py-10">
      <header className="mb-8">
        <p className="section-eyebrow">Your RoamIQ</p>
        <h1 className="section-title mt-1">Saved & planned trips</h1>
        <p className="mt-2 max-w-2xl text-navy-500">
          Everything you bookmark and every itinerary you generate lives here. Saved items persist across reloads.
        </p>
      </header>

      <div className="mb-6 inline-flex rounded-full bg-navy-100 p-1">
        <button
          onClick={() => setTab('saved')}
          className={`rounded-full px-5 py-2 text-sm font-semibold transition ${tab === 'saved' ? 'bg-white text-navy-900 shadow-soft' : 'text-navy-500'}`}
        >
          Saved items ({items.length})
        </button>
        <button
          onClick={() => setTab('trips')}
          className={`rounded-full px-5 py-2 text-sm font-semibold transition ${tab === 'trips' ? 'bg-white text-navy-900 shadow-soft' : 'text-navy-500'}`}
        >
          Planned trips ({trips.length})
        </button>
      </div>

      {tab === 'saved' && (
        loading ? <LoadingState label="Loading your saved items…" /> :
        items.length === 0 ? (
          <EmptyState
            title="No saved items yet"
            message="Tap the bookmark icon on any place, hotel, activity or provider to save it here."
            icon={<Bookmark size={28} />}
            action={
              <button onClick={() => navigate({ name: 'destination', destinationId: 'dest-ratnagiri' })} className="btn-primary">
                <Compass size={16} /> Explore Ratnagiri
              </button>
            }
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item, i) => {
              const Icon = typeIcon[item.itemType];
              return (
                <article key={item.id} className="card flex animate-fade-up" style={{ animationDelay: `${i * 50}ms` }}>
                  <div className="relative w-28 shrink-0 overflow-hidden">
                    <img src={item.image} alt={item.name} loading="lazy" className="h-full w-full object-cover" />
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <div className="flex items-start justify-between gap-2">
                      <span className={`chip ${typeColor[item.itemType]}`}>
                        <Icon size={11} /> {typeLabel[item.itemType]}
                      </span>
                      <button
                        onClick={() => void removeByItemId(item.itemId)}
                        className="text-navy-400 hover:text-error-500"
                        aria-label="Remove"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                    <h3 className="mt-2 font-bold text-navy-900">{item.name}</h3>
                    <p className="mt-0.5 text-xs text-navy-500">{item.category}</p>
                    <p className="mt-1 flex items-start gap-1 text-xs text-navy-400">
                      <MapPin size={12} className="mt-0.5 shrink-0" /> {item.location}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        )
      )}

      {tab === 'trips' && (
        trips.length === 0 ? (
          <EmptyState
            title="No planned trips yet"
            message="Generate a personalized itinerary with the AI Trip Planner and save it here."
            icon={<Sparkles size={28} />}
            action={
              <button onClick={() => navigate({ name: 'planner', destinationId: 'dest-ratnagiri' })} className="btn-primary">
                <Sparkles size={16} /> Plan a trip
              </button>
            }
          />
        ) : (
          <div className="space-y-4">
            {trips.map((t) => (
              <div key={t.id} className="card p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-navy-900">{t.title}</h3>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                      <span className="chip bg-navy-50 text-navy-600"><Calendar size={11} /> {t.preferences.days} days</span>
                      <span className="chip bg-navy-50 text-navy-600"><Users size={11} /> {t.preferences.travelers} travelers</span>
                      <span className="chip bg-navy-50 text-navy-600"><IndianRupee size={11} /> ₹{Number(t.totalCost).toLocaleString('en-IN')}</span>
                      <span className="chip bg-navy-50 text-navy-600">{t.preferences.transport}</span>
                    </div>
                    <p className="mt-2 text-xs text-navy-400">
                      Interests: {t.preferences.interests.join(', ') || '—'} · Activities: {t.preferences.activities.join(', ') || '—'}
                    </p>
                  </div>
                  <button onClick={() => deleteTrip(t.id)} className="grid h-9 w-9 place-items-center rounded-full bg-error-50 text-error-600 hover:bg-error-100">
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  {t.days.map((d) => (
                    <div key={d.day} className="rounded-2xl border border-navy-100 p-3">
                      <p className="text-xs font-bold text-ocean-600">Day {d.day}</p>
                      <p className="text-xs text-navy-500">{d.theme}</p>
                      <p className="mt-1 text-xs text-navy-400">{d.items.length} stops · ₹{d.estimatedCost.toLocaleString('en-IN')}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
