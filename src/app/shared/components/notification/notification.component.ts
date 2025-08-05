import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Notification } from '../../services/notification.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notification-container">
      <div 
        *ngFor="let notification of notifications; trackBy: trackByFn"
        class="notification notification-{{notification.type}}"
        [class.show]="true"
        (click)="removeNotification(notification.id)"
      >
        <div class="notification-icon">
          <i class="fas" [ngClass]="{
            'fa-check-circle': notification.type === 'success',
            'fa-exclamation-circle': notification.type === 'error',
            'fa-exclamation-triangle': notification.type === 'warning',
            'fa-info-circle': notification.type === 'info'
          }"></i>
        </div>
        <div class="notification-content">
          <div class="notification-title">{{ notification.title }}</div>
          <div class="notification-message">{{ notification.message }}</div>
        </div>
        <button 
          class="notification-close"
          (click)="removeNotification(notification.id)"
          aria-label="Fechar notificação"
        >
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .notification-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      max-width: 400px;
      pointer-events: none;
    }

    .notification {
      display: flex;
      align-items: flex-start;
      background: white;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
      margin-bottom: 12px;
      padding: 16px;
      transform: translateX(100%);
      transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
      pointer-events: auto;
      cursor: pointer;
      border-left: 4px solid;
      backdrop-filter: blur(10px);
      position: relative;
      overflow: hidden;
    }

    .notification.show {
      transform: translateX(0);
    }

    .notification::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(45deg, rgba(255, 255, 255, 0.1), transparent);
      pointer-events: none;
    }

    .notification-success {
      border-left-color: #10B981;
      background: linear-gradient(135deg, #ECFDF5 0%, #F0FDF4 100%);
    }

    .notification-error {
      border-left-color: #EF4444;
      background: linear-gradient(135deg, #FEF2F2 0%, #FEF2F2 100%);
    }

    .notification-warning {
      border-left-color: #F59E0B;
      background: linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%);
    }

    .notification-info {
      border-left-color: #3B82F6;
      background: linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%);
    }

    .notification-icon {
      flex-shrink: 0;
      margin-right: 12px;
      font-size: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 50%;
    }

    .notification-success .notification-icon {
      color: #10B981;
      background: rgba(16, 185, 129, 0.1);
    }

    .notification-error .notification-icon {
      color: #EF4444;
      background: rgba(239, 68, 68, 0.1);
    }

    .notification-warning .notification-icon {
      color: #F59E0B;
      background: rgba(245, 158, 11, 0.1);
    }

    .notification-info .notification-icon {
      color: #3B82F6;
      background: rgba(59, 130, 246, 0.1);
    }

    .notification-content {
      flex: 1;
      min-width: 0;
    }

    .notification-title {
      font-weight: 600;
      font-size: 14px;
      margin-bottom: 4px;
      color: #1F2937;
    }

    .notification-message {
      font-size: 13px;
      color: #6B7280;
      line-height: 1.4;
    }

    .notification-close {
      flex-shrink: 0;
      background: none;
      border: none;
      color: #9CA3AF;
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      transition: all 0.2s ease;
      margin-left: 8px;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .notification-close:hover {
      color: #6B7280;
      background: rgba(0, 0, 0, 0.05);
    }

    @media (max-width: 480px) {
      .notification-container {
        left: 10px;
        right: 10px;
        max-width: none;
      }
      
      .notification {
        margin-bottom: 8px;
        padding: 12px;
      }
    }

    /* Animação de entrada mais suave */
    @keyframes slideInRight {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    .notification {
      animation: slideInRight 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    }
  `]
})
export class NotificationComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  private subscription: Subscription = new Subscription();

  constructor(private notificationService: NotificationService) {}

  ngOnInit() {
    this.subscription.add(
      this.notificationService.notifications$.subscribe(
        notifications => this.notifications = notifications
      )
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  removeNotification(id: string) {
    this.notificationService.removeNotification(id);
  }

  trackByFn(index: number, item: Notification) {
    return item.id;
  }
}
