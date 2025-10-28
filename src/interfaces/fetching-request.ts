import { z } from "zod";

// Interfaces TypeScript para tsoa
type PensumRequest = {
  jobId: number;
  cookie: string;
  type: "PENSUM";
  updateTeachers: boolean;
};

type SubjectRequest = {
  jobId: number;
  cookie: string;
  type: "SUBJECT";
  code: string;
  isPrincipal: boolean;
};

type FetchingRequest = PensumRequest | SubjectRequest;

const PensumRequestSchema = z.object({
  jobId: z.number(),
  cookie: z.string(),
  type: z.literal("PENSUM"),
  updateTeachers: z.boolean(),
});

const SubjectRequestSchema = z.object({
  jobId: z.number(),
  cookie: z.string(),
  type: z.literal("SUBJECT"),
  code: z.string(),
  isPrincipal: z.boolean(),
});

const FetchingRequestSchema = z.discriminatedUnion("type", [
  PensumRequestSchema,
  SubjectRequestSchema,
]);

export {
  PensumRequest,
  PensumRequestSchema,
  FetchingRequest,
  FetchingRequestSchema,
  SubjectRequest,
  SubjectRequestSchema,
};
