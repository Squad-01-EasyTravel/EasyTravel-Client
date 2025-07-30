export interface Trip {
  id: number;
  imageUrl: string;
  origin: string;
  destination: string;
  price: number;
  originalPrice?: number;
  departureDate: string;
  arrivalDate: string;
  rating: number;
  duration: string; // e.g., "2 dias / 1 noite"
  discount?: number;
  isPopular?: boolean;
  isBestValue?: boolean;
  category: 'popular' | 'cost-benefit' | 'premium';
  description?: string;
  inclusions?: string[];
  highlights?: string[];
}
