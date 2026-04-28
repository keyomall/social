import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AuraSync - The Generative Publishing Engine",
  description: "Sistema industrial de autopublicación viral y tracking multimodal con IA.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-background text-foreground selection:bg-emerald-500/30`}>
        <TooltipProvider delay={200}>
          <SidebarProvider>
            {children}
          </SidebarProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}
