"use client";
import { useConfigStore } from "@/store/useConfigStore";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";
import { PublishEngine } from "@/components/dashboard/PublishEngine";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { SystemHealth } from "@/components/dashboard/SystemHealth";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ProfileAnalytics } from "@/components/dashboard/ProfileAnalytics";
import { TrafficDashboard } from "@/components/dashboard/TrafficDashboard";
import { CampaignTracker } from "@/components/dashboard/CampaignTracker";
import { ReportEngine } from "@/components/dashboard/ReportEngine";

export default function Home() {
  const { hasCompletedOnboarding } = useConfigStore();

  if (!hasCompletedOnboarding) {
    return <OnboardingFlow />;
  }

  return (
    <div className="flex w-full h-screen overflow-hidden">
      <AppSidebar />
      <div className="flex-1 overflow-y-auto relative bg-background">
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b border-border/50 bg-background/80 px-4 backdrop-blur">
          <SidebarTrigger />
          <h1 className="text-sm font-semibold tracking-wide text-foreground">AuraSync Dashboard</h1>
        </header>
        <main className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto">
          <div className="flex flex-col gap-2">
            <h2 className="text-3xl font-bold tracking-tight">Generative Engine</h2>
            <p className="text-muted-foreground">Transform seeds into viral campaigns instantly.</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3 space-y-8">
              <PublishEngine />
              <CampaignTracker />
              <ReportEngine />
              <ProfileAnalytics />
            </div>
            <div className="lg:col-span-1 space-y-8">
              <SystemHealth />
              <TrafficDashboard />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
