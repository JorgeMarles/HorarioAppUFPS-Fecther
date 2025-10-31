import type { PensumData } from "../interfaces/pensum-schema.js";
import type { SubjectData } from "../interfaces/subject-schema.js";

interface DivisistFetcher {
  getPensumName: (ci_session: string) => Promise<string>;
  getPensumInfo: (ci_session: string) => Promise<PensumData>;
  getSubjectInfo: (ci_session: string, code: string, isPrincipal: boolean) => Promise<SubjectData>;
}

export default DivisistFetcher;
