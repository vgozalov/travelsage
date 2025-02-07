import { eq, sql, desc, asc } from "drizzle-orm";
import { db } from "./db";
import { mockDestinations, mockAttractions } from "../client/src/lib/constants";
import { 
  destinations, activities, attractions, itineraries, itineraryAttractions,
  reviews, type Itinerary, type InsertItinerary, type Review, type InsertReview
} from "@shared/schema";

const PAGE_SIZE = 12;

export interface IStorage {
  createItinerary(itinerary: InsertItinerary): Promise<Itinerary>;
  searchDestinations(query: string): Promise<typeof mockDestinations>;
  getDestinationsByPage(page: number): Promise<{pages: typeof mockDestinations, nextCursor?: number}>;
  getAttractions(destination: string): Promise<typeof mockAttractions>;
  getAttractionReviews(attractionId: number): Promise<Review[]>;
  createReview(review: InsertReview & { sentiment: string, sentimentScore: number }): Promise<Review>;
  updateAttractionReview(attractionId: number, summary: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async createItinerary(insertItinerary: InsertItinerary): Promise<Itinerary> {
    const [itinerary] = await db
      .insert(itineraries)
      .values(insertItinerary)
      .returning();
    return itinerary;
  }

  async searchDestinations(query: string) {
    const results = await db
      .select({
        name: destinations.name,
        imageUrl: destinations.imageUrl,
        description: destinations.description,
      })
      .from(destinations)
      .where(sql`LOWER(${destinations.name}) LIKE LOWER(${`%${query}%`})`)
      .orderBy(desc(destinations.name))
      .limit(10);

    return results.length > 0 ? results : mockDestinations.filter(d => 
      d.name.toLowerCase().includes(query.toLowerCase())
    );
  }

  async getDestinationsByPage(page: number) {
    const offset = (page - 1) * PAGE_SIZE;

    const results = await db
      .select({
        name: destinations.name,
        imageUrl: destinations.imageUrl,
        description: destinations.description,
      })
      .from(destinations)
      .orderBy(asc(destinations.name))
      .limit(PAGE_SIZE)
      .offset(offset);

    return results.length > 0 ? {
      pages: results,
      nextCursor: results.length === PAGE_SIZE ? page + 1 : undefined
    } : {
      pages: mockDestinations,
      nextCursor: mockDestinations.length === PAGE_SIZE ? page + 1 : undefined
    };
  }

  async getAttractions(destinationName: string) {
    const results = await db
      .select({
        name: attractions.name,
        destination: destinations.name,
        description: attractions.description,
        rating: attractions.rating,
        visitDuration: attractions.visitDuration,
        bestTimeToVisit: attractions.bestTimeToVisit,
        imageUrl: attractions.imageUrl,
        reviewSummary: attractions.reviewSummary,
        totalReviews: attractions.totalReviews,
      })
      .from(attractions)
      .innerJoin(destinations, eq(attractions.destinationId, destinations.id))
      .where(sql`LOWER(${destinations.name}) = LOWER(${destinationName})`)
      .orderBy(desc(attractions.rating))
      .limit(10);

    return results.length > 0 ? results : mockAttractions.filter(a => 
      a.destination.toLowerCase() === destinationName.toLowerCase()
    );
  }

  async getAttractionReviews(attractionId: number): Promise<Review[]> {
    return db
      .select()
      .from(reviews)
      .where(eq(reviews.attractionId, attractionId))
      .orderBy(desc(reviews.createdAt));
  }

  async createReview(review: InsertReview & { sentiment: string, sentimentScore: number }): Promise<Review> {
    const [newReview] = await db
      .insert(reviews)
      .values(review)
      .returning();

    // Update total reviews count
    await db
      .update(attractions)
      .set({ 
        totalReviews: sql`${attractions.totalReviews} + 1`
      })
      .where(eq(attractions.id, review.attractionId));

    return newReview;
  }

  async updateAttractionReview(attractionId: number, summary: string): Promise<void> {
    await db
      .update(attractions)
      .set({ reviewSummary: summary })
      .where(eq(attractions.id, attractionId));
  }
}

export const storage = new DatabaseStorage();