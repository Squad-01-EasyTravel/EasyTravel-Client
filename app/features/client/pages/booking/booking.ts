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

  // Dados mock do usuário
  userProfile: UserProfile = {
    fullName: 'João da Silva',
    birthDate: '1985-03-15',
    cpf: '123.456.789-00',
    rg: '12.345.678-9',
    email: 'joao@email.com',
    phone: '(11) 99999-9999'
  };

  // Pacote único selecionado
  selectedPackage: SelectedPackage = {
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
    basePrice: '2.400,00',
    extraPrice: '200,00',
    discount: '300,00',
    extraServices: true
  };

  // Informações dos viajantes extras
  travelersInfo: TravelerInfo[] = [];
  totalPrice: string = '0,00';

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.initializeTravelers();
    this.calculateTotalPrice();
  }

  initializeTravelers(): void {
    this.travelersInfo = [];

    // Se é apenas 1 viajante, usar dados do perfil do usuário
    if (this.selectedPackage.travelers === 1) {
      return; // Não precisa inicializar viajantes extras
    }

    // A partir de 2 viajantes, criar viajantes extras (travelers - 1)
    for (let i = 1; i < this.selectedPackage.travelers; i++) {
      this.travelersInfo.push({
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
    this.travelersInfo[index].editing = true;
  }

  saveTraveler(index: number): void {
    this.travelersInfo[index].editing = false;
    console.log('Traveler saved:', this.travelersInfo[index]);
  }

  cancelEdit(index: number): void {
    this.travelersInfo[index].editing = false;
    // Restaurar dados originais se necessário
  }

  allTravelersCompleted(): boolean {
    // Se é 1 viajante, sempre está completo (usa perfil do usuário)
    if (this.selectedPackage.travelers === 1) {
      return true;
    }

    // Para múltiplos viajantes, verificar se todos os extras estão preenchidos
    return this.travelersInfo.every(traveler => {
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

    this.selectedPackage.travelers = newCount;
    this.initializeTravelers();
    this.calculateTotalPrice();
  }

  getFormattedBasePrice(): string {
    const basePricePerPerson = parseFloat(this.selectedPackage.basePrice.replace(/[.,]/g, '')) / 100;
    const totalBasePrice = basePricePerPerson * this.selectedPackage.travelers;
    return totalBasePrice.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  calculateTotalPrice(): void {
    const basePricePerPerson = parseFloat(this.selectedPackage.basePrice.replace(/[.,]/g, '')) / 100;
    let packageTotal = basePricePerPerson * this.selectedPackage.travelers;

    let extraPrice = this.selectedPackage.extraServices ?
      parseFloat(this.selectedPackage.extraPrice?.replace(/[.,]/g, '') || '0') / 100 : 0;
    let discount = parseFloat(this.selectedPackage.discount?.replace(/[.,]/g, '') || '0') / 100;

    packageTotal += extraPrice - discount;

    this.totalPrice = packageTotal.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  goToPayment(): void {
    if (!this.allTravelersCompleted()) {
      alert('Por favor, preencha todos os dados dos viajantes antes de continuar.');
      return;
    }

    const bookingData = {
      package: this.selectedPackage,
      userProfile: this.userProfile,
      travelersInfo: this.travelersInfo,
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