import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Sidebar } from '../../components/sidebar/sidebar';

interface TravelPackage {
  id: number;
  name: string;
  destination: string;
  price: number;
  duration: number;
  description: string;
  imageUrl: string;
  available: boolean;
  createdAt: Date;
}

@Component({
  selector: 'app-package-management',
  standalone: true,
imports: [CommonModule, FormsModule, Sidebar],
  templateUrl: './package-management.html',
  styleUrl: './package-management.css'
})
export class PackageManagementComponent implements OnInit {
  packages: TravelPackage[] = [];
  selectedPackage: TravelPackage | null = null;
  isEditMode = false;
  isModalOpen = false;

  newPackage: Partial<TravelPackage> = {
    name: '',
    destination: '',
    price: 0,
    duration: 0,
    description: '',
    imageUrl: '',
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
        name: 'Pacote Nordeste',
        destination: 'Fortaleza',
        price: 1200,
        duration: 5,
        description: 'Pacote completo para o Nordeste brasileiro',
        imageUrl: '/assets/imgs/fortaleza.jpg',
        available: true,
        createdAt: new Date('2024-01-15')
      },
      {
        id: 2,
        name: 'Pacote Sul',
        destination: 'Gramado',
        price: 980,
        duration: 3,
        description: 'Experiência única na Serra Gaúcha',
        imageUrl: '/assets/imgs/gramado.jpg',
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
      name: '',
      destination: '',
      price: 0,
      duration: 0,
      description: '',
      imageUrl: '',
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
      this.newPackage.name &&
      this.newPackage.destination &&
      this.newPackage.price &&
      this.newPackage.price > 0 &&
      this.newPackage.duration &&
      this.newPackage.duration > 0 &&
      this.newPackage.description
    );
  }
}
