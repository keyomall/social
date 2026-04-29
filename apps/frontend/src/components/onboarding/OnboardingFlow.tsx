"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useConfigStore } from "@/store/useConfigStore";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { KeyRound, CheckCircle2, Loader2, Info } from "lucide-react";
import { apiPost } from "@/lib/api-client";

export function OnboardingFlow() {
  const [step, setStep] = useState(1);
  const [provider, setProvider] = useState("OPENROUTER");
  const [apiKey, setApiKey] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setHasCompletedOnboarding, organizationId } = useConfigStore();

  const handleValidate = async () => {
    setIsValidating(true);
    setError(null);
    try {
      await apiPost<{ success: boolean; keyId: string }>("/api/keys", {
        provider,
        apiKey,
        organizationId,
      });
      
      setIsValidating(false);
      setSuccess(true);
      setTimeout(() => {
        setStep(2);
      }, 1500);
    } catch (err: any) {
      setIsValidating(false);
      setError(err.message || "No se pudo validar la API Key.");
    }
  };

  const finishSetup = () => {
    setHasCompletedOnboarding(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="w-full max-w-md"
          >
            <Card className="border-slate-200 shadow-xl">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold tracking-tight">
                  Configuración del Motor de IA
                </CardTitle>
                <CardDescription>
                  Selecciona tu proveedor principal e ingresa tu API Key. El sistema soporta Fallback automático.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button 
                    variant={provider === 'OPENROUTER' ? 'default' : 'outline'} 
                    onClick={() => setProvider('OPENROUTER')}
                    className="flex-1"
                    disabled={isValidating || success}
                  >
                    OpenRouter
                  </Button>
                  <Button 
                    variant={provider === 'DEEPSEEK' ? 'default' : 'outline'} 
                    onClick={() => setProvider('DEEPSEEK')}
                    className="flex-1"
                    disabled={isValidating || success}
                  >
                    DeepSeek
                  </Button>
                </div>
                
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium leading-none">API Key ({provider})</label>
                    <Tooltip>
                      <TooltipTrigger render={<span className="inline-flex cursor-help"><Info className="h-4 w-4 text-slate-400" /></span>} />
                      <TooltipContent>
                        <p className="w-[200px] text-xs">Recomendamos DeepSeek por sus bajos costos para volumen alto, o OpenRouter para aprovechar múltiples modelos y fallback garantizado.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                      type="password"
                      placeholder={provider === "DEEPSEEK" ? "sk-..." : "sk-or-v1-..."}
                      className="pl-9"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      disabled={isValidating || success}
                    />
                  </div>
                </div>
                {error && (
                  <p className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-md p-2">
                    {error}
                  </p>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full transition-all" 
                  onClick={handleValidate}
                  disabled={!apiKey || isValidating || success}
                >
                  {isValidating ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Validando Conexión...</>
                  ) : success ? (
                    <><CheckCircle2 className="mr-2 h-4 w-4 text-emerald-400" /> Configuración Exitosa</>
                  ) : (
                    "Conectar y Autoconfigurar"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full max-w-md"
          >
            <Card className="border-slate-200 shadow-xl border-t-4 border-t-emerald-500">
              <CardHeader>
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                  <CheckCircle2 className="text-emerald-500 h-6 w-6" />
                  Sistema Listo
                </CardTitle>
                <CardDescription>
                  La bóveda de secretos ha sido encriptada. El motor de estrategias virales y el publicador están operativos.
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={finishSetup}>
                  Entrar al Dashboard Principal
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
