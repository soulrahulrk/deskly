import { z } from "zod";
import { emailSchema } from "@/lib/validations/auth";
import { ROLES } from "@/lib/constants/enums";

export const addMemberSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80),
  email: emailSchema,
  role: z.enum(ROLES),
});
export type AddMemberInput = z.infer<typeof addMemberSchema>;

export const changeMemberRoleSchema = z.object({
  role: z.enum(ROLES),
});
export type ChangeMemberRoleInput = z.infer<typeof changeMemberRoleSchema>;
