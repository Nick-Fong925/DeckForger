import { z } from 'zod'

export const jobTypeSchema = z.enum(['extractor', 'generator'])
export type JobType = z.infer<typeof jobTypeSchema>

export const jobStatusSchema = z.enum(['complete', 'error'])
export type JobStatus = z.infer<typeof jobStatusSchema>

export const jobEventSchema = z.object({
  upload_id: z.string().uuid(),
  job_type: jobTypeSchema,
  status: jobStatusSchema,
  error: z.string().optional(),
})

export type JobEvent = z.infer<typeof jobEventSchema>
