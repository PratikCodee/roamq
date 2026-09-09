export type UserRole   = 'admin' | 'customer' | 'business';
export type UserStatus = 'pending' | 'approved' | 'rejected';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  password: string; // plain-text for prototype; swap for hashed on real backend
  role: UserRole;
  status: UserStatus;
  createdAt: string;
}

export interface AppBusiness {
  id: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  description: string;
  category: string;        // requested category at registration
  approvedCategory: string; // set by admin on approval
  address: string;
  location: string;        // Ratnagiri area
  images: string[];        // Data URLs or external URLs
  status: UserStatus;
  createdAt: string;
}

export interface AppPlace {
  id: string;
  destinationId: string;
  name: string;
  category: string;
  description: string;
  image: string;           // Data URL or external URL
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
  seasons?: ('monsoon' | 'winter' | 'summer' | 'year-round')[];
  videoUrl?: string;
  seasonalHighlight?: string;
  featuredInSeasons?: ('monsoon' | 'winter' | 'summer')[];
  createdAt: string;
  updatedAt: string;
}

export interface AppCategory {
  id: string;
  name: string;
  createdAt: string;
}
