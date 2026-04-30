import { Request, Response, NextFunction } from "express";
import crypto from "crypto";

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const startedAt = Date.now();
  const requestId = crypto.randomUUID();
  res.setHeader("x-request-id", requestId);

  res.on("finish", () => {
    const log = {
      level: "info",
      requestId,
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: Date.now() - startedAt,
      timestamp: new Date().toISOString(),
    };
    console.log(JSON.stringify(log));
  });

  next();
}
