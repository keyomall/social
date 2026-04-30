# Observabilidad (Fase 2)

Stack recomendado para desarrollo y pruebas:
- Grafana + Prometheus + Loki + Tempo en una sola imagen (`grafana/otel-lgtm`)
- Puerto UI Grafana: `3002`
- OTLP gRPC: `4317`
- OTLP HTTP: `4318`

## Arranque rápido

```bash
docker compose -f infrastructure/observability/docker-compose.yml up -d
```

Abrir:
- Grafana: `http://localhost:3002`
- Usuario: `admin`
- Password: `admin`

## Uso sugerido en backend

- Mantener logging estructurado JSON con `x-request-id`.
- Siguiente iteración:
- Exportar trazas OpenTelemetry del backend.
- Agregar métricas custom de colas/publicación por plataforma.
- Correlacionar logs + trazas para diagnóstico de fallos en adapters.
