// src/controller/fetch-controller.ts
import { Body, Controller, Post, Route, SuccessResponse } from "tsoa";
import { StatusCodes } from "http-status-codes";

import { FetchingRequestSchema, FetchingRequest } from "../interfaces/fetching-request.js";
import FetcherService from "../service/fetcher-service.js";
import { logger } from "../logger.js";

@Route("/fetch")
class FetcherController extends Controller {
  @Post("")
  @SuccessResponse("202", "Fetch process started")
  public async postFetch(@Body() body: FetchingRequest): Promise<{
    message: string;
    jobId: number;
  }> {
    // Validar - si falla, automáticamente va al middleware
    const validatedBody = FetchingRequestSchema.parse(body);
    
    // Procesar en background
    const fetcher = new FetcherService();
    fetcher.processRequest(validatedBody).catch(error => {
      logger.error({ 
        error: error instanceof Error ? error.message : String(error),
        jobId: validatedBody.jobId 
      }, "Background processing failed");
    });
    
    // Responder inmediatamente
    this.setStatus(StatusCodes.ACCEPTED);
    return {
      message: "Fetch process started",
      jobId: validatedBody.jobId
    };
  }
}

export { FetcherController };