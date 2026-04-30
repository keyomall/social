param(
  [switch]$SkipInstall
)

$ErrorActionPreference = "Stop"

function Write-Step {
  param([string]$Message)
  Write-Host "[KERYX/SIAG] $Message" -ForegroundColor Cyan
}

function Stop-Port {
  param([int]$Port)

  $conns = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
  foreach ($conn in $conns) {
    try {
      Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue
      Write-Step "Puerto $Port liberado (PID $($conn.OwningProcess))."
    } catch {
      Write-Step "No se pudo cerrar PID $($conn.OwningProcess) en puerto $Port."
    }
  }
}

$root = Resolve-Path "$PSScriptRoot\.."
Set-Location $root

Write-Step "Iniciando arranque recuperable."
Stop-Port -Port 3000
Stop-Port -Port 3001

if (-not $SkipInstall) {
  Write-Step "Instalando dependencias de monorepo."
  npm install
}

Write-Step "Sincronizando Prisma en backend."
Set-Location "$root\apps\backend"
npx prisma generate
npx prisma db push --accept-data-loss
npm run seed:admin
Set-Location $root

Write-Step "Levantando backend estricto en nueva terminal."
Start-Process powershell -ArgumentList @(
  "-NoExit",
  "-NoProfile",
  "-ExecutionPolicy", "Bypass",
  "-Command", "cd '$root'; npm run dev:backend:strict"
) | Out-Null

Write-Step "Levantando frontend en nueva terminal."
Start-Process powershell -ArgumentList @(
  "-NoExit",
  "-NoProfile",
  "-ExecutionPolicy", "Bypass",
  "-Command", "cd '$root'; npm run dev --workspace frontend"
) | Out-Null

Write-Step "Arranque enviado. Verifica:"
Write-Step "- Frontend: http://localhost:3000"
Write-Step "- Backend: http://localhost:3001/health"
