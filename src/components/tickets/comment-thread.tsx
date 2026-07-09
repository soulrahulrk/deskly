import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

interface Comment {
  id: string;
  body: string;
  isInternal: boolean;
  createdAt: Date;
  author: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
}

interface CommentThreadProps {
  comments: Comment[];
}

/**
 * Renders a chronological list of comments. Internal notes are visually
 * distinct (yellow tint + badge) from public replies.
 */
export function CommentThread({ comments }: CommentThreadProps) {
  if (comments.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No comments yet. Be the first to reply.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <div
          key={comment.id}
          className={cn(
            "rounded-lg border p-4",
            comment.isInternal && "border-warning/30 bg-warning/5",
          )}
        >
          <div className="flex items-center gap-2">
            <Avatar className="size-7">
              <AvatarImage src={comment.author.image ?? undefined} />
              <AvatarFallback className="text-[10px]">
                {(comment.author.name ?? comment.author.email)[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">
              {comment.author.name ?? comment.author.email}
            </span>
            {comment.isInternal && (
              <Badge variant="outline" className="text-warning border-warning/30">
                Internal
              </Badge>
            )}
            <span className="ml-auto text-xs text-muted-foreground">
              {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
            </span>
          </div>
          <div className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">
            {comment.body}
          </div>
        </div>
      ))}
    </div>
  );
}
