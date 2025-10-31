import { Body, Controller, Get, Post, Query, Route, SuccessResponse } from "tsoa";

import type { FetchingRequest } from "../interfaces/fetching-request.js";

import { FetchingRequestSchema } from "../interfaces/fetching-request.js";
import FetcherService from "../service/fetcher-service.js";
import { logger } from "../logger.js";

@Route("/fetch")
class FetcherController extends Controller {
  @Post("")
  @SuccessResponse("200", "Fetch process was successful")
  public async postFect(@Body() body: FetchingRequest): Promise<any> {
    const fetcher = new FetcherService();
    const validatedBody = FetchingRequestSchema.parse(body);
    if (validatedBody.type === "PENSUM") {
      const pensum = await fetcher.getPensum(validatedBody);
      return {
        ...pensum
      }
    } else {
      const subject = await fetcher.getSubject(validatedBody)
      return {
        ...subject
      }
    }
  }
}

export { FetcherController };
