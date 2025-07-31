import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Navbar } from "../../../../shared/navbar/navbar";
import { Footer } from "../../../../shared/footer/footer";

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
    return this.packageList[0];
  }

  constructor(
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserProfile();
    this.initializeTravelersForCurrentPackage();
    this.calculateTotalPrice();
    this.loadBookingData();
  }

  loadUserProfile(): void {
    // Dados mockados para teste
    this.userProfile = {
      fullName: 'João Silva Santos',
      birthDate: '1990-05-15',
      cpf: '123.456.789-00',
      rg: '12.345.678-9',
      email: 'joao.silva@email.com',
      phone: '(11) 99999-9999'
    };
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
    const pkg = this.currentPackage;
    
    // Se é 1 viajante, sempre está completo (usa perfil do usuário)
    if (pkg.travelers === 1) {
      return true;
    }

    // Para múltiplos viajantes, verificar se todos os extras estão preenchidos
    const travelers = this.travelersInfoByPackage[pkg.id] || [];
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
  }  loadBookingData(): void {
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