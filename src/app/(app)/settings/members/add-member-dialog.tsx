"use client";

import { useState, useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addMemberSchema, type AddMemberInput } from "@/lib/validations/member";
import { addMemberAction } from "./actions";
import type { Role } from "@/lib/constants/enums";
import { ROLE_META } from "@/lib/constants/display";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Loader2, UserPlus } from "lucide-react";

const ASSIGNABLE_ROLES: readonly Role[] = ["VIEWER", "AGENT", "ADMIN", "OWNER"];

export function AddMemberDialog({ actorRole }: { actorRole: Role }) {
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<AddMemberInput>({
    resolver: zodResolver(addMemberSchema),
    defaultValues: { name: "", email: "", role: "AGENT" },
  });

  function onOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      reset();
      setServerError(null);
      setInviteUrl(null);
    }
  }

  function onSubmit(data: AddMemberInput) {
    setServerError(null);
    startTransition(async () => {
      const result = await addMemberAction(data);
      if (!result.ok) {
        setServerError(result.error);
        return;
      }
      if (result.data.inviteUrl) {
        setInviteUrl(result.data.inviteUrl);
      } else {
        onOpenChange(false);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm">
          <UserPlus className="mr-2 size-4" />
          Add member
        </Button>
      </DialogTrigger>
      <DialogContent>
        {inviteUrl ? (
          <>
            <DialogHeader>
              <DialogTitle>Member added</DialogTitle>
              <DialogDescription>
                Share this link so they can set a password and sign in.
              </DialogDescription>
            </DialogHeader>
            <div className="rounded-md bg-info/10 px-3 py-2 text-sm text-info-foreground">
              <p className="font-medium">Dev mode — no email provider</p>
              <a href={inviteUrl} className="mt-1 block break-all text-primary underline">
                {inviteUrl}
              </a>
            </div>
            <DialogFooter>
              <Button onClick={() => onOpenChange(false)}>Done</Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Add a member</DialogTitle>
              <DialogDescription>
                They&apos;ll get a link to set their password and join this workspace.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {serverError && (
                <div className="flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  <AlertCircle className="size-4 shrink-0" />
                  {serverError}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="member-name">Name</Label>
                <Input id="member-name" {...register("name")} />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="member-email">Email</Label>
                <Input id="member-email" type="email" {...register("email")} />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="member-role">Role</Label>
                <Controller
                  control={control}
                  name="role"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="member-role" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ASSIGNABLE_ROLES.map((role) => (
                          <SelectItem
                            key={role}
                            value={role}
                            disabled={(role === "OWNER" || role === "ADMIN") && actorRole !== "OWNER"}
                          >
                            {ROLE_META[role].label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.role && (
                  <p className="text-sm text-destructive">{errors.role.message}</p>
                )}
              </div>

              <DialogFooter>
                <Button type="submit" disabled={isPending}>
                  {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
                  Add member
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
