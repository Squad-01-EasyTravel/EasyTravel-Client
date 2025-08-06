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

    // Verificar se a requisição deve pular autenticação
    if (req.headers.has('X-Skip-Auth')) {
      console.log('AuthInterceptor - Header X-Skip-Auth detectado, pulando autenticação');
      const cleanReq = req.clone({
        headers: req.headers.delete('X-Skip-Auth')
      });
      return next.handle(cleanReq);
    }

    // URLs que não precisam de autenticação - SEMPRE pular para medias
    const publicEndpoints = [
      '/api/medias',
      '/auth/login',
      '/auth/register',
      '/api/bundles/available'
    ];

    // Verificar se a URL é um endpoint público
    const isPublicEndpoint = publicEndpoints.some(endpoint => req.url.includes(endpoint));

    if (isPublicEndpoint) {
      console.log('AuthInterceptor - Endpoint público detectado:', req.url);
      console.log('AuthInterceptor - Não adicionando token');
      return next.handle(req);
    }

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
