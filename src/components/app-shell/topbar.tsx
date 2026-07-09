import type { Role } from "@/lib/constants/enums";
import { MobileSidebar } from "./sidebar";
import { UserMenu } from "./user-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { CommandPalette } from "./command-palette";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TopbarProps {
  user: {
    name: string | null | undefined;
    email: string | null | undefined;
    image: string | null | undefined;
    role: Role;
  };
}

/**
 * Top bar for the authenticated app shell. Sits above the main content area,
 * provides the mobile nav trigger on the left and user menu on the right.
 */
export function Topbar({ user }: TopbarProps) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b px-4 lg:px-6">
      <MobileSidebar />
      <div className="ml-auto flex items-center gap-2">
        <Button
          variant="outline"
          className="relative h-9 w-9 p-0 xl:h-9 xl:w-60 xl:justify-start xl:px-3 xl:py-2 text-muted-foreground"
          onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
          aria-label="Search"
        >
          <Search className="h-4 w-4 xl:mr-2" />
          <span className="hidden xl:inline-flex">Search tickets & contacts...</span>
          <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 xl:flex">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>
        <ThemeToggle />
        <UserMenu
          name={user.name}
          email={user.email}
          image={user.image}
          role={user.role}
        />
      </div>
      <CommandPalette />
    </header>
  );
}
