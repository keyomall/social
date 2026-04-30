"use client";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Server, Database, BrainCircuit, Activity } from "lucide-react";
import { motion } from "framer-motion";
import { apiGet } from "@/lib/api-client";
import { HelpTooltip } from "@/components/ui/HelpTooltip";

export function SystemHealth() {
  const [checks, setChecks] = useState([
    { id: 'web', name: 'Servidor Frontend', status: 'pending', icon: <Server className="w-4 h-4" /> },
    { id: 'api', name: 'API Express (:3001)', status: 'pending', icon: <Activity className="w-4 h-4" /> },
    { id: 'db', name: 'Base de Datos (Prisma)', status: 'pending', icon: <Database className="w-4 h-4" /> },
    { id: 'ai', name: 'Carrusel de Claves IA', status: 'pending', icon: <BrainCircuit className="w-4 h-4" /> }
  ]);

  useEffect(() => {
    const runChecks = async () => {
      const next = [...checks];

      next[0].status = "ok";

      try {
        await apiGet<{ ok: boolean }>("/health");
        next[1].status = "ok";
      } catch {
        next[1].status = "fail";
      }

      try {
        const queue = await apiGet<{ metrics?: unknown }>("/api/queue-status");
        next[2].status = queue && typeof queue === "object" ? "ok" : "fail";
      } catch {
        next[2].status = "fail";
      }

      try {
        const progress = await apiGet<{ success: boolean }>("/api/project-progress");
        next[3].status = progress.success ? "ok" : "fail";
      } catch {
        next[3].status = "fail";
      }

      setChecks(next);
    };
    runChecks();
  }, []);

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <span className="text-muted-foreground flex items-center gap-2">
            Diagnóstico del Sistema
            <HelpTooltip
              title="Estado Operativo"
              description="Verifica backend, base de datos y rutas críticas para detectar incidencias en tiempo real."
              example="Si aparece INCIDENCIAS, revisa primero API y cola de publicación."
            />
          </span>
          {checks.every(c => c.status === 'ok') ? (
             <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">OPERATIVO</Badge>
          ) : checks.some(c => c.status === "fail") ? (
             <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/20">INCIDENCIAS</Badge>
          ) : (
             <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20 animate-pulse">INICIANDO...</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {checks.map((check, i) => (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            key={check.id} 
            className="flex items-center justify-between p-2 rounded-md bg-background/50 border border-border/50"
          >
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">{check.icon}</span>
              <span>{check.name}</span>
            </div>
            {check.status === 'pending' ? (
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
            ) : check.status === "fail" ? (
              <span className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
            ) : (
              <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            )}
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}
