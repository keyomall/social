import { AiKeyCarousel } from './AiKeyCarousel';
import axios from 'axios';

export class PromptStrategyEngine {
  constructor(private carousel: AiKeyCarousel) {}

  /**
   * Generación de contenido usando la Key del Carousel mediante llamada HTTP Real a DeepSeek/OpenRouter.
   * Si la API Key proporcionada es el Mock por defecto ('sk-...mock...'), hará bypass para no fallar.
   */
  public async generateViralPosts(seedIdea: string, targetCount: number = 3, strategy: string = 'viral'): Promise<string[]> {
    let currentKey = this.carousel.getAvailableKey();
    
    if (!currentKey) {
      throw new Error("No hay llaves de IA disponibles en el carrusel.");
    }

    console.log(`[PromptStrategyEngine] Llamando a API (${currentKey.provider}) con seed: "${seedIdea}"...`);
    
    const strategyContexts: Record<string, string> = {
      'viral': 'Actúa como un experto en marketing viral. Escribe en tono agresivo, usando emojis y call to actions (clickbait ético).',
      'news': 'Actúa como un periodista. Escribe la noticia de manera objetiva, urgente y clara.',
      'thread': 'Actúa como un educador en Twitter. Desglosa la idea en puntos claros y fáciles de leer.',
      'pr': 'Actúa como un director de Relaciones Públicas. Tono corporativo y profesional para un comunicado.',
      'branding': 'Actúa como un Brand Manager. Enfócate en los valores, la misión y la empatía de la marca.'
    };
    
    const systemPrompt = strategyContexts[strategy] || strategyContexts['viral'];
    console.log(`[PromptStrategyEngine] System Prompt ensamblado: ${systemPrompt}`);

    // Si el usuario puso el MOCK (para desarrollo o sandbox)
    if (currentKey.apiKey.includes('mock')) {
      console.log("[PromptStrategyEngine] Se detectó API Key de prueba (Mock). Retornando simulación exitosa...");
      const results = [];
      const modelTag = currentKey.provider === 'DEEPSEEK' ? '🧠 Generado inteligentemente por DeepSeek' : '✨ Generado por OpenRouter';
      for (let i = 0; i < targetCount; i++) {
        results.push(`[Variante ${i+1} - Estrategia: ${strategy}] ${seedIdea} \n\n${modelTag}`);
      }
      return results;
    }
    
    // LLAMADA REAL A LA API
    try {
      const url = currentKey.provider === 'DEEPSEEK' ? 'https://api.deepseek.com/chat/completions' : 'https://openrouter.ai/api/v1/chat/completions';
      const model = currentKey.provider === 'DEEPSEEK' ? 'deepseek-chat' : 'openai/gpt-4o-mini';

      const response = await axios.post<any>(url, {
        model,
        messages: [
          { role: 'system', content: `${systemPrompt} Escribe ${targetCount} variaciones distintas (Spintax) basadas en esta idea. Separa cada variación claramente con '---VAR---'.` },
          { role: 'user', content: seedIdea }
        ],
        temperature: strategy === 'viral' ? 0.9 : 0.4
      }, {
        headers: {
          'Authorization': `Bearer ${currentKey.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      const contentText = response.data?.choices?.[0]?.message?.content || "";
      // Extraemos las variaciones
      const variants = contentText.split('---VAR---').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
      
      return variants.length > 0 ? variants : [contentText];

    } catch (error: any) {
      console.error(`[PromptStrategyEngine] Error en llamada real a API ${currentKey.provider}:`, error.message);
      this.carousel.markKeyExhausted(currentKey.id);
      // Fallback recursivo: La llave falló (se acabaron los créditos, error 402/429), usamos la siguiente del Carrusel
      return this.generateViralPosts(seedIdea, targetCount, strategy);
    }
  }
}
