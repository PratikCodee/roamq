/**
 * seed.ts — Seeds demo data into localStorage on first run.
 * Call seedIfNeeded() once at app startup.
 */

import { places as staticPlaces } from '@/data/sampleData';
import {
  isSeeded, markSeeded, getPlaces, updatePlace,
  saveUser, saveBusiness, savePlace, saveCategory,
  generateId, setSeedingActive,
} from './db';
import type { AppUser, AppBusiness, AppPlace, AppCategory } from './types';

const NOW = new Date().toISOString();

export function seedIfNeeded(): void {
  setSeedingActive(true);
  try {
    if (isSeeded()) {
      // Sync ONLY genuinely missing fields — do NOT overwrite values the admin explicitly set
      const stored = getPlaces();
      stored.forEach((sp) => {
        const match = staticPlaces.find((p) => p.id === sp.id);
        if (match) {
          let patch: Partial<AppPlace> = {};
          // Only back-fill if the field is truly absent (undefined / null), not if admin cleared it ('')
          if (sp.featuredInSeasons == null && match.featuredInSeasons) patch.featuredInSeasons = match.featuredInSeasons;
          if (sp.videoUrl == null && match.videoUrl) patch.videoUrl = match.videoUrl;
          if (sp.seasonalHighlight == null && match.seasonalHighlight) patch.seasonalHighlight = match.seasonalHighlight;

          if (Object.keys(patch).length > 0) {
            updatePlace(sp.id, patch);
          }
        }
      });
      return;
    }


  // ── Admin user ──────────────────────────────────────────────────────────────
  const admin: AppUser = {
    id: 'user-admin',
    name: 'RoamIQ Admin',
    email: 'admin@roamiq.in',
    password: 'admin1234',
    role: 'admin',
    status: 'approved',
    createdAt: NOW,
  };

  // ── Customers ───────────────────────────────────────────────────────────────
  const approvedCustomer: AppUser = {
    id: 'user-cust-1',
    name: 'Priya Sharma',
    email: 'priya@example.com',
    password: 'demo1234',
    role: 'customer',
    status: 'approved',
    createdAt: NOW,
  };

  const customer2: AppUser = {
    id: 'user-cust-2',
    name: 'Rahul Patil',
    email: 'rahul@example.com',
    password: 'demo1234',
    role: 'customer',
    status: 'approved',
    createdAt: NOW,
  };

  [admin, approvedCustomer, customer2].forEach(saveUser);

  // ── Businesses ──────────────────────────────────────────────────────────────
  const approvedBiz: AppBusiness = {
    id: 'biz-1',
    businessName: 'Konkan Beach Resort',
    ownerName: 'Suresh Naik',
    email: 'suresh@konkanresort.com',
    phone: '9876543210',
    description: 'A serene beachside resort offering Konkan hospitality with sea-view rooms and authentic seafood.',
    category: 'Hotel / Resort',
    approvedCategory: 'Hotel / Resort',
    address: 'Near Ganpatipule Beach, Ratnagiri',
    location: 'Ganpatipule',
    images: [],
    status: 'approved',
    createdAt: NOW,
  };

  const pendingBiz: AppBusiness = {
    id: 'biz-2',
    businessName: 'Sahyadri Trek Adventures',
    ownerName: 'Amol Desai',
    email: 'amol@trekadv.com',
    phone: '9988776655',
    description: 'Expert-guided trekking and outdoor adventure experiences in the Western Ghats near Ratnagiri.',
    category: 'Trekking & Adventure',
    approvedCategory: '',
    address: 'Sangameshwar, Ratnagiri district',
    location: 'Sangameshwar',
    images: [],
    status: 'pending',
    createdAt: NOW,
  };

  [approvedBiz, pendingBiz].forEach(saveBusiness);

  // ── Categories ──────────────────────────────────────────────────────────────
  const categoryNames = [
    'Beach', 'Fort', 'Temple', 'Nature', 'Viewpoint',
    'Waterfall', 'Heritage', 'Hidden Gem', 'Trek',
    'Hotel / Resort', 'Homestay / Guesthouse', 'Restaurant / Café',
    'Water Sports & Activities', 'Trekking & Adventure',
    'Travel Agency / Tour Operator', 'Local Experiences & Workshops',
  ];

  categoryNames.forEach((name) => {
    const cat: AppCategory = {
      id: `cat-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      name,
      createdAt: NOW,
    };
    saveCategory(cat);
  });

  // ── Places — seed from static data ─────────────────────────────────────────
  staticPlaces.forEach((p) => {
    const appPlace: AppPlace = {
      id: p.id,
      destinationId: p.destinationId,
      name: p.name,
      category: p.category,
      description: p.description,
      image: p.image,
      location: p.location,
      lat: p.lat,
      lng: p.lng,
      openingTime: p.openingTime,
      closingTime: p.closingTime,
      entryFee: p.entryFee,
      bestTimeToVisit: p.bestTimeToVisit,
      visitDuration: p.visitDuration,
      rating: p.rating,
      reviewsCount: p.reviewsCount,
      isHiddenGem: p.isHiddenGem,
      seasons: p.seasons,
      featuredInSeasons: p.featuredInSeasons,
      videoUrl: p.videoUrl,
      seasonalHighlight: p.seasonalHighlight,
      createdAt: NOW,
      updatedAt: NOW,
    };
    savePlace(appPlace);
  });

    markSeeded();
  } finally {
    setSeedingActive(false);
  }
}
