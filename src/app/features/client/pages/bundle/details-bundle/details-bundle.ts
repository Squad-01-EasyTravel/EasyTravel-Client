import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Navbar } from '../../../../../shared/navbar/navbar';
import { Footer } from '../../../../../shared/footer/footer';
import { BundleService } from '@/app/shared/services/bundle-service';
import { BundleClass } from '../class/bundle-class';

// Interface para tipagem do pacote
interface Pacote {
  id: number;
  titulo: string;
  imagemPrincipal: string;
  preco: number;
  avaliacao: number;
  totalAvaliacoes: number;
  dataIda: string;
  dataVolta: string;
  duracao: string;
  tipoViagem: string;
  incluso: string;
  categoria: string;
  localizacao: string;
  descricaoCompleta: string;
  destino: string;
  localPartida: string;
  localDestino: string;
  descricaoIncluso: string;
  avaliacoes: Avaliacao[];
}

interface Avaliacao {
  id: number;
  nomeUsuario: string;
  avatarUsuario: string;
  nota: number;
  comentario: string;
  dataAvaliacao: Date;
}

@Component({
  selector: 'app-details-bundle',
  imports: [CommonModule, FormsModule, Navbar, Footer],
  templateUrl: './details-bundle.html',
  styleUrl: './details-bundle.css'
})
export class DetailsBundle implements OnInit {

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private service: BundleService
  ) {}

  // Dados do pacote (virão do back-end)
  pacote: Pacote | null = null;
  numeroPassageiros: number = 1;

  // Paginação das avaliações
  avaliacoesPaginadas: Avaliacao[] = [];
  paginaAtual: number = 1;
  itensPorPagina: number = 3;
  totalPaginas: number = 0;

  // Dados de exemplo para avaliações sumarizadas
  avaliacoesSumarizado = [
    { numero: 5, porcentagem: 85 },
    { numero: 4, porcentagem: 10 },
    { numero: 3, porcentagem: 3 },
    { numero: 2, porcentagem: 1 },
    { numero: 1, porcentagem: 1 }
  ];

  // Avaliações de exemplo (remover quando integrar com back-end)
  avaliacoesExemplo: Avaliacao[] = [
    {
      id: 1,
      nomeUsuario: 'Allan Reymond',
      avatarUsuario: '/assets/imgs/fortaleza.jpg',
      nota: 4,
      comentario: '"Minha viagem de Recife para São Paulo foi incrível! O voo foi tranquilo e a chegada no Aeroporto de Guarulhos foi bem organizada. Fiquei hospedado em um hotel na região da Avenida Paulista — localização excelente, perto de metrô, restaurantes e pontos turísticos. O quarto era confortável, limpo e com um bom café da manhã incluso."',
      dataAvaliacao: new Date('2024-01-15')
    },
    {
      id: 2,
      nomeUsuario: 'Maria Silva',
      avatarUsuario: '/assets/imgs/fortaleza.jpg',
      nota: 5,
      comentario: '"Experiência fantástica! A organização do pacote foi impecável e o atendimento superou minhas expectativas. Recomendo para quem quer conhecer São Paulo com tranquilidade."',
      dataAvaliacao: new Date('2024-01-10')
    },
    {
      id: 3,
      nomeUsuario: 'João Santos',
      avatarUsuario: '/assets/imgs/fortaleza.jpg',
      nota: 5,
      comentario: '"Viagem maravilhosa! O hotel era excelente e os passeios inclusos foram muito bem planejados. A equipe foi super prestativa em todos os momentos."',
      dataAvaliacao: new Date('2024-01-08')
    },
    {
      id: 4,
      nomeUsuario: 'Ana Paula',
      avatarUsuario: '/assets/imgs/fortaleza.jpg',
      nota: 4,
      comentario: '"Ótima experiência! São Paulo é uma cidade incrível e o pacote cobriu os principais pontos turísticos. O único ponto a melhorar seria o tempo livre para explorar por conta própria."',
      dataAvaliacao: new Date('2024-01-05')
    },
    {
      id: 5,
      nomeUsuario: 'Carlos Oliveira',
      avatarUsuario: '/assets/imgs/fortaleza.jpg',
      nota: 5,
      comentario: '"Perfeito do início ao fim! A hospedagem era de primeira qualidade e as refeições incluídas estavam deliciosas. Já estou planejando a próxima viagem com vocês."',
      dataAvaliacao: new Date('2024-01-03')
    },
    {
      id: 6,
      nomeUsuario: 'Fernanda Costa',
      avatarUsuario: '/assets/imgs/fortaleza.jpg',
      nota: 4,
      comentario: '"Adorei a viagem! O roteiro foi bem elaborado e conseguimos conhecer os principais pontos turísticos. O transporte foi pontual e confortável."',
      dataAvaliacao: new Date('2024-01-01')
    },
    {
      id: 7,
      nomeUsuario: 'Roberto Lima',
      avatarUsuario: '/assets/imgs/fortaleza.jpg',
      nota: 5,
      comentario: '"Superou todas as minhas expectativas! A cidade de São Paulo é fascinante e o pacote permitiu conhecê-la de forma completa e organizada."',
      dataAvaliacao: new Date('2023-12-28')
    }
  ];

  id!: string;
  bundleClass: BundleClass = new BundleClass();

  ngOnInit():void {
    this.id = this.route.snapshot.paramMap.get('id') as string;
    this.service.getBundleById(this.id)
    .subscribe(res => this.bundleClass = res);
  }

  // Métodos de paginação
  configurarPaginacao() {
    const avaliacoes = this.pacote?.avaliacoes || this.avaliacoesExemplo;
    this.totalPaginas = Math.ceil(avaliacoes.length / this.itensPorPagina);
    this.atualizarAvaliacoesPaginadas();
  }

  atualizarAvaliacoesPaginadas() {
    const avaliacoes = this.pacote?.avaliacoes || this.avaliacoesExemplo;
    const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
    const fim = inicio + this.itensPorPagina;
    this.avaliacoesPaginadas = avaliacoes.slice(inicio, fim);
  }

  irParaPagina(pagina: number) {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaAtual = pagina;
      this.atualizarAvaliacoesPaginadas();
    }
  }

  paginaAnterior() {
    this.irParaPagina(this.paginaAtual - 1);
  }

  proximaPagina() {
    this.irParaPagina(this.paginaAtual + 1);
  }

  getPaginas(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  // Método para carregar dados do pacote (substituir por serviço HTTP)
  carregarPacote(id: string) {
    // Dados de exemplo - substituir por chamada para o back-end
    this.pacote = {
      id: 1,
      titulo: 'Recife - São Paulo',
      imagemPrincipal: '/assets/imgs/fortaleza.jpg',
      preco: 2400, // Ajustado para corresponder ao hero
      avaliacao: 5.0,
      totalAvaliacoes: 1000,
      dataIda: '12/01/2025',
      dataVolta: '12/01/2025',
      duracao: '7 dias',
      tipoViagem: 'Aéreo + Hospedagem',
      incluso: 'Café da manhã, transfer',
      categoria: 'Pacote Completo',
      localizacao: 'Recife - São Paulo',
      descricaoCompleta: 'Descubra as maravilhas de Recife e São Paulo em uma viagem inesquecível. Este pacote oferece uma experiência completa com hospedagem de qualidade, transfers inclusos e as principais atrações de ambas as cidades. Explore a rica cultura nordestina em Recife e a vibrante metrópole paulista, com guias especializados e roteiros personalizados.',
      destino: 'Recife - São Paulo',
      localPartida: 'Aeroporto Internacional do Recife / Guararapes',
      localDestino: 'Aeroporto Internacional de Guarulhos (GRU)',
      descricaoIncluso: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
      avaliacoes: this.avaliacoesExemplo
    };

    // Configurar paginação após carregar os dados
    this.configurarPaginacao();
  }

  // Método para gerar array de estrelas
  getStarsArray(rating: number): number[] {
    return Array(Math.floor(rating)).fill(0);
  }

  // Método para calcular valor total
  calcularValorTotal(): string {
    if (!this.pacote) return '0';
    const total = this.pacote.preco * this.numeroPassageiros;
    return total.toLocaleString('pt-BR');
  }

  // Método para realizar reserva
  realizarReserva() {
    if (!this.pacote) return;

    const dadosReserva = {
      pacoteId: this.pacote.id,
      numeroPassageiros: this.numeroPassageiros,
      valorTotal: this.pacote.preco * this.numeroPassageiros,
      dataReserva: new Date()
    };

    console.log('Dados da reserva para enviar ao back-end:', dadosReserva);

    // Aqui você faria a chamada HTTP para o back-end
    // this.reservaService.criarReserva(dadosReserva).subscribe(...)

    alert('Reserva realizada com sucesso! (Implementar integração com back-end)');
  }
}
