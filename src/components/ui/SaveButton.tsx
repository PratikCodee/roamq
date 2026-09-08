import { Bookmark, BookmarkCheck } from 'lucide-react';
import { useSavedItemsContext } from '@/hooks/useSavedItemsContext';

interface SaveButtonProps {
  item: {
    itemType: 'place' | 'hotel' | 'activity' | 'provider' | 'restaurant';
    itemId: string;
    name: string;
    image: string;
    category: string;
    location: string;
  };
  variant?: 'icon' | 'pill';
}

export function SaveButton({ item, variant = 'icon' }: SaveButtonProps) {
  const { isSaved, toggleSave } = useSavedItemsContext();
  const saved = isSaved(item.itemId);

  if (variant === 'pill') {
    return (
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); void toggleSave(item); }}
        className={`btn text-sm px-4 py-2 ${
          saved
            ? 'bg-ocean-600 text-white hover:bg-ocean-700'
            : 'bg-white/90 text-navy-700 border border-navy-200 hover:bg-white'
        }`}
      >
        {saved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
        {saved ? 'Saved' : 'Save'}
      </button>
    );
  }

  return (
    <button
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); void toggleSave(item); }}
      aria-label={saved ? 'Remove from saved' : 'Save'}
      className={`grid h-9 w-9 place-items-center rounded-full backdrop-blur transition ${
        saved ? 'bg-ocean-600 text-white' : 'bg-white/85 text-navy-700 hover:bg-white'
      }`}
    >
      {saved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
    </button>
  );
}
