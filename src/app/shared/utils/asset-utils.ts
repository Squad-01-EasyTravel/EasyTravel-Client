/**
 * Utilitários para trabalhar com caminhos de assets
 */

/**
 * Converte um caminho relativo de asset para um caminho absoluto
 * @param assetPath - Caminho relativo do asset (ex: 'imgs/logo.png')
 * @returns Caminho absoluto do asset
 */
export function getAssetPath(assetPath: string): string {
  // Remove a barra inicial se presente para evitar duplicação
  const cleanPath = assetPath.startsWith('/') ? assetPath.substring(1) : assetPath;
  return `/assets/${cleanPath}`;
}

/**
 * Caminhos comuns de assets usados no projeto
 */
export const ASSET_PATHS = {
  IMAGES: {
    LOGOS: {
      MAIN_LOGO: getAssetPath('Logo/3-removebg-previeww-removebg-preview.png'),
      DISCO_PIN: getAssetPath('Logo/discoPin-greenOrange-bg-grande 3.svg')
    },
    BACKGROUNDS: {
      NAVBAR: getAssetPath('imgs/Background-navbar.png'),
      LOGIN: getAssetPath('imgs/loginImage.jpg'),
      REGISTER: getAssetPath('imgs/registerImage.jpg')
    },
    DESTINATIONS: {
      GRAMADO: getAssetPath('imgs/gramado.jpg'),
      FORTALEZA: getAssetPath('imgs/fortaleza.jpg')
    },
    ICONS: {
      BOOK: getAssetPath('imgs/book.svg'),
      ARCHIVE: getAssetPath('imgs/Archive.svg'),
      VECTOR: getAssetPath('imgs/Vector.svg')
    },
    MASCOT: getAssetPath('imgs/et_mascote.png')
  }
} as const;

/**
 * Função para verificar se um asset existe
 * @param assetPath - Caminho do asset
 * @returns Promise que resolve com true se o asset existir
 */
export async function assetExists(assetPath: string): Promise<boolean> {
  try {
    const response = await fetch(assetPath, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Precarrega um asset de imagem
 * @param imagePath - Caminho da imagem
 * @returns Promise que resolve com o elemento de imagem carregado
 */
export function preloadImage(imagePath: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${imagePath}`));
    img.src = imagePath;
  });
}
