import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const events = pgTable("events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  date: text("date").notNull(),
  passwordProtected: boolean("password_protected").notNull().default(false),
  adminPassword: text("admin_password"),
  archived: boolean("archived").notNull().default(false),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const checkins = pgTable("checkins", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id").notNull().references(() => events.id),
  employeeId: text("employee_id").notNull(),
  timestamp: timestamp("timestamp").notNull().default(sql`now()`),
});



export const insertCheckinSchema = createInsertSchema(checkins).omit({
  id: true,
  timestamp: true,
}).extend({
  employeeId: z.string()
    .regex(/^\d{6}$/, "Employee ID must be exactly 6 digits")
    .refine((id) => id !== "000000", "Employee ID cannot be 000000"),
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true,
}).extend({
  name: z.string().min(1, "Event name is required").refine((name) => name.trim().length > 0, "Event name cannot be blank"),
  date: z.string().refine((date) => {
    const eventDate = new Date(date + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return eventDate >= today;
  }, "Event date must be today or in the future"),
});

export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;
export type InsertCheckin = z.infer<typeof insertCheckinSchema>;
export type Checkin = typeof checkins.$inferSelect;

// Extended types for API responses
export type CheckinWithEvent = Checkin & {
  event: Event;
};
