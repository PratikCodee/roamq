/**
 * geminiItinerary.ts
 *
 * Replaces the rule-based itineraryEngine with a Gemini-powered planner.
 * Falls back to the local engine automatically when no API key is set.
 *
 * To enable: add VITE_GEMINI_API_KEY=<your-key> in .env
 * Free key: https://aistudio.google.com/app/apikey  (no billing needed)
 */

import { GoogleGenerativeAI, type GenerateContentResult } from '@google/generative-ai';
import type { TripPreferences } from '@/types';
import { generateItinerary, getCurrentSeason, type ItineraryResult } from '@/lib/itineraryEngine';
import {
  places, restaurants, hotels, activities, providers,
} from '@/data/sampleData';

// ── Helpers ────────────────────────────────────────────────────────────────────

function rupees(n: number) { return `₹${n.toLocaleString('en-IN')}`; }

const SEASON_LABEL: Record<string, string> = {
  monsoon: 'Monsoon (June–September) 🌧️',
  winter:  'Winter (October–February) ☀️',
  summer:  'Summer / Mango Season (March–May) 🥭',
};

// ── Build a rich, grounded prompt ──────────────────────────────────────────────

function buildPrompt(prefs: TripPreferences, season: string): string {

  // Season-filter places: prefer season-matched, still include year-round ones
  const isSeasonMatch = (p: { seasons?: string[] }) => {
    if (!p.seasons || p.seasons.length === 0) return true;
    if (p.seasons.includes('year-round')) return true;
    return p.seasons.includes(season);
  };

  const allDestPlaces   = places.filter(p => p.destinationId === prefs.destinationId);
  // Season-matched places shown first (PREFERRED), off-season shown separately (AVOID)
  const seasonPlaces    = allDestPlaces.filter(isSeasonMatch);
  const offSeasonPlaces = allDestPlaces.filter(p => !isSeasonMatch(p));

  const destPlaces      = seasonPlaces; // only send season-relevant places as main list
  const destRestaurants = restaurants.filter(r => r.destinationId === prefs.destinationId);
  const destHotels      = hotels.filter(h => h.destinationId === prefs.destinationId);
  const destActivities  = activities.filter(a => a.destinationId === prefs.destinationId);
  const destProviders   = providers.filter(p => p.destinationId === prefs.destinationId);

  const fullDayPlaces   = destPlaces.filter(p => p.fullDayTrip);

  return `
You are an expert local travel guide for Ratnagiri, Maharashtra, India — the jewel of the Konkan coast.
You know every beach, fort, temple, hidden cove, local restaurant, and activity provider in the district.

## YOUR TASK
Generate a highly personalised, day-by-day travel itinerary for the traveller below.
You MUST only recommend places, restaurants, hotels, activities, and providers that exist in the REAL DATA provided below.
Do NOT invent new places or names. Use the exact names from the data.

## TRAVELLER PREFERENCES
- Trip duration: ${prefs.days} day(s)
- Travellers: ${prefs.travelers} (type: ${prefs.travelerType})
- Total budget: ${rupees(prefs.budget)} (~${rupees(Math.floor(prefs.budget / prefs.days))}/day)
- Current season: **${SEASON_LABEL[season] ?? season}** — prioritise season-appropriate spots
- Interests: ${prefs.interests.join(', ') || 'general'}
- Activities wanted: ${prefs.activities.length > 0 ? prefs.activities.join(', ') : 'flexible'}
- Food preference: ${prefs.foodPreference}
- Stay preference: ${prefs.stayPreference}
- Transport: ${prefs.transport}
- Time available per day: ${prefs.timeAvailableHours} hours
- Max distance from hotel: ${prefs.distanceFromHotelKm} km
- Accessibility needs: ${prefs.accessibilityNeeds}

## SEASON-MATCHED PLACES TO VISIT (current season: ${season})
These places are ideal for the current season — USE THESE FIRST:
${destPlaces.map(p =>
  `- ID:${p.id} | "${p.name}" | ${p.category}${p.isHiddenGem ? ' [HIDDEN GEM]' : ''}${p.fullDayTrip ? ' [⚠️ FULL DAY TRIP — occupies entire day, no other places]' : ''} | ⭐${p.rating} | ${p.entryFee} | ${p.visitDuration} | ${p.location}`
).join('\n')}
${offSeasonPlaces.length > 0 ? `
## OFF-SEASON PLACES (avoid unless no season-matched options available)
${offSeasonPlaces.map(p =>
  `- "${p.name}" | ${p.category} | ⭐${p.rating} | Best in: ${p.bestTimeToVisit}`
).join('\n')}` : ''}

### RESTAURANTS
${destRestaurants.map(r =>
  `- ID:${r.id} | "${r.name}" | ${r.famousDishes.join(', ')} | ₹${Math.round(r.priceForTwo / 2) * prefs.travelers} for group | Veg:${r.isVeg ? 'Yes' : 'No'} | ⭐${r.rating}`
).join('\n')}

### HOTELS
${destHotels.map(h =>
  `- ID:${h.id} | "${h.name}" | ${h.roomType} | ${rupees(h.priceFrom)}/night | ⭐${h.rating}`
).join('\n')}

### ACTIVITIES
${destActivities.map(a =>
  `- ID:${a.id} | "${a.name}" | ${a.category} | ${rupees(a.priceFrom * prefs.travelers)} total | ${a.duration}`
).join('\n')}

### PROVIDERS
${destProviders.map(p =>
  `- ID:${p.id} | "${p.businessName}" | ${p.activityCategory} | ⭐${p.rating} | ${rupees(p.priceFrom * prefs.travelers)} total`
).join('\n')}

=== MANDATORY RULES ===
1. ONLY use items from the data above. Do not invent places, restaurants, hotels, or activities.
2. Use the EXACT "id" (prefixed after "ID:") as the "refId" in your JSON output.
3. Use the EXACT name as the "title" in your output.
4. PRIORITISE "SEASON-MATCHED PLACES" — these match the current ${season} season. Avoid off-season places.
5. NEVER repeat the same place, restaurant, activity, or provider across days.
6. ⚠️ FULL DAY TRIP RULE: If you include a place marked [⚠️ FULL DAY TRIP] (e.g. Lingacha Dongar Trek), that place MUST be the ONLY sightseeing item for that entire day. No other places before or after. Only lunch/dinner/stay are allowed alongside it.
${fullDayPlaces.length > 0 ? `   Full-day trip place(s) in current season: ${fullDayPlaces.map(p => p.name).join(', ')}` : ''}
7. Each day MUST have 6–8 items following this FULL DAY SCHEDULE:
   • 7:30 AM  — early morning spot (scenic viewpoint, beach walk, or sunrise location)
   • 9:30 AM  — main morning place or activity
   • 11:30 AM — second morning place or short activity
   • 1:30 PM  — LUNCH at a restaurant (required)
   • 3:30 PM  — afternoon place or provider activity
   • 5:30 PM  — sunset / evening spot or activity
   • 8:00 PM  — DINNER at a restaurant (required)
   • 10:00 PM — STAY (every night except the last day)
7. Respect the budget: totalCost must be ≤ ${rupees(prefs.budget)} if at all possible.
8. Each day must have a unique, evocative theme based on what's planned that day.
9. The "reason" for EACH item must mention the traveller type (${prefs.travelerType}), interests, or specific preference that drove the choice.
10. Costs: entry fees are per person (×${prefs.travelers}), restaurant costs are per group, activity costs are per person (×${prefs.travelers}).
11. The travelNote must describe specific roads, landmarks, or distances between that day's stops.

=== OUTPUT FORMAT (return ONLY this JSON, nothing else) ===
{
  "days": [
    {
      "day": 1,
      "title": "Day 1",
      "theme": "evocative theme based on actual places planned",
      "travelNote": "specific transport advice mentioning roads and distances between today's stops",
      "estimatedCost": <sum of all item costs for this day>,
      "items": [
        {
          "time": "7:30 AM",
          "type": "place" | "food" | "activity" | "stay" | "provider",
          "title": "<exact name from data>",
          "subtitle": "<category, dishes, or room type>",
          "duration": "<from data>",
          "cost": <number — actual cost for group>,
          "reason": "<personalised 1-2 sentence reason mentioning traveller type and interests>",
          "refId": "<exact id field from data>"
        }
        // ... 6-8 items total per day following the full day schedule
      ]
    }
  ],
  "totalCost": <sum of all day costs>,
  "budget": ${prefs.budget},
  "budgetStatus": "UNDER_BUDGET" | "AT_BUDGET" | "OVER_BUDGET_UNAVOIDABLE",
  "budgetNote": "<only if over budget, explain what drove the cost>",
  "budgetConflicts": []
}
`.trim();
}

// ── Post-process: enrich refIds by matching titles back to real data ──────────
// Gemini sometimes gets IDs wrong — this fixes them by name-matching.

function enrichRefIds(result: ItineraryResult): ItineraryResult {
  const allItems = [
    ...places.map(p      => ({ id: p.id, name: p.name,          type: 'place'    })),
    ...restaurants.map(r => ({ id: r.id, name: r.name,          type: 'food'     })),
    ...hotels.map(h      => ({ id: h.id, name: h.name,          type: 'stay'     })),
    ...activities.map(a  => ({ id: a.id, name: a.name,          type: 'activity' })),
    ...providers.map(p   => ({ id: p.id, name: p.businessName,  type: 'provider' })),
  ];

  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

  result.days.forEach(day => {
    day.items.forEach(item => {
      if (!item.refId || item.refId === '') {
        const match = allItems.find(d => normalize(d.name) === normalize(item.title))
          ?? allItems.find(d => normalize(item.title).includes(normalize(d.name).slice(0, 6)));
        if (match) item.refId = match.id;
      }
    });
  });

  return result;
}

// ── Parse Gemini's JSON response ───────────────────────────────────────────────

function parseResult(text: string, prefs: TripPreferences): ItineraryResult {
  let clean = text.trim();
  clean = clean.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

  if (import.meta.env.DEV) {
    console.log('[Gemini raw output]', clean.slice(0, 800));
  }

  const parsed = JSON.parse(clean) as ItineraryResult;
  parsed.budget = prefs.budget;

  if (!Array.isArray(parsed.days) || parsed.days.length === 0) throw new Error('Empty days array');
  if (typeof parsed.totalCost !== 'number') throw new Error('totalCost missing');

  parsed.days.forEach((day, i) => {
    day.day        = day.day   ?? i + 1;
    day.title      = day.title ?? `Day ${i + 1}`;
    day.theme      = day.theme ?? 'Ratnagiri Exploration';
    day.travelNote = day.travelNote ?? '';
    if (!Array.isArray(day.items)) day.items = [];

    day.items.forEach(item => {
      item.cost     = Number(item.cost) || 0;
      item.duration = item.duration     || '1 hour';
      item.refId    = item.refId        || '';
      item.reason   = item.reason       || '';
    });

    day.estimatedCost = day.items.reduce((s, it) => s + it.cost, 0);
  });

  parsed.totalCost = parsed.days.reduce((s, d) => s + d.estimatedCost, 0);

  return enrichRefIds(parsed);
}

// ── Streaming progress callback type ──────────────────────────────────────────

export type ProgressCallback = (status: string) => void;

// ── Main export ────────────────────────────────────────────────────────────────

export async function generateWithGemini(
  prefs: TripPreferences,
  onProgress?: ProgressCallback,
  resolvedSeason?: string,
): Promise<{ result: ItineraryResult; usedAI: boolean }> {
  const season = resolvedSeason ?? getCurrentSeason();
  const apiKey = (import.meta.env.VITE_GEMINI_API_KEY as string) || '';

  // ── No key → use local engine ─────────────────────────────────────────────
  if (!apiKey || apiKey.startsWith('your_') || apiKey === 'placeholder') {
    onProgress?.('Using smart local planner…');
    await new Promise(r => setTimeout(r, 800));
    return { result: generateItinerary(prefs, season), usedAI: false };
  }

  // ── Gemini path ────────────────────────────────────────────────────────────
  try {
    const steps = [
      'Analysing your travel preferences…',
      `Filtering places for: ${prefs.interests.join(', ') || 'general sightseeing'}…`,
      `Planning Day 1 based on your ${prefs.interests[0] ?? 'interests'}…`,
      prefs.days > 1 ? `Planning Day 2 of ${prefs.days} — fresh spots, no repeats…` : 'Optimising your single-day plan…',
      prefs.days > 2 ? `Planning Day 3 of ${prefs.days} — hidden gems & activities…` : 'Calculating costs for your group…',
      'Writing personalised reasons for each stop…',
      'Finalising budget & itinerary…',
    ];

    let stepIndex = 0;
    const progressInterval = setInterval(() => {
      if (stepIndex < steps.length) onProgress?.(steps[stepIndex++]);
    }, 1100);

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: {
        temperature: 0.7,
        topP: 0.9,
        maxOutputTokens: 8192,
        responseMimeType: 'application/json',
      },
    });

    const prompt = buildPrompt(prefs, season);
    const response: GenerateContentResult = await model.generateContent(prompt);
    clearInterval(progressInterval);

    onProgress?.('Parsing your personalised itinerary…');
    const text = response.response.text();
    const result = parseResult(text, prefs);
    return { result, usedAI: true };

  } catch (err) {
    console.warn('[RoamIQ] Gemini API error, falling back to local engine:', err);
    onProgress?.('AI unavailable — using smart local planner…');
    await new Promise(r => setTimeout(r, 600));
    return { result: generateItinerary(prefs, season), usedAI: false };
  }
}
