import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Activity = {
  id: string;
  name: string;
  imageUrl: string;
  description: string;
};

type Props = {
  activities: Activity[];
  selected: string[];
  onSelect: (activities: string[]) => void;
};

export default function ActivityCards({ activities, selected, onSelect }: Props) {
  return (
    <div className="grid gap-4 grid-cols-2">
      {activities.map((activity) => (
        <Card
          key={activity.id}
          className={cn(
            "cursor-pointer transition-all",
            selected.includes(activity.id) 
              ? "ring-2 ring-primary" 
              : "hover:shadow-md"
          )}
          onClick={() => {
            const newSelected = selected.includes(activity.id)
              ? selected.filter(id => id !== activity.id)
              : [...selected, activity.id];
            onSelect(newSelected);
          }}
        >
          <CardContent className="p-0">
            <div
              className="w-full h-24 bg-cover bg-center"
              style={{ backgroundImage: `url(${activity.imageUrl})` }}
            />
            <div className="p-3">
              <h3 className="font-medium text-sm">{activity.name}</h3>
              <p className="text-muted-foreground text-xs">{activity.description}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
