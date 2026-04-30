# Contexto Arquitectónico y Directrices para IA (SIAG) - Estado Real 2026-04-30

## Propósito
Documento de continuidad para IA y desarrolladores humanos. Es la referencia de estado técnico vigente del repositorio.

## Stack Vigente (Producción Local Actual)
- **Frontend**: Next.js App Router, React 19, Zustand persist, NextAuth credentials.
- **Backend**: Node.js + TypeScript + Express + Prisma.
- **Persistencia activa**: SQLite (`apps/backend/prisma/dev.db`).
- **Colas**: BullMQ con Redis opcional; fallback directo activo para escenarios sin Redis.
- **Observabilidad**: OpenTelemetry OTLP + stack LGTM opcional.
- **Pruebas**: Node test (backend), Vitest (frontend), Playwright E2E.

## Estado Funcional Confirmado
- Idioma por defecto en español (`<html lang="es">`) con selector bilingue en UI.
- RBAC por organizacion en modo estricto cuando `ENFORCE_RBAC=true`.
- Flujo E2E principal operativo: login, onboarding, publicacion y dashboard.
- Endpoint de llaves IA operativo con listado enmascarado y control RBAC.

## Reglas de Operacion
1. **Fuente de verdad del estado operativo**: `docs/HANDOFF_OPERATIVO_2026-04-30.md`.
2. **Suite de cierre obligatoria**: `npm run verify:strict`.
3. **No introducir cambios sin validar runtime**: comprobar backend `:3001` y frontend `:3000`.
4. **Sin residuos en repo**: limpiar `test-results`, logs y restaurar `dev.db` antes de cerrar.
5. **No degradar i18n**: conservar espanol por defecto y selector `Espanol/Ingles`.

## Bootstrap y Recuperacion Rapida
Opcion recomendada en Windows:
- `npm run dev:recover`

La opcion recomendada limpia puertos, sincroniza Prisma y levanta backend/frontend automaticamente.

Opcion manual:
1. `npm install`
2. `Copy-Item .env.example .env` (PowerShell)
3. `cd apps/backend`
4. `npx prisma generate`
5. `npx prisma db push`
6. `cd ../..`
7. Backend estricto: `npm run dev:backend:strict`
8. Frontend: `npm run dev --workspace frontend`

## Variables de Entorno Criticas
- `ENFORCE_RBAC=true`: activa validacion de organizacion/usuario.
- `NEXT_PUBLIC_DEFAULT_USER_EMAIL`: contexto default para cliente API.
- `OTEL_ENABLED=true`: activa telemetria.
- `OTEL_EXPORTER_OTLP_TRACES_ENDPOINT=http://localhost:4318/v1/traces`: export de trazas.

## Notas para Continuidad
- `docs/ARCHITECTURE.md` y `docs/ANALYSIS_AND_VISION.md` contienen parte de vision evolutiva/historica; validar siempre contra este documento y el handoff operativo.
- Si aparece divergencia entre documentos, priorizar el estado verificado por pruebas y runtime.
