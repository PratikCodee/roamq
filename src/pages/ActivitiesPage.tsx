import { useMemo, useState } from 'react';
import { Mountain } from 'lucide-react';
import { activities, providers, activityCategories } from '@/data/sampleData';
import { ActivityCard } from '@/components/cards/ActivityCard';
import { ProviderCard } from '@/components/cards/ProviderCard';
import { FilterBar } from '@/components/ui/FilterBar';
import { EmptyState } from '@/components/ui/States';

export function ActivitiesPage({ destinationId, initialQuery }: { destinationId: string; initialQuery?: string }) {
  const [search, setSearch] = useState(initialQuery ?? '');
  const [category, setCategory] = useState('All');
  const [view, setView] = useState<'activities' | 'providers'>('providers');

  const filteredActivities = useMemo(() => {
    let pool = activities.filter((a) => a.destinationId === destinationId);
    if (category !== 'All') pool = pool.filter((a) => a.category === category);
    if (search.trim()) {
      const q = search.toLowerCase();
      pool = pool.filter((a) => a.name.toLowerCase().includes(q) || a.description.toLowerCase().includes(q));
    }
    return pool;
  }, [destinationId, category, search]);

  const filteredProviders = useMemo(() => {
    let pool = providers.filter((p) => p.destinationId === destinationId);
    if (category !== 'All') pool = pool.filter((p) => p.activityCategory === category);
    if (search.trim()) {
      const q = search.toLowerCase();
      pool = pool.filter(
        (p) => p.businessName.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.activitiesOffered.join(' ').toLowerCase().includes(q),
      );
    }
    return pool.sort((a, b) => b.rating - a.rating);
  }, [destinationId, category, search]);

  return (
    <div className="container-page py-10">
      <header className="mb-8">
        <p className="section-eyebrow">Ratnagiri</p>
        <h1 className="section-title mt-1">Activities & local providers</h1>
        <p className="mt-2 max-w-2xl text-navy-500">
          Browse activities, then compare verified local providers by rating, price and group capacity. Book directly with the provider you like best.
        </p>
      </header>

      <div className="mb-5 inline-flex rounded-full bg-navy-100 p-1">
        <button
          onClick={() => setView('providers')}
          className={`rounded-full px-5 py-2 text-sm font-semibold transition ${view === 'providers' ? 'bg-white text-navy-900 shadow-soft' : 'text-navy-500'}`}
        >
          Compare providers
        </button>
        <button
          onClick={() => setView('activities')}
          className={`rounded-full px-5 py-2 text-sm font-semibold transition ${view === 'activities' ? 'bg-white text-navy-900 shadow-soft' : 'text-navy-500'}`}
        >
          Browse activities
        </button>
      </div>

      <FilterBar
        search={search}
        onSearch={setSearch}
        searchPlaceholder={view === 'providers' ? 'Search providers…' : 'Search activities…'}
        categories={[...activityCategories]}
        activeCategory={category}
        onCategory={setCategory}
      />

      {view === 'providers' ? (
        <>
          <p className="mt-4 text-sm text-navy-500">
            Showing <span className="font-semibold text-navy-800">{filteredProviders.length}</span> {filteredProviders.length === 1 ? 'provider' : 'providers'}
          </p>
          {filteredProviders.length === 0 ? (
            <div className="mt-6"><EmptyState title="No providers match your filters" message="Try a different activity category." icon={<Mountain size={28} />} /></div>
          ) : (
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProviders.map((p, i) => <ProviderCard key={p.id} provider={p} index={i} />)}
            </div>
          )}
        </>
      ) : (
        <>
          <p className="mt-4 text-sm text-navy-500">
            Showing <span className="font-semibold text-navy-800">{filteredActivities.length}</span> {filteredActivities.length === 1 ? 'activity' : 'activities'}
          </p>
          {filteredActivities.length === 0 ? (
            <div className="mt-6"><EmptyState title="No activities match your filters" message="Try a different category." icon={<Mountain size={28} />} /></div>
          ) : (
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {filteredActivities.map((a, i) => <ActivityCard key={a.id} activity={a} index={i} />)}
            </div>
          )}
        </>
      )}
    </div>
  );
}
