import { Compass, MapPin, LogOut, User, Mail, CheckCircle2, Clock, Tag } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useAppData } from '@/context/AppDataContext';
import { useRouter } from '@/router/Router';
import { getUsers } from '@/store/db';

export function CustomerDashboard() {
  const { session, logout } = useAuth();
  const { places, categories } = useAppData();
  const { navigate } = useRouter();

  const user = getUsers().find((u) => u.id === session?.userId);

  const handleLogout = () => {
    logout();
    navigate({ name: 'home' });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-navy-500">User not found. Please log in again.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-50">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-navy-200 bg-white shadow-soft">
        <div className="container-page flex h-16 items-center justify-between">
          <button onClick={() => navigate({ name: 'home' })} className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-ocean-600 text-white shadow-soft">
              <Compass size={20} />
            </span>
            <span className="font-display text-lg font-extrabold text-navy-900">
              Roam<span className="text-ocean-600">IQ</span>
            </span>
          </button>
          <button onClick={handleLogout} className="btn-secondary text-sm flex items-center gap-2 py-2">
            <LogOut size={15} /> Logout
          </button>
        </div>
      </header>

      <div className="container-page py-10">
        {/* Welcome */}
        <div className="mb-8 animate-fade-up">
          <p className="section-eyebrow">Customer Dashboard</p>
          <h1 className="section-title mt-1">Welcome, {user.name}! 🌊</h1>
        </div>

        {/* Account card */}
        <div className="mb-8 rounded-3xl border border-navy-100 bg-white shadow-card p-6 animate-fade-up" style={{ animationDelay: '60ms' }}>
          <h2 className="font-bold text-navy-900 mb-4">Account Details</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-ocean-100 text-ocean-600">
                <User size={18} />
              </div>
              <div>
                <p className="text-xs text-navy-400">Name</p>
                <p className="font-semibold text-navy-800">{user.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-navy-100 text-navy-600">
                <Mail size={18} />
              </div>
              <div>
                <p className="text-xs text-navy-400">Email</p>
                <p className="font-semibold text-navy-800">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className={`grid h-10 w-10 place-items-center rounded-2xl ${user.status === 'approved' ? 'bg-success-100 text-success-600' : 'bg-warning-100 text-warning-600'}`}>
                {user.status === 'approved' ? <CheckCircle2 size={18} /> : <Clock size={18} />}
              </div>
              <div>
                <p className="text-xs text-navy-400">Status</p>
                <p className="font-semibold text-navy-800 capitalize">{user.status}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <div className="rounded-3xl border border-navy-100 bg-white shadow-card p-5 text-center animate-fade-up" style={{ animationDelay: '80ms' }}>
            <p className="text-3xl font-bold text-ocean-600">{places.length}</p>
            <p className="text-sm text-navy-400 mt-1 font-medium">Places to Explore</p>
          </div>
          <div className="rounded-3xl border border-navy-100 bg-white shadow-card p-5 text-center animate-fade-up" style={{ animationDelay: '120ms' }}>
            <p className="text-3xl font-bold text-ocean-600">{categories.length}</p>
            <p className="text-sm text-navy-400 mt-1 font-medium">Categories</p>
          </div>
          <div className="rounded-3xl border border-navy-100 bg-white shadow-card p-5 text-center animate-fade-up col-span-2 md:col-span-1" style={{ animationDelay: '160ms' }}>
            <p className="text-3xl font-bold text-ocean-600">{places.filter((p) => p.isHiddenGem).length}</p>
            <p className="text-sm text-navy-400 mt-1 font-medium">Hidden Gems</p>
          </div>
        </div>

        {/* Browse Places CTA */}
        <div className="rounded-3xl border border-ocean-100 bg-ocean-50 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-up" style={{ animationDelay: '200ms' }}>
          <div>
            <h3 className="font-bold text-ocean-900">Ready to explore Ratnagiri?</h3>
            <p className="text-sm text-ocean-700 mt-1">Browse all places, plan your trip, and save your favourites.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate({ name: 'destination', destinationId: 'dest-ratnagiri' })}
              className="btn-primary text-sm py-2.5"
            >
              <Compass size={15} /> Explore Destination
            </button>
            <button
              onClick={() => navigate({ name: 'planner', destinationId: 'dest-ratnagiri' })}
              className="btn-secondary text-sm py-2.5"
            >
              Plan a Trip
            </button>
          </div>
        </div>

        {/* Featured places preview */}
        <div className="mt-8 animate-fade-up" style={{ animationDelay: '260ms' }}>
          <h2 className="font-bold text-navy-900 mb-4">Featured Places</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {places.slice(0, 6).map((place) => (
              <button
                key={place.id}
                onClick={() => navigate({ name: 'places', destinationId: 'dest-ratnagiri' })}
                className="card text-left overflow-hidden group"
              >
                <div className="h-36 overflow-hidden">
                  <img src={place.image} alt={place.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-4">
                  <span className="chip bg-ocean-100 text-ocean-700 text-xs mb-2 inline-flex">
                    <Tag size={10} /> {place.category}
                  </span>
                  <h4 className="font-bold text-navy-900 text-sm">{place.name}</h4>
                  <p className="text-xs text-navy-400 mt-0.5 flex items-center gap-1"><MapPin size={10} />{place.location}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
