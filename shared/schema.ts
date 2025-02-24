import { pgTable, text, serial, date, jsonb, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const destinations = pgTable("destinations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  imageUrl: text("image_url").notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  imageUrl: text("image_url").notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const attractions = pgTable("attractions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  destinationId: integer("destination_id").references(() => destinations.id).notNull(),
  description: text("description").notNull(),
  rating: integer("rating").notNull(),
  visitDuration: text("visit_duration").notNull(),
  bestTimeToVisit: text("best_time_to_visit").notNull(),
  imageUrl: text("image_url").notNull(),
  reviewSummary: text("review_summary"),
  totalReviews: integer("total_reviews").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const itineraries = pgTable("itineraries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  destinationId: integer("destination_id").references(() => destinations.id).notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  activities: text("activities").array().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const itineraryAttractions = pgTable("itinerary_attractions", {
  id: serial("id").primaryKey(),
  itineraryId: integer("itinerary_id").references(() => itineraries.id).notNull(),
  attractionId: integer("attraction_id").references(() => attractions.id).notNull(),
  dayNumber: integer("day_number").notNull(),
  visitTime: text("visit_time").notNull(),
  travelTimeFromPrevious: integer("travel_time_from_previous"), 
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  attractionId: integer("attraction_id").references(() => attractions.id).notNull(),
  content: text("content").notNull(),
  rating: integer("rating").notNull(),
  sentiment: text("sentiment"),
  sentimentScore: integer("sentiment_score"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  itineraries: many(itineraries),
}));

export const destinationsRelations = relations(destinations, ({ many }) => ({
  attractions: many(attractions),
  itineraries: many(itineraries),
}));

export const attractionsRelations = relations(attractions, ({ one, many }) => ({
  destination: one(destinations, {
    fields: [attractions.destinationId],
    references: [destinations.id],
  }),
  reviews: many(reviews),
}));

export const itinerariesRelations = relations(itineraries, ({ one, many }) => ({
  user: one(users, {
    fields: [itineraries.userId],
    references: [users.id],
  }),
  destination: one(destinations, {
    fields: [itineraries.destinationId],
    references: [destinations.id],
  }),
  attractions: many(itineraryAttractions),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  attraction: one(attractions, {
    fields: [reviews.attractionId],
    references: [attractions.id],
  }),
}));

export const insertUserSchema = createInsertSchema(users, {
  username: z.string().min(3).max(50),
  password: z.string().min(6),
  email: z.string().email(),
});

export const insertDestinationSchema = createInsertSchema(destinations, {
  name: z.string().min(1),
  imageUrl: z.string().url(),
  description: z.string().min(1),
});

export const insertActivitySchema = createInsertSchema(activities, {
  name: z.string().min(1),
  imageUrl: z.string().url(),
  description: z.string().min(1),
});

export const insertAttractionSchema = createInsertSchema(attractions, {
  name: z.string().min(1),
  destinationId: z.number().positive(),
  description: z.string().min(1),
  rating: z.number().min(1).max(5),
  visitDuration: z.string().min(1),
  bestTimeToVisit: z.string().min(1),
  imageUrl: z.string().url(),
  reviewSummary: z.string().optional(),
  totalReviews: z.number().min(0),
});

export const insertItinerarySchema = createInsertSchema(itineraries, {
  userId: z.number().positive(),
  destinationId: z.number().positive(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  activities: z.array(z.string()),
});

export const insertItineraryAttractionSchema = createInsertSchema(itineraryAttractions, {
  itineraryId: z.number().positive(),
  attractionId: z.number().positive(),
  dayNumber: z.number().min(1),
  visitTime: z.string(),
  travelTimeFromPrevious: z.number().min(0).optional(),
});

export const insertReviewSchema = createInsertSchema(reviews, {
  content: z.string().min(1),
  rating: z.number().min(1).max(5),
  attractionId: z.number().positive(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Destination = typeof destinations.$inferSelect;
export type InsertDestination = z.infer<typeof insertDestinationSchema>;

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;

export type Attraction = typeof attractions.$inferSelect;
export type InsertAttraction = z.infer<typeof insertAttractionSchema>;

export type Itinerary = typeof itineraries.$inferSelect;
export type InsertItinerary = z.infer<typeof insertItinerarySchema>;

export type ItineraryAttraction = typeof itineraryAttractions.$inferSelect;
export type InsertItineraryAttraction = z.infer<typeof insertItineraryAttractionSchema>;

export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;

export const searchSchema = z.object({
  query: z.string().min(2),
});

export const activitiesSchema = z.object({
  activities: z.array(z.string()),
  startDate: z.string(),
  endDate: z.string(),
});