import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface ToastMessage {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  id?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastSubject = new Subject<ToastMessage>();
  public toast$ = this.toastSubject.asObservable();

  showSuccess(title: string, message: string, duration: number = 5000): void {
    this.show({
      type: 'success',
      title,
      message,
      duration,
      id: this.generateId()
    });
  }

  showError(title: string, message: string, duration: number = 7000): void {
    this.show({
      type: 'error',
      title,
      message,
      duration,
      id: this.generateId()
    });
  }

  showWarning(title: string, message: string, duration: number = 6000): void {
    this.show({
      type: 'warning',
      title,
      message,
      duration,
      id: this.generateId()
    });
  }

  showInfo(title: string, message: string, duration: number = 5000): void {
    this.show({
      type: 'info',
      title,
      message,
      duration,
      id: this.generateId()
    });
  }

  private show(toast: ToastMessage): void {
    this.toastSubject.next(toast);
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}
