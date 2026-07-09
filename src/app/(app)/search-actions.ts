"use server";

import { getTenant } from "@/lib/dal/context";
import { globalSearch } from "@/lib/dal/search";

export async function performGlobalSearch(query: string) {
  const { orgId } = await getTenant();
  return globalSearch(orgId, query);
}
