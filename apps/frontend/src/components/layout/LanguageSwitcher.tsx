"use client";

import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/components/providers/I18nProvider";

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();

  return (
    <div className="inline-flex items-center gap-2 rounded-md border border-border/50 bg-card/40 px-2 py-1">
      <Globe className="h-3.5 w-3.5 text-muted-foreground" />
      <span className="text-xs text-muted-foreground">{t("languageLabel")}:</span>
      <Button
        size="sm"
        variant={locale === "es" ? "default" : "ghost"}
        className="h-7 px-2 text-xs"
        onClick={() => setLocale("es")}
      >
        {t("langEs")}
      </Button>
      <Button
        size="sm"
        variant={locale === "en" ? "default" : "ghost"}
        className="h-7 px-2 text-xs"
        onClick={() => setLocale("en")}
      >
        {t("langEn")}
      </Button>
    </div>
  );
}
