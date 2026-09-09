import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { destinations } from '@/data/sampleData';

export type Route =
  | { name: 'home' }
  | { name: 'destination'; destinationId: string }
  | { name: 'places'; destinationId: string; q?: string }
  | { name: 'hotels'; destinationId: string; q?: string }
  | { name: 'food'; destinationId: string; q?: string }
  | { name: 'activities'; destinationId: string; q?: string }
  | { name: 'map'; destinationId: string }
  | { name: 'planner'; destinationId: string }
  | { name: 'profile' }
  | { name: 'login' }
  | { name: 'business-register' }
  | { name: 'admin' }
  | { name: 'customer-dashboard' };

interface RouterContextValue {
  route: Route;
  navigate: (route: Route) => void;
}

const RouterContext = createContext<RouterContextValue | null>(null);

function parseHash(): Route {
  const hash = window.location.hash.replace(/^#\/?/, '');
  const [name, destinationId, q] = hash.split('/');
  const query = q ? decodeURIComponent(q) : undefined;
  const validDestinationId = destinations.some((destination) => destination.id === destinationId)
    ? destinationId
    : 'dest-ratnagiri';
  switch (name) {
    case 'destination': return { name: 'destination', destinationId: validDestinationId };
    case 'places': return { name: 'places', destinationId: validDestinationId, q: query };
    case 'hotels': return { name: 'hotels', destinationId: validDestinationId, q: query };
    case 'food': return { name: 'food', destinationId: validDestinationId, q: query };
    case 'activities': return { name: 'activities', destinationId: validDestinationId, q: query };
    case 'map': return { name: 'map', destinationId: validDestinationId };
    case 'planner': return { name: 'planner', destinationId: validDestinationId };
    case 'profile': return { name: 'profile' };
    case 'login': return { name: 'login' };
    case 'business-register': return { name: 'business-register' };
    case 'admin': return { name: 'admin' };
    case 'customer-dashboard': return { name: 'customer-dashboard' };
    default: return { name: 'home' };
  }
}

function routeToHash(route: Route): string {
  if (route.name === 'home' || route.name === 'profile' || route.name === 'login' || route.name === 'business-register' || route.name === 'admin' || route.name === 'customer-dashboard') return `#/${route.name}`;
  if (route.name === 'destination' || route.name === 'map' || route.name === 'planner') return `#/${route.name}/${route.destinationId}`;
  const q = route.q ? `/${encodeURIComponent(route.q)}` : '';
  return `#/${route.name}/${route.destinationId}${q}`;
}

export function RouterProvider({ children }: { children: ReactNode }) {
  const [route, setRoute] = useState<Route>(() => parseHash());

  useEffect(() => {
    const onHashChange = () => setRoute(parseHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigate = useCallback((next: Route) => {
    const hash = routeToHash(next);
    if (window.location.hash !== hash) {
      window.location.hash = hash;
    } else {
      setRoute(next);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const value = useMemo(() => ({ route, navigate }), [route, navigate]);
  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

export function useRouter() {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error('useRouter must be used within RouterProvider');
  return ctx;
}
