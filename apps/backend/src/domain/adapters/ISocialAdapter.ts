export interface SocialPostPayload {
  content: string;
  mediaUrls?: string[];
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
