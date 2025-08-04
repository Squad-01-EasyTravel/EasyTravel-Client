import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';

// Interfaces para tipagem dos dados da API
export interface DashboardDataPoint {
  label: string;
  value: number;
}

export interface VendasPorPagamento {
  metodo: string;
  quantidade: number;
}

export interface VendasPorCidade {
  cidade: string;
  total: number;
}

export interface UsuariosPorMetodoPagamento {
  metodo: string;
  usuarios: number;
}

export interface ReservasPorPacote {
  pacote: string;
  totalReservas: number;
}

export interface ReservasSemPagamento {
  total: number;
}

export interface ReservasCanceladasPorMes {
  mes: string;
  canceladas: number;
}

export interface ReservasAtivasPorRank {
  rank: string;
  ativas: number;
}

export interface ReceitaPorMes {
  mes: string;
  receita: number;
}

export interface FaturamentoPorPacote {
  pacote: string;
  faturamento: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private baseUrl = 'http://localhost:8080/api/dashboard';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    console.log('🔑 DashboardService - Token disponível:', !!token);
    console.log('🔑 DashboardService - Usuário autenticado:', this.authService.isAuthenticated());
    console.log('🔑 DashboardService - Role do usuário:', this.authService.getCurrentUserRole());
    console.log('🔑 DashboardService - Has admin access:', this.authService.hasAdminAccess());

    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
      console.log('🔑 DashboardService - Header Authorization adicionado');
    } else {
      console.log('❌ DashboardService - Sem token disponível!');
    }

    return headers;
  }

  // GET /api/dashboard/vendas-por-pagamento
  getVendasPorPagamento(): Observable<VendasPorPagamento[]> {
    const url = `${this.baseUrl}/vendas-por-pagamento`;
    console.log('🔌 DashboardService - Chamando API:', url);

    return this.http.get<VendasPorPagamento[]>(url, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(data => console.log('✅ DashboardService - Vendas por pagamento:', data)),
      catchError(error => {
        console.error('❌ DashboardService - Erro vendas por pagamento:', error);
        throw error;
      })
    );
  }

  // GET /api/dashboard/vendas-por-cidade
  getVendasPorCidade(): Observable<VendasPorCidade[]> {
    const url = `${this.baseUrl}/vendas-por-cidade`;
    console.log('🔌 DashboardService - Chamando API:', url);

    return this.http.get<VendasPorCidade[]>(url, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(data => console.log('✅ DashboardService - Vendas por cidade:', data)),
      catchError(error => {
        console.error('❌ DashboardService - Erro vendas por cidade:', error);
        throw error;
      })
    );
  }

  // GET /api/dashboard/usuarios-por-metodo-pagamento
  getUsuariosPorMetodoPagamento(): Observable<UsuariosPorMetodoPagamento[]> {
    const url = `${this.baseUrl}/usuarios-por-metodo-pagamento`;
    console.log('🔌 DashboardService - Chamando API:', url);

    return this.http.get<UsuariosPorMetodoPagamento[]>(url, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(data => console.log('✅ DashboardService - Usuários por método pagamento:', data)),
      catchError(error => {
        console.error('❌ DashboardService - Erro usuários por método pagamento:', error);
        throw error;
      })
    );
  }

  // GET /api/dashboard/total-reservas-por-pacote
  getTotalReservasPorPacote(): Observable<ReservasPorPacote[]> {
    const url = `${this.baseUrl}/total-reservas-por-pacote`;
    console.log('🔌 DashboardService - Chamando API:', url);

    return this.http.get<ReservasPorPacote[]>(url, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(data => console.log('✅ DashboardService - Total reservas por pacote:', data)),
      catchError(error => {
        console.error('❌ DashboardService - Erro total reservas por pacote:', error);
        throw error;
      })
    );
  }

  // GET /api/dashboard/reservas-sem-pagamento
  getReservasSemPagamento(): Observable<ReservasSemPagamento> {
    const url = `${this.baseUrl}/reservas-sem-pagamento`;
    console.log('🔌 DashboardService - Chamando API:', url);

    return this.http.get<ReservasSemPagamento>(url, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(data => console.log('✅ DashboardService - Reservas sem pagamento:', data)),
      catchError(error => {
        console.error('❌ DashboardService - Erro reservas sem pagamento:', error);
        throw error;
      })
    );
  }

  // GET /api/dashboard/reservas-canceladas-por-mes
  getReservasCanceladasPorMes(): Observable<ReservasCanceladasPorMes[]> {
    const url = `${this.baseUrl}/reservas-canceladas-por-mes`;
    console.log('🔌 DashboardService - Chamando API:', url);

    return this.http.get<ReservasCanceladasPorMes[]>(url, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(data => console.log('✅ DashboardService - Reservas canceladas por mês:', data)),
      catchError(error => {
        console.error('❌ DashboardService - Erro reservas canceladas por mês:', error);
        throw error;
      })
    );
  }

  // GET /api/dashboard/reservas-ativas-por-rank
  getReservasAtivasPorRank(): Observable<ReservasAtivasPorRank[]> {
    const url = `${this.baseUrl}/reservas-ativas-por-rank`;
    console.log('🔌 DashboardService - Chamando API:', url);

    return this.http.get<ReservasAtivasPorRank[]>(url, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(data => console.log('✅ DashboardService - Reservas ativas por rank:', data)),
      catchError(error => {
        console.error('❌ DashboardService - Erro reservas ativas por rank:', error);
        throw error;
      })
    );
  }

  // GET /api/dashboard/receita-por-mes
  getReceitaPorMes(): Observable<ReceitaPorMes[]> {
    const url = `${this.baseUrl}/receita-por-mes`;
    console.log('🔌 DashboardService - Chamando API:', url);

    return this.http.get<ReceitaPorMes[]>(url, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(data => console.log('✅ DashboardService - Receita por mês:', data)),
      catchError(error => {
        console.error('❌ DashboardService - Erro receita por mês:', error);
        throw error;
      })
    );
  }

  // GET /api/dashboard/faturamento-por-pacote
  getFaturamentoPorPacote(): Observable<FaturamentoPorPacote[]> {
    const url = `${this.baseUrl}/faturamento-por-pacote`;
    console.log('🔌 DashboardService - Chamando API:', url);

    return this.http.get<FaturamentoPorPacote[]>(url, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(data => console.log('✅ DashboardService - Faturamento por pacote:', data)),
      catchError(error => {
        console.error('❌ DashboardService - Erro faturamento por pacote:', error);
        throw error;
      })
    );
  }
}
