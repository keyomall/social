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
- Redis (opcional en desarrollo, recomendado para colas reales)

### Instalación
1. Instalar dependencias del monorepo: `npm install`
2. Inicializar base de datos local (SQLite):
   ```bash
   cd apps/backend
   npx prisma generate
   npx prisma db push
   ```
3. Iniciar el entorno de desarrollo global:
   ```bash
   npm run dev --workspaces --if-present
   ```

### ¿SQLite o PostgreSQL?
- **Uso personal / single-user**: SQLite es suficiente, más simple y con menor fricción operativa.
- **Multiusuario / alta concurrencia / despliegue cloud serio**: migrar a PostgreSQL.
- Estado actual del proyecto: la configuración activa usa **SQLite**.

## Integración Continua y Zero-Fricción
El frontend corre en el **puerto 3000** y el backend Express con Prisma corre en el **puerto 3001**.
El sistema usa base de datos real para llaves y posts (sin dependencia de mocks en el flujo principal). Para uso local se ejecuta con SQLite; Redis habilita colas reales cuando esté disponible.

## Documentación Técnica
Para una inmersión profunda en la arquitectura y directrices de desarrollo, consulte [docs/AI_CONTEXT.md](docs/AI_CONTEXT.md) y [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).
