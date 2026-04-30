"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useI18n } from "@/components/providers/I18nProvider";

type GuidedTourProps = {
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
};

export function GuidedTour({ open, onClose, onComplete }: GuidedTourProps) {
  const { t } = useI18n();
  const [step, setStep] = useState(0);

  const steps = useMemo(
    () => [
      { title: t("tourTitle1"), description: t("tourDesc1") },
      { title: t("tourTitle2"), description: t("tourDesc2") },
      { title: t("tourTitle3"), description: t("tourDesc3") },
      { title: t("tourTitle4"), description: t("tourDesc4") },
    ],
    [t],
  );

  if (!open) return null;

  const current = steps[step];
  const isFirst = step === 0;
  const isLast = step === steps.length - 1;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[1px] p-4 flex items-end justify-center md:items-center">
      <Card className="w-full max-w-md border-border/60 bg-card shadow-xl">
        <CardHeader>
          <div className="text-xs text-muted-foreground">
            {t("guidedTour")} · {step + 1}/{steps.length}
          </div>
          <CardTitle className="text-lg">{current.title}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground leading-relaxed">{current.description}</CardContent>
        <CardFooter className="flex items-center justify-between gap-2">
          <Button variant="ghost" onClick={onClose}>
            {t("close")}
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" disabled={isFirst} onClick={() => setStep((s) => Math.max(0, s - 1))}>
              {t("previous")}
            </Button>
            {isLast ? (
              <Button
                onClick={() => {
                  onComplete();
                  onClose();
                }}
              >
                {t("finish")}
              </Button>
            ) : (
              <Button onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))}>{t("next")}</Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
