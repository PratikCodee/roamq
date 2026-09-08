import { useState, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  Compass, MapPin, Sparkles, Mountain, UtensilsCrossed, Hotel,
  Search, X, SearchX, Users, HeartHandshake, User, ArrowRight, Leaf, Anchor
} from 'lucide-react';
import { useRouter } from '@/router/Router';
import { ratnagiriDestination } from '@/data/sampleData';
import { searchAll, bestBucket } from '@/lib/search';
import type { SearchBucket } from '@/lib/search';
import Magnetic from '@/components/ui/Magnetic';
import ratnagiriBg from '@/assets/ratnagiri_bg.png';

const features = [
  { icon: Compass,         title: 'Destination Discovery', desc: 'Curated places, hidden gems & beaches matched to your intent.',      span: 'md:col-span-2 md:row-span-2', image: ratnagiriDestination.galleryImages[0] },
  { icon: Mountain,        title: 'Local Experiences',     desc: 'Trekking, boating & village walks with trusted local guides.',         span: 'md:col-span-1' },
  { icon: Sparkles,        title: 'Smart Trip Planning',   desc: 'AI itineraries built around your time and budget.',                   span: 'md:col-span-1' },
  { icon: Hotel,           title: 'Hotels & Stays',        desc: 'Beach resorts, mango homestays & hill retreats.',                    span: 'md:col-span-1 md:row-span-2', image: ratnagiriDestination.galleryImages[1] },
  { icon: UtensilsCrossed, title: 'Local Food',            desc: 'Konkan thalis, fresh seafood & Alphonso mango delicacies.',           span: 'md:col-span-2', image: ratnagiriDestination.galleryImages[2] },
];

const travelerProfiles = [
  { emoji: '👨‍👩‍👧', title: 'Family in 2 hours',  detail: 'Beach + food + culture with easy transport.',   icon: Users },
  { emoji: '💑',      title: 'Couple under ₹3k',  detail: 'Sunset viewpoint, beach dinner, hidden gem.',   icon: HeartHandshake },
  { emoji: '🧗',      title: 'Adventure group',   detail: 'Trekking, boating, and local experiences.',     icon: Mountain },
  { emoji: '🌅',      title: 'Senior traveler',   detail: 'Low-walking routes and scenic viewpoints.',     icon: User },
];

const seasons = [
  { label: 'Monsoon 🌧️', desc: 'Lush waterfalls' },
  { label: 'Winter ☀️',  desc: 'Best beaches'    },
  { label: 'Summer 🥭',  desc: 'Mango season'    },
  { label: 'Treks 🥾',   desc: 'Sahyadri trails' },
  { label: 'Beaches 🏖️', desc: 'Coastal escapes' },
  { label: 'Heritage 🏰',desc: 'Forts & temples' },
];

const bucketLabels: Record<SearchBucket, string> = {
  places: 'Places', hotels: 'Hotels', food: 'Food & Restaurants', activities: 'Activities',
};

const heroWords = ['Discover', 'Ratnagiri', 'Like', 'Never', 'Before'];

export function LandingPage() {
  const { navigate } = useRouter();
  const [query, setQuery]         = useState('');
  const [submitted, setSubmitted] = useState(false);

  const results    = submitted ? searchAll(query) : [];
  const hasMatches = results.some(r => r.count > 0);
  const noResults  = submitted && query.trim() !== '' && !hasMatches;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (!query.trim()) return;
    const bucket = bestBucket(query);
    if (!bucket) return;
    navigate({ name: bucket, destinationId: ratnagiriDestination.id, q: query.trim() });
  };
  const clearSearch = () => { setQuery(''); setSubmitted(false); };

  // Horizontal showcase
  const scrollRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: scrollRef });
  const x = useTransform(scrollYProgress, [0, 1], ['0%', '-60%']);

  return (
    <div className="font-sans overflow-x-hidden relative">

      {/* ══════ BACKGROUND — your original image, scrolls with page ══════ */}
      <div className="absolute inset-0 -z-20" style={{ minHeight: '100%' }}>
        <img
          src={ratnagiriBg}
          alt=""
          aria-hidden
          className="w-full h-full object-cover object-top"
          style={{ minHeight: '100vh' }}
        />
      </div>
      {/* Light dark scrim only — no colour tint */}
      <div className="absolute inset-0 -z-10 bg-black/38" style={{ minHeight: '100%' }} />

      {/* ══════════════════════ 1. HERO ══════════════════════════ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 pt-24 pb-16">

        {/* Location badge */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 text-white/90 text-sm font-medium px-5 py-2 rounded-full mb-10"
        >
          <Leaf size={13} className="text-green-300" />
          Konkan Coast · Maharashtra
          <Anchor size={13} className="text-blue-300" />
        </motion.div>

        {/* Headline */}
        <h1 className="font-display text-5xl sm:text-7xl lg:text-[5.5rem] font-semibold text-white leading-[1.04] tracking-tight flex flex-wrap justify-center gap-x-[0.3em] overflow-hidden drop-shadow-2xl pb-6">
          {heroWords.map((word, i) => (
            <motion.span
              key={i}
              initial={{ y: '110%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7, delay: i * 0.1 + 0.1, ease: [0.33, 1, 0.68, 1] }}
              className="inline-block"
            >
              {i === 1
                ? <span className="text-orange-300 drop-shadow-[0_8px_16px_rgba(0,0,0,0.85)]">{word}</span>
                : word}
            </motion.span>
          ))}
        </h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.7 }}
          className="mt-6 max-w-xl text-lg sm:text-xl text-white/80 font-light leading-relaxed drop-shadow"
        >
          Smart itineraries, local experiences, and hidden gems — matched to your style, time, and budget.
        </motion.p>

        {/* Search */}
        <motion.form
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.9 }}
          onSubmit={handleSearch}
          className="mt-10 w-full max-w-2xl relative"
        >
          <div className="flex items-center bg-white/90 backdrop-blur-md rounded-full shadow-2xl border border-white/30 px-5 py-2 gap-2">
            <Search className="text-gray-400 shrink-0" size={20} />
            <input
              value={query}
              onChange={e => { setQuery(e.target.value); setSubmitted(false); }}
              placeholder="Search beaches, forts, hotels, food…"
              className="flex-1 bg-transparent py-3 px-2 text-base text-gray-800 placeholder-gray-400 focus:outline-none"
            />
            {query && (
              <button type="button" onClick={clearSearch} className="p-2 text-gray-400 hover:text-gray-700">
                <X size={16} />
              </button>
            )}
            <Magnetic>
              <button
                type="submit"
                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-7 py-3 rounded-full transition-colors shadow-lg text-sm"
              >
                Explore
              </button>
            </Magnetic>
          </div>

          {hasMatches && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="absolute top-full mt-3 left-0 w-full flex flex-wrap gap-2 justify-center">
              {results.filter(r => r.count > 0).map(r => (
                <button key={r.bucket}
                  onClick={() => navigate({ name: r.bucket, destinationId: ratnagiriDestination.id, q: query.trim() })}
                  className="bg-white/90 backdrop-blur text-gray-800 border border-white/40 text-sm px-4 py-2 rounded-full hover:bg-white transition shadow-md">
                  {bucketLabels[r.bucket]} ({r.count})
                </button>
              ))}
            </motion.div>
          )}
          {noResults && (
            <div className="absolute top-full mt-3 left-0 w-full flex items-center gap-2 text-sm text-red-200 bg-red-900/50 border border-red-400/30 backdrop-blur px-4 py-3 rounded-2xl">
              <SearchX size={16} /> No results for "{query}". Try "beach", "fort", or "food".
            </div>
          )}
        </motion.form>

        {/* Quick stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-10 flex flex-wrap justify-center gap-3 text-sm"
        >
          {['🌊 167 km Coastline', '📍 40+ Places', '⭐ 4.7 Avg Rating'].map((s, i) => (
            <span key={i} className="bg-white/15 backdrop-blur-sm border border-white/20 text-white px-4 py-2 rounded-full font-medium">
              {s}
            </span>
          ))}
        </motion.div>
      </section>

      {/* ══════════════ 2. SEASONS STRIP ══════════════ */}
      <section className="py-12 overflow-hidden bg-black/20 backdrop-blur-sm border-y border-white/10">
        <p className="text-white/60 text-sm font-semibold uppercase tracking-[0.2em] px-8 md:px-12 mb-6">Explore by Season</p>
        <motion.div
          drag="x"
          dragConstraints={{ left: -700, right: 0 }}
          dragElastic={0.08}
          className="flex gap-4 px-8 md:px-12 w-max cursor-grab active:cursor-grabbing"
        >
          {seasons.map((s, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              className="bg-white rounded-[20px] px-8 py-5 shrink-0 shadow-lg hover:shadow-xl transition-all select-none border border-white/20"
            >
              <p className="font-display font-bold text-slate-800 text-lg tracking-tight mb-1">{s.label}</p>
              <p className="text-slate-500 text-sm font-medium">{s.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ══════════════ 3. FEATURES GRID ══════════════ */}
      <section className="container-page py-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-14"
        >
          <p className="text-orange-400 font-semibold uppercase tracking-widest text-sm mb-4">What We Offer</p>
          <h2 className="font-display text-4xl lg:text-6xl text-white tracking-tight drop-shadow-md">
            Curated for <span className="italic font-light text-orange-100">every vibe.</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:auto-rows-[220px]">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.07 }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className={`${f.span} bg-white/50 backdrop-blur-2xl rounded-3xl flex flex-col justify-between shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.2)] transition-all duration-300 relative overflow-hidden group border border-white/60`}
            >
              {f.image && (
                <div className="absolute inset-0 z-0 overflow-hidden">
                  <img src={f.image} alt={f.title} className="w-full h-full object-cover opacity-40 group-hover:opacity-60 group-hover:scale-105 transition-all duration-700 mix-blend-overlay" />
                  <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/50 to-transparent" />
                </div>
              )}
              <div className="relative z-10 p-8 h-full flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-white/80 shadow-sm flex items-center justify-center mb-6 group-hover:bg-white group-hover:scale-105 transition-all duration-300 backdrop-blur-md">
                    <f.icon size={24} className="text-orange-600" />
                  </div>
                  <h3 className="font-display text-2xl font-bold text-slate-900 mb-3 tracking-tight">{f.title}</h3>
                  <p className="text-slate-800 text-base leading-relaxed font-medium">{f.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══════════════ 4. HORIZONTAL SHOWCASE ══════════════ */}
      <section ref={scrollRef} className="relative h-[280vh]">
        <div className="sticky top-0 h-screen flex items-center overflow-hidden bg-black/25 backdrop-blur-sm">
          <motion.div style={{ x }} className="flex gap-8 pl-10 lg:pl-24 items-center will-change-transform">

            <div className="w-[80vw] md:w-[38vw] shrink-0 pr-10">
              <p className="text-orange-300 font-semibold uppercase tracking-widest text-xs mb-5">The Destination</p>
              <h2 className="font-display text-5xl md:text-6xl text-white mb-6 leading-tight drop-shadow-lg">
                Ratnagiri <br /><span className="italic text-white/40">Showcase</span>
              </h2>
              <p className="text-white/70 leading-relaxed text-base font-light mb-10 line-clamp-5">{ratnagiriDestination.overview}</p>
              <Magnetic>
                <button
                  onClick={() => navigate({ name: 'destination', destinationId: ratnagiriDestination.id })}
                  className="inline-flex items-center gap-2 bg-white text-gray-900 font-semibold px-8 py-4 rounded-full hover:bg-orange-50 transition-colors shadow-xl text-sm"
                >
                  Open Destination Guide <ArrowRight size={16} />
                </button>
              </Magnetic>
            </div>

            {ratnagiriDestination.galleryImages.map((img, i) => (
              <div key={i} className="w-[88vw] md:w-[55vw] h-[65vh] shrink-0 rounded-2xl overflow-hidden relative group shadow-2xl">
                <img
                  src={img}
                  alt={ratnagiriDestination.highlights[i] || 'Ratnagiri'}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute bottom-8 left-8 right-8">
                  <span className="text-xs text-white/60 uppercase tracking-widest font-semibold">
                    <MapPin size={10} className="inline mr-1" />Highlight
                  </span>
                  <h3 className="text-2xl text-white font-display mt-1">{ratnagiriDestination.highlights[i] || 'Coastal Beauty'}</h3>
                </div>
              </div>
            ))}
            <div className="w-12 shrink-0" />
          </motion.div>
        </div>
      </section>

      {/* ══════════════ 5. TRAVELER PROFILES ══════════════ */}
      <section className="container-page py-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-orange-400 font-semibold uppercase tracking-widest text-sm mb-4">Made For Everyone</p>
          <h2 className="font-display text-4xl lg:text-6xl text-white tracking-tight drop-shadow-md">
            Tailored to your <span className="italic font-light text-orange-100">travel style.</span>
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {travelerProfiles.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className="bg-white/50 backdrop-blur-2xl rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.2)] transition-all duration-300 group relative overflow-hidden border border-white/60"
            >
              <div className="text-5xl mb-6 transform group-hover:scale-110 transition-transform duration-300 origin-left drop-shadow-sm">{p.emoji}</div>
              <h4 className="font-display text-xl font-bold text-slate-900 mb-3 tracking-tight">{p.title}</h4>
              <p className="text-slate-800 text-sm leading-relaxed font-medium">{p.detail}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══════════════ 6. CTA ══════════════ */}
      <section className="container-page pb-28">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="bg-white/90 backdrop-blur-sm rounded-3xl p-12 md:p-20 text-center shadow-2xl relative overflow-hidden"
        >
          <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-orange-100 opacity-50 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-green-100 opacity-50 blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <Leaf className="text-green-500 mx-auto mb-5" size={32} />
            <h2 className="font-display text-4xl md:text-5xl text-gray-900 mb-5 tracking-tight">Ready to explore?</h2>
            <p className="text-gray-500 text-base font-light max-w-lg mx-auto mb-10 leading-relaxed">
              Get an AI-generated itinerary tailored to your time, group, and budget.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Magnetic>
                <button
                  onClick={() => navigate({ name: 'planner', destinationId: ratnagiriDestination.id })}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-10 py-4 rounded-full transition-colors shadow-lg text-sm"
                >
                  Start Planning — It's Free
                </button>
              </Magnetic>
              <button
                onClick={() => navigate({ name: 'destination', destinationId: ratnagiriDestination.id })}
                className="border border-gray-200 text-gray-700 px-10 py-4 rounded-full hover:bg-gray-50 transition-colors text-sm"
              >
                Browse Destination
              </button>
            </div>
          </div>
        </motion.div>
      </section>

    </div>
  );
}
