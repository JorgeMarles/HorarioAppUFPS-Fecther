import type { PensumData } from "../interfaces/pensum-schema.js";
import type { FetchingRequest, PensumRequest, SubjectRequest } from "../interfaces/fetching-request.js";
import type { SubjectData } from "../interfaces/subject-schema.js";
import type DivisistFetcher from "./divisist-fetcher.js";

import DivisistFetcherImpl from "./divisist-fetcher-impl.js";
import { FetchingResponse } from "../interfaces/fetching-response.js";
import { sendResponse } from "./response-service.js";

class FetcherService {
  private fetcher: DivisistFetcher;

  constructor() {
    this.fetcher = new DivisistFetcherImpl();
  }

  async getPensum(request: PensumRequest): Promise<PensumData> {
    const name: string = await this.fetcher.getPensumName(request.cookie);
    const otherData: PensumData = await this.fetcher.getPensumInfo(request.cookie);

    const response: PensumData = {
      name,
      semesters: otherData.semesters,
      updateTeachers: request.updateTeachers,
      subjects: otherData.subjects,
    };
    return response;
  }

  async getSubject(request: SubjectRequest): Promise<SubjectData> {
    const subject: SubjectData = await this.fetcher.getSubjectInfo(request.cookie, request.code, request.isPrincipal);

    return subject;
  }

  async processRequest(request: FetchingRequest): Promise<void> {
    const callbackUrl = request.callbackUrl;
    const jobId = request.jobId;
    let data: PensumData | SubjectData | null = null;
    try {
      if (request.type === "PENSUM") {
        const pensum = await this.getPensum(request);
        data = pensum;
      } else {
        const subject = await this.getSubject(request)
        data = subject;
      }
      const response: FetchingResponse = {
        callbackUrl,
        data,
        jobId,
        response: "Operación realizada correctamente",
        success: true
      }
      await sendResponse(response)
    } catch (error) {
      let responseMsg = "Unknown error"
      if (error instanceof Error) {
        responseMsg = error.message;
      }
      const response: FetchingResponse = {
        callbackUrl,
        jobId,
        response: responseMsg,
        success: false
      }
      await sendResponse(response)
    }

  }
}

export default FetcherService;
