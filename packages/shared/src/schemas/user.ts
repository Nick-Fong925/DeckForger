import { z } from 'zod'

export const userSchema = z.object({
  firebase_uid: z.string(),
  email: z.string().email(),
  created_at: z.string().datetime(),
})

export type User = z.infer<typeof userSchema>
