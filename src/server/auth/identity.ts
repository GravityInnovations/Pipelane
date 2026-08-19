import "server-only";

import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";

export type Identity = {
  userId: string;
  email: string | null;
  profile: Profile;
};
export type IdentityState =
  | { status: "anonymous" }
  | { status: "unauthorized" }
  | { status: "authenticated"; identity: Identity };

export const getIdentityState = cache(async (): Promise<IdentityState> => {
  const supabase = await createClient();
  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (claimsError || !userId) return { status: "anonymous" };

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  if (error || !profile || !profile.active) return { status: "unauthorized" };

  return {
    status: "authenticated",
    identity: {
      userId,
      email:
        typeof claimsData.claims.email === "string"
          ? claimsData.claims.email
          : null,
      profile,
    },
  };
});

export async function getCurrentIdentity() {
  const state = await getIdentityState();
  return state.status === "authenticated" ? state.identity : null;
}
