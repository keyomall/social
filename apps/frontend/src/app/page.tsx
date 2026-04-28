"use client";
import { useConfigStore } from "@/store/useConfigStore";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";
import { PublishEngine } from "@/components/dashboard/PublishEngine";

export default function Home() {
  const { hasCompletedOnboarding } = useConfigStore();

  if (!hasCompletedOnboarding) {
    return <OnboardingFlow />;
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex justify-between items-center pb-6 border-b border-slate-200">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">SIAG Control Center</h1>
            <p className="text-slate-500 mt-1">Motor Generativo de Autopublicación</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-sm font-medium text-slate-600">Sistemas en línea</span>
          </div>
        </header>

        <PublishEngine />
      </div>
    </div>
  );
}
