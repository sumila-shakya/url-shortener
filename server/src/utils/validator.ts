import { z } from 'zod'

export const reqSchema = z.object({
    longUrl: z.string().url({message: "Invalid URL format"})
    .regex(/^https?:\/\//, {message: "Only http/https allowed"})
    .max(2048, {message: "URL too long (max 2028)"})
})

export type reqType = z.infer<typeof reqSchema>

export const shortCodeSchema = z.string()
.min(6, {message:"Code too short"})
.max(10, {message: "Code too long"})
.regex(/^[a-zA-Z0-9]+$/, {message: "Invalid Code format"})

export type shortCodeType = z.infer<typeof shortCodeSchema>