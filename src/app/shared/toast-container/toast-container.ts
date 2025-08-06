import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ToastService, ToastMessage } from '../services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      <div 
        *ngFor="let toast of toasts" 
        class="toast" 
        [class]="'toast-' + toast.type"
        [class.show]="true"
        (click)="removeToast(toast.id!)">
        <div class="toast-icon">
          <i class="fas fa-check-circle" *ngIf="toast.type === 'success'"></i>
          <i class="fas fa-exclamation-circle" *ngIf="toast.type === 'error'"></i>
          <i class="fas fa-exclamation-triangle" *ngIf="toast.type === 'warning'"></i>
          <i class="fas fa-info-circle" *ngIf="toast.type === 'info'"></i>
        </div>
        <div class="toast-content">
          <div class="toast-title">{{ toast.title }}</div>
          <div class="toast-message">{{ toast.message }}</div>
        </div>
        <button class="toast-close" (click)="removeToast(toast.id!); $event.stopPropagation()">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>
  `,
  styleUrl: './toast-container.css'
})
export class ToastContainerComponent implements OnInit, OnDestroy {
  toasts: ToastMessage[] = [];
  private subscription: Subscription = new Subscription();

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    this.subscription = this.toastService.toast$.subscribe(toast => {
      this.addToast(toast);
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private addToast(toast: ToastMessage): void {
    this.toasts.push(toast);
    
    // Auto remove toast after duration
    if (toast.duration && toast.duration > 0) {
      setTimeout(() => {
        this.removeToast(toast.id!);
      }, toast.duration);
    }
  }

  removeToast(id: string): void {
    const index = this.toasts.findIndex(toast => toast.id === id);
    if (index > -1) {
      this.toasts.splice(index, 1);
    }
  }
}
