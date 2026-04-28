import { AiKeyCarousel } from './AiKeyCarousel';

export class PromptStrategyEngine {
  constructor(private carousel: AiKeyCarousel) {}

  /**
   * Simula la generación de contenido viral usando fallback de llaves.
   */
  public async generateViralPosts(seedIdea: string, targetCount: number = 3): Promise<string[]> {
    let currentKey = this.carousel.getAvailableKey();
    
    if (!currentKey) {
      throw new Error("No hay llaves de IA disponibles en el carrusel.");
    }

    console.log(`[PromptStrategyEngine] Iniciando generación con provider: ${currentKey.provider} (KeyID: ${currentKey.id})`);

    // SIMULACIÓN: Fallo de la primera llave
    if (currentKey.provider === 'OPENAI') {
      console.error(`[PromptStrategyEngine] Error 402: OpenAI Insufficient Quota.`);
      this.carousel.markKeyExhausted(currentKey.id);
      
      // Intentar de nuevo recursivamente, ahora usará el fallback
      return this.generateViralPosts(seedIdea, targetCount);
    }

    // SIMULACIÓN: Éxito con OpenRouter (Fallback)
    console.log(`[PromptStrategyEngine] Llamando a API con seed: "${seedIdea}"...`);
    
    const results = [];
    for (let i = 0; i < targetCount; i++) {
      results.push(`[Variante ${i+1}] ${seedIdea} - ¡Descubre más aquí! 🔥🚀 #Viral`);
    }

    return results;
  }
}
