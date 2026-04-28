import { ISocialAdapter, SocialPostPayload, SocialPostResponse } from './ISocialAdapter';
import axios from 'axios';

export class FacebookAdapter implements ISocialAdapter {
  platformName = 'Facebook';
  private apiVersion = 'v19.0';
  private baseUrl = `https://graph.facebook.com/${this.apiVersion}`;

  async validateCredentials(credentials: Record<string, any>): Promise<boolean> {
    try {
      if (!credentials.accessToken || !credentials.pageId) {
        return false;
      }
      // Llamada real a Graph API para validar el token
      const response = await axios.get<any>(`${this.baseUrl}/me`, {
        params: { access_token: credentials.accessToken }
      });
      return !!response.data.id;
    } catch (error) {
      console.error(`[FacebookAdapter] Error validando credenciales:`, error);
      return false;
    }
  }

  async publish(payload: SocialPostPayload, credentials: Record<string, any>): Promise<SocialPostResponse> {
    try {
      if (!credentials.accessToken || !credentials.pageId) {
        throw new Error('Missing Facebook credentials (accessToken or pageId)');
      }

      console.log(`[FacebookAdapter] Realizando POST a Graph API para página ${credentials.pageId}`);
      
      let endpoint = `${this.baseUrl}/${credentials.pageId}/feed`;
      let postData: any = {
        message: payload.content,
        access_token: credentials.accessToken
      };

      // Si hay media, cambiamos el endpoint y la estructura
      if (payload.mediaAssets && payload.mediaAssets.length > 0) {
        const mediaUrl = payload.mediaAssets[0].url; // Simplificación: solo la primera foto
        // Nota: Para videos sería /videos
        endpoint = `${this.baseUrl}/${credentials.pageId}/photos`;
        postData = {
          url: mediaUrl, // La URL de la foto (debe ser accesible públicamente, ej. S3)
          message: payload.content,
          access_token: credentials.accessToken
        };
      }

      const response = await axios.post<any>(endpoint, postData);
      
      return {
        success: true,
        platformId: response.data.id
      };
    } catch (error: any) {
      console.error(`[FacebookAdapter] Error publicando:`, error.response?.data || error.message);
      
      // Manejo de códigos de error de Facebook Graph API
      const fbError = error.response?.data?.error;
      const isRetryable = fbError ? [1, 2, 4, 17].includes(fbError.code) : true; // Errores de API Rate Limit / Temporales

      return {
        success: false,
        error: fbError?.message || error.message,
        retryable: isRetryable
      };
    }
  }
}
