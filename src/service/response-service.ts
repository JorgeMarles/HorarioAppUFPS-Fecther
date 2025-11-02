import { FetchingResponse } from "../interfaces/fetching-response";
import { logger } from "../logger";

export async function sendResponse(response: FetchingResponse) {
    const url = response.callbackUrl;
    const endpoint = `/workflow/job/${response.jobId}`;

    logger.info(`Sending ${response.success ? "OK" : "Error"} to ${url}/${response.jobId}: ${response.response}`);

    try {

        let httpResponse: Response;
        const RETRIES = 4;
        do {
            httpResponse = await fetch(url + endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...response,
                    callbackUrl: undefined
                })
            });
            if(!httpResponse.ok){
                logger.error(`HTTP Error(${endpoint}) ${httpResponse.status}: ${httpResponse.statusText}`)
            }
        } while (!httpResponse.ok)


        if (!httpResponse.ok) {

            throw new Error(`HTTP ${httpResponse.status}: ${httpResponse.statusText}`);
        }

        logger.info(`Successfully sent response to ${url} (${response.jobId})`);

    } catch (error) {
        logger.error({
            error: error instanceof Error ? error.message : String(error),
            url: url + endpoint,
            jobId: response.jobId,
            response: response.response
        }, "Failed to send response to callback URL");
    }
}