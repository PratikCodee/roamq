import type {
  TripPreferences, ItineraryDay, ItineraryItem, Place, Restaurant, Provider, Activity, Hotel,
} from '@/types';
import { places, restaurants, providers, activities, hotels } from '@/data/sampleData';

// ── Public types ──────────────────────────────────────────────────────────────

export type BudgetStatus = 'UNDER_BUDGET' | 'AT_BUDGET' | 'OVER_BUDGET_UNAVOIDABLE' | 'IMPOSSIBLE';

export interface ItineraryResult {
  days: ItineraryDay[];
  totalCost: number;
  budget: number;
  budgetStatus: BudgetStatus;
  /** Human-readable notes when budget is exceeded or impossible. */
  budgetNote?: string;
  /** Which preference(s) caused the budget conflict. */
  budgetConflicts?: string[];
}

// ── Constants ──────────────────────────────────────────────────────────────────

/** Per-person daily buffer for snacks, water, and local transport. */
const PER_PERSON_DAILY_FOOD = 600;

// ── Interest → place category mapping ──────────────────────────────────────────

const interestToCategory: Record<string, string[]> = {
  Beaches:       ['Beach'],
  Forts:         ['Fort', 'Heritage'],
  Temples:       ['Temple'],
  Nature:        ['Nature', 'Waterfall', 'Viewpoint'],
  'Hidden Gems': ['Hidden Gem'],
  Photography:   ['Viewpoint', 'Hidden Gem', 'Heritage'],
  Culture:       ['Temple', 'Heritage'],
  Food:          [],
  Trekking:      ['Trek'],
  Waterfalls:    ['Waterfall'],
};

// ── Season detection ──────────────────────────────────────────────────────────

type Season = 'monsoon' | 'winter' | 'summer' | 'year-round';

export function getCurrentSeason(): Season {
  const month = new Date().getMonth() + 1; // 1-12
  if (month >= 6 && month <= 9)  return 'monsoon'; // Jun–Sep
  if (month >= 10 || month <= 2) return 'winter';  // Oct–Feb
  return 'summer';                                  // Mar–May
}

/** Returns true if this place is suitable for the given season. */
function isSeasonMatch(p: Place, season: Season): boolean {
  if (!p.seasons || p.seasons.length === 0) return true; // year-round
  if (p.seasons.includes('year-round')) return true;
  return p.seasons.includes(season);
}

const transportNote: Record<TripPreferences['transport'], string> = {
  Car: 'Travel between spots by car — ~30–45 min between most points along the coastal road.',
  Bike: 'Two-wheeler is ideal for Konkan coastal roads — scenic and easy to park, ~30 min between points.',
  'Public Transport': 'Use MSRTC buses between Ratnagiri, Ganpatipule, and Jaigad. Allow extra buffer time.',
  Walking: 'Walkable clusters only — plan one area per day (e.g. Ratnagiri city or Ganpatipule).',
};

const DAY_THEMES = [
  'Arrival & Coastal Exploration',
  'Forts, Culture & Hidden Gems',
  'Adventure & Local Flavours',
  'Nature & Departure',
];

// ── Candidate matching (preference-aware) ──────────────────────────────────────

function matchPlaces(prefs: TripPreferences, seasonOverride?: string, placesPool?: Place[]): Place[] {
  const sourcePlaces = placesPool && placesPool.length > 0 ? placesPool : places;
  const wanted = new Set<string>();
  prefs.interests.forEach((i) => {
    (interestToCategory[i] ?? []).forEach((c) => wanted.add(c));
  });

  const season = (seasonOverride ?? getCurrentSeason()) as Season;
  let pool = sourcePlaces.filter((p) => !p.destinationId || p.destinationId === prefs.destinationId);

  // Filter by interest categories if specified
  if (wanted.size > 0) {
    pool = pool.filter((p) => wanted.has(p.category));
  }

  // Always ensure at least 3 places
  if (pool.length < 3) {
    const extras = sourcePlaces
      .filter((p) => (!p.destinationId || p.destinationId === prefs.destinationId) && !pool.includes(p))
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 3);
    pool = [...pool, ...extras];
  }

  // Sort: season-matched first, then hidden gems (if desired), then by rating
  pool.sort((a, b) => {
    const aSeasonMatch = isSeasonMatch(a, season) ? 1 : 0;
    const bSeasonMatch = isSeasonMatch(b, season) ? 1 : 0;
    if (aSeasonMatch !== bSeasonMatch) return bSeasonMatch - aSeasonMatch;
    if (prefs.interests.includes('Hidden Gems')) {
      if (a.isHiddenGem && !b.isHiddenGem) return -1;
      if (!a.isHiddenGem && b.isHiddenGem) return 1;
    }
    return b.rating - a.rating;
  });

  return pool;
}

function matchRestaurants(prefs: TripPreferences): Restaurant[] {
  let pool = restaurants.filter((r) => r.destinationId === prefs.destinationId);
  if (prefs.foodPreference === 'Veg') {
    const veg = pool.filter((r) => r.isVeg);
    if (veg.length > 0) pool = veg;
  }
  if (prefs.foodPreference === 'Non-Veg') {
    const nonVeg = pool.filter((r) => !r.isVeg);
    if (nonVeg.length > 0) pool = nonVeg;
  }
  return pool.sort((a, b) => b.rating - a.rating);
}

function matchProviders(prefs: TripPreferences): Provider[] {
  let pool = providers.filter((p) => p.destinationId === prefs.destinationId);
  const wantedCats = new Set(prefs.activities);
  if (wantedCats.size > 0) {
    const filtered = pool.filter((p) => wantedCats.has(p.activityCategory));
    if (filtered.length > 0) pool = filtered;
  }
  return pool.sort((a, b) => b.rating - a.rating);
}

function matchActivities(prefs: TripPreferences): Activity[] {
  let pool = activities.filter((a) => a.destinationId === prefs.destinationId);
  const wantedCats = new Set(prefs.activities);
  if (wantedCats.size > 0) {
    const filtered = pool.filter((a) => wantedCats.has(a.category));
    if (filtered.length > 0) pool = filtered;
  }
  return pool;
}

// ── Cost helpers ──────────────────────────────────────────────────────────────

function entryFeeCost(place: Place): number {
  if (place.entryFee === 'Free') return 0;
  return parseInt(place.entryFee.replace(/[^0-9]/g, '')) || 0;
}

function restaurantCost(r: Restaurant, travelers: number): number {
  return Math.round(r.priceForTwo / 2) * travelers;
}

function activityCost(a: Activity, travelers: number): number {
  return a.priceFrom * travelers;
}

function providerCost(p: Provider, travelers: number): number {
  return p.priceFrom * travelers;
}

function stayCost(h: Hotel): number {
  return h.priceFrom;
}

// ── Stay selection (sorted by preference, cheapest first within tier) ─────────

function sortedStays(prefs: TripPreferences): Hotel[] {
  const pool = hotels.filter((h) => h.destinationId === prefs.destinationId);
  if (prefs.stayPreference === 'Budget') {
    return pool.slice().sort((a, b) => a.priceFrom - b.priceFrom);
  }
  if (prefs.stayPreference === 'Luxury') {
    return pool.slice().sort((a, b) => b.priceFrom - a.priceFrom);
  }
  // Mid-range: sort by proximity to mid-range price band (~₹3,000–₹5,500)
  return pool.slice().sort((a, b) => a.priceFrom - b.priceFrom);
}

// ── Non-repeating rotation helpers ─────────────────────────────────────────────

type ScoredCandidate = Place | Restaurant | Activity | Provider;

function candidateCategory(candidate: ScoredCandidate): string {
  if ('category' in candidate) return candidate.category;
  if ('activityCategory' in candidate) return candidate.activityCategory;
  return 'Food';
}

function candidatePoint(candidate: ScoredCandidate): { lat: number; lng: number } {
  return { lat: candidate.lat, lng: candidate.lng };
}

function parseDurationMinutes(duration: string): number {
  const hours = duration.match(/(\d+(?:\.\d+)?)\s*hours?/i);
  const minutes = duration.match(/(\d+)\s*min/i);
  return Math.round((hours ? Number(hours[1]) * 60 : 0) + (minutes ? Number(minutes[1]) : 0)) || 60;
}

function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const toRadians = (value: number) => value * Math.PI / 180;
  const latDelta = toRadians(b.lat - a.lat);
  const lngDelta = toRadians(b.lng - a.lng);
  const latitudeA = toRadians(a.lat);
  const latitudeB = toRadians(b.lat);
  const haversine = Math.sin(latDelta / 2) ** 2
    + Math.cos(latitudeA) * Math.cos(latitudeB) * Math.sin(lngDelta / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

function scoreCandidate(
  candidate: ScoredCandidate,
  prefs: TripPreferences,
  recentIds: Set<string>,
  usedCategories: Set<string>,
  previousPoint: { lat: number; lng: number } | undefined,
  remainingMinutes: number,
  remainingBudget: number,
): number {
  const category = candidateCategory(candidate);
  const wantedCategories = new Set(prefs.interests.flatMap((interest) => interestToCategory[interest] ?? []));
  const wantedActivities = new Set(prefs.activities);
  const name = 'businessName' in candidate ? candidate.businessName : candidate.name;
  const description = 'description' in candidate ? candidate.description : '';
  const text = `${name} ${description} ${candidate.location}`.toLowerCase();
  const preferenceScore = wantedCategories.has(category) || wantedActivities.has(category) ? 1 : 0.3;
  const rating = 'rating' in candidate ? candidate.rating : 4;
  const ratingScore = Math.max(0, Math.min(1, (rating - 3.5) / 1.5));
  const distance = previousPoint ? distanceKm(previousPoint, candidatePoint(candidate)) : 0;
  const preferredDistance = prefs.distanceFromHotelKm ?? 15;
  const distanceScore = previousPoint ? Math.max(0, 1 - Math.max(0, distance - preferredDistance) / Math.max(preferredDistance, 10)) : 0.7;
  const duration = 'visitDuration' in candidate
    ? parseDurationMinutes(candidate.visitDuration)
    : 'duration' in candidate ? parseDurationMinutes(candidate.duration) : 60;
  const timeScore = Math.max(0, Math.min(1, remainingMinutes / Math.max(duration, remainingMinutes)));
  const mobilityConflict = text.includes('trek') || text.includes('jungle') || text.includes('cave') || text.includes('climb') || text.includes('kayak');
  const accessibilityScore = prefs.accessibilityNeeds && prefs.accessibilityNeeds !== 'None'
    ? mobilityConflict && prefs.accessibilityNeeds !== 'Quiet spaces' ? 0.05 : 1
    : 0.75;
  const categoryDiversityScore = usedCategories.has(category) ? 0.1 : 1;
  const noveltyScore = recentIds.has(candidate.id) ? 0 : 1;
  const price = 'entryFee' in candidate
    ? parseInt(candidate.entryFee.replace(/[^0-9]/g, ''), 10) || 0
    : 'priceForTwo' in candidate ? Math.round(candidate.priceForTwo / 2) * prefs.travelers : candidate.priceFrom * prefs.travelers;
  const budgetScore = price <= remainingBudget ? 1 : Math.max(0, 1 - (price - remainingBudget) / Math.max(remainingBudget, 1));

  return preferenceScore * 0.28
    + ratingScore * 0.12
    + distanceScore * 0.15
    + timeScore * 0.12
    + accessibilityScore * 0.14
    + budgetScore * 0.08
    + categoryDiversityScore * 0.07
    + noveltyScore * 0.04
    + (prefs.travelerType === 'Family' && text.includes('family') ? 0.08 : 0)
    + (prefs.travelerType === 'Couple' && (text.includes('sunset') || text.includes('scenic')) ? 0.06 : 0)
    + (prefs.travelerType === 'Senior' && !mobilityConflict ? 0.06 : 0)
    - (recentIds.has(candidate.id) ? 0.5 : 0);
}

function selectBest<T extends ScoredCandidate>(
  pool: T[],
  prefs: TripPreferences,
  recentIds: Set<string>,
  usedCategories: Set<string>,
  previousPoint: { lat: number; lng: number } | undefined,
  remainingMinutes: number,
  remainingBudget: number,
  predicate?: (candidate: T) => boolean,
): T | undefined {
  const candidates = predicate ? pool.filter(predicate) : pool;
  return candidates
    .map((candidate) => ({ candidate, score: scoreCandidate(candidate, prefs, recentIds, usedCategories, previousPoint, remainingMinutes, remainingBudget) }))
    .sort((a, b) => b.score - a.score)[0]?.candidate;
}

// ── Reason helpers ─────────────────────────────────────────────────────────────

function reasonForPlace(p: Place, prefs: TripPreferences): string {
  const reasons: string[] = [];
  if (prefs.interests.includes('Beaches') && p.category === 'Beach') reasons.push('matches your beach interest');
  if (prefs.interests.includes('Forts') && p.category === 'Fort') reasons.push('matches your fort interest');
  if (prefs.interests.includes('Temples') && p.category === 'Temple') reasons.push('matches your temple interest');
  if (prefs.interests.includes('Hidden Gems') && p.isHiddenGem) reasons.push('a hidden gem you wanted to explore');
  if (prefs.interests.includes('Nature') && ['Nature', 'Waterfall', 'Viewpoint'].includes(p.category)) reasons.push('matches your nature interest');
  if (prefs.interests.includes('Culture') && ['Temple', 'Heritage'].includes(p.category)) reasons.push('matches your culture interest');
  if (reasons.length === 0) reasons.push(`top-rated ${p.category.toLowerCase()} in Ratnagiri (${p.rating})`);
  return `Selected because it ${reasons.join(' and ')}.`;
}

function reasonForFood(r: Restaurant, prefs: TripPreferences): string {
  if (prefs.foodPreference === 'Veg' && r.isVeg) return 'Pure-veg restaurant matching your preference.';
  if (prefs.foodPreference === 'Non-Veg' && !r.isVeg) return 'Known for fresh coastal non-veg, matching your preference.';
  return `Highly rated (${r.rating}) with famous local dishes you should try.`;
}

// ── Day-plan builder ───────────────────────────────────────────────────────────

interface DayPlan {
  items: ItineraryItem[];
  dayCost: number;
}

interface BuildContext {
  prefs: TripPreferences;
  travelers: number;
  stay: Hotel | undefined;
  stayCostPerNight: number;
  matchedPlaces: Place[];
  matchedRestos: Restaurant[];
  matchedActivities: Activity[];
  matchedProviders: Provider[];
  usedPlaceIds: Set<string>;
  usedRestoIds: Set<string>;
  usedActivityIds: Set<string>;
  usedProviderIds: Set<string>;
  usedCategories: Set<string>;
  dayIndex: number;
  /** When true, skip the evening provider slot to save cost. */
  skipEveningProvider: boolean;
}

function buildDayPlan(ctx: BuildContext): DayPlan {
  const { prefs, travelers, dayIndex } = ctx;
  const items: ItineraryItem[] = [];
  let dayCost = 0;
  const availableMinutes = Math.max(180, (prefs.timeAvailableHours ?? 8) * 60);
  let remainingMinutes = availableMinutes;
  let remainingBudget = Math.max(0, prefs.budget / Math.max(1, prefs.days));
  let previousPoint: { lat: number; lng: number } | undefined;

  // ── 7:30 AM — Early morning spot (viewpoint / beach walk) ─────────────────
  if (availableMinutes >= 240) {
    const earlySpot = selectBest(
      ctx.matchedPlaces, prefs, ctx.usedPlaceIds, ctx.usedCategories,
      previousPoint, remainingMinutes, remainingBudget,
      (p) => ['Beach', 'Viewpoint', 'Nature'].includes(p.category),
    );
    if (earlySpot) {
      ctx.usedPlaceIds.add(earlySpot.id);
      ctx.usedCategories.add(candidateCategory(earlySpot));
      const cost = entryFeeCost(earlySpot);
      items.push({
        time: '7:30 AM', type: 'place',
        title: earlySpot.name, subtitle: earlySpot.category,
        duration: '1 hour', cost,
        reason: `A peaceful early morning start — ${reasonForPlace(earlySpot, prefs)}`,
        refId: earlySpot.id,
        videoUrl: earlySpot.videoUrl,
        seasonalHighlight: earlySpot.seasonalHighlight,
      });
      dayCost += cost;
      remainingBudget -= cost;
      remainingMinutes -= 60;
      previousPoint = candidatePoint(earlySpot);
    }
  }

  // ── 9:30 AM — Main morning place ──────────────────────────────────────────
  const morningPlace = selectBest(
    ctx.matchedPlaces, prefs, ctx.usedPlaceIds, ctx.usedCategories,
    previousPoint, remainingMinutes, remainingBudget,
  );
  if (morningPlace) {
    ctx.usedPlaceIds.add(morningPlace.id);
    ctx.usedCategories.add(candidateCategory(morningPlace));
    const cost = entryFeeCost(morningPlace);
    items.push({
      time: '9:30 AM', type: 'place',
      title: morningPlace.name, subtitle: morningPlace.category,
      duration: morningPlace.visitDuration, cost,
      reason: reasonForPlace(morningPlace, prefs),
      refId: morningPlace.id,
      videoUrl: morningPlace.videoUrl,
      seasonalHighlight: morningPlace.seasonalHighlight,
    });
    dayCost += cost;
    remainingBudget -= cost;
    remainingMinutes -= parseDurationMinutes(morningPlace.visitDuration);
    previousPoint = candidatePoint(morningPlace);
  }

  // ── 11:30 AM — Activity / second morning place ────────────────────────────
  if (prefs.activities.length > 0 && availableMinutes >= 300) {
    const morningActivity = selectBest(
      ctx.matchedActivities, prefs, ctx.usedActivityIds, ctx.usedCategories,
      previousPoint, remainingMinutes, remainingBudget,
      (a) => prefs.activities.includes(a.category),
    );
    if (morningActivity) {
      ctx.usedActivityIds.add(morningActivity.id);
      ctx.usedCategories.add(candidateCategory(morningActivity));
      const provider = selectBest(
        ctx.matchedProviders, prefs, ctx.usedProviderIds, ctx.usedCategories,
        previousPoint, remainingMinutes, remainingBudget,
        (p) => p.activitiesOffered.includes(morningActivity.name),
      );
      if (provider) ctx.usedProviderIds.add(provider.id);
      const cost = provider ? providerCost(provider, travelers) : activityCost(morningActivity, travelers);
      items.push({
        time: '11:30 AM', type: provider ? 'provider' : 'activity',
        title: morningActivity.name,
        subtitle: provider ? `with ${provider.businessName}` : morningActivity.category,
        duration: morningActivity.duration, cost,
        reason: provider
          ? `Matches your "${prefs.activities.join(', ')}" interest. ${provider.businessName} (${provider.rating}★) suits a group of ${travelers}.`
          : `Matches your preferred activity: ${morningActivity.category}.`,
        refId: provider?.id ?? morningActivity.id,
      });
      dayCost += cost;
      remainingBudget -= cost;
      remainingMinutes -= parseDurationMinutes(morningActivity.duration);
      previousPoint = candidatePoint(provider ?? morningActivity);
      if (provider) ctx.usedCategories.add(candidateCategory(provider));
    } else {
      // No activity matches — add a second place instead
      const secondPlace = selectBest(
        ctx.matchedPlaces, prefs, ctx.usedPlaceIds, ctx.usedCategories,
        previousPoint, remainingMinutes, remainingBudget,
        (p) => p.id !== morningPlace?.id,
      );
      if (secondPlace) {
        ctx.usedPlaceIds.add(secondPlace.id);
        ctx.usedCategories.add(candidateCategory(secondPlace));
        const cost = entryFeeCost(secondPlace);
        items.push({
          time: '11:30 AM', type: 'place',
          title: secondPlace.name, subtitle: secondPlace.category,
          duration: secondPlace.visitDuration, cost,
          reason: reasonForPlace(secondPlace, prefs),
          refId: secondPlace.id,
          videoUrl: secondPlace.videoUrl,
          seasonalHighlight: secondPlace.seasonalHighlight,
        });
        dayCost += cost;
        remainingBudget -= cost;
        remainingMinutes -= parseDurationMinutes(secondPlace.visitDuration);
        previousPoint = candidatePoint(secondPlace);
      }
    }
  } else {
    // No activities selected — add a second place
    const secondPlace = selectBest(
      ctx.matchedPlaces, prefs, ctx.usedPlaceIds, ctx.usedCategories,
      previousPoint, remainingMinutes, remainingBudget,
      (p) => p.id !== morningPlace?.id,
    );
    if (secondPlace) {
      ctx.usedPlaceIds.add(secondPlace.id);
      ctx.usedCategories.add(candidateCategory(secondPlace));
      const cost = entryFeeCost(secondPlace);
      items.push({
        time: '11:30 AM', type: 'place',
        title: secondPlace.name, subtitle: secondPlace.category,
        duration: secondPlace.visitDuration, cost,
        reason: reasonForPlace(secondPlace, prefs),
        refId: secondPlace.id,
        videoUrl: secondPlace.videoUrl,
        seasonalHighlight: secondPlace.seasonalHighlight,
      });
      dayCost += cost;
      remainingBudget -= cost;
      remainingMinutes -= parseDurationMinutes(secondPlace.visitDuration);
      previousPoint = candidatePoint(secondPlace);
    }
  }

  // ── 1:30 PM — Lunch ───────────────────────────────────────────────────────
  const lunch = selectBest(
    ctx.matchedRestos, prefs, ctx.usedRestoIds, ctx.usedCategories,
    previousPoint, remainingMinutes, remainingBudget,
    (r) => prefs.foodPreference === 'Both' || (prefs.foodPreference === 'Veg' ? r.isVeg : !r.isVeg),
  );
  if (lunch) {
    ctx.usedRestoIds.add(lunch.id);
    ctx.usedCategories.add(candidateCategory(lunch));
    const cost = restaurantCost(lunch, travelers);
    items.push({
      time: '1:30 PM', type: 'food',
      title: lunch.name, subtitle: lunch.famousDishes.slice(0, 2).join(' · '),
      duration: '1 hour', cost,
      reason: reasonForFood(lunch, prefs),
      refId: lunch.id,
    });
    dayCost += cost;
    remainingBudget -= cost;
    remainingMinutes -= 60;
    previousPoint = candidatePoint(lunch);
  }

  // ── 3:30 PM — Afternoon place ─────────────────────────────────────────────
  const afternoonPlace = selectBest(
    ctx.matchedPlaces, prefs, ctx.usedPlaceIds, ctx.usedCategories,
    previousPoint, remainingMinutes, remainingBudget,
    (p) => p.id !== morningPlace?.id,
  );
  if (afternoonPlace) {
    ctx.usedPlaceIds.add(afternoonPlace.id);
    ctx.usedCategories.add(candidateCategory(afternoonPlace));
    const cost = entryFeeCost(afternoonPlace);
    items.push({
      time: '3:30 PM', type: 'place',
      title: afternoonPlace.name, subtitle: afternoonPlace.category,
      duration: afternoonPlace.visitDuration, cost,
      reason: reasonForPlace(afternoonPlace, prefs),
      refId: afternoonPlace.id,
      videoUrl: afternoonPlace.videoUrl,
      seasonalHighlight: afternoonPlace.seasonalHighlight,
    });
    dayCost += cost;
    remainingBudget -= cost;
    remainingMinutes -= parseDurationMinutes(afternoonPlace.visitDuration);
    previousPoint = candidatePoint(afternoonPlace);
  }

  // ── 5:30 PM — Sunset / evening provider ───────────────────────────────────
  if (!ctx.skipEveningProvider && availableMinutes >= 360) {
    const eveningProvider = selectBest(
      ctx.matchedProviders, prefs, ctx.usedProviderIds, ctx.usedCategories,
      previousPoint, remainingMinutes, remainingBudget,
      (p) => prefs.activities.includes(p.activityCategory),
    );
    if (eveningProvider) {
      ctx.usedProviderIds.add(eveningProvider.id);
      ctx.usedCategories.add(candidateCategory(eveningProvider));
      const cost = providerCost(eveningProvider, travelers);
      items.push({
        time: '5:30 PM', type: 'provider',
        title: eveningProvider.activitiesOffered[0] ?? eveningProvider.businessName,
        subtitle: `with ${eveningProvider.businessName}`,
        duration: '1.5 hours', cost,
        reason: `Highly rated provider (${eveningProvider.rating}★) for ${eveningProvider.activityCategory}, perfect for the evening slot.`,
        refId: eveningProvider.id,
      });
      dayCost += cost;
      remainingBudget -= cost;
      remainingMinutes -= 90;
      previousPoint = candidatePoint(eveningProvider);
    } else {
      // No provider — add a sunset/viewpoint place instead
      const sunsetPlace = selectBest(
        ctx.matchedPlaces, prefs, ctx.usedPlaceIds, ctx.usedCategories,
        previousPoint, remainingMinutes, remainingBudget,
        (p) => ['Viewpoint', 'Beach', 'Nature'].includes(p.category),
      );
      if (sunsetPlace) {
        ctx.usedPlaceIds.add(sunsetPlace.id);
        ctx.usedCategories.add(candidateCategory(sunsetPlace));
        const cost = entryFeeCost(sunsetPlace);
        items.push({
          time: '5:30 PM', type: 'place',
          title: sunsetPlace.name, subtitle: 'Evening visit',
          duration: '1 hour', cost,
          reason: `A beautiful spot to wind down the day — ${reasonForPlace(sunsetPlace, prefs)}`,
          refId: sunsetPlace.id,
          videoUrl: sunsetPlace.videoUrl,
          seasonalHighlight: sunsetPlace.seasonalHighlight,
        });
        dayCost += cost;
        remainingBudget -= cost;
        remainingMinutes -= 60;
        previousPoint = candidatePoint(sunsetPlace);
      }
    }
  }

  // ── 8:00 PM — Dinner ──────────────────────────────────────────────────────
  if (availableMinutes >= 360) {
    const dinner = selectBest(
      ctx.matchedRestos, prefs, ctx.usedRestoIds, ctx.usedCategories,
      previousPoint, remainingMinutes, remainingBudget,
      (r) => r.id !== lunch?.id &&
        (prefs.foodPreference === 'Both' || (prefs.foodPreference === 'Veg' ? r.isVeg : !r.isVeg)),
    );
    if (dinner && dinner.id !== lunch?.id) {
      ctx.usedRestoIds.add(dinner.id);
      ctx.usedCategories.add(candidateCategory(dinner));
      const cost = restaurantCost(dinner, travelers);
      items.push({
        time: '8:00 PM', type: 'food',
        title: dinner.name, subtitle: dinner.famousDishes.slice(0, 2).join(' · '),
        duration: '1 hour', cost,
        reason: reasonForFood(dinner, prefs),
        refId: dinner.id,
      });
      dayCost += cost;
      remainingBudget -= cost;
    }
  }

  // ── 10:00 PM — Stay (all nights except departure day) ─────────────────────
  if (dayIndex < prefs.days - 1 && ctx.stay) {
    items.push({
      time: '10:00 PM', type: 'stay',
      title: ctx.stay.name, subtitle: ctx.stay.roomType,
      duration: 'overnight', cost: ctx.stayCostPerNight,
      reason: `${prefs.stayPreference} stay option rated ${ctx.stay.rating}★, fits up to ${ctx.stay.maxGuests} guests.`,
      refId: ctx.stay.id,
    });
    dayCost += ctx.stayCostPerNight;
  }

  // Per-person daily buffer (snacks, water, local transport)
  dayCost += PER_PERSON_DAILY_FOOD * travelers;

  return { items, dayCost };
}

// ── Main entry point ───────────────────────────────────────────────────────────

export function generateItinerary(prefs: TripPreferences, seasonOverride?: string, placesPool?: Place[]): ItineraryResult {
  const travelers = Math.max(1, prefs.travelers);
  const matchedPlaces = matchPlaces(prefs, seasonOverride, placesPool);
  const matchedRestos = matchRestaurants(prefs);
  const matchedProviders = matchProviders(prefs);
  const matchedActivities = matchActivities(prefs);
  const stayOptions = sortedStays(prefs);

  // ── Step 1: Try the ideal plan (user's preferred stay, all activity slots) ──

  const tryBuild = (stay: Hotel | undefined, skipEvening: boolean) => {
    const stayCostPerNight = stay ? stayCost(stay) : 2500;
    const usedPlaceIds = new Set<string>();
    const usedRestoIds = new Set<string>();
    const usedActivityIds = new Set<string>();
    const usedProviderIds = new Set<string>();
    const usedCategories = new Set<string>();

    const days: ItineraryDay[] = [];
    let totalCost = 0;

    for (let d = 0; d < prefs.days; d++) {
      const ctx: BuildContext = {
        prefs, travelers, stay, stayCostPerNight,
        matchedPlaces, matchedRestos, matchedActivities, matchedProviders,
        usedPlaceIds, usedRestoIds, usedActivityIds, usedProviderIds,
        usedCategories,
        dayIndex: d,
        skipEveningProvider: skipEvening,
      };
      const plan = buildDayPlan(ctx);
      totalCost += plan.dayCost;
      days.push({
        day: d + 1,
        title: `Day ${d + 1}`,
        theme: DAY_THEMES[d % DAY_THEMES.length],
        items: plan.items,
        estimatedCost: plan.dayCost,
        travelNote: transportNote[prefs.transport],
      });
    }

    return { days, totalCost };
  };

  // Collect all candidate plans in order of preference-fidelity
  interface Candidate {
    days: ItineraryDay[];
    totalCost: number;
    stay: Hotel | undefined;
    skipEvening: boolean;
    label: string;
  }
  const candidates: Candidate[] = [];

  // 1. Preferred stay + evening provider
  const preferredStay = stayOptions[0];
  candidates.push({ ...tryBuild(preferredStay, false), stay: preferredStay, skipEvening: false, label: 'preferred' });

  // 2. Preferred stay, skip evening provider
  candidates.push({ ...tryBuild(preferredStay, true), stay: preferredStay, skipEvening: true, label: 'skip-evening' });

  // 3. Try cheaper stays (all available, cheapest first)
  const cheaperStays = hotels
    .filter((h) => h.destinationId === prefs.destinationId && h !== preferredStay)
    .sort((a, b) => a.priceFrom - b.priceFrom);
  for (const s of cheaperStays) {
    candidates.push({ ...tryBuild(s, false), stay: s, skipEvening: false, label: `cheaper-stay:${s.name}` });
    candidates.push({ ...tryBuild(s, true), stay: s, skipEvening: true, label: `cheaper-stay:${s.name}+skip-evening` });
  }

  // ── Step 2: Find the best candidate that fits budget ──────────────────────────

  const feasible = candidates
    .filter((c) => c.totalCost <= prefs.budget)
    .sort((a, b) => b.totalCost - a.totalCost); // highest cost that still fits = most complete plan

  if (feasible.length > 0) {
    const best = feasible[0];
    const status: BudgetStatus = best.totalCost === prefs.budget ? 'AT_BUDGET' : 'UNDER_BUDGET';
    return {
      days: best.days,
      totalCost: best.totalCost,
      budget: prefs.budget,
      budgetStatus: status,
      ...(best.label !== 'preferred' && best.stay && best.stay !== preferredStay
        ? { budgetNote: `Adjusted to fit your budget: switched to ${best.stay.name} (${best.stay.priceRange}) as a more affordable ${prefs.stayPreference.toLowerCase()} stay.`, budgetConflicts: [`Stay downgraded from ${preferredStay?.name ?? 'preferred'} to ${best.stay.name}`] }
        : best.skipEvening
          ? { budgetNote: 'Adjusted to fit your budget: reduced evening activity slots to lower cost while keeping all your selected activities.', budgetConflicts: ['Evening provider activity removed'] }
          : {}),
    };
  }

  // ── Step 3: No candidate fits — return the cheapest possible ──────────────────

  // Sort all candidates by totalCost ascending — cheapest first
  const sortedByCost = candidates.sort((a, b) => a.totalCost - b.totalCost);
  const cheapest = sortedByCost[0];

  // Check if even the cheapest plan is absurdly over budget (>2x)
  if (cheapest.totalCost > prefs.budget * 2) {
    return {
      days: [],
      totalCost: cheapest.totalCost,
      budget: prefs.budget,
      budgetStatus: 'IMPOSSIBLE',
      budgetNote: `Your budget of ₹${prefs.budget.toLocaleString('en-IN')} is too low for a ${prefs.days}-day trip with ${travelers} traveler(s). The cheapest possible itinerary costs ₹${cheapest.totalCost.toLocaleString('en-IN')}. Try increasing your budget, reducing the number of days, or reducing the number of travelers.`,
      budgetConflicts: ['Budget insufficient for any combination of available stays, activities, and meals'],
    };
  }

  // OVER_BUDGET_UNAVOIDABLE — return the cheapest plan with explanation
  const conflicts: string[] = [];

  // Identify what's driving cost
  const minStayCost = Math.min(...hotels.filter((h) => h.destinationId === prefs.destinationId).map((h) => h.priceFrom));
  const nights = prefs.days - 1;
  const minStayTotal = minStayCost * nights;
  const minFoodTotal = PER_PERSON_DAILY_FOOD * travelers * prefs.days;
  const minActivityCost = matchedActivities.length > 0
    ? Math.min(...matchedActivities.map((a) => a.priceFrom)) * travelers
    : 0;

  if (minStayTotal > prefs.budget * 0.4) {
    conflicts.push(`Stays: cheapest available stay is ₹${minStayCost}/night × ${nights} nights = ₹${minStayTotal.toLocaleString('en-IN')}`);
  }
  if (minFoodTotal > prefs.budget * 0.2) {
    conflicts.push(`Daily food buffer: ₹${PER_PERSON_DAILY_FOOD} × ${travelers} travelers × ${prefs.days} days = ₹${minFoodTotal.toLocaleString('en-IN')}`);
  }
  if (minActivityCost > 0 && minActivityCost > prefs.budget * 0.15) {
    conflicts.push(`Activities: cheapest selected activity costs ₹${minActivityCost.toLocaleString('en-IN')} for ${travelers} traveler(s)`);
  }

  return {
    days: cheapest.days,
    totalCost: cheapest.totalCost,
    budget: prefs.budget,
    budgetStatus: 'OVER_BUDGET_UNAVOIDABLE',
    budgetNote: `Unable to fit within your budget of ₹${prefs.budget.toLocaleString('en-IN')}. The best achievable itinerary costs ₹${cheapest.totalCost.toLocaleString('en-IN')} (₹${(cheapest.totalCost - prefs.budget).toLocaleString('en-IN')} over). Consider increasing your budget or reducing days/travelers.`,
    budgetConflicts: conflicts,
  };
}
