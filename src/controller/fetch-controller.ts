// src/controller/fetch-controller.ts
import { Body, Controller, Post, Route, SuccessResponse } from "tsoa";
import { StatusCodes } from "http-status-codes";

import { FetchingRequestSchema, FetchingRequest } from "../interfaces/fetching-request.js";
import FetcherService from "../service/fetcher-service.js";
import { logger } from "../logger.js";
import { FetchingResponse } from "../interfaces/fetching-response.js";

@Route("")
class FetcherController extends Controller {
  @Post("fetch")
  @SuccessResponse("202", "Fetch process started")
  public async postFetch(@Body() body: FetchingRequest): Promise<FetchingResponse> {
    logger.info({body}, "Body received")
    // Validar - si falla, automáticamente va al middleware
    const validatedBody = FetchingRequestSchema.parse(body);
    
    // Procesar en background
    const fetcher = new FetcherService();
    const data = await fetcher.processRequest(validatedBody);
    
    // Responder inmediatamente
    this.setStatus(StatusCodes.ACCEPTED);
    return data;
  }
}

export { FetcherController };