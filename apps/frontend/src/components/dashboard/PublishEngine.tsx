"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Sparkles, TrendingUp, RefreshCcw, Layers } from "lucide-react";

import { useConfigStore } from "@/store/useConfigStore";

export function PublishEngine() {
  const [seedIdea, setSeedIdea] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [variants, setVariants] = useState<string[]>([]);
  const [strategy, setStrategy] = useState<string>("viral");
  const { organizationId } = useConfigStore();

  const strategies = [
    { id: 'viral', name: 'Viral / Clickbait', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'thread', name: 'Hilo Educativo', icon: <Layers className="w-4 h-4" /> },
    { id: 'trend', name: 'Trending Topic', icon: <TrendingUp className="w-4 h-4" /> },
  ];

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch("http://localhost:3001/api/generate-and-publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seedIdea,
          targetCount: 3,
          pageId: "mock-page-id",
          organizationId
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Fallo en generación");
      }

      const data = await res.json();
      setVariants(data.variantsGenerated || []);
    } catch (err: any) {
      console.error(err);
      alert(`Error al generar: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Card className="shadow-sm border-border/50 bg-card/50">
        <CardHeader>
          <CardTitle className="text-lg">Idea Seed & Strategy</CardTitle>
          <CardDescription>Escribe una idea semilla y elige una estrategia.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Idea (Seed)</label>
            <Input 
              placeholder="Ej: Lanzamiento del nuevo iPhone..." 
              value={seedIdea}
              onChange={(e) => setSeedIdea(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Estrategia Viral</label>
            <div className="flex flex-wrap gap-2">
              {strategies.map((strat) => (
                <Button 
                  key={strat.id}
                  variant={strategy === strat.id ? "default" : "outline"}
                  className="justify-start gap-2"
                  onClick={() => setStrategy(strat.id)}
                >
                  {strat.icon} {strat.name}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-fit" 
            disabled={!seedIdea || isGenerating}
            onClick={handleGenerate}
          >
            {isGenerating ? <RefreshCcw className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
            Generar Spintax (AI)
          </Button>
        </CardFooter>
      </Card>

      <Card className="shadow-sm border-border/50 bg-background">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-500" />
            Resultados Generados (Spintax)
          </CardTitle>
          <CardDescription>Variantes listas para encolarse y publicarse en múltiples cuentas.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {variants.length === 0 ? (
            <div className="h-32 flex items-center justify-center border-2 border-dashed border-border rounded-lg bg-card/30">
              <p className="text-muted-foreground text-sm">Waiting for AI generation...</p>
            </div>
          ) : (
            variants.map((v, i) => (
              <div key={i} className="p-4 bg-card rounded-lg shadow-sm border border-border/50 flex justify-between items-start gap-4 hover:border-emerald-500/50 transition-colors group">
                <p className="text-sm text-foreground leading-relaxed">{v}</p>
                <Button size="sm" variant="secondary" className="shrink-0 gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500">
                  <Send className="w-3 h-3" /> Encolar
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
