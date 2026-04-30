export type Locale = "es" | "en";

type MessageSchema = {
  appTitle: string;
  appSubtitle: string;
  sidebarEngine: string;
  sidebarCampaigns: string;
  sidebarAnalytics: string;
  sidebarSystem: string;
  sidebarHealth: string;
  sidebarVault: string;
  languageLabel: string;
  langEs: string;
  langEn: string;
  guidedTour: string;
  startTour: string;
  next: string;
  previous: string;
  finish: string;
  close: string;
  tourTitle1: string;
  tourDesc1: string;
  tourTitle2: string;
  tourDesc2: string;
  tourTitle3: string;
  tourDesc3: string;
  tourTitle4: string;
  tourDesc4: string;
};

export const messages: Record<Locale, MessageSchema> = {
  es: {
    appTitle: "Motor Generativo",
    appSubtitle: "Convierte ideas semilla en campañas listas para publicar y medir.",
    sidebarEngine: "Motor Generativo",
    sidebarCampaigns: "Campañas",
    sidebarAnalytics: "Analítica",
    sidebarSystem: "Sistema",
    sidebarHealth: "Salud del Sistema",
    sidebarVault: "Bóveda IA y Configuración",
    languageLabel: "Idioma",
    langEs: "Español",
    langEn: "Inglés",
    guidedTour: "Tour guiado",
    startTour: "Iniciar tour",
    next: "Siguiente",
    previous: "Anterior",
    finish: "Finalizar",
    close: "Cerrar",
    tourTitle1: "Motor de Publicación",
    tourDesc1: "Aquí redactas contenido con IA o manual, eliges plataformas y envías a cola.",
    tourTitle2: "Módulo de IA y API Keys",
    tourDesc2: "Administra proveedores y claves del motor IA con validación real.",
    tourTitle3: "Campañas y Diagnóstico",
    tourDesc3: "Revisa estados de publicación, fallos y métricas para ajustar estrategia.",
    tourTitle4: "Salud y Madurez",
    tourDesc4: "Monitorea estabilidad técnica y progreso para priorizar mejoras.",
  },
  en: {
    appTitle: "Generative Engine",
    appSubtitle: "Turn seed ideas into campaigns ready to publish and measure.",
    sidebarEngine: "Generative Engine",
    sidebarCampaigns: "Campaigns",
    sidebarAnalytics: "Analytics",
    sidebarSystem: "System",
    sidebarHealth: "System Health",
    sidebarVault: "AI Vault & Settings",
    languageLabel: "Language",
    langEs: "Spanish",
    langEn: "English",
    guidedTour: "Guided Tour",
    startTour: "Start Tour",
    next: "Next",
    previous: "Previous",
    finish: "Finish",
    close: "Close",
    tourTitle1: "Publishing Engine",
    tourDesc1: "Write AI/manual content, pick platforms, and enqueue delivery.",
    tourTitle2: "AI & API Keys Module",
    tourDesc2: "Manage providers and API keys with real validation.",
    tourTitle3: "Campaigns & Diagnostics",
    tourDesc3: "Track publish statuses, failures, and metrics to refine strategy.",
    tourTitle4: "Health & Maturity",
    tourDesc4: "Monitor technical stability and progress to prioritize improvements.",
  },
};
