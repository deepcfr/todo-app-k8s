import type { NextFunction, Request, Response } from "express";
import { logger, type LogLevel } from "../logger";

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  // // request hits the server
  // console.log(
  //   `<--- ${req.method.toUpperCase()} ${req.path} ${req.get("origin") || "same-origin"}`
  // );

  // // when request fullfills
  // res.on("finish", () => {
  //   console.log(
  //     `${req.method.toUpperCase()} ${req.path} ${res.statusCode} --->`
  //   );
  // });

  const startTime = process.hrtime.bigint();

  res.on("finish", () => {
    const durationMs = Number(process.hrtime.bigint() - startTime) / 1000000;

    const statusCode = res.statusCode;

    const level: LogLevel =
      statusCode >= 500 ? "error" : statusCode >= 400 ? "warn" : "info";

    logger[level]("HTTP request completed", {
      event: "http_request",
      method: req.method,
      path: req.path,
      status: statusCode,
      duration_ms: Number(durationMs.toFixed(2)),
    });
  });

  next();
}
