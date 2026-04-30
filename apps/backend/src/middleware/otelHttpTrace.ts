import { Request, Response, NextFunction } from "express";
import { trace, context, SpanStatusCode } from "@opentelemetry/api";

const tracer = trace.getTracer("siag-backend-http");

export function otelHttpTrace(req: Request, res: Response, next: NextFunction) {
  if (process.env.OTEL_ENABLED !== "true") {
    return next();
  }

  const span = tracer.startSpan(`HTTP ${req.method} ${req.path}`, {
    attributes: {
      "http.method": req.method,
      "http.route": req.path,
      "http.target": req.originalUrl || req.url,
    },
  });

  res.on("finish", () => {
    span.setAttribute("http.status_code", res.statusCode);
    if (res.statusCode >= 500) {
      span.setStatus({ code: SpanStatusCode.ERROR });
    }
    span.end();
  });

  return context.with(trace.setSpan(context.active(), span), next);
}
