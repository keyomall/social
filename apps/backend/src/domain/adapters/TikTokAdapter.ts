import { ISocialAdapter, SocialPostPayload, SocialPostResponse } from './ISocialAdapter';

export class TikTokAdapter implements ISocialAdapter {
  platformName = 'TikTok';

  async validateCredentials(credentials: Record<string, any>): Promise<boolean> {
    return Boolean(
      typeof credentials.accessToken === "string" &&
      credentials.accessToken.length > 0
    );
  }

  async publish(payload: SocialPostPayload, credentials: Record<string, any>): Promise<SocialPostResponse> {
    try {
      // Regla de Negocio: TikTok requiere un video específico
      if (!payload.mediaAssets || !payload.mediaAssets.some(m => m.type === 'video')) {
        throw new Error("TikTok Direct Post API requiere al menos un archivo de tipo 'video'.");
      }

      console.log(`[TikTokAdapter] Subiendo y publicando video en TikTok...`);
      // Simulación de llamada a TikTok API
      
      return {
        success: true,
        platformId: `tk_${Date.now()}`
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        retryable: error.message.includes("requiere al menos un archivo") ? false : true 
      };
    }
  }
}
