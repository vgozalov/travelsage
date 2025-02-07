import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Star, Clock, Sun } from "lucide-react";
import Reviews from "@/components/reviews";
import type { Attraction } from "@shared/schema";

export default function Itinerary() {
  const { destination } = useParams();

  const { data: attractions, isLoading, error } = useQuery<Attraction[]>({
    queryKey: ["/api/attractions", destination],
    queryFn: () => fetch(`/api/attractions/${encodeURIComponent(destination!)}`).then(res => {
      if (!res.ok) throw new Error('Failed to load attractions');
      return res.json();
    }),
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
            <Card key={attraction.id} className="overflow-hidden">
              <CardHeader>
                <CardTitle className="flex justify-between items-start">
                  <span>{attraction.name}</span>
                  <div className="flex items-center text-yellow-500">
                    <Star className="w-5 h-5 fill-current" />
                    <span className="ml-1">{attraction.rating}</span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div 
                  className="w-full h-48 bg-cover bg-center rounded-md"
                  style={{ backgroundImage: `url(${attraction.imageUrl})` }}
                />

                <p className="text-muted-foreground">{attraction.description}</p>

                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {attraction.visitDuration}
                  </div>
                  <div className="flex items-center gap-1">
                    <Sun className="w-4 h-4" />
                    Best: {attraction.bestTimeToVisit}
                  </div>
                </div>

                {attraction.reviewSummary && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-semibold mb-2">Review Summary</h3>
                      <p className="text-sm text-muted-foreground">{attraction.reviewSummary}</p>
                    </div>
                  </>
                )}

                <Separator />
                <Reviews attractionId={attraction.id} />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}