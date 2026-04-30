"use client";

import { useState } from "react";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginGate() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    const e2eBypass = process.env.NEXT_PUBLIC_E2E_AUTH_BYPASS === "true";
    if (e2eBypass) {
      window.localStorage.setItem("siag-auth-user-email", email);
      window.localStorage.setItem("siag-e2e-auth", "true");
      window.location.reload();
      return;
    }

    setLoading(true);
    setError(null);
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Credenciales inválidas o usuario no autorizado.");
      setLoading(false);
      return;
    }

    window.localStorage.setItem("siag-auth-user-email", email);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-slate-200 shadow-xl">
        <CardHeader className="space-y-1">
          <div className="mb-2 flex items-center gap-3">
            <Image src="/keryx-logo.png" alt="KERYX logo" width={32} height={32} className="h-8 w-8 object-contain" priority />
            <span className="text-sm font-semibold tracking-wider text-muted-foreground">KERYX / SIAG</span>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Acceso Seguro</CardTitle>
          <CardDescription>Inicia sesión para operar el panel con RBAC estricto.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@empresa.com"
            disabled={loading}
          />
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
            disabled={loading}
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleLogin} disabled={loading || !email || !password}>
            {loading ? "Validando..." : "Entrar"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
