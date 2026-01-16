import { z } from 'zod'

export const reqSchema = z.object({
    longUrl: z.string().url({error: "Invalid URL format"})
    .regex(/^https?:\/\//, {error: "Only http/https allowed"})
    .max(2048, {error: "URL too long (max 2028)"})
})

export type reqType = z.infer<typeof reqSchema>