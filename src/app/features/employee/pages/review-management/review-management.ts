import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilterSearchReview } from "../../components/filter-search/filter-search-review";

interface ReviewComment {
  pacote: string;
  data: string;
  texto: string;
}

@Component({
  selector: 'app-review-management',
  imports: [CommonModule, FilterSearchReview],
  templateUrl: './review-management.html',
  styleUrl: './review-management.css'
})
export class ReviewManagement {
  comentariosAbertos = false;
  comentariosUsuarioAbertos = false;
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
    if (this.usuarioSelecionado && confirm('Tem certeza que deseja apagar este comentário?')) {
      this.usuarioSelecionado.comentarios.splice(index, 1);
    }
  }
}
