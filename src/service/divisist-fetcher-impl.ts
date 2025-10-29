import { JSDOM } from "jsdom";

import type { PensumData } from "../interfaces/pensum-schema.js";
import type { SubjectData } from "../interfaces/subject-schema.js";
import type DivisistFetcher from "./divisist-fetcher.js";
import { Agent } from "undici";

import fs from 'fs'

import { env } from "../env.js";
import { logger } from "../logger.js";

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
            ca: fs.readFileSync(env.NODE_EXTRA_CA_CERTS, 'utf8'),
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
      throw new Error(`${querySelector} not found for document`);
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
    const ENDPOINT_NAME = "";
    const QUERY_SELECTOR = "";
    const html: string = await this.makeRequest(ENDPOINT_NAME, ci_session, "GET");
    const document: Document = this.getJSDOM(html);
    throw new Error("Method not implemented.");
  }

  async getSubjectInfo(ci_session: string): Promise<SubjectData> {
    const ENDPOINT_NAME = "";
    const QUERY_SELECTOR = "";
    const html: string = await this.makeRequest(ENDPOINT_NAME, ci_session, "GET");
    const document: Document = this.getJSDOM(html);
    throw new Error("Method not implemented.");
  }
}

export default DivisistFetcherImpl;
