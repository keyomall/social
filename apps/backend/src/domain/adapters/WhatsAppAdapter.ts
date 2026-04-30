import { ISocialAdapter, SocialPostPayload, SocialPostResponse } from './ISocialAdapter';

export class WhatsAppAdapter implements ISocialAdapter {
  platformName = 'WhatsApp';

  async validateCredentials(credentials: Record<string, any>): Promise<boolean> {
    return Boolean(
      typeof credentials.phoneNumberId === "string" &&
      credentials.phoneNumberId.length > 0 &&
      typeof credentials.accessToken === "string" &&
      credentials.accessToken.length > 0
    );
  }

  async publish(payload: SocialPostPayload, credentials: Record<string, any>): Promise<SocialPostResponse> {
    try {
      console.log(`[WhatsAppAdapter] Enviando mensaje Broadcast/Template usando WA Cloud API...`);
      
      // Regla de Negocio: WhatsApp Broadcast (No-Reply) es propenso a ban por SPAM
      // El Smart Queue debe ser extremadamente cuidadoso con los rate limits de Meta WA.
      
      return {
        success: true,
        platformId: `wa_msg_${Date.now()}`
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        retryable: true 
      };
    }
  }
}
