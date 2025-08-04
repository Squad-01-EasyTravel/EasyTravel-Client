// Instruções para resolver o erro 403 no Dashboard

## Problema Identificado
O erro 403 (Forbidden) indica que as requisições para os endpoints do dashboard não estão sendo autenticadas adequadamente.

## Soluções Implementadas

### 1. Verificação de Autenticação no Componente
- Adicionado verificação se o usuário está autenticado antes de carregar dados
- Adicionado verificação se o usuário tem privilégios administrativos (ADMIN ou EMPLOYEE)
- Redirecionamento automático para login se não autenticado
- Redirecionamento para home se não tem privilégios

### 2. Headers Explícitos no DashboardService
- Adicionado AuthService no construtor do DashboardService
- Criado método `getAuthHeaders()` que adiciona explicitamente o token Authorization
- Todas as requisições agora usam headers explícitos com o token

### 3. Debug Detalhado
- Logs para verificar se o token está disponível
- Logs para verificar role do usuário
- Logs para verificar se headers estão sendo adicionados

## Como Testar

1. **Primeiro, faça login como ADMIN ou EMPLOYEE**
   - Acesse `/auth/login`
   - Use credenciais de administrador
   - Verifique se o token é salvo no localStorage

2. **Acesse o dashboard**
   - Navegue para a página do dashboard admin
   - Abra o console do navegador
   - Verifique os logs de debug que mostram:
     - Token disponível: true
     - Usuário autenticado: true
     - Role do usuário: ADMIN/EMPLOYEE
     - Has admin access: true

3. **Verificar requisições**
   - Na aba Network do DevTools
   - Verifique se as requisições para `/api/dashboard/*` contêm:
     - Header `Authorization: Bearer [token]`
     - Status 200 ao invés de 403

## Próximos Passos se Ainda Houver Erro 403

1. **Verificar se o token está expirado**
2. **Verificar se o backend está validando o token corretamente**
3. **Verificar se o role do usuário logado tem permissão no backend**
4. **Verificar CORS no backend se necessário**

## Comandos Úteis para Debug

```javascript
// No console do navegador:
console.log('Token:', localStorage.getItem('jwt'));
console.log('User:', localStorage.getItem('user'));

// Para decodificar o token JWT:
function parseJwt(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
}

console.log('Token payload:', parseJwt(localStorage.getItem('jwt')));
```
