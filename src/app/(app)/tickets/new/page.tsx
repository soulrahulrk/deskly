import type { Metadata } from "next";
import { getTenant } from "@/lib/dal/context";
import { getContacts } from "@/lib/dal/contacts";
import { getMembers } from "@/lib/dal/members";
import { CreateTicketForm } from "./create-ticket-form";

export const metadata: Metadata = { title: "New Ticket" };

export default async function NewTicketPage() {
  const { orgId } = await getTenant();
  const [contacts, members] = await Promise.all([
    getContacts(orgId),
    getMembers(orgId),
  ]);

  return (
    <div className="mx-auto max-w-2xl">
      <CreateTicketForm
        contacts={contacts.map((c) => ({
          id: c.id,
          name: c.name,
          email: c.email,
        }))}
        members={members.map((m) => ({
          id: m.id,
          name: m.name,
          email: m.email,
        }))}
      />
    </div>
  );
}
