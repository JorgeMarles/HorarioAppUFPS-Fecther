import { z } from "zod";

import { SubjectPensumDataSchema } from "./subject-schema.js";

const PensumDataSchema = z.object({
  name: z.string().optional(),
  semesters: z.number().optional(),
  updateTeachers: z.boolean().optional(),
  subjects: z.record(z.string(), SubjectPensumDataSchema).optional(),
});

type PensumData = z.infer<typeof PensumDataSchema>;

export { PensumData, PensumDataSchema };
