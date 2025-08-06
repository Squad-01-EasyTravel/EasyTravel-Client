import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { DeleteConfirmationService, DeleteConfirmationModalData } from '../services/delete-confirmation.service';

@Component({
  selector: 'app-delete-confirmation-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="delete-confirmation-modal" [class.show]="isVisible" *ngIf="modalData">
      <div class="modal-backdrop" (click)="onCancel()"></div>
      <div class="delete-confirmation-content">
        <div class="modal-header">
          <div class="icon-container" [class.destructive]="modalData.isDestructive">
            <i class="fas fa-exclamation-triangle" *ngIf="modalData.isDestructive"></i>
            <i class="fas fa-question-circle" *ngIf="!modalData.isDestructive"></i>
          </div>
          <h3 class="modal-title">{{ modalData.title }}</h3>
          <button type="button" class="close-button" (click)="onCancel()" aria-label="Fechar">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <p class="modal-message">{{ modalData.message }}</p>
          <div class="item-info" *ngIf="modalData.itemName">
            <strong>{{ modalData.itemType || 'Item' }}:</strong>
            <span class="item-name">{{ modalData.itemName }}</span>
          </div>
          <div class="warning-text" *ngIf="modalData.isDestructive">
            <i class="fas fa-exclamation-circle"></i>
            Esta ação não pode ser desfeita.
          </div>
        </div>
        
        <div class="modal-footer">
          <button 
            type="button" 
            class="btn btn-secondary" 
            (click)="onCancel()">
            <i class="fas fa-times"></i>
            {{ modalData.cancelText || 'Cancelar' }}
          </button>
          <button 
            type="button" 
            class="btn" 
            [class.btn-danger]="modalData.isDestructive"
            [class.btn-primary]="!modalData.isDestructive"
            (click)="onConfirm()">
            <i class="fas fa-check" *ngIf="!modalData.isDestructive"></i>
            <i class="fas fa-trash-alt" *ngIf="modalData.isDestructive"></i>
            {{ modalData.confirmText || 'Confirmar' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styleUrl: './delete-confirmation-modal.css'
})
export class DeleteConfirmationModal implements OnInit, OnDestroy {
  modalData: DeleteConfirmationModalData | null = null;
  isVisible = false;
  private subscription: Subscription = new Subscription();

  constructor(private deleteConfirmationService: DeleteConfirmationService) {}

  ngOnInit(): void {
    this.subscription = this.deleteConfirmationService.modal$.subscribe(data => {
      this.modalData = data;
      if (data) {
        this.isVisible = true;
        document.body.classList.add('modal-open');
        document.body.style.overflow = 'hidden';
      } else {
        this.isVisible = false;
        document.body.classList.remove('modal-open');
        document.body.style.overflow = 'auto';
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    document.body.classList.remove('modal-open');
    document.body.style.overflow = 'auto';
  }

  onConfirm(): void {
    this.deleteConfirmationService.confirmAction();
  }

  onCancel(): void {
    this.deleteConfirmationService.cancelAction();
  }
}
