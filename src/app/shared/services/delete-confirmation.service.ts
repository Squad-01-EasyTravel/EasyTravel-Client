import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

export interface DeleteConfirmationModalData {
  title: string;
  message: string;
  itemName?: string;
  itemType?: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

export interface DeleteConfirmationResult {
  confirmed: boolean;
  cancelled: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class DeleteConfirmationService {
  private modalSubject = new Subject<DeleteConfirmationModalData | null>();
  private resultSubject = new Subject<DeleteConfirmationResult>();

  public modal$ = this.modalSubject.asObservable();
  public result$ = this.resultSubject.asObservable();

  showConfirmationModal(data: DeleteConfirmationModalData): Observable<DeleteConfirmationResult> {
    this.modalSubject.next(data);
    return this.result$;
  }

  closeModal(): void {
    this.modalSubject.next(null);
  }

  confirmAction(): void {
    this.resultSubject.next({ confirmed: true, cancelled: false });
    this.closeModal();
  }

  cancelAction(): void {
    this.resultSubject.next({ confirmed: false, cancelled: true });
    this.closeModal();
  }
}
