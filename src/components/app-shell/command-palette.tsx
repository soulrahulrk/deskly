"use client";

import { useEffect, useState, useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";
import { TicketIcon, UserIcon } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { performGlobalSearch } from "@/app/(app)/search-actions";
import type { SearchResult } from "@/lib/dal/search";

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);
  const [results, setResults] = useState<SearchResult>({ tickets: [], contacts: [] });
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      startTransition(() => {
        performGlobalSearch(debouncedQuery).then(setResults);
      });
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResults({ tickets: [], contacts: [] });
    }
  }, [debouncedQuery]);

  const handleSelect = useCallback(
    (href: string) => {
      setOpen(false);
      setQuery("");
      router.push(href);
    },
    [router]
  );

  return (
    <CommandDialog open={open} onOpenChange={setOpen} title="Global Search">
      <CommandInput
        placeholder="Type a command or search..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>
          {isPending ? "Searching..." : "No results found."}
        </CommandEmpty>
        
        {results.tickets.length > 0 && (
          <CommandGroup heading="Tickets">
            {results.tickets.map((ticket) => (
              <CommandItem
                key={ticket.id}
                onSelect={() => handleSelect(`/tickets/${ticket.id}`)}
              >
                <TicketIcon className="mr-2 size-4" />
                <span>#{ticket.number} {ticket.subject}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {results.tickets.length > 0 && results.contacts.length > 0 && (
          <CommandSeparator />
        )}

        {results.contacts.length > 0 && (
          <CommandGroup heading="Contacts">
            {results.contacts.map((contact) => (
              <CommandItem
                key={contact.id}
                onSelect={() => handleSelect(`/contacts/${contact.id}`)}
              >
                <UserIcon className="mr-2 size-4" />
                <span>{contact.name} ({contact.email})</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
