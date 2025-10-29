import pino from "pino";
import pinoHttp from "pino-http";
import { env } from "./env";

const transport =
  env.NODE_ENV !== "production"
    ? { target: "pino-pretty", options: { colorize: true, translateTime: "SYS:standard" } }
    : undefined;

const baseLogger = pino({ level: process.env.LOG_LEVEL ?? "info" }, transport ? pino.transport(transport) : undefined);

const httpLogger = pinoHttp({ logger: baseLogger, autoLogging: false });

export { baseLogger as logger, httpLogger };