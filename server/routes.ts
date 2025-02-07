import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { searchSchema, activitiesSchema, insertItinerarySchema, insertReviewSchema, type InsertReview } from "@shared/schema";
import { generateReviewSummary, analyzeReviewSentiment } from "./utils/openai";
import { setupAuth } from "./auth";

export function registerRoutes(app: Express) {
  // Set up authentication routes (/api/register, /api/login, /api/logout, /api/user)
  setupAuth(app);

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
    const pageStr = req.query.page as string;
    const page = pageStr ? parseInt(pageStr) : 1;
    if (isNaN(page) || page < 1) {
      return res.status(400).json({ error: "Invalid page number" });
    }
    const destinations = await storage.getDestinationsByPage(page);
    res.json(destinations);
  });

  app.get("/api/attractions/:destination", async (req, res) => {
    try {
      if (!req.params.destination) {
        return res.status(400).json({ error: "Destination is required" });
      }
      const attractions = await storage.getAttractions(req.params.destination);
      res.json(attractions);
    } catch (error) {
      console.error('Error fetching attractions:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/attractions/:id/reviews", async (req, res) => {
    const reviews = await storage.getAttractionReviews(parseInt(req.params.id));
    res.json(reviews);
  });

  app.post("/api/attractions/:id/reviews", async (req, res) => {
    const result = insertReviewSchema.safeParse({
      ...req.body,
      attractionId: parseInt(req.params.id)
    });

    if (!result.success) {
      return res.status(400).json({ error: "Invalid review data" });
    }

    // Analyze sentiment using OpenAI
    const sentiment = await analyzeReviewSentiment(result.data.content);
    const review = await storage.createReview({
      ...result.data,
      sentiment: sentiment.sentiment,
      sentimentScore: Math.round(sentiment.score * 100)
    });

    // Get all reviews and generate a new summary
    const allReviews = await storage.getAttractionReviews(result.data.attractionId);
    const reviewContents = allReviews.map(r => r.content);
    const summary = await generateReviewSummary(reviewContents);

    // Update attraction with new summary
    await storage.updateAttractionReview(result.data.attractionId, summary);

    res.json(review);
  });

  // Protected route - requires authentication
  app.post("/api/itineraries", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const result = insertItinerarySchema.safeParse({
      ...req.body,
      userId: req.user!.id // Add the authenticated user's ID
    });

    if (!result.success) {
      return res.status(400).json({ error: "Invalid itinerary data" });
    }

    const itinerary = await storage.createItinerary(result.data);
    res.json(itinerary);
  });

  return createServer(app);
}