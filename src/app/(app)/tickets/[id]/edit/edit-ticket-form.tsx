"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  updateTicketSchema,
  type UpdateTicketInput,
} from "@/lib/validations/ticket";
import { updateTicketAction } from "../../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TICKET_PRIORITIES, type TicketPriority } from "@/lib/constants/enums";
import { PRIORITY_META } from "@/lib/constants/display";
import { AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface EditTicketFormProps {
  ticket: {
    id: string;
    number: number;
    subject: string;
    body: string;
    priority: string;
    contactId: string;
    contact: { id: string; name: string; email: string };
    assignee: { id: string; name: string | null } | null;
  };
  contacts: Array<{ id: string; name: string; email: string }>;
}

export function EditTicketForm({ ticket, contacts }: EditTicketFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<UpdateTicketInput>({
    resolver: zodResolver(updateTicketSchema),
    defaultValues: {
      subject: ticket.subject,
      body: ticket.body,
      priority: ticket.priority as TicketPriority,
      contactId: ticket.contactId,
    },
  });

  function onSubmit(data: UpdateTicketInput) {
    setServerError(null);
    startTransition(async () => {
      const result = await updateTicketAction(ticket.id, data);
      if (!result.ok) {
        setServerError(result.error);
        return;
      }
      toast.success("Ticket updated");
      router.push(`/tickets/${ticket.id}`);
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit ticket #{ticket.number}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {serverError && (
            <div className="flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <AlertCircle className="size-4 shrink-0" />
              {serverError}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input id="subject" {...register("subject")} />
            {errors.subject && (
              <p className="text-sm text-destructive">
                {errors.subject.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="body">Description</Label>
            <Textarea id="body" rows={5} {...register("body")} />
            {errors.body && (
              <p className="text-sm text-destructive">{errors.body.message}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Contact</Label>
              <Select
                defaultValue={ticket.contactId}
                onValueChange={(v) => setValue("contactId", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {contacts.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name} ({c.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
              <Select
                defaultValue={ticket.priority}
                onValueChange={(v) =>
                  setValue("priority", v as TicketPriority)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TICKET_PRIORITIES.map((p) => (
                    <SelectItem key={p} value={p}>
                      {PRIORITY_META[p].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              Save changes
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
