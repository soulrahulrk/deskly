import { describe, it, expect } from "vitest";
import { updateProfileSchema, changePasswordSchema } from "./profile";

describe("updateProfileSchema", () => {
  it("accepts a name with no image", () => {
    expect(updateProfileSchema.safeParse({ name: "Jane Doe", image: "" }).success).toBe(true);
  });

  it("accepts a valid image URL", () => {
    const result = updateProfileSchema.safeParse({
      name: "Jane Doe",
      image: "https://example.com/avatar.png",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a malformed image URL", () => {
    const result = updateProfileSchema.safeParse({ name: "Jane Doe", image: "not-a-url" });
    expect(result.success).toBe(false);
  });

  it("rejects a blank name", () => {
    expect(updateProfileSchema.safeParse({ name: "" }).success).toBe(false);
  });
});

describe("changePasswordSchema", () => {
  const base = { currentPassword: "oldpassword", newPassword: "newpassword123" };

  it("accepts matching new/confirm passwords", () => {
    const result = changePasswordSchema.safeParse({
      ...base,
      confirmPassword: "newpassword123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects mismatched confirm password", () => {
    const result = changePasswordSchema.safeParse({
      ...base,
      confirmPassword: "somethingelse",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(["confirmPassword"]);
    }
  });

  it("rejects a new password under the 8-character minimum", () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: "oldpassword",
      newPassword: "short",
      confirmPassword: "short",
    });
    expect(result.success).toBe(false);
  });

  it("requires a non-empty current password", () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: "",
      newPassword: "newpassword123",
      confirmPassword: "newpassword123",
    });
    expect(result.success).toBe(false);
  });
});
