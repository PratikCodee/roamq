import { useState, useEffect, useRef } from 'react';
import {
  Sparkles, Calendar, Users, Compass, UtensilsCrossed, Bed, Clock, MapPin,
  CheckCircle2, Route, Wallet, TrendingUp, Bookmark, Trash2, Loader2,
  AlertTriangle, Info, Bot, Zap, WifiOff, CloudRain, Sun, Flower2, Video,
} from 'lucide-react';
import { useRouter } from '@/router/Router';
import { interestOptions, transportOptions, foodOptions, stayOptions, ratnagiriDestination } from '@/data/sampleData';
import { type ItineraryResult, getCurrentSeason } from '@/lib/itineraryEngine';
import { generateWithGemini } from '@/lib/geminiItinerary';
import { useSavedTrips } from '@/hooks/useSaved';
import { useAppData } from '@/context/AppDataContext';
import { VideoModal } from '@/components/ui/VideoModal';
import type { TripPreferences, Place } from '@/types';

type SeasonChoice = 'auto' | 'monsoon' | 'winter' | 'summer';

const SEASON_OPTIONS: { value: SeasonChoice; label: string; emoji: string; desc: string; color: string; border: string }[] = [
  { value: 'auto',    label: 'Auto',    emoji: '📍', desc: 'Based on today',         color: 'bg-navy-50 text-navy-700',    border: 'border-navy-200'   },
  { value: 'monsoon', label: 'Monsoon', emoji: '🌧️', desc: 'Jun – Sep · Waterfalls',  color: 'bg-blue-50 text-blue-700',    border: 'border-blue-300'   },
  { value: 'winter',  label: 'Winter',  emoji: '☀️', desc: 'Oct – Feb · Beaches',     color: 'bg-amber-50 text-amber-700',  border: 'border-amber-300'  },
  { value: 'summer',  label: 'Summer',  emoji: '🥭', desc: 'Mar – May · Mangoes',     color: 'bg-orange-50 text-orange-700','border': 'border-orange-300' },
];

// ── Animated AI progress component ──────────────────────────────────────────
function AIProgressCard({ status }: { status: string }) {
  const tips = [
    '🌊 Ratnagiri has 167 km of coastline',
    '🥭 Alphonso mangoes grow here from Feb–June',
    '🏰 Ratnadurg Fort overlooks the Arabian Sea',
    '🐬 Dolphins spotted near Jaigad creek in winter',
    '🍛 Kombdi vade is Ratnagiri\'s signature dish',
    '📸 Are Ware is Ratnagiri\'s secret black-sand beach',
  ];
  const [tipIndex, setTipIndex] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTipIndex(i => (i + 1) % tips.length), 2500);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="card overflow-hidden">
      {/* Animated gradient header */}
      <div className="relative flex items-center gap-4 bg-gradient-to-r from-ocean-700 via-ocean-600 to-navy-700 px-6 py-5">
        <div className="absolute inset-0 opacity-20">
          <div className="h-full w-full" style={{
            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.05) 10px, rgba(255,255,255,0.05) 20px)',
          }} />
        </div>
        <span className="relative grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/20 backdrop-blur">
          <Bot size={22} className="text-white" />
        </span>
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-widest text-ocean-200">Gemini AI</p>
          <p className="mt-0.5 font-bold text-white">Building your personalised itinerary…</p>
        </div>
        <Loader2 size={20} className="relative ml-auto animate-spin text-white/70" />
      </div>

      {/* Status */}
      <div className="flex items-center gap-3 border-b border-navy-100 px-6 py-3">
        <span className="relative flex h-2.5 w-2.5 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ocean-400 opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-ocean-600" />
        </span>
        <p className="text-sm font-medium text-navy-700 animate-fade-in" key={status}>{status}</p>
      </div>

      {/* Fun fact */}
      <div className="flex items-start gap-3 px-6 py-4">
        <Sparkles size={16} className="mt-0.5 shrink-0 text-sand-500" />
        <p className="text-sm text-navy-500 animate-fade-in" key={tipIndex}>
          <span className="font-semibold text-navy-700">Did you know? </span>{tips[tipIndex]}
        </p>
      </div>

      {/* Fake skeleton rows */}
      <div className="space-y-3 px-6 pb-6">
        {[80, 60, 90, 50].map((w, i) => (
          <div key={i} className="skeleton h-4 rounded-xl" style={{ width: `${w}%`, animationDelay: `${i * 150}ms` }} />
        ))}
      </div>
    </div>
  );
}

const itemIcon: Record<string, typeof MapPin> = {
  place: MapPin, food: UtensilsCrossed, activity: Compass, stay: Bed, provider: Sparkles,
};
const itemColor: Record<string, string> = {
  place: 'bg-ocean-100 text-ocean-700',
  food: 'bg-error-100 text-error-700',
  activity: 'bg-navy-100 text-navy-700',
  stay: 'bg-sand-100 text-sand-700',
  provider: 'bg-success-100 text-success-700',
};

export function PlannerPage({ destinationId }: { destinationId: string }) {
  const { navigate } = useRouter();
  const { saveTrip, trips, deleteTrip } = useSavedTrips();
  const { places } = useAppData();

  const [days, setDays] = useState(3);
  const [travelers, setTravelers] = useState(3);
  const [budget, setBudget] = useState(10000);
  const [travelerType, setTravelerType] = useState<TripPreferences['travelerType']>('Family');
  const [timeAvailableHours, setTimeAvailableHours] = useState(3);
  const [distanceFromHotelKm, setDistanceFromHotelKm] = useState(15);
  const [accessibilityNeeds, setAccessibilityNeeds] = useState<TripPreferences['accessibilityNeeds']>('None');
  const [interests, setInterests] = useState<string[]>(['Beaches', 'Forts', 'Food']);
  const [activitiesSel, setActivitiesSel] = useState<string[]>(['Trekking']);
  const [transport, setTransport] = useState<TripPreferences['transport']>('Car');
  const [foodPref, setFoodPref] = useState<TripPreferences['foodPreference']>('Both');
  const [stayPref, setStayPref] = useState<TripPreferences['stayPreference']>('Mid-range');
  const [seasonChoice, setSeasonChoice] = useState<SeasonChoice>('auto');

  const [generating, setGenerating]   = useState(false);
  const [aiStatus, setAiStatus]       = useState('');
  const [usedAI, setUsedAI]           = useState<boolean | null>(null);
  const [result, setResult]           = useState<ItineraryResult | null>(null);
  const [savedId, setSavedId]         = useState<string | null>(null);
  const [videoModalPlace, setVideoModalPlace] = useState<Place | null>(null);

  const toggle = (arr: string[], set: (v: string[]) => void, val: string) =>
    set(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);

  const handleGenerate = async () => {
    setGenerating(true);
    setResult(null);
    setSavedId(null);
    setUsedAI(null);
    setAiStatus('Preparing your trip…');

    const resolvedSeason = seasonChoice === 'auto' ? getCurrentSeason() : seasonChoice;

    const prefs: TripPreferences = {
      destinationId, days, travelers, budget, interests, activities: activitiesSel,
      transport, foodPreference: foodPref, stayPreference: stayPref,
      travelerType, timeAvailableHours, distanceFromHotelKm, accessibilityNeeds,
    };

    const { result: res, usedAI: ai } = await generateWithGemini(prefs, setAiStatus, resolvedSeason, places);
    setResult(res);
    setUsedAI(ai);
    setGenerating(false);
    setAiStatus('');
  };

  const handleSave = async () => {
    if (!result || result.days.length === 0) return;
    const prefs: TripPreferences = {
      destinationId, days, travelers, budget, interests, activities: activitiesSel,
      transport, foodPreference: foodPref, stayPreference: stayPref,
      travelerType, timeAvailableHours, distanceFromHotelKm, accessibilityNeeds,
    };
    const title = `${days}-day ${ratnagiriDestination.name} trip · ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`;
    const saved = await saveTrip(title, prefs, result.days, result.totalCost);
    if (saved) setSavedId(saved.id);
  };

  return (
    <div className="container-page py-10">
      <header className="mb-8 max-w-2xl">
        <p className="section-eyebrow">AI Trip Planner</p>
        <h1 className="section-title mt-1">Plan your Ratnagiri trip</h1>
        <p className="mt-2 text-navy-500">
          Tell us your preferences. RoamIQ builds a personalized day-by-day itinerary using real Ratnagiri destination data — places, restaurants, providers and stays.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[400px_1fr]">
        {/* Preferences form */}
        <div className="card h-fit p-6 lg:sticky lg:top-24">
          <h2 className="flex items-center gap-2 text-lg font-bold text-navy-900">
            <Sparkles size={18} className="text-ocean-600" /> Your preferences
          </h2>

          <div className="mt-5 space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label flex items-center gap-1.5"><Calendar size={14} /> Days</label>
                <input type="number" min={1} max={10} value={days} onChange={(e) => setDays(Math.max(1, Math.min(10, +e.target.value || 1)))} className="input" />
              </div>
              <div>
                <label className="label flex items-center gap-1.5"><Users size={14} /> Travelers</label>
                <input type="number" min={1} max={20} value={travelers} onChange={(e) => setTravelers(Math.max(1, Math.min(20, +e.target.value || 1)))} className="input" />
              </div>
            </div>

            <div>
              <label className="label flex items-center gap-1.5"><Wallet size={14} /> Budget (₹)</label>
              <input type="range" min={2000} max={50000} step={500} value={budget} onChange={(e) => setBudget(+e.target.value)} className="w-full accent-ocean-600" />
              <div className="mt-1 flex justify-between text-xs text-navy-500">
                <span>₹2,000</span>
                <span className="font-bold text-navy-800">₹{budget.toLocaleString('en-IN')}</span>
                <span>₹50,000</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Traveler type</label>
                <select value={travelerType} onChange={(e) => setTravelerType(e.target.value as TripPreferences['travelerType'])} className="input">
                  {['Solo', 'Couple', 'Family', 'Friends', 'Senior'].map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Time available</label>
                <input type="number" min={1} max={12} value={timeAvailableHours} onChange={(e) => setTimeAvailableHours(Math.max(1, Math.min(12, +e.target.value || 1)))} className="input" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Distance from hotel</label>
                <input type="number" min={1} max={50} value={distanceFromHotelKm} onChange={(e) => setDistanceFromHotelKm(Math.max(1, Math.min(50, +e.target.value || 1)))} className="input" />
              </div>
              <div>
                <label className="label">Accessibility</label>
                <select value={accessibilityNeeds} onChange={(e) => setAccessibilityNeeds(e.target.value as TripPreferences['accessibilityNeeds'])} className="input">
                  {['None', 'Mobility support', 'Low walking', 'Quiet spaces'].map((need) => (
                    <option key={need} value={need}>{need}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="label">Interests</label>
              <div className="flex flex-wrap gap-2">
                {interestOptions.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => toggle(interests, setInterests, opt)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                      interests.includes(opt) ? 'bg-ocean-600 text-white' : 'bg-navy-50 text-navy-600 hover:bg-navy-100'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Season Picker ── */}
            <div>
              <label className="label flex items-center gap-1.5">
                <CloudRain size={14} /> Season
                <span className="ml-auto text-xs font-normal text-navy-400">
                  {seasonChoice === 'auto' ? `Auto → ${getCurrentSeason()}` : ''}
                </span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {SEASON_OPTIONS.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setSeasonChoice(s.value)}
                    className={`flex items-center gap-2 rounded-xl border-2 px-3 py-2.5 text-left transition-all ${
                      seasonChoice === s.value
                        ? `${s.color} ${s.border} shadow-sm scale-[1.02]`
                        : 'border-transparent bg-navy-50 text-navy-500 hover:bg-navy-100'
                    }`}
                  >
                    <span className="text-lg leading-none">{s.emoji}</span>
                    <div>
                      <p className="text-xs font-bold leading-tight">{s.label}</p>
                      <p className="text-[10px] leading-tight opacity-70">{s.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label">Preferred activities</label>
              <div className="flex flex-wrap gap-2">
                {(['Trekking', 'Water Activities', 'Boating', 'Adventure', 'Cultural Experiences', 'Photography', 'Local Experiences'] as const).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => toggle(activitiesSel, setActivitiesSel, opt)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                      activitiesSel.includes(opt) ? 'bg-sand-500 text-white' : 'bg-navy-50 text-navy-600 hover:bg-navy-100'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label">Transport</label>
              <div className="grid grid-cols-2 gap-2">
                {transportOptions.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTransport(t)}
                    className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${transport === t ? 'bg-ocean-600 text-white' : 'bg-navy-50 text-navy-600 hover:bg-navy-100'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label flex items-center gap-1.5"><UtensilsCrossed size={14} /> Food</label>
                <select value={foodPref} onChange={(e) => setFoodPref(e.target.value as TripPreferences['foodPreference'])} className="input">
                  {foodOptions.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className="label flex items-center gap-1.5"><Bed size={14} /> Stay</label>
                <select value={stayPref} onChange={(e) => setStayPref(e.target.value as TripPreferences['stayPreference'])} className="input">
                  {stayOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <button onClick={handleGenerate} disabled={generating} className="btn-primary w-full text-base">
              {generating ? <><Loader2 size={18} className="animate-spin" /> Generating…</> : <><Sparkles size={18} /> Generate itinerary</>}
            </button>
          </div>
        </div>

        {/* Result */}
        <div>
          {generating && <AIProgressCard status={aiStatus} />}

          {!generating && !result && (
            <div className="card flex flex-col items-center justify-center gap-4 p-12 text-center">
              <span className="grid h-16 w-16 place-items-center rounded-full bg-ocean-50 text-ocean-500">
                <Route size={28} />
              </span>
              <div>
                <p className="text-lg font-semibold text-navy-800">Your itinerary will appear here</p>
                <p className="mt-1 max-w-sm text-sm text-navy-500">
                  Set your preferences and tap "Generate itinerary". Try the demo: family trip, 3 hours available, 15 km from hotel, mobility-friendly path, ₹10,000 budget, Beaches + Forts + Food.
                </p>
              </div>
            </div>
          )}

          {!generating && result && (
            <div className="space-y-6 animate-fade-in">
              {/* IMPOSSIBLE — budget too low */}
              {result.budgetStatus === 'IMPOSSIBLE' && (
                <div className="card border-2 border-error-200 p-8 text-center">
                  <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-error-50 text-error-500">
                    <AlertTriangle size={28} />
                  </span>
                  <h2 className="mt-4 text-xl font-bold text-navy-900">Budget too low</h2>
                  <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-navy-600">
                    {result.budgetNote}
                  </p>
                  <div className="mt-4 flex items-center justify-center gap-3 text-sm">
                    <span className="chip bg-error-50 text-error-700">
                      <Wallet size={12} /> Your budget: ₹{result.budget.toLocaleString('en-IN')}
                    </span>
                    <span className="chip bg-navy-50 text-navy-700">
                      Min. possible: ₹{result.totalCost.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              )}

              {/* Normal result (UNDER_BUDGET, AT_BUDGET, OVER_BUDGET_UNAVOIDABLE) */}
              {result.budgetStatus !== 'IMPOSSIBLE' && (
                <>
              {/* AI / Local engine badge */}
              {usedAI !== null && (
                <div className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold animate-fade-in ${
                  usedAI
                    ? 'bg-gradient-to-r from-ocean-50 to-navy-50 border border-ocean-200 text-ocean-800'
                    : 'bg-navy-50 border border-navy-200 text-navy-600'
                }`}>
                  {usedAI ? (
                    <><Bot size={16} className="text-ocean-600" /> Itinerary generated by <strong>Gemini AI</strong> — personalised with real Ratnagiri data</>
                  ) : (
                    <><Zap size={16} className="text-sand-500" /> Generated by smart local planner &nbsp;·&nbsp; <span className="text-xs font-normal">Add <code className="rounded bg-navy-100 px-1">VITE_GEMINI_API_KEY</code> to .env to enable Gemini AI</span></>
                  )}
                </div>
              )}

              {/* Summary bar */}
              <div className="card p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-navy-900">Your {days}-day Ratnagiri itinerary</h2>
                    <p className="mt-1 text-sm text-navy-500">
                      {travelers} travelers · {travelerType} profile · {timeAvailableHours}h available · {distanceFromHotelKm} km from hotel · {accessibilityNeeds}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`rounded-2xl px-4 py-2 text-center ${
                      result.budgetStatus === 'UNDER_BUDGET' ? 'bg-success-50'
                      : result.budgetStatus === 'AT_BUDGET' ? 'bg-ocean-50'
                      : 'bg-warning-50'
                    }`}>
                      <p className="text-xs font-semibold text-navy-500">Estimated cost</p>
                      <p className={`text-lg font-extrabold ${
                        result.budgetStatus === 'UNDER_BUDGET' ? 'text-success-700'
                        : result.budgetStatus === 'AT_BUDGET' ? 'text-ocean-700'
                        : 'text-warning-700'
                      }`}>
                        ₹{result.totalCost.toLocaleString('en-IN')}
                      </p>
                    </div>
                    <span className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                      result.budgetStatus === 'UNDER_BUDGET' ? 'bg-success-100 text-success-700'
                      : result.budgetStatus === 'AT_BUDGET' ? 'bg-ocean-100 text-ocean-700'
                      : 'bg-warning-100 text-warning-700'
                    }`}>
                      {result.budgetStatus === 'UNDER_BUDGET' && <><CheckCircle2 size={12} /> Within budget</>}
                      {result.budgetStatus === 'AT_BUDGET' && <><CheckCircle2 size={12} /> Exactly at budget</>}
                      {result.budgetStatus === 'OVER_BUDGET_UNAVOIDABLE' && <><TrendingUp size={12} /> Over by ₹{(result.totalCost - budget).toLocaleString('en-IN')}</>}
                    </span>
                  </div>
                </div>

                {/* Budget adjustment note */}
                {result.budgetNote && (
                  <div className={`mt-4 flex items-start gap-2 rounded-xl p-3 text-xs leading-relaxed ${
                    result.budgetStatus === 'OVER_BUDGET_UNAVOIDABLE' ? 'bg-warning-50 text-warning-800' : 'bg-ocean-50 text-ocean-800'
                  }`}>
                    {result.budgetStatus === 'OVER_BUDGET_UNAVOIDABLE' ? <AlertTriangle size={14} className="mt-0.5 shrink-0" /> : <Info size={14} className="mt-0.5 shrink-0" />}
                    <div>
                      <p>{result.budgetNote}</p>
                      {result.budgetConflicts && result.budgetConflicts.length > 0 && (
                        <ul className="mt-1.5 list-inside list-disc space-y-0.5 opacity-80">
                          {result.budgetConflicts.map((c, i) => <li key={i}>{c}</li>)}
                        </ul>
                      )}
                    </div>
                  </div>
                )}

                <div className="mt-4 flex flex-wrap gap-2">
                  {savedId ? (
                    <span className="chip bg-success-100 text-success-700">
                      <CheckCircle2 size={12} /> Trip saved to your profile
                    </span>
                  ) : (
                    <button onClick={handleSave} className="btn-secondary text-sm">
                      <Bookmark size={15} /> Save this trip
                    </button>
                  )}
                  <button onClick={() => navigate({ name: 'map', destinationId })} className="btn-ghost text-sm">
                    <MapPin size={15} /> View on map
                  </button>
                </div>
              </div>

              {/* Days */}
              {result.days.map((day, di) => (
                <div key={day.day} className="card overflow-hidden animate-fade-up" style={{ animationDelay: `${di * 80}ms` }}>
                  <div className="flex items-center justify-between bg-navy-900 px-6 py-4 text-white">
                    <div className="flex items-center gap-3">
                      <span className="grid h-10 w-10 place-items-center rounded-full bg-ocean-500 font-bold">
                        {day.day}
                      </span>
                      <div>
                        <p className="font-bold">Day {day.day}</p>
                        <p className="text-xs text-white/70">{day.theme}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-white/60">Day cost</p>
                      <p className="font-bold">₹{day.estimatedCost.toLocaleString('en-IN')}</p>
                    </div>
                  </div>

                  <div className="divide-y divide-navy-50">
                    {day.items.map((item, ii) => {
                      const Icon = itemIcon[item.type] ?? MapPin;
                      return (
                        <div key={ii} className="flex gap-4 p-5">
                          <div className="flex flex-col items-center">
                            <span className={`grid h-10 w-10 place-items-center rounded-full ${itemColor[item.type]}`}>
                              <Icon size={17} />
                            </span>
                            {ii < day.items.length - 1 && <span className="mt-1 w-px flex-1 bg-navy-100" />}
                          </div>
                          <div className="flex-1 pb-2">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="text-xs font-semibold text-ocean-600">{item.time}</p>
                                <h4 className="mt-0.5 font-bold text-navy-900">{item.title}</h4>
                                <p className="text-sm text-navy-500">{item.subtitle}</p>
                              </div>
                              <div className="text-right shrink-0">
                                <span className="flex items-center gap-1 text-xs text-navy-500">
                                  <Clock size={12} /> {item.duration}
                                </span>
                                {item.cost > 0 && (
                                  <p className="mt-1 text-sm font-bold text-navy-800">₹{item.cost.toLocaleString('en-IN')}</p>
                                )}
                              </div>
                            </div>
                            <p className="mt-2 rounded-xl bg-navy-50 px-3 py-2 text-xs leading-relaxed text-navy-600">
                              <span className="font-semibold text-navy-700">Why: </span>{item.reason}
                            </p>

                            {/* Video Preview Trigger */}
                            {item.videoUrl && (
                              <button
                                onClick={() => {
                                  const matchingPlace = places.find((p) => p.id === item.refId) ?? {
                                    id: item.refId ?? 'tmp',
                                    destinationId,
                                    name: item.title,
                                    category: item.subtitle as any,
                                    description: item.reason,
                                    image: 'https://images.pexels.com/photos/3974375/pexels-photo-3974375.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
                                    videoUrl: item.videoUrl,
                                    seasonalHighlight: item.seasonalHighlight,
                                    location: 'Ratnagiri',
                                    lat: 17.0, lng: 73.3,
                                    openingTime: '6:00 AM', closingTime: '6:00 PM', entryFee: 'Free', bestTimeToVisit: 'Monsoon', visitDuration: item.duration, rating: 4.8, reviewsCount: 100, isHiddenGem: false
                                  };
                                  setVideoModalPlace(matchingPlace);
                                }}
                                className="mt-2 text-xs font-bold text-ocean-700 bg-ocean-50 border border-ocean-200 px-3 py-1.5 rounded-xl hover:bg-ocean-100 transition flex items-center gap-1.5 w-fit"
                              >
                                <Video size={13} className="text-sand-500" /> Watch Spot Video 🎥
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-2 bg-navy-50 px-6 py-3 text-xs text-navy-500">
                    <Route size={14} className="text-ocean-500" /> {day.travelNote}
                  </div>
                </div>
              ))}
                </>
              )}

              {/* Saved trips */}
              {trips.length > 0 && (
                <div className="card p-6">
                  <h3 className="text-lg font-bold text-navy-900">Your saved trips</h3>
                  <div className="mt-4 space-y-3">
                    {trips.map((t) => (
                      <div key={t.id} className="flex items-center justify-between rounded-2xl border border-navy-100 p-4">
                        <div>
                          <p className="font-semibold text-navy-800">{t.title}</p>
                          <p className="text-xs text-navy-500">
                            {t.preferences.days} days · {t.preferences.travelers} travelers · ₹{Number(t.totalCost).toLocaleString('en-IN')}
                          </p>
                        </div>
                        <button onClick={() => deleteTrip(t.id)} className="grid h-9 w-9 place-items-center rounded-full bg-error-50 text-error-600 hover:bg-error-100">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <VideoModal place={videoModalPlace} onClose={() => setVideoModalPlace(null)} />
    </div>
  );
}
