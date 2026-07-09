"use client";

import { useState, useTransition } from "react";
import { addCommentAction } from "@/app/(app)/tickets/actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";

interface CommentFormProps {
  ticketId: string;
}

export function CommentForm({ ticketId }: CommentFormProps) {
  const [body, setBody] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [isPending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;

    startTransition(async () => {
      const result = await addCommentAction({ ticketId, body, isInternal });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setBody("");
      toast.success(isInternal ? "Internal note added" : "Reply sent");
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <Textarea
        placeholder={
          isInternal ? "Write an internal note…" : "Write a reply…"
        }
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={3}
        className={isInternal ? "border-warning/50 bg-warning/5" : ""}
      />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Switch
            id="internal"
            checked={isInternal}
            onCheckedChange={setIsInternal}
          />
          <Label htmlFor="internal" className="text-sm text-muted-foreground">
            Internal note
          </Label>
        </div>
        <Button type="submit" size="sm" disabled={isPending || !body.trim()}>
          {isPending ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <Send className="mr-2 size-4" />
          )}
          {isInternal ? "Add note" : "Reply"}
        </Button>
      </div>
    </form>
  );
}
