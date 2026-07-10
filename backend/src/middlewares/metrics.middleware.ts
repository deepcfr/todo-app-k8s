import type { NextFunction, Request, Response } from "express";
import {
  activeRequests,
  httpRequestDuration,
  httpRequestsTotal,
} from "../metrics";

// ignore this endpoints
const ignoredEndpoints = new Set(["/health", "/metrics"]);

export function metricsMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (ignoredEndpoints.has(req.path)) return next();

  const start = process.hrtime.bigint();

  activeRequests.inc();

  res.on("finish", () => {
    const end = process.hrtime.bigint();

    const durationSeconds = Number(end - start) / 1_000_000_000;

    const route = req.route?.path ?? req.path;

    const labels = {
      method: req.method,
      route,
      status_code: res.statusCode.toString(),
    };

    httpRequestsTotal.inc(labels);

    httpRequestDuration.observe(labels, durationSeconds);

    activeRequests.dec();
  });

  next();
}
