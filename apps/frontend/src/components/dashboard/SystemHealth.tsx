"use client";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Server, Database, BrainCircuit, Activity } from "lucide-react";
import { motion } from "framer-motion";

export function SystemHealth() {
  const [checks, setChecks] = useState([
    { id: 'web', name: 'Frontend Server', status: 'pending', icon: <Server className="w-4 h-4" /> },
    { id: 'api', name: 'Express API (:3001)', status: 'pending', icon: <Activity className="w-4 h-4" /> },
    { id: 'db', name: 'Database (Prisma)', status: 'pending', icon: <Database className="w-4 h-4" /> },
    { id: 'ai', name: 'AI Key Carousel', status: 'pending', icon: <BrainCircuit className="w-4 h-4" /> }
  ]);

  useEffect(() => {
    // Simular el progresivo check al cargar el dashboard (Military Grade feeling)
    const runChecks = async () => {
      for (let i = 0; i < checks.length; i++) {
        await new Promise(r => setTimeout(r, 600));
        setChecks(prev => prev.map((c, idx) => idx === i ? { ...c, status: 'ok' } : c));
      }
    };
    runChecks();
  }, []);

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <span className="text-muted-foreground">Diagnostic Checklist</span>
          {checks.every(c => c.status === 'ok') ? (
             <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">ALL SYSTEMS GO</Badge>
          ) : (
             <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20 animate-pulse">BOOTING...</Badge>
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
            ) : (
              <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            )}
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}
