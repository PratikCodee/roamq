import {
  createContext, useCallback, useContext, useEffect, useState, type ReactNode,
} from 'react';
import { supabase } from '@/lib/supabase';
import type { SavedItem } from '@/types';

interface SavedItemsContextValue {
  items: SavedItem[];
  loading: boolean;
  error: string | null;
  isSaved: (itemId: string) => boolean;
  toggleSave: (item: Omit<SavedItem, 'id' | 'savedAt'>) => Promise<void>;
  removeByItemId: (itemId: string) => Promise<void>;
}

function mapSavedItem(row: Record<string, unknown>): SavedItem {
  return {
    id: String(row.id),
    itemType: row.item_type as SavedItem['itemType'],
    itemId: String(row.item_id),
    name: String(row.name ?? ''),
    image: String(row.image ?? ''),
    category: String(row.category ?? ''),
    location: String(row.location ?? ''),
    savedAt: String(row.saved_at ?? ''),
  };
}

const SavedItemsContext = createContext<SavedItemsContextValue | null>(null);

export function SavedItemsProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('saved_items')
      .select('*')
      .order('saved_at', { ascending: false });
    if (error) setError(error.message);
    else setItems((data ?? []).map((row) => mapSavedItem(row as Record<string, unknown>)));
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const isSaved = useCallback(
    (itemId: string) => items.some((i) => i.itemId === itemId),
    [items],
  );

  const toggleSave = useCallback(
    async (item: Omit<SavedItem, 'id' | 'savedAt'>) => {
      const existing = items.find((i) => i.itemId === item.itemId);
      if (existing) {
        const { error: delError } = await supabase
          .from('saved_items')
          .delete()
          .eq('item_id', item.itemId);
        if (delError) { setError(delError.message); return; }
        setItems((prev) => prev.filter((i) => i.itemId !== item.itemId));
      } else {
        const row = {
          item_type: item.itemType,
          item_id: item.itemId,
          name: item.name,
          image: item.image,
          category: item.category,
          location: item.location,
        };
        const { data, error: insError } = await supabase
          .from('saved_items')
          .insert(row)
          .select('*')
          .single();
        if (insError) { setError(insError.message); return; }
        setItems((prev) => [mapSavedItem(data as Record<string, unknown>), ...prev]);
      }
    },
    [items],
  );

  const removeByItemId = useCallback(
    async (itemId: string) => {
      const { error: delError } = await supabase
        .from('saved_items')
        .delete()
        .eq('item_id', itemId);
      if (delError) { setError(delError.message); return; }
      setItems((prev) => prev.filter((i) => i.itemId !== itemId));
    },
    [],
  );

  return (
    <SavedItemsContext.Provider value={{ items, loading, error, isSaved, toggleSave, removeByItemId }}>
      {children}
    </SavedItemsContext.Provider>
  );
}

export function useSavedItemsContext() {
  const ctx = useContext(SavedItemsContext);
  if (!ctx) throw new Error('useSavedItemsContext must be used within SavedItemsProvider');
  return ctx;
}
