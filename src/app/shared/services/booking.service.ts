import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { BookedTrip } from '../models/booked-trip.interface';
import { HttpClient } from '@angular/common/http';
import { CurrentUser } from '@/app/features/client/pages/booking/classe/current-user';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class BookingService {

  private baseUrl = "http://localhost:8080/api/reservations";
  constructor(private http: HttpClient) {}

  getCurrentUser(id: string): Observable<CurrentUser> {
  const url = `${this.baseUrl}/${id}`;
  
  return this.http.get<CurrentUser>(url);}

  // Simula busca de pacotes do usuário no back-end
  getUserBookings(): Observable<BookedTrip[]> {

    const mockData: BookedTrip[] = [
      {
        id: '1',
        imageUrl: '/assets/imgs/fortaleza.jpg',
        origin: 'Recife',
        destination: 'São Paulo',
        departureDate: '2025-08-15',
        returnDate: '2025-08-22',
        status: 'Confirmado',
        orderId: '#123456',
        price: 2500,
        duration: 7,
        paymentMethod: 'Cartão de Crédito',
        rating: 4.5,
        description: 'Pacote completo incluindo hospedagem em hotel 4 estrelas, traslados e city tour.'
      },
      {
        id: '2',
        imageUrl: '/assets/imgs/gramado.jpg',
        origin: 'Rio de Janeiro',
        destination: 'Salvador',
        departureDate: '2025-09-10',
        returnDate: '2025-09-17',
        status: 'Confirmado',
        orderId: '#234567',
        price: 1800,
        duration: 7,
        paymentMethod: 'PIX',
        rating: 4.2,
        description: 'Viagem para Salvador com hospedagem na orla, passeios históricos e gastronômicos.'
      },
      {
        id: '3',
        imageUrl: '/assets/imgs/fortaleza.jpg',
        origin: 'São Paulo',
        destination: 'Fortaleza',
        departureDate: '2025-10-25',
        returnDate: '2025-11-01',
        status: 'Pendente',
        orderId: '#345678',
        price: 2200,
        duration: 7,
        description: 'Pacote para Fortaleza com hospedagem em resort all-inclusive.'
      },
      {
        id: '4',
        imageUrl: '/assets/imgs/gramado.jpg',
        origin: 'Brasília',
        destination: 'Porto Alegre',
        departureDate: '2025-12-20',
        returnDate: '2025-12-27',
        status: 'Confirmado',
        orderId: '#456789',
        price: 3000,
        duration: 7,
        paymentMethod: 'Boleto Bancário',
        rating: 4.8,
        description: 'Pacote para Porto Alegre incluindo hospedagem e passeios pela região.'
      },
      {
        id: '5',
        imageUrl: '/assets/imgs/fortaleza.jpg',
        origin: 'Manaus',
        destination: 'Curitiba',
        departureDate: '2026-01-15',
        returnDate: '2026-01-22',
        status: 'Pendente',
        orderId: '#567890',
        price: 2800,
        duration: 7,
        description: 'Viagem para Curitiba com foco em ecoturismo e gastronomia local.'
      }
    ];

    // Simula delay da requisição HTTP
    return of(mockData).pipe(delay(500));
  }

  // Métodos para futuras integrações com back-end
  cancelBooking(bookingId: string): Observable<boolean> {
    console.log(`Cancelando pacote ${bookingId}`);
    return of(true).pipe(delay(1000));
  }

  confirmPayment(bookingId: string): Observable<boolean> {
    console.log(`Confirmando pagamento do pacote ${bookingId}`);
    return of(true).pipe(delay(1000));
  }

  downloadVoucher(bookingId: string): Observable<Blob> {
    console.log(`Baixando voucher do pacote ${bookingId}`);
    return of(new Blob(['Voucher content'], { type: 'application/pdf' })).pipe(delay(1000));
  }
}
