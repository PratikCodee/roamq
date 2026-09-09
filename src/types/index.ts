export type ID = string;

export type Category =
  | 'Beach'
  | 'Fort'
  | 'Temple'
  | 'Nature'
  | 'Viewpoint'
  | 'Waterfall'
  | 'Heritage'
  | 'Hidden Gem'
  | 'Trek';

export type ActivityCategory =
  | 'Trekking'
  | 'Water Activities'
  | 'Boating'
  | 'Adventure'
  | 'Cultural Experiences'
  | 'Photography'
  | 'Local Experiences';

export interface Destination {
  id: ID;
  name: string;
  state: string;
  country: string;
  tagline: string;
  heroImage: string;
  galleryImages: string[];
  overview: string;
  highlights: string[];
  bestTimeToVisit: string;
  lat: number;
  lng: number;
}

export interface Place {
  id: ID;
  destinationId: ID;
  name: string;
  category: Category;
  description: string;
  image: string;
  location: string;
  lat: number;
  lng: number;
  openingTime: string;
  closingTime: string;
  entryFee: string;
  bestTimeToVisit: string;
  visitDuration: string;
  rating: number;
  reviewsCount: number;
  isHiddenGem: boolean;
  /** Seasons when this place is best / available. If undefined = year-round. */
  seasons?: ('monsoon' | 'winter' | 'summer' | 'year-round')[];
  /** Direct MP4 or video preview URL */
  videoUrl?: string;
  /** Explanation of why this spot is special in its prime season */
  seasonalHighlight?: string;
  /** Explicit admin selection for "Must Experience" seasonal section */
  featuredInSeasons?: ('monsoon' | 'winter' | 'summer')[];
  /** Set true if visiting requires a full day (e.g. Lingacha Dongar) */
  fullDayTrip?: boolean;
}

export interface Hotel {
  id: ID;
  destinationId: ID;
  name: string;
  images: string[];
  priceRange: string;
  priceFrom: number;
  roomType: string;
  maxGuests: number;
  availability: 'Available' | 'Limited' | 'Full';
  location: string;
  lat: number;
  lng: number;
  facilities: string[];
  rating: number;
  reviewsCount: number;
  contact: string;
}

export interface Food {
  id: ID;
  destinationId: ID;
  name: string;
  description: string;
  image: string;
  isVeg: boolean;
  spiceLevel: 'Mild' | 'Medium' | 'Spicy';
  mustTry: boolean;
}

export interface Restaurant {
  id: ID;
  destinationId: ID;
  name: string;
  image: string;
  famousDishes: string[];
  priceRange: string;
  priceForTwo: number;
  location: string;
  lat: number;
  lng: number;
  openingHours: string;
  rating: number;
  reviewsCount: number;
  contact: string;
  isVeg: boolean;
}

export interface Activity {
  id: ID;
  destinationId: ID;
  name: string;
  category: ActivityCategory;
  description: string;
  image: string;
  priceFrom: number;
  duration: string;
  location: string;
  lat: number;
  lng: number;
}

export interface Provider {
  id: ID;
  destinationId: ID;
  businessName: string;
  profileImage: string;
  activitiesOffered: string[];
  description: string;
  priceFrom: number;
  location: string;
  lat: number;
  lng: number;
  availability: 'Available' | 'Limited' | 'Full';
  groupCapacity: number;
  rating: number;
  reviewsCount: number;
  contact: string;
  activityCategory: ActivityCategory;
}

export interface Review {
  id: ID;
  targetType: 'place' | 'hotel' | 'restaurant' | 'activity' | 'provider';
  targetId: ID;
  author: string;
  rating: number;
  date: string;
  title: string;
  body: string;
}

export interface ItineraryDay {
  day: number;
  title: string;
  theme: string;
  items: ItineraryItem[];
  estimatedCost: number;
  travelNote: string;
}

export interface ItineraryItem {
  time: string;
  type: 'place' | 'food' | 'activity' | 'stay' | 'provider';
  title: string;
  subtitle: string;
  duration: string;
  cost: number;
  reason: string;
  refId?: ID;
  videoUrl?: string;
  seasonalHighlight?: string;
}

export interface TripPreferences {
  destinationId: ID;
  days: number;
  travelers: number;
  budget: number;
  interests: string[];
  activities: string[];
  transport: 'Car' | 'Bike' | 'Public Transport' | 'Walking';
  foodPreference: 'Veg' | 'Non-Veg' | 'Both';
  stayPreference: 'Budget' | 'Mid-range' | 'Luxury';
  travelerType?: 'Solo' | 'Couple' | 'Family' | 'Friends' | 'Senior';
  timeAvailableHours?: number;
  distanceFromHotelKm?: number;
  accessibilityNeeds?: 'None' | 'Mobility support' | 'Low walking' | 'Quiet spaces';
  existingItinerary?: string[];
}

export interface SavedItem {
  id: ID;
  itemType: 'place' | 'hotel' | 'activity' | 'provider' | 'restaurant';
  itemId: ID;
  name: string;
  image: string;
  category: string;
  location: string;
  savedAt: string;
}

export interface SavedTrip {
  id: ID;
  title: string;
  preferences: TripPreferences;
  days: ItineraryDay[];
  totalCost: number;
  createdAt: string;
}
