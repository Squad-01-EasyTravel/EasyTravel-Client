# Guia de Integração com Back-end - EasyTravel

## Página de Detalhes do Pacote

### Estrutura de Dados Esperada

#### Interface Pacote
```typescript
interface Pacote {
  id: number;
  titulo: string;
  imagemPrincipal: string;
  preco: number;
  avaliacao: number;
  totalAvaliacoes: number;
  dataIda: string;
  dataVolta: string;
  duracao: string;
  tipoViagem: string;
  incluso: string;
  categoria: string;
  localizacao: string;
  descricaoCompleta: string;
  destino: string;
  avaliacoes: Avaliacao[];
}
```

#### Interface Avaliacao
```typescript
interface Avaliacao {
  id: number;
  nomeUsuario: string;
  avatarUsuario: string;
  nota: number;
  comentario: string;
  dataAvaliacao: Date;
}
```

### Endpoints Necessários

#### 1. Buscar Detalhes do Pacote
```
GET /api/pacotes/{id}
```

**Resposta esperada:**
```json
{
  "id": 1,
  "titulo": "Recife - São Paulo",
  "imagemPrincipal": "https://exemplo.com/imagem.jpg",
  "preco": 2400,
  "avaliacao": 5.0,
  "totalAvaliacoes": 128,
  "dataIda": "06/03/2024",
  "dataVolta": "13/03/2024",
  "duracao": "7 dias",
  "tipoViagem": "Aéreo + Hospedagem",
  "incluso": "Café da manhã, transfer",
  "categoria": "Pacote Completo",
  "localizacao": "Recife - São Paulo",
  "descricaoCompleta": "Descrição detalhada...",
  "destino": "Recife - São Paulo",
  "avaliacoes": [
    {
      "id": 1,
      "nomeUsuario": "João Silva",
      "avatarUsuario": "https://exemplo.com/avatar.jpg",
      "nota": 5,
      "comentario": "Experiência incrível!",
      "dataAvaliacao": "2024-01-15T00:00:00Z"
    }
  ]
}
```

#### 2. Criar Reserva
```
POST /api/reservas
```

**Payload:**
```json
{
  "pacoteId": 1,
  "numeroPassageiros": 2,
  "valorTotal": 4800,
  "dataReserva": "2024-01-20T10:30:00Z"
}
```

**Resposta esperada:**
```json
{
  "id": 123,
  "status": "confirmada",
  "numeroReserva": "RSV-2024-001",
  "mensagem": "Reserva realizada com sucesso!"
}
```

### Implementação do Serviço Angular

#### Criar Serviço de Pacotes
```bash
ng generate service services/pacote
```

#### Exemplo de Implementação
```typescript
// services/pacote.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PacoteService {
  private apiUrl = 'http://localhost:8080/api'; // Ajustar URL

  constructor(private http: HttpClient) {}

  buscarPacote(id: number): Observable<Pacote> {
    return this.http.get<Pacote>(`${this.apiUrl}/pacotes/${id}`);
  }

  criarReserva(dadosReserva: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/reservas`, dadosReserva);
  }
}
```

### Modificações Necessárias no Componente

#### 1. Injetar o Serviço
```typescript
import { PacoteService } from '../../../../../services/pacote.service';

constructor(
  private route: ActivatedRoute,
  private pacoteService: PacoteService
) {}
```

#### 2. Substituir Método carregarPacote
```typescript
carregarPacote(id: string) {
  this.pacoteService.buscarPacote(+id).subscribe({
    next: (pacote) => {
      this.pacote = pacote;
    },
    error: (error) => {
      console.error('Erro ao carregar pacote:', error);
      // Implementar tratamento de erro
    }
  });
}
```

#### 3. Substituir Método realizarReserva
```typescript
realizarReserva() {
  if (!this.pacote) return;

  const dadosReserva = {
    pacoteId: this.pacote.id,
    numeroPassageiros: this.numeroPassageiros,
    valorTotal: this.pacote.preco * this.numeroPassageiros,
    dataReserva: new Date()
  };

  this.pacoteService.criarReserva(dadosReserva).subscribe({
    next: (resposta) => {
      alert(`Reserva ${resposta.numeroReserva} realizada com sucesso!`);
      // Redirecionar ou mostrar página de confirmação
    },
    error: (error) => {
      console.error('Erro ao criar reserva:', error);
      alert('Erro ao realizar reserva. Tente novamente.');
    }
  });
}
```

### Configuração de Rota Dinâmica

#### Atualizar app.routes.ts
```typescript
export const routes: Routes = [
  // ... outras rotas
  { path: 'bundles/:id', component: DetailsBundle },
  // ... outras rotas
];
```

### Validações Recomendadas

#### 1. Loading States
- Implementar loading spinner durante carregamento
- Placeholder para dados não carregados

#### 2. Error Handling
- Página de erro 404 para pacotes não encontrados
- Mensagens de erro amigáveis

#### 3. Validação de Formulário
- Validar número de passageiros
- Validar dados antes de enviar

### Melhorias Futuras

1. **Autenticação**: Verificar se usuário está logado antes de permitir reserva
2. **Cache**: Implementar cache para dados do pacote
3. **Otimização**: Lazy loading de imagens
4. **SEO**: Meta tags dinâmicas baseadas no pacote
5. **Analytics**: Tracking de visualizações e conversões

### Estrutura de Banco Recomendada

#### Tabela pacotes
```sql
CREATE TABLE pacotes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  titulo VARCHAR(255) NOT NULL,
  imagem_principal VARCHAR(500),
  preco DECIMAL(10,2) NOT NULL,
  avaliacao DECIMAL(2,1) DEFAULT 0,
  total_avaliacoes INT DEFAULT 0,
  data_ida DATE,
  data_volta DATE,
  duracao VARCHAR(50),
  tipo_viagem VARCHAR(100),
  incluso TEXT,
  categoria VARCHAR(100),
  localizacao VARCHAR(255),
  descricao_completa TEXT,
  destino VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### Tabela avaliacoes
```sql
CREATE TABLE avaliacoes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  pacote_id INT NOT NULL,
  nome_usuario VARCHAR(255) NOT NULL,
  avatar_usuario VARCHAR(500),
  nota INT NOT NULL CHECK (nota >= 1 AND nota <= 5),
  comentario TEXT,
  data_avaliacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (pacote_id) REFERENCES pacotes(id)
);
```

#### Tabela reservas
```sql
CREATE TABLE reservas (
  id INT PRIMARY KEY AUTO_INCREMENT,
  pacote_id INT NOT NULL,
  numero_passageiros INT NOT NULL,
  valor_total DECIMAL(10,2) NOT NULL,
  status ENUM('pendente', 'confirmada', 'cancelada') DEFAULT 'pendente',
  numero_reserva VARCHAR(20) UNIQUE,
  data_reserva TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (pacote_id) REFERENCES pacotes(id)
);
```
