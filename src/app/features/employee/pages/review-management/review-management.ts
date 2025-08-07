import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfirmationModalComponent } from '../../../../shared/components/confirmation-modal/confirmation-modal';

interface ReviewComment {
  pacote: string;
  data: string;
  texto: string;
}

@Component({
  selector: 'app-review-management',
  imports: [CommonModule, FormsModule, ConfirmationModalComponent],
  templateUrl: './review-management.html',
  styleUrl: './review-management.css'
})
export class ReviewManagement {
  comentariosAbertos = false;
  comentariosUsuarioAbertos = false;

  // Modal de confirmação
  confirmationModalOpen = false;
  commentToDeleteIndex: number | null = null;

  // Paginação
  currentPage = 1;
  itemsPerPage = 6;

  comentarios: ReviewComment[] = [
    { pacote: 'Férias Nordeste', data: '29/07/2025', texto: 'Ótima experiência, recomendo!' },
    { pacote: 'Sul Maravilha', data: '15/06/2025', texto: 'Gostei muito do atendimento!' }
  ];

  usuarios = [
    {
      nome: 'João Silva',
      id: '001',
      foto: '/assets/imgs/joao.jpg',
      comentarios: [
        { pacote: 'Férias Nordeste', data: '29/07/2025', texto: 'Ótima experiência, recomendo!' },
        { pacote: 'Sul Maravilha', data: '15/06/2025', texto: 'Gostei muito do atendimento!' }
      ]
    },
    {
      nome: 'Maria Oliveira',
      id: '002',
      foto: '/assets/imgs/maria.jpg',
      comentarios: [
        { pacote: 'Pacote Amazônia', data: '10/05/2025', texto: 'Natureza incrível, voltarei!' }
      ]
    },
    {
      nome: 'Carlos Souza',
      id: '003',
      foto: '/assets/imgs/carlos.jpg',
      comentarios: [
        { pacote: 'Pacote Pantanal', data: '20/04/2025', texto: 'Passeio excelente, recomendo.' }
      ]
    },
    {
      nome: 'Ana Paula',
      id: '004',
      foto: '/assets/imgs/ana.jpg',
      comentarios: [
        { pacote: 'Pacote Litoral', data: '05/03/2025', texto: 'Praias lindas, atendimento ótimo.' }
      ]
    },
    // Adicionando mais usuários para demonstrar a paginação
    {
      nome: 'Pedro Santos',
      id: '005',
      foto: '/assets/imgs/pedro.jpg',
      comentarios: [
        { pacote: 'Pacote Montanhas', data: '12/02/2025', texto: 'Vista incrível, vale muito a pena!' }
      ]
    },
    {
      nome: 'Lucia Fernandes',
      id: '006',
      foto: '/assets/imgs/lucia.jpg',
      comentarios: [
        { pacote: 'Pacote Histórico', data: '22/01/2025', texto: 'Muito educativo e interessante.' }
      ]
    },
    {
      nome: 'Roberto Lima',
      id: '007',
      foto: '/assets/imgs/roberto.jpg',
      comentarios: [
        { pacote: 'Pacote Aventura', data: '18/12/2024', texto: 'Adrenalina pura! Experiência única!' }
      ]
    },
    {
      nome: 'Fernanda Costa',
      id: '008',
      foto: '/assets/imgs/fernanda.jpg',
      comentarios: [
        { pacote: 'Pacote Relaxante', data: '08/11/2024', texto: 'Perfeito para descansar e renovar as energias.' }
      ]
    }
  ];
  usuarioSelecionado: any = null;

  abrirComentarios() {
    this.comentariosAbertos = !this.comentariosAbertos;
  }

  abrirComentariosUsuario(usuario: any) {
    this.usuarioSelecionado = usuario;
    this.comentariosUsuarioAbertos = true;
  }

  fecharComentariosUsuario() {
    this.comentariosUsuarioAbertos = false;
    this.usuarioSelecionado = null;
  }

  apagarComentario(index: number) {
    this.commentToDeleteIndex = index;
    this.confirmationModalOpen = true;
  }

  confirmarExclusaoComentario() {
    if (this.usuarioSelecionado && this.commentToDeleteIndex !== null) {
      this.usuarioSelecionado.comentarios.splice(this.commentToDeleteIndex, 1);
      this.commentToDeleteIndex = null;
    }
  }

  cancelarExclusaoComentario() {
    this.commentToDeleteIndex = null;
  }

  fecharModalConfirmacao() {
    this.confirmationModalOpen = false;
    this.commentToDeleteIndex = null;
  }

  getTotalComments(): number {
    return this.usuarios.reduce((total, usuario) => total + usuario.comentarios.length, 0);
  }

  getAverageRating(): string {
    // Simulando uma média de avaliação (pode ser implementada com dados reais)
    return "4.5";
  }

  // Métodos de paginação
  get paginatedUsers() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.usuarios.slice(startIndex, endIndex);
  }

  get totalPages(): number {
    return Math.ceil(this.usuarios.length / this.itemsPerPage);
  }

  get pageNumbers(): number[] {
    const pages = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  getStartItem(): number {
    return (this.currentPage - 1) * this.itemsPerPage + 1;
  }

  getEndItem(): number {
    const end = this.currentPage * this.itemsPerPage;
    return end > this.usuarios.length ? this.usuarios.length : end;
  }

  // Métodos para placeholder de imagens
  getPlaceholderImage(userName: string): string {
    // Gera uma cor baseada no nome do usuário
    const colors = [
      '#FF6B35', '#F7931E', '#28A745', '#007BFF', '#6F42C1',
      '#E83E8C', '#FD7E14', '#20C997', '#6C757D', '#DC3545'
    ];
    const colorIndex = userName.length % colors.length;
    const initials = this.getUserInitials(userName);

    // Retorna uma URL de placeholder com as iniciais e cor
    return `https://ui-avatars.com/api/?name=${initials}&background=${colors[colorIndex].substring(1)}&color=fff&size=128&font-size=0.6&bold=true`;
  }

  getUserInitials(name: string): string {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  onImageError(event: any): void {
    // Fallback para um placeholder simples se o serviço ui-avatars falhar
    const target = event.target;
    const userName = target.alt.replace('Avatar de ', '');
    const initials = this.getUserInitials(userName);

    // Cria um canvas com as iniciais como fallback
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 128;
    canvas.height = 128;

    if (ctx) {
      // Fundo colorido
      ctx.fillStyle = '#FF6B35';
      ctx.fillRect(0, 0, 128, 128);

      // Texto com as iniciais
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(initials, 64, 64);

      target.src = canvas.toDataURL();
    }
  }

}
