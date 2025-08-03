export interface Location {
  id: number;
  country: string;
  states: string;
  city: string;
}

export interface BundleLocationResponse {
  id: number;
  bundleId: number;
  destinationId: number;
  departureId: number;
  destination: Location;
  departure: Location;
}
