/**
 * Interface para resposta da API de mídia
 * Suporta diferentes tipos de mídia para bundles de viagem
 */
export interface MediaResponse {
  id: number;
  mediaType: string; // Valores aceitos: 'IMAGE', 'VIDEO'
  mediaUrl: string;
  bundleId: number;
}
