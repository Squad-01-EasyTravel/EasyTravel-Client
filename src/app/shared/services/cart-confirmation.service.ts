import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface CartConfirmationModalData {
  title: string;
  message: string;
  packageName: string;
  onGoToBookings: () => void;
  onContinueShopping: () => void;
}

@Injectable({
  providedIn: 'root'
})
export class CartConfirmationService {
  private modalSubject = new Subject<CartConfirmationModalData | null>();
  public modal$ = this.modalSubject.asObservable();

  constructor() {}

  /**
   * Exibe o modal de confirmação após adicionar item ao carrinho
   */
  showConfirmationModal(data: CartConfirmationModalData): void {
    this.modalSubject.next(data);
  }

  /**
   * Fecha o modal de confirmação
   */
  closeModal(): void {
    this.modalSubject.next(null);
  }
}
