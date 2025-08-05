import { CommonModule } from '@angular/common';
import { Component, AfterViewInit, OnDestroy, HostListener } from '@angular/core';
import Chart, { ChartTypeRegistry } from 'chart.js/auto';
import { HttpClient } from '@angular/common/http';
import { DashboardService } from '../../../../shared/services/dashboard.service';
import { AuthService } from '../../../../shared/services/auth.service';
import { Router } from '@angular/router';
import { forkJoin, of, Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-admin-dashboard-content',
  standalone: true,
  templateUrl: './admin-dashboard-content.html',
  styleUrl: './admin-dashboard-content.css',
  imports: [CommonModule],
})
export class AdminDashboardContent implements AfterViewInit, OnDestroy {
  constructor(
    private http: HttpClient,
    private dashboardService: DashboardService,
    private authService: AuthService,
    private router: Router
  ) {}
  metrics = [
    { key: 'faturamentoPorPacote', label: 'Faturamento por Pacote', type: 'bar', canvasId: 'chart1' },
    { key: 'receitaTotalPorMes', label: 'Receita Total por Mês', type: 'line', canvasId: 'chart2' },
    { key: 'reservasAtivasPorRank', label: 'Reservas Ativas por Rank', type: 'bar', canvasId: 'chart3' },
    { key: 'usuariosPorMetodoPagamento', label: 'Usuários por Método de Pagamento', type: 'pie', canvasId: 'chart4' },
    { key: 'totalReservasPorPacote', label: 'Total de Reservas por Pacote', type: 'bar', canvasId: 'chart5' },
    { key: 'vendasPorCidadeDestino', label: 'Vendas Totais por Cidade de Destino', type: 'doughnut', canvasId: 'chart6' },
    { key: 'reservasCanceladasPorMes', label: 'Reservas Canceladas por Mês', type: 'line', canvasId: 'chart7' },
    { key: 'vendasPorPagamento', label: 'Vendas por Pagamento', type: 'pie', canvasId: 'chart8' }
  ];
  selectedMetric = this.metrics[0].key;
  charts: { [key: string]: Chart } = {};

  // Timeout para debounce do resize
  private resizeTimeout: any;

  // Dados da API
  apiData: { [key: string]: any } = {};

  ngAfterViewInit() {
    // Verificar autenticação e autorização antes de carregar dados
    console.log('🔐 Dashboard - Verificando autenticação...');

    if (!this.authService.isAuthenticated()) {
      console.log('❌ Dashboard - Usuário não autenticado, redirecionando para login...');
      this.router.navigate(['/auth/login']);
      return;
    }

    if (!this.authService.hasAdminAccess()) {
      console.log('❌ Dashboard - Usuário sem acesso administrativo:', this.authService.getCurrentUserRole());
      alert('Acesso negado! Apenas administradores e funcionários podem acessar o dashboard.');
      this.router.navigate(['/home']);
      return;
    }

    console.log('✅ Dashboard - Usuário autorizado:', this.authService.getCurrentUserRole());
    console.log('🚀 Dashboard - Iniciando carregamento dos dados...');
    this.loadDashboardData();
  }

  loadDashboardData() {
    console.log('📊 Dashboard - Carregando dados da API...');
    this.debugAuthInfo();

    // Carrega primeiro endpoint: vendas por pagamento
    this.loadVendasPorPagamento();
  }

  debugAuthInfo() {
    console.log('🔍 DEBUG - Informações de Autenticação:');
    console.log('  - Token existe:', !!this.authService.getToken());
    console.log('  - Usuário autenticado:', this.authService.isAuthenticated());
    console.log('  - Role atual:', this.authService.getCurrentUserRole());
    console.log('  - Tem acesso admin:', this.authService.hasAdminAccess());
    console.log('  - Usuário atual:', this.authService.getCurrentUser());

    const token = this.authService.getToken();
    if (token) {
      console.log('  - Token (primeiros 50 chars):', token.substring(0, 50) + '...');
    }
  }

  loadVendasPorPagamento() {
    console.log('💳 Dashboard - Carregando vendas por pagamento...');
    this.dashboardService.getVendasPorPagamento().subscribe({
      next: (data) => {
        console.log('✅ Dashboard - Vendas por pagamento recebidas:', data);
        this.apiData['vendasPorPagamento'] = data;
        this.renderChartWithApiData('vendasPorPagamento');

        // Próximo endpoint
        this.loadVendasPorCidade();
      },
      error: (error) => {
        console.error('❌ Dashboard - Erro ao carregar vendas por pagamento:', error);
        this.renderEmptyChart('vendasPorPagamento');

        // Continua para próximo endpoint mesmo com erro
        this.loadVendasPorCidade();
      }
    });
  }

  loadVendasPorCidade() {
    console.log('🏙️ Dashboard - Carregando vendas por cidade...');
    this.dashboardService.getVendasPorCidade().subscribe({
      next: (data) => {
        console.log('✅ Dashboard - Vendas por cidade recebidas:', data);
        this.apiData['vendasPorCidadeDestino'] = data;
        this.renderChartWithApiData('vendasPorCidadeDestino');

        // Próximo endpoint
        this.loadUsuariosPorMetodoPagamento();
      },
      error: (error) => {
        console.error('❌ Dashboard - Erro ao carregar vendas por cidade:', error);
        this.renderEmptyChart('vendasPorCidadeDestino');

        // Continua para próximo endpoint
        this.loadUsuariosPorMetodoPagamento();
      }
    });
  }

  loadUsuariosPorMetodoPagamento() {
    console.log('👥 Dashboard - Carregando usuários por método de pagamento...');
    this.dashboardService.getUsuariosPorMetodoPagamento().subscribe({
      next: (data) => {
        console.log('✅ Dashboard - Usuários por método pagamento recebidos:', data);
        this.apiData['usuariosPorMetodoPagamento'] = data;
        this.renderChartWithApiData('usuariosPorMetodoPagamento');

        // Próximo endpoint
        this.loadTotalReservasPorPacote();
      },
      error: (error) => {
        console.error('❌ Dashboard - Erro ao carregar usuários por método pagamento:', error);
        this.renderEmptyChart('usuariosPorMetodoPagamento');

        // Continua para próximo endpoint
        this.loadTotalReservasPorPacote();
      }
    });
  }

  loadTotalReservasPorPacote() {
    console.log('📦 Dashboard - Carregando total reservas por pacote...');
    this.dashboardService.getTotalReservasPorPacote().subscribe({
      next: (data) => {
        console.log('✅ Dashboard - Total reservas por pacote recebidas:', data);

        // Buscar bundleTitles para cada item
        this.loadBundleTitlesForReservas(data);
      },
      error: (error) => {
        console.error('❌ Dashboard - Erro ao carregar total reservas por pacote:', error);
        this.renderEmptyChart('totalReservasPorPacote');

        // Continua para próximo endpoint
        this.loadReservasCanceladasPorMes();
      }
    });
  }

  loadBundleTitlesForReservas(reservasData: any[]) {
    console.log('🎯 Dashboard - Buscando bundleTitles para reservas...');

    if (!reservasData || reservasData.length === 0) {
      console.log('⚠️ Dashboard - Sem dados de reservas, renderizando vazio');
      this.renderEmptyChart('totalReservasPorPacote');
      this.loadReservasCanceladasPorMes();
      return;
    }

    const bundleRequests = reservasData.map(item => {
      const bundleId = item.pacoteId || item.pacote;
      console.log('🎯 Dashboard - Buscando bundle ID:', bundleId, 'para item:', item);

      return this.dashboardService.getBundleById(bundleId).pipe(
        tap(bundle => {
          console.log('✅ Dashboard - Bundle encontrado:', bundle.bundleTitle, 'para ID:', bundleId);
          item.bundleTitle = bundle.bundleTitle;
        }),
        catchError(error => {
          console.error('❌ Dashboard - Erro ao buscar bundle ID:', bundleId, error);
          item.bundleTitle = `Pacote ${bundleId}`;
          return of(null);
        })
      );
    });

    // Aguardar todas as requisições de bundles
    forkJoin(bundleRequests).subscribe({
      next: () => {
        console.log('🎉 Dashboard - Todos os bundleTitles carregados para reservas:', reservasData);
        this.apiData['totalReservasPorPacote'] = reservasData;
        this.renderChartWithApiData('totalReservasPorPacote');

        // Próximo endpoint
        this.loadReservasCanceladasPorMes();
      },
      error: (error) => {
        console.error('❌ Dashboard - Erro ao carregar bundleTitles para reservas:', error);
        this.apiData['totalReservasPorPacote'] = reservasData;
        this.renderChartWithApiData('totalReservasPorPacote');

        // Continua mesmo com erro
        this.loadReservasCanceladasPorMes();
      }
    });
  }

  loadReservasCanceladasPorMes() {
    console.log('❌ Dashboard - Carregando reservas canceladas por mês...');
    this.dashboardService.getReservasCanceladasPorMes().subscribe({
      next: (data) => {
        console.log('✅ Dashboard - Reservas canceladas por mês recebidas:', data);
        this.apiData['reservasCanceladasPorMes'] = data;
        this.renderChartWithApiData('reservasCanceladasPorMes');

        // Próximo endpoint
        this.loadReservasAtivasPorRank();
      },
      error: (error) => {
        console.error('❌ Dashboard - Erro ao carregar reservas canceladas por mês:', error);
        this.renderEmptyChart('reservasCanceladasPorMes');

        // Continua para próximo endpoint
        this.loadReservasAtivasPorRank();
      }
    });
  }

  loadReservasAtivasPorRank() {
    console.log('🏆 Dashboard - Carregando reservas ativas por rank...');
    this.dashboardService.getReservasAtivasPorRank().subscribe({
      next: (data) => {
        console.log('✅ Dashboard - Reservas ativas por rank recebidas:', data);
        this.apiData['reservasAtivasPorRank'] = data;
        this.renderChartWithApiData('reservasAtivasPorRank');

        // Próximo endpoint
        this.loadReceitaPorMes();
      },
      error: (error) => {
        console.error('❌ Dashboard - Erro ao carregar reservas ativas por rank:', error);
        this.renderEmptyChart('reservasAtivasPorRank');

        // Continua para próximo endpoint
        this.loadReceitaPorMes();
      }
    });
  }

  loadReceitaPorMes() {
    console.log('💰 Dashboard - Carregando receita por mês...');
    this.dashboardService.getReceitaPorMes().subscribe({
      next: (data) => {
        console.log('✅ Dashboard - Receita por mês recebida:', data);
        this.apiData['receitaTotalPorMes'] = data;
        this.renderChartWithApiData('receitaTotalPorMes');

        // Último endpoint
        this.loadFaturamentoPorPacote();
      },
      error: (error) => {
        console.error('❌ Dashboard - Erro ao carregar receita por mês:', error);
        this.renderEmptyChart('receitaTotalPorMes');

        // Último endpoint
        this.loadFaturamentoPorPacote();
      }
    });
  }

  loadFaturamentoPorPacote() {
    console.log('💵 Dashboard - Carregando faturamento por pacote...');
    this.dashboardService.getFaturamentoPorPacote().subscribe({
      next: (data) => {
        console.log('✅ Dashboard - Faturamento por pacote recebido:', data);

        // Buscar bundleTitles para cada item
        this.loadBundleTitlesForFaturamento(data);
      },
      error: (error) => {
        console.error('❌ Dashboard - Erro ao carregar faturamento por pacote:', error);
        this.renderEmptyChart('faturamentoPorPacote');

        console.log('⚠️ Dashboard - Carregamento finalizado com alguns erros.');
      }
    });
  }

  loadBundleTitlesForFaturamento(faturamentoData: any[]) {
    console.log('🎯 Dashboard - Buscando bundleTitles para faturamento...');

    if (!faturamentoData || faturamentoData.length === 0) {
      console.log('⚠️ Dashboard - Sem dados de faturamento, renderizando vazio');
      this.renderEmptyChart('faturamentoPorPacote');
      console.log('🎉 Dashboard - Todos os dados foram carregados!');
      return;
    }

    const bundleRequests = faturamentoData.map(item => {
      const bundleId = item.pacoteId || item.pacote;
      console.log('🎯 Dashboard - Buscando bundle ID:', bundleId, 'para item:', item);

      return this.dashboardService.getBundleById(bundleId).pipe(
        tap(bundle => {
          console.log('✅ Dashboard - Bundle encontrado:', bundle.bundleTitle, 'para ID:', bundleId);
          item.bundleTitle = bundle.bundleTitle;
        }),
        catchError(error => {
          console.error('❌ Dashboard - Erro ao buscar bundle ID:', bundleId, error);
          item.bundleTitle = `Pacote ${bundleId}`;
          return of(null);
        })
      );
    });

    // Aguardar todas as requisições de bundles
    forkJoin(bundleRequests).subscribe({
      next: () => {
        console.log('🎉 Dashboard - Todos os bundleTitles carregados para faturamento:', faturamentoData);
        this.apiData['faturamentoPorPacote'] = faturamentoData;
        this.renderChartWithApiData('faturamentoPorPacote');

        console.log('🎉 Dashboard - Todos os dados foram carregados!');
      },
      error: (error) => {
        console.error('❌ Dashboard - Erro ao carregar bundleTitles para faturamento:', error);
        this.apiData['faturamentoPorPacote'] = faturamentoData;
        this.renderChartWithApiData('faturamentoPorPacote');

        console.log('⚠️ Dashboard - Carregamento finalizado com alguns erros.');
      }
    });
  }

  renderChartWithApiData(metricKey: string) {
    const metric = this.metrics.find(m => m.key === metricKey);
    if (!metric) {
      console.error(`❌ Dashboard - Métrica não encontrada: ${metricKey}`);
      return;
    }

    console.log(`📊 Dashboard - Renderizando gráfico com dados da API: ${metric.label}`);

    // Aguarda um pouco para garantir que o DOM esteja pronto
    setTimeout(() => {
      this.renderChart(metricKey, metric.canvasId, metric.type as keyof ChartTypeRegistry);
    }, 100);
  }

  renderEmptyChart(metricKey: string) {
    const metric = this.metrics.find(m => m.key === metricKey);
    if (!metric) {
      console.error(`❌ Dashboard - Métrica não encontrada: ${metricKey}`);
      return;
    }

    console.log(`⚪ Dashboard - Renderizando gráfico vazio: ${metric.label}`);

    // Aguarda um pouco para garantir que o DOM esteja pronto
    setTimeout(() => {
      this.renderChart(metricKey, metric.canvasId, metric.type as keyof ChartTypeRegistry);
    }, 100);
  }

  renderChart(metricKey: string, canvasId: string, chartType: keyof ChartTypeRegistry) {
    const ctx = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!ctx) {
      console.error(`❌ Dashboard - Canvas with id ${canvasId} not found`);
      // Tenta novamente após um delay
      setTimeout(() => {
        this.renderChart(metricKey, canvasId, chartType);
      }, 500);
      return;
    }

    console.log(`📊 Dashboard - Canvas encontrado: ${canvasId}`, ctx);

    // Força o canvas a ter dimensões válidas
    ctx.width = ctx.offsetWidth || 400;
    ctx.height = ctx.offsetHeight || 300;

    if (this.charts[canvasId]) {
      this.charts[canvasId].destroy();
    }

    let chartData;
    let chartLabel = '';

    // Obter dados da API ou usar dados vazios
    const apiDataForMetric = this.apiData[metricKey];
    console.log(`📈 Dashboard - Dados da API para ${metricKey}:`, apiDataForMetric);

    switch (metricKey) {
      case 'faturamentoPorPacote':
        chartLabel = 'Faturamento por Pacote';
        if (apiDataForMetric && Array.isArray(apiDataForMetric)) {
          console.log('📊 Dashboard - Dados faturamento para gráfico:', apiDataForMetric);
          chartData = {
            labels: apiDataForMetric.map((item: any) => {
              const label = item.bundleTitle || item.pacote || item.nome || `Pacote ${item.pacoteId || 'N/A'}`;
              console.log('🏷️ Dashboard - Label faturamento:', label, 'para item:', item);
              return label;
            }),
            datasets: [{
              label: chartLabel,
              data: apiDataForMetric.map((item: any) => {
                const value = item.faturamento || item.valor || 0;
                console.log('💰 Dashboard - Valor faturamento:', value, 'para item:', item);
                return value;
              }),
              backgroundColor: ['#FF7900', '#7FC023', '#6AAE20', '#FF5722', '#2196F3', '#9C27B0']
            }]
          };
        } else {
          chartData = {
            labels: ['Sem dados'],
            datasets: [{ label: chartLabel, data: [0], backgroundColor: ['#ccc'] }]
          };
        }
        break;

      case 'receitaTotalPorMes':
        chartLabel = 'Receita Total por Mês';
        if (apiDataForMetric && Array.isArray(apiDataForMetric)) {
          console.log('📊 Dashboard - Dados receita para gráfico:', apiDataForMetric);
          chartData = {
            labels: apiDataForMetric.map((item: any) => {
              const label = item.mes || 'N/A';
              console.log('🏷️ Dashboard - Label receita:', label, 'para item:', item);
              return label;
            }),
            datasets: [{
              label: chartLabel,
              data: apiDataForMetric.map((item: any) => {
                const value = item.faturamento || item.receita || item.valor || 0;
                console.log('💰 Dashboard - Valor receita:', value, 'para item:', item);
                return value;
              }),
              borderColor: '#FF7900',
              backgroundColor: 'rgba(255, 121, 0, 0.1)',
              tension: 0.4
            }]
          };
        } else {
          chartData = {
            labels: ['Sem dados'],
            datasets: [{
              label: chartLabel,
              data: [0],
              borderColor: '#ccc',
              backgroundColor: 'rgba(204, 204, 204, 0.1)'
            }]
          };
        }
        break;

      case 'reservasAtivasPorRank':
        chartLabel = 'Reservas Ativas por Rank';
        if (apiDataForMetric && Array.isArray(apiDataForMetric)) {
          console.log('📊 Dashboard - Dados reservas por rank para gráfico:', apiDataForMetric);

          // Mapeamento dos ranks para display mais amigável
          const rankLabels: { [key: number]: string } = {
            1: '1º Lugar - Ouro',
            2: '2º Lugar - Prata',
            3: '3º Lugar - Bronze',
            4: '4º Lugar'
          };

          chartData = {
            labels: apiDataForMetric.map((item: any) => {
              const label = rankLabels[item.bundleRank] || item.rank || `Rank ${item.bundleRank}` || 'N/A';
              console.log('🏷️ Dashboard - Label rank:', label, 'para item:', item);
              return label;
            }),
            datasets: [{
              label: chartLabel,
              data: apiDataForMetric.map((item: any) => {
                const value = item.reservasAtivas || item.ativas || item.quantidade || 0;
                console.log('🏆 Dashboard - Valor reservas rank:', value, 'para item:', item);
                return value;
              }),
              backgroundColor: ['#FFD700', '#C0C0C0', '#CD7F32', '#E5E4E2'] // Ouro, Prata, Bronze, 4º lugar
            }]
          };
        } else {
          chartData = {
            labels: ['Sem dados'],
            datasets: [{ label: chartLabel, data: [0], backgroundColor: ['#ccc'] }]
          };
        }
        break;

      case 'usuariosPorMetodoPagamento':
        chartLabel = 'Usuários por Método';
        if (apiDataForMetric && Array.isArray(apiDataForMetric)) {
          console.log('📊 Dashboard - Dados usuários por método de pagamento para gráfico:', apiDataForMetric);

          // Mapeamento dos métodos de pagamento
          const paymentMethodLabels: { [key: number]: string } = {
            0: 'Cartão de Crédito',
            1: 'Cartão de Débito',
            2: 'PIX',
            3: 'Boleto'
          };

          chartData = {
            labels: apiDataForMetric.map((item: any) => {
              const label = paymentMethodLabels[item.paymentMethod] || item.metodo || `Método ${item.paymentMethod}` || 'N/A';
              console.log('🏷️ Dashboard - Label usuários método:', label, 'para item:', item);
              return label;
            }),
            datasets: [{
              label: chartLabel,
              data: apiDataForMetric.map((item: any) => {
                const value = item.totalUsuarios || item.usuarios || item.quantidade || 0;
                console.log('👥 Dashboard - Valor usuários método:', value, 'para item:', item);
                return value;
              }),
              backgroundColor: ['#FF7900', '#7FC023', '#6AAE20', '#FF5722', '#2196F3']
            }]
          };
        } else {
          chartData = {
            labels: ['Sem dados'],
            datasets: [{ label: chartLabel, data: [0], backgroundColor: ['#ccc'] }]
          };
        }
        break;

      case 'totalReservasPorPacote':
        chartLabel = 'Reservas por Pacote';
        if (apiDataForMetric && Array.isArray(apiDataForMetric)) {
          console.log('📊 Dashboard - Dados reservas para gráfico:', apiDataForMetric);
          chartData = {
            labels: apiDataForMetric.map((item: any) => {
              const label = item.bundleTitle || item.pacote || item.nome || `Pacote ${item.pacoteId || 'N/A'}`;
              console.log('🏷️ Dashboard - Label reservas:', label, 'para item:', item);
              return label;
            }),
            datasets: [{
              label: chartLabel,
              data: apiDataForMetric.map((item: any) => {
                const value = item.totalReservas || item.quantidade || 0;
                console.log('📈 Dashboard - Valor reservas:', value, 'para item:', item);
                return value;
              }),
              backgroundColor: ['#FF7900', '#7FC023', '#6AAE20', '#FF5722', '#2196F3', '#9C27B0']
            }]
          };
        } else {
          chartData = {
            labels: ['Sem dados'],
            datasets: [{ label: chartLabel, data: [0], backgroundColor: ['#ccc'] }]
          };
        }
        break;

      case 'vendasPorCidadeDestino':
        chartLabel = 'Vendas por Cidade';
        if (apiDataForMetric && Array.isArray(apiDataForMetric)) {
          console.log('📊 Dashboard - Dados vendas por cidade para gráfico:', apiDataForMetric);
          chartData = {
            labels: apiDataForMetric.map((item: any) => {
              const label = item.destination || item.cidade || 'N/A';
              console.log('🏷️ Dashboard - Label cidade:', label, 'para item:', item);
              return label;
            }),
            datasets: [{
              label: chartLabel,
              data: apiDataForMetric.map((item: any) => {
                const value = item.totalVendas || item.total || item.quantidade || 0;
                console.log('🏙️ Dashboard - Valor vendas cidade:', value, 'para item:', item);
                return value;
              }),
              backgroundColor: ['#FF7900', '#7FC023', '#6AAE20', '#FF5722', '#2196F3', '#9C27B0', '#FFC107', '#E91E63', '#00BCD4', '#795548']
            }]
          };
        } else {
          chartData = {
            labels: ['Sem dados'],
            datasets: [{ label: chartLabel, data: [0], backgroundColor: ['#ccc'] }]
          };
        }
        break;

      case 'reservasCanceladasPorMes':
        chartLabel = 'Cancelamentos por Mês';
        if (apiDataForMetric && Array.isArray(apiDataForMetric)) {
          console.log('📊 Dashboard - Dados cancelamentos para gráfico:', apiDataForMetric);
          chartData = {
            labels: apiDataForMetric.map((item: any) => {
              const label = item.mes || 'N/A';
              console.log('🏷️ Dashboard - Label cancelamentos:', label, 'para item:', item);
              return label;
            }),
            datasets: [{
              label: chartLabel,
              data: apiDataForMetric.map((item: any) => {
                const value = item.totalCanceladas || item.canceladas || item.quantidade || 0;
                console.log('❌ Dashboard - Valor cancelamentos:', value, 'para item:', item);
                return value;
              }),
              borderColor: '#FF5722',
              backgroundColor: 'rgba(255, 87, 34, 0.1)',
              tension: 0.4
            }]
          };
        } else {
          chartData = {
            labels: ['Sem dados'],
            datasets: [{
              label: chartLabel,
              data: [0],
              borderColor: '#ccc',
              backgroundColor: 'rgba(204, 204, 204, 0.1)'
            }]
          };
        }
        break;

      case 'vendasPorPagamento':
        chartLabel = 'Vendas por Pagamento';
        if (apiDataForMetric && Array.isArray(apiDataForMetric)) {
          console.log('📊 Dashboard - Dados vendas por pagamento para gráfico:', apiDataForMetric);

          // Mapeamento dos métodos de pagamento
          const paymentMethodLabels: { [key: number]: string } = {
            0: 'Cartão de Crédito',
            1: 'Cartão de Débito',
            2: 'PIX',
            3: 'Boleto'
          };

          chartData = {
            labels: apiDataForMetric.map((item: any) => {
              const label = paymentMethodLabels[item.paymentMethod] || item.metodo || `Método ${item.paymentMethod}` || 'N/A';
              console.log('🏷️ Dashboard - Label pagamento:', label, 'para item:', item);
              return label;
            }),
            datasets: [{
              label: chartLabel,
              data: apiDataForMetric.map((item: any) => {
                const value = item.totalRevenue || item.totalTransactions || item.quantidade || item.total || 0;
                console.log('💳 Dashboard - Valor vendas pagamento:', value, 'para item:', item);
                return value;
              }),
              backgroundColor: ['#FF7900', '#7FC023', '#6AAE20', '#FF5722', '#2196F3']
            }]
          };
        } else {
          chartData = {
            labels: ['Sem dados'],
            datasets: [{ label: chartLabel, data: [0], backgroundColor: ['#ccc'] }]
          };
        }
        break;

      default:
        chartLabel = 'Dados não encontrados';
        chartData = {
          labels: ['Sem dados'],
          datasets: [{ label: chartLabel, data: [0], backgroundColor: ['#ccc'] }]
        };
    }

    console.log(`📊 Dashboard - Dados do gráfico ${metricKey}:`, chartData);

    this.charts[canvasId] = new Chart(ctx, {
      type: chartType,
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        resizeDelay: 100, // DELAY PARA RESIZE
        devicePixelRatio: window.devicePixelRatio || 1, // MELHORA QUALIDADE
        animation: {
          duration: 1000,
          easing: 'easeInOutQuart'
        },
        layout: {
          padding: {
            top: 10,
            right: 15,
            bottom: 10,
            left: 15
          }
        },
        interaction: {
          intersect: false,
          mode: 'index'
        },
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              font: { size: 12, family: 'Lato, Arial, sans-serif' },
              color: '#333',
              padding: 15,
              usePointStyle: true
            }
          },
          tooltip: {
            enabled: true,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            titleColor: '#FF7900',
            bodyColor: '#333',
            borderColor: '#FF7900',
            borderWidth: 1,
            padding: 12,
            titleFont: { size: 14, weight: 'bold' },
            bodyFont: { size: 12 },
            cornerRadius: 8
          }
        },
        scales: (chartType === 'bar' || chartType === 'line') ? {
          x: {
            grid: {
              color: 'rgba(0,0,0,0.05)',
              display: true
            },
            ticks: {
              font: { size: 11 },
              color: '#666',
              maxRotation: 45
            }
          },
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0,0,0,0.05)',
              display: true
            },
            ticks: {
              font: { size: 11 },
              color: '#666'
            }
          }
        } : {}
      }
    });

    // Força o gráfico a se redimensionar após a criação
    setTimeout(() => {
      if (this.charts[canvasId]) {
        this.charts[canvasId].resize();
      }
    }, 100);
  }
  // Método para exportar gráfico específico
  exportChart(metricKey: string) {
    const metric = this.metrics.find(m => m.key === metricKey);
    const chartName = metric ? metric.label : metricKey;

    console.log(`📊 Exportando gráfico: ${chartName} (${metricKey})`);

    // Mapeamento das métricas para os métodos de exportação
    const exportMethods: { [key: string]: () => Observable<Blob> } = {
      'faturamentoPorPacote': () => this.dashboardService.exportFaturamentoPorPacote(),
      'receitaTotalPorMes': () => this.dashboardService.exportReceitaPorMes(),
      'reservasAtivasPorRank': () => this.dashboardService.exportReservasAtivasPorRank(),
      'usuariosPorMetodoPagamento': () => this.dashboardService.exportUsuariosPorMetodoPagamento(),
      'totalReservasPorPacote': () => this.dashboardService.exportTotalReservasPorPacote(),
      'vendasPorCidadeDestino': () => this.dashboardService.exportVendasPorCidade(),
      'reservasCanceladasPorMes': () => this.dashboardService.exportReservasCanceladasPorMes(),
      'vendasPorPagamento': () => this.dashboardService.exportVendasPorPagamento()
    };

    const exportMethod = exportMethods[metricKey];

    if (exportMethod) {
      // Chama o método de exportação correspondente
      exportMethod().subscribe({
        next: (blob: Blob) => {
          // Cria um link temporário para download do arquivo
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;

          // Define o nome do arquivo baseado na métrica
          const fileName = `${metricKey}_${new Date().toISOString().split('T')[0]}.xlsx`;
          link.download = fileName;

          // Adiciona ao DOM, clica e remove
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          // Limpa a URL temporária
          window.URL.revokeObjectURL(url);

          console.log(`✅ Download concluído: ${fileName}`);
        },
        error: (error: any) => {
          console.error(`❌ Erro ao exportar ${chartName}:`, error);
          alert(`❌ Erro ao exportar "${chartName}"\n\nTente novamente ou verifique sua conexão.`);
        }
      });
    } else {
      console.warn(`⚠️ Método de exportação não encontrado para: ${metricKey}`);
      alert(`⚠️ Exportação para "${chartName}" ainda não está disponível.`);
    }

    // Exemplo de implementação futura:
    /*
    const chart = this.charts[metric?.canvasId || ''];
    if (chart) {
      // Extrair dados do gráfico
      const data = chart.data;
      // Converter para formato Excel
      // Fazer download do arquivo
    }
    */
  }

  // Método para obter estatísticas do dashboard
  getTotalMetrics() {
    return {
      totalRevenue: 'R$ 387.000',
      totalBookings: 485,
      activeUsers: 1.247,
      avgRating: 4.8
    };
  }

  // Listener para redimensionamento da janela - VERSÃO MELHORADA
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    // Debounce para evitar muitas chamadas
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }

    this.resizeTimeout = setTimeout(() => {
      console.log('🔄 Dashboard - Redimensionando gráficos...');

      // Para cada gráfico, força um update completo
      Object.keys(this.charts).forEach(chartKey => {
        const chart = this.charts[chartKey];
        if (chart) {
          try {
            // Primeiro destrói o gráfico existente
            chart.destroy();

            // Aguarda um frame antes de recriar
            requestAnimationFrame(() => {
              // Encontra qual métrica corresponde a este canvas
              const metric = this.metrics.find(m => m.canvasId === chartKey);
              if (metric && this.apiData[metric.key]) {
                this.renderChartWithApiData(metric.key);
              }
            });
          } catch (error) {
            console.error(`❌ Erro ao redimensionar gráfico ${chartKey}:`, error);
          }
        }
      });
    }, 250); // Debounce de 250ms
  }

  // Método para recriar todos os gráficos
  recreateCharts() {
    console.log('🔄 Dashboard - Recriando todos os gráficos...');
    this.loadDashboardData();
  }

  ngOnDestroy() {
    // Limpa timeout se existir
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }

    // Destroi todos os gráficos ao sair do componente
    Object.values(this.charts).forEach(chart => {
      if (chart) {
        chart.destroy();
      }
    });
  }
}
