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

const SubjectDataSchema = z.object({
  code: z.string(),
  groups: z.record(z.string(), z.object({
    name: z.string(),
    teacher: z.string(),
    program: z.string(),
    maxCapacity: z.string(),
    availableCapacity: z.string(),
    sessions: z.array(z.object({
      day: z.number(),
      beginHour: z.number(),
      endHour: z.number(),
      classroom: z.string(),
    })),
  })),
  equivalences: z.array(z.string()),
});

type SubjectData = z.infer<typeof SubjectDataSchema>;
type SubjectPensumData = z.infer<typeof SubjectPensumDataSchema>;

export { SubjectData, SubjectDataSchema, SubjectPensumData, SubjectPensumDataSchema };
