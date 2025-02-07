import { useCallback } from "react";
import { useLocation } from "wouter";
import DestinationSearch from "@/components/destination-search";
import DestinationCards from "@/components/destination-cards";

export default function Home() {
  const [, setLocation] = useLocation();
  
  const onDestinationSelect = useCallback((destination: string) => {
    setLocation(`/plan/${encodeURIComponent(destination)}`);
  }, [setLocation]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          Plan Your Perfect Trip
        </h1>
        
        <div className="max-w-2xl mx-auto mb-12">
          <DestinationSearch onSelect={onDestinationSelect} />
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Popular Destinations</h2>
          <DestinationCards onSelect={onDestinationSelect} />
        </div>
      </div>
    </div>
  );
}
