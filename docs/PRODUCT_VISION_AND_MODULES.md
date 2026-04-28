# AuraSync: Especificación Funcional y Arquitectura Cognitiva

## 1. El Propósito (Visión)
AuraSync no es un publicador pasivo. Es un **Motor Generativo de Autopublicación (Generative Publishing Engine)**. Su misión es tomar una "Idea Semilla" y, mediante algoritmos de inteligencia artificial, re-empaquetarla, variarla (spintax) y distribuirla a través de múltiples cuentas sin penalizaciones por spam, manteniendo la resiliencia absoluta de la conexión.

## 2. Los Módulos Centrales

### 2.1 AI Vault & Key Carousel (El Corazón Resiliente)
* **Función:** Maneja las credenciales de los LLMs.
* **Lógica:** Implementa el patrón "Circuit Breaker" y "Fallback". Si OpenRouter falla por límite de peticiones (429) o falta de saldo (402), el sistema marca la llave como `Exhausted` y automáticamente redirige el tráfico a la siguiente llave (ej. OpenAI o Anthropic). Garantiza que el pipeline de generación nunca se detenga.

### 2.2 Generative Engine (Motor de Spintax y Variación)
* **Función:** Genera contenido original.
* **Algoritmos Inteligentes:**
  - **Spintax AI**: En lugar de hacer Spintax de diccionarios (anticuado), inyecta el contexto a un modelo de lenguaje con la orden: *"Genera 5 variantes semánticamente únicas del mismo mensaje, alterando la sintaxis, los emojis y los llamados a la acción, pero preservando el core intent."*
  - **Prompt Strategies**: Plantillas pre-compiladas (Viral, Trend, Hilo). Cada estrategia altera la "temperatura" y el "system prompt" del modelo.

### 2.3 Publish Queue (Scheduler BullMQ)
* **Función:** Orquestador de salida.
* **Lógica:** Implementa "Backoff Exponencial". Si Facebook rechaza un post por Rate Limit, el worker encola de nuevo el trabajo esperando 2 segundos, luego 4, luego 8, etc. Esto asegura compliance estricto con las políticas de las redes.

### 2.4 Social Adapters (Soporte Multimedia)
* **Función:** Capa de abstracción. AuraSync nunca habla con Facebook. AuraSync habla con la interfaz `ISocialAdapter`, enviándole el payload estandarizado (`RichTextSegment`, `MediaAsset`). El Adaptador traduce esto a la API específica.

## 3. Seguimiento de Publicaciones y Modificaciones
El estado de la base de datos (modelo `Post`) contempla `DRAFT`, `SCHEDULED`, `PUBLISHED`, `FAILED`. 
Cualquier post en estado `DRAFT` o `SCHEDULED` puede ser modificado por el usuario mediante el UI (módulo *Campaign Tracking*). Una vez que pasa a la cola de BullMQ (cuando el tiempo coincide), se bloquea. Si falla, regresa a un estado manejable o se reintenta automáticamente.

## 4. Ventajas frente a la Competencia (Hootsuite, Buffer)
1. **Inteligencia Nativa, no como Add-on**: Las herramientas tradicionales agregaron un botón de "Generar con IA". AuraSync tiene la IA en el centro del flujo de trabajo (Generación Masiva -> Rotación de Keys -> Spintax).
2. **Spintax Semántico Automatizado**: Publicar el mismo mensaje en 5 páginas te hace shadowban. AuraSync genera 5 mensajes únicos que dicen lo mismo, programándolos al instante.
3. **Resiliencia Extrema (Military Grade)**: Si cae la API de IA, AuraSync cambia de proveedor en nanosegundos sin intervención humana.

## 5. Roadmap Hacia el Grado Militar Mundial (The "Anti-Ban" Architecture)
Para evitar que el sistema sea etiquetado como "Botnet" por Meta, X o TikTok, el roadmap de AuraSync requiere implementar las tácticas de las herramientas de *Guerilla Marketing* y agencias globales:

1. **Proxy Rotation & IP Anchoring:**
   - **Problema:** Si 50 posts salen desde la misma IP del datacenter (AWS/DigitalOcean), se banea el cluster de cuentas.
   - **Solución AuraSync:** Modificar `ISocialAdapter` para que requiera un objeto `ProxyConfig`. Cada cuenta social se amarra a un proxy residencial geolocalizado. 
2. **Account Warm-up Algorithms:**
   - **Problema:** Las cuentas jóvenes mueren por publicar agresivamente.
   - **Solución AuraSync:** Implementar en `BullMQ` un *Ramp-up Scheduler*. Si la cuenta es nivel 1 (nueva), solo publica 1 vez al día. A los 30 días sube a nivel 2.
3. **App Review Compliance (OAuth 2.0 Strict):**
   - **Problema:** Robo o invalidación de tokens continuos.
   - **Solución:** Implementar un flujo "Headless OAuth" o solicitar formalmente permisos como `pages_read_engagement`, `pages_manage_posts` con Meta Business Verification.
