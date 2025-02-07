import { Card, CardContent } from "@/components/ui/card";
import { mockDestinations } from "@/lib/constants";

type Props = {
  onSelect: (destination: string) => void;
};

export default function DestinationCards({ onSelect }: Props) {
  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {mockDestinations.map((destination) => (
        <Card 
          key={destination.name}
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => onSelect(destination.name)}
        >
          <CardContent className="p-0">
            <div
              className="w-full h-48 bg-cover bg-center"
              style={{ backgroundImage: `url(${destination.imageUrl})` }}
            />
            <div className="p-4">
              <h3 className="font-semibold text-lg">{destination.name}</h3>
              <p className="text-muted-foreground text-sm">{destination.description}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
