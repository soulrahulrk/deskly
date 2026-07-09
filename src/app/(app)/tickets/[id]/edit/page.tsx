import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTenant } from "@/lib/dal/context";
import { getTicket } from "@/lib/dal/tickets";
import { getContacts } from "@/lib/dal/contacts";
import { EditTicketForm } from "./edit-ticket-form";

interface EditTicketPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = { title: "Edit Ticket" };

export default async function EditTicketPage({ params }: EditTicketPageProps) {
  const { id } = await params;
  const { orgId } = await getTenant();
  const [ticket, contacts] = await Promise.all([
    getTicket(orgId, id),
    getContacts(orgId),
  ]);

  if (!ticket) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <EditTicketForm
        ticket={{
          id: ticket.id,
          number: ticket.number,
          subject: ticket.subject,
          body: ticket.body,
          priority: ticket.priority,
          contactId: ticket.contactId,
          contact: ticket.contact,
          assignee: ticket.assignee,
        }}
        contacts={contacts.map((c) => ({
          id: c.id,
          name: c.name,
          email: c.email,
        }))}
      />
    </div>
  );
}
