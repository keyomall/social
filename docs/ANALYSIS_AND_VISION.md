# Análisis Forense y Visión Evolucionada del Sistema de Publicación Multicuenta

> Nota de vigencia: este documento contiene analisis historico y hoja de ruta aspiracional. Para continuidad operativa real, priorice `docs/HANDOFF_OPERATIVO_2026-04-30.md` y `docs/AI_CONTEXT.md`.

## 1. Crítica Forense del Planteamiento Original

El planteamiento inicial, si bien robusto en términos de ingeniería clásica (separación de responsabilidades, clean architecture, multitenancy), **pecaba de ser un "gestor de contenido estático glorificado"**. Era un sistema pasivo: el usuario crea, el sistema publica. En el ecosistema actual de redes sociales, donde el volumen, la adaptación algorítmica y la velocidad son críticos, un sistema pasivo está destinado a la obsolescencia temprana.

### Deficiencias Clave Detectadas:
1. **Falta de Inteligencia Activa**: El sistema no ayudaba a crear, solo a distribuir. No había entendimiento del contenido, del tono, ni del formato óptimo para cada red.
2. **Cero Capacidad de Spin/Variación**: Publicar el "mismo contenido" en múltiples plataformas o cuentas idénticas es penalizado por algoritmos de spam. Se ignoraba la necesidad de re-empaquetado (repurposing) automático.
3. **Ausencia de un Motor de Resiliencia Externa**: Contemplaba la resiliencia en redes (rate limits, tokens), pero ignoraba la resiliencia en servicios externos críticos que potencian hoy en día las plataformas modernas (ej. APIs de IA).
4. **Ignorancia del Timing Algorítmico**: El "scheduler" tradicional (fecha y hora fijas) es anticuado. Se necesita publicación contextual y basada en tendencias (Trend-driven publishing).
5. **No hay Agentic Workflows**: No se contemplaba que el sistema tomara decisiones menores de forma autónoma basándose en instrucciones globales (agentes de IA para moderación, respuesta temprana o generación de hilos).

---

## 2. Visión Evolucionada: Sistema Inteligente de Autopublicación Generativa (SIAG)

Para transformar este sistema en una herramienta **competitiva, viral y altamente automatizada**, inyectamos una capa de Inteligencia Artificial profunda en el núcleo del dominio, convirtiéndolo en un "Generador y Orquestador de Contenido" en lugar de un simple conducto.

### Nuevas Capacidades Core:

#### A. Motor de IA Generativa Multimodal y Multi-Prompt (El "Cerebro")
- **Integración Numerable de LLMs**: Soporte primario para OpenRouter, OpenAI, Anthropic, Gemini, Groq, etc.
- **Módulo de Estrategia Viral**: Plantillas de prompts dinámicos para transformar una idea base en N variantes (Clicbait ético, Noticioso, Educativo, Hilo de Twitter, Guion para TikTok/Reels, Post corporativo para LinkedIn).
- **Spintax AI**: Capacidad de generar 50 versiones únicas de un mismo post para 50 páginas de Facebook distintas, burlando filtros de contenido duplicado (con ligeras variaciones de semántica, emojis, hashtags y longitud).

#### B. Módulo Avanzado de Bóveda y Carrusel de API Keys (Resiliencia Cognitiva)
- **Pool de API Keys**: El usuario no registra "una llave", registra un "pool" o "carrusel".
- **Healthchecks Cognitivos**: Un worker cron verifica el estado de las llaves (activa, rate-limited, sin créditos, gratuita/de pago, modelo soportado).
- **Fallback Automático (Cascada)**: Si falla GPT-4o por límite de saldo, el sistema baja a Claude 3.5 Sonnet, y si falla, a un modelo Open Source vía OpenRouter/Groq, garantizando que el pipeline de generación nunca se detenga.
- **Ruteo Inteligente**: Enviar prompts triviales a modelos baratos y prompts complejos (análisis de tendencias) a modelos premium.

#### C. Automatización Contextual y Trends
- **Escucha Activa (Social Listening Básica)**: Ingesta de RSS o APIs de noticias/tendencias para generar "Drafts" automáticos basados en lo que está pasando *ahora*.

---

## 3. Arquitectura Potenciada (Modern Stack 2024/2025)

1. **Frontend**: Next.js 14+ (App Router), TailwindCSS, shadcn/ui, Zustand (estado), React Query. Minimalista pero con dashboards analíticos ricos.
2. **Backend**: Node.js con NestJS (TypeScript estricto) o Go (para máxima concurrencia en la cola). Iremos con **Node.js (TypeScript)** con Clean Architecture para un equilibrio perfecto entre agilidad, tipado y ecosistema IA (LangChain/LlamaIndex).
3. **Base de Datos**: PostgreSQL 16 (con pgvector si a futuro guardamos embeddings de posts para evitar repetir contenido). Prisma ORM.
4. **Cache & Queues**: Redis + BullMQ. BullMQ es crítico para manejar las colas, rate limits, backoff exponencial, y colas separadas (cola de publicación vs cola de generación IA).
5. **Media & Storage**: S3 compatible (MinIO local para dev), procesado por ffmpeg/sharp en workers aislados (Docker).
6. **AI Orchestrator Module**: Implementación interna personalizada para el Carrusel de Keys y gestión de Prompts.

---

## 4. Nuevo Modelo de Entidades (Resumen de Impacto IA)

- `Workspace` -> `Organization` -> `User`
- `SocialAccount` (Credenciales OAuth, Rate Limit stats)
- `ContentCampaign` (La "Idea" semilla)
- `AIGenerationTask` (Job de IA para derivar la semilla en N posts)
- `Post` (El contenido concreto para una red, ligado a una SocialAccount)
- `AiProviderConfig` (Credenciales del proveedor, ej. OpenRouter)
- `AiKeyCarousel` (Agrupación y orden de prioridad de las keys)

---

## 5. Hoja de Ruta Inmediata (Código Inicial)

A continuación, construiré la estructura base de este sistema, demostrando el código arquitectónico para los módulos más complejos y novedosos:
1. Definición del `docker-compose.yml` (Postgres, Redis).
2. Base del Backend con TypeScript, estableciendo las interfaces de los adaptadores de Redes Sociales.
3. **Implementación del Módulo de Carrusel de API Keys (AI Key Manager)**, que demuestra la resiliencia y el fallback inteligente.
4. Módulo base para el orquestador de publicaciones.
