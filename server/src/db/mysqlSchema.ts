import { mysqlTable, serial, varchar, int, timestamp} from "drizzle-orm/mysql-core";

export const urls = mysqlTable("urls", {
    id: serial('id').primaryKey(),
    shortCode: varchar('short_code', {length: 10}).unique().notNull(),
    longUrl: varchar('long_url', {length: 2048}).notNull(),
    clicks: int('clicks').default(0).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull()
})

export type Url = typeof urls.$inferSelect