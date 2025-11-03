import { z } from "zod";

const SubjectPensumDataSchema = z.object({
  code: z.string(),
  name: z.string(),
  credits: z.number(),
  hours: z.number(),
  semester: z.number(),
  requiredCredits: z.number().default(0),
  type: z.enum(["MANDATORY", "ELECTIVE"]),
  requisites: z.array(z.string()),
});

const SessionDataSchema = z.object({
  day: z.number(),
  beginHour: z.number(),
  endHour: z.number(),
  classroom: z.string(),
})

const GroupDataSchema = z.object({
  code: z.string(),
  teacher: z.string(),
  program: z.string(),
  maxCapacity: z.number(),
  availableCapacity: z.number(),
  sessions: z.array(SessionDataSchema),
});

const SubjectDataSchema = z.object({
    type: z.literal("SUBJECT"),
  isPrincipal: z.boolean(),
  code: z.string(),
  groups: z.record(z.string(), GroupDataSchema),
  equivalences: z.array(z.string()),
});

type SubjectData = z.infer<typeof SubjectDataSchema>;
type SubjectPensumData = z.infer<typeof SubjectPensumDataSchema>;
type SessionData = z.infer<typeof SessionDataSchema>;
type GroupData = z.infer<typeof GroupDataSchema>;

export { SubjectData, SubjectDataSchema, SubjectPensumData, SubjectPensumDataSchema, SessionData, SessionDataSchema, GroupData, GroupDataSchema };
