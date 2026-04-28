export interface AiKeyRecord {
  id: string;
  provider: 'OPENROUTER' | 'DEEPSEEK' | 'OPENAI' | 'ANTHROPIC';
  apiKey: string;
  priority: number;     // 1 es más alta prioridad
  isActive: boolean;
  isExhausted: boolean; // True si se acabaron los créditos o limit reached
  lastChecked?: Date;
}

export class AiKeyCarousel {
  private keys: AiKeyRecord[] = [];

  constructor(initialKeys: AiKeyRecord[]) {
    // Ordenar por prioridad (ascendente, 1 es primero)
    this.keys = initialKeys.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Obtiene la mejor llave disponible en este momento.
   */
  public getAvailableKey(): AiKeyRecord | null {
    const availableKey = this.keys.find(k => k.isActive && !k.isExhausted);
    return availableKey || null;
  }

  /**
   * Valida remotamente si la llave tiene saldo activo realizando un ping real al proveedor.
   */
  public async preFlightCheck(key: AiKeyRecord): Promise<boolean> {
    if (!key) return false;
    const axios = require('axios');
    
    console.log(`[AiKeyCarousel] Realizando Pre-Flight ping real al proveedor ${key.provider}...`);
    
    try {
      if (key.provider === 'OPENROUTER') {
        const res = await axios.get('https://openrouter.ai/api/v1/auth/key', { 
          headers: { Authorization: `Bearer ${key.apiKey}` } 
        });
        // Valida si el límite se ha alcanzado
        const data = res.data?.data;
        if (data && data.limit !== null && data.usage >= data.limit) {
          console.warn(`[AiKeyCarousel] Llave de OpenRouter ha superado el límite de uso.`);
          return false;
        }
        return true;
      } else if (key.provider === 'DEEPSEEK') {
        // DeepSeek u otros proveedores tienen endpoints similares, 
        // aquí verificamos simplemente con una llamada a los modelos
        const res = await axios.get('https://api.deepseek.com/models', {
          headers: { Authorization: `Bearer ${key.apiKey}` }
        });
        return res.status === 200;
      }
      
      return true; // Fallback para otros
    } catch (error: any) {
      // 401: Unauthorized, 402: Payment Required, 429: Rate Limit
      console.error(`[AiKeyCarousel] Falló Pre-Flight para ${key.provider}:`, error.response?.status, error.message);
      return false;
    }
  }

  /**
   * Marca una llave como agotada (ej. si la API devolvió un 429 persistente o 402 Payment Required)
   */
  public markKeyExhausted(keyId: string): void {
    const key = this.keys.find(k => k.id === keyId);
    if (key) {
      key.isExhausted = true;
      key.lastChecked = new Date();
      console.warn(`[AiKeyCarousel] La llave ${keyId} ha sido marcada como agotada (Exhausted). Pasando a la siguiente.`);
    }
  }

  /**
   * Reactiva una llave (usado por el worker de Healthcheck cuando se renueva el ciclo de facturación)
   */
  public reactivateKey(keyId: string): void {
    const key = this.keys.find(k => k.id === keyId);
    if (key) {
      key.isExhausted = false;
      key.isActive = true;
      key.lastChecked = new Date();
      console.log(`[AiKeyCarousel] La llave ${keyId} ha sido reactivada.`);
    }
  }
}
