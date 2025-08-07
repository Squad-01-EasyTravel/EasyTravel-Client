# 🌟 EasyTravel Client

> Plataforma Angular 20 para gestão de viagens, turismo e analytics, com autenticação JWT e controle de acesso por roles.

---

## 📋 Visão Geral

O **EasyTravel Client** é uma aplicação web moderna, desenvolvida com Angular 20, que oferece uma solução completa para gestão de viagens. Atende três tipos de usuários (cliente, funcionário e administrador), cada um com interfaces e permissões específicas. O projeto segue arquitetura modular baseada em features, utiliza componentes standalone, lazy loading, guards, interceptors e RxJS para programação reativa.

### Principais Características
- 🔐 Autenticação JWT robusta, com refresh automático
- 📊 Dashboard avançado com visualizações em Chart.js
- 🎨 Design system moderno, responsivo e acessível
- 🏗️ Arquitetura modular com lazy loading
- 📱 Interface mobile-first
- 🔒 Controle de acesso por roles

---

## 🏗️ Arquitetura & Tecnologias

- **Angular 20.1.0** / **TypeScript 5.8.2**
- **RxJS 7.8.0** para programação reativa
- **Bootstrap 5.3.7**, **Font Awesome**, **Google Fonts**
- **Chart.js 4.5.0** para gráficos interativos
- **@auth0/angular-jwt**, **jwt-decode** para autenticação
- **Jasmine & Karma** para testes unitários
- **Standalone Components**, **Lazy Loading**, **Dependency Injection**

### Fluxo de Autenticação
```
Login → JWT Token → AuthGuard → Route Protection → Role-based Access
```
- Token salvo em LocalStorage, verificação automática de expiração
- Interceptor injeta JWT nas requisições
- Role-based access: CLIENT, EMPLOYEE, ADMIN

---

## 📁 Estrutura de Pastas

```
src/
├── app/
│   ├── core/                 # Serviços centrais
│   ├── shared/               # Componentes e utilitários compartilhados
│   │   ├── components/       # Modal de confirmação, notificações, validação
│   │   ├── guards/           # auth.guard.ts (proteção de rotas)
│   │   ├── interceptors/     # auth.interceptor.ts (JWT)
│   │   ├── services/         # auth, dashboard, booking, user-management
│   │   ├── models/           # Interfaces TypeScript
│   │   ├── utils/            # Helpers
│   │   ├── navbar/           # Navegação global
│   │   └── footer/           # Rodapé global
│   ├── features/
│   │   ├── client/
│   │   │   ├── pages/        # home, auth, bundle, booking, payment, user
│   │   │   └── components/   # Componentes do cliente
│   │   ├── employee/
│   │   │   ├── pages/        # package-management, review-management
│   │   │   └── employee-layout.ts
│   │   └── admin/
│   │       ├── pages/        # admin-dashboard, admin-dashboard-content, user-management
│   │       └── admin-layout.ts
│   ├── app.config.ts
│   ├── app.routes.ts
│   └── app.component.ts
├── assets/
│   ├── imgs/
│   └── Logo/
├── environments/
└── styles.css
```

---

## 🔐 Rotas Protegidas por JWT & Roles

> Rotas protegidas por AuthGuard + Interceptor JWT.
> O acesso depende do tipo de usuário (role):

### CLIENT
- `/client/home`           – Home do usuário
- `/client/bundle`         – Catálogo de pacotes
- `/client/booking`        – Reservas
- `/client/payment`        – Pagamentos
- `/client/user`           – Perfil e configurações
- `/client/history`        – Histórico de viagens

### EMPLOYEE
- `/employee/package-management` – Gestão de pacotes
- `/employee/review-management`  – Moderação de avaliações
- `/employee/reports`            – Relatórios

### ADMIN
- `/admin/admin-dashboard`        – Dashboard principal
- `/admin/admin-dashboard-content`– Gráficos e analytics
- `/admin/user-management`        – Gestão de usuários
- `/admin/config`                 – Configurações globais

---

## 🎨 Design System

- **Paleta de cores personalizada**: Laranja vibrante, verde natural, azul complementar
- **Gradientes modernos, cards elevados, micro-interações**
- **Tipografia escalonada e grid responsivo**
- **Acessibilidade (WCAG)**

Exemplo:
```css
:root {
  --color-primary: #FF7900;
  --color-secondary: #7FC023;
  --color-accent: #17a2b8;
  --color-bg-light: #f8f9fa;
}
```

---

## 📊 Dashboard com Chart.js

- Gráficos de linha, barra, pizza e rosca para métricas principais
- Dados em tempo real, responsivos, exportação para Excel
- Cards estatísticos animados e customizados

Exemplo de dashboard:
```typescript
renderChart(metricKey: string, canvasId: string, chartType: keyof ChartTypeRegistry) {
  // Renderiza gráfico Chart.js com dados da API
}
```

---

## ⚡ Funcionalidades Detalhadas

### Para Clientes
- Home page e destaques
- Catálogo de pacotes com filtros
- Reservas e pagamentos integrados
- Perfil, histórico de viagens

### Para Funcionários
- CRUD de pacotes turísticos
- Moderação de avaliações
- Relatórios e análises

### Para Administradores
- Dashboard completo com analytics
- Gestão de usuários e permissões
- Configurações do sistema

---

## 🚀 Instalação & Scripts

### Requisitos
- Node.js 18+, npm/yarn, Angular CLI 20+

### Instalação
```bash
git clone https://github.com/Squad-01-EasyTravel/EasyTravel-Client.git
cd EasyTravel-Client
npm install
cp src/environments/environment.example.ts src/environments/environment.ts
npm start
```

### Scripts
```bash
npm start                # Dev + proxy
ng serve                 # Dev básico
npm run build            # Build produção
npm test                 # Testes unitários
npm run test:coverage    # Cobertura de testes
```

---

## 🌟 Pontos Fortes

- Arquitetura robusta e modular (features)
- JWT com refresh e controle por role
- Interface moderna, responsiva e acessível
- Dashboard analytics poderoso e exportável
- Developer experience avançada (TypeScript estrito, documentação inline)
- Performance otimizada: lazy loading, tree shaking, assets leves

---

## 📞 Suporte & Contribuição

- [GitHub Issues](https://github.com/Squad-01-EasyTravel/EasyTravel-Client/issues)
- [Wiki](https://github.com/Squad-01-EasyTravel/EasyTravel-Client/wiki)
- contato@easytravel.com

---

**EasyTravel Client** — Desenvolvido com ❤️ pela Squad 01 EasyTravel