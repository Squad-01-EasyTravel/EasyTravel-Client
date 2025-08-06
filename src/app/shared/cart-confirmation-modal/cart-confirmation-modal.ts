import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { CartConfirmationService, CartConfirmationModalData } from '../services/cart-confirmation.service';

@Component({
  selector: 'app-cart-confirmation-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="cart-confirmation-modal" [class.show]="isVisible" *ngIf="modalData">
      <div class="cart-confirmation-overlay" (click)="onContinueShopping()"></div>
      <div class="cart-confirmation-content">
        <div class="modal-header">
          <div class="success-icon">
            <i class="fas fa-check-circle"></i>
          </div>
          <h3>{{ modalData.title }}</h3>
          <button class="close-btn" (click)="onContinueShopping()" type="button">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <p class="package-name">{{ modalData.packageName }}</p>
          <p class="confirmation-message">{{ modalData.message }}</p>
        </div>
        
        <div class="modal-actions">
          <button class="btn btn-primary" (click)="onGoToBookings()" type="button">
            <i class="fas fa-calendar-check"></i>
            Ir para Minhas Reservas
          </button>
          <button class="btn btn-secondary" (click)="onContinueShopping()" type="button">
            <i class="fas fa-shopping-cart"></i>
            Continuar Comprando
          </button>
        </div>
      </div>
    </div>
  `,
  styleUrl: './cart-confirmation-modal.css'
})
export class CartConfirmationModal implements OnInit, OnDestroy {
  modalData: CartConfirmationModalData | null = null;
  isVisible: boolean = false;
  private subscription: Subscription = new Subscription();

  constructor(private cartConfirmationService: CartConfirmationService) {}

  ngOnInit(): void {
    this.subscription = this.cartConfirmationService.modal$.subscribe(data => {
      this.modalData = data;
      if (data) {
        this.showModal();
      } else {
        this.hideModal();
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private showModal(): void {
    // Prevent body scrolling when modal is open
    document.body.classList.add('modal-open');
    
    // Show with animation
    setTimeout(() => {
      this.isVisible = true;
    }, 10);
  }

  private hideModal(): void {
    this.isVisible = false;
    
    // Restore body scrolling
    document.body.classList.remove('modal-open');
    
    // Clear modal data after animation
    setTimeout(() => {
      this.modalData = null;
    }, 300);
  }

  onGoToBookings(): void {
    if (this.modalData) {
      this.modalData.onGoToBookings();
    }
    this.cartConfirmationService.closeModal();
  }

  onContinueShopping(): void {
    if (this.modalData) {
      this.modalData.onContinueShopping();
    }
    this.cartConfirmationService.closeModal();
  }
}
