export interface BookedTrip {
  id: string;
  imageUrl: string;
  origin: string;
  destination: string;
  departureDate: string;
  returnDate: string;
  status: 'Confirmado' | 'Pendente' | 'Cancelado';
  orderId: string;
  price: number;
  duration?: number; // duração em dias
  paymentMethod?: string; // forma de pagamento
  rating?: number; // média de avaliação
  description?: string; // descrição da viagem
}

export type BookingStatus = 'Confirmado' | 'Pendente' | 'Cancelado';
