import { CommonModule } from '@angular/common';
import { Component, AfterViewInit } from '@angular/core';
import Chart, { ChartTypeRegistry } from 'chart.js/auto';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin-dashboard-content',
  standalone: true,
  templateUrl: './admin-dashboard-content.html',
  styleUrl: './admin-dashboard-content.css',
  imports: [CommonModule],
})
export class AdminDashboardContent implements AfterViewInit {
  constructor(private http: HttpClient) {}
  metrics = [
    { key: 'faturamentoPorPacote', label: 'Faturamento por Pacote' },
    { key: 'receitaTotalPorMes', label: 'Receita Total por Mês' },
    { key: 'reservasAtivasPorRank', label: 'Reservas Ativas por Rank' },
    { key: 'reservasCanceladasPorMes', label: 'Reservas Canceladas por Mês' },
    { key: 'totalReservasPorPacote', label: 'Total de Reservas por Pacote' },
    { key: 'usuariosPorMetodoPagamento', label: 'Usuários por Método de Pagamento' },
    { key: 'vendasPorCidadeDestino', label: 'Vendas Totais por Cidade de Destino' },
    { key: 'vendasPorPagamento', label: 'Vendas por Pagamento' }
  ];
  selectedMetric = this.metrics[0].key;
  chart: Chart | null = null;

  ngAfterViewInit() {
    this.renderChart();
  }

  selectMetric(metricKey: string) {
    this.selectedMetric = metricKey;
    this.renderChart();
  }

  renderChart() {
    const ctx = document.getElementById('myChart') as HTMLCanvasElement;
    if (this.chart) {
      this.chart.destroy();
    }
    let chartData;
    let chartType: keyof ChartTypeRegistry = 'bar';
    let chartLabel = '';

    switch (this.selectedMetric) {
      case 'faturamentoPorPacote':
        chartLabel = 'Faturamento por Pacote';
        chartData = {
          labels: ['Pacote 1', 'Pacote 2', 'Pacote 3'],
          datasets: [{ label: chartLabel, data: [10000, 15000, 8000] }]
        };
        break;
      case 'receitaTotalPorMes':
        chartLabel = 'Receita Total por Mês';
        chartData = {
          labels: ['Jan', 'Fev', 'Mar'],
          datasets: [{ label: chartLabel, data: [20000, 25000, 18000] }]
        };
        break;
      case 'reservasAtivasPorRank':
        chartLabel = 'Reservas Ativas por Rank';
        chartData = {
          labels: ['Bronze', 'Prata', 'Ouro', 'Platina'],
          datasets: [{ label: chartLabel, data: [5, 8, 12, 3] }]
        };
        break;
      case 'reservasCanceladasPorMes':
        chartLabel = 'Reservas Canceladas por Mês';
        chartData = {
          labels: ['Jan', 'Fev', 'Mar'],
          datasets: [{ label: chartLabel, data: [2, 1, 4] }]
        };
        break;
      case 'totalReservasPorPacote':
        chartLabel = 'Total de Reservas por Pacote';
        chartData = {
          labels: ['Pacote 1', 'Pacote 2', 'Pacote 3'],
          datasets: [{ label: chartLabel, data: [20, 35, 15] }]
        };
        break;
      case 'usuariosPorMetodoPagamento':
        chartLabel = 'Usuários por Método de Pagamento';
        chartType = 'pie' as keyof ChartTypeRegistry;
        chartData = {
          labels: ['Cartão', 'Pix', 'Boleto'],
          datasets: [{ label: chartLabel, data: [50, 30, 20] }]
        };
        break;
      case 'vendasPorCidadeDestino':
        chartLabel = 'Vendas Totais por Cidade de Destino';
        chartData = {
          labels: ['Fortaleza', 'Gramado', 'São Paulo'],
          datasets: [{ label: chartLabel, data: [10, 15, 8] }]
        };
        break;
      case 'vendasPorPagamento':
        chartLabel = 'Vendas por Pagamento';
        chartType = 'doughnut' as keyof ChartTypeRegistry;
        chartData = {
          labels: ['Cartão', 'Pix', 'Boleto'],
          datasets: [{ label: chartLabel, data: [60, 25, 15] }]
        };
        break;
      default:
        chartLabel = 'Faturamento por Pacote';
        chartData = {
          labels: ['Pacote 1', 'Pacote 2', 'Pacote 3'],
          datasets: [{ label: chartLabel, data: [10000, 15000, 8000] }]
        };
    }

    this.chart = new Chart(ctx, {
      type: chartType,
      data: {
        ...chartData,
        datasets: chartData.datasets.map((ds: any, i: number) => ({
          ...ds,
          backgroundColor: ds.backgroundColor || [
            'rgba(54, 162, 235, 0.7)',
            'rgba(255, 99, 132, 0.7)',
            'rgba(255, 206, 86, 0.7)',
            'rgba(75, 192, 192, 0.7)',
            'rgba(153, 102, 255, 0.7)',
            'rgba(255, 159, 64, 0.7)'
          ],
          borderColor: ds.borderColor || [
            'rgba(54, 162, 235, 1)',
            'rgba(255, 99, 132, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)'
          ],
          borderWidth: 2,
          borderRadius: 8,
          hoverBackgroundColor: [
            'rgba(54, 162, 235, 0.9)',
            'rgba(255, 99, 132, 0.9)',
            'rgba(255, 206, 86, 0.9)',
            'rgba(75, 192, 192, 0.9)',
            'rgba(153, 102, 255, 0.9)',
            'rgba(255, 159, 64, 0.9)'
          ]
        }))
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              font: { size: 16, family: 'Poppins, Arial, sans-serif' },
              color: '#333'
            }
          },
          tooltip: {
            enabled: true,
            backgroundColor: '#fff',
            titleColor: '#007bff',
            bodyColor: '#333',
            borderColor: '#007bff',
            borderWidth: 1,
            padding: 12,
            titleFont: { size: 16, weight: 'bold' },
            bodyFont: { size: 14 }
          }
        },
        scales: chartType === 'bar' ? {
          x: {
            grid: { color: 'rgba(0,0,0,0.05)' },
            ticks: { font: { size: 14 }, color: '#007bff' }
          },
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(0,0,0,0.05)' },
            ticks: { font: { size: 14 }, color: '#007bff' }
          }
        } : {}
      }
    });
  }


  exportExcel() {
    const endpointMap: { [key: string]: string } = {
      vendasPorPagamento: 'vendas-por-pagamento',
      vendasPorCidadeDestino: 'vendas-por-cidade',
      usuariosPorMetodoPagamento: 'usuarios-por-metodo-pagamento',
      totalReservasPorPacote: 'total-reservas-por-pacote',
      reservasSemPagamento: 'reservas-sem-pagamento',
      reservasCanceladasPorMes: 'reservas-canceladas-por-mes',
      reservasAtivasPorRank: 'reservas-ativas-por-rank',
      receitaTotalPorMes: 'receita-por-mes',
      faturamentoPorPacote: 'faturamento-por-pacote'
    };

    const endpoint = endpointMap[this.selectedMetric];
    if (!endpoint) {
      alert('Exportação não disponível para este filtro.');
      return;
    }

    this.http.get(`/api/dashboard/export/${endpoint}`, { responseType: 'blob' }).subscribe((blob: Blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${endpoint}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }
}
