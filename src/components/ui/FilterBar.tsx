import { Search } from 'lucide-react';

interface FilterBarProps {
  search: string;
  onSearch: (v: string) => void;
  searchPlaceholder?: string;
  categories: string[];
  activeCategory: string;
  onCategory: (c: string) => void;
  allLabel?: string;
  children?: React.ReactNode;
}

export function FilterBar({
  search, onSearch, searchPlaceholder = 'Search…',
  categories, activeCategory, onCategory, allLabel = 'All', children,
}: FilterBarProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-navy-400" />
          <input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className="input pl-11"
          />
        </div>
        {children}
      </div>
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
        {[allLabel, ...categories].map((cat) => (
          <button
            key={cat}
            onClick={() => onCategory(cat)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition ${
              activeCategory === cat
                ? 'bg-ocean-600 text-white shadow-soft'
                : 'bg-white text-navy-600 border border-navy-200 hover:bg-navy-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}
