import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Itinerary() {
  const { destination } = useParams();

  const { data: attractions, isLoading } = useQuery({
    queryKey: ["/api/attractions", destination],
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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Your {destination} Itinerary</h1>

        <div className="grid gap-6 md:grid-cols-2">
          {attractions?.map((attraction) => (
            <Card key={attraction.name}>
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
                  <span>⭐ {attraction.rating}</span>
                  <span>⏰ {attraction.visitDuration}</span>
                  <span>🕒 Best time: {attraction.bestTimeToVisit}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
