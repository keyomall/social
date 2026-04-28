export interface RichTextSegment {
  text: string;
  format?: 'bold' | 'italic' | 'strikethrough';
  type?: 'text' | 'hashtag' | 'mention' | 'link';
}

export interface MediaAsset {
  url: string;
  type: 'image' | 'video' | 'audio';
  altText?: string;
}

export interface SocialPostPayload {
  content: string; // Plaintext fallback
  richContent?: RichTextSegment[]; // Formateo industrial competitivo
  mediaAssets?: MediaAsset[]; // Soporte multimedia robusto
  scheduledTime?: Date;
  variants?: Record<string, string>; // Ej: hashtags específicos, menciones
}

export interface SocialPostResponse {
  success: boolean;
  platformId?: string; // ID devuelto por la red social
  error?: string;
  retryable?: boolean;
}

export interface ISocialAdapter {
  platformName: string;
  
  /**
   * Valida si las credenciales son correctas y tienen permisos
   */
  validateCredentials(credentials: Record<string, any>): Promise<boolean>;

  /**
   * Publica el contenido en la red social
   */
  publish(payload: SocialPostPayload, credentials: Record<string, any>): Promise<SocialPostResponse>;
}
