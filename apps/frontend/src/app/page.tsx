"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useConfigStore } from "@/store/useConfigStore";
import { LoginGate } from "@/components/auth/LoginGate";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";
import { PublishEngine } from "@/components/dashboard/PublishEngine";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { SystemHealth } from "@/components/dashboard/SystemHealth";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ProfileAnalytics } from "@/components/dashboard/ProfileAnalytics";
import { TrafficDashboard } from "@/components/dashboard/TrafficDashboard";
import { CampaignTracker } from "@/components/dashboard/CampaignTracker";
import { ReportEngine } from "@/components/dashboard/ReportEngine";
import { AnalyticsDashboard } from "@/components/dashboard/AnalyticsDashboard";
import { ProjectProgress } from "@/components/dashboard/ProjectProgress";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { useI18n } from "@/components/providers/I18nProvider";
import { GuidedTour } from "@/components/guidance/GuidedTour";
import { AiKeysModule } from "@/components/dashboard/AiKeysModule";

export default function Home() {
  const { status } = useSession();
  const { hasCompletedOnboarding, tourCompleted, setTourCompleted } = useConfigStore();
  const { t } = useI18n();
  const [localBypassAuthenticated, setLocalBypassAuthenticated] = useState(false);
  const [tourOpen, setTourOpen] = useState(false);
  const e2eBypass = process.env.NEXT_PUBLIC_E2E_AUTH_BYPASS === "true";

  useEffect(() => {
    if (!e2eBypass) return;
    setLocalBypassAuthenticated(window.localStorage.getItem("siag-e2e-auth") === "true");
  }, [e2eBypass]);

  useEffect(() => {
    if (e2eBypass) return;
    if (!hasCompletedOnboarding || tourCompleted) return;
    setTourOpen(true);
  }, [e2eBypass, hasCompletedOnboarding, tourCompleted]);

  if (status === "loading" && !e2eBypass) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">Validando sesión...</div>;
  }

  if (status !== "authenticated" && !localBypassAuthenticated) {
    return <LoginGate />;
  }

  if (!hasCompletedOnboarding) {
    return <OnboardingFlow />;
  }

  return (
    <div className="flex w-full h-screen overflow-hidden">
      <AppSidebar />
      <div className="flex-1 overflow-y-auto relative bg-background">
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b border-border/50 bg-background/80 px-4 backdrop-blur">
          <SidebarTrigger />
          <div className="flex items-center gap-2">
            <Image src="/keryx-logo.png" alt="KERYX logo" width={20} height={20} className="h-5 w-5 object-contain" />
            <h1 className="text-sm font-semibold tracking-wide text-foreground">Panel KERYX</h1>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              className="text-xs text-muted-foreground hover:text-foreground border border-border/50 rounded-md px-2 py-1"
              onClick={() => setTourOpen(true)}
            >
              {t("startTour")}
            </button>
            <LanguageSwitcher />
          </div>
        </header>
        <main className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto">
          <div className="flex flex-col gap-2">
            <h2 className="text-3xl font-bold tracking-tight">{t("appTitle")}</h2>
            <p className="text-muted-foreground">{t("appSubtitle")}</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3 space-y-8">
              <PublishEngine />
              <AiKeysModule />
              <CampaignTracker />
              <ReportEngine />
              <ProfileAnalytics />
              <AnalyticsDashboard />
            </div>
            <div className="lg:col-span-1 space-y-8">
              <ProjectProgress />
              <SystemHealth />
              <TrafficDashboard />
            </div>
          </div>
        </main>
      </div>
      <GuidedTour
        open={tourOpen}
        onClose={() => setTourOpen(false)}
        onComplete={() => setTourCompleted(true)}
      />
    </div>
  );
}
