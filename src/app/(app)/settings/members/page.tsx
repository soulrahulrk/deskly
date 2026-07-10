import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTenant } from "@/lib/dal/context";
import { getMembers } from "@/lib/dal/members";
import { can } from "@/lib/auth/permissions";
import type { Role } from "@/lib/constants/enums";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MembersTable } from "./members-table";
import { AddMemberDialog } from "./add-member-dialog";

export const metadata: Metadata = { title: "Members" };

export default async function MembersSettingsPage() {
  const { user, orgId } = await getTenant();
  const role = user.role as Role;
  if (!can({ role }, "member:manage")) notFound();

  const members = await getMembers(orgId);

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Members</CardTitle>
          <CardDescription>
            {members.length} {members.length === 1 ? "person has" : "people have"} access to this
            workspace.
          </CardDescription>
        </div>
        <AddMemberDialog actorRole={role} />
      </CardHeader>
      <CardContent>
        <MembersTable members={members} currentUserId={user.id} actorRole={role} />
      </CardContent>
    </Card>
  );
}
