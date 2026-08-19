import { describe, expect, it } from "vitest";
import { can, canReviewSubmission } from "@/server/auth/permissions";

describe("role permissions", () => {
  it("allows only administrators to manage users", () => {
    expect(can("admin", "manage_users")).toBe(true);
    expect(can("sales_manager", "manage_users")).toBe(false);
    expect(can("sales_rep", "manage_users")).toBe(false);
  });

  it("allows managers to review another user's work", () => {
    expect(canReviewSubmission("sales_manager", "manager", "rep")).toBe(true);
  });

  it("prevents self-review and rep approval", () => {
    expect(canReviewSubmission("admin", "same-user", "same-user")).toBe(false);
    expect(canReviewSubmission("sales_rep", "rep", "author")).toBe(false);
  });
});
