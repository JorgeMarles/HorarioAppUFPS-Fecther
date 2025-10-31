import type { PensumData } from "../interfaces/pensum-schema.js";
import type { PensumRequest, SubjectRequest } from "../interfaces/fetching-request.js";
import type { SubjectData } from "../interfaces/subject-schema.js";
import type DivisistFetcher from "./divisist-fetcher.js";

import DivisistFetcherImpl from "./divisist-fetcher-impl.js";

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
}

export default FetcherService;
