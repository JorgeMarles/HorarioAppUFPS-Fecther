import { FetchingResponse } from "../interfaces/fetching-response";
import { logger } from "../logger";

export async function sendResponse(response: FetchingResponse) {
    const url = response.callbackUrl;
    const endpoint = `/workflow/job/${response.jobId}`;
    
    logger.info({ ...response.data }, `Sending ${response.success ? "OK" : "Error"} to ${url} (${response.jobId})`);

    try {
        const fetchResponse = await fetch(url + endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...response,
                callbackUrl: undefined
            })
        });

        if (!fetchResponse.ok) {
            throw new Error(`HTTP ${fetchResponse.status}: ${fetchResponse.statusText}`);
        }

        logger.info(`Successfully sent response to ${url} (${response.jobId})`);
        
    } catch (error) {
        logger.error({ 
            error: error instanceof Error ? error.message : String(error),
            url: url + endpoint,
            jobId: response.jobId,
            responseData: response
        }, "Failed to send response to callback URL");
    }
}