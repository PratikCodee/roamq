import { Clock, MapPin, IndianRupee } from 'lucide-react';
import type { Activity } from '@/types';
import { SaveButton } from '@/components/ui/SaveButton';
import { useRouter } from '@/router/Router';

export function ActivityCard({ activity, index = 0 }: { activity: Activity; index?: number }) {
  const { navigate } = useRouter();
  return (
    <article
      className="card group flex flex-col animate-fade-up"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="relative h-44 overflow-hidden">
        <img
          src={activity.image}
          alt={activity.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-900/60 to-transparent" />
        <span className="chip absolute left-3 top-3 bg-white/90 text-navy-700 backdrop-blur">
          {activity.category}
        </span>
        <div className="absolute right-3 top-3">
          <SaveButton
            item={{
              itemType: 'activity', itemId: activity.id, name: activity.name,
              image: activity.image, category: activity.category, location: activity.location,
            }}
          />
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-bold text-navy-900">{activity.name}</h3>
        <p className="mt-1 flex items-start gap-1.5 text-xs text-navy-500">
          <MapPin size={14} className="mt-0.5 text-ocean-500" /> {activity.location}
        </p>
        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-navy-600">{activity.description}</p>
        <div className="mt-4 flex items-center justify-between text-xs text-navy-600">
          <span className="flex items-center gap-1.5 rounded-xl bg-navy-50 px-2.5 py-1.5">
            <Clock size={13} className="text-ocean-500" /> {activity.duration}
          </span>
          <span className="flex items-center gap-1 rounded-xl bg-sand-50 px-2.5 py-1.5 font-bold text-sand-700">
            <IndianRupee size={13} /> from {activity.priceFrom}
          </span>
        </div>
        <button
          onClick={() => navigate({ name: 'activities', destinationId: activity.destinationId })}
          className="mt-4 text-xs font-bold text-ocean-600 hover:text-ocean-700"
        >
          Compare providers →
        </button>
      </div>
    </article>
  );
}
