import { describe, it, expect } from "vitest";
import { can, outranks, assignableRoles } from "./permissions";
import { ROLES, type Role } from "@/lib/constants/enums";

describe("can()", () => {
  it("returns false for a null/undefined user", () => {
    expect(can(null, "ticket:create")).toBe(false);
    expect(can(undefined, "ticket:create")).toBe(false);
  });

  it("grants OWNER every ability, including ones not explicitly listed", () => {
    for (const action of [
      "ticket:create",
      "ticket:delete",
      "member:manage",
      "org:edit",
      "audit:view",
    ] as const) {
      expect(can({ role: "OWNER" }, action)).toBe(true);
    }
  });

  it("ADMIN can manage members and view audit, but VIEWER cannot", () => {
    expect(can({ role: "ADMIN" }, "member:manage")).toBe(true);
    expect(can({ role: "ADMIN" }, "audit:view")).toBe(true);
    expect(can({ role: "VIEWER" }, "member:manage")).toBe(false);
    expect(can({ role: "VIEWER" }, "audit:view")).toBe(false);
  });

  it("AGENT can create and update tickets but not delete them", () => {
    expect(can({ role: "AGENT" }, "ticket:create")).toBe(true);
    expect(can({ role: "AGENT" }, "ticket:update")).toBe(true);
    expect(can({ role: "AGENT" }, "ticket:delete")).toBe(false);
  });

  it("VIEWER can only export, per the read-only role design", () => {
    expect(can({ role: "VIEWER" }, "export")).toBe(true);
    expect(can({ role: "VIEWER" }, "ticket:create")).toBe(false);
    expect(can({ role: "VIEWER" }, "comment:create")).toBe(false);
  });
});

describe("outranks()", () => {
  it("is true only when actor is strictly higher-ranked", () => {
    expect(outranks("OWNER", "ADMIN")).toBe(true);
    expect(outranks("ADMIN", "AGENT")).toBe(true);
    expect(outranks("AGENT", "VIEWER")).toBe(true);
  });

  it("is false for equal rank — same-rank peers cannot manage each other via this helper", () => {
    expect(outranks("ADMIN", "ADMIN")).toBe(false);
    expect(outranks("OWNER", "OWNER")).toBe(false);
  });

  it("is false when actor is lower-ranked than target", () => {
    expect(outranks("VIEWER", "OWNER")).toBe(false);
    expect(outranks("AGENT", "ADMIN")).toBe(false);
  });
});

describe("assignableRoles()", () => {
  it("OWNER can assign any role", () => {
    expect(assignableRoles("OWNER").sort()).toEqual([...ROLES].sort());
  });

  it("VIEWER (rank 0) can only assign VIEWER", () => {
    expect(assignableRoles("VIEWER")).toEqual(["VIEWER"]);
  });

  it("never returns a role ranked above the actor", () => {
    const rank: Record<Role, number> = { VIEWER: 0, AGENT: 1, ADMIN: 2, OWNER: 3 };
    for (const actor of ROLES) {
      for (const role of assignableRoles(actor)) {
        expect(rank[role]).toBeLessThanOrEqual(rank[actor]);
      }
    }
  });
});
