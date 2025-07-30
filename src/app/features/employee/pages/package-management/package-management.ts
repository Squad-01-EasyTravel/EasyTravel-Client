import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Sidebar } from '../../components/sidebar/sidebar';
import { FilterSearchPackage } from '../../components/filter-search/filter-search-package';
import { TravelPackage } from '../../../../shared/models/travel-package.interface';



@Component({
  selector: 'app-package-management',
  standalone: true,
  imports: [CommonModule, FormsModule, FilterSearchPackage],
  templateUrl: './package-management.html',
  styleUrl: './package-management.css'
})
export class PackageManagementComponent implements OnInit {
  packages: TravelPackage[] = [];
  selectedPackage: TravelPackage | null = null;
  isEditMode = false;
  isModalOpen = false;

  newPackage: Partial<TravelPackage> = {
    bundleTitle: '',
    bundleDescription: '',
    initialPrice: 0,
    bundleRank: undefined,
    initialDate: '',
    finalDate: '',
    quantity: 0,
    travelersNumber: 0,
    imageUrl: '',
    videoUrl: '',
    available: true
  };

  constructor() {}

  ngOnInit(): void {
    this.loadPackages();
  }

  loadPackages(): void {
    // Simulando dados de pacotes - substitua por chamada real à API
    this.packages = [
      {
        id: 1,
        bundleTitle: 'Pacote Férias Nordeste',
        bundleDescription: 'Pacote para o nordeste com tudo incluso',
        initialPrice: 1200,
        bundleRank: 'BRONZE',
        initialDate: '2025-07-29T18:12:22.171Z',
        finalDate: '2025-07-29T18:12:22.171Z',
        quantity: 10,
        travelersNumber: 2,
        imageUrl: '/assets/imgs/fortaleza.jpg',
        videoUrl: '',
        available: true,
        createdAt: new Date('2024-01-15')
      },
      {
        id: 2,
        bundleTitle: 'Pacote Sul',
        bundleDescription: 'Experiência única na Serra Gaúcha',
        initialPrice: 980,
        bundleRank: 'OURO',
        initialDate: '2025-08-01T10:00:00.000Z',
        finalDate: '2025-08-10T10:00:00.000Z',
        quantity: 5,
        travelersNumber: 4,
        imageUrl: '/assets/imgs/gramado.jpg',
        videoUrl: '',
        available: true,
        createdAt: new Date('2024-02-10')
      }
    ];
  }

  openCreateModal(): void {
    this.selectedPackage = null;
    this.isEditMode = false;
    this.isModalOpen = true;
    this.resetForm();
  }

  openEditModal(packageItem: TravelPackage): void {
    this.selectedPackage = packageItem;
    this.isEditMode = true;
    this.isModalOpen = true;
    this.newPackage = { ...packageItem };
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.selectedPackage = null;
    this.resetForm();
  }

  resetForm(): void {
    this.newPackage = {
      bundleTitle: '',
      bundleDescription: '',
      initialPrice: 0,
      bundleRank: undefined,
      initialDate: '',
      finalDate: '',
      quantity: 0,
      travelersNumber: 0,
      imageUrl: '',
      videoUrl: '',
      available: true
    };
  }

  savePackage(): void {
    if (this.isEditMode && this.selectedPackage) {
      // Atualizar pacote existente
      const index = this.packages.findIndex(p => p.id === this.selectedPackage!.id);
      if (index !== -1) {
        this.packages[index] = { 
          ...this.selectedPackage, 
          ...this.newPackage,
          id: this.selectedPackage.id,
          createdAt: this.selectedPackage.createdAt
        } as TravelPackage;
      }
    } else {
      // Criar novo pacote
      const newId = Math.max(...this.packages.map(p => p.id), 0) + 1;
      const packageToAdd: TravelPackage = {
        ...this.newPackage,
        id: newId,
        createdAt: new Date()
      } as TravelPackage;
      
      this.packages.push(packageToAdd);
    }
    
    this.closeModal();
  }

  deletePackage(id: number): void {
    if (confirm('Tem certeza que deseja excluir este pacote?')) {
      this.packages = this.packages.filter(p => p.id !== id);
    }
  }

  toggleAvailability(packageItem: TravelPackage): void {
    packageItem.available = !packageItem.available;
  }

  isFormValid(): boolean {
    return !!(
      this.newPackage.bundleTitle &&
      this.newPackage.bundleDescription &&
      this.newPackage.initialPrice &&
      this.newPackage.initialPrice > 0 &&
      this.newPackage.bundleRank &&
      this.newPackage.initialDate &&
      this.newPackage.finalDate &&
      this.newPackage.quantity !== undefined && this.newPackage.quantity >= 0 &&
      this.newPackage.travelersNumber !== undefined && this.newPackage.travelersNumber > 0
    );
  }
}
