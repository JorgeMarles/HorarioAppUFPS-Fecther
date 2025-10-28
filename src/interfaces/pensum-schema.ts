import { z } from "zod";

import { SubjectPensumDataSchema } from "./subject-schema.js";

const PensumDataSchema = z.object({
  name: z.string(),
  semesters: z.number(),
  updateTeachers: z.boolean(),
  subjects: z.record(z.string(), SubjectPensumDataSchema),
});

type PensumData = z.infer<typeof PensumDataSchema>;

export { PensumData, PensumDataSchema };
