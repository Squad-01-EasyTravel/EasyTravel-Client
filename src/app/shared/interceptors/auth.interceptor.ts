import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();
    
    console.log('AuthInterceptor - URL:', req.url);
    console.log('AuthInterceptor - Token disponível:', !!token);

    if (token) {
      const authReq = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`)
      });
      console.log('AuthInterceptor - Headers adicionados:', authReq.headers.get('Authorization'));
      return next.handle(authReq);
    }

    console.log('AuthInterceptor - Nenhum token encontrado');
    return next.handle(req);
  }
}
