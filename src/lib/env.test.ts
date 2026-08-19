import { describe, expect, it } from "vitest";
import { parsePublicEnv } from "@/lib/env";

describe("parsePublicEnv", () => {
  it("accepts browser-safe project configuration", () => {
    expect(
      parsePublicEnv({
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "publishable-key",
        NEXT_PUBLIC_APP_URL: "http://localhost:3000",
      }).NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    ).toBe("publishable-key");
  });

  it("rejects an insecure remote Supabase URL", () => {
    expect(() =>
      parsePublicEnv({
        NEXT_PUBLIC_SUPABASE_URL: "http://example.supabase.co",
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "publishable-key",
        NEXT_PUBLIC_APP_URL: "http://localhost:3000",
      }),
    ).toThrow();
  });
});
