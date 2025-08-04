import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BundleService } from '@/app/shared/services/bundle-service';
import { BundleClass } from '@/app/features/client/pages/bundle/class/bundle-class';

interface TravelPackage {
  id: number;
  bundleTitle: string;
  bundleDescription: string;
  initialPrice: number;
  bundleRank: 'BRONZE' | 'PRATA' | 'OURO' | 'PLATINA' | 'GOLD' | 'SILVER';
  initialDate: string;
  finalDate: string;
  quantity: number;
  travelersNumber: number;
  bundleStatus: string;
  imageUrl?: string;
  available?: boolean;
  createdAt?: Date;
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
    travelersNumber: 1,
    imageUrl: '',
    available: true
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

  constructor(private service: BundleService) {}

  ngOnInit(): void {
    this.loadPackages();
  }

  loadPackages(): void {
    console.log('🔄 Carregando pacotes da API...');
    
    this.service.getAllBundles().subscribe({
      next: (bundles: BundleClass[]) => {
        console.log('📦 Pacotes recebidos da API:', bundles.length, bundles);
        
        if (!bundles || !Array.isArray(bundles)) {
          console.warn('⚠️ Nenhum pacote encontrado ou resposta inválida');
          this.packages = [];
          return;
        }
        
        // Converter BundleClass para TravelPackage
        this.packages = bundles.map(bundle => this.convertBundleToTravelPackage(bundle));
        
        console.log('✅ Pacotes convertidos para TravelPackage:', this.packages.length, this.packages);
        
        // Resetar para primeira página
        this.currentPage = 1;
      },
      error: (error) => {
        console.error('❌ Erro ao carregar pacotes:', error);
        console.log('Status do erro:', error.status);
        console.log('Mensagem do erro:', error.message);
        
        // Em caso de erro, manter array vazio
        this.packages = [];
      }
    });
  }

  private convertBundleToTravelPackage(bundle: BundleClass): TravelPackage {
    return {
      id: bundle.id,
      bundleTitle: bundle.bundleTitle,
      bundleDescription: bundle.bundleDescription,
      initialPrice: bundle.initialPrice,
      bundleRank: this.mapBundleRank(bundle.bundleRank),
      initialDate: bundle.initialDate,
      finalDate: bundle.finalDate,
      quantity: bundle.quantity,
      travelersNumber: bundle.travelersNumber,
      bundleStatus: bundle.bundleStatus,
      imageUrl: bundle.imageUrl || '/assets/imgs/fortaleza.jpg', // Imagem padrão se não tiver
      available: bundle.bundleStatus === 'AVAILABLE',
      createdAt: new Date(),
      destination: bundle.destinationCity && bundle.destinationState 
        ? `${bundle.destinationCity}, ${bundle.destinationState}` 
        : 'Destino não informado',
      origin: bundle.departureCity && bundle.departureState 
        ? `${bundle.departureCity}, ${bundle.departureState}` 
        : 'Origem não informada'
    };
  }

  private mapBundleRank(rank: string): 'BRONZE' | 'PRATA' | 'OURO' | 'PLATINA' | 'GOLD' | 'SILVER' {
    // Mapear diferentes formatos de rank para nosso enum
    const normalizedRank = rank.toUpperCase();
    
    switch (normalizedRank) {
      case 'GOLD':
        return 'OURO';
      case 'SILVER':
        return 'PRATA';
      case 'BRONZE':
        return 'BRONZE';
      case 'PLATINUM':
      case 'PLATINA':
        return 'PLATINA';
      default:
        return 'BRONZE';
    }
  }

  private convertRankToBackend(rank: string): string {
    // Converter rank do frontend de volta para formato do backend
    const normalizedRank = rank.toUpperCase();
    
    switch (normalizedRank) {
      case 'OURO':
        return 'GOLD';
      case 'PRATA':
        return 'SILVER';
      case 'BRONZE':
        return 'BRONZE';
      case 'PLATINA':
        return 'PLATINUM';
      case 'GOLD':
        return 'GOLD';
      case 'SILVER':
        return 'SILVER';
      default:
        return 'BRONZE';
    }
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
      'SILVER': '🥈 Prata - Intermediário',
      'OURO': '🥇 Ouro - Premium',
      'GOLD': '🥇 Ouro - Premium',
      'PLATINA': '💎 Platina - Luxo',
      'PLATINUM': '💎 Platina - Luxo'
    };
    return rank ? rankMap[rank.toUpperCase()] || rank : 'Não definido';
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
      travelersNumber: 1,
      imageUrl: '',
      available: true
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
      console.log('✏️ Atualizando pacote existente:', this.selectedPackage.id);
      
      // Aqui você implementaria a chamada para API de update
      // this.service.updateBundle(this.selectedPackage.id, this.newPackage).subscribe({...})
      
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
      console.log('➕ Criando novo pacote');
      
      // Aqui você implementaria a chamada para API de create
      // this.service.createBundle(this.newPackage).subscribe({...})
      
      const newId = Math.max(...this.packages.map(p => p.id), 0) + 1;
      const packageToAdd: TravelPackage = {
        ...this.newPackage,
        id: newId,
        createdAt: new Date(),
        available: true,
        bundleStatus: 'AVAILABLE',
        travelersNumber: 1
      } as TravelPackage;

      this.packages.push(packageToAdd);
    }

    // Resetar para primeira página se necessário
    const totalPages = this.getTotalPages();
    if (this.currentPage > totalPages) {
      this.currentPage = Math.max(1, totalPages);
    }

    this.closeModal();
    
    // Recarregar dados da API após salvar
    console.log('🔄 Recarregando dados da API após operação...');
    this.loadPackages();
  }

  deletePackage(id: number): void {
    if (confirm('Tem certeza que deseja excluir este pacote? Esta ação não pode ser desfeita.')) {
      console.log('🗑️ Excluindo pacote ID:', id);
      
      // Fazer chamada para API de delete
      this.service.deleteBundle(id).subscribe({
        next: () => {
          console.log('✅ Pacote excluído com sucesso da API');
          
          // Remover da lista local
          this.packages = this.packages.filter(p => p.id !== id);

          // Ajustar página se necessário
          const totalPages = this.getTotalPages();
          if (this.currentPage > totalPages && totalPages > 0) {
            this.currentPage = totalPages;
          }
          
          // Recarregar dados da API para garantir sincronização
          console.log('🔄 Recarregando dados da API após exclusão...');
          this.loadPackages();
          
          // Mostrar mensagem de sucesso
          alert('Pacote excluído com sucesso!');
        },
        error: (error) => {
          console.error('❌ Erro ao excluir pacote:', error);
          console.log('Status do erro:', error.status);
          console.log('Mensagem do erro:', error.message);
          
          // Mostrar mensagem de erro
          if (error.status === 404) {
            alert('Pacote não encontrado. Pode já ter sido excluído.');
            // Recarregar dados para sincronizar
            this.loadPackages();
          } else if (error.status === 403) {
            alert('Você não tem permissão para excluir este pacote.');
          } else {
            alert('Erro ao excluir pacote. Tente novamente.');
          }
        }
      });
    }
  }

  toggleAvailability(packageItem: TravelPackage): void {
    console.log('🔄 Alterando disponibilidade do pacote ID:', packageItem.id);
    
    // Determinar o novo status
    const newStatus = packageItem.available ? 'UNAVAILABLE' : 'AVAILABLE';
    console.log(`📋 Alterando status de ${packageItem.bundleStatus} para ${newStatus}`);
    
    // Converter rank de volta para formato do backend
    const backendRank = this.convertRankToBackend(packageItem.bundleRank);
    
    // Preparar dados para update (todos os campos obrigatórios)
    const updateData = {
      bundleTitle: packageItem.bundleTitle,
      bundleDescription: packageItem.bundleDescription,
      initialPrice: packageItem.initialPrice,
      bundleRank: backendRank, // Usar o rank convertido para o backend
      initialDate: packageItem.initialDate,
      finalDate: packageItem.finalDate,
      quantity: packageItem.quantity,
      travelersNumber: packageItem.travelersNumber,
      bundleStatus: newStatus
    };
    
    console.log('📤 Enviando dados para API:', updateData);
    
    // Fazer chamada para API
    this.service.updateBundle(packageItem.id, updateData).subscribe({
      next: (updatedBundle) => {
        console.log('✅ Bundle atualizado com sucesso:', updatedBundle);
        
        // Atualizar localmente
        packageItem.available = newStatus === 'AVAILABLE';
        packageItem.bundleStatus = newStatus;
        
        // Recarregar dados da API para garantir sincronização
        console.log('🔄 Recarregando dados da API após alterar status...');
        this.loadPackages();
      },
      error: (error) => {
        console.error('❌ Erro ao alterar status do bundle:', error);
        console.log('Status do erro:', error.status);
        console.log('Mensagem do erro:', error.message);
        
        // Em caso de erro, reverter as alterações locais
        alert('Erro ao alterar disponibilidade do pacote. Tente novamente.');
      }
    });
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
      this.newPackage.quantity !== undefined && 
      this.newPackage.quantity >= 0 &&
      hasImage
    );
  }
}
