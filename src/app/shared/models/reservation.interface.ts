export interface Bundle {
  id: number;
  bundleTitle: string;
  bundleDescription: string;
  initialPrice: number;
  bundleRank: string;
  initialDate: string;
  finalDate: string;
  quantity: number;
  travelersNumber: number;
  bundleStatus: string;
}

export interface Reservation {
  id: number;
  reservStatus: string;
  reservDate: string;
  userId: number;
  bundleId: number;
  userName: string;
  bundleTitle: string;
  bundle: Bundle;
}

export type ReservationStatus = 'CONFIRMED' | 'PENDING' | 'CANCELLED';
