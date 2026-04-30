"use client";
import { ShieldAlert, Activity, Sparkles, Layers, Settings2, BarChart3 } from "lucide-react";
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { useI18n } from "@/components/providers/I18nProvider";

export function AppSidebar() {
  const { t } = useI18n();

  return (
    <Sidebar variant="inset" className="border-r border-border/50">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold tracking-wider text-sm text-foreground">KERYX</span>
            <span className="text-[10px] text-muted-foreground font-mono">v2.0.0-PRO</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-2 mt-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton isActive tooltip={t("sidebarEngine")}>
              <Sparkles />
              <span>{t("sidebarEngine")}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip={t("sidebarCampaigns")}>
              <Layers />
              <span>{t("sidebarCampaigns")}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip={t("sidebarAnalytics")}>
              <BarChart3 />
              <span>{t("sidebarAnalytics")}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem className="mt-8">
            <span className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">{t("sidebarSystem")}</span>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip={t("sidebarHealth")}>
              <Activity />
              <span>{t("sidebarHealth")}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip={t("sidebarVault")}>
              <Settings2 />
              <span>{t("sidebarVault")}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
