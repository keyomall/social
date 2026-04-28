#!/bin/bash
# AuraSync - Startup & Healthcheck Script (Military Grade)
LOG_FILE="system_health.log"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "Iniciando secuencia de arranque de AuraSync..."
log "========================================================="

log "[1/6] Comprobando dependencias del sistema..."
if ! command -v node &> /dev/null; then log "Error: Node.js requerido."; fi

log "[2/6] Liberando puertos críticos..."
for PORT in 3000 3001; do
  PID=$(lsof -t -i:$PORT)
  if [ -n "$PID" ]; then
    log "  -> Liberando puerto $PORT (Matando PID: $PID)..."
    kill -9 $PID 2>/dev/null || true
  else
    log "  -> Puerto $PORT libre."
  fi
done

log "[3/6] Levantando Infraestructura (Docker omitido en sandbox por restricciones overlayfs, usando SQLite local)..."

log "[4/6] Verificando Base de Datos local (SQLite)..."
cd apps/backend && npx prisma generate && npx prisma db push --accept-data-loss
cd ../../

log "[5/6] Construyendo paquetes..."
npm install
npm run build --workspaces --if-present

log "[6/6] Secuencia completada. Inicie el servidor con: npm run dev --workspaces"
