import { places, hotels, restaurants, foods, activities, providers } from '@/data/sampleData';

export type SearchBucket = 'places' | 'hotels' | 'food' | 'activities';

export interface SearchResult {
  bucket: SearchBucket;
  count: number;
}

function countPlaceMatches(q: string): number {
  const ql = q.toLowerCase();
  return places.filter(
    (p) =>
      p.name.toLowerCase().includes(ql) ||
      p.category.toLowerCase().includes(ql) ||
      p.description.toLowerCase().includes(ql) ||
      p.location.toLowerCase().includes(ql),
  ).length;
}

function countHotelMatches(q: string): number {
  const ql = q.toLowerCase();
  return hotels.filter(
    (h) =>
      h.name.toLowerCase().includes(ql) ||
      h.location.toLowerCase().includes(ql) ||
      h.roomType.toLowerCase().includes(ql) ||
      h.facilities.join(' ').toLowerCase().includes(ql) ||
      h.priceRange.toLowerCase().includes(ql),
  ).length;
}

function countFoodMatches(q: string): number {
  const ql = q.toLowerCase();
  const dishCount = foods.filter(
    (f) => f.name.toLowerCase().includes(ql) || f.description.toLowerCase().includes(ql),
  ).length;
  const restoCount = restaurants.filter(
    (r) =>
      r.name.toLowerCase().includes(ql) ||
      r.famousDishes.join(' ').toLowerCase().includes(ql) ||
      r.location.toLowerCase().includes(ql),
  ).length;
  return dishCount + restoCount;
}

function countActivityMatches(q: string): number {
  const ql = q.toLowerCase();
  const actCount = activities.filter(
    (a) => a.name.toLowerCase().includes(ql) || a.description.toLowerCase().includes(ql) || a.category.toLowerCase().includes(ql),
  ).length;
  const provCount = providers.filter(
    (p) =>
      p.businessName.toLowerCase().includes(ql) ||
      p.description.toLowerCase().includes(ql) ||
      p.activitiesOffered.join(' ').toLowerCase().includes(ql),
  ).length;
  return actCount + provCount;
}

export function searchAll(query: string): SearchResult[] {
  const q = query.trim();
  if (!q) return [];
  return [
    { bucket: 'places', count: countPlaceMatches(q) },
    { bucket: 'hotels', count: countHotelMatches(q) },
    { bucket: 'food', count: countFoodMatches(q) },
    { bucket: 'activities', count: countActivityMatches(q) },
  ];
}

export function bestBucket(query: string): SearchBucket | null {
  const results = searchAll(query);
  if (results.length === 0) return null;
  const withMatches = results.filter((r) => r.count > 0);
  if (withMatches.length === 0) return null;
  return withMatches.reduce((best, r) => (r.count > best.count ? r : best)).bucket;
}
