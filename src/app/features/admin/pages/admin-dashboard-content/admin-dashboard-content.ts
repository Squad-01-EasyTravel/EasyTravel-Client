import { CommonModule } from '@angular/common';
import { Component, AfterViewInit, OnDestroy, HostListener } from '@angular/core';
import Chart, { ChartTypeRegistry } from 'chart.js/auto';
import { HttpClient } from '@angular/common/http';
import { DashboardService } from '../../../../shared/services/dashboard.service';
import { AuthService } from '../../../../shared/services/auth.service';
import { Router } from '@angular/router';

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
        this.apiData['totalReservasPorPacote'] = data;
        this.renderChartWithApiData('totalReservasPorPacote');

        // Próximo endpoint
        this.loadReservasCanceladasPorMes();
      },
      error: (error) => {
        console.error('❌ Dashboard - Erro ao carregar total reservas por pacote:', error);
        this.renderEmptyChart('totalReservasPorPacote');

        // Continua para próximo endpoint
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
        this.apiData['faturamentoPorPacote'] = data;
        this.renderChartWithApiData('faturamentoPorPacote');

        console.log('🎉 Dashboard - Todos os dados foram carregados!');
      },
      error: (error) => {
        console.error('❌ Dashboard - Erro ao carregar faturamento por pacote:', error);
        this.renderEmptyChart('faturamentoPorPacote');

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
          chartData = {
            labels: apiDataForMetric.map((item: any) => item.pacote || item.nome || 'N/A'),
            datasets: [{
              label: chartLabel,
              data: apiDataForMetric.map((item: any) => item.faturamento || item.valor || 0),
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
          chartData = {
            labels: apiDataForMetric.map((item: any) => item.mes || 'N/A'),
            datasets: [{
              label: chartLabel,
              data: apiDataForMetric.map((item: any) => item.receita || item.valor || 0),
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
          chartData = {
            labels: apiDataForMetric.map((item: any) => item.rank || 'N/A'),
            datasets: [{
              label: chartLabel,
              data: apiDataForMetric.map((item: any) => item.ativas || item.quantidade || 0),
              backgroundColor: ['#CD7F32', '#C0C0C0', '#FFD700', '#E5E4E2']
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
          chartData = {
            labels: apiDataForMetric.map((item: any) => item.metodo || 'N/A'),
            datasets: [{
              label: chartLabel,
              data: apiDataForMetric.map((item: any) => item.usuarios || item.quantidade || 0),
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
          chartData = {
            labels: apiDataForMetric.map((item: any) => item.pacote || item.nome || 'N/A'),
            datasets: [{
              label: chartLabel,
              data: apiDataForMetric.map((item: any) => item.totalReservas || item.quantidade || 0),
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
          chartData = {
            labels: apiDataForMetric.map((item: any) => item.cidade || 'N/A'),
            datasets: [{
              label: chartLabel,
              data: apiDataForMetric.map((item: any) => item.total || item.quantidade || 0),
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

      case 'reservasCanceladasPorMes':
        chartLabel = 'Cancelamentos por Mês';
        if (apiDataForMetric && Array.isArray(apiDataForMetric)) {
          chartData = {
            labels: apiDataForMetric.map((item: any) => item.mes || 'N/A'),
            datasets: [{
              label: chartLabel,
              data: apiDataForMetric.map((item: any) => item.canceladas || item.quantidade || 0),
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
          chartData = {
            labels: apiDataForMetric.map((item: any) => item.metodo || 'N/A'),
            datasets: [{
              label: chartLabel,
              data: apiDataForMetric.map((item: any) => item.quantidade || item.total || 0),
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
        animation: {
          duration: 1000,
          easing: 'easeInOutQuart'
        },
        layout: {
          padding: 10
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

    // Simula o processo de exportação
    console.log(`Exportando gráfico: ${chartName}`);

    // Aqui seria implementada a lógica real de exportação
    // Por exemplo, usando bibliotecas como xlsx ou html2canvas
    alert(`📊 Exportando "${chartName}" para Excel...\n\n✅ Em desenvolvimento: funcionalidade será implementada em breve!`);

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

  // Listener para redimensionamento da janela
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    Object.values(this.charts).forEach(chart => {
      if (chart) {
        chart.resize();
      }
    });
  }

  // Método para recriar todos os gráficos
  recreateCharts() {
    console.log('🔄 Dashboard - Recriando todos os gráficos...');
    this.loadDashboardData();
  }

  ngOnDestroy() {
    // Destroi todos os gráficos ao sair do componente
    Object.values(this.charts).forEach(chart => {
      if (chart) {
        chart.destroy();
      }
    });
  }
}
