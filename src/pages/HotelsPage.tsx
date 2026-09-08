import { useMemo, useState } from 'react';
import { Hotel } from 'lucide-react';
import { hotels } from '@/data/sampleData';
import { HotelCard } from '@/components/cards/HotelCard';
import { FilterBar } from '@/components/ui/FilterBar';
import { EmptyState } from '@/components/ui/States';

const availabilityFilters = ['All', 'Available', 'Limited', 'Full'];

export function HotelsPage({ destinationId, initialQuery }: { destinationId: string; initialQuery?: string }) {
  const [search, setSearch] = useState(initialQuery ?? '');
  const [budget, setBudget] = useState<'All' | 'Budget' | 'Mid-range' | 'Luxury'>('All');
  const [avail, setAvail] = useState('All');

  const filtered = useMemo(() => {
    let pool = hotels.filter((h) => h.destinationId === destinationId);
    if (budget === 'Budget') pool = pool.filter((h) => h.priceFrom < 2500);
    if (budget === 'Mid-range') pool = pool.filter((h) => h.priceFrom >= 2500 && h.priceFrom < 5500);
    if (budget === 'Luxury') pool = pool.filter((h) => h.priceFrom >= 5500);
    if (avail !== 'All') pool = pool.filter((h) => h.availability === avail);
    if (search.trim()) {
      const q = search.toLowerCase();
      pool = pool.filter(
        (h) =>
          h.name.toLowerCase().includes(q) ||
          h.location.toLowerCase().includes(q) ||
          h.roomType.toLowerCase().includes(q) ||
          h.facilities.join(' ').toLowerCase().includes(q),
      );
    }
    return pool;
  }, [destinationId, budget, avail, search]);

  return (
    <div className="container-page py-10">
      <header className="mb-8">
        <p className="section-eyebrow">Ratnagiri</p>
        <h1 className="section-title mt-1">Hotels & stays</h1>
        <p className="mt-2 max-w-2xl text-navy-500">
          Beachfront resorts, mango-grove homestays and hill retreats. Availability shown is prototype sample data, not real-time booking.
        </p>
      </header>

      <FilterBar
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Search hotels, facilities…"
        categories={['Budget', 'Mid-range', 'Luxury']}
        activeCategory={budget}
        onCategory={(c) => setBudget(c as typeof budget)}
        allLabel="All budgets"
      >
        <select
          value={avail}
          onChange={(e) => setAvail(e.target.value)}
          className="input w-auto py-2.5 text-sm"
        >
          {availabilityFilters.map((a) => <option key={a} value={a}>{a === 'All' ? 'Any availability' : a}</option>)}
        </select>
      </FilterBar>

      <p className="mt-4 text-sm text-navy-500">
        Showing <span className="font-semibold text-navy-800">{filtered.length}</span> {filtered.length === 1 ? 'stay' : 'stays'}
      </p>

      {filtered.length === 0 ? (
        <div className="mt-6">
          <EmptyState title="No stays match your filters" message="Try a different budget or availability filter." icon={<Hotel size={28} />} />
        </div>
      ) : (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((h, i) => <HotelCard key={h.id} hotel={h} index={i} />)}
        </div>
      )}
    </div>
  );
}
