import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { searchSchema, activitiesSchema, insertItinerarySchema } from "@shared/schema";

export function registerRoutes(app: Express) {
  app.get("/api/destinations/search", async (req, res) => {
    const result = searchSchema.safeParse({
      query: req.query.query
    });

    if (!result.success) {
      return res.status(400).json({ error: "Invalid query" });
    }

    const destinations = await storage.searchDestinations(result.data.query);
    res.json(destinations);
  });

  app.get("/api/destinations", async (req, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const destinations = await storage.getDestinationsByPage(page);
    res.json(destinations);
  });

  app.get("/api/attractions/:destination", async (req, res) => {
    const attractions = await storage.getAttractions(req.params.destination);
    res.json(attractions);
  });

  app.post("/api/itineraries", async (req, res) => {
    const result = insertItinerarySchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: "Invalid itinerary data" });
    }

    const itinerary = await storage.createItinerary(result.data);
    res.json(itinerary);
  });

  return createServer(app);
}