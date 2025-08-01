import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface TravelPackage {
  id: number;
  bundleTitle: string;
  bundleDescription: string;
  initialPrice: number;
  bundleRank: 'BRONZE' | 'PRATA' | 'OURO' | 'PLATINA';
  initialDate: string;
  finalDate: string;
  quantity: number;
  imageUrl: string;
  videoUrl?: string;
  available: boolean;
  createdAt: Date;
  additionalInfo?: string;
  destination?: string;
  origin?: string;
}

@Component({
  selector: 'app-package-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './package-management.html',
  styleUrl: './package-management.css'
})
export class PackageManagementComponent implements OnInit {
  packages: TravelPackage[] = [];
  selectedPackage: TravelPackage | null = null;
  isEditMode = false;
  isModalOpen = false;

  // Paginação
  currentPage = 1;
  pageSize = 6;

  newPackage: Partial<TravelPackage> = {
    bundleTitle: '',
    bundleDescription: '',
    initialPrice: 0,
    bundleRank: undefined,
    initialDate: '',
    finalDate: '',
    quantity: 0,
    imageUrl: '',
    videoUrl: '',
    available: true,
    additionalInfo: '',
    destination: '',
    origin: ''
  };

  // Propriedades para upload de imagem
  selectedImageFile: File | null = null;
  selectedImagePreview: string | null = null;
  isDragOver = false;

  // Propriedades para o modal de visualização
  isViewModalOpen = false;
  viewPackage: TravelPackage | null = null;

  // Propriedades para o modal de filtro
  isFilterModalOpen = false;

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
        imageUrl: '/assets/imgs/fortaleza.jpg',
        videoUrl: '',
        available: true,
        createdAt: new Date('2024-01-15'),
        destination: 'Fortaleza, CE',
        origin: 'São Paulo, SP'
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
        imageUrl: '/assets/imgs/gramado.jpg',
        videoUrl: '',
        available: true,
        createdAt: new Date('2024-02-10'),
        destination: 'Gramado, RS',
        origin: 'Rio de Janeiro, RJ'
      }
    ];
  }

  getAvailablePackagesCount(): number {
    return this.packages.filter(p => p.available).length;
  }

  getUnavailablePackagesCount(): number {
    return this.packages.filter(p => !p.available).length;
  }

  openCreateModal(): void {
    this.selectedPackage = null;
    this.isEditMode = false;
    this.isModalOpen = true;
    this.resetForm();
    // Aguardar a renderização do modal antes de configurar o scroll
    setTimeout(() => this.setupModalScroll(), 100);
  }

  openEditModal(packageItem: TravelPackage): void {
    this.selectedPackage = packageItem;
    this.isEditMode = true;
    this.isModalOpen = true;
    this.newPackage = { ...packageItem };
    // Resetar variáveis de upload ao editar
    this.selectedImageFile = null;
    this.selectedImagePreview = null;
    // Aguardar a renderização do modal antes de configurar o scroll
    setTimeout(() => this.setupModalScroll(), 100);
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.selectedPackage = null;
    this.resetForm();
  }

  setupModalScroll(): void {
    const modalBody = document.querySelector('.modal-body-premium');
    if (modalBody) {
      modalBody.addEventListener('scroll', () => {
        if (modalBody.scrollTop > 10) {
          modalBody.classList.add('scrolled');
        } else {
          modalBody.classList.remove('scrolled');
        }
      });
    }
  }

  // ===== MÉTODOS PARA MODAL DE VISUALIZAÇÃO =====

  openViewModal(packageItem: TravelPackage): void {
    this.viewPackage = packageItem;
    this.isViewModalOpen = true;
  }

  closeViewModal(): void {
    this.isViewModalOpen = false;
    this.viewPackage = null;
  }

  editFromView(): void {
    if (this.viewPackage) {
      this.closeViewModal();
      this.openEditModal(this.viewPackage);
    }
  }

  // ===== MÉTODOS PARA MODAL DE FILTRO =====
  openFilterModal(): void {
    this.isFilterModalOpen = true;
  }

  closeFilterModal(): void {
    this.isFilterModalOpen = false;
  }

  getRankDisplay(rank?: string): string {
    const rankMap: { [key: string]: string } = {
      'BRONZE': '🥉 Bronze - Básico',
      'PRATA': '🥈 Prata - Intermediário',
      'OURO': '🥇 Ouro - Premium',
      'PLATINA': '💎 Platina - Luxo'
    };
    return rank ? rankMap[rank] || rank : '';
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
      imageUrl: '',
      videoUrl: '',
      available: true,
      additionalInfo: '',
      destination: '',
      origin: ''
    };

    // Resetar variáveis de upload
    this.selectedImageFile = null;
    this.selectedImagePreview = null;
    this.isDragOver = false;
  }

  // Métodos de paginação baseados na página Bundle
  getTotalPages(): number {
    return Math.ceil(this.packages.length / this.pageSize);
  }

  getPaginatedPackages(): TravelPackage[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.packages.slice(startIndex, endIndex);
  }

  changePage(page: number | string) {
    if (typeof page === 'number' && page >= 1 && page <= this.getTotalPages()) {
      this.currentPage = page;
    }
  }

  getVisiblePages(): (number | string)[] {
    const totalPages = this.getTotalPages();
    const current = this.currentPage;
    const visible: (number | string)[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        visible.push(i);
      }
    } else {
      visible.push(1);

      if (current > 4) {
        visible.push('...');
      }

      const start = Math.max(2, current - 1);
      const end = Math.min(totalPages - 1, current + 1);

      for (let i = start; i <= end; i++) {
        visible.push(i);
      }

      if (current < totalPages - 3) {
        visible.push('...');
      }

      if (totalPages > 1) {
        visible.push(totalPages);
      }
    }

    return visible;
  }

  getDisplayStart(): number {
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  getDisplayEnd(): number {
    return Math.min(this.currentPage * this.pageSize, this.packages.length);
  }

  onPageSizeChange() {
    const previousPageSize = this.pageSize;
    this.pageSize = Number(this.pageSize);

    if (this.pageSize > 24) {
      this.pageSize = 24;
    }

    const currentFirstItem = (this.currentPage - 1) * previousPageSize;
    this.currentPage = Math.floor(currentFirstItem / this.pageSize) + 1;

    const totalPages = this.getTotalPages();
    this.currentPage = Math.max(1, Math.min(this.currentPage, totalPages));
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

    // Resetar para primeira página se necessário
    const totalPages = this.getTotalPages();
    if (this.currentPage > totalPages) {
      this.currentPage = Math.max(1, totalPages);
    }

    this.closeModal();
  }

  deletePackage(id: number): void {
    if (confirm('Tem certeza que deseja excluir este pacote?')) {
      this.packages = this.packages.filter(p => p.id !== id);

      // Ajustar página se necessário
      const totalPages = this.getTotalPages();
      if (this.currentPage > totalPages && totalPages > 0) {
        this.currentPage = totalPages;
      }
    }
  }

  toggleAvailability(packageItem: TravelPackage): void {
    packageItem.available = !packageItem.available;
  }

  // ===== MÉTODOS PARA UPLOAD DE IMAGEM =====

  onImageSelected(event: any): void {
    const file = event.target.files[0];
    if (file && this.isValidImageFile(file)) {
      this.selectedImageFile = file;
      this.createImagePreview(file);
      // Limpa a URL se uma imagem foi selecionada
      this.newPackage.imageUrl = '';
    }
  }

  onImageUrlChange(url: string): void {
    if (url) {
      // Se uma URL foi inserida, limpa a imagem selecionada
      this.selectedImageFile = null;
      this.selectedImagePreview = null;
    }
  }

  removeImage(): void {
    this.selectedImageFile = null;
    this.selectedImagePreview = null;
    this.newPackage.imageUrl = '';
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (this.isValidImageFile(file)) {
        this.selectedImageFile = file;
        this.createImagePreview(file);
        this.newPackage.imageUrl = '';
      } else {
        alert('Arquivo inválido! Por favor, selecione uma imagem (JPG, PNG, WebP) com até 5MB.');
      }
    }
  }

  private isValidImageFile(file: File): boolean {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      alert('Tipo de arquivo não suportado! Use JPG, PNG ou WebP.');
      return false;
    }

    if (file.size > maxSize) {
      alert('Arquivo muito grande! O tamanho máximo é 5MB.');
      return false;
    }

    return true;
  }

  private createImagePreview(file: File): void {
    const reader = new FileReader();
    reader.onload = (e) => {
      this.selectedImagePreview = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  // ===== FIM DOS MÉTODOS DE UPLOAD =====

  isFormValid(): boolean {
    const hasImage = !!(this.newPackage.imageUrl || this.selectedImageFile);

    return !!(
      this.newPackage.bundleTitle &&
      this.newPackage.bundleDescription &&
      this.newPackage.initialPrice &&
      this.newPackage.initialPrice > 0 &&
      this.newPackage.bundleRank &&
      this.newPackage.initialDate &&
      this.newPackage.finalDate &&
      this.newPackage.quantity !== undefined && this.newPackage.quantity >= 0 &&
      this.newPackage.destination &&
      this.newPackage.origin &&
      hasImage
    );
  }
}
