import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { searchSchema, activitiesSchema, insertItinerarySchema, insertReviewSchema } from "@shared/schema";
import { generateReviewSummary, analyzeReviewSentiment } from "./utils/openai";

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