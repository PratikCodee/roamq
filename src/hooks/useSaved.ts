import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { SavedTrip, ItineraryDay, TripPreferences } from '@/types';

function mapSavedTrip(row: Record<string, unknown>): SavedTrip {
  return {
    id: String(row.id),
    title: String(row.title ?? ''),
    preferences: row.preferences as TripPreferences,
    days: row.days as ItineraryDay[],
    totalCost: Number(row.total_cost ?? 0),
    createdAt: String(row.created_at ?? ''),
  };
}

export function useSavedTrips() {
  const [trips, setTrips] = useState<SavedTrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('saved_trips')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) setError(error.message);
    else setTrips((data ?? []).map((row) => mapSavedTrip(row as Record<string, unknown>)));
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const saveTrip = useCallback(
    async (title: string, preferences: TripPreferences, days: ItineraryDay[], totalCost: number) => {
      const row = {
        title,
        preferences,
        days,
        total_cost: totalCost,
      };
      const { data, error } = await supabase
        .from('saved_trips')
        .insert(row)
        .select('*')
        .single();
      if (error) { setError(error.message); return null; }
      const saved = mapSavedTrip(data as Record<string, unknown>);
      setTrips((prev) => [saved, ...prev]);
      return saved;
    },
    [],
  );

  const deleteTrip = useCallback(async (id: string) => {
    const { error } = await supabase.from('saved_trips').delete().eq('id', id);
    if (error) { setError(error.message); return; }
    setTrips((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { trips, loading, error, saveTrip, deleteTrip, reload: load };
}
