import { eq, sql, desc, asc } from "drizzle-orm";
import { db } from "./db";
import { mockDestinations, mockAttractions } from "../client/src/lib/constants";
import { 
  destinations, activities, attractions, itineraries, itineraryAttractions,
  type Itinerary, type InsertItinerary
} from "@shared/schema";

const PAGE_SIZE = 12;

export interface IStorage {
  createItinerary(itinerary: InsertItinerary): Promise<Itinerary>;
  searchDestinations(query: string): Promise<typeof mockDestinations>;
  getDestinationsByPage(page: number): Promise<{pages: typeof mockDestinations, nextCursor?: number}>;
  getAttractions(destination: string): Promise<typeof mockAttractions>;
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
}

export const storage = new DatabaseStorage();