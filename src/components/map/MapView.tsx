import { useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, LayerGroup } from 'react-leaflet';
import L from 'leaflet';
import { Navigation } from 'lucide-react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Place, Hotel as HotelType, Restaurant, Activity, Provider } from '@/types';
import type { Route } from '@/router/Router';

type MarkerType = 'place' | 'hotel' | 'restaurant' | 'activity' | 'provider';

interface MapItem {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: MarkerType;
  category: string;
  isHidden?: boolean;
  rating?: number;
  description?: string;
  location?: string;
  priceInfo?: string;
  route: Route;
}

interface MapViewProps {
  center: { lat: number; lng: number };
  places?: Place[];
  hotels?: HotelType[];
  restaurants?: Restaurant[];
  activities?: Activity[];
  providers?: Provider[];
  height?: string;
  destinationId: string;
  onNavigate: (route: Route) => void;
}

const typeConfig: Record<MarkerType, { color: string; bgClass: string; label: string; pinColor: string }> = {
  place:       { color: '#0ea5e9', bgClass: 'bg-ocean-500',    label: 'Places',       pinColor: '#0284c7' },
  hotel:       { color: '#d97706', bgClass: 'bg-sand-500',     label: 'Hotels',        pinColor: '#b45309' },
  restaurant:  { color: '#dc2626', bgClass: 'bg-error-500',     label: 'Restaurants',   pinColor: '#dc2626' },
  activity:    { color: '#1e293b', bgClass: 'bg-navy-700',      label: 'Activities',    pinColor: '#334155' },
  provider:    { color: '#16a34a', bgClass: 'bg-success-500',   label: 'Providers',     pinColor: '#15803d' },
};

function makeIcon(type: MarkerType, isHidden: boolean): L.DivIcon {
  const cfg = typeConfig[type];
  const iconHtml = renderToStaticMarkup(
    <span style={{ position: 'relative', display: 'inline-flex', width: 30, height: 38, flexDirection: 'column', alignItems: 'center' }}>
      <span style={{
        display: 'grid', placeItems: 'center', width: 30, height: 30, borderRadius: '50%',
        backgroundColor: cfg.pinColor, color: '#fff', boxShadow: '0 2px 6px rgba(0,0,0,0.35)',
        border: '2px solid #fff',
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {type === 'place' && <><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></>}
          {type === 'hotel' && <><path d="M3 22v-7h18v7"/><path d="M3 11h18"/><path d="M5 11V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v6"/></>}
          {type === 'restaurant' && <><path d="M3 2v7c0 1.1.9 2 2 2h0a2 2 0 0 0 2-2V2"/><path d="M5 2v20"/><path d="M19 2v20"/><path d="M19 2h-3a3 3 0 0 0-3 3v5a3 3 0 0 0 3 3h3"/></>}
          {type === 'activity' && <><path d="m8.5 14.5 7.5-7.5"/><path d="M4 20l4-4"/><path d="m14 4 6 6-4 4-6-6Z"/></>}
          {type === 'provider' && <><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .962 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.582a.5.5 0 0 1 0 .962L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.962 0z"/></>}
        </svg>
      </span>
      <span style={{
        width: 8, height: 8, marginTop: -2, transform: 'rotate(45deg)',
        backgroundColor: cfg.pinColor, border: '2px solid #fff',
      }} />
      {isHidden && (
        <span style={{
          position: 'absolute', right: -4, top: -4, width: 16, height: 16, borderRadius: '50%',
          backgroundColor: '#d97706', color: '#fff', fontSize: 8, display: 'grid', placeItems: 'center',
          border: '1.5px solid #fff',
        }}>★</span>
      )}
    </span>,
  );

  return L.divIcon({
    html: iconHtml,
    className: 'roamiq-map-marker',
    iconSize: [30, 38],
    iconAnchor: [15, 38],
    popupAnchor: [0, -34],
  });
}

export function MapView({
  center, places = [], hotels = [], restaurants = [], activities = [], providers = [],
  height = 'h-[520px]', destinationId, onNavigate,
}: MapViewProps) {
  const [activeFilters, setActiveFilters] = useState<Set<MarkerType>>(
    new Set(['place', 'hotel', 'restaurant', 'activity', 'provider']),
  );

  const allItems = useMemo<MapItem[]>(() => {
    const map: MapItem[] = [
      ...places.map((p) => ({
        id: p.id, name: p.name, lat: p.lat, lng: p.lng, type: 'place' as const,
        category: p.category, isHidden: p.isHiddenGem, rating: p.rating,
        description: p.description, location: p.location,
        priceInfo: p.entryFee,
        route: { name: 'places', destinationId } as Route,
      })),
      ...hotels.map((h) => ({
        id: h.id, name: h.name, lat: h.lat, lng: h.lng, type: 'hotel' as const,
        category: h.roomType, rating: h.rating,
        description: h.location, location: h.location,
        priceInfo: h.priceRange,
        route: { name: 'hotels', destinationId } as Route,
      })),
      ...restaurants.map((r) => ({
        id: r.id, name: r.name, lat: r.lat, lng: r.lng, type: 'restaurant' as const,
        category: r.isVeg ? 'Pure Veg' : 'Non-Veg', rating: r.rating,
        description: r.famousDishes.slice(0, 3).join(' · '), location: r.location,
        priceInfo: r.priceRange,
        route: { name: 'food', destinationId } as Route,
      })),
      ...activities.map((a) => ({
        id: a.id, name: a.name, lat: a.lat, lng: a.lng, type: 'activity' as const,
        category: a.category,
        description: a.description, location: a.location,
        priceInfo: `₹${a.priceFrom} onwards`,
        route: { name: 'activities', destinationId } as Route,
      })),
      ...providers.map((p) => ({
        id: p.id, name: p.businessName, lat: p.lat, lng: p.lng, type: 'provider' as const,
        category: p.activityCategory, rating: p.rating,
        description: p.description, location: p.location,
        priceInfo: `₹${p.priceFrom} onwards`,
        route: { name: 'activities', destinationId } as Route,
      })),
    ];
    return map;
  }, [places, hotels, restaurants, activities, providers, destinationId]);

  const icons = useMemo(() => {
    const cache: Record<string, L.DivIcon> = {};
    for (const item of allItems) {
      const key = `${item.type}-${item.isHidden ?? false}`;
      if (!cache[key]) cache[key] = makeIcon(item.type, item.isHidden ?? false);
    }
    return cache;
  }, [allItems]);

  const visibleItems = allItems.filter((i) => activeFilters.has(i.type));

  const toggle = (t: MarkerType) =>
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t); else next.add(t);
      return next;
    });

  const typeLabel: Record<MarkerType, string> = {
    place: 'Place', hotel: 'Hotel', restaurant: 'Restaurant', activity: 'Activity', provider: 'Provider',
  };

  return (
    <div className="card overflow-visible">
      <div className="flex flex-wrap items-center gap-2 border-b border-navy-100 p-4">
        <span className="mr-1 flex items-center gap-1.5 text-sm font-semibold text-navy-700">
          <Navigation size={15} className="text-ocean-600" /> Map layers
        </span>
        {(Object.keys(typeConfig) as MarkerType[]).map((t) => {
          const cfg = typeConfig[t];
          const active = activeFilters.has(t);
          return (
            <button
              key={t}
              onClick={() => toggle(t)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                active ? `${cfg.bgClass} text-white` : 'bg-navy-50 text-navy-400'
              }`}
            >
              <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: cfg.pinColor }} />
              {cfg.label}
            </button>
          );
        })}
      </div>

      <div className={`relative ${height} w-full overflow-hidden`}>
        <MapContainer
          center={[center.lat, center.lng]}
          zoom={11}
          scrollWheelZoom={false}
          className="h-full w-full"
          style={{ background: '#cbf6f4' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />
          {(['place', 'hotel', 'restaurant', 'activity', 'provider'] as MarkerType[]).map((layerType) => {
            if (!activeFilters.has(layerType)) return null;
            const layerItems = visibleItems.filter((i) => i.type === layerType);
            return (
              <LayerGroup key={layerType}>
                {layerItems.map((item) => {
                  const iconKey = `${item.type}-${item.isHidden ?? false}`;
                  return (
                    <Marker
                      key={`${item.type}-${item.id}`}
                      position={[item.lat, item.lng]}
                      icon={icons[iconKey]}
                    >
                      <Popup>
                        <div className="min-w-[200px]">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-bold text-navy-900">{item.name}</p>
                            {item.isHidden && (
                              <span className="rounded-full bg-sand-100 px-1.5 py-0.5 text-[10px] font-semibold text-sand-700">Hidden Gem</span>
                            )}
                          </div>
                          <p className="mt-0.5 text-xs font-medium text-ocean-600">{typeLabel[item.type]} · {item.category}</p>
                          {item.rating && (
                            <p className="mt-1 text-xs text-navy-600">★ {item.rating} rating</p>
                          )}
                          {item.description && (
                            <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-navy-500">{item.description}</p>
                          )}
                          {item.location && (
                            <p className="mt-1 text-xs text-navy-400">{item.location}</p>
                          )}
                          {item.priceInfo && (
                            <p className="mt-1 text-xs font-semibold text-navy-700">{item.priceInfo}</p>
                          )}
                          <button
                            onClick={() => onNavigate(item.route)}
                            className="mt-2 w-full rounded-lg bg-ocean-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-ocean-700"
                          >
                            View Details
                          </button>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </LayerGroup>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}
