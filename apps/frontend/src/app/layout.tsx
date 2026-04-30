import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AuthSessionProvider } from "@/components/providers/AuthSessionProvider";
import { I18nProvider } from "@/components/providers/I18nProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "KERYX - Sistema Inteligente de Publicación",
  description: "Plataforma inteligente de generación, publicación y analítica multicanal en español.",
  icons: {
    icon: "/keryx-logo.png",
    shortcut: "/keryx-logo.png",
    apple: "/keryx-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body className={`${inter.className} bg-background text-foreground selection:bg-emerald-500/30`}>
        <TooltipProvider delay={200}>
          <AuthSessionProvider>
            <I18nProvider>
              <SidebarProvider>{children}</SidebarProvider>
            </I18nProvider>
          </AuthSessionProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}
