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
   * Valida remotamente si la llave tiene saldo activo
   * (Esta es una implementación de ejemplo, en prod requeriría axios import y llamar a /auth/key endpoint del provider)
   */
  public async preFlightCheck(key: AiKeyRecord): Promise<boolean> {
    if (!key) return false;
    // Simulate real API ping
    console.log(`[AiKeyCarousel] Realizando Pre-Flight ping al proveedor ${key.provider}...`);
    // Si fuera real: await axios.get('https://openrouter.ai/api/v1/auth/key', { headers: { Authorization: `Bearer ${key.apiKey}` } })
    return true; 
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
