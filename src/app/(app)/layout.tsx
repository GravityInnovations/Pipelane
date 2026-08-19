import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { getIdentityState } from "@/server/auth/identity";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const state = await getIdentityState();
  if (state.status === "anonymous") redirect("/login");
  if (state.status === "unauthorized") redirect("/unauthorized");
  return (
    <AppShell
      role={state.identity.profile.role}
      fullName={state.identity.profile.full_name}
      email={state.identity.email}
    >
      {children}
    </AppShell>
  );
}
