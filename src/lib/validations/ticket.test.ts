import { describe, it, expect } from "vitest";
import { createTicketSchema, createCommentSchema } from "./ticket";

describe("createTicketSchema", () => {
  const valid = {
    subject: "Billing question",
    body: "The invoice total looks wrong.",
    contactId: "contact_123",
    priority: "MEDIUM" as const,
  };

  it("accepts a well-formed ticket", () => {
    expect(createTicketSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts a subject at exactly the 3-character minimum (boundary)", () => {
    expect(createTicketSchema.safeParse({ ...valid, subject: "Hi!" }).success).toBe(true);
  });

  it("rejects a subject one character under the minimum", () => {
    expect(createTicketSchema.safeParse({ ...valid, subject: "Hi" }).success).toBe(false);
  });

  it("rejects a subject over the 140-character maximum", () => {
    const result = createTicketSchema.safeParse({ ...valid, subject: "x".repeat(141) });
    expect(result.success).toBe(false);
  });

  it("trims whitespace-only subjects down to nothing and rejects them", () => {
    expect(createTicketSchema.safeParse({ ...valid, subject: "   " }).success).toBe(false);
  });

  it("rejects an invalid priority value not in the enum", () => {
    const result = createTicketSchema.safeParse({ ...valid, priority: "SUPER_URGENT" });
    expect(result.success).toBe(false);
  });

  it("requires a contactId", () => {
    expect(createTicketSchema.safeParse({ ...valid, contactId: "" }).success).toBe(false);
  });

  it("allows assigneeId to be omitted (unassigned on create)", () => {
    const { assigneeId: _assigneeId, ...withoutAssignee } = valid as typeof valid & {
      assigneeId?: string;
    };
    expect(createTicketSchema.safeParse(withoutAssignee).success).toBe(true);
  });
});

describe("createCommentSchema", () => {
  it("defaults isInternal to false when omitted", () => {
    const result = createCommentSchema.safeParse({ ticketId: "t1", body: "Looking into it." });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.isInternal).toBe(false);
  });

  it("rejects an empty comment body", () => {
    expect(createCommentSchema.safeParse({ ticketId: "t1", body: "" }).success).toBe(false);
  });

  it("rejects a comment over the 10,000-character cap", () => {
    const result = createCommentSchema.safeParse({ ticketId: "t1", body: "x".repeat(10_001) });
    expect(result.success).toBe(false);
  });
});
