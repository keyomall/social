# Arquitectura del Sistema Inteligente de Autopublicación Generativa (SIAG)

> Nota de vigencia: este documento mezcla arquitectura actual y visión evolutiva. Para estado operativo confirmado, use `docs/HANDOFF_OPERATIVO_2026-04-30.md` y `docs/AI_CONTEXT.md`.

## Diagrama Lógico de Arquitectura

El sistema se divide en las siguientes capas y componentes modulares:

### 1. Capa de Presentación y Acceso (Frontend)
- **Web App (Next.js)**: Interfaz de usuario para gestionar workspaces, campañas, redactar ideas (seeds), visualizar calendarios y configurar bóvedas de IA.
- **API Gateway / BFF**: Capa que enruta las solicitudes del frontend hacia los microservicios o el monolito modular backend. Gestiona la autenticación de usuarios (JWT/OAuth).

### 2. Capa de Dominio / Core Backend (Node.js/TypeScript)
*El corazón del sistema. Implementado con Clean Architecture y DDD (Domain-Driven Design).*

- **Identity & Access Management (IAM)**:
  - Gestiona Usuarios, Roles, Organizaciones y Workspaces.
- **Campaign & Post Manager**:
  - Core CRUD de ideas, campañas y posts.
  - Gestión de calendarios.
- **Social Connectors Module (Adapter Pattern)**:
  - Un adaptador unificado `ISocialAdapter` implementado por `FacebookAdapter`, `InstagramAdapter`, `TikTokAdapter`, `TwitterAdapter`, etc.
  - Se encarga de la comunicación OAuth y del formato específico del payload para cada red.
- **AI Orchestrator (Nuevo)**:
  - **Prompt Strategy Engine**: Plantillas para transformar semillas (seeds) en posts optimizados (clicbait, hilo, informativo, etc.).
  - **Spintax Engine**: Generación de mutaciones y variaciones del texto.
- **Secrets & AI Vault (Nuevo)**:
  - Almacena de forma segura (AES-256) las API Keys de redes sociales y de proveedores de IA.
  - **Key Carousel Manager**: Administra las prioridades y fallbacks de las API keys de IA.

### 3. Capa de Asincronía y Workers (BullMQ + Redis)
*Para resiliencia y tareas pesadas.*

- **Publishing Queue**: Gestiona el encolado de posts. Aplica retry logic (backoff exponencial) en caso de fallos de API de las redes. Respeta los Rate Limits.
- **AI Generation Queue**: Tareas asíncronas para llamar a OpenAI/OpenRouter. Utiliza el *Key Carousel*.
- **Media Processing Queue**: Redimensionamiento, compresión y transcodificación de imágenes/video (ffmpeg/sharp).

### 4. Capa de Persistencia e Infraestructura
- **PostgreSQL**: Datos relacionales (usuarios, posts, cuentas, configuración de IA).
- **Redis**: Rate limiting, caché, estado del carrusel de llaves, colas (BullMQ).
- **Object Storage (S3 / MinIO)**: Almacenamiento de fotos, videos temporales y definitivos.

## Flujo de Datos Hacia la IA (Generación y Publicación Viral)

1. El usuario crea una **Content Seed** (ej. "Lanzamos nuestra nueva feature de IA para marketing").
2. Elige una **Estrategia** ("Hilo de Twitter viral", "Post LinkedIn profesional", "Spintax para 5 grupos de FB").
3. El frontend envía la solicitud al **AI Orchestrator**.
4. El orquestador solicita una API Key válida al **Key Carousel Manager**.
5. El *Carousel* verifica su pool de llaves, toma la principal. Si la principal tiene error de saldo o límite, hace fallback a la siguiente llave disponible.
6. Se realiza la llamada al LLM (ej. OpenRouter).
7. Se devuelve el contenido generado (los N posts).
8. El usuario (o el sistema automáticamente, si está configurado así) aprueba los posts.
9. Se programan en el **Scheduler** (Publishing Queue).
10. El Worker de publicación toma el job, invoca al **Social Adapter** correspondiente y publica, controlando errores y rate limits.

---
**Principios:**
- *Robustez*: Todo proceso que hable con el mundo exterior (APIs) va a una cola.
- *Extensibilidad*: Nuevos modelos de IA o nuevas redes sociales son solo una nueva clase que implementa una interfaz, sin tocar el core.
- *Resiliencia*: Si una API key cae, el sistema sigue funcionando. Si una red cae, el mensaje se reintenta.
