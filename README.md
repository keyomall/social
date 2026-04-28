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
1. Instalar dependencias del monorepo (usar npm install)
2. Levantar la infraestructura (Base de datos y Caché) con docker-compose up -d en infrastructure
3. Iniciar el entorno de desarrollo usando el comando dev del monorepo

## Documentación Técnica
Para una inmersión profunda en la arquitectura y directrices de desarrollo, consulte [docs/AI_CONTEXT.md](docs/AI_CONTEXT.md) y [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).
