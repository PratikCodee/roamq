import { useState } from 'react';
import {
  Compass, LayoutDashboard, MapPin, Users, Building2, Tag,
  LogOut, Plus, Pencil, Trash2, ShieldCheck, TrendingUp,
  Clock, CheckCircle2, XCircle, Search, RotateCcw,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useAppData } from '@/context/AppDataContext';
import { useRouter } from '@/router/Router';
import { resetAll } from '@/store/db';
import { PlaceEditor } from '@/components/admin/PlaceEditor';
import { RegistrationTable } from '@/components/admin/RegistrationTable';
import { CategoryManager } from '@/components/admin/CategoryManager';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { showToast } from '@/components/ui/Toast';
import type { AppPlace } from '@/store/types';

type Tab = 'overview' | 'places' | 'registrations' | 'categories';

function StatCard({ label, value, icon: Icon, color }: {
  label: string; value: number | string; icon: typeof MapPin; color: string;
}) {
  return (
    <div className={`rounded-3xl border border-navy-100 bg-white p-6 shadow-card flex items-center gap-4`}>
      <div className={`grid h-12 w-12 place-items-center rounded-2xl ${color}`}>
        <Icon size={22} />
      </div>
      <div>
        <p className="text-3xl font-bold text-navy-900">{value}</p>
        <p className="text-sm text-navy-400 font-medium">{label}</p>
      </div>
    </div>
  );
}

export function AdminDashboard() {
  const { logout } = useAuth();
  const { navigate } = useRouter();
  const { places, users, businesses, removePlace } = useAppData();
  const [tab, setTab] = useState<Tab>('overview');
  const [editingPlace, setEditingPlace] = useState<AppPlace | null | 'new'>(null);
  const [deletingPlaceId, setDeletingPlaceId] = useState<string | null>(null);
  const [placeSearch, setPlaceSearch] = useState('');

  const customers  = users.filter((u) => u.role === 'customer');
  const pending    = [
    ...customers.filter((u) => u.status === 'pending'),
    ...businesses.filter((b) => b.status === 'pending'),
  ];
  const approved   = [
    ...customers.filter((u) => u.status === 'approved'),
    ...businesses.filter((b) => b.status === 'approved'),
  ];
  const rejected   = [
    ...customers.filter((u) => u.status === 'rejected'),
    ...businesses.filter((b) => b.status === 'rejected'),
  ];

  const handleLogout = () => {
    logout();
    navigate({ name: 'home' });
  };

  const filteredPlaces = places.filter((p) =>
    p.name.toLowerCase().includes(placeSearch.toLowerCase()) ||
    p.category.toLowerCase().includes(placeSearch.toLowerCase()),
  );

  const TABS: Array<{ id: Tab; label: string; icon: typeof LayoutDashboard; badge?: number }> = [
    { id: 'overview',       label: 'Overview',       icon: LayoutDashboard },
    { id: 'places',         label: 'Places',         icon: MapPin,     badge: places.length },
    { id: 'registrations',  label: 'Registrations',  icon: Users,      badge: pending.length },
    { id: 'categories',     label: 'Categories',     icon: Tag },
  ];

  return (
    <div className="min-h-screen bg-navy-50 flex flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-50 border-b border-navy-200 bg-white shadow-soft">
        <div className="container-page flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-navy-900 text-white shadow-soft">
              <ShieldCheck size={20} />
            </div>
            <div>
              <p className="font-display font-bold text-navy-900 leading-none">RoamIQ Admin</p>
              <p className="text-xs text-navy-400">Platform Management</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (confirm('Reset local storage cache and reload fresh demo data?')) {
                  resetAll();
                  window.location.reload();
                }
              }}
              className="btn-ghost text-xs text-navy-600 hover:text-error-600 hidden sm:flex items-center gap-1.5 py-1.5 px-3 rounded-xl border border-navy-200"
              title="Reset Storage Cache"
            >
              <RotateCcw size={14} /> Reset Cache
            </button>
            <button
              onClick={() => navigate({ name: 'home' })}
              className="btn-ghost text-sm hidden sm:flex"
            >
              <Compass size={16} /> View Site
            </button>
            <button onClick={handleLogout} className="btn-secondary text-sm flex items-center gap-2 py-2">
              <LogOut size={15} /> Logout
            </button>
          </div>
        </div>
      </header>

      <div className="container-page py-8 flex-1">
        {/* Tab nav */}
        <nav className="flex flex-wrap gap-2 mb-8">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                tab === t.id
                  ? 'bg-navy-900 text-white shadow-soft'
                  : 'bg-white text-navy-600 border border-navy-200 hover:bg-navy-50'
              }`}
            >
              <t.icon size={15} />
              {t.label}
              {t.badge !== undefined && t.badge > 0 && (
                <span className={`grid h-5 w-5 place-items-center rounded-full text-[10px] font-bold ${tab === t.id ? 'bg-white text-navy-900' : 'bg-ocean-600 text-white'}`}>
                  {t.badge > 99 ? '99+' : t.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* ── OVERVIEW ──────────────────────────────────────────────────────── */}
        {tab === 'overview' && (
          <div className="space-y-8 animate-fade-up">
            <div>
              <p className="section-eyebrow">Dashboard Overview</p>
              <h1 className="section-title mt-1">Welcome back, Admin 👋</h1>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Total Places"       value={places.length}    icon={MapPin}      color="bg-ocean-100 text-ocean-600" />
              <StatCard label="Total Customers"    value={customers.length} icon={Users}       color="bg-navy-100 text-navy-600" />
              <StatCard label="Total Businesses"   value={businesses.length}icon={Building2}   color="bg-sand-100 text-sand-600" />
              <StatCard label="Pending Approvals"  value={pending.length}   icon={Clock}       color="bg-warning-100 text-warning-600" />
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <StatCard label="Approved Users"     value={approved.length}  icon={CheckCircle2}color="bg-success-100 text-success-600" />
              <StatCard label="Rejected"           value={rejected.length}  icon={XCircle}     color="bg-error-100 text-error-600" />
              <StatCard label="Approved Businesses"value={businesses.filter((b) => b.status === 'approved').length} icon={TrendingUp} color="bg-ocean-50 text-ocean-700" />
            </div>

            {pending.length > 0 && (
              <div className="rounded-3xl border border-warning-200 bg-warning-50 p-5">
                <p className="font-bold text-warning-800 mb-1">⏳ {pending.length} pending approval{pending.length > 1 ? 's' : ''}</p>
                <p className="text-sm text-warning-700">New registrations are waiting for your review.</p>
                <button onClick={() => setTab('registrations')} className="mt-3 btn-primary text-sm py-2 px-5">
                  Review Now →
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── PLACES ────────────────────────────────────────────────────────── */}
        {tab === 'places' && (
          <div className="space-y-5 animate-fade-up">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="section-eyebrow">Manage Places</p>
                <h2 className="section-title mt-1">{places.length} Places</h2>
              </div>
              <button onClick={() => setEditingPlace('new')} className="btn-primary flex items-center gap-2">
                <Plus size={16} /> Add Place
              </button>
            </div>

            {/* Search */}
            <div className="relative max-w-sm">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400" />
              <input
                value={placeSearch}
                onChange={(e) => setPlaceSearch(e.target.value)}
                placeholder="Search by name or category…"
                className="input pl-10 py-2.5 text-sm"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredPlaces.map((place) => (
                <div key={place.id} className="rounded-3xl border border-navy-100 bg-white shadow-card overflow-hidden group">
                  <div className="relative h-40 overflow-hidden">
                    <img
                      src={place.image}
                      alt={place.name}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-900/60 to-transparent" />
                    <span className="absolute bottom-3 left-3 chip bg-white/90 text-navy-700 text-xs">{place.category}</span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-navy-900 truncate">{place.name}</h3>
                    <p className="text-xs text-navy-400 mt-0.5 truncate">{place.location}</p>
                    
                    {place.featuredInSeasons && place.featuredInSeasons.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {place.featuredInSeasons.includes('monsoon') && (
                          <span className="chip bg-blue-100 text-blue-800 text-[10px] px-2 py-0.5 font-bold">🌧️ Monsoon</span>
                        )}
                        {place.featuredInSeasons.includes('winter') && (
                          <span className="chip bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 font-bold">☀️ Winter</span>
                        )}
                        {place.featuredInSeasons.includes('summer') && (
                          <span className="chip bg-orange-100 text-orange-800 text-[10px] px-2 py-0.5 font-bold">🥭 Summer</span>
                        )}
                      </div>
                    )}

                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => setEditingPlace(place)}
                        className="flex-1 flex items-center justify-center gap-1.5 rounded-full border border-navy-200 py-2 text-xs font-semibold text-navy-600 hover:bg-navy-50 transition"
                      >
                        <Pencil size={12} /> Edit
                      </button>
                      <button
                        onClick={() => setDeletingPlaceId(place.id)}
                        className="flex-1 flex items-center justify-center gap-1.5 rounded-full border border-error-200 py-2 text-xs font-semibold text-error-600 hover:bg-error-50 transition"
                      >
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── REGISTRATIONS ─────────────────────────────────────────────────── */}
        {tab === 'registrations' && (
          <div className="animate-fade-up">
            <div className="mb-6">
              <p className="section-eyebrow">User & Business Registrations</p>
              <h2 className="section-title mt-1">Approve or Reject Registrations</h2>
            </div>
            <RegistrationTable />
          </div>
        )}

        {/* ── CATEGORIES ────────────────────────────────────────────────────── */}
        {tab === 'categories' && (
          <div className="animate-fade-up">
            <div className="mb-6">
              <p className="section-eyebrow">Manage Categories</p>
              <h2 className="section-title mt-1">Place & Business Categories</h2>
            </div>
            <CategoryManager />
          </div>
        )}
      </div>

      {/* Place editor modal */}
      {editingPlace && (
        <PlaceEditor
          place={editingPlace === 'new' ? undefined : editingPlace}
          onClose={() => setEditingPlace(null)}
        />
      )}

      {/* Delete confirm */}
      {deletingPlaceId && (
        <ConfirmDialog
          title="Delete Place?"
          message="This will permanently remove this place from the platform. This cannot be undone."
          confirmLabel="Delete"
          danger
          onConfirm={() => {
            removePlace(deletingPlaceId);
            showToast('Place deleted.', 'info');
            setDeletingPlaceId(null);
          }}
          onCancel={() => setDeletingPlaceId(null)}
        />
      )}
    </div>
  );
}
