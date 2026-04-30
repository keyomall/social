# KERYX (SIAG) - Sistema Inteligente de Autopublicación Generativa

KERYX (núcleo SIAG) es un sistema industrial de publicación multicuenta para redes sociales, impulsado por Inteligencia Artificial y diseñado para la resiliencia y la viralidad.

## Características Principales
- 🧠 **Motor Generativo**: Transforma una idea simple (seed) en campañas enteras (hilos, posts virales, spintax).
- 🔄 **Carrusel de API Keys**: Rotación automática y fallback de proveedores de IA (OpenRouter, OpenAI) para garantizar cero interrupciones.
- 📦 **Arquitectura Modular**: Monorepo con separación clara entre Frontend (Next.js) y Backend (Node.js).
- 🎨 **UI Premium**: Interfaz minimalista, moderna y altamente modular.
- 🚀 **Automatización de Onboarding**: Configuración desatendida de credenciales y cuentas.

## Guía de Inicio Rápido

### Prerrequisitos
- Node.js (v20+)
- Redis (opcional en desarrollo, recomendado para colas reales)

### Instalación
1. Instalar dependencias del monorepo: `npm install`
2. Copiar variables de entorno: `cp .env.example .env` (en Windows PowerShell: `Copy-Item .env.example .env`)
2. Inicializar base de datos local (SQLite):
   ```bash
   cd apps/backend
   npx prisma generate
   npx prisma db push
   ```
3. Iniciar observabilidad opcional (LGTM):
   ```bash
   npm run obs:up
   ```
4. Iniciar el entorno de desarrollo global:
   ```bash
   npm run dev --workspaces --if-present
   ```
   En Windows, para recuperación automática (limpia puertos 3000/3001, sincroniza Prisma y levanta backend/frontend): `npm run dev:recover`

### ¿SQLite o PostgreSQL?
- **Uso personal / single-user**: SQLite es suficiente, más simple y con menor fricción operativa.
- **Multiusuario / alta concurrencia / despliegue cloud serio**: migrar a PostgreSQL.
- Estado actual del proyecto: la configuración activa usa **SQLite**.

## Integración Continua y Zero-Fricción
El frontend corre en el **puerto 3000** y el backend Express con Prisma corre en el **puerto 3001**.
El sistema usa base de datos real para llaves y posts (sin dependencia de mocks en el flujo principal). Para uso local se ejecuta con SQLite; Redis habilita colas reales cuando esté disponible.

## Experiencia de Usuario Premium
- Idioma por defecto en **español** con selector integrado (`Español/Inglés`) en la cabecera.
- Tour guiado modular para explicar las secciones principales del sistema.
- Tooltips contextuales con explicación y ejemplos prácticos.
- Módulo explícito de **IA y API Keys** en dashboard para alta/consulta de claves.

## Operación con RBAC Estricto
- Activar en backend: `ENFORCE_RBAC=true`.
- El frontend envía automáticamente `x-user-email` tras login (NextAuth credentials) y `x-organization-id` desde el store persistido.
- Si no hay sesión válida, el sistema muestra compuerta de login antes del onboarding.
- Arranque backend estricto (Windows): `npm run dev:backend:strict`

## Trazas OpenTelemetry
- Activar con:
- `OTEL_ENABLED=true`
- `OTEL_EXPORTER_OTLP_TRACES_ENDPOINT=http://localhost:4318/v1/traces`
- Levantar stack local: `npm run obs:up`
- Grafana local: `http://localhost:3002`

## E2E UI con Playwright
- Ejecutar: `npm run e2e`
- Cobertura actual: login -> onboarding -> generación/publicación -> dashboard/progreso.

## Verificación de Cierre
- Suite integral de madurez: `npm run verify:strict`
- Incluye: tests backend/frontend, Playwright E2E y build de producción.

## Documentación Técnica
Para una inmersión profunda en la arquitectura y directrices de desarrollo, consulte [docs/AI_CONTEXT.md](docs/AI_CONTEXT.md) y [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).
Para continuidad operativa inmediata y estado validado de cierre, consulte [docs/HANDOFF_OPERATIVO_2026-04-30.md](docs/HANDOFF_OPERATIVO_2026-04-30.md).
