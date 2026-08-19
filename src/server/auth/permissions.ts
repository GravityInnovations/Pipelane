import type { AppRole } from "@/types/database";

export type Capability =
  | "manage_users"
  | "manage_strategy"
  | "assign_work"
  | "review_work"
  | "work_assigned_records";

const capabilities: Record<AppRole, ReadonlySet<Capability>> = {
  admin: new Set([
    "manage_users",
    "manage_strategy",
    "assign_work",
    "review_work",
    "work_assigned_records",
  ]),
  sales_manager: new Set([
    "manage_strategy",
    "assign_work",
    "review_work",
    "work_assigned_records",
  ]),
  sales_rep: new Set(["work_assigned_records"]),
};

export function can(role: AppRole, capability: Capability) {
  return capabilities[role].has(capability);
}

export function canReviewSubmission(
  role: AppRole,
  actorId: string,
  authorId: string,
) {
  return can(role, "review_work") && actorId !== authorId;
}
