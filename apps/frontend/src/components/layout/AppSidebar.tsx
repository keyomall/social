import { ShieldAlert, Activity, Sparkles, Layers, Settings2, BarChart3 } from "lucide-react";
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";

export function AppSidebar() {
  return (
    <Sidebar variant="inset" className="border-r border-border/50">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold tracking-wider text-sm text-foreground">AuraSync</span>
            <span className="text-[10px] text-muted-foreground font-mono">v2.0.0-PRO</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-2 mt-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton isActive tooltip="Generative Engine">
              <Sparkles />
              <span>Generative Engine</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Campaign Tracking">
              <Layers />
              <span>Campaign Tracking</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Analytics">
              <BarChart3 />
              <span>Analytics</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem className="mt-8">
            <span className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">System</span>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="System Health">
              <Activity />
              <span>System Health</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="AI Vault & Config">
              <Settings2 />
              <span>AI Vault & Config</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
