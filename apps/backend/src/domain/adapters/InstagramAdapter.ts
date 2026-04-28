import { ISocialAdapter, SocialPostPayload, SocialPostResponse } from './ISocialAdapter';

export class InstagramAdapter implements ISocialAdapter {
  platformName = 'Instagram';

  async validateCredentials(credentials: Record<string, any>): Promise<boolean> {
    console.log(`[InstagramAdapter] Validando cuenta profesional conectada a FB Page: ${credentials.igAccountId}`);
    return true;
  }

  async publish(payload: SocialPostPayload, credentials: Record<string, any>): Promise<SocialPostResponse> {
    try {
      // Regla de Negocio: Instagram REQUIERE media (foto o reel)
      if (!payload.mediaAssets || payload.mediaAssets.length === 0) {
        throw new Error("Instagram Content API requiere al menos un asset multimedia (Imagen o Video). No se puede publicar solo texto.");
      }

      console.log(`[InstagramAdapter] Publicando carrusel/reel en ${credentials.igAccountId} con ${payload.mediaAssets.length} assets...`);
      // Simulación de llamada a IG Graph API
      
      return {
        success: true,
        platformId: `ig_${Date.now()}`
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        retryable: error.message.includes("requiere al menos un asset") ? false : true 
      };
    }
  }
}
