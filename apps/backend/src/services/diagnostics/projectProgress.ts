export interface ProgressItem {
  id: string;
  name: string;
  status: "done" | "partial" | "pending";
  weight: number;
}

export interface ProgressCategory {
  id: string;
  name: string;
  score: number;
  items: ProgressItem[];
}

export interface ProjectProgressReport {
  overallScore: number;
  maturityLevel: string;
  completedWeight: number;
  totalWeight: number;
  categories: ProgressCategory[];
  nextPriorities: string[];
}

function scoreFromItems(items: ProgressItem[]): number {
  let completed = 0;
  let total = 0;

  for (const item of items) {
    total += item.weight;
    if (item.status === "done") completed += item.weight;
    if (item.status === "partial") completed += item.weight * 0.5;
  }

  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

function maturityFromScore(score: number): string {
  if (score >= 85) return "Avanzado / casi enterprise";
  if (score >= 70) return "MVP avanzado";
  if (score >= 50) return "MVP funcional";
  return "Inicial";
}

export function generateProjectProgressReport(params: { redisOperational: boolean }): ProjectProgressReport {
  const categories: ProgressCategory[] = [
    {
      id: "core",
      name: "Core Backend",
      items: [
        { id: "routes", name: "Rutas API principales", status: "done", weight: 3 },
        { id: "publish-states", name: "Estados reales de publicación", status: "done", weight: 3 },
        { id: "queue-fallback", name: "Fallback sin Redis", status: "done", weight: 3 },
        { id: "strict-validation", name: "Validación de payload robusta", status: "partial", weight: 2 },
      ],
      score: 0,
    },
    {
      id: "integrations",
      name: "Integraciones",
      items: [
        { id: "ai", name: "Generación IA con rotación de llaves", status: "done", weight: 3 },
        { id: "social-adapters", name: "Adapters sociales productivos", status: "partial", weight: 4 },
        { id: "webhooks", name: "Ingesta real de webhooks", status: "pending", weight: 3 },
      ],
      score: 0,
    },
    {
      id: "quality",
      name: "Calidad y Testing",
      items: [
        { id: "backend-tests", name: "Pruebas backend", status: "partial", weight: 3 },
        { id: "frontend-tests", name: "Pruebas frontend", status: "pending", weight: 3 },
        { id: "build", name: "Build estable", status: "done", weight: 2 },
      ],
      score: 0,
    },
    {
      id: "operations",
      name: "Operación",
      items: [
        { id: "health", name: "Healthcheck backend", status: "done", weight: 2 },
        { id: "redis", name: "Redis operativo", status: params.redisOperational ? "done" : "partial", weight: 3 },
        { id: "observability", name: "Observabilidad (logs/traces/métricas)", status: "partial", weight: 3 },
      ],
      score: 0,
    },
  ];

  let completedWeight = 0;
  let totalWeight = 0;

  for (const category of categories) {
    category.score = scoreFromItems(category.items);
    for (const item of category.items) {
      totalWeight += item.weight;
      if (item.status === "done") completedWeight += item.weight;
      if (item.status === "partial") completedWeight += item.weight * 0.5;
    }
  }

  const overallScore = totalWeight === 0 ? 0 : Math.round((completedWeight / totalWeight) * 100);

  return {
    overallScore,
    maturityLevel: maturityFromScore(overallScore),
    completedWeight,
    totalWeight,
    categories,
    nextPriorities: [
      "Completar adapters con credenciales OAuth reales por red",
      "Agregar suite de pruebas frontend y e2e",
      "Añadir observabilidad unificada (métricas, logs y trazas)",
      "Implementar ingestión de webhooks para analytics reales",
    ],
  };
}
