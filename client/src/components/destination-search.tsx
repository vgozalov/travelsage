import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type Props = {
  onSelect: (destination: string) => void;
};

export default function DestinationSearch({ onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const { data: destinations } = useQuery({
    queryKey: ["/api/destinations/search", { query: search }],
    enabled: search.length >= 2
  });

  const handleSelect = useCallback((destination: string) => {
    onSelect(destination);
    setOpen(false);
  }, [onSelect]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Input
          placeholder="Where do you want to go?"
          className="w-full text-lg py-6"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search destinations..." />
          <CommandEmpty>No destinations found.</CommandEmpty>
          <CommandGroup>
            {destinations?.map((destination) => (
              <CommandItem
                key={destination.name}
                onSelect={() => handleSelect(destination.name)}
              >
                {destination.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
