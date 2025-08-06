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
      border-radius: 16px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
      margin-bottom: 12px;
      padding: 20px;
      transform: translateX(100%);
      transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
      pointer-events: auto;
      cursor: pointer;
      border-left: 5px solid;
      backdrop-filter: blur(15px);
      position: relative;
      overflow: hidden;
      min-width: 350px;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }

    .notification.show {
      transform: translateX(0);
    }

    .notification:hover {
      transform: translateX(-5px);
      box-shadow: 0 15px 50px rgba(0, 0, 0, 0.2);
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

    .notification::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent);
      pointer-events: none;
    }

    .notification-success {
      border-left-color: #22C55E;
      background: linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%);
      box-shadow: 0 8px 32px rgba(34, 197, 94, 0.1);
    }

    .notification-error {
      border-left-color: #DC2626;
      background: linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%);
      box-shadow: 0 8px 32px rgba(220, 38, 38, 0.1);
    }

    .notification-warning {
      border-left-color: #D97706;
      background: linear-gradient(135deg, #FFFBEB 0%, #FED7AA 100%);
      box-shadow: 0 8px 32px rgba(217, 119, 6, 0.1);
    }

    .notification-info {
      border-left-color: #2563EB;
      background: linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%);
      box-shadow: 0 8px 32px rgba(37, 99, 235, 0.1);
    }

    .notification-icon {
      flex-shrink: 0;
      margin-right: 16px;
      font-size: 22px;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: 12px;
      margin-top: 2px;
    }

    .notification-success .notification-icon {
      color: #22C55E;
      background: rgba(34, 197, 94, 0.1);
    }

    .notification-error .notification-icon {
      color: #DC2626;
      background: rgba(220, 38, 38, 0.1);
    }

    .notification-warning .notification-icon {
      color: #D97706;
      background: rgba(217, 119, 6, 0.1);
    }

    .notification-info .notification-icon {
      color: #2563EB;
      background: rgba(37, 99, 235, 0.1);
    }

    .notification-content {
      flex: 1;
      min-width: 0;
    }

    .notification-title {
      font-weight: 700;
      font-size: 15px;
      margin-bottom: 6px;
      color: #1F2937;
      letter-spacing: -0.01em;
    }

    .notification-message {
      font-size: 14px;
      color: #4B5563;
      line-height: 1.5;
      font-weight: 400;
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
