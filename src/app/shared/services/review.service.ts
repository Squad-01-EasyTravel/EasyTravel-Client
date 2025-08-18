import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map, switchMap, of, catchError } from 'rxjs';

export interface Review {
  id: number;
  rating: string;
  comment: string;
  avaliationDate: string;
  travelHistoryId: number;
  bundleId: number;
}

export interface TravelHistory {
  id: number;
  paymentId: number;
  payment: {
    id: number;
    paymentDate: string;
    paymentMethod: string;
    totPrice: number;
    installments: number | null;
    reservationId: number;
  };
}

export interface Reservation {
  id: number;
  reservStatus: string;
  reservDate: string;
  userId: number;
  bundleId: number;
  userName: string;
  bundleTitle: string;
  bundle: any;
}

export interface User {
  id: number;
  name: string;
  email: string;
  cpf: string;
  passport: string;
  password: string | null;
  telephone: string;
  userStatus: string;
  userRole: string;
}

export interface ReviewWithUser {
  id: number;
  rating: string;
  comment: string;
  avaliationDate: string;
  userName: string;
  ratingNumber: number;
}

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private baseUrl = "http://localhost:8080/api";

  constructor(private http: HttpClient) {}

  getReviews(): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.baseUrl}/reviews`);
  }

  getTravelHistories(): Observable<TravelHistory[]> {
    return this.http.get<TravelHistory[]>(`${this.baseUrl}/travel-histories`);
  }

  getReservations(): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(`${this.baseUrl}/reservations`);
  }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/users`);
  }

  getReviewsWithUserNames(): Observable<ReviewWithUser[]> {
    return this.getReviews().pipe(
      switchMap(reviews => {
        if (!reviews || reviews.length === 0) {
          return [];
        }

        // Buscar travel histories, reservations e users
        return forkJoin({
          travelHistories: this.getTravelHistories(),
          reservations: this.getReservations(),
          users: this.getUsers()
        }).pipe(
          map(({ travelHistories, reservations, users }) => {
            return reviews.map(review => {
              // Encontrar travel history pelo ID
              const travelHistory = travelHistories.find(th => th.id === review.travelHistoryId);
              
              if (!travelHistory) {
                return {
                  id: review.id,
                  rating: review.rating,
                  comment: review.comment,
                  avaliationDate: review.avaliationDate,
                  userName: 'Usuário não encontrado',
                  ratingNumber: this.convertRatingToNumber(review.rating)
                };
              }

              // Encontrar reservation pelo payment.reservationId
              const reservation = reservations.find(r => r.id === travelHistory.payment.reservationId);
              
              if (!reservation) {
                return {
                  id: review.id,
                  rating: review.rating,
                  comment: review.comment,
                  avaliationDate: review.avaliationDate,
                  userName: 'Usuário não encontrado',
                  ratingNumber: this.convertRatingToNumber(review.rating)
                };
              }

              // Encontrar user pelo userId
              const user = users.find(u => u.id === reservation.userId);
              
              return {
                id: review.id,
                rating: review.rating,
                comment: review.comment,
                avaliationDate: review.avaliationDate,
                userName: user ? user.name : 'Usuário não encontrado',
                ratingNumber: this.convertRatingToNumber(review.rating)
              };
            });
          })
        );
      })
    );
  }

  // Método para buscar reviews de um bundle específico com nomes de usuários
  getReviewsWithUserNamesByBundle(bundleId: number): Observable<ReviewWithUser[]> {
    console.log(`📝 ReviewService: Buscando reviews para bundle ${bundleId}`);
    
    return this.http.get<Review[]>(`${this.baseUrl}/reviews/bundle/${bundleId}`).pipe(
      catchError(error => {
        console.error(`❌ ReviewService: Erro ao buscar reviews para bundle ${bundleId}:`, error);
        // Se der erro 404 ou qualquer outro, retornar array vazio
        return of([]);
      }),
      switchMap(reviews => {
        console.log(`📝 ReviewService: Recebidas ${reviews?.length || 0} reviews para bundle ${bundleId}`);
        
        if (!reviews || reviews.length === 0) {
          console.log(`📝 ReviewService: Nenhuma review encontrada para bundle ${bundleId}`);
          // Retornar um Observable com array vazio usando of()
          return of([]);
        }

        // Buscar travel histories, reservations e users
        return forkJoin({
          travelHistories: this.getTravelHistories(),
          reservations: this.getReservations(),
          users: this.getUsers()
        }).pipe(
          map(({ travelHistories, reservations, users }) => {
            return reviews.map(review => {
              // Encontrar travel history pelo ID
              const travelHistory = travelHistories.find(th => th.id === review.travelHistoryId);
              
              if (!travelHistory) {
                return {
                  id: review.id,
                  rating: review.rating,
                  comment: review.comment,
                  avaliationDate: review.avaliationDate,
                  userName: 'Viajante Anônimo',
                  ratingNumber: this.convertRatingToNumber(review.rating)
                };
              }

              // Encontrar reservation pelo paymentId -> reservationId
              const reservation = reservations.find(r => r.id === travelHistory.payment.reservationId);
              
              if (!reservation) {
                return {
                  id: review.id,
                  rating: review.rating,
                  comment: review.comment,
                  avaliationDate: review.avaliationDate,
                  userName: 'Viajante Anônimo',
                  ratingNumber: this.convertRatingToNumber(review.rating)
                };
              }

              // Encontrar user pelo userId da reservation
              const user = users.find(u => u.id === reservation.userId);
              
              return {
                id: review.id,
                rating: review.rating,
                comment: review.comment,
                avaliationDate: review.avaliationDate,
                userName: user ? user.name : 'Viajante Anônimo',
                ratingNumber: this.convertRatingToNumber(review.rating)
              };
            });
          })
        );
      })
    );
  }

  private convertRatingToNumber(rating: string): number {
    switch (rating) {
      case 'ONE_STAR': return 1.0;
      case 'TWO_STARS': return 2.0;
      case 'THREE_STARS': return 3.0;
      case 'FOUR_STARS': return 4.0;
      case 'FIVE_STARS': return 5.0;
      default: return 0.0;
    }
  }
}
