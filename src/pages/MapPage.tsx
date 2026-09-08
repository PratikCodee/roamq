import { places, hotels, restaurants, activities, providers, ratnagiriDestination } from '@/data/sampleData';
import { MapView } from '@/components/map/MapView';
import { useRouter } from '@/router/Router';
import type { Route } from '@/router/Router';

export function MapPage({ destinationId }: { destinationId: string }) {
  const { navigate } = useRouter();
  const destPlaces = places.filter((p) => p.destinationId === destinationId);
  const destHotels = hotels.filter((h) => h.destinationId === destinationId);
  const destRestos = restaurants.filter((r) => r.destinationId === destinationId);
  const destActivities = activities.filter((a) => a.destinationId === destinationId);
  const destProviders = providers.filter((p) => p.destinationId === destinationId);

  const handleNavigate = (route: Route) => navigate(route);

  return (
    <div className="container-page py-10">
      <header className="mb-8">
        <p className="section-eyebrow">Ratnagiri</p>
        <h1 className="section-title mt-1">Interactive map</h1>
        <p className="mt-2 max-w-2xl text-navy-500">
          Every place, hotel, restaurant, activity and provider plotted across Ratnagiri. Toggle layers to focus on what you need.
        </p>
      </header>

      <MapView
        center={{ lat: ratnagiriDestination.lat, lng: ratnagiriDestination.lng }}
        places={destPlaces}
        hotels={destHotels}
        restaurants={destRestos}
        activities={destActivities}
        providers={destProviders}
        height="h-[600px]"
        destinationId={destinationId}
        onNavigate={handleNavigate}
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { label: 'Places', count: destPlaces.length },
          { label: 'Hotels', count: destHotels.length },
          { label: 'Restaurants', count: destRestos.length },
          { label: 'Activities', count: destActivities.length },
          { label: 'Providers', count: destProviders.length },
        ].map((s) => (
          <div key={s.label} className="card p-4 text-center">
            <p className="text-2xl font-extrabold text-ocean-700">{s.count}</p>
            <p className="text-xs font-semibold text-navy-500">{s.label}</p>
          </div>
        ))}
      </div>

      <p className="mt-6 rounded-2xl bg-navy-50 p-4 text-center text-xs text-navy-500">
        Map data &copy; OpenStreetMap contributors. Markers show approximate locations of listed places, hotels, restaurants, activities and providers.
      </p>
    </div>
  );
}
