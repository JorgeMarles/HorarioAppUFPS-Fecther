import { z } from "zod";
import { PensumDataSchema } from "./pensum-schema";
import { SubjectDataSchema } from "./subject-schema";


const FetchingResponseSchema = z.object({
    jobId: z.number(),
    callbackUrl: z.string().url(),
    success: z.boolean(),
    response: z.string(),
    data: z.union([PensumDataSchema, SubjectDataSchema]).optional()
})

type FetchingResponse = z.infer<typeof FetchingResponseSchema>

export {
    FetchingResponse,
    FetchingResponseSchema
}