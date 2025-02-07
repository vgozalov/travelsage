import { useCallback, useState, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Destination } from "@shared/schema";
import { mockDestinations } from "@/lib/constants";

type Props = {
  onSelect: (destination: string) => void;
};

const PAGE_SIZE = 8;

export default function DestinationCards({ onSelect }: Props) {
  const { ref, inView } = useInView();

  const { 
    data: destinations,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: ["/api/destinations"],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await fetch(`/api/destinations?page=${pageParam}`);
      if (!res.ok) throw new Error('Failed to fetch destinations');
      return res.json();
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialData: {
      pages: [{
        pages: mockDestinations.slice(0, PAGE_SIZE),
        nextCursor: 2
      }],
      pageParams: [1]
    }
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {destinations?.pages.flatMap(page => page.pages).map((destination: Destination) => (
        <Card 
          key={destination.id}
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

      {/* Loading indicator */}
      {(hasNextPage || isFetchingNextPage) && (
        <div ref={ref} className="col-span-full">
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-72" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}