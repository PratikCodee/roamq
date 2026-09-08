import { useEffect, useState } from 'react';
import { Compass, Menu, X, Bookmark, MapPinned, Sparkles, UtensilsCrossed, Building2, Mountain, Hotel, Plane, LogIn } from 'lucide-react';
import { useRouter, type Route } from '@/router/Router';

const navItems: { label: string; route: (d: string) => Route; icon: typeof MapPinned }[] = [
  { label: 'Explore', route: (d) => ({ name: 'destination', destinationId: d }), icon: Compass },
  { label: 'Places', route: (d) => ({ name: 'places', destinationId: d }), icon: MapPinned },
  { label: 'Hotels', route: (d) => ({ name: 'hotels', destinationId: d }), icon: Hotel },
  { label: 'Food', route: (d) => ({ name: 'food', destinationId: d }), icon: UtensilsCrossed },
  { label: 'Activities', route: (d) => ({ name: 'activities', destinationId: d }), icon: Mountain },
  { label: 'Map', route: (d) => ({ name: 'map', destinationId: d }), icon: Plane },
];

export function Navbar({ destinationId }: { destinationId: string }) {
  const { route, navigate } = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const go = (r: Route) => { navigate(r); setMobileOpen(false); };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-white/85 backdrop-blur-xl shadow-soft border-b border-navy-100/50'
          : 'bg-gradient-to-b from-black/50 to-transparent'
      }`}
    >
      <nav className="container-page flex h-16 items-center justify-between gap-4">
        <button onClick={() => go({ name: 'home' })} className="flex items-center gap-2.5 shrink-0">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-forest-500 to-ocean-600 text-white shadow-soft">
            <Compass size={20} />
          </span>
          <span className={`font-display text-lg font-extrabold tracking-tight ${scrolled ? 'text-navy-900' : 'text-white drop-shadow-md'}`}>
            Roam<span className={scrolled ? 'text-forest-600' : 'text-forest-300'}>IQ</span>
          </span>
        </button>

        <div className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => {
            const active = route.name === item.route(destinationId).name;
            return (
               <button
                key={item.label}
                onClick={() => go(item.route(destinationId))}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  active 
                    ? (scrolled ? 'bg-forest-50 text-forest-700' : 'bg-white/20 text-white backdrop-blur-md') 
                    : (scrolled ? 'text-navy-600 hover:bg-navy-50' : 'text-white/90 hover:bg-white/10 hover:text-white')
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => go({ name: 'profile' })}
            className={`hidden items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold shadow-sm transition sm:flex ${
              scrolled ? 'bg-white text-navy-700 border border-navy-100 hover:bg-navy-50' : 'bg-white/10 text-white backdrop-blur-md border border-white/20 hover:bg-white/20'
            }`}
          >
            <Bookmark size={16} /> Saved
          </button>
          <button
            onClick={() => go({ name: 'login' })}
            className={`hidden items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold shadow-sm transition sm:flex ${
              scrolled ? 'bg-white text-navy-700 border border-navy-100 hover:bg-navy-50' : 'bg-white/10 text-white backdrop-blur-md border border-white/20 hover:bg-white/20'
            }`}
          >
            <LogIn size={16} /> Login
          </button>
          <button
            onClick={() => go({ name: 'planner', destinationId })}
            className="btn-nature text-sm shadow-lift hover:scale-105"
          >
            <Sparkles size={16} /> <span className="hidden sm:inline">Plan My Trip</span>
            <span className="sm:hidden">Plan</span>
          </button>
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className={`grid h-10 w-10 place-items-center rounded-full transition lg:hidden ${
              scrolled ? 'bg-white text-navy-700 border border-navy-100' : 'bg-white/20 text-white backdrop-blur-md'
            }`}
            aria-label="Menu"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="lg:hidden border-t border-white/20 bg-white/95 backdrop-blur-xl animate-fade-in shadow-lift">
          <div className="container-page grid grid-cols-2 gap-2 py-4">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => go(item.route(destinationId))}
                className="flex items-center gap-2 rounded-2xl border border-navy-100 bg-white/50 px-4 py-3 text-sm font-semibold text-navy-700 hover:bg-navy-50"
              >
                <item.icon size={18} className="text-forest-600" />
                {item.label}
              </button>
            ))}
            <button
              onClick={() => go({ name: 'profile' })}
              className="col-span-2 flex items-center gap-2 rounded-2xl border border-navy-100 bg-white/50 px-4 py-3 text-sm font-semibold text-navy-700 hover:bg-navy-50"
            >
              <Building2 size={18} className="text-forest-600" /> Saved & Trips
            </button>
            <button
              onClick={() => go({ name: 'login' })}
              className="col-span-2 flex items-center gap-2 rounded-2xl border border-forest-100 bg-forest-50 px-4 py-3 text-sm font-semibold text-forest-700 hover:bg-forest-100"
            >
              <LogIn size={18} className="text-forest-600" /> Login to RoamIQ
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
