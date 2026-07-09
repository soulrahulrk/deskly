import type { Role, TicketPriority, TicketStatus } from "./enums";

/**
 * Presentation metadata for domain enums — labels, colors, and short blurbs.
 * `color` is a CSS custom property so it stays theme-aware (light/dark) whether
 * used for a status dot (inline style) or a Recharts `fill`. Text stays on the
 * card foreground for AA contrast; hue is carried by the dot, not the letters.
 */
export interface EnumMeta {
  label: string;
  color: string;
  description?: string;
}

export const STATUS_META: Record<TicketStatus, EnumMeta> = {
  OPEN: { label: "Open", color: "var(--info)", description: "New, not yet worked" },
  IN_PROGRESS: {
    label: "In progress",
    color: "var(--primary)",
    description: "An agent is working on it",
  },
  WAITING: {
    label: "Waiting",
    color: "var(--warning)",
    description: "Blocked on the customer",
  },
  RESOLVED: {
    label: "Resolved",
    color: "var(--success)",
    description: "Fixed, pending confirmation",
  },
  CLOSED: {
    label: "Closed",
    color: "var(--muted-foreground)",
    description: "Done and archived",
  },
};

export const PRIORITY_META: Record<TicketPriority, EnumMeta> = {
  LOW: { label: "Low", color: "var(--muted-foreground)" },
  MEDIUM: { label: "Medium", color: "var(--info)" },
  HIGH: { label: "High", color: "var(--warning)" },
  URGENT: { label: "Urgent", color: "var(--destructive)" },
};

export const ROLE_META: Record<Role, EnumMeta> = {
  OWNER: {
    label: "Owner",
    color: "var(--primary)",
    description: "Full control, including billing and member roles",
  },
  ADMIN: {
    label: "Admin",
    color: "var(--info)",
    description: "Manages members, tags, and settings",
  },
  AGENT: {
    label: "Agent",
    color: "var(--success)",
    description: "Works tickets: create, reply, assign, resolve",
  },
  VIEWER: {
    label: "Viewer",
    color: "var(--muted-foreground)",
    description: "Read-only access to tickets and reports",
  },
};
