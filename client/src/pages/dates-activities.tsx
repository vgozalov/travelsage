import { useCallback } from "react";
import { useLocation, useParams } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { activitiesSchema } from "@shared/schema";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import ActivityCards from "@/components/activity-cards";
import { activities } from "@/lib/constants";

export default function DatesActivities() {
  const { destination } = useParams();
  const [, setLocation] = useLocation();
  
  const form = useForm({
    resolver: zodResolver(activitiesSchema),
    defaultValues: {
      activities: [],
      startDate: "",
      endDate: ""
    }
  });

  const onSubmit = useCallback((data: any) => {
    setLocation(`/itinerary/${encodeURIComponent(destination)}`);
  }, [destination, setLocation]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Plan your trip to {destination}</h1>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid gap-8 md:grid-cols-2">
              <div>
                <h2 className="text-xl font-semibold mb-4">When are you traveling?</h2>
                <Calendar 
                  mode="range"
                  selected={form.watch(["startDate", "endDate"])}
                  onSelect={(range) => {
                    if (range?.from) form.setValue("startDate", range.from.toISOString());
                    if (range?.to) form.setValue("endDate", range.to.toISOString());
                  }}
                  className="rounded-md border"
                />
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4">What interests you?</h2>
                <ActivityCards 
                  activities={activities}
                  selected={form.watch("activities")}
                  onSelect={(ids) => form.setValue("activities", ids)}
                />
              </div>
            </div>

            <Button 
              type="submit" 
              size="lg"
              className="w-full md:w-auto"
            >
              Create Itinerary
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
