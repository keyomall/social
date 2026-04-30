"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BrainCircuit, LineChart, Users, Eye, ArrowUpRight, Sparkles } from "lucide-react";
import { apiPost } from "@/lib/api-client";
import { HelpTooltip } from "@/components/ui/HelpTooltip";

export function ProfileAnalytics() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [diagnostic, setDiagnostic] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Mocks de perfiles conectados para la UI visual
  const profiles = [
    { id: 1, name: "Marca Global - Facebook", followers: "124K", engagement: "4.2%", reach: "1.2M", trend: "+12%" },
    { id: 2, name: "Startup Tech - LinkedIn", followers: "15K", engagement: "8.1%", reach: "300K", trend: "+25%" }
  ];

  const handleDiagnostic = async () => {
    setIsAnalyzing(true);
    setError(null);
    try {
      const data = await apiPost<{ recommendation: string }>("/api/analyze-profile", { profiles });
      setDiagnostic(data.recommendation);
    } catch (err: any) {
      setDiagnostic(null);
      setError(err.message || "No fue posible generar el diagnóstico.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 mt-8">
      <Card className="shadow-sm border-border/50 bg-card/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <LineChart className="w-5 h-5 text-emerald-500" />
            Análisis y Rendimiento de Perfiles
            <HelpTooltip
              title="Diagnóstico de Perfiles"
              description="Compara señales clave por perfil y genera recomendaciones estratégicas con IA."
              example="Pulsa 'Generar Diagnóstico IA' para obtener acciones sugeridas."
            />
          </CardTitle>
          <CardDescription>Visualiza el impacto de tus cuentas conectadas (Facebook, LinkedIn) y compara métricas clave.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profiles.map(p => (
              <div key={p.id} className="p-4 rounded-lg bg-background border border-border/50 space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-sm">{p.name}</h4>
                  <span className="text-xs text-emerald-500 flex items-center gap-1"><ArrowUpRight className="w-3 h-3"/> {p.trend}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-card/50 p-2 rounded">
                    <Users className="w-3 h-3 mx-auto mb-1 text-muted-foreground" />
                    <p className="font-bold">{p.followers}</p>
                    <p className="text-[10px] text-muted-foreground">Seguidores</p>
                  </div>
                  <div className="bg-card/50 p-2 rounded">
                    <LineChart className="w-3 h-3 mx-auto mb-1 text-muted-foreground" />
                    <p className="font-bold">{p.engagement}</p>
                    <p className="text-[10px] text-muted-foreground">Interacción</p>
                  </div>
                  <div className="bg-card/50 p-2 rounded">
                    <Eye className="w-3 h-3 mx-auto mb-1 text-muted-foreground" />
                    <p className="font-bold">{p.reach}</p>
                    <p className="text-[10px] text-muted-foreground">Alcance</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex-col items-start gap-4 bg-muted/20 pt-4 rounded-b-xl border-t border-border/50">
          <div className="w-full flex justify-between items-center">
            <div className="text-sm">
              <span className="font-medium">Inteligencia Estratégica: </span>
              <span className="text-muted-foreground">Permite que la IA de OpenRouter analice estos datos cruzados.</span>
            </div>
            <Button onClick={handleDiagnostic} disabled={isAnalyzing} className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
              {isAnalyzing ? <BrainCircuit className="w-4 h-4 animate-pulse" /> : <BrainCircuit className="w-4 h-4" />}
              {isAnalyzing ? "Analizando..." : "Generar Diagnóstico IA"}
            </Button>
          </div>
          
          {error && (
            <div className="w-full p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
              {error}
            </div>
          )}

          {diagnostic && (
            <div className="w-full p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-sm text-foreground leading-relaxed">
              <h5 className="font-bold text-indigo-400 mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Recomendación Estratégica
              </h5>
              <p>{diagnostic}</p>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
