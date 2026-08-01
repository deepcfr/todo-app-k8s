import type { NextFunction, Request, Response } from "express";

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  // request hits the server
  console.log(
    `<--- ${req.method.toUpperCase()} ${req.path} ${req.get("origin") || "same-origin"}`
  );

  // when request fullfills
  res.on("finish", () => {
    console.log(
      `${req.method.toUpperCase()} ${req.path} ${res.statusCode} --->`
    );
  });

  next();
}
