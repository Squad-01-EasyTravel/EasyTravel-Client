import { Injectable } from '@angular/core';
import { Observable, of, forkJoin } from 'rxjs';
import { delay, map, switchMap, catchError } from 'rxjs/operators';
import { BookedTrip } from '../models/booked-trip.interface';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CurrentUser } from '@/app/features/client/pages/booking/classe/current-user';
import { Reservation } from '../models/reservation.interface';
import { MediaResponse } from '../models/media-response.interface';
import { BundleLocationResponse } from '../models/bundle-location-response.interface';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class BookingService {

  private baseUrl = "http://localhost:8080/api";
  private readonly BACKEND_BASE_URL = 'http://localhost:8080';
  
  constructor(private http: HttpClient, private authService: AuthService) {}

  getCurrentUser(id: string): Observable<CurrentUser> {
    const url = `${this.baseUrl}/reservations/${id}`;
    return this.http.get<CurrentUser>(url);
  }

  // Buscar reservas do usuário autenticado via API
  getMyReservations(): Observable<BookedTrip[]> {
    // Verificar se o usuário está autenticado
    if (!this.authService.isAuthenticated()) {
      console.error('Usuário não autenticado para acessar reservas');
      return of([]);
    }

    const url = `${this.baseUrl}/reservations/my`;
    const token = this.authService.getToken();
    
    console.log('🔄 Carregando reservas...');
    
    // Vamos adicionar o header manualmente para debug
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    
    return this.http.get<Reservation[]>(url, { headers }).pipe(
      switchMap(reservations => {
        if (!reservations || reservations.length === 0) {
          return of([]);
        }

        const bookedTrips = this.mapReservationsToBookedTrips(reservations);
        
        // Para cada reserva, buscar imagem e localização do pacote
        const enrichedTrips$ = bookedTrips.map(trip => {
          if (trip.bundleId) {
            return forkJoin({
              image: this.getBundleImage(trip.bundleId).pipe(
                catchError((error) => {
                  console.warn(`Erro ao carregar imagem para bundle ${trip.bundleId}:`, error);
                  return of([]);
                })
              ),
              location: this.getBundleLocation(trip.bundleId).pipe(
                catchError((error) => {
                  console.warn(`Erro ao carregar localização para bundle ${trip.bundleId}:`, error);
                  return of([]);
                })
              )
            }).pipe(
              map(({ image, location }) => {
                // Atualizar imagem
                if (image.length > 0) {
                  // Processar a URL da imagem corretamente
                  const rawImageUrl = image[0].mediaUrl;
                  trip.imageUrl = this.processImageUrl(rawImageUrl);
                  console.log(`🖼️ URL original da API: ${rawImageUrl}`);
                  console.log(`🖼️ URL processada: ${trip.imageUrl}`);
                } else {
                  trip.imageUrl = 'assets/imgs/fortaleza.jpg'; // Imagem padrão
                }
                
                // Atualizar origem e destino
                if (location.length > 0) {
                  const bundleLocation = location[0];
                  trip.origin = bundleLocation.departure ? bundleLocation.departure.city : 'Origem não informada';
                  trip.destination = bundleLocation.destination ? bundleLocation.destination.city : 'Destino não informado';
                } else {
                  trip.origin = 'Origem não informada';
                  trip.destination = 'Destino não informado';
                }
                
                return trip;
              }),
              catchError((error) => {
                console.warn(`Erro ao processar trip ${trip.id}:`, error);
                // Retorna o trip com dados padrão em caso de erro
                trip.imageUrl = 'assets/imgs/fortaleza.jpg';
                trip.origin = 'Origem não informada';
                trip.destination = 'Destino não informado';
                return of(trip);
              })
            );
          } else {
            // Se não tem bundleId, retorna o trip como está
            trip.imageUrl = 'assets/imgs/fortaleza.jpg';
            trip.origin = 'Origem não informada';
            trip.destination = 'Destino não informado';
            return of(trip);
          }
        });
        
        return forkJoin(enrichedTrips$);
      }),
      catchError((error) => {
        console.error('Erro ao buscar reservas:', error);
        
        if (error.status === 403) {
          console.error('Acesso negado - verifique se o token JWT é válido e se o usuário tem permissão');
        } else if (error.status === 401) {
          console.error('Não autorizado - token inválido ou expirado');
        } else {
          console.error('Erro desconhecido:', error.message);
        }
        
        return of([]); // Retorna array vazio em caso de erro
      })
    );
  }

  // Buscar imagem do pacote
  private getBundleImage(bundleId: number): Observable<MediaResponse[]> {
    const url = `${this.baseUrl}/medias/images/bundle/${bundleId}`;
    return this.http.get<MediaResponse[]>(url);
  }

  // Buscar localização do pacote
  private getBundleLocation(bundleId: number): Observable<BundleLocationResponse[]> {
    const url = `${this.baseUrl}/bundle-locations/bundle/${bundleId}`;
    return this.http.get<BundleLocationResponse[]>(url);
  }

  // Mapear dados da API para o formato usado na interface
  private mapReservationsToBookedTrips(reservations: Reservation[]): BookedTrip[] {
    return reservations.map(reservation => {
      const mappedTrip = {
        id: reservation.id.toString(),
        imageUrl: '', // Será preenchida via API de imagens
        origin: '', // Será preenchida via API de localizações do pacote
        destination: '', // Será preenchida via API de localizações do pacote
        departureDate: this.formatDateToString(reservation.bundle.initialDate),
        returnDate: this.formatDateToString(reservation.bundle.finalDate),
        status: this.mapReservationStatus(reservation.reservStatus),
        orderId: `#${reservation.id}`,
        price: reservation.bundle.initialPrice,
        duration: this.calculateDuration(reservation.bundle.initialDate, reservation.bundle.finalDate),
        paymentMethod: '', // Será implementado conforme necessário
        rating: 0, // Será implementado conforme necessário
        description: reservation.bundle.bundleDescription,
        bundleId: reservation.bundleId, // Adicionar para buscar imagem e localização
        maxTravelers: reservation.bundle.travelersNumber // Número máximo de viajantes permitidos
      };
      
      console.log(`🧑‍🤝‍🧑 Reserva ${reservation.id}: Máx. ${reservation.bundle.travelersNumber} viajantes`);
      return mappedTrip;
    });
  }

  private mapReservationStatus(status: string): 'Confirmado' | 'Pendente' | 'Cancelado' {
    const upperStatus = status?.toUpperCase();
    switch (upperStatus) {
      case 'CONFIRMED':
      case 'CONFIRMADO': 
        return 'Confirmado';
      case 'PENDING':
      case 'PENDENTE': 
        return 'Pendente';
      case 'CANCELLED':
      case 'CANCELED':
      case 'CANCELADO': 
        return 'Cancelado';
      default: 
        console.warn(`Status de reserva desconhecido: ${status}, usando 'Pendente' como padrão`);
        return 'Pendente';
    }
  }

  private formatDateToString(dateString: string): string {
    try {
      if (!dateString) return new Date().toISOString().split('T')[0];
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? new Date().toISOString().split('T')[0] : date.toISOString().split('T')[0];
    } catch (error) {
      console.warn('Erro ao formatar data:', dateString, error);
      return new Date().toISOString().split('T')[0];
    }
  }

  private calculateDuration(startDate: string, endDate: string): number {
    try {
      if (!startDate || !endDate) return 1;
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) return 1;
      
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const duration = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return duration > 0 ? duration : 1;
    } catch (error) {
      console.warn('Erro ao calcular duração:', startDate, endDate, error);
      return 1;
    }
  }

  // Cancelar reserva via API
  cancelBooking(bookingId: string): Observable<any> {
    if (!this.authService.isAuthenticated()) {
      console.error('Usuário não autenticado para cancelar reserva');
      return of(null);
    }

    const url = `${this.baseUrl}/reservations/${bookingId}/cancel/my`;
    const token = this.authService.getToken();
    
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    console.log(`🚫 Cancelando reserva ${bookingId}...`);
    
    return this.http.patch(url, {}, { headers }).pipe(
      map((response: any) => {
        console.log('✅ Reserva cancelada com sucesso:', response);
        return response;
      }),
      catchError((error) => {
        console.error('❌ Erro ao cancelar reserva:', error);
        
        if (error.status === 403) {
          console.error('Acesso negado - verifique se o token JWT é válido');
        } else if (error.status === 401) {
          console.error('Não autorizado - token inválido ou expirado');
        } else if (error.status === 404) {
          console.error('Reserva não encontrada');
        } else {
          console.error('Erro desconhecido:', error.message);
        }
        
        throw error; // Re-throw para que o componente possa tratar
      })
    );
  }

  confirmPayment(bookingId: string): Observable<boolean> {
    console.log(`Confirmando pagamento do pacote ${bookingId}`);
    return of(true).pipe(delay(1000));
  }

  downloadVoucher(bookingId: string): Observable<Blob> {
    console.log(`Baixando voucher do pacote ${bookingId}`);
    return of(new Blob(['Voucher content'], { type: 'application/pdf' })).pipe(delay(1000));
  }

  // Método para processar URLs de imagem (igual ao usado em bundle.ts)
  private processImageUrl(rawImageUrl: string): string {
    // Validação de entrada
    if (!rawImageUrl || typeof rawImageUrl !== 'string' || rawImageUrl.trim() === '') {
      console.warn('🖼️ URL de imagem inválida ou vazia, usando fallback');
      return 'assets/imgs/fortaleza.jpg';
    }
    
    const cleanUrl = rawImageUrl.trim();
    
    // Se a URL for relativa, adicionar a base URL do backend
    if (cleanUrl.startsWith('/')) {
      return `${this.BACKEND_BASE_URL}${cleanUrl}`;
    } 
    
    // Se já for uma URL completa, usar como está
    if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
      return cleanUrl;
    } 
    
    // Se for um caminho sem barra inicial, adicionar barra e base URL
    return `${this.BACKEND_BASE_URL}/${cleanUrl}`;
  }

  // Método para verificar se o usuário já possui o pacote
  checkIfUserHasPackage(bundleId: number): Observable<boolean> {
    return this.getMyReservations().pipe(
      map((reservations: any[]) => {
        const hasPackage = reservations.some(reservation => 
          reservation.bundleId === bundleId
        );
        console.log(`🔍 Verificando se usuário já possui bundle ${bundleId}:`, hasPackage);
        return hasPackage;
      }),
      catchError((error) => {
        console.error('❌ Erro ao verificar pacotes do usuário:', error);
        return of(false); // Em caso de erro, assume que não possui
      })
    );
  }

  // Método para criar uma nova reserva
  createReservation(bundleId: number): Observable<any> {
    console.log('🔄 Criando reserva para bundle:', bundleId);
    
    if (!this.authService.isAuthenticated()) {
      console.error('❌ Usuário não autenticado para criar reserva');
      throw new Error('Usuário não autenticado');
    }

    const user = this.authService.getCurrentUser();
    const token = this.authService.getToken();
    
    if (!user || !token) {
      console.error('❌ Dados de usuário ou token não encontrados');
      throw new Error('Dados de autenticação inválidos');
    }

    const url = `${this.baseUrl}/reservations`;
    
    const reservationData = {
      reservDate: new Date().toISOString(),
      userId: user.id,
      bundleId: bundleId
    };
    
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    
    console.log('📤 Enviando reserva:', {
      url,
      data: reservationData,
      headers: { Authorization: `Bearer ${token ? token.substring(0, 20) + '...' : 'null'}` }
    });
    
    return this.http.post(url, reservationData, { headers }).pipe(
      map((response: any) => {
        console.log('✅ Reserva criada com sucesso:', response);
        return response;
      }),
      catchError((error) => {
        console.error('❌ Erro ao criar reserva:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          error: error.error,
          url: url,
          data: reservationData,
          user: user,
          token: token ? `${token.substring(0, 20)}...` : 'null'
        });
        throw error;
      })
    );
  }

  // Buscar detalhes do pagamento por ID da reserva
  getPaymentDetails(reservationId: number): Observable<any> {
    const url = `${this.baseUrl}/payments/reservation/${reservationId}`;
    const token = this.authService.getToken();
    
    console.log('🔄 Fazendo requisição para:', url);
    console.log('🔑 Token:', token ? 'Presente' : 'Ausente');
    
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.get<any>(url, { headers }).pipe(
      map(response => {
        console.log('✅ Resposta da API de pagamento:', response);
        return response;
      }),
      catchError(error => {
        console.error('❌ Erro ao buscar detalhes do pagamento:', error);
        console.error('🔗 URL da requisição:', url);
        console.error('📄 Status:', error.status);
        console.error('📝 Mensagem:', error.message);
        throw error;
      })
    );
  }

  // Buscar viajantes por ID da reserva
  getTravelersByReservation(reservationId: number): Observable<any[]> {
    const url = `${this.baseUrl}/travelers/reservation/${reservationId}`;
    const token = this.authService.getToken();
    
    console.log('🔄 Fazendo requisição para viajantes:', url);
    
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.get<any[]>(url, { headers }).pipe(
      map(response => {
        console.log('✅ Resposta da API de viajantes:', response);
        return response;
      }),
      catchError(error => {
        console.error('❌ Erro ao buscar viajantes da reserva:', error);
        console.error('🔗 URL da requisição:', url);
        console.error('📄 Status:', error.status);
        return of([]); // Retorna array vazio em caso de erro
      })
    );
  }

  // Buscar histórico de viagem pelo ID do pagamento
  getTravelHistoryByPayment(paymentId: number): Observable<any[]> {
    const url = `${this.baseUrl}/travel-histories/payment/${paymentId}`;
    const token = this.authService.getToken();
    
    console.log('🔄 Fazendo requisição para travel history:', url);
    
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.get<any[]>(url, { headers }).pipe(
      map(response => {
        console.log('✅ Resposta da API de travel history:', response);
        return response;
      }),
      catchError(error => {
        console.error('❌ Erro ao buscar travel history:', error);
        console.error('🔗 URL da requisição:', url);
        console.error('📄 Status:', error.status);
        throw error;
      })
    );
  }

  // Criar avaliação
  createReview(reviewData: any): Observable<any> {
    const url = `${this.baseUrl}/reviews`;
    const token = this.authService.getToken();
    
    console.log('🔄 Criando avaliação:', url);
    console.log('📋 Dados da avaliação:', reviewData);
    
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.post<any>(url, reviewData, { headers }).pipe(
      map(response => {
        console.log('✅ Avaliação criada com sucesso:', response);
        return response;
      }),
      catchError(error => {
        console.error('❌ Erro ao criar avaliação:', error);
        console.error('🔗 URL da requisição:', url);
        console.error('📄 Status:', error.status);
        console.error('📝 Dados enviados:', reviewData);
        throw error;
      })
    );
  }

  // Buscar avaliações do usuário autenticado
  getMyReviews(): Observable<any[]> {
    const url = `${this.baseUrl}/reviews/my`;
    const token = this.authService.getToken();
    
    console.log('🔄 Fazendo requisição para avaliações do usuário:', url);
    
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.get<any[]>(url, { headers }).pipe(
      map(response => {
        console.log('✅ Avaliações do usuário recebidas:', response);
        return response;
      }),
      catchError(error => {
        console.error('❌ Erro ao buscar avaliações do usuário:', error);
        console.error('🔗 URL da requisição:', url);
        console.error('📄 Status:', error.status);
        return of([]); // Retorna array vazio em caso de erro
      })
    );
  }

  // Atualizar avaliação existente
  updateReview(reviewId: number, reviewData: any): Observable<any> {
    const url = `${this.baseUrl}/reviews/my/${reviewId}`;
    const token = this.authService.getToken();
    
    console.log('🔄 Atualizando avaliação:', url);
    console.log('📋 ID da avaliação:', reviewId);
    console.log('📋 Novos dados da avaliação:', reviewData);
    
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.put<any>(url, reviewData, { headers }).pipe(
      map(response => {
        console.log('✅ Avaliação atualizada com sucesso:', response);
        return response;
      }),
      catchError(error => {
        console.error('❌ Erro ao atualizar avaliação:', error);
        console.error('🔗 URL da requisição:', url);
        console.error('📄 Status:', error.status);
        console.error('📝 Dados enviados:', reviewData);
        throw error;
      })
    );
  }
}
