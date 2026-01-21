import { z } from 'zod'

//long url request body schema
export const reqSchema = z.object({
    longUrl: z.string().url({message: "Invalid URL format"})
    .regex(/^https?:\/\//, {message: "Only http/https allowed"})
    .max(2048, {message: "URL too long (max 2028)"})
    ,

    slug: z.string()
    .min(6, {message:"Code too short"})
    .max(10, {message: "Code too long"})
    .regex(/^[a-zA-Z0-9_-]+$/, {message: "Invalid Code format"})
    .optional()
})

export type reqType = z.infer<typeof reqSchema>

//short code schema
export const shortCodeSchema = z.string()
.min(6, {message:"Code too short"})
.max(10, {message: "Code too long"})
.regex(/^[a-zA-Z0-9_-]+$/, {message: "Invalid Code format"})

export type shortCodeType = z.infer<typeof shortCodeSchema>