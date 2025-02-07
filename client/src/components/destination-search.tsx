import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { Destination } from "@shared/schema";
import { Search } from "lucide-react";

type Props = {
  onSelect: (destination: string) => void;
};

export default function DestinationSearch({ onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const { data: destinations, isLoading } = useQuery<Destination[]>({
    queryKey: ["/api/destinations/search", { query: search }],
    enabled: search.length >= 2
  });

  const handleSelect = useCallback((destination: string) => {
    setSearch(destination); 
    setOpen(false);
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      onSelect(search.trim());
    }
  }, [search, onSelect]);

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      <div className="relative">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <div className="relative w-full">
              <Input
                placeholder="Where do you want to go?"
                className="w-full text-lg py-6 pr-10"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  if (!open && e.target.value.length >= 2) setOpen(true);
                }}
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
            <Command>
              <CommandInput 
                placeholder="Search destinations..."
                value={search}
                onValueChange={setSearch}
              />
              <CommandEmpty>
                Press enter or click continue to search for "{search}"
              </CommandEmpty>
              <CommandGroup heading="Suggestions">
                {destinations?.map((destination) => (
                  <CommandItem
                    key={destination.id}
                    onSelect={() => handleSelect(destination.name)}
                    className="cursor-pointer"
                  >
                    {destination.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <Button 
        type="submit" 
        className="w-full"
        size="lg"
        disabled={!search.trim()}
      >
        Continue
      </Button>
    </form>
  );
}