# Handoff Operativo - 2026-04-30

## Objetivo
Entregar contexto tecnico completo, verificable y accionable para que cualquier desarrollador o IA retome el proyecto sin perdida de continuidad.

## Estado General Verificado
- Rama: `main` sincronizada con `origin/main`.
- Verificacion integral: `npm run verify:strict` en verde.
- Runtime validado con reinicio real:
- Backend en `http://localhost:3001` (modo estricto RBAC + OTEL).
- Frontend en `http://localhost:3000`.
- Espanol por defecto confirmado (`<html lang="es">`).
- RBAC estricto confirmado: endpoint protegido sin `x-user-email` responde `401`.
- Logo oficial disponible y servido en frontend: `/keryx-logo.png`.

## Auditoria de Residuos y Obsolescencia
- Busqueda en `apps/` y `docs/` de: `AuraSync|legacy|obsoleto|deprecated|TODO|FIXME|HACK`.
- Resultado: sin coincidencias funcionales pendientes.
- Residuo detectado y removido: `apps/frontend/test-results/.last-run.json`.
- Se restauro `apps/backend/prisma/dev.db` tras pruebas locales para evitar contaminacion del repo.

## Cambios de Documentacion Realizados en Este Cierre
- `docs/AI_CONTEXT.md` actualizado al estado real del stack y reglas operativas.
- `README.md` enlaza este handoff como referencia de continuidad.
- Este archivo consolida estado operativo, riesgos residuales y runbook rapido.

## Riesgos Residuales (No Bloqueantes)
- En modo dev pueden aparecer warnings de NextAuth si faltan:
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- No bloquea funcionamiento local validado, pero debe cerrarse para despliegues consistentes.

## Runbook de Continuidad (Siguiente Operador)
Opcion recomendada en Windows (arranque recuperable automatizado):
- `npm run dev:recover`

Esta opcion:
- libera puertos 3000/3001,
- sincroniza Prisma en backend,
- levanta backend estricto y frontend en terminales separadas.

Opcion manual:
1. Ejecutar `npm install`.
2. Copiar variables: `Copy-Item .env.example .env`.
3. Inicializar prisma backend:
- `cd apps/backend`
- `npx prisma generate`
- `npx prisma db push`
4. Volver a raiz y levantar:
- `npm run dev:backend:strict`
- `npm run dev --workspace frontend`
5. Validar salud:
- `GET http://localhost:3001/health` -> `200`.
- `GET http://localhost:3000` -> `200`.
6. Validar cierre de calidad:
- `npm run verify:strict`.

## Criterios de Aceptacion para No Romper Continuidad
- No mergear si `verify:strict` falla.
- No cambiar idioma por defecto de la UI (espanol).
- No introducir deuda silenciosa (`TODO/FIXME/HACK`) sin ticket y plan.
- No dejar artefactos locales (`test-results`, logs, cambios en `dev.db`) antes de cerrar.

## Mapa Rapido de Modulos Clave
- Frontend principal: `apps/frontend/src/app/page.tsx`.
- Layout y `lang=es`: `apps/frontend/src/app/layout.tsx`.
- i18n provider: `apps/frontend/src/components/providers/I18nProvider.tsx`.
- Login gate RBAC: `apps/frontend/src/components/auth/LoginGate.tsx`.
- Backend API central: `apps/backend/src/app.ts`.
- Prisma client compartido: `apps/backend/src/lib/prisma.ts`.
- Observabilidad backend: `apps/backend/src/telemetry.ts`.
