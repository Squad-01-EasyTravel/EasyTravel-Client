export interface BookedTrip {
  id: string;
  imageUrl: string;
  origin: string;
  destination: string;
  departureDate: string;
  returnDate: string;
  status: 'Finalizado' | 'Confirmado' | 'Pendente' | 'Cancelado';
  orderId: string;
  price: number;
}

export type BookingStatus = 'Finalizado' | 'Confirmado' | 'Pendente' | 'Cancelado';
