# Contexto Arquitectónico y Directrices para IA (SIAG) - V1.0.0

## Propósito
Este documento está diseñado para ser ingerido por cualquier modelo de Inteligencia Artificial o desarrollador humano que necesite retomar, extender o debuggear este proyecto. Contiene la "memoria muscular" del sistema.

## Estado del Ecosistema (Abril 2026)
- **Frontend**: Next.js (App Router), React, Zustand (estado), TailwindCSS v4+, shadcn/ui (componentes modulares de UI).
- **Backend**: Node.js (TypeScript), Express (en transición a microservicios/Go si es necesario), BullMQ para colas, Redis para caché y estado, PostgreSQL para persistencia.
- **Enfoque Principal**: Autopublicación generativa. El sistema no es pasivo; inyecta inteligencia generativa (IA) para derivar contenido, variar publicaciones (spintax) y gestionar fallbacks de API keys (Carrusel de Llaves).

## Patrones de Diseño Implementados
1. **Monorepo**: Gestionado vía npm workspaces (`apps/*`, `packages/*`).
2. **Clean Architecture / DDD**: Separación estricta en el backend (`domain`, `infrastructure`, `presentation`).
3. **Adapter Pattern**: Toda red social es un adaptador que implementa `ISocialAdapter`. El core del sistema JAMÁS conoce detalles específicos de Facebook o Twitter.
4. **Resilience Strategy**: El `AiKeyCarousel` gestiona la rotación de API keys si una falla (rate limit, saldo agotado).
5. **Componentes UI Modulares**: El frontend utiliza un sistema de diseño estricto, con módulos dedicados hasta para el elemento más pequeño (ej. Tooltips).

## Instrucciones de Recuperación (Recovery & Bootstrap)
Si el sistema colapsa o se requiere un setup en un entorno limpio:
1. Clona el repositorio.
2. Ejecuta `npm install` en la raíz.
3. Levanta la infraestructura local: `docker-compose -f infrastructure/docker-compose.yml up -d`
4. Ejecuta el entorno de desarrollo: `npm run dev --workspaces --if-present`

## Flujos Críticos a Proteger
- **Onboarding Automático**: El usuario provee sus keys (OAuth o API), el sistema las valida en background y autoconfigura el `AiKeyCarousel` y los `SocialAdapters`.
- **Generación Viral**: El `PromptStrategyEngine` toma una "seed" y la transforma en N variaciones usando las mejores prácticas de retención de atención.

## Reglas de Integración Continua (Military Grade Quality Control)
- Cero advertencias en TypeScript.
- Cero dependencias obsoletas conocidas (se debe auditar regularmente).
- El código redundante debe ser abstraído en `packages/core` o refactorizado inmediatamente.
