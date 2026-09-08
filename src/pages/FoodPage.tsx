import { useMemo, useState } from 'react';
import { UtensilsCrossed, Leaf, Flame, Sparkles } from 'lucide-react';
import { foods, restaurants } from '@/data/sampleData';
import { RestaurantCard } from '@/components/cards/RestaurantCard';
import { FilterBar } from '@/components/ui/FilterBar';
import { EmptyState } from '@/components/ui/States';

export function FoodPage({ destinationId, initialQuery }: { destinationId: string; initialQuery?: string }) {
  const [search, setSearch] = useState(initialQuery ?? '');
  const [vegFilter, setVegFilter] = useState<'All' | 'Veg' | 'Non-Veg'>('All');

  const destFoods = foods.filter((f) => {
    if (f.destinationId !== destinationId) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return f.name.toLowerCase().includes(q) || f.description.toLowerCase().includes(q);
  });
  const filteredRestos = useMemo(() => {
    let pool = restaurants.filter((r) => r.destinationId === destinationId);
    if (vegFilter === 'Veg') pool = pool.filter((r) => r.isVeg);
    if (vegFilter === 'Non-Veg') pool = pool.filter((r) => !r.isVeg);
    if (search.trim()) {
      const q = search.toLowerCase();
      pool = pool.filter(
        (r) => r.name.toLowerCase().includes(q) || r.famousDishes.join(' ').toLowerCase().includes(q) || r.location.toLowerCase().includes(q),
      );
    }
    return pool;
  }, [destinationId, vegFilter, search]);

  return (
    <div className="container-page py-10">
      <header className="mb-8">
        <p className="section-eyebrow">Ratnagiri</p>
        <h1 className="section-title mt-1">Local food & restaurants</h1>
        <p className="mt-2 max-w-2xl text-navy-500">
          Famous Konkan dishes, fresh coastal seafood, and the restaurants that serve them best.
        </p>
      </header>

      {/* Famous foods */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-navy-900">Famous Ratnagiri dishes</h2>
        {destFoods.length === 0 ? (
          <div className="mt-5">
            <EmptyState title="No dishes match your search" message="Try a different keyword." icon={<UtensilsCrossed size={28} />} />
          </div>
        ) : (
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {destFoods.map((f, i) => (
              <article
                key={f.id}
                className="card group flex animate-fade-up"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="relative w-28 shrink-0 overflow-hidden">
                  <img src={f.image} alt={f.name} loading="lazy" className="h-full w-full object-cover" />
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-base font-bold text-navy-900">{f.name}</h3>
                    {f.mustTry && (
                      <span className="chip bg-sand-100 text-sand-700 shrink-0">
                        <Sparkles size={11} /> Must try
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-navy-500">{f.description}</p>
                  <div className="mt-3 flex gap-1.5">
                    <span className={`chip ${f.isVeg ? 'bg-success-100 text-success-700' : 'bg-error-100 text-error-700'}`}>
                      {f.isVeg ? <Leaf size={11} /> : <UtensilsCrossed size={11} />} {f.isVeg ? 'Veg' : 'Non-Veg'}
                    </span>
                    <span className="chip bg-navy-50 text-navy-600">
                      <Flame size={11} /> {f.spiceLevel}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Restaurants */}
      <section>
        <h2 className="text-xl font-bold text-navy-900">Restaurants</h2>
        <div className="mt-5">
          <FilterBar
            search={search}
            onSearch={setSearch}
            searchPlaceholder="Search restaurants or dishes…"
            categories={['Veg', 'Non-Veg']}
            activeCategory={vegFilter}
            onCategory={(c) => setVegFilter(c as typeof vegFilter)}
            allLabel="All"
          />
        </div>

        <p className="mt-4 text-sm text-navy-500">
          Showing <span className="font-semibold text-navy-800">{filteredRestos.length}</span> {filteredRestos.length === 1 ? 'restaurant' : 'restaurants'}
        </p>

        {filteredRestos.length === 0 ? (
          <div className="mt-6">
            <EmptyState title="No restaurants match your filters" message="Try a different food preference." icon={<UtensilsCrossed size={28} />} />
          </div>
        ) : (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredRestos.map((r, i) => <RestaurantCard key={r.id} restaurant={r} index={i} />)}
          </div>
        )}
      </section>
    </div>
  );
}
