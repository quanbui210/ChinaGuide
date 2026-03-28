export type Category = 'food' | 'drink' | 'visit';
export type CityId = 'shanghai' | 'hangzhou' | 'wuzhen';

export interface Attraction {
  id: string;
  name: string;
  description: string;
  price: string;
  hours: string;
  imageUrl: string;
  category: Category;
  city: CityId;
  isSignature: boolean;
  latitude?: number;
  longitude?: number;
  longDescription?: string;
  galleryImages?: string[];
  createdAt: string;
}

export interface Reminder {
  id: string;
  text: string;
  category: string;
  link?: string;
  detailedGuidance?: string;
  createdAt: string;
}

export interface Tour {
  id: string;
  clientName: string;
  date: string;
  price: string;
  guests: number;
  planRoute: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes: string;
  createdAt: string;
}

export interface Hotel {
  id: string;
  name: string;
  description: string;
  price: string;
  location: string;
  city: CityId;
  isNearCenter: boolean;
  imageUrl: string;
  latitude: number;
  longitude: number;
  longDescription?: string;
  galleryImages?: string[];
  createdAt: string;
}

export interface City {
  id: string;
  cityId: CityId;
  name: string;
  description: string;
  imageUrl: string;
  createdAt: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  role: 'admin' | 'user';
}
