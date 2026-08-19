import type { Metadata } from "next";
import { LogoutButton } from "@/components/layout/logout-button";

export const metadata: Metadata = { title: "Access unavailable" };

export default function UnauthorizedPage() {
  return (
    <section className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-7 text-center shadow-sm">
      <h1 className="text-xl font-semibold text-slate-950">
        Access unavailable
      </h1>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        Your account does not have an active Outreach OS profile. Ask an
        administrator to review your access.
      </p>
      <LogoutButton className="mt-5" />
    </section>
  );
}
