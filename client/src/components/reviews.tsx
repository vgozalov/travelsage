import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertReviewSchema } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Star, MessageSquare, ThumbsUp, ThumbsDown } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Review, InsertReview } from "@shared/schema";

type Props = {
  attractionId: number;
};

export default function Reviews({ attractionId }: Props) {
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  const form = useForm<InsertReview>({
    resolver: zodResolver(insertReviewSchema),
    defaultValues: {
      content: "",
      rating: 5,
      attractionId
    }
  });

  const { data: reviews, isLoading } = useQuery<Review[]>({
    queryKey: ["/api/attractions", attractionId, "reviews"],
    queryFn: async () => {
      const res = await fetch(`/api/attractions/${attractionId}/reviews`);
      if (!res.ok) throw new Error("Failed to fetch reviews");
      return res.json();
    }
  });

  const { mutate: submitReview, isPending } = useMutation({
    mutationFn: async (data: InsertReview) => {
      const res = await fetch(`/api/attractions/${attractionId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error("Failed to submit review");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/attractions", attractionId, "reviews"] });
      queryClient.invalidateQueries({ queryKey: ["/api/attractions"] });
      form.reset();
      setShowForm(false);
      toast({
        title: "Review submitted",
        description: "Thank you for your feedback!"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to submit review",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  if (isLoading) {
    return <div>Loading reviews...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Reviews</h3>
        <Button 
          variant="outline" 
          onClick={() => setShowForm(!showForm)}
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          Write a Review
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => submitReview(data))} className="space-y-4">
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea 
                          placeholder="Share your experience..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end">
                  <Button type="submit" disabled={isPending}>
                    Submit Review
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {reviews?.map((review) => (
          <Card key={review.id}>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex text-yellow-500">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                {review.sentiment && (
                  <div className={`flex items-center gap-1 ${
                    review.sentiment === 'positive' ? 'text-green-500' : 
                    review.sentiment === 'negative' ? 'text-red-500' : 'text-gray-500'
                  }`}>
                    {review.sentiment === 'positive' ? (
                      <ThumbsUp className="w-4 h-4" />
                    ) : review.sentiment === 'negative' ? (
                      <ThumbsDown className="w-4 h-4" />
                    ) : null}
                    <span className="text-xs capitalize">{review.sentiment}</span>
                  </div>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{review.content}</p>
              <div className="text-xs text-muted-foreground mt-2">
                {new Date(review.createdAt).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}