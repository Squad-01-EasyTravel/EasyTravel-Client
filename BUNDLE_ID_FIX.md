# Correção da Integração Bundle ID para Pacote ID

## Problema Identificado
A API estava retornando `pacoteId` no JSON, mas o código estava esperando `bundleId`. Isso causava o erro de `undefined` nas requisições para buscar informações dos bundles.

## Exemplo do JSON da API
```json
[
  {
    "pacoteId": 1,
    "faturamento": 3000
  },
  {
    "pacoteId": 2,
    "faturamento": 4000
  }
]
```

## Alterações Realizadas

### 1. dashboard.service.ts
- ✅ Atualizada interface `ReservasPorPacote`: `bundleId` → `pacoteId`
- ✅ Atualizada interface `FaturamentoPorPacote`: `bundleId` → `pacoteId`

### 2. admin-dashboard-content.ts
- ✅ Método `loadBundleTitlesForReservas`: `item.bundleId` → `item.pacoteId`
- ✅ Método `loadBundleTitlesForFaturamento`: `item.bundleId` → `item.pacoteId`
- ✅ Labels nos gráficos: `item.bundleId` → `item.pacoteId`

## Fluxo Corrigido
1. 📡 API retorna dados com `pacoteId`
2. 🔍 Código busca bundle usando `item.pacoteId`
3. 📊 Bundle title é exibido corretamente nos gráficos

## Debug Logs Atualizados
```typescript
// Agora funcionará corretamente:
const bundleId = item.pacoteId || item.pacote; // ✅ Correto
console.log('🎯 Dashboard - Buscando bundle ID:', bundleId, 'para item:', item);
```

## Resultado
✅ Problema de `undefined` resolvido
✅ Bundle titles serão exibidos corretamente nos gráficos
✅ Logs de debug mostrarão os IDs corretos
✅ Compilação sem erros TypeScript
