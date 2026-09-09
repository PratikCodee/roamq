import { useMemo, useState } from 'react';
import { MapPin, Sparkles } from 'lucide-react';
import { useAppData } from '@/context/AppDataContext';
import { PlaceCard } from '@/components/cards/PlaceCard';
import { FilterBar } from '@/components/ui/FilterBar';
import { EmptyState } from '@/components/ui/States';

export function PlacesPage({ destinationId, initialQuery }: { destinationId: string; initialQuery?: string }) {
  const { places, categories } = useAppData();
  const [search, setSearch] = useState(initialQuery ?? '');
  const [category, setCategory] = useState('All');
  const [hiddenOnly, setHiddenOnly] = useState(false);

  const categoryNames = useMemo(() => categories.map((c) => c.name), [categories]);

  const filtered = useMemo(() => {
    let pool = places.filter((p) => p.destinationId === destinationId);
    if (category !== 'All') pool = pool.filter((p) => p.category === category);
    if (hiddenOnly) pool = pool.filter((p) => p.isHiddenGem);
    if (search.trim()) {
      const q = search.toLowerCase();
      pool = pool.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q),
      );
    }
    return pool;
  }, [destinationId, category, hiddenOnly, search]);

  return (
    <div className="container-page py-10">
      <header className="mb-8">
        <p className="section-eyebrow">Ratnagiri</p>
        <h1 className="section-title mt-1">Places to explore</h1>
        <p className="mt-2 max-w-2xl text-navy-500">
          Beaches, forts, temples, viewpoints and hidden gems across Ratnagiri. Filter by category or search by name.
        </p>
      </header>

      <FilterBar
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Search places…"
        categories={categoryNames}
        activeCategory={category}
        onCategory={setCategory}
      >
        <button
          onClick={() => setHiddenOnly((v) => !v)}
          className={`btn text-sm ${hiddenOnly ? 'bg-sand-500 text-white' : 'bg-white text-navy-600 border border-navy-200'}`}
        >
          <Sparkles size={15} /> Hidden gems only
        </button>
      </FilterBar>

      <p className="mt-4 text-sm text-navy-500">
        Showing <span className="font-semibold text-navy-800">{filtered.length}</span> {filtered.length === 1 ? 'place' : 'places'}
      </p>

      {filtered.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="No places match your filters"
            message="Try clearing the search or switching categories."
            icon={<MapPin size={28} />}
          />
        </div>
      ) : (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p, i) => <PlaceCard key={p.id} place={p} index={i} />)}
        </div>
      )}
    </div>
  );
}
