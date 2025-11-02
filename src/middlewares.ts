import type { NextFunction, Request, Response } from "express";

import type ErrorResponse from "./interfaces/error-response.js";

import { env } from "./env.js";
import { logger } from "./logger.js";
import { ZodError } from "zod";
import { ValidateError } from "tsoa";
import { sendResponse } from "./service/response-service.js";
import { FetchingRequest } from "./interfaces/fetching-request.js";

export function notFound(req: Request, res: Response, next: NextFunction) {
  res.status(404);
  const error = new Error(`🔍 - Not Found - ${req.originalUrl}`);
  next(error);
}

// src/middlewares.ts
// ...existing code...
export function errorHandler(
  err: unknown, 
  req: Request<{}, any, FetchingRequest>, 
  res: Response<ErrorResponse>, 
  _next: NextFunction
): void {
  logger.error({ 
    err, 
    url: req.url, 
    method: req.method, 
    body: req.body 
  }, "Unhandled error");

  sendResponse({
    callbackUrl: req.body.callbackUrl,
    jobId: req.body.jobId,
    response: `Error in request: ${JSON.stringify(err)}`,
    success: false,
  })
  
  // Zod validation errors
  if (err instanceof ZodError) {
    res.status(400).json({
      message: "Validation failed",
      details: err.errors,
      stack: env.NODE_ENV === "production" ? undefined : err.stack,
    });
    return;
  }

  // tsoa validation errors
  if (err instanceof ValidateError) {
    res.status(422).json({
      message: "Validation failed",
      details: err.fields,
      stack: env.NODE_ENV === "production" ? "🥞" : err.stack,
    });
    return;
  }

  if (err instanceof Error && 'statusCode' in err) {
    res.status((err as any).statusCode).json({
      message: err.message,
      stack: env.NODE_ENV === "production" ? "🥞" : err.stack,
    });
    return;
  }

  if (err instanceof Error) {
    res.status(500).json({
      message: err.message,
      stack: env.NODE_ENV === "production" ? "🥞" : err.stack,
    });
    return;
  }

  res.status(500).json({
    message: "Internal server error",
    stack: env.NODE_ENV === "production" ? "🥞" : undefined,
  });
}
// ...existing code...