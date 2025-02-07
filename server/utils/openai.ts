import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing OPENAI_API_KEY environment variable");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function generateReviewSummary(reviews: string[]): Promise<string> {
  try {
    const prompt = `Analyze and summarize these travel reviews. Focus on:
    - Overall sentiment
    - Key highlights
    - Common complaints
    - Best times to visit
    - Tips for visitors

    Reviews:
    ${reviews.join("\n")}
    
    Please provide a concise, well-structured summary.`;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-3.5-turbo",
      temperature: 0.7,
      max_tokens: 500
    });

    return completion.choices[0]?.message?.content || "No summary available";
  } catch (error) {
    console.error("Error generating review summary:", error);
    throw new Error("Failed to generate review summary");
  }
}

export async function analyzeReviewSentiment(review: string): Promise<{
  sentiment: "positive" | "negative" | "neutral";
  score: number;
}> {
  try {
    const prompt = `Analyze the sentiment of this travel review and provide a score from 0 to 1:
    
    Review: ${review}
    
    Respond in JSON format:
    {
      "sentiment": "positive|negative|neutral",
      "score": 0.0 to 1.0
    }`;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-3.5-turbo",
      temperature: 0,
      max_tokens: 100,
      response_format: { type: "json_object" }
    });

    return JSON.parse(completion.choices[0]?.message?.content || '{"sentiment":"neutral","score":0.5}');
  } catch (error) {
    console.error("Error analyzing review sentiment:", error);
    return { sentiment: "neutral", score: 0.5 };
  }
}
