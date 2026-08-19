import { redirect } from "next/navigation";
import { getIdentityState } from "@/server/auth/identity";

export default async function HomePage() {
  const state = await getIdentityState();
  if (state.status === "authenticated") redirect("/dashboard");
  if (state.status === "unauthorized") redirect("/unauthorized");
  redirect("/login");
}
