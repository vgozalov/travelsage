import { pgTable, text, serial, date, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const itineraries = pgTable("itineraries", {
  id: serial("id").primaryKey(),
  destination: text("destination").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  activities: text("activities").array().notNull(),
  attractions: jsonb("attractions").notNull().$type<{
    name: string;
    description: string;
    rating: number;
    visitDuration: string;
    bestTimeToVisit: string;
    imageUrl: string;
  }[]>(),
});

export const insertItinerarySchema = createInsertSchema(itineraries);

export type InsertItinerary = z.infer<typeof insertItinerarySchema>;
export type Itinerary = typeof itineraries.$inferSelect;

export const searchSchema = z.object({
  query: z.string().min(2),
});

export const activitiesSchema = z.object({
  activities: z.array(z.string()),
  startDate: z.string(),
  endDate: z.string(),
});
