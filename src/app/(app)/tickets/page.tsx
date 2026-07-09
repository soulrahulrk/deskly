import type { Metadata } from "next";
import Link from "next/link";
import { getTenant } from "@/lib/dal/context";
import { getTickets } from "@/lib/dal/tickets";
import { can } from "@/lib/auth/permissions";
import type { Role, TicketStatus, TicketPriority } from "@/lib/constants/enums";
import { STATUS_META, PRIORITY_META } from "@/lib/constants/display";
import { StatusDot } from "@/components/status-dot";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export const metadata: Metadata = { title: "Tickets" };

export default async function TicketsPage() {
  const { user } = await getTenant();
  const { orgId } = await getTenant();
  const tickets = await getTickets(orgId);
  const canCreate = can({ role: user.role as Role }, "ticket:create");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tickets</h1>
          <p className="text-sm text-muted-foreground">
            {tickets.length} {tickets.length === 1 ? "ticket" : "tickets"}
          </p>
        </div>
        {canCreate && (
          <Button asChild>
            <Link href="/tickets/new">
              <Plus className="mr-2 size-4" />
              New ticket
            </Link>
          </Button>
        )}
      </div>

      {tickets.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
          <p className="text-sm text-muted-foreground">
            No tickets yet. Create your first one to get started.
          </p>
          {canCreate && (
            <Button asChild variant="outline" className="mt-4">
              <Link href="/tickets/new">
                <Plus className="mr-2 size-4" />
                Create ticket
              </Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">#</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead className="hidden md:table-cell">Status</TableHead>
                <TableHead className="hidden md:table-cell">Priority</TableHead>
                <TableHead className="hidden lg:table-cell">Contact</TableHead>
                <TableHead className="hidden lg:table-cell">Assignee</TableHead>
                <TableHead className="hidden sm:table-cell text-right">
                  Created
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.map((ticket) => (
                <TableRow key={ticket.id} className="group">
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {ticket.number}
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/tickets/${ticket.id}`}
                      className="font-medium hover:text-primary hover:underline"
                    >
                      {ticket.subject}
                    </Link>
                    <div className="mt-0.5 flex items-center gap-2 md:hidden">
                      <StatusDot
                        meta={STATUS_META[ticket.status as TicketStatus]}
                        className="text-xs"
                      />
                      <StatusDot
                        meta={PRIORITY_META[ticket.priority as TicketPriority]}
                        className="text-xs"
                      />
                    </div>
                    {ticket._count.comments > 0 && (
                      <span className="ml-2 inline-flex items-center gap-0.5 text-xs text-muted-foreground">
                        <MessageSquare className="size-3" />
                        {ticket._count.comments}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <StatusDot
                      meta={STATUS_META[ticket.status as TicketStatus]}
                    />
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <StatusDot
                      meta={PRIORITY_META[ticket.priority as TicketPriority]}
                    />
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                    {ticket.contact.name}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {ticket.assignee ? (
                      <div className="flex items-center gap-2">
                        <Avatar className="size-6">
                          <AvatarImage
                            src={ticket.assignee.image ?? undefined}
                          />
                          <AvatarFallback className="text-[10px]">
                            {(ticket.assignee.name ?? "?")[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">
                          {ticket.assignee.name}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-right text-sm text-muted-foreground">
                    {formatDistanceToNow(ticket.createdAt, {
                      addSuffix: true,
                    })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
