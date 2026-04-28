"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useConfigStore } from "@/store/useConfigStore";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { KeyRound, CheckCircle2, Loader2, Info } from "lucide-react";

export function OnboardingFlow() {
  const [step, setStep] = useState(1);
  const [openRouterKey, setOpenRouterKey] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [success, setSuccess] = useState(false);
  const { setHasCompletedOnboarding } = useConfigStore();

  const handleValidate = async () => {
    setIsValidating(true);
    // Simular validación backend industrial (ping a la API)
    setTimeout(() => {
      setIsValidating(false);
      setSuccess(true);
      setTimeout(() => {
        setStep(2);
      }, 1500);
    }, 2000);
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
                  Ingresa tu API Key principal. El sistema configurará el Carrusel de Llaves automáticamente.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium leading-none">OpenRouter API Key</label>
                    <Tooltip>
                      <TooltipTrigger render={<span className="inline-flex cursor-help"><Info className="h-4 w-4 text-slate-400" /></span>} />
                      <TooltipContent>
                        <p className="w-[200px] text-xs">Recomendamos OpenRouter para habilitar el fallback automático entre modelos premium y open source.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                      type="password"
                      placeholder="sk-or-v1-..."
                      className="pl-9"
                      value={openRouterKey}
                      onChange={(e) => setOpenRouterKey(e.target.value)}
                      disabled={isValidating || success}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full transition-all" 
                  onClick={handleValidate}
                  disabled={!openRouterKey || isValidating || success}
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
