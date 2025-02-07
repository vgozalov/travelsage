import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Attraction } from "@shared/schema";

export default function Itinerary() {
  const { destination } = useParams();

  const { data: attractions, isLoading, error } = useQuery<Attraction[]>({
    queryKey: ["/api/attractions", destination],
    enabled: !!destination
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-64 mb-8" />
        <div className="grid gap-6 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">Error</h1>
        <p className="text-red-500">Failed to load attractions. Please try again.</p>
      </div>
    );
  }

  if (!attractions || attractions.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">No Attractions Found</h1>
        <p>We couldn't find any attractions for {destination}. Try another destination.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Your {destination} Itinerary</h1>

        <div className="grid gap-6 md:grid-cols-2">
          {attractions.map((attraction) => (
            <Card key={attraction.name} className="overflow-hidden">
              <CardHeader>
                <CardTitle>{attraction.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  className="w-full h-48 mb-4 bg-cover bg-center rounded-md"
                  style={{ backgroundImage: `url(${attraction.imageUrl})` }}
                />
                <p className="text-muted-foreground mb-2">{attraction.description}</p>
                <div className="flex gap-4 text-sm">
                  <span className="flex items-center gap-1">
                    <span className="text-yellow-500">⭐</span> {attraction.rating}
                  </span>
                  <span className="flex items-center gap-1">
                    <span>⏰</span> {attraction.visitDuration}
                  </span>
                  <span className="flex items-center gap-1">
                    <span>🕒</span> Best: {attraction.bestTimeToVisit}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}