"use client";

import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type HelpTooltipProps = {
  title: string;
  description: string;
  example?: string;
};

export function HelpTooltip({ title, description, example }: HelpTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            type="button"
            className="inline-flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            aria-label={`Ayuda: ${title}`}
          >
            <Info className="h-4 w-4" />
          </button>
        }
      />
      <TooltipContent side="bottom" className="max-w-[320px] text-xs leading-relaxed">
        <div className="space-y-1">
          <p className="font-semibold">{title}</p>
          <p>{description}</p>
          {example ? <p className="text-[11px] opacity-90">Ejemplo: {example}</p> : null}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
