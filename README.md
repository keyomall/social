# SIAG - Sistema Inteligente de Autopublicación Generativa

SIAG es un sistema industrial de publicación multicuenta para redes sociales, impulsado por Inteligencia Artificial y diseñado para la resiliencia y la viralidad.

## Características Principales
- 🧠 **Motor Generativo**: Transforma una idea simple (seed) en campañas enteras (hilos, posts virales, spintax).
- 🔄 **Carrusel de API Keys**: Rotación automática y fallback de proveedores de IA (OpenRouter, OpenAI) para garantizar cero interrupciones.
- 📦 **Arquitectura Modular**: Monorepo con separación clara entre Frontend (Next.js) y Backend (Node.js).
- 🎨 **UI Premium**: Interfaz minimalista, moderna y altamente modular.
- 🚀 **Automatización de Onboarding**: Configuración desatendida de credenciales y cuentas.

## Guía de Inicio Rápido

### Prerrequisitos
- Node.js (v20+)
- Docker y Docker Compose

### Instalación
1. Instalar dependencias del monorepo: `npm install`
2. Levantar la infraestructura (PostgreSQL, Redis):
   ```bash
   docker compose -f infrastructure/docker-compose.yml up -d
   ```
3. Inicializar Base de Datos (Prisma):
   ```bash
   cd apps/backend
   npx prisma generate
   npx prisma db push
   ```
4. Iniciar el entorno de desarrollo global:
   ```bash
   npm run dev --workspaces --if-present
   ```

## Integración Continua y Zero-Fricción
El frontend corre en el **puerto 3000** y el backend Express con Prisma corre en el **puerto 3001**.
El sistema ya **NO utiliza mocks** para la lógica principal: requiere la base de datos para almacenar y usar el Carrusel de Llaves de IA y registrar los posts. Asegúrese de que PostgreSQL y Redis estén disponibles antes de arrancar.

## Documentación Técnica
Para una inmersión profunda en la arquitectura y directrices de desarrollo, consulte [docs/AI_CONTEXT.md](docs/AI_CONTEXT.md) y [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).
