"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiGet } from "@/lib/api-client";
import { HelpTooltip } from "@/components/ui/HelpTooltip";

interface ProgressItem {
  id: string;
  name: string;
  status: "done" | "partial" | "pending";
  weight: number;
}

interface ProgressCategory {
  id: string;
  name: string;
  score: number;
  items: ProgressItem[];
}

interface ProjectProgressReport {
  overallScore: number;
  maturityLevel: string;
  completedWeight: number;
  totalWeight: number;
  categories: ProgressCategory[];
  nextPriorities: string[];
}

export function ProjectProgress() {
  const [report, setReport] = useState<ProjectProgressReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await apiGet<{ success: boolean; report: ProjectProgressReport }>("/api/project-progress");
        setReport(response.report);
      } catch (err: any) {
        setError(err.message || "No se pudo cargar progreso del proyecto.");
      }
    };
    load();
  }, []);

  if (error) {
    return (
      <Card className="shadow-sm border-border/50 bg-card/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            Progreso del Proyecto
            <HelpTooltip
              title="Madurez del Sistema"
              description="Mide avance por categorías y muestra la prioridad técnica inmediata."
              example="Si la prioridad es 'OAuth por plataforma', ese es el siguiente cierre recomendado."
            />
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-red-400">{error}</CardContent>
      </Card>
    );
  }

  if (!report) {
    return (
      <Card className="shadow-sm border-border/50 bg-card/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            Progreso del Proyecto
            <HelpTooltip
              title="Madurez del Sistema"
              description="Mide avance por categorías y muestra la prioridad técnica inmediata."
            />
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground">Calculando avance...</CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm border-border/50 bg-card/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            Progreso del Proyecto
            <HelpTooltip
              title="Lectura del Progreso"
              description="El porcentaje global resume estabilidad técnica, cobertura y operación."
              example="80%+ indica base sólida; enfoca mejoras en la prioridad actual."
            />
          </span>
          <Badge variant="outline">{report.maturityLevel}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-muted-foreground">Avance global</span>
            <span className="font-semibold">{report.overallScore}%</span>
          </div>
          <div className="h-2 rounded bg-muted overflow-hidden">
            <div className="h-full bg-emerald-500 transition-all" style={{ width: `${report.overallScore}%` }} />
          </div>
        </div>

        {report.categories.map((category) => (
          <div key={category.id}>
            <div className="flex items-center justify-between text-xs mb-1">
              <span>{category.name}</span>
              <span className="text-muted-foreground">{category.score}%</span>
            </div>
            <div className="h-1.5 rounded bg-muted overflow-hidden">
              <div className="h-full bg-indigo-500/80" style={{ width: `${category.score}%` }} />
            </div>
          </div>
        ))}

        <div className="text-[11px] text-muted-foreground leading-relaxed pt-1 border-t border-border/40">
          Prioridad actual: {report.nextPriorities[0]}
        </div>
      </CardContent>
    </Card>
  );
}
