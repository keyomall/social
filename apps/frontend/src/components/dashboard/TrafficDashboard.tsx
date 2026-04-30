"use client";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gauge, ShieldAlert } from "lucide-react";
import { apiGet } from "@/lib/api-client";
import { HelpTooltip } from "@/components/ui/HelpTooltip";

interface QueueStatus {
  metrics: { waiting: number, active: number, completed: number, failed: number, delayed: number };
  limits: { safeDailyLimit: number, availableNow: number, status: string };
}

export function TrafficDashboard() {
  const [status, setStatus] = useState<QueueStatus | null>(null);
  const limits = status?.limits ?? { safeDailyLimit: 0, availableNow: 0, status: "UNKNOWN" };
  const metrics = status?.metrics ?? { waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0 };

  const fetchStatus = async () => {
    try {
      const data = await apiGet<QueueStatus>("/api/queue-status");
      setStatus(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!status) {
    return (
      <Card className="shadow-sm border-border/50 bg-card/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Gauge className="w-5 h-5 text-emerald-500" />
            Control de Tráfico (Anti-Ban)
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">Cargando estado de cola...</CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm border-border/50 bg-card/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gauge className="w-5 h-5 text-emerald-500" />
            Control de Tráfico (Anti-Ban)
            <HelpTooltip
              title="Control de Tráfico"
              description="Monitorea límites y cola para reducir bloqueos por automatización excesiva."
              example="Si el estado pasa a CRITICAL, reduce frecuencia y volumen de envíos."
            />
          </div>
          <Badge variant="outline" className={`
            ${limits.status === 'HEALTHY' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : ''}
            ${limits.status === 'WARNING' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : ''}
            ${limits.status === 'CRITICAL' ? 'bg-red-500/10 text-red-500 border-red-500/20 animate-pulse' : ''}
          `}>
            {limits.status}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-background border border-border/50 rounded-lg text-center">
            <p className="text-3xl font-bold font-mono text-foreground">{limits.availableNow}</p>
            <p className="text-xs text-muted-foreground mt-1">Límite Diario Restante</p>
          </div>
          <div className="p-3 bg-background border border-border/50 rounded-lg text-center">
            <p className="text-3xl font-bold font-mono text-foreground">{metrics.waiting + metrics.delayed}</p>
            <p className="text-xs text-muted-foreground mt-1">En Cola / Enfriando</p>
          </div>
        </div>
        
        <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg flex gap-3 items-start">
          <ShieldAlert className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
          <div className="text-xs text-muted-foreground leading-relaxed">
            <span className="font-semibold text-indigo-400 block mb-1">Protección de Cuenta Activa</span>
            El sistema está encolando con un <b>Backoff Exponencial</b> y añadiendo pausas orgánicas de enfriamiento (jitter) entre envíos para burlar los algoritmos Anti-Bot.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
