import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

interface CloudinaryResponse {
  secure_url: string;
  public_id: string;
  format: string;
  resource_type: string;
  created_at: string;
  bytes: number;
  width: number;
  height: number;
  folder?: string;
  original_filename: string;
}

@Injectable({
  providedIn: 'root'
})
export class ImageUploadService {
  // Cloudinary é gratuito até 25GB de armazenamento e 25GB de largura de banda mensal
  // URL de upload público (não precisa de chave API para uploads não-autenticados)
  private readonly CLOUDINARY_CLOUD_NAME = 'dayr03rcc'; // SEU cloud name do Cloudinary
  private readonly CLOUDINARY_UPLOAD_PRESET = 'easytravel_upload'; // Upload preset correto (sem 's' no final)
  private readonly CLOUDINARY_API_URL = `https://api.cloudinary.com/v1_1/${this.CLOUDINARY_CLOUD_NAME}/image/upload`;

  constructor(private http: HttpClient) {}

  uploadImageToCloudinary(file: File): Observable<string> {
    console.log('📤 Iniciando upload para Cloudinary:', file.name, 'Tamanho:', this.formatFileSize(file.size));
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', this.CLOUDINARY_UPLOAD_PRESET);
    formData.append('cloud_name', this.CLOUDINARY_CLOUD_NAME);
    
    // Tags opcionais para organizar
    formData.append('tags', 'easytravel,package');
    formData.append('folder', 'easytravel/packages');

    return this.http.post<CloudinaryResponse>(this.CLOUDINARY_API_URL, formData).pipe(
      map(response => {
        console.log('✅ Upload para Cloudinary bem-sucedido:', response.secure_url);
        console.log('📊 Detalhes da imagem:', {
          id: response.public_id,
          size: this.formatFileSize(response.bytes),
          dimensions: `${response.width}x${response.height}`,
          format: response.format,
          createdAt: response.created_at
        });
        return response.secure_url;
      }),
      catchError(error => {
        console.error('❌ Erro no upload para Cloudinary:', error);
        
        let errorMessage = 'Falha no upload da imagem. Tente novamente.';
        
        if (error.status === 400) {
          errorMessage = 'Arquivo inválido! Verifique se é uma imagem válida.';
        } else if (error.status === 413) {
          errorMessage = 'Arquivo muito grande! Tente uma imagem menor.';
        } else if (error.status === 0) {
          errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
        } else if (error.error?.error?.message) {
          errorMessage = error.error.error.message;
        }
        
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  // Método alternativo usando ImgBB (também gratuito - 32MB por imagem)
  uploadImageToImgBB(file: File): Observable<string> {
    // NOTA: Para usar o ImgBB, você precisa se registrar gratuitamente em https://api.imgbb.com/
    // e obter sua própria chave de API. A chave demo não funciona.
    const IMGBB_API_KEY = 'SUA_CHAVE_IMGBB_AQUI'; // Substitua por sua chave real
    
    // Se não há chave configurada, pula direto para o Base64
    if (IMGBB_API_KEY === 'SUA_CHAVE_IMGBB_AQUI') {
      console.warn('⚠️ ImgBB API key não configurada, pulando...');
      return throwError(() => new Error('ImgBB API key não configurada'));
    }
    
    const IMGBB_API_URL = `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`;
    
    console.log('📤 Iniciando upload para ImgBB:', file.name);
    
    const formData = new FormData();
    formData.append('image', file);
    
    return this.http.post<any>(IMGBB_API_URL, formData).pipe(
      map(response => {
        if (response.success) {
          console.log('✅ Upload para ImgBB bem-sucedido:', response.data.url);
          return response.data.url;
        }
        throw new Error('Upload falhou');
      }),
      catchError(error => {
        console.error('❌ Erro no upload para ImgBB:', error);
        let errorMessage = 'Falha no upload para ImgBB';
        
        if (error.status === 400) {
          errorMessage = 'ImgBB: Arquivo inválido ou chave de API incorreta';
        } else if (error.status === 403) {
          errorMessage = 'ImgBB: Chave de API inválida ou limite excedido';
        }
        
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  // Método principal que tenta múltiplos provedores com fallback inteligente
  uploadImage(file: File): Observable<string> {
    const validation = this.validateImageFile(file);
    if (!validation.valid) {
      return throwError(() => new Error(validation.error!));
    }

    // Tenta primeiro o Cloudinary (mais confiável e configurado)
    return this.uploadImageToCloudinary(file).pipe(
      catchError(cloudinaryError => {
        console.warn('⚠️ Cloudinary falhou, tentando ImgBB...', cloudinaryError.message);
        // Se Cloudinary falhar, tenta ImgBB como segundo fallback
        return this.uploadImageToImgBB(file).pipe(
          catchError(imgbbError => {
            console.warn('⚠️ ImgBB também falhou, usando Base64 como fallback final...', imgbbError.message);
            // Se ambos falharam, usa Base64 como último recurso
            return new Observable<string>(observer => {
              this.convertToBase64(file)
                .then(base64String => {
                  observer.next(base64String);
                  observer.complete();
                })
                .catch(err => observer.error(err));
            });
          })
        );
      })
    );
  }

  // Método para validar arquivos de imagem
  validateImageFile(file: File): { valid: boolean; error?: string } {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(file.type)) {
      return { 
        valid: false, 
        error: 'Tipo de arquivo não suportado! Use JPG, PNG, WebP ou GIF.' 
      };
    }

    if (file.size > maxSize) {
      return { 
        valid: false, 
        error: `Arquivo muito grande! O tamanho máximo é ${this.formatFileSize(maxSize)}.` 
      };
    }

    if (file.size === 0) {
      return { 
        valid: false, 
        error: 'Arquivo vazio ou corrompido.' 
      };
    }

    return { valid: true };
  }

  // Método para criar preview da imagem
  createImagePreview(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        reject(new Error('Arquivo não é uma imagem válida'));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          resolve(result);
        } else {
          reject(new Error('Falha ao criar preview da imagem'));
        }
      };
      reader.onerror = () => reject(new Error('Erro ao ler o arquivo'));
      reader.readAsDataURL(file);
    });
  }

  // Método auxiliar para formatar tamanho do arquivo
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Método para verificar se uma URL é válida
  isValidImageUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      const validDomains = ['cloudinary.com', 'imgbb.com', 'imgur.com', 'amazonaws.com'];
      const hasValidExtension = /\.(jpg|jpeg|png|webp|gif)$/i.test(urlObj.pathname);
      const hasValidDomain = validDomains.some(domain => urlObj.hostname.includes(domain));
      
      return hasValidExtension || hasValidDomain;
    } catch {
      return false;
    }
  }

  // Método para converter imagem para Base64 (fallback offline)
  convertToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        console.log('✅ Imagem convertida para Base64');
        resolve(base64);
      };
      reader.onerror = () => reject(new Error('Erro ao converter imagem'));
      reader.readAsDataURL(file);
    });
  }

  // Método inteligente que tenta provedores online e fallback para Base64
  smartUpload(file: File): Observable<string> {
    const validation = this.validateImageFile(file);
    if (!validation.valid) {
      return throwError(() => new Error(validation.error!));
    }

    // Tenta primeiro o Cloudinary, depois ImgBB, depois Base64
    return this.uploadImageToCloudinary(file).pipe(
      catchError(cloudinaryError => {
        console.warn('⚠️ Cloudinary falhou, tentando ImgBB...', cloudinaryError.message);
        return this.uploadImageToImgBB(file).pipe(
          catchError(imgbbError => {
            console.warn('⚠️ ImgBB também falhou, usando Base64 como fallback final...');
            // Se ambos falharam, usa Base64 como último recurso
            return new Observable<string>(subscriber => {
              this.convertToBase64(file)
                .then(base64 => {
                  subscriber.next(base64);
                  subscriber.complete();
                })
                .catch(err => subscriber.error(err));
            });
          })
        );
      })
    );
  }
}
