import { Compass, Github, Twitter, Instagram } from 'lucide-react';
import { useRouter, type Route } from '@/router/Router';

export function Footer({ destinationId }: { destinationId: string }) {
  const { navigate } = useRouter();
  const go = (r: Route) => navigate(r);

  return (
    <footer className="mt-20 border-t border-navy-100 bg-white">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-ocean-600 text-white">
              <Compass size={20} />
            </span>
            <span className="font-display text-lg font-extrabold text-navy-900">
              Roam<span className="text-ocean-600">IQ</span>
            </span>
          </div>
          <p className="mt-4 max-w-xs text-sm text-navy-500">
            Explore More. Plan Smarter. An AI-powered tourism platform built for the Konkan coast.
          </p>
          <div className="mt-5 flex gap-3">
            {[Github, Twitter, Instagram].map((Icon, i) => (
              <span key={i} className="grid h-9 w-9 place-items-center rounded-full bg-navy-50 text-navy-500">
                <Icon size={16} />
              </span>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-bold text-navy-800">Explore Ratnagiri</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-navy-500">
            <li><button onClick={() => go({ name: 'places', destinationId })} className="hover:text-ocean-600">Places</button></li>
            <li><button onClick={() => go({ name: 'hotels', destinationId })} className="hover:text-ocean-600">Hotels & Stays</button></li>
            <li><button onClick={() => go({ name: 'food', destinationId })} className="hover:text-ocean-600">Local Food</button></li>
            <li><button onClick={() => go({ name: 'activities', destinationId })} className="hover:text-ocean-600">Activities</button></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-bold text-navy-800">Plan</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-navy-500">
            <li><button onClick={() => go({ name: 'planner', destinationId })} className="hover:text-ocean-600">AI Trip Planner</button></li>
            <li><button onClick={() => go({ name: 'map', destinationId })} className="hover:text-ocean-600">Interactive Map</button></li>
            <li><button onClick={() => go({ name: 'profile' })} className="hover:text-ocean-600">Saved & Trips</button></li>
            <li><button onClick={() => go({ name: 'destination', destinationId })} className="hover:text-ocean-600">Destination Guide</button></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-bold text-navy-800">About</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-navy-500">
            <li>College hackathon prototype</li>
            <li>Sample data, not live bookings</li>
            <li>Built with React + Supabase</li>
            <li>© {new Date().getFullYear()} RoamIQ</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-navy-100 py-5 text-center text-xs text-navy-400">
        RoamIQ is a hackathon prototype. Availability, prices, and reviews are sample data for demonstration only.
      </div>
    </footer>
  );
}
