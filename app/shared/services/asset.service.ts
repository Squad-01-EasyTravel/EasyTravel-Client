import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AssetService {
  private readonly baseAssetPath = '/assets';

  constructor() { }

  /**
   * Retorna o caminho completo para uma imagem no diretório de assets
   * @param imagePath - Caminho relativo da imagem dentro de assets (ex: 'imgs/logo.png')
   * @returns Caminho absoluto para a imagem
   */
  getImagePath(imagePath: string): string {
    // Remove barra inicial se presente para evitar duplicação
    const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
    return `${this.baseAssetPath}/${cleanPath}`;
  }

  /**
   * Retorna o caminho para imagens comuns do projeto
   */
  getCommonImages() {
    return {
      logo: this.getImagePath('Logo/3-removebg-previeww-removebg-preview.png'),
      mascot: this.getImagePath('imgs/et_mascote.png'),
      backgroundNavbar: this.getImagePath('imgs/Background-navbar.png'),
      loginImage: this.getImagePath('imgs/loginImage.jpg'),
      registerImage: this.getImagePath('imgs/registerImage.jpg'),
      gramado: this.getImagePath('imgs/gramado.jpg'),
      fortaleza: this.getImagePath('imgs/fortaleza.jpg'),
      bookIcon: this.getImagePath('imgs/book.svg'),
      archiveIcon: this.getImagePath('imgs/Archive.svg'),
      vectorIcon: this.getImagePath('imgs/Vector.svg')
    };
  }

  /**
   * Verifica se uma imagem existe
   * @param imagePath - Caminho da imagem
   * @returns Promise<boolean>
   */
  async imageExists(imagePath: string): Promise<boolean> {
    try {
      const response = await fetch(imagePath, { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Precarrega uma imagem
   * @param imagePath - Caminho da imagem
   * @returns Promise<HTMLImageElement>
   */
  preloadImage(imagePath: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = imagePath;
    });
  }
}
