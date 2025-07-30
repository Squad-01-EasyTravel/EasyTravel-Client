export interface TravelPackage {
  id: number;
  bundleTitle: string;
  bundleDescription: string;
  initialPrice: number;
  bundleRank: 'BRONZE' | 'PRATA' | 'OURO' | 'PLATINA';
  initialDate: string;
  finalDate: string;
  quantity: number;
  travelersNumber: number;
  imageUrl: string;
  videoUrl?: string;
  available: boolean;
  createdAt: Date;
} 