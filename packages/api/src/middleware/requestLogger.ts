import { Request, Response, NextFunction } from "express";
import { logger } from "../config/logger";

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    const logLevel =
      res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "info";

    logger[logLevel as keyof typeof logger](`
      ${req.method} ${req.path}
      Status: ${res.statusCode}
      Duration: ${duration}ms
      IP: ${req.ip}
    `);
  });

  next();
};
