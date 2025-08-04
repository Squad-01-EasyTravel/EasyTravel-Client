import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Navbar } from '../../../../../shared/navbar/navbar';
import { Footer } from '../../../../../shared/footer/footer';
import { BundleService } from '@/app/shared/services/bundle-service';
import { BundleClass } from '../class/bundle-class';
import { MediaResponse } from '../../../../../shared/models/media-response.interface';
import { BundleLocationResponse } from '../../../../../shared/models/bundle-location-response.interface';

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
  bundleImageUrl: string = '';
  
  // Propriedades para localização
  departureLocation: string = '';
  destinationLocation: string = '';
  
  // Propriedades para datas formatadas
  formattedDepartureDate: string = '';
  formattedReturnDate: string = '';
  
  // Propriedade para duração calculada
  calculatedDuration: string = '';
  
  // Propriedade para avaliação calculada
  calculatedRating: number = 5;

  ngOnInit():void {
    this.id = this.route.snapshot.paramMap.get('id') as string;
    this.service.getBundleById(this.id)
    .subscribe(res => {
      this.bundleClass = res;
      this.loadBundleImage();
      this.loadBundleLocation();
      this.formatDates();
      this.calculateBundleDuration();
      this.calculateBundleRating();
    });
  }

  loadBundleImage(): void {
    if (this.id) {
      console.log(`🖼️ Iniciando carregamento de imagem para bundle ${this.id}...`);
      console.log(`🖼️ URL do endpoint: http://localhost:8080/api/medias/images/bundle/${this.id}`);
      
      this.service.getBundleImage(parseInt(this.id)).subscribe({
        next: (imageResponse: MediaResponse[]) => {
          console.log(`🖼️ Resposta da API de imagem para bundle ${this.id}:`, imageResponse);
          console.log(`🖼️ Tipo da resposta:`, typeof imageResponse, Array.isArray(imageResponse));
          
          if (imageResponse && Array.isArray(imageResponse) && imageResponse.length > 0) {
            const rawImageUrl = imageResponse[0].mediaUrl;
            this.bundleImageUrl = this.processImageUrl(rawImageUrl);
            console.log(`🖼️ URL original da API: ${rawImageUrl}`);
            console.log(`🖼️ URL processada: ${this.bundleImageUrl}`);
          } else {
            console.log(`🖼️ Resposta inválida ou vazia, usando imagem padrão`);
            this.bundleImageUrl = 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800&h=400&fit=crop';
          }
        },
        error: (error) => {
          console.error(`❌ Erro ao carregar imagem para bundle ${this.id}:`, error);
          this.bundleImageUrl = 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800&h=400&fit=crop';
        }
      });
    }
  }

  private processImageUrl(rawUrl: string): string {
    console.log(`🔄 Processando URL da imagem: ${rawUrl}`);
    
    if (!rawUrl) {
      console.log(`❌ URL vazia, retornando imagem padrão`);
      return 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800&h=400&fit=crop';
    }

    // Se já for uma URL completa (http/https), retorna como está
    if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
      console.log(`✅ URL já é completa: ${rawUrl}`);
      return rawUrl;
    }

    // Se começar com /, remove a barra inicial
    const cleanUrl = rawUrl.startsWith('/') ? rawUrl.substring(1) : rawUrl;
    const processedUrl = `http://localhost:8080/${cleanUrl}`;
    
    console.log(`🔄 URL processada: ${processedUrl}`);
    return processedUrl;
  }

  onImageError(): void {
    console.log('❌ Erro ao carregar imagem no HTML, aplicando fallback');
    this.bundleImageUrl = 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800&h=400&fit=crop';
  }

  loadBundleLocation(): void {
    if (this.id) {
      console.log(`🗺️ Iniciando carregamento de localização para bundle ${this.id}...`);
      
      this.service.getBundleLocation(parseInt(this.id)).subscribe({
        next: (locationResponse: BundleLocationResponse[]) => {
          console.log(`🗺️ Resposta da API de localização para bundle ${this.id}:`, locationResponse);
          
          if (locationResponse && Array.isArray(locationResponse) && locationResponse.length > 0) {
            const location = locationResponse[0];
            
            // Formatar local de partida
            if (location.departure) {
              this.departureLocation = `${location.departure.city}, ${location.departure.states} - ${location.departure.country.trim()}`;
              console.log(`🛫 Local de partida: ${this.departureLocation}`);
            }
            
            // Formatar local de destino
            if (location.destination) {
              this.destinationLocation = `${location.destination.city}, ${location.destination.states} - ${location.destination.country.trim()}`;
              console.log(`🛬 Local de destino: ${this.destinationLocation}`);
            }
          } else {
            console.log(`🗺️ Resposta de localização inválida ou vazia`);
            this.departureLocation = 'Local de partida não informado';
            this.destinationLocation = 'Local de destino não informado';
          }
        },
        error: (error) => {
          console.error(`❌ Erro ao carregar localização para bundle ${this.id}:`, error);
          this.departureLocation = 'Erro ao carregar local de partida';
          this.destinationLocation = 'Erro ao carregar local de destino';
        }
      });
    }
  }

  formatDates(): void {
    console.log(`📅 Formatando datas do bundle...`);
    
    // Formatar data de partida
    if (this.bundleClass.initialDate) {
      this.formattedDepartureDate = this.formatDate(this.bundleClass.initialDate);
      console.log(`📅 Data de partida formatada: ${this.formattedDepartureDate}`);
    }
    
    // Formatar data de retorno
    if (this.bundleClass.finalDate) {
      this.formattedReturnDate = this.formatDate(this.bundleClass.finalDate);
      console.log(`📅 Data de retorno formatada: ${this.formattedReturnDate}`);
    }
  }

  private formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return dateString; // Retorna a data original se houver erro
    }
  }

  calculateBundleDuration(): void {
    console.log(`⏱️ Calculando duração do bundle...`);
    
    if (this.bundleClass.initialDate && this.bundleClass.finalDate) {
      const duration = this.calculateDuration(this.bundleClass.initialDate, this.bundleClass.finalDate);
      this.calculatedDuration = `${duration} ${duration === 1 ? 'dia' : 'dias'}`;
      console.log(`⏱️ Duração calculada: ${this.calculatedDuration}`);
    } else {
      console.log(`⏱️ Datas não disponíveis para cálculo de duração`);
      this.calculatedDuration = 'Duração não informada';
    }
  }

  private calculateDuration(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  calculateBundleRating(): void {
    console.log(`⭐ Calculando avaliação do bundle...`);
    
    if (this.bundleClass.bundleRank && this.bundleClass.id) {
      this.calculatedRating = this.getRatingFromRankConsistent(this.bundleClass.bundleRank, this.bundleClass.id);
      console.log(`⭐ Rank do bundle: ${this.bundleClass.bundleRank}`);
      console.log(`⭐ Avaliação calculada: ${this.calculatedRating} estrelas`);
    } else {
      console.log(`⭐ Dados de rank não disponíveis, usando avaliação padrão`);
      this.calculatedRating = 5; // Valor padrão
    }
  }

  // Método de avaliação consistente (mesmo usado na página bundle)
  private getRatingFromRankConsistent(rank: string, bundleId: number): number {
    switch (rank.toUpperCase()) {
      case 'BRONZE': return 1;
      case 'SILVER': 
      case 'PRATA': return 2;
      case 'GOLD': 
      case 'OURO': return 3;
      case 'PLATINUM': 
      case 'PLATINA': 
        return (bundleId % 2 === 0) ? 4 : 5;
      default: return 3;
    }
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
      totalAvaliacoes: 50,
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
  getStarsArray(rating?: number): number[] {
    const finalRating = rating !== undefined ? rating : this.calculatedRating;
    return Array(Math.floor(finalRating)).fill(0);
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
