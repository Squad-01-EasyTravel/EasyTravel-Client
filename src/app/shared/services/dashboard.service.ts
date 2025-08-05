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
  pacoteId: number;
  totalReservas: number;
  bundleTitle?: string; // Adicionado para armazenar o título do bundle
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
  faturamento: number; // Alterado de 'receita' para 'faturamento' para coincidir com a API
}

export interface FaturamentoPorPacote {
  pacoteId: number;
  faturamento: number;
  bundleTitle?: string; // Adicionado para armazenar o título do bundle
}

// Interface para resposta da API de bundles
export interface Bundle {
  id: number;
  bundleTitle: string;
  bundleDescription: string;
  initialPrice: number;
  bundleRank: string;
  initialDate: string;
  finalDate: string;
  quantity: number;
  travelersNumber: number;
  bundleStatus: string;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private baseUrl = 'http://localhost:8080/api/dashboard';
  private bundlesUrl = 'http://localhost:8080/api/bundles';

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

  // GET /api/bundles/{id} - Buscar bundle por ID para obter bundleTitle
  getBundleById(bundleId: number): Observable<Bundle> {
    const url = `${this.bundlesUrl}/${bundleId}`;
    console.log('🎯 DashboardService - Buscando bundle por ID:', bundleId, 'URL:', url);

    return this.http.get<Bundle>(url, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(data => console.log('✅ DashboardService - Bundle encontrado:', data)),
      catchError(error => {
        console.error('❌ DashboardService - Erro ao buscar bundle:', error);
        throw error;
      })
    );
  }

  // ========== MÉTODOS DE EXPORTAÇÃO PARA EXCEL ==========

  // GET /api/dashboard/export/vendas-por-pagamento
  exportVendasPorPagamento(): Observable<Blob> {
    const url = `${this.baseUrl}/export/vendas-por-pagamento`;
    console.log('📊 DashboardService - Exportando vendas por pagamento:', url);

    return this.http.get(url, {
      headers: this.getAuthHeaders(),
      responseType: 'blob'
    }).pipe(
      tap(() => console.log('✅ DashboardService - Exportação vendas por pagamento concluída')),
      catchError(error => {
        console.error('❌ DashboardService - Erro na exportação vendas por pagamento:', error);
        throw error;
      })
    );
  }

  // GET /api/dashboard/export/vendas-por-cidade
  exportVendasPorCidade(): Observable<Blob> {
    const url = `${this.baseUrl}/export/vendas-por-cidade`;
    console.log('📊 DashboardService - Exportando vendas por cidade:', url);

    return this.http.get(url, {
      headers: this.getAuthHeaders(),
      responseType: 'blob'
    }).pipe(
      tap(() => console.log('✅ DashboardService - Exportação vendas por cidade concluída')),
      catchError(error => {
        console.error('❌ DashboardService - Erro na exportação vendas por cidade:', error);
        throw error;
      })
    );
  }

  // GET /api/dashboard/export/usuarios-por-metodo-pagamento
  exportUsuariosPorMetodoPagamento(): Observable<Blob> {
    const url = `${this.baseUrl}/export/usuarios-por-metodo-pagamento`;
    console.log('📊 DashboardService - Exportando usuários por método pagamento:', url);

    return this.http.get(url, {
      headers: this.getAuthHeaders(),
      responseType: 'blob'
    }).pipe(
      tap(() => console.log('✅ DashboardService - Exportação usuários por método pagamento concluída')),
      catchError(error => {
        console.error('❌ DashboardService - Erro na exportação usuários por método pagamento:', error);
        throw error;
      })
    );
  }

  // GET /api/dashboard/export/total-reservas-por-pacote
  exportTotalReservasPorPacote(): Observable<Blob> {
    const url = `${this.baseUrl}/export/total-reservas-por-pacote`;
    console.log('📊 DashboardService - Exportando total reservas por pacote:', url);

    return this.http.get(url, {
      headers: this.getAuthHeaders(),
      responseType: 'blob'
    }).pipe(
      tap(() => console.log('✅ DashboardService - Exportação total reservas por pacote concluída')),
      catchError(error => {
        console.error('❌ DashboardService - Erro na exportação total reservas por pacote:', error);
        throw error;
      })
    );
  }

  // GET /api/dashboard/export/reservas-canceladas-por-mes
  exportReservasCanceladasPorMes(): Observable<Blob> {
    const url = `${this.baseUrl}/export/reservas-canceladas-por-mes`;
    console.log('📊 DashboardService - Exportando reservas canceladas por mês:', url);

    return this.http.get(url, {
      headers: this.getAuthHeaders(),
      responseType: 'blob'
    }).pipe(
      tap(() => console.log('✅ DashboardService - Exportação reservas canceladas por mês concluída')),
      catchError(error => {
        console.error('❌ DashboardService - Erro na exportação reservas canceladas por mês:', error);
        throw error;
      })
    );
  }

  // GET /api/dashboard/export/reservas-ativas-por-rank
  exportReservasAtivasPorRank(): Observable<Blob> {
    const url = `${this.baseUrl}/export/reservas-ativas-por-rank`;
    console.log('📊 DashboardService - Exportando reservas ativas por rank:', url);

    return this.http.get(url, {
      headers: this.getAuthHeaders(),
      responseType: 'blob'
    }).pipe(
      tap(() => console.log('✅ DashboardService - Exportação reservas ativas por rank concluída')),
      catchError(error => {
        console.error('❌ DashboardService - Erro na exportação reservas ativas por rank:', error);
        throw error;
      })
    );
  }

  // GET /api/dashboard/export/receita-por-mes
  exportReceitaPorMes(): Observable<Blob> {
    const url = `${this.baseUrl}/export/receita-por-mes`;
    console.log('📊 DashboardService - Exportando receita por mês:', url);

    return this.http.get(url, {
      headers: this.getAuthHeaders(),
      responseType: 'blob'
    }).pipe(
      tap(() => console.log('✅ DashboardService - Exportação receita por mês concluída')),
      catchError(error => {
        console.error('❌ DashboardService - Erro na exportação receita por mês:', error);
        throw error;
      })
    );
  }

  // GET /api/dashboard/export/faturamento-por-pacote
  exportFaturamentoPorPacote(): Observable<Blob> {
    const url = `${this.baseUrl}/export/faturamento-por-pacote`;
    console.log('📊 DashboardService - Exportando faturamento por pacote:', url);

    return this.http.get(url, {
      headers: this.getAuthHeaders(),
      responseType: 'blob'
    }).pipe(
      tap(() => console.log('✅ DashboardService - Exportação faturamento por pacote concluída')),
      catchError(error => {
        console.error('❌ DashboardService - Erro na exportação faturamento por pacote:', error);
        throw error;
      })
    );
  }
}
