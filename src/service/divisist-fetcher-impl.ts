import { JSDOM } from "jsdom";

import type { PensumData } from "../interfaces/pensum-schema.js";
import type { GroupData, SessionData, SubjectData, SubjectPensumData } from "../interfaces/subject-schema.js";
import type DivisistFetcher from "./divisist-fetcher.js";
import { Agent } from "undici";

import fs from 'fs'

import { env } from "../env.js";
import { logger } from "../logger.js";
import ElementNotFoundError from "../error/element-not-found-error.js";
import { getDay, getRangeAsIndexes } from "../util/time-uils.js";

type HttpMethod = "GET" | "POST";

class DivisistFetcherImpl implements DivisistFetcher {
  /**
   * Returns HTML text from requested endpoint with requested data
   * @param endpoint endpoint for the request}
   * @param ci_session ci_session cookie for request authentication
   * @param method method of the request
   * @param data (optional) data to be encoded and sent to the backend (POST only)
   */
  private async makeRequest(endpoint: string, ci_session: string, method: HttpMethod, data?: any): Promise<string> {
    let dispatcher: Agent | undefined = undefined;

    if (env.NODE_EXTRA_CA_CERTS) {
      try {
        const ca = fs.readFileSync(env.NODE_EXTRA_CA_CERTS, "utf8");
        dispatcher = new Agent({
          connect: {
            ca,
            rejectUnauthorized: true,
          },
        });

      } catch (err) {
        throw new Error(`Failed to read NODE_EXTRA_CA_CERTS (${env.NODE_EXTRA_CA_CERTS}): ${String(err)}`);
      }
    } else if (process.env.TRUST_SELF_SIGNED === "true") {
      // DEV only: accept self-signed (insecure)
      dispatcher = new Agent({ connect: { rejectUnauthorized: false } });
    }

    const headers: HeadersInit = {
      Cookie: `ci_session=${ci_session}`, // <- igual que --header 'Cookie: ci_session=...'
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "User-Agent":
        "Mozilla/5.0 (compatible; Chrome/1.0)", // opcional si el servidor lo requiere
    };

    if (method === "POST") headers["Content-Type"] = "application/x-www-form-urlencoded";

    const response: Response = await fetch(`${env.DIVISIST_URL}/${endpoint}`, {
      headers,
      method,
      body: method === "POST" ? new URLSearchParams(data).toString() : undefined,
      // pass dispatcher only if created
      ...(dispatcher ? { dispatcher } : {}),
    });

    //await new Promise(res => setTimeout(res, env.DELAY_MS));

    const html: string = await response.text();

    return html;
  }

  private getJSDOM(html: string): Document {
    const doc: Document = new JSDOM(html).window.document;
    return doc;
  }

  private getElement(document: Document, querySelector: string): Element {
    const data = document.querySelector(querySelector);
    if (!data) {
      throw new ElementNotFoundError(`${querySelector} not found for document`);
    }
    return data;
  }

  async getPensumName(ci_session: string): Promise<string> {
    const ENDPOINT_NAME = "estudiante/mi_ufps";
    const QUERY_SELECTOR = "#content_completw > div.wrapper > div > section.content > div > div:nth-child(2) > div.col-md-9 > div > table:nth-child(1) > tbody > tr:nth-child(3) > td";
    const html: string = await this.makeRequest(ENDPOINT_NAME, ci_session, "GET");
    const document: Document = this.getJSDOM(html);
    const element: Element = this.getElement(document, QUERY_SELECTOR);
    const name: string = element.innerHTML;
    return name;
  }

  async getPensumInfo(ci_session: string): Promise<PensumData> {
    const ENDPOINT_NAME = "informacion_academica/pensum";
    const html: string = await this.makeRequest(ENDPOINT_NAME, ci_session, "GET");
    const document: Document = this.getJSDOM(html);

    const pensumData: PensumData = {};
    const semestersElementQuery = "#content_completw > div.wrapper > div > section.content > div > div.box-body.no-padding > div > table > tbody";
    const semestersElement = this.getElement(document, semestersElementQuery)

    const semesters: HTMLCollection = semestersElement.children;

    pensumData.semesters = semesters.length;
    pensumData.updateTeachers = true;
    pensumData.subjects = {};

    let currentSemester = 1;
    for (const semester of semesters) {
      const subjects: HTMLCollection = semester.children;
      let currentSubject = 0;
      for (const subject of subjects) {
        currentSubject++;
        if (currentSubject == 1) continue;

        const subjectData = this.getSubjectFromPensumElement(subject, currentSemester);
        pensumData.subjects[subjectData.code] = subjectData;
      }
    }

    return pensumData;
  }

  private getSubjectFromPensumElement(subjectElement: Element, semester: number): SubjectPensumData {
    const title: string = (subjectElement.children[0] as HTMLElement).title;
    const content: string = subjectElement.children[0].innerHTML;

    //Title processing (name and requirements)
    const titleInfo: string[] = title.split("-").map(e => e.trim());
    const name: string = titleInfo[0];
    const reqs: string[] = titleInfo.slice(1).join(" ").split(" ").slice(1).map(e => e.trim()).filter(el => el !== "" && el !== "Cre:0");


    const requisites: string[] = [];
    let requiredCredits: number = 0;
    reqs.forEach(e => {
      if (e.includes("Cre:")) {
        requiredCredits = parseInt(e.split(":")[1])
      } else {
        requisites.push(e);
      }
    })


    //Content processing (code, hours, credits, elective)
    const cleanContent = content.split(/\s/).filter(el => el !== "").join(" ");
    let type: "MANDATORY" | "ELECTIVE" = "MANDATORY";
    if (cleanContent.includes("Electiva")) {
      type = "ELECTIVE";
    }
    const code = /\d{7}/.exec(cleanContent)![0];
    const hours = parseInt(/horas:\d+/.exec(cleanContent)![0].split(":")[1])
    const credits = parseInt(/Cred:\d+/.exec(cleanContent)![0].split(":")[1])

    const data: SubjectPensumData = {
      code,
      credits,
      hours,
      name,
      requiredCredits,
      requisites,
      semester,
      type
    }

    return data;
  }

  async getSubjectInfo(ci_session: string, code: string, isPrincipal: boolean): Promise<SubjectData> {
    const ENDPOINT_NAME = "consulta/materia";
    const html: string = await this.makeRequest(ENDPOINT_NAME, ci_session, "POST", {
      consulta: "1",
      codigo: code
    });
    const document: Document = this.getJSDOM(html);
    const groupsQuery: string = "#collapse1 > div > div > table > tbody";
    const sessionsQuery: string = "#collapse2 > div > div > table > tbody";
    const subjectData: SubjectData = {
      code: code,
      equivalences: [],
      groups: {},
      isPrincipal
    }
    try {
      const groupsElement: Element = this.getElement(document, groupsQuery);
      const sessionsElement: Element = this.getElement(document, sessionsQuery);
      const groups: { [K: string]: GroupData } = {};

      //Add groups

      const groupRows = Array.from(groupsElement.children).slice(1);
      for (const row of groupRows) {
        const letter: string = row.children[0].innerHTML.trim();
        const groupCode: string = `${code}-${letter}`;
        const max: number = parseInt(row.children[1].innerHTML.trim());
        const available: number = parseInt(row.children[2].innerHTML.trim());
        const teacher: string = row.children[3].innerHTML.trim();
        groups[groupCode] = {
          availableCapacity: available,
          maxCapacity: max,
          name: groupCode,
          program: groupCode.substring(0, 3),
          teacher,
          sessions: []
        };
      }

      //Add sessions to these groups

      const sessionRows = Array.from(sessionsElement.children).slice(1);
      for (const row of sessionRows) {
        const [letter, dayStr, stringHours, classroom] = [0, 1, 2, 3].map(el => row.children[el].innerHTML.trim());
        const groupCode = `${code}-${letter}`;
        const day = getDay(dayStr)
        const [beginHour, endHour] = getRangeAsIndexes(stringHours);
        const session: SessionData = {
          beginHour,
          endHour,
          classroom,
          day
        }
        groups[groupCode].sessions.push(session);
      }

      for (const groupCode in groups) {
        const group: GroupData = groups[groupCode];
        if (group.sessions.length === 0) {
          delete groups[groupCode];
        }
      }

      subjectData.groups = groups;

    } catch (error) {
      if (error instanceof ElementNotFoundError) {
        logger.warn(`${code} has no groups`)
      } else {
        throw error;
      }
    } finally {
      //Add equivalences
      const equivalences: string[] = [];
      if (isPrincipal) {

        try {
          const equivalencesQuery: string = "#collapse3 > div > div > table > tbody";
          const equivalencesElement: Element = this.getElement(document, equivalencesQuery);
          const equivRows = Array.from(equivalencesElement.children).slice(1);
          for (const equivalence of equivRows) {
            const equivalenceCode = equivalence.children[0].innerHTML;
            equivalences.push(equivalenceCode)
          }
        } catch (error) {
          if (error instanceof ElementNotFoundError) {
            logger.warn(`${code} has no equivalences`)
          } else {
            throw error;
          }
        }
      }
      subjectData.equivalences = equivalences;
    }
    return subjectData;
  }

}

export default DivisistFetcherImpl;
