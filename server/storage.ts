import { eq, sql, desc, asc } from "drizzle-orm";
import { db } from "./db";
import { mockDestinations, mockAttractions } from "../client/src/lib/constants";
import { 
  destinations, activities, attractions, itineraries, itineraryAttractions,
  reviews, users, type Itinerary, type InsertItinerary, type Review, 
  type InsertUser, type User
} from "@shared/schema";
import session from "express-session";
import connectPg from "connect-pg-simple";

const PostgresSessionStore = connectPg(session);
const PAGE_SIZE = 12;

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Itinerary operations
  createItinerary(itinerary: InsertItinerary): Promise<Itinerary>;
  searchDestinations(query: string): Promise<typeof mockDestinations>;
  getDestinationsByPage(page: number): Promise<{pages: typeof mockDestinations, nextCursor?: number}>;
  getAttractions(destination: string): Promise<typeof mockAttractions>;
  getAttractionReviews(attractionId: number): Promise<Review[]>;
  createReview(review: InsertReview & { sentiment: string, sentimentScore: number }): Promise<Review>;
  updateAttractionReview(attractionId: number, summary: string): Promise<void>;

  // Session store
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      conObject: {
        connectionString: process.env.DATABASE_URL,
      },
      createTableIfMissing: true,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async createItinerary(insertItinerary: InsertItinerary): Promise<Itinerary> {
    const [itinerary] = await db
      .insert(itineraries)
      .values({
        ...insertItinerary,
        startDate: new Date(insertItinerary.startDate).toISOString(),
        endDate: new Date(insertItinerary.endDate).toISOString(),
      })
      .returning();
    return itinerary;
  }

  async searchDestinations(query: string) {
    const results = await db
      .select()
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
      .select()
      .from(destinations)
      .orderBy(asc(destinations.name))
      .limit(PAGE_SIZE)
      .offset(offset);

    return {
      pages: results.length > 0 ? results : mockDestinations,
      nextCursor: (results.length === PAGE_SIZE || (!results.length && mockDestinations.length === PAGE_SIZE)) ? page + 1 : undefined
    };
  }

  async getAttractions(destinationName: string) {
    try {
      const results = await db
        .select({
          id: attractions.id,
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
    } catch (error) {
      console.error('Error fetching attractions:', error);
      return mockAttractions.filter(a => 
        a.destination.toLowerCase() === destinationName.toLowerCase()
      );
    }
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