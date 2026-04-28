"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Sparkles, TrendingUp, RefreshCcw, Layers } from "lucide-react";

export function PublishEngine() {
  const [seedIdea, setSeedIdea] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [variants, setVariants] = useState<string[]>([]);
  const [strategy, setStrategy] = useState<string>("viral");

  const strategies = [
    { id: 'viral', name: 'Viral / Clickbait', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'thread', name: 'Hilo Educativo', icon: <Layers className="w-4 h-4" /> },
    { id: 'trend', name: 'Trending Topic', icon: <TrendingUp className="w-4 h-4" /> },
  ];

  const handleGenerate = () => {
    setIsGenerating(true);
    // Simula la llamada al AI Orchestrator (PromptStrategy + AiKeyCarousel)
    setTimeout(() => {
      setVariants([
        `🔥 ¡NO VAS A CREER ESTO! 😱 La verdad sobre: ${seedIdea}. Hilo 🧵👇`,
        `🚨 ÚLTIMA HORA: Todo lo que necesitas saber de ${seedIdea}. ¡Cambiaron las reglas! 🤯`,
        `💡 Hack de vida revelado: ¿Cómo dominar ${seedIdea} en 2026? Te lo cuento en 3 pasos rápidos. 🚀`
      ]);
      setIsGenerating(false);
    }, 2500);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="md:col-span-1 shadow-sm border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg">Motor Generativo</CardTitle>
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
            <div className="flex flex-col gap-2">
              {strategies.map((strat) => (
                <Button 
                  key={strat.id}
                  variant={strategy === strat.id ? "default" : "outline"}
                  className="w-full justify-start gap-2"
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
            className="w-full" 
            disabled={!seedIdea || isGenerating}
            onClick={handleGenerate}
          >
            {isGenerating ? <RefreshCcw className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
            Generar Spintax
          </Button>
        </CardFooter>
      </Card>

      <Card className="md:col-span-2 shadow-sm border-slate-200 bg-slate-50/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-500" />
            Resultados (Spintax AI)
          </CardTitle>
          <CardDescription>Variantes listas para encolarse y publicarse en múltiples cuentas.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {variants.length === 0 ? (
            <div className="h-40 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-lg">
              <p className="text-slate-400 text-sm">Esperando generación...</p>
            </div>
          ) : (
            variants.map((v, i) => (
              <div key={i} className="p-4 bg-white rounded-lg shadow-sm border border-slate-200 flex justify-between items-start gap-4 hover:border-emerald-200 transition-colors">
                <p className="text-sm text-slate-700 leading-relaxed">{v}</p>
                <Button size="sm" variant="secondary" className="shrink-0 gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700">
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
