"use client";

import { useEffect, useRef, useState } from "react";

type ChartFrameProps = {
  className?: string;
  children: (size: { width: number; height: number }) => React.ReactNode;
  loadingText?: string;
};

export function ChartFrame({ className, children, loadingText = "Inicializando gráfico..." }: ChartFrameProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;

    const update = () => {
      const next = {
        width: Math.max(0, Math.floor(el.clientWidth)),
        height: Math.max(0, Math.floor(el.clientHeight)),
      };
      setSize(next);
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className={className}>
      {size.width > 0 && size.height > 0 ? (
        children(size)
      ) : (
        <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground">{loadingText}</div>
      )}
    </div>
  );
}
