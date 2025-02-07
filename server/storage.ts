import { Itinerary, InsertItinerary } from "@shared/schema";
import { mockDestinations, mockAttractions } from "../client/src/lib/constants";

export interface IStorage {
  createItinerary(itinerary: InsertItinerary): Promise<Itinerary>;
  searchDestinations(query: string): Promise<typeof mockDestinations>;
  getAttractions(destination: string): Promise<typeof mockAttractions>;
}

export class MemStorage implements IStorage {
  private itineraries: Map<number, Itinerary>;
  private currentId: number;

  constructor() {
    this.itineraries = new Map();
    this.currentId = 1;
  }

  async createItinerary(insertItinerary: InsertItinerary): Promise<Itinerary> {
    const id = this.currentId++;
    const itinerary = { ...insertItinerary, id };
    this.itineraries.set(id, itinerary);
    return itinerary;
  }

  async searchDestinations(query: string) {
    return mockDestinations.filter(d => 
      d.name.toLowerCase().includes(query.toLowerCase())
    );
  }

  async getAttractions(destination: string) {
    return mockAttractions.filter(a => 
      a.destination.toLowerCase() === destination.toLowerCase()
    );
  }
}

export const storage = new MemStorage();
