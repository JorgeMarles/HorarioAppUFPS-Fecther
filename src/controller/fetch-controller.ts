import { Body, Controller, Get, Post, Query, Route, SuccessResponse } from "tsoa";

import type { FetchingRequest } from "../interfaces/fetching-request.js";

import { FetchingRequestSchema } from "../interfaces/fetching-request.js";
import FetcherService from "../service/fetcher-service.js";
import { logger } from "../logger.js";

@Route("/fetch")
class FetcherController extends Controller {
  @Post("")
  @SuccessResponse("200", "Fetch process was successful")
  public async postFect(@Body() body: FetchingRequest): Promise<{ message: FetchingRequest }> {
    const fetcher = new FetcherService();
    const validatedBody = FetchingRequestSchema.parse(body);
    if (validatedBody.type === "PENSUM")
      fetcher.getPensum(validatedBody);
    return {
      message: validatedBody,
    };
  }

  @Get("")
  @SuccessResponse("200", "Fetch process was successful")
  public async test(@Query("ci_session") cookie: string): Promise<any> {
    logger.info({ cookie }, "Cookie");
    const fetcher = new FetcherService();

    const name: string = await fetcher.getPensumName(cookie);

    return { name };
  }
}

export { FetcherController };
