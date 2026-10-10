
import { z } from "zod";

const dateSchema = z.string().regex(
  /^\d{4}-\d{2}-\d{2}$/,
  "Date must use YYYY-MM-DD format"
);

const timeSchema = z.string().regex(
  /^([01]\d|2[0-3]):[0-5]\d$/,
  "Time must use HH:mm format"
).nullable().optional().or(z.literal(""));

export const taskSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().max(2000).nullable().optional(),
  subject: z.string().trim().min(1).max(100),
  due_date: dateSchema,
  due_time: timeSchema,
  priority: z.enum(["Low", "Medium", "High"]).default("Medium"),
  completed: z.boolean().default(false)
});

export const eventSchema = z.object({
  title: z.string().trim().min(1).max(200),
  subject: z.string().trim().min(1).max(100),
  category: z.enum(["Exam", "Test", "Assignment", "Other"]),
  event_date: dateSchema,
  event_time: timeSchema,
  description: z.string().max(2000).nullable().optional()
});

export const sessionSchema = z.object({
  subject: z.string().trim().min(1).max(100),
  study_date: dateSchema,
  duration_minutes: z.number().int().min(1).max(1440),
  description: z.string().max(2000).nullable().optional(),
  source: z.enum(["manual", "focus"]).nullable().optional()
});
