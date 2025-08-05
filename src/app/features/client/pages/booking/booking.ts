import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Navbar } from "../../../../shared/navbar/navbar";
import { Footer } from "../../../../shared/footer/footer";
import { CurrentUser } from './classe/current-user';
import { BookingService } from '@/app/shared/services/booking.service';
import { BundleService } from '@/app/shared/services/bundle-service';
import { BundleClass } from '../bundle/class/bundle-class';
import { AuthService } from '@/app/shared/services/auth.service';

interface ReservationData {
  id: string;
  bundleId?: number;
  title: string;
  imageUrl: string;
  startDate: string;
  endDate: string;
  travelers: number;
  duration: number;
  description: string;
  price: number;
  orderId: string;
  status: string;
}

interface SelectedPackage {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  rating: number;
  startDate: string;
  endDate: string;
  travelers: number;
  duration: number;
  description: string;
  includes: string[];
  basePrice: string;
  extraPrice?: string;
  discount?: string;
  extraServices?: boolean;
  selected: boolean; // Para seleção no checkout
}

interface UserProfile {
  fullName: string;
  birthDate: string;
  cpf: string;
  rg: string;
  email: string;
  phone: string;
}

interface TravelerInfo {
  fullName: string;
  birthDate: string;
  cpf: string;
  rg: string;
  email: string;
  phone: string;
  editing: boolean;
}

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, FormsModule, Navbar, Footer],
  templateUrl: './booking.html',
  styleUrl: './booking.css'
})
export class Booking implements OnInit {

  // Dados da reserva recebidos da navegação
  reservationData: ReservationData | null = null;

  // Dados do pacote selecionado (da API)
  selectedPackageData: SelectedPackage | null = null;

  // Dados do perfil do usuário (carregados do serviço de auth)
  userProfile: UserProfile = {
    fullName: '',
    birthDate: '',
    cpf: '',
    rg: '',
    email: '',
    phone: ''
  };

  // Lista de pacotes no carrinho - adaptado para um único pacote
  packageList: SelectedPackage[] = [
    {
      id: 'pkg-001',
      title: 'Fortaleza - Ceará',
      category: 'OURO',
      imageUrl: '/assets/imgs/fortaleza.jpg',
      rating: 4.8,
      startDate: '15/08/2024',
      endDate: '22/08/2024',
      travelers: 2,
      duration: 7,
      description: 'Explore as belas praias de Fortaleza, com águas cristalinas e paisagens deslumbrantes. Inclui hospedagem, café da manhã e passeios exclusivos.',
      includes: [
        'Hospedagem em hotel 4 estrelas',
        'Café da manhã incluído',
        'Transfer aeroporto-hotel',
        'Passeio de buggy nas dunas',
        'City tour pela cidade',
        'Seguro viagem'
      ],
      basePrice: '2.400,00', // Preço por pessoa
      extraPrice: '200,00',
      discount: '300,00',
      extraServices: true,
      selected: true
    }
  ];

  // Informações dos viajantes extras para o pacote único
  travelersInfoByPackage: { [packageId: string]: TravelerInfo[] } = {};
  totalPrice: string = '0,00';

  // Propriedade getter para facilitar o acesso ao pacote atual
  get currentPackage(): SelectedPackage {
    // Se temos dados selecionados da API, usar eles
    if (this.selectedPackageData) {
      return this.selectedPackageData;
    }
    return this.packageList[0];
  }

  // Método para definir dados do pacote selecionado da API
  setSelectedPackageData(packageData: any): void {
    // Usar dados do currentBundle se disponível, senão usar os dados passados
    const finalCategory = this.getFinalCategoryFromBundle();
    const finalRating = this.getFinalRatingFromBundle();
    
    this.selectedPackageData = {
      id: packageData.id?.toString() || this.currentBundle?.id?.toString() || '1',
      title: packageData.title || this.currentBundle?.bundleTitle || '',
      category: finalCategory,
      imageUrl: packageData.imageUrl || this.currentBundle?.imageUrl || '/assets/imgs/fortaleza.jpg',
      rating: finalRating,
      startDate: packageData.startDate || this.currentBundle?.initialDate || '',
      endDate: packageData.endDate || this.currentBundle?.finalDate || '',
      travelers: packageData.travelers || this.currentBundle?.travelersNumber || 1,
      duration: packageData.duration || 7,
      description: packageData.description || this.currentBundle?.bundleDescription || '',
      includes: packageData.includes || [
        'Hospedagem em hotel 4 estrelas',
        'Café da manhã incluído', 
        'Transfer aeroporto-hotel',
        'Seguro viagem'
      ],
      basePrice: packageData.basePrice || this.currentBundle?.initialPrice?.toString() || '0,00',
      extraPrice: packageData.extraPrice || '0,00',
      discount: packageData.discount || '0,00',
      extraServices: packageData.extraServices || false,
      selected: packageData.selected || true
    };
    
    console.log('✅ Dados do pacote selecionado definidos com rank da API:', this.selectedPackageData);
    console.log('📊 Rank do bundle:', finalCategory, 'Rating calculado:', finalRating);
  }

  constructor(
    private router: Router,
    private service: BookingService,
    private bundleService: BundleService, private authService: AuthService
  ) {}

  currentUser: CurrentUser = new CurrentUser();
  currentBundle: BundleClass = new BundleClass();

  ngOnInit(): void {
    // Verificar se há dados de reserva vindos da navegação
    const navigationState = this.router.getCurrentNavigation()?.extras?.state || history.state;
    if (navigationState && navigationState['reservationData']) {
      this.reservationData = navigationState['reservationData'];
      console.log('📦 Dados da reserva recebidos:', this.reservationData);
      this.populatePackageFromReservation();
      
      // Se temos dados da reserva, inicializar diretamente sem fazer outras requisições
      this.initializeTravelersForCurrentPackage();
      this.calculateTotalPrice();
      this.loadBookingData();
      return; // Sair aqui para evitar outras requisições desnecessárias
    }

    // Só fazer as requisições se NÃO tiver dados de reserva
    console.log('📡 Carregando dados do usuário e bundle...');
    
    // 1. Pega o id do usuário autenticado
    const userId = this.authService.currentUser.userId;
    // 2. Busca os dados completos do usuário
    this.service.getCurrentUser(userId).subscribe({
      next: (user) => {
        this.currentUser = user;
        console.log('👤 Usuário carregado:', user);
        
        // 3. Busca o bundle pelo bundleId do usuário
        if (user.bundleId) {
          this.bundleService.getBundleById(user.bundleId).subscribe({
            next: (bundle) => {
              this.currentBundle = bundle;
              console.log('🔗 Bundle carregado da API:', bundle);
              
              // Usar dados do bundle para criar o pacote com rank correto
              this.setSelectedPackageData({});
              
              // Inicializa dependências após os dados estarem carregados
              this.initializeTravelersForCurrentPackage();
              this.calculateTotalPrice();
              this.loadBookingData();
            },
            error: (error) => {
              console.error('❌ Erro ao carregar bundle:', error);
              this.initializeTravelersForCurrentPackage();
              this.calculateTotalPrice();
              this.loadBookingData();
            }
          });
        } else {
          console.log('⚠️ Usuário sem bundleId');
          this.initializeTravelersForCurrentPackage();
          this.calculateTotalPrice();
          this.loadBookingData();
        }
      },
      error: (error) => {
        console.error('❌ Erro ao carregar usuário:', error);
        this.initializeTravelersForCurrentPackage();
        this.calculateTotalPrice();
        this.loadBookingData();
      }
    });
  }

  // Método para preencher os dados do pacote com base na reserva
  populatePackageFromReservation(): void {
    if (!this.reservationData) return;

    console.log('🔄 Preenchendo dados do pacote com informações da reserva da API...');
    console.log('📋 Dados recebidos da API:', this.reservationData);
    
    // Formatear datas para o formato esperado (DD/MM/YYYY)
    const formatDate = (dateString: string): string => {
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      } catch (error) {
        console.warn('Erro ao formatar data:', dateString);
        return dateString;
      }
    };

    // Usar dados reais da API ao invés de valores fixos
    const apiData = this.reservationData as any;
    
    // Atualizar o packageList com os dados REAIS da reserva
    this.packageList = [{
      id: apiData.id || this.reservationData.id,
      title: apiData.title || this.reservationData.title,
      category: apiData.category || 'GOLD', // Será recalculado baseado no rating
      imageUrl: apiData.imageUrl || this.reservationData.imageUrl || '/assets/imgs/fortaleza.jpg',
      rating: apiData.rating || 4.5, // ESTE É O VALOR PRINCIPAL
      startDate: apiData.startDate || formatDate(this.reservationData.startDate),
      endDate: apiData.endDate || formatDate(this.reservationData.endDate),
      travelers: apiData.travelers || this.reservationData.travelers,
      duration: apiData.duration || this.reservationData.duration,
      description: apiData.description || this.reservationData.description || 'Pacote de viagem selecionado',
      includes: apiData.includes || [
        'Hospedagem em hotel 4 estrelas',
        'Café da manhã incluído',
        'Transfer aeroporto-hotel',
        'Seguro viagem'
      ],
      basePrice: apiData.basePrice || this.formatPrice(this.reservationData.price),
      extraPrice: apiData.extraPrice || '0,00',
      discount: apiData.discount || '0,00',
      extraServices: apiData.extraServices || false,
      selected: apiData.selected !== undefined ? apiData.selected : true
    }];

    const finalRating = this.packageList[0].rating;
    const calculatedRank = this.getRankFromRating(finalRating);

    console.log('✅ Dados do pacote atualizados com informações da API:', this.packageList[0]);
    console.log('⭐ Rating da API:', finalRating);
    console.log('🏷️ Rank calculado pelo rating:', calculatedRank);
    console.log('📊 Conversão: Rating', finalRating, '→ Rank', calculatedRank);
  }

  // Método auxiliar para formatar preços
  private formatPrice(price: number): string {
    return price.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  showCurrentUser(): void {
    console.log('👤 Dados do usuário atual:', this.currentUser);
    console.log('📦 Dados do pacote atual:', this.currentPackage);
    console.log('🎯 Rank final detectado:', this.getFinalCategoryFromBundle());
    console.log('⭐ Rating final detectado:', this.getFinalRatingFromBundle());
  } 

  getLoggedUser() {
    this.service.getCurrentUser(this.currentUser.userId).subscribe(res => {
      this.currentUser = res;
     
    });
  }

  getLoggedBundle() {
    const id = this.currentUser.bundleId;
    this.bundleService.getBundleById(id)
    .subscribe(res => this.currentBundle = res)
  }

  initializeTravelersForCurrentPackage(): void {
    this.initializeTravelersForPackage(this.currentPackage.id, this.currentPackage.travelers);
  }

  initializeTravelersForAllPackages(): void {
    this.packageList.forEach(pkg => {
      this.initializeTravelersForPackage(pkg.id, pkg.travelers);
    });
  }

  initializeTravelersForPackage(packageId: string, travelerCount: number): void {
    this.travelersInfoByPackage[packageId] = [];
    
    // Se é apenas 1 viajante, usar dados do perfil do usuário
    if (travelerCount === 1) {
      return; // Não precisa inicializar viajantes extras
    }

    // A partir de 2 viajantes, criar viajantes extras (travelerCount - 1)
    for (let i = 1; i < travelerCount; i++) {
      this.travelersInfoByPackage[packageId].push({
        fullName: '',
        birthDate: '',
        cpf: '',
        rg: '',
        email: '',
        phone: '',
        editing: false
      });
    }
  }

  editTraveler(index: number): void {
    this.travelersInfoByPackage[this.currentPackage.id][index].editing = true;
  }

  saveTraveler(index: number): void {
    this.travelersInfoByPackage[this.currentPackage.id][index].editing = false;
    console.log('Traveler saved:', this.travelersInfoByPackage[this.currentPackage.id][index]);
  }

  cancelEdit(index: number): void {
    this.travelersInfoByPackage[this.currentPackage.id][index].editing = false;
    // Restaurar dados originais se necessário
  }

  allTravelersCompleted(): boolean {
    // Se é 1 viajante, sempre está completo (usa perfil do usuário)
    if (this.currentPackage.travelers === 1) {
      return true;
    }

    // Para múltiplos viajantes, verificar se todos os extras estão preenchidos
    const travelers = this.travelersInfoByPackage[this.currentPackage.id] || [];
    return travelers.every(traveler => {
      return traveler.fullName &&
             traveler.birthDate &&
             traveler.cpf &&
             traveler.rg &&
             traveler.email &&
             traveler.phone;
    });
  }

  updateTravelerCount(newCount: number): void {
    if (newCount < 1) newCount = 1;
    if (newCount > 10) newCount = 10; // Limite máximo

    this.currentPackage.travelers = newCount;
    this.initializeTravelersForCurrentPackage();
    this.calculateTotalPrice();
  }

  // Função removida já que não trabalhamos mais com seleção múltipla
  // togglePackageSelection(packageId: string): void {
  //   const pkg = this.packageList.find(p => p.id === packageId);
  //   if (pkg) {
  //     pkg.selected = !pkg.selected;
  //     this.calculateTotalPrice();
  //   }
  // }

  getSelectedPackages(): SelectedPackage[] {
    return [this.currentPackage]; // Sempre retorna apenas o pacote atual
  }

  getFormattedBasePrice(pkg: SelectedPackage): string {
    const basePricePerPerson = parseFloat(pkg.basePrice.replace(/[.,]/g, '')) / 100;
    const totalBasePrice = basePricePerPerson * pkg.travelers;
    return totalBasePrice.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  getFormattedBundlePrice(): string {
    if (!this.currentBundle || !this.currentBundle.initialPrice) {
      return '0,00';
    }
    
    const totalPrice = this.currentBundle.initialPrice * this.currentBundle.travelersNumber;
    return totalPrice.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  // Método para traduzir rank para português
  getRankInPortuguese(category: string): string {
    const rankTranslations: { [key: string]: string } = {
      'GOLD': 'Ouro',
      'SILVER': 'Prata', 
      'BRONZE': 'Bronze',
      'PLATINUM': 'Platina',
      'OURO': 'Ouro',
      'PRATA': 'Prata',
      'PLATINA': 'Platina'
    };
    
    return rankTranslations[category?.toUpperCase()] || category || 'Básico';
  }

  // Método para obter classe CSS do rank
  getRankClass(category: string): string {
    const rankClasses: { [key: string]: string } = {
      'GOLD': 'rank-gold',
      'SILVER': 'rank-silver',
      'BRONZE': 'rank-bronze', 
      'PLATINUM': 'rank-platinum',
      'OURO': 'rank-gold',
      'PRATA': 'rank-silver',
      'PLATINA': 'rank-platinum'
    };
    
    return rankClasses[category?.toUpperCase()] || '';
  }

  // Método para formatar rating como número inteiro
  getIntegerRating(rating: number): number {
    return Math.round(rating || 4);
  }

  // Método para obter avaliação baseada no rank (mesma lógica das outras páginas)
  private getEvaluationByRank(rank: string): number {
    const rankEvaluations: { [key: string]: number } = {
      'BRONZE': 3.2,
      'SILVER': 3.8,
      'GOLD': 4.3,
      'PLATINUM': 4.9,
      // Manter as versões em português para compatibilidade
      'Bronze': 3.2,
      'Prata': 3.8,
      'Ouro': 4.3,
      'Platina': 4.9
    };
    return rankEvaluations[rank] || 3.0;
  }

  // Método de avaliação consistente (mesmo usado nas outras páginas)
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

  // Método INVERSO: rating → rank (mesmo padrão das outras páginas)
  private getRankFromRating(rating: number): string {
    const roundedRating = Math.round(rating);
    switch (roundedRating) {
      case 1: return 'BRONZE';
      case 2: return 'SILVER';
      case 3: return 'GOLD';
      case 4:
      case 5: return 'PLATINUM';
      default: return 'GOLD'; // Padrão
    }
  }

  // Método para obter rating final baseado nos dados da API
  getFinalRatingFromBundle(): number {
    // 1. Prioridade: Se temos dados do currentPackage (vindos da API via navegação)
    if (this.selectedPackageData && this.selectedPackageData.rating) {
      return Math.round(this.selectedPackageData.rating);
    }
    
    // 2. Se temos dados do packageList (vindos da reserva)
    if (this.packageList && this.packageList[0] && this.packageList[0].rating) {
      return Math.round(this.packageList[0].rating);
    }
    
    // 3. Se temos dados do bundle carregado, calcular rating pelo rank
    if (this.currentBundle && this.currentBundle.bundleRank && this.currentBundle.id) {
      return this.getRatingFromRankConsistent(this.currentBundle.bundleRank, this.currentBundle.id);
    }
    
    return 4; // Valor padrão
  }

  // Método para obter category final baseado no RATING (padrão das outras páginas)
  getFinalCategoryFromBundle(): string {
    // 1. Prioridade: Se temos rating, calcular rank baseado no rating
    let finalRating = 0;
    
    // Obter rating de qualquer fonte disponível
    if (this.selectedPackageData && this.selectedPackageData.rating) {
      finalRating = this.selectedPackageData.rating;
    } else if (this.packageList && this.packageList[0] && this.packageList[0].rating) {
      finalRating = this.packageList[0].rating;
    } else if (this.currentBundle && this.currentBundle.bundleRank && this.currentBundle.id) {
      finalRating = this.getRatingFromRankConsistent(this.currentBundle.bundleRank, this.currentBundle.id);
    }
    
    // Se temos rating, calcular rank baseado nele (PADRÃO DAS OUTRAS PÁGINAS)
    if (finalRating > 0) {
      const calculatedRank = this.getRankFromRating(finalRating);
      console.log(`📊 Rating: ${finalRating} → Rank calculado: ${calculatedRank}`);
      return calculatedRank;
    }
    
    // 2. Fallback: Usar category/rank direto se disponível
    if (this.selectedPackageData && this.selectedPackageData.category) {
      return this.selectedPackageData.category;
    }
    
    if (this.packageList && this.packageList[0] && this.packageList[0].category) {
      return this.packageList[0].category;
    }
    
    if (this.currentBundle && this.currentBundle.bundleRank) {
      return this.currentBundle.bundleRank;
    }
    
    return 'GOLD'; // Valor padrão
  }

  calculateTotalPrice(): void {
    const pkg = this.currentPackage;
    const basePricePerPerson = parseFloat(pkg.basePrice.replace(/[.,]/g, '')) / 100;
    let total = basePricePerPerson * pkg.travelers;
    
    let extraPrice = pkg.extraServices ?
      parseFloat(pkg.extraPrice?.replace(/[.,]/g, '') || '0') / 100 : 0;
    let discount = parseFloat(pkg.discount?.replace(/[.,]/g, '') || '0') / 100;

    total += extraPrice - discount;

    this.totalPrice = total.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }  

  loadBookingData(): void {
    // Simular carregamento de dados do backend
    console.log('Loading booking data from backend...');

    // Aqui você pode fazer uma chamada para o service
    // this.bookingService.getSelectedPackage().subscribe(data => {
    //   this.selectedPackage = data;
    //   this.initializeTravelers();
    // });
  }

  goToPayment(): void {
    if (!this.allTravelersCompleted()) {
      alert('Por favor, preencha todos os dados dos viajantes antes de continuar.');
      return;
    }

    const bookingData = {
      package: this.currentPackage,
      userProfile: this.userProfile,
      travelersInfo: this.travelersInfoByPackage[this.currentPackage.id] || [],
      totalPrice: this.totalPrice,
      bookingDate: new Date().toISOString()
    };

    console.log('Going to payment with:', bookingData);

    // Navegar para a página de pagamento
    this.router.navigate(['/payment'], {
      state: { bookingData: bookingData }
    });
  }
}