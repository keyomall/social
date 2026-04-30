"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { KeyRound, RefreshCcw } from "lucide-react";
import { apiGet, apiPost } from "@/lib/api-client";
import { useConfigStore } from "@/store/useConfigStore";
import { HelpTooltip } from "@/components/ui/HelpTooltip";

type AiKeyListItem = {
  id: string;
  provider: string;
  isActive: boolean;
  createdAt: string;
  maskedKey: string;
};

export function AiKeysModule() {
  const { organizationId } = useConfigStore();
  const [provider, setProvider] = useState<"OPENROUTER" | "DEEPSEEK">("OPENROUTER");
  const [apiKey, setApiKey] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [keys, setKeys] = useState<AiKeyListItem[]>([]);

  const providerHint = useMemo(
    () => (provider === "OPENROUTER" ? "sk-or-v1-..." : "sk-..."),
    [provider],
  );

  const loadKeys = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiGet<{ success: boolean; keys: AiKeyListItem[] }>(
        `/api/keys?organizationId=${encodeURIComponent(organizationId)}`,
      );
      setKeys(Array.isArray(data.keys) ? data.keys : []);
    } catch (err: any) {
      setError(err.message || "No se pudo cargar el módulo de API Keys.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadKeys();
  }, [organizationId]);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      await apiPost<{ success: boolean; keyId: string }>("/api/keys", {
        provider,
        apiKey,
        organizationId,
      });
      setApiKey("");
      await loadKeys();
    } catch (err: any) {
      setError(err.message || "No se pudo guardar la API Key.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="shadow-sm border-border/50 bg-card/50">
      <CardHeader className="space-y-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-indigo-500" />
          Módulo IA y API Keys
          <HelpTooltip
            title="Gestión de Proveedores IA"
            description="Registra y valida claves de IA por organización. Este módulo controla el acceso del motor generativo."
            example="Agrega una key de OpenRouter y el sistema la usará para generar variantes."
          />
        </CardTitle>
        <CardDescription>Configura claves activas para OpenRouter o DeepSeek con validación previa.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error ? <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-md p-2">{error}</div> : null}

        <div className="flex gap-2">
          <Button variant={provider === "OPENROUTER" ? "default" : "outline"} onClick={() => setProvider("OPENROUTER")}>
            OpenRouter
          </Button>
          <Button variant={provider === "DEEPSEEK" ? "default" : "outline"} onClick={() => setProvider("DEEPSEEK")}>
            DeepSeek
          </Button>
        </div>

        <div className="flex gap-2">
          <Input
            type="password"
            placeholder={providerHint}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="font-mono"
          />
          <Button disabled={!apiKey || isSaving} onClick={handleSave}>
            {isSaving ? "Guardando..." : "Guardar"}
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">Claves registradas para la organización actual.</p>
          <Button variant="ghost" size="sm" onClick={loadKeys} disabled={isLoading} className="gap-1">
            <RefreshCcw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
        </div>

        <div className="space-y-2">
          {keys.length === 0 ? (
            <div className="text-xs text-muted-foreground border border-dashed border-border rounded-md p-3">
              Sin claves activas. Agrega una API key para habilitar generación IA.
            </div>
          ) : (
            keys.map((key) => (
              <div key={key.id} className="flex items-center justify-between rounded-md border border-border/60 bg-background/40 p-2.5">
                <div className="space-y-1">
                  <div className="text-sm font-medium">{key.provider}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {key.maskedKey} · {new Date(key.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <Badge variant="outline" className={key.isActive ? "text-emerald-400 border-emerald-500/30" : ""}>
                  {key.isActive ? "Activa" : "Inactiva"}
                </Badge>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
