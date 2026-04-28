import { ISocialAdapter, SocialPostPayload, SocialPostResponse } from './ISocialAdapter';
import axios from 'axios';

export class TwitterAdapter implements ISocialAdapter {
  platformName = 'Twitter';
  private baseUrl = 'https://api.twitter.com/2';

  async validateCredentials(credentials: Record<string, any>): Promise<boolean> {
    try {
      if (!credentials.accessToken) return false;
      // Validar llamando al endpoint /me de Twitter V2
      const response = await axios.get<any>(`${this.baseUrl}/users/me`, {
        headers: { Authorization: `Bearer ${credentials.accessToken}` }
      });
      return !!response.data.data.id;
    } catch (error) {
      console.error(`[TwitterAdapter] Error validando credenciales:`, error);
      return false;
    }
  }

  async publish(payload: SocialPostPayload, credentials: Record<string, any>): Promise<SocialPostResponse> {
    try {
      if (!credentials.accessToken) {
        throw new Error('Missing Twitter access token');
      }

      console.log(`[TwitterAdapter] Realizando POST a Twitter API v2`);
      
      const postData: any = {
        text: payload.content
      };

      // Si hay media, Twitter V2 requiere subir la media a V1.1 primero, obtener media_id y luego adjuntarlo.
      // (Esta es una implementación simplificada asumiendo que ya tenemos media_ids en un escenario real)
      // postData.media = { media_ids: [mediaId1] }

      const response = await axios.post<any>(`${this.baseUrl}/tweets`, postData, {
        headers: {
          Authorization: `Bearer ${credentials.accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      return {
        success: true,
        platformId: response.data.data.id
      };
    } catch (error: any) {
      console.error(`[TwitterAdapter] Error publicando:`, error.response?.data || error.message);
      
      const isRetryable = error.response?.status === 429 || error.response?.status >= 500;

      return {
        success: false,
        error: error.response?.data?.detail || error.message,
        retryable: isRetryable
      };
    }
  }
}
