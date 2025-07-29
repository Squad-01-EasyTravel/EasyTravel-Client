import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Card } from './card/card';
import { Filter } from './filter/filter';
import { Navbar } from '../../../../shared/navbar/navbar';
import { Footer } from '../../../../shared/footer/footer';


@Component({
  selector: 'app-bundle',
  imports: [CommonModule, Card, Filter, Navbar, Footer],
  templateUrl: './bundle.html',
  styleUrl: './bundle.css'
})
export class Bundle {
  // Dados de exemplo para os pacotes,
  pacotes = [
    {
      imagem: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400&h=250&fit=crop',
      preco: 2400,
      dataInicio: '12-01',
      dataFim: '12-01',
      destino: 'Recife, São Paulo',
      avaliacao: 4.9
    },
    {
      imagem: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=400&h=250&fit=crop',
      preco: 3200,
      dataInicio: '15-02',
      dataFim: '22-02',
      destino: 'Rio de Janeiro, Salvador',
      avaliacao: 4.7
    },
    {
      imagem: 'https://images.unsplash.com/photo-1516306580123-e6e52b1b7b5f?w=400&h=250&fit=crop',
      preco: 2800,
      dataInicio: '20-03',
      dataFim: '27-03',
      destino: 'São Paulo, Fortaleza',
      avaliacao: 4.8
    },
    {
      imagem: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400&h=250&fit=crop',
      preco: 2400,
      dataInicio: '12-01',
      dataFim: '12-01',
      destino: 'Recife, São Paulo',
      avaliacao: 4.9
    },
    {
      imagem: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=400&h=250&fit=crop',
      preco: 3200,
      dataInicio: '15-02',
      dataFim: '22-02',
      destino: 'Rio de Janeiro, Salvador',
      avaliacao: 4.7
    },
    {
      imagem: 'https://images.unsplash.com/photo-1516306580123-e6e52b1b7b5f?w=400&h=250&fit=crop',
      preco: 2800,
      dataInicio: '20-03',
      dataFim: '27-03',
      destino: 'São Paulo, Fortaleza',
      avaliacao: 4.8
    },
    {
      imagem: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400&h=250&fit=crop',
      preco: 2400,
      dataInicio: '12-01',
      dataFim: '12-01',
      destino: 'Recife, São Paulo',
      avaliacao: 4.9
    },
    {
      imagem: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=400&h=250&fit=crop',
      preco: 3200,
      dataInicio: '15-02',
      dataFim: '22-02',
      destino: 'Rio de Janeiro, Salvador',
      avaliacao: 4.7
    },
    {
      imagem: 'https://images.unsplash.com/photo-1516306580123-e6e52b1b7b5f?w=400&h=250&fit=crop',
      preco: 2800,
      dataInicio: '20-03',
      dataFim: '27-03',
      destino: 'São Paulo, Fortaleza',
      avaliacao: 4.8
    }
  ];
}
